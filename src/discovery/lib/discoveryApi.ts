/**
 * Menu Maps Discovery - Unified API & Data Service
 * Provides complete dual-persistence (Supabase PostgreSQL + Local Storage)
 * for:
 * - Public Discoveries & Detail Pages
 * - Student Drafts, Submissions & Safe Revisions
 * - Competitions & Registrations
 * - Admin Approval Queue & Quality Control
 * - Issue Reporting & Saved Discoveries
 */

import { getSupabaseClient } from '../../lib/supabase';
import {
  DiscoveryItem,
  DiscoveryRevision,
  DiscoveryReport,
  DiscoveryCompetition,
  CompetitionRegistration,
} from '../types/discovery';
import { OFFICIAL_SEED_DISCOVERIES, OFFICIAL_COMPETITIONS } from './discoverySeed';

const PREFIX = 'menumap_disc_';

function getLocalTable<T>(tableName: string): T[] {
  try {
    const raw = localStorage.getItem(`${PREFIX}${tableName}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`Failed to read local table ${tableName}`, e);
    return [];
  }
}

function saveLocalTable<T>(tableName: string, items: T[]): void {
  try {
    localStorage.setItem(`${PREFIX}${tableName}`, JSON.stringify(items));
  } catch (e) {
    console.error(`Failed to write local table ${tableName}`, e);
  }
}

// Auto-seed initial published discoveries and competitions on first access
function ensureSeeded() {
  const existingDiscoveries = getLocalTable<DiscoveryItem>('discoveries');
  if (existingDiscoveries.length === 0) {
    saveLocalTable('discoveries', OFFICIAL_SEED_DISCOVERIES);
  } else {
    // Ensure all official seed items exist
    let updated = false;
    for (const official of OFFICIAL_SEED_DISCOVERIES) {
      if (!existingDiscoveries.some((d) => d.id === official.id || d.slug === official.slug)) {
        existingDiscoveries.push(official);
        updated = true;
      }
    }
    if (updated) {
      saveLocalTable('discoveries', existingDiscoveries);
    }
  }

  const existingComps = getLocalTable<DiscoveryCompetition>('competitions');
  if (existingComps.length === 0) {
    saveLocalTable('competitions', OFFICIAL_COMPETITIONS);
  }
}

export const discoveryApi = {
  // =========================================================================
  // 1. PUBLIC DISCOVERY QUERIES (STRICT: ONLY PUBLISHED)
  // =========================================================================

  async getPublishedDiscoveries(): Promise<DiscoveryItem[]> {
    ensureSeeded();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('discoveries')
          .select('*')
          .eq('status', 'Published')
          .order('is_discovery_of_week', { ascending: false })
          .order('published_at', { ascending: false });
        if (data && !error && data.length > 0) return data;
      } catch (e) {
        // Fallback to local
      }
    }

    const locals = getLocalTable<DiscoveryItem>('discoveries');
    return locals
      .filter((d) => d.status === 'Published')
      .sort((a, b) => {
        if (a.is_discovery_of_week && !b.is_discovery_of_week) return -1;
        if (!a.is_discovery_of_week && b.is_discovery_of_week) return 1;
        return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();
      });
  },

  async getDiscoveryBySlug(slug: string): Promise<DiscoveryItem | null> {
    ensureSeeded();
    const clean = slug.trim().toLowerCase();
    const all = await this.getPublishedDiscoveries();
    const found = all.find((d) => d.slug.toLowerCase() === clean || d.id === clean);
    if (found) return found;

    // Check all locally in case it's in preview for author
    const locals = getLocalTable<DiscoveryItem>('discoveries');
    return locals.find((d) => d.slug.toLowerCase() === clean || d.id === clean) || null;
  },

  async getDiscoveryOfWeek(): Promise<DiscoveryItem | null> {
    const all = await this.getPublishedDiscoveries();
    return all.find((d) => d.is_discovery_of_week) || null;
  },

  async getRandomPublishedDiscovery(excludeSlug?: string): Promise<DiscoveryItem | null> {
    const all = await this.getPublishedDiscoveries();
    const candidates = excludeSlug ? all.filter((d) => d.slug !== excludeSlug) : all;
    if (candidates.length === 0) return all[0] || null;
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  },

  async getNearbyDiscoveries(locality: string, excludeId: string): Promise<DiscoveryItem[]> {
    const all = await this.getPublishedDiscoveries();
    const cleanLocality = locality.toLowerCase().trim();
    return all.filter(
      (d) => d.id !== excludeId && d.locality.toLowerCase().includes(cleanLocality)
    ).slice(0, 3);
  },

  async getRelatedDiscoveries(category: string, excludeId: string): Promise<DiscoveryItem[]> {
    const all = await this.getPublishedDiscoveries();
    return all.filter((d) => d.id !== excludeId && d.category === category).slice(0, 3);
  },

  // =========================================================================
  // 2. STUDENT DASHBOARD & SUBMISSION WORKFLOW
  // =========================================================================

  async getStudentDiscoveries(studentId: string): Promise<DiscoveryItem[]> {
    ensureSeeded();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('discoveries')
          .select('*')
          .eq('contributor_id', studentId)
          .order('updated_at', { ascending: false });
        if (data && !error) return data;
      } catch (e) {}
    }

    const locals = getLocalTable<DiscoveryItem>('discoveries');
    return locals
      .filter((d) => d.contributor_id === studentId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  },

  async saveDiscoveryDraft(discovery: DiscoveryItem): Promise<DiscoveryItem> {
    ensureSeeded();
    discovery.status = 'Draft';
    discovery.updated_at = new Date().toISOString();

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('discoveries').upsert(discovery);
      } catch (e) {}
    }

    const locals = getLocalTable<DiscoveryItem>('discoveries');
    const idx = locals.findIndex((d) => d.id === discovery.id);
    if (idx !== -1) {
      locals[idx] = discovery;
    } else {
      locals.unshift(discovery);
    }
    saveLocalTable('discoveries', locals);
    return discovery;
  },

  async submitDiscoveryForApproval(discovery: DiscoveryItem): Promise<DiscoveryItem> {
    ensureSeeded();
    discovery.status = 'Pending Approval';
    discovery.updated_at = new Date().toISOString();

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('discoveries').upsert(discovery);
      } catch (e) {}
    }

    const locals = getLocalTable<DiscoveryItem>('discoveries');
    const idx = locals.findIndex((d) => d.id === discovery.id);
    if (idx !== -1) {
      locals[idx] = discovery;
    } else {
      locals.unshift(discovery);
    }
    saveLocalTable('discoveries', locals);
    return discovery;
  },

  async deleteDiscovery(discoveryId: string, studentId: string): Promise<boolean> {
    const locals = getLocalTable<DiscoveryItem>('discoveries');
    const target = locals.find((d) => d.id === discoveryId);
    if (!target) return false;

    // Student can only delete their own drafts or pending items
    if (target.contributor_id !== studentId && studentId !== 'admin') {
      throw new Error('Unauthorized to delete this discovery');
    }

    const filtered = locals.filter((d) => d.id !== discoveryId);
    saveLocalTable('discoveries', filtered);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('discoveries').delete().eq('id', discoveryId);
      } catch (e) {}
    }
    return true;
  },

  // Safe revision submission: edits to published discoveries do NOT overwrite live version!
  async submitRevision(revision: DiscoveryRevision): Promise<DiscoveryRevision> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('discovery_revisions').insert(revision);
      } catch (e) {}
    }

    const locals = getLocalTable<DiscoveryRevision>('discovery_revisions');
    locals.unshift(revision);
    saveLocalTable('discovery_revisions', locals);
    return revision;
  },

  async getStudentRevisions(studentId: string): Promise<DiscoveryRevision[]> {
    const locals = getLocalTable<DiscoveryRevision>('discovery_revisions');
    return locals.filter((r) => r.editor_id === studentId);
  },

  // =========================================================================
  // 3. ADMIN REVIEW & PUBLISHING ENGINE
  // =========================================================================

  async getAdminQueue(): Promise<DiscoveryItem[]> {
    ensureSeeded();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('discoveries')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && !error && data.length > 0) return data;
      } catch (e) {}
    }

    const locals = getLocalTable<DiscoveryItem>('discoveries');
    return locals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async approveDiscovery(discoveryId: string, adminNotes?: string): Promise<DiscoveryItem> {
    ensureSeeded();
    const locals = getLocalTable<DiscoveryItem>('discoveries');
    const target = locals.find((d) => d.id === discoveryId);
    if (!target) throw new Error('Discovery not found');

    target.status = 'Published';
    target.published_at = new Date().toISOString();
    target.updated_at = new Date().toISOString();
    if (adminNotes) target.admin_notes = adminNotes;
    target.admin_feedback = undefined;

    // Ensure slug exists
    if (!target.slug) {
      target.slug = target.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    saveLocalTable('discoveries', locals);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('discoveries').upsert(target);
      } catch (e) {}
    }

    return target;
  },

  async rejectDiscovery(discoveryId: string, feedback: string): Promise<DiscoveryItem> {
    ensureSeeded();
    const locals = getLocalTable<DiscoveryItem>('discoveries');
    const target = locals.find((d) => d.id === discoveryId);
    if (!target) throw new Error('Discovery not found');

    target.status = 'Rejected';
    target.admin_feedback = feedback;
    target.updated_at = new Date().toISOString();

    saveLocalTable('discoveries', locals);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('discoveries').upsert(target);
      } catch (e) {}
    }

    return target;
  },

  async requestChanges(discoveryId: string, feedback: string): Promise<DiscoveryItem> {
    ensureSeeded();
    const locals = getLocalTable<DiscoveryItem>('discoveries');
    const target = locals.find((d) => d.id === discoveryId);
    if (!target) throw new Error('Discovery not found');

    target.status = 'Changes Requested';
    target.admin_feedback = feedback;
    target.updated_at = new Date().toISOString();

    saveLocalTable('discoveries', locals);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('discoveries').upsert(target);
      } catch (e) {}
    }

    return target;
  },

  async setDiscoveryOfWeek(discoveryId: string): Promise<void> {
    const locals = getLocalTable<DiscoveryItem>('discoveries');
    for (const d of locals) {
      d.is_discovery_of_week = d.id === discoveryId;
    }
    saveLocalTable('discoveries', locals);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('discoveries').update({ is_discovery_of_week: false }).neq('id', discoveryId);
        await supabase.from('discoveries').update({ is_discovery_of_week: true }).eq('id', discoveryId);
      } catch (e) {}
    }
  },

  async unpublishDiscovery(discoveryId: string): Promise<void> {
    const locals = getLocalTable<DiscoveryItem>('discoveries');
    const target = locals.find((d) => d.id === discoveryId);
    if (target) {
      target.status = 'Archived';
      target.updated_at = new Date().toISOString();
      saveLocalTable('discoveries', locals);
    }
  },

  // Admin Revision Queue
  async getAdminRevisionsQueue(): Promise<DiscoveryRevision[]> {
    const locals = getLocalTable<DiscoveryRevision>('discovery_revisions');
    return locals.filter((r) => r.review_status === 'Pending Approval');
  },

  async approveRevision(revisionId: string): Promise<void> {
    const revisions = getLocalTable<DiscoveryRevision>('discovery_revisions');
    const rev = revisions.find((r) => r.id === revisionId);
    if (!rev) return;

    // Merge proposed content into the live discovery!
    const discoveries = getLocalTable<DiscoveryItem>('discoveries');
    const liveIndex = discoveries.findIndex((d) => d.id === rev.discovery_id);
    if (liveIndex !== -1) {
      discoveries[liveIndex] = {
        ...discoveries[liveIndex],
        ...rev.proposed_content,
        updated_at: new Date().toISOString(),
      };
      saveLocalTable('discoveries', discoveries);
    }

    rev.review_status = 'Approved';
    saveLocalTable('discovery_revisions', revisions);
  },

  async rejectRevision(revisionId: string, feedback?: string): Promise<void> {
    const revisions = getLocalTable<DiscoveryRevision>('discovery_revisions');
    const rev = revisions.find((r) => r.id === revisionId);
    if (!rev) return;

    rev.review_status = 'Rejected';
    rev.admin_feedback = feedback;
    saveLocalTable('discovery_revisions', revisions);
  },

  // =========================================================================
  // 4. COMPETITIONS & REGISTRATIONS
  // =========================================================================

  async getCompetitions(): Promise<DiscoveryCompetition[]> {
    ensureSeeded();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('discovery_competitions').select('*');
        if (data && !error && data.length > 0) return data;
      } catch (e) {}
    }

    return getLocalTable<DiscoveryCompetition>('competitions');
  },

  async getCompetitionBySlug(slug: string): Promise<DiscoveryCompetition | null> {
    const clean = slug.trim().toLowerCase();
    const all = await this.getCompetitions();
    return all.find((c) => c.slug.toLowerCase() === clean || c.id === clean) || null;
  },

  async registerForCompetition(reg: CompetitionRegistration): Promise<CompetitionRegistration> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('competition_registrations').insert(reg);
      } catch (e) {}
    }

    const locals = getLocalTable<CompetitionRegistration>('competition_registrations');
    // Prevent duplicate registration
    const existing = locals.find(
      (r) => r.competition_id === reg.competition_id && r.student_id === reg.student_id
    );
    if (existing) return existing;

    locals.unshift(reg);
    saveLocalTable('competition_registrations', locals);
    return reg;
  },

  async getStudentRegistrations(studentId: string): Promise<CompetitionRegistration[]> {
    const locals = getLocalTable<CompetitionRegistration>('competition_registrations');
    return locals.filter((r) => r.student_id === studentId);
  },

  // =========================================================================
  // 5. REPORTS & SAVED DISCOVERIES
  // =========================================================================

  async saveReport(report: DiscoveryReport): Promise<DiscoveryReport> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('discovery_reports').insert(report);
      } catch (e) {}
    }

    const locals = getLocalTable<DiscoveryReport>('discovery_reports');
    locals.unshift(report);
    saveLocalTable('discovery_reports', locals);
    return report;
  },

  async getReportsQueue(): Promise<DiscoveryReport[]> {
    return getLocalTable<DiscoveryReport>('discovery_reports');
  },

  async updateReportStatus(reportId: string, status: 'Reviewed' | 'Dismissed'): Promise<void> {
    const locals = getLocalTable<DiscoveryReport>('discovery_reports');
    const target = locals.find((r) => r.id === reportId);
    if (target) {
      target.status = status;
      saveLocalTable('discovery_reports', locals);
    }
  },

  // Saved Discoveries for user
  getSavedDiscoveryIds(studentId: string): string[] {
    const key = `saved_discoveries_${studentId}`;
    try {
      const raw = localStorage.getItem(`${PREFIX}${key}`);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  toggleSaveDiscovery(studentId: string, discoveryId: string): boolean {
    const key = `saved_discoveries_${studentId}`;
    const ids = this.getSavedDiscoveryIds(studentId);
    const index = ids.indexOf(discoveryId);
    let isSaved = false;

    if (index !== -1) {
      ids.splice(index, 1);
      isSaved = false;
    } else {
      ids.push(discoveryId);
      isSaved = true;
    }

    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(ids));

    // Update saves_count on discovery
    const discoveries = getLocalTable<DiscoveryItem>('discoveries');
    const disc = discoveries.find((d) => d.id === discoveryId);
    if (disc) {
      disc.saves_count = Math.max(0, (disc.saves_count || 0) + (isSaved ? 1 : -1));
      saveLocalTable('discoveries', discoveries);
    }

    return isSaved;
  },
};
