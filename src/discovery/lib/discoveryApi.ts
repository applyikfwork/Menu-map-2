/**
 * Menu Maps Discovery - Unified Database & Storage API
 * Provides full CRUD operations for Competitions, Registrations, Teams,
 * Submissions, Food Discoveries, Food Trails, Projects, Credits, Certificates, and Notifications.
 * Features dual-persistence: Remote Supabase PostgreSQL + Local Storage synchronization.
 */

import { getSupabaseClient } from '../../lib/supabase';
import {
  DiscoveryCompetition,
  CompetitionRegistration,
  CompetitionTeam,
  CompetitionTeamMember,
  CompetitionSubmission,
  FoodDiscoveryItem,
  StudentFoodTrail,
  StudentProject,
  ContributionCredit,
  HallOfFameEntry,
  DiscoveryCertificate,
  DiscoveryAnnouncement,
  DiscoveryNotification,
  StudentProfile,
} from '../types/discovery';

const PREFIX = 'menumap_tbl_';

function getLocalTable<T>(table: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${PREFIX}${table}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalTable<T>(table: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${PREFIX}${table}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save local table ${table}`, e);
  }
}

export const discoveryApi = {
  // ==========================================================================
  // 1. COMPETITIONS
  // ==========================================================================
  async getCompetitions(onlyPublished = true): Promise<DiscoveryCompetition[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('discovery_competitions').select('*').order('created_at', { ascending: false });
        if (onlyPublished) {
          query = query.neq('status', 'Draft');
        }
        const { data, error } = await query;
        if (data && !error && data.length > 0) {
          saveLocalTable('discovery_competitions', data);
          return data;
        }
      } catch (e) {
        console.warn('Supabase getCompetitions fallback to local:', e);
      }
    }

    const locals = getLocalTable<DiscoveryCompetition>('discovery_competitions');
    if (onlyPublished) {
      return locals.filter((c) => c.status !== 'Draft');
    }
    return locals;
  },

  async getCompetitionBySlug(slug: string): Promise<DiscoveryCompetition | null> {
    const clean = slug.trim().toLowerCase();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('discovery_competitions')
          .select('*')
          .eq('slug', clean)
          .maybeSingle();
        if (data && !error) return data;
      } catch (e) {}
    }

    const locals = getLocalTable<DiscoveryCompetition>('discovery_competitions');
    return locals.find((c) => c.slug.toLowerCase() === clean) || null;
  },

  async saveCompetition(competition: DiscoveryCompetition): Promise<DiscoveryCompetition> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('discovery_competitions').upsert(competition);
      } catch (e) {
        console.warn('Supabase saveCompetition notice:', e);
      }
    }

    const locals = getLocalTable<DiscoveryCompetition>('discovery_competitions');
    const idx = locals.findIndex((c) => c.id === competition.id);
    if (idx !== -1) {
      locals[idx] = competition;
    } else {
      locals.unshift(competition);
    }
    saveLocalTable('discovery_competitions', locals);
    return competition;
  },

  // ==========================================================================
  // 2. REGISTRATIONS & TEAMS
  // ==========================================================================
  async registerForCompetition(params: {
    competitionId: string;
    studentId: string;
    isTeam: boolean;
    teamName?: string;
  }): Promise<{ success: boolean; registration?: CompetitionRegistration; team?: CompetitionTeam; error?: string }> {
    const locals = getLocalTable<CompetitionRegistration>('competition_registrations');
    const already = locals.find(
      (r) => r.competition_id === params.competitionId && r.student_id === params.studentId && r.status !== 'Withdrawn'
    );
    if (already) {
      return { success: false, error: 'You are already registered for this challenge.' };
    }

    let team: CompetitionTeam | undefined;
    let teamId: string | undefined;

    if (params.isTeam && params.teamName?.trim()) {
      team = {
        id: 'team_' + crypto.randomUUID(),
        competition_id: params.competitionId,
        team_name: params.teamName.trim(),
        team_code: 'MM-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        leader_student_id: params.studentId,
        created_at: new Date().toISOString(),
      };
      teamId = team.id;

      const teams = getLocalTable<CompetitionTeam>('competition_teams');
      teams.push(team);
      saveLocalTable('competition_teams', teams);

      // Add leader as first member
      const members = getLocalTable<CompetitionTeamMember>('competition_team_members');
      members.push({
        id: 'tm_' + crypto.randomUUID(),
        team_id: team.id,
        student_id: params.studentId,
        student_name: 'Team Leader',
        student_email: '',
        college_name: '',
        role: 'Leader',
        status: 'Accepted',
        joined_at: new Date().toISOString(),
      });
      saveLocalTable('competition_team_members', members);

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('competition_teams').insert(team);
        } catch (e) {}
      }
    }

    const reg: CompetitionRegistration = {
      id: 'reg_' + crypto.randomUUID(),
      competition_id: params.competitionId,
      student_id: params.studentId,
      is_team: params.isTeam,
      team_id: teamId,
      status: 'Registered',
      registered_at: new Date().toISOString(),
    };

    locals.push(reg);
    saveLocalTable('competition_registrations', locals);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('competition_registrations').insert(reg);
      } catch (e) {}
    }

    return { success: true, registration: reg, team };
  },

  async getStudentRegistrations(studentId: string): Promise<CompetitionRegistration[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('competition_registrations')
          .select('*')
          .eq('student_id', studentId);
        if (data && !error) return data;
      } catch (e) {}
    }

    return getLocalTable<CompetitionRegistration>('competition_registrations').filter(
      (r) => r.student_id === studentId
    );
  },

  async getTeamByCode(teamCode: string): Promise<CompetitionTeam | null> {
    const clean = teamCode.trim().toUpperCase();
    const teams = getLocalTable<CompetitionTeam>('competition_teams');
    return teams.find((t) => t.team_code === clean) || null;
  },

  // ==========================================================================
  // 3. SUBMISSIONS
  // ==========================================================================
  async submitProject(submission: CompetitionSubmission): Promise<CompetitionSubmission> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('competition_submissions').upsert(submission);
      } catch (e) {}
    }

    const locals = getLocalTable<CompetitionSubmission>('competition_submissions');
    const idx = locals.findIndex((s) => s.id === submission.id);
    if (idx !== -1) {
      locals[idx] = submission;
    } else {
      locals.unshift(submission);
    }
    saveLocalTable('competition_submissions', locals);
    return submission;
  },

  async getStudentSubmissions(studentId: string): Promise<CompetitionSubmission[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('competition_submissions')
          .select('*')
          .eq('student_id', studentId)
          .order('submitted_at', { ascending: false });
        if (data && !error) return data;
      } catch (e) {}
    }

    return getLocalTable<CompetitionSubmission>('competition_submissions')
      .filter((s) => s.student_id === studentId)
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  },

  async getAllSubmissions(): Promise<CompetitionSubmission[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('competition_submissions')
          .select('*')
          .order('submitted_at', { ascending: false });
        if (data && !error && data.length > 0) return data;
      } catch (e) {}
    }

    return getLocalTable<CompetitionSubmission>('competition_submissions');
  },

  // ==========================================================================
  // 4. FOOD DISCOVERIES (VERIFICATION ENGINE)
  // ==========================================================================
  async submitFoodDiscovery(item: FoodDiscoveryItem): Promise<FoodDiscoveryItem> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('food_discoveries').upsert(item);
      } catch (e) {}
    }

    const locals = getLocalTable<FoodDiscoveryItem>('food_discoveries');
    const idx = locals.findIndex((d) => d.id === item.id);
    if (idx !== -1) {
      locals[idx] = item;
    } else {
      locals.unshift(item);
    }
    saveLocalTable('food_discoveries', locals);
    return item;
  },

  async getApprovedFoodDiscoveries(): Promise<FoodDiscoveryItem[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('food_discoveries')
          .select('*')
          .eq('verification_status', 'Verified by Menu Maps')
          .order('created_at', { ascending: false });
        if (data && !error && data.length > 0) return data;
      } catch (e) {}
    }

    return getLocalTable<FoodDiscoveryItem>('food_discoveries').filter(
      (d) => d.verification_status === 'Verified by Menu Maps'
    );
  },

  async getAllFoodDiscoveries(): Promise<FoodDiscoveryItem[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('food_discoveries')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && !error && data.length > 0) return data;
      } catch (e) {}
    }

    return getLocalTable<FoodDiscoveryItem>('food_discoveries');
  },

  async getStudentFoodDiscoveries(studentId: string): Promise<FoodDiscoveryItem[]> {
    const all = await this.getAllFoodDiscoveries();
    return all.filter((d) => d.student_id === studentId);
  },

  // ==========================================================================
  // 5. STUDENT FOOD TRAILS
  // ==========================================================================
  async getFoodTrails(approvedOnly = true): Promise<StudentFoodTrail[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('student_food_trails').select('*').order('created_at', { ascending: false });
        if (approvedOnly) {
          query = query.in('status', ['Approved', 'Featured']);
        }
        const { data, error } = await query;
        if (data && !error && data.length > 0) return data;
      } catch (e) {}
    }

    const locals = getLocalTable<StudentFoodTrail>('student_food_trails');
    if (approvedOnly) {
      return locals.filter((t) => t.status === 'Approved' || t.status === 'Featured');
    }
    return locals;
  },

  async saveFoodTrail(trail: StudentFoodTrail): Promise<StudentFoodTrail> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('student_food_trails').upsert(trail);
      } catch (e) {}
    }

    const locals = getLocalTable<StudentFoodTrail>('student_food_trails');
    const idx = locals.findIndex((t) => t.id === trail.id);
    if (idx !== -1) locals[idx] = trail;
    else locals.unshift(trail);
    saveLocalTable('student_food_trails', locals);
    return trail;
  },

  // ==========================================================================
  // 6. STUDENT CREATIONS (PUBLIC GALLERY)
  // ==========================================================================
  async getStudentProjects(): Promise<StudentProject[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('student_projects')
          .select('*')
          .order('published_date', { ascending: false });
        if (data && !error && data.length > 0) return data;
      } catch (e) {}
    }

    return getLocalTable<StudentProject>('student_projects');
  },

  async getStudentProjectBySlug(slug: string): Promise<StudentProject | null> {
    const clean = slug.trim().toLowerCase();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('student_projects')
          .select('*')
          .eq('slug', clean)
          .maybeSingle();
        if (data && !error) return data;
      } catch (e) {}
    }

    const locals = getLocalTable<StudentProject>('student_projects');
    return locals.find((p) => p.slug.toLowerCase() === clean) || null;
  },

  async saveStudentProject(project: StudentProject): Promise<StudentProject> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('student_projects').upsert(project);
      } catch (e) {}
    }

    const locals = getLocalTable<StudentProject>('student_projects');
    const idx = locals.findIndex((p) => p.id === project.id);
    if (idx !== -1) locals[idx] = project;
    else locals.unshift(project);
    saveLocalTable('student_projects', locals);
    return project;
  },

  // ==========================================================================
  // 7. CONTRIBUTION CREDITS
  // ==========================================================================
  async awardCredit(credit: ContributionCredit): Promise<ContributionCredit> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('contribution_credits').insert(credit);
      } catch (e) {}
    }

    const locals = getLocalTable<ContributionCredit>('contribution_credits');
    locals.unshift(credit);
    saveLocalTable('contribution_credits', locals);
    return credit;
  },

  async getStudentCredits(studentId: string): Promise<ContributionCredit[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('contribution_credits')
          .select('*')
          .eq('student_id', studentId)
          .order('awarded_at', { ascending: false });
        if (data && !error) return data;
      } catch (e) {}
    }

    return getLocalTable<ContributionCredit>('contribution_credits')
      .filter((c) => c.student_id === studentId)
      .sort((a, b) => new Date(b.awarded_at).getTime() - new Date(a.awarded_at).getTime());
  },

  // ==========================================================================
  // 8. HALL OF FAME
  // ==========================================================================
  async getHallOfFameEntries(): Promise<HallOfFameEntry[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('discovery_hall_of_fame')
          .select('*')
          .order('awarded_at', { ascending: false });
        if (data && !error && data.length > 0) return data;
      } catch (e) {}
    }

    return getLocalTable<HallOfFameEntry>('discovery_hall_of_fame');
  },

  async saveHallOfFameEntry(entry: HallOfFameEntry): Promise<HallOfFameEntry> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('discovery_hall_of_fame').upsert(entry);
      } catch (e) {}
    }

    const locals = getLocalTable<HallOfFameEntry>('discovery_hall_of_fame');
    const idx = locals.findIndex((e) => e.id === entry.id);
    if (idx !== -1) locals[idx] = entry;
    else locals.unshift(entry);
    saveLocalTable('discovery_hall_of_fame', locals);
    return entry;
  },

  // ==========================================================================
  // 9. CERTIFICATES
  // ==========================================================================
  async issueCertificate(cert: DiscoveryCertificate): Promise<DiscoveryCertificate> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('discovery_certificates').upsert(cert);
      } catch (e) {}
    }

    const locals = getLocalTable<DiscoveryCertificate>('discovery_certificates');
    locals.unshift(cert);
    saveLocalTable('discovery_certificates', locals);
    return cert;
  },

  async getCertificateByNumber(certificateNumber: string): Promise<DiscoveryCertificate | null> {
    const clean = certificateNumber.trim().toUpperCase();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('discovery_certificates')
          .select('*')
          .eq('certificate_number', clean)
          .maybeSingle();
        if (data && !error) return data;
      } catch (e) {}
    }

    const locals = getLocalTable<DiscoveryCertificate>('discovery_certificates');
    return locals.find((c) => c.certificate_number.toUpperCase() === clean) || null;
  },

  async getStudentCertificates(studentId: string): Promise<DiscoveryCertificate[]> {
    const locals = getLocalTable<DiscoveryCertificate>('discovery_certificates');
    return locals.filter((c) => c.student_id === studentId);
  },

  // ==========================================================================
  // 10. ANNOUNCEMENTS & OPPORTUNITIES
  // ==========================================================================
  async getAnnouncements(): Promise<DiscoveryAnnouncement[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('discovery_announcements')
          .select('*')
          .order('published_at', { ascending: false });
        if (data && !error && data.length > 0) return data;
      } catch (e) {}
    }

    return getLocalTable<DiscoveryAnnouncement>('discovery_announcements');
  },

  async saveAnnouncement(ann: DiscoveryAnnouncement): Promise<DiscoveryAnnouncement> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('discovery_announcements').upsert(ann);
      } catch (e) {}
    }

    const locals = getLocalTable<DiscoveryAnnouncement>('discovery_announcements');
    const idx = locals.findIndex((a) => a.id === ann.id);
    if (idx !== -1) locals[idx] = ann;
    else locals.unshift(ann);
    saveLocalTable('discovery_announcements', locals);
    return ann;
  },

  // ==========================================================================
  // 11. IN-APP NOTIFICATIONS
  // ==========================================================================
  async getStudentNotifications(studentId: string): Promise<DiscoveryNotification[]> {
    const locals = getLocalTable<DiscoveryNotification>('discovery_notifications');
    return locals.filter((n) => n.student_id === studentId);
  },

  async sendNotification(notif: DiscoveryNotification): Promise<void> {
    const locals = getLocalTable<DiscoveryNotification>('discovery_notifications');
    locals.unshift(notif);
    saveLocalTable('discovery_notifications', locals);
  },

  async markNotificationAsRead(notifId: string): Promise<void> {
    const locals = getLocalTable<DiscoveryNotification>('discovery_notifications');
    const target = locals.find((n) => n.id === notifId);
    if (target) {
      target.is_read = true;
      saveLocalTable('discovery_notifications', locals);
    }
  },

  // ==========================================================================
  // 12. PUBLIC CONTRIBUTORS DIRECTORY
  // ==========================================================================
  async getPublicContributors(): Promise<StudentProfile[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('discovery_profiles')
          .select('*')
          .eq('is_public_profile', true)
          .eq('is_suspended', false);
        if (data && !error && data.length > 0) return data;
      } catch (e) {}
    }

    const locals = getLocalTable<StudentProfile>('discovery_profiles');
    return locals.filter((p) => p.is_public_profile && !p.is_suspended);
  },

  async getContributorBySlug(slug: string): Promise<StudentProfile | null> {
    const clean = slug.trim().toLowerCase();
    const all = await this.getPublicContributors();
    return all.find((p) => p.portfolio_slug?.toLowerCase() === clean) || null;
  },
};
