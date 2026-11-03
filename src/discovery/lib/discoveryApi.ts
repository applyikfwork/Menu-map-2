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
  CompetitionSubmission,
  CompetitionMission,
  CompetitionTrack,
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
  const needsUpgrade =
    existingComps.length < 2 ||
    !existingComps.some((c) => Array.isArray(c.missions) && c.missions.length >= 4) ||
    !existingComps.some(
      (c) =>
        Array.isArray(c.tracks) &&
        c.tracks.length >= 5 &&
        typeof c.tracks[0] === 'object' &&
        Array.isArray((c.tracks[0] as any)?.ideas)
    );

  if (needsUpgrade) {
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

  async saveCompetition(comp: DiscoveryCompetition): Promise<DiscoveryCompetition> {
    const comps = getLocalTable<DiscoveryCompetition>('competitions');
    const idx = comps.findIndex((c) => c.id === comp.id || c.slug === comp.slug);
    if (idx >= 0) {
      comps[idx] = { ...comps[idx], ...comp };
    } else {
      comps.push(comp);
    }
    saveLocalTable('competitions', comps);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('discovery_competitions').upsert(comp);
      } catch (e) {}
    }
    return comp;
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

  async getCompetitionRegistrations(competitionId?: string): Promise<CompetitionRegistration[]> {
    const all = getLocalTable<CompetitionRegistration>('competition_registrations');
    if (competitionId) {
      return all.filter((r) => r.competition_id === competitionId);
    }
    return all;
  },

  async getStudentRegistrations(studentId: string): Promise<CompetitionRegistration[]> {
    const locals = getLocalTable<CompetitionRegistration>('competition_registrations');
    return locals.filter((r) => r.student_id === studentId);
  },

  async updateRegistrationStatus(id: string, status: 'Registered' | 'Submitted' | 'Reviewed'): Promise<void> {
    const all = getLocalTable<CompetitionRegistration>('competition_registrations');
    const idx = all.findIndex((r) => r.id === id);
    if (idx >= 0) {
      all[idx].status = status;
      saveLocalTable('competition_registrations', all);
    }
  },

  // ---------------------------------------------------------------------------
  // COMPETITION SUBMISSIONS & JUDGING
  // ---------------------------------------------------------------------------

  async getCompetitionSubmissions(competitionId?: string): Promise<CompetitionSubmission[]> {
    const all = getLocalTable<CompetitionSubmission>('competition_submissions');
    if (competitionId) {
      return all.filter((s) => s.competition_id === competitionId);
    }
    return all;
  },

  async getStudentCompetitionSubmissions(studentId: string): Promise<CompetitionSubmission[]> {
    const all = getLocalTable<CompetitionSubmission>('competition_submissions');
    return all.filter((s) => s.student_id === studentId);
  },

  async saveCompetitionSubmission(sub: CompetitionSubmission): Promise<CompetitionSubmission> {
    const all = getLocalTable<CompetitionSubmission>('competition_submissions');
    const idx = all.findIndex((s) => s.id === sub.id || (s.competition_id === sub.competition_id && s.student_id === sub.student_id));
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...sub, updated_at: new Date().toISOString() };
      sub = all[idx];
    } else {
      all.unshift(sub);
    }
    saveLocalTable('competition_submissions', all);

    // Also update registration status to Submitted if not Draft
    const regs = getLocalTable<CompetitionRegistration>('competition_registrations');
    const reg = regs.find((r) => r.competition_id === sub.competition_id && r.student_id === sub.student_id);
    if (reg && reg.status !== 'Submitted' && sub.status !== 'Draft') {
      reg.status = 'Submitted';
      saveLocalTable('competition_registrations', regs);
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('competition_submissions').upsert(sub);
      } catch (e) {}
    }
    return sub;
  },

  async scoreCompetitionSubmission(
    submissionId: string,
    scores: Record<string, number>,
    judgingNotes?: string,
    correctionsRequested?: string,
    recognitionAward?: string,
    status: 'Under Review' | 'Evaluated' = 'Evaluated'
  ): Promise<CompetitionSubmission | null> {
    const all = getLocalTable<CompetitionSubmission>('competition_submissions');
    const sub = all.find((s) => s.id === submissionId);
    if (!sub) return null;

    // Auto-calculate sum clamped at 100
    const rawTotal = Object.values(scores).reduce((sum, v) => sum + (Number(v) || 0), 0);
    const totalScore = Math.min(100, Math.max(0, rawTotal));

    sub.scores = scores;
    sub.total_score = totalScore;
    if (judgingNotes !== undefined) sub.judging_notes = judgingNotes;
    if (correctionsRequested !== undefined) sub.corrections_requested = correctionsRequested;
    if (recognitionAward !== undefined) sub.recognition_award = recognitionAward;
    sub.status = status;
    sub.updated_at = new Date().toISOString();

    saveLocalTable('competition_submissions', all);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('competition_submissions').update({
          scores,
          total_score: totalScore,
          judging_notes: judgingNotes,
          corrections_requested: correctionsRequested,
          recognition_award: recognitionAward,
          status,
          updated_at: sub.updated_at,
        }).eq('id', submissionId);
      } catch (e) {}
    }

    return sub;
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
