/**
 * Menu Maps Discovery - Unified Database & Storage API
 * Provides full CRUD operations for Competitions, Registrations, Teams,
 * Submissions, Food Discoveries, Food Trails, Projects, Credits, Certificates, and Notifications.
 * Features dual-persistence: Remote Supabase PostgreSQL + Local Storage synchronization.
 */

import { getSupabaseClient, getMasterSeedData } from '../../lib/supabase';
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
  MarketFoodGuide,
  FoodStoryItem,
  BudgetFoodDish,
} from '../types/discovery';
import {
  OFFICIAL_APPROVED_DISCOVERIES,
  OFFICIAL_MARKET_GUIDES,
  OFFICIAL_FOOD_TRAILS,
  OFFICIAL_FOOD_STORIES,
} from './discoveryContentSeed';

const PREFIX = 'menumap_tbl_';

export const OFFICIAL_DISCOVERY_LEAGUE_SEASON_01: DiscoveryCompetition[] = [
  {
    id: 'comp_gmm_season01',
    series_name: 'Menu Maps Discovery League',
    season: 'Season 01',
    title: 'THE GREAT MARKET MISSION',
    slug: 'great-market-mission',
    tagline: 'One Market. Hidden Food Stories. Can Your Team Discover Them All?',
    short_description:
      'Explore a real Delhi neighbourhood market, investigate honest food counter prices, discover authentic hidden gems, and build a high-utility food discovery map.',
    description:
      'Every market has hidden food stories. Beyond the popular shops and famous food places, there are interesting dishes, budget-friendly meals and local discoveries waiting to be found.\n\nThe Great Market Mission challenges student teams to explore a real neighbourhood market, investigate its food scene, document interesting discoveries and create a useful food discovery map for someone visiting that market for the first time.',
    cover_image_url:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    category: 'Offline Exploration',
    format: 'Offline',
    is_team_competition: true,
    min_team_size: 2,
    max_team_size: 3,
    eligibility:
      'Open to all enrolled university students in Delhi NCR. Teams must consist of 2 to 3 students.',
    allowed_locations: [
      'Kamla Nagar',
      'Chandni Chowk',
      'Lajpat Nagar Central Market',
      'Karol Bagh',
      'Hauz Khas Village',
      'Netaji Subhash Place (NSP)',
      'Connaught Place Inner/Outer Circle',
      'Rajouri Garden Market',
      'Custom Accessible Market (Subject to Admin Approval)',
    ],
    registration_start_date: '2026-05-01',
    registration_end_date: '2026-06-15',
    competition_start_date: '2026-06-16',
    competition_end_date: '2026-06-26',
    submission_deadline: '2026-06-26',
    rules: [
      'Teams must explore public and accessible market locations during daytime.',
      'No compulsory food purchase is required to participate.',
      'Documented prices must strictly distinguish between printed/counter prices and unverified estimates.',
      'Permission must be obtained before photographing private interiors or people.',
      'Do not trespass, disturb shop operations, or collect personal customer information without consent.',
      'All submissions must be original student fieldwork.',
    ],
    tasks_instructions: [
      'Choose a market that is reasonably accessible to your team.',
      'Mission 01: Discover 2 hidden gem food outlets beyond famous spots.',
      'Mission 02: Investigate 3 dish menus with honest counter price evidence.',
      'Mission 03: Curate the ultimate satisfying food experience under ₹200 budget.',
      'Mission 04: Assemble a clear, visually attractive food discovery map of the market.',
    ],
    missions: [
      {
        mission_number: 1,
        title: 'The Hidden Gem',
        points: 20,
        task_summary: 'Discover two interesting food outlets in your selected market.',
        instructions: [
          'Look beyond only the most famous shops.',
          'Identify outlet name, exact landmark location, and food category.',
          'Document what makes the place interesting and notable signature dishes.',
          'Provide photographic or storefront evidence.',
        ],
        deliverables: ['Two documented food discovery profiles with descriptions and visual evidence.'],
        evaluation_criteria: ['Relevance of discoveries', 'Quality of research', 'Discovery originality', 'Accuracy of information'],
      },
      {
        mission_number: 2,
        title: 'The Menu Detective',
        points: 25,
        task_summary: 'Investigate menus of selected food outlets and document verified counter prices.',
        instructions: [
          'Document at least three interesting dishes with listed prices.',
          'Clearly classify price evidence: Printed Menu, Displayed Board, or Outlet Confirmed.',
          'Never present an unverified student estimate as a confirmed counter rate.',
          'Record observation date and evidence notes.',
        ],
        deliverables: ['3 dish price audit records with attached photo/receipt evidence and collection date.'],
        evaluation_criteria: ['Price accuracy', 'Distinction between printed and estimated prices', 'Evidence clarity'],
      },
      {
        mission_number: 3,
        title: 'The Budget Battle',
        points: 25,
        task_summary: 'Create the best possible food experience within a budget of ₹200.',
        instructions: [
          'Use real counter menu information from your selected market.',
          'Select dishes or combos that fit strictly within the ₹200 total budget.',
          'Explain why this combo provides outstanding student value.',
          'No purchase is compulsory; verify menu rates visually.',
        ],
        deliverables: ['Budget breakdown: selected outlets, items, prices, total sum, and rationale.'],
        evaluation_criteria: ['Budget adherence (≤ ₹200)', 'Creativity', 'Value for money', 'Practicality'],
      },
      {
        mission_number: 4,
        title: 'The Market Map',
        points: 30,
        task_summary: 'Create a visual food discovery map of your selected market.',
        instructions: [
          'Help a first-time visitor understand food options and navigate easily.',
          'Include selected food places, map pins, signature dishes, and key prices.',
          'Provide suggested exploration order and useful walking tips.',
          'Allowed formats: Digital map, designed graphic, Figma/interactive prototype, or illustrated PDF.',
        ],
        deliverables: ['Final visual map graphic or interactive link with exploration guide notes.'],
        evaluation_criteria: ['Completeness', 'Accuracy', 'Usability for first-time visitors', 'Visual presentation'],
      },
    ],
    bonus_challenges: [
      {
        title: 'Budget Boss',
        points: 10,
        description: 'Design a delicious and satisfying street food combo strictly under ₹100.',
        condition: 'Must use verified counter prices with attached proof.',
      },
      {
        title: 'Hidden Dish',
        points: 10,
        description: 'Uncover an extraordinary dish or secret preparation not widely known to outsiders.',
        condition: 'Include story of why it is special and chef/maker background.',
      },
      {
        title: 'Price Detective',
        points: 10,
        description: 'Document an important price difference or value insight between counter vs aggregator rates.',
        condition: 'Document exact price differential with evidence.',
      },
      {
        title: 'Local Legend',
        points: 10,
        description: 'Document the rich history or founding story of a legendary market food artisan.',
        condition: 'Include audio/written quote or historical detail.',
      },
    ],
    safety_guidelines: [
      'Students should explore public and accessible locations during daylight hours.',
      'Teams should preferably explore together and look out for each other.',
      'No compulsory food purchase is required to participate.',
      'Do not enter restricted premises, private kitchens, or trespass.',
      'Obtain polite permission before photographing stall owners, staff, or customers.',
      'Do not collect personal information from shopkeepers or customers without consent.',
      'Students bear their own local travel expenses; participation is 100% voluntary.',
    ],
    required_deliverables: [
      'Two Hidden Gem Food Outlets with Photos',
      'Three Verified Menu Dishes with Evidence',
      'Under ₹200 Budget Battle Experience Breakdown',
      'Complete Visual Market Map (Image or Prototype Link)',
      'Brief Team Exploration Summary',
    ],
    allowed_file_formats: ['PDF', 'PNG', 'JPG', 'Web Link', 'Figma Link', 'Prototype URL'],
    max_file_size_mb: 25,
    judging_criteria: [
      { title: 'Discovery Quality & Originality', weight_percent: 20, description: 'Depth of finding genuine hidden gems beyond famous spots' },
      { title: 'Menu Research & Evidence Accuracy', weight_percent: 25, description: 'Accuracy of documented counter rates and distinction of sources' },
      { title: 'Budget Creativity & Practicality', weight_percent: 25, description: 'Value, taste balance, and adherence to the ₹200 limit' },
      { title: 'Market Map Quality & Usability', weight_percent: 20, description: 'Clarity, aesthetic design, and usefulness for first-time visitors' },
      { title: 'Final Presentation & Storytelling', weight_percent: 10, description: 'Cohesiveness and clarity of team submission' },
    ],
    rewards: [
      { title: 'Competition Champion', recognition: 'Official Menu Maps Trophy, Champion Certificate & Permanent Hall of Fame Induction' },
      { title: 'First Runner-Up', recognition: 'Distinction Certificate & Public Portfolio Showcase' },
      { title: 'Second Runner-Up', recognition: 'Honour Certificate & Contribution Recognition' },
      { title: 'Finalist', recognition: 'Official Finalist Certificate' },
      { title: 'Best Food Discovery', recognition: 'Special Recognition Badge & Featured Spot on Menu Maps' },
      { title: 'Best Market Map', recognition: 'Official Map Feature on Website' },
      { title: 'Best Budget Experience', recognition: 'Curator Distinction Badge' },
    ],
    certificate_eligibility: 'All qualifying student teams who submit all four required mission deliverables.',
    faqs: [
      { question: 'Is participation free?', answer: 'Yes! Free of cost for all enrolled college students.' },
      { question: 'Do we have to buy food to participate?', answer: 'No. Food purchase is strictly voluntary. You only need to verify counter menus visually.' },
      { question: 'Can our team choose any market?', answer: 'Yes, choose any recognized market in Delhi NCR that is safe and accessible to your team.' },
      { question: 'What tools can we use for the map?', answer: 'You can use Canva, Figma, Google My Maps, illustrator, or clean hand-drawn illustrated scans.' },
    ],
    contact_info: 'discovery@menumaps.in',
    terms_and_conditions: [
      'Participation is voluntary and at students own discretion.',
      'Student work remains owned by students; Menu Maps receives non-exclusive showcase rights.',
      'Zero tolerance for fake or misrepresented counter rates.',
    ],
    status: 'Registration Open',
    created_at: '2026-05-01T00:00:00.000Z',
    updated_at: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'comp_fvc_season01',
    series_name: 'Menu Maps Discovery League',
    season: 'Season 01',
    title: 'THE FOODVERSE CHALLENGE',
    slug: 'foodverse-challenge',
    tagline: 'Imagine the Future of Food Discovery. Then Build It.',
    short_description:
      'Choose a real food discovery problem, research student user needs, and build an original digital product concept, interactive prototype, or visual discovery map.',
    description:
      'How can people discover better food experiences?\n\nHow can someone find an interesting meal within a limited budget? How can hidden local food places become easier to discover? How can technology make food exploration more useful and enjoyable?\n\nThe Foodverse Challenge invites students to think like creators, designers, researchers and problem-solvers. Choose a real food discovery problem, research it and build an original solution.',
    cover_image_url:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    category: 'Online Creative Challenge',
    format: 'Online',
    is_team_competition: true,
    min_team_size: 1,
    max_team_size: 4,
    eligibility:
      'Open to all enrolled university students across India. Participate individually or in teams of up to 4.',
    registration_start_date: '2026-05-01',
    registration_end_date: '2026-06-20',
    competition_start_date: '2026-06-21',
    competition_end_date: '2026-07-05',
    submission_deadline: '2026-07-05',
    rules: [
      'Participate individually or in teams of 1 to 4 students.',
      'Coding is NOT compulsory; interactive designs and prototypes are equally eligible.',
      'Free software tools (Figma free tier, Canva free tier, etc.) are completely sufficient.',
      'Work must be original and created during the competition duration.',
      'All team members must agree to terms and public display consent.',
    ],
    tasks_instructions: [
      'Select ONE primary challenge track from the five official tracks.',
      'Research the user problem with real student food seekers.',
      'Design an interactive prototype, digital map, or app concept addressing the problem.',
      'Prepare a concise 2-minute demonstration video or interactive presentation.',
      'Watch out for Secret Challenge Drops on Day 03, Day 05, and Day 07 to enhance your concept!',
    ],
    tracks: [
      {
        track_number: 1,
        title: '₹150 Food Explorer',
        problem_statement: 'How can someone discover an interesting and satisfying food experience within ₹150?',
        target_user: 'Budget-conscious college students and daily commuters.',
        suggested_features: ['Budget combo builder', 'Price filter radar', 'Portion size indicators', 'Real counter menu validator'],
        possible_deliverables: ['App screen flow', 'Interactive clickable prototype', 'User journey map', 'Digital product concept'],
      },
      {
        track_number: 2,
        title: 'Vegetarian Food Hunter',
        problem_statement: 'How can vegetarian users discover interesting local food options more easily?',
        target_user: 'Vegetarian and vegan diners seeking authentic, verified vegetarian delights beyond plain paneer.',
        suggested_features: ['Pure veg filter', 'Dedicated preparation checks', 'Street chaat radar', 'Nutritional value breakdown'],
        possible_deliverables: ['Interactive design prototype', 'Curated vegetarian digital trail', 'Feature specification'],
      },
      {
        track_number: 3,
        title: 'Hidden Delhi Food Explorer',
        problem_statement: 'How can people discover interesting food places beyond the usual popular recommendations?',
        target_user: 'Curious foodies, campus newcomers, and cultural heritage enthusiasts.',
        suggested_features: ['Hidden gem ranking', 'Alleyway route guidance', 'Patron lore stories', 'Ground verification seals'],
        possible_deliverables: ['Interactive discovery map', 'Mobile app concept', 'Visual storytelling experience'],
      },
      {
        track_number: 4,
        title: 'Friends Food Planner',
        problem_statement: 'How can a group of friends decide where and what to eat without wasting time?',
        target_user: 'Student friend circles, roommates, and project study groups.',
        suggested_features: ['Preference polling wheel', 'Shared budget pooling', 'Midpoint venue finder', 'Split bill preview'],
        possible_deliverables: ['Collaborative UI prototype', 'Group decision widget', 'Product walk-through concept'],
      },
      {
        track_number: 5,
        title: 'Best Dish for Your Budget',
        problem_statement: 'How can a user find the most suitable dish within a selected price range?',
        target_user: 'Everyday campus foodies seeking the absolute best dish for ₹50, ₹100, or ₹150.',
        suggested_features: ['Dish rating by price band', 'Comparative counter cost cards', 'Dish vs dish showdowns'],
        possible_deliverables: ['Dish radar UI concept', 'Comparative price prototype', 'Search experience wireframes'],
      },
    ],
    challenge_drops: [
      {
        id: 'fvc_drop_01',
        drop_number: 1,
        day_label: 'Day 03 Drop',
        title: 'The Extreme Budget Crunch',
        prompt: 'Your user has an unexpected, severely restricted budget. Improve your experience so they can find food without making the app interface clunky or embarrassing.',
        scheduled_date: 'Day 03',
        is_published: true,
        published_at: '2026-06-24T10:00:00.000Z',
      },
      {
        id: 'fvc_drop_02',
        drop_number: 2,
        day_label: 'Day 05 Drop',
        title: 'Unfamiliar Territory',
        prompt: 'Your user is stepping out at an unfamiliar metro station or market at dusk. How will your solution give them confidence, safety, and direction in under 60 seconds?',
        scheduled_date: 'Day 05',
        is_published: true,
        published_at: '2026-06-26T10:00:00.000Z',
      },
      {
        id: 'fvc_drop_03',
        drop_number: 3,
        day_label: 'Day 07 Drop',
        title: 'Radical Simplicity',
        prompt: 'Audit your interface: remove unnecessary clicks. Make your solution twice as simple, readable in sunlight, and delightful for a first-time user.',
        scheduled_date: 'Day 07',
        is_published: false,
      },
    ],
    required_deliverables: [
      'Project Title & Selected Challenge Track',
      'Problem Statement & User Persona Analysis',
      'Interactive Prototype Link (Figma/Lovable/Web) or Screen Deck',
      'Core Features & Architecture Walkthrough',
      'Optional 2-Minute Demo Video (YouTube / Loom / Drive)',
    ],
    allowed_file_formats: ['Figma Link', 'Prototype URL', 'PDF', 'PNG', 'JPG', 'Video Link'],
    max_file_size_mb: 30,
    judging_criteria: [
      { title: 'Problem Understanding & Research', weight_percent: 20, description: 'Clarity of the food discovery problem and empathy for user needs' },
      { title: 'Innovation & Originality', weight_percent: 20, description: 'Freshness of the concept and novel digital mechanisms' },
      { title: 'Usability & Practical Value', weight_percent: 20, description: 'Real-world utility and ease of use for students' },
      { title: 'Creativity & Visual/Design Quality', weight_percent: 20, description: 'Aesthetic polish, layout harmony, and UI clarity' },
      { title: 'Presentation & Explanation', weight_percent: 10, description: 'Clarity of walkthrough video or demonstration deck' },
      { title: 'Completeness & Feasibility', weight_percent: 10, description: 'Realistic execution without requiring impossible dependencies' },
    ],
    rewards: [
      { title: 'Competition Champion', recognition: 'Official Trophy, Champion Digital Credential & Public Portfolio Spotlight' },
      { title: 'First Runner-Up', recognition: 'Distinction Certificate & Public Showcase' },
      { title: 'Second Runner-Up', recognition: 'Honour Certificate' },
      { title: 'Finalist', recognition: 'Finalist Certificate of Achievement' },
      { title: 'Best Creative Concept', recognition: 'Innovation Award Badge' },
      { title: 'Best User Experience', recognition: 'Product Design Excellence Badge' },
      { title: 'Jury Choice', recognition: 'Special Jury Citation' },
    ],
    certificate_eligibility: 'All qualifying participants who deliver a complete, functioning prototype or product concept.',
    faqs: [
      { question: 'Do I need to know how to code?', answer: 'No! Clickable prototypes (Figma, Lovable, Canva) and visual product concepts are evaluated equally.' },
      { question: 'Do I need paid software?', answer: 'No. Free tools like Figma Free, Canva Free, and Google Slides are completely acceptable.' },
      { question: 'Can I participate alone or with friends?', answer: 'Both! You can participate individually or in a team of up to 4 members.' },
      { question: 'What are Challenge Drops?', answer: 'Surprise bonus prompts released on Day 03, Day 05, and Day 07 to stretch your creative thinking.' },
    ],
    contact_info: 'discovery@menumaps.in',
    terms_and_conditions: [
      'Intellectual property remains 100% with the student creator(s).',
      'Menu Maps is granted non-exclusive rights to showcase approved work in the public gallery.',
      'Deliverables must be submitted before the stated deadline.',
    ],
    status: 'Registration Open',
    created_at: '2026-05-01T00:00:00.000Z',
    updated_at: '2026-05-01T00:00:00.000Z',
  },
];

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

    let locals = getLocalTable<DiscoveryCompetition>('discovery_competitions');
    // Ensure official season 01 competitions are present
    let needsSave = false;
    for (const official of OFFICIAL_DISCOVERY_LEAGUE_SEASON_01) {
      const exists = locals.some((c) => c.slug === official.slug || c.id === official.id);
      if (!exists) {
        locals.push(official);
        needsSave = true;
      }
    }
    if (needsSave) {
      saveLocalTable('discovery_competitions', locals);
    }

    if (onlyPublished) {
      return locals.filter((c) => c.status !== 'Draft');
    }
    return locals;
  },

  async getDiscoveryLeagueCompetitions(): Promise<DiscoveryCompetition[]> {
    const all = await this.getCompetitions(false);
    return all.filter(
      (c) =>
        c.series_name?.includes('Discovery League') ||
        c.slug === 'great-market-mission' ||
        c.slug === 'foodverse-challenge'
    );
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
    const found = locals.find((c) => c.slug.toLowerCase() === clean);
    if (found) return found;

    // Check official seed list
    return OFFICIAL_DISCOVERY_LEAGUE_SEASON_01.find((c) => c.slug.toLowerCase() === clean) || null;
  },

  async updateCompetitionImage(competitionId: string, imageUrl: string): Promise<boolean> {
    const locals = getLocalTable<DiscoveryCompetition>('discovery_competitions');
    const comp = locals.find((c) => c.id === competitionId || c.slug === competitionId);
    if (comp) {
      comp.cover_image_url = imageUrl;
      comp.updated_at = new Date().toISOString();
      await this.saveCompetition(comp);
      return true;
    }
    return false;
  },

  async publishChallengeDrop(competitionId: string, dropId: string): Promise<boolean> {
    const comp = await this.getCompetitionBySlug(competitionId) || (await this.getCompetitions(false)).find(c => c.id === competitionId);
    if (!comp || !comp.challenge_drops) return false;

    const drop = comp.challenge_drops.find(d => d.id === dropId);
    if (drop) {
      drop.is_published = true;
      drop.published_at = new Date().toISOString();
      await this.saveCompetition(comp);
      return true;
    }
    return false;
  },

  async scoreSubmission(params: {
    submissionId: string;
    judgeScores: Array<{ criterion_title: string; score: number; max_score: number; comment?: string }>;
    totalScore: number;
    internalNotes?: string;
    studentFeedback?: string;
    newStatus?: SubmissionStatus;
  }): Promise<CompetitionSubmission | null> {
    const all = await this.getAllSubmissions();
    const sub = all.find(s => s.id === params.submissionId);
    if (!sub) return null;

    sub.judge_scores = params.judgeScores;
    sub.total_score = params.totalScore;
    if (params.internalNotes !== undefined) sub.internal_admin_notes = params.internalNotes;
    if (params.studentFeedback !== undefined) sub.student_visible_feedback = params.studentFeedback;
    if (params.newStatus) sub.status = params.newStatus;
    sub.reviewed_at = new Date().toISOString();

    await this.submitProject(sub);
    return sub;
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
    selectedTrack?: string;
    selectedMarket?: string;
    safetyRulesConfirmed?: boolean;
    teamMembersInfo?: Array<{ name: string; email: string; college?: string }>;
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

      // Add leader and members
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

      if (params.teamMembersInfo && params.teamMembersInfo.length > 0) {
        params.teamMembersInfo.forEach((m) => {
          members.push({
            id: 'tm_' + crypto.randomUUID(),
            team_id: team!.id,
            student_id: 'member_' + crypto.randomUUID(),
            student_name: m.name,
            student_email: m.email,
            college_name: m.college || '',
            role: 'Member',
            status: 'Accepted',
            joined_at: new Date().toISOString(),
          });
        });
      }
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
      selected_track: params.selectedTrack,
      selected_market: params.selectedMarket,
      safety_rules_confirmed: params.safetyRulesConfirmed,
      team_members_info: params.teamMembersInfo,
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

  async getAllRegistrations(): Promise<CompetitionRegistration[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('competition_registrations').select('*');
        if (data && !error && data.length > 0) return data;
      } catch (e) {}
    }
    return getLocalTable<CompetitionRegistration>('competition_registrations');
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

    let locals = getLocalTable<FoodDiscoveryItem>('food_discoveries');
    let needsSave = false;
    for (const official of OFFICIAL_APPROVED_DISCOVERIES) {
      if (!locals.some((d) => d.id === official.id || d.food_place_name === official.food_place_name)) {
        locals.push(official);
        needsSave = true;
      }
    }
    if (needsSave) {
      saveLocalTable('food_discoveries', locals);
    }

    return locals.filter((d) => d.verification_status === 'Verified by Menu Maps');
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

    let locals = getLocalTable<FoodDiscoveryItem>('food_discoveries');
    let needsSave = false;
    for (const official of OFFICIAL_APPROVED_DISCOVERIES) {
      if (!locals.some((d) => d.id === official.id)) {
        locals.push(official);
        needsSave = true;
      }
    }
    if (needsSave) {
      saveLocalTable('food_discoveries', locals);
    }
    return locals;
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

    let locals = getLocalTable<StudentFoodTrail>('student_food_trails');
    let needsSave = false;
    for (const official of OFFICIAL_FOOD_TRAILS) {
      if (!locals.some((t) => t.id === official.id || t.slug === official.slug)) {
        locals.push(official);
        needsSave = true;
      }
    }
    if (needsSave) {
      saveLocalTable('student_food_trails', locals);
    }

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
  // 5.5 MARKET FOOD GUIDES
  // ==========================================================================
  async getMarketGuides(publishedOnly = true): Promise<MarketFoodGuide[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('market_food_guides').select('*').order('published_date', { ascending: false });
        if (publishedOnly) query = query.eq('is_published', true);
        const { data, error } = await query;
        if (data && !error && data.length > 0) return data;
      } catch (e) {}
    }

    let locals = getLocalTable<MarketFoodGuide>('market_food_guides');
    let needsSave = false;
    for (const official of OFFICIAL_MARKET_GUIDES) {
      if (!locals.some((m) => m.id === official.id || m.slug === official.slug)) {
        locals.push(official);
        needsSave = true;
      }
    }
    if (needsSave) {
      saveLocalTable('market_food_guides', locals);
    }

    if (publishedOnly) {
      return locals.filter((m) => m.is_published);
    }
    return locals;
  },

  async getMarketGuideBySlug(slug: string): Promise<MarketFoodGuide | null> {
    const clean = slug.trim().toLowerCase();
    const all = await this.getMarketGuides(false);
    return all.find((m) => m.slug.toLowerCase() === clean) || null;
  },

  async saveMarketGuide(guide: MarketFoodGuide): Promise<MarketFoodGuide> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('market_food_guides').upsert(guide);
      } catch (e) {}
    }
    const locals = getLocalTable<MarketFoodGuide>('market_food_guides');
    const idx = locals.findIndex((m) => m.id === guide.id);
    if (idx !== -1) locals[idx] = guide;
    else locals.unshift(guide);
    saveLocalTable('market_food_guides', locals);
    return guide;
  },

  // ==========================================================================
  // 5.6 EDITORIAL FOOD STORIES & GUIDES
  // ==========================================================================
  async getFoodStories(publishedOnly = true): Promise<FoodStoryItem[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('food_stories').select('*').order('published_date', { ascending: false });
        if (publishedOnly) query = query.eq('is_published', true);
        const { data, error } = await query;
        if (data && !error && data.length > 0) return data;
      } catch (e) {}
    }

    let locals = getLocalTable<FoodStoryItem>('food_stories');
    let needsSave = false;
    for (const official of OFFICIAL_FOOD_STORIES) {
      if (!locals.some((s) => s.id === official.id || s.slug === official.slug)) {
        locals.push(official);
        needsSave = true;
      }
    }
    if (needsSave) {
      saveLocalTable('food_stories', locals);
    }

    if (publishedOnly) {
      return locals.filter((s) => s.is_published);
    }
    return locals;
  },

  async getFoodStoryBySlug(slug: string): Promise<FoodStoryItem | null> {
    const clean = slug.trim().toLowerCase();
    const all = await this.getFoodStories(false);
    return all.find((s) => s.slug.toLowerCase() === clean) || null;
  },

  async saveFoodStory(story: FoodStoryItem): Promise<FoodStoryItem> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('food_stories').upsert(story);
      } catch (e) {}
    }
    const locals = getLocalTable<FoodStoryItem>('food_stories');
    const idx = locals.findIndex((s) => s.id === story.id);
    if (idx !== -1) locals[idx] = story;
    else locals.unshift(story);
    saveLocalTable('food_stories', locals);
    return story;
  },

  // ==========================================================================
  // 5.7 BUDGET FOOD EXPLORER (GENUINE MENU MAPS VERIFIED RATES)
  // ==========================================================================
  getBudgetFoodDishes(tier?: 'under-50' | 'under-100' | 'under-150' | 'under-200', category?: string): BudgetFoodDish[] {
    const seed = getMasterSeedData();
    const restaurants = seed.restaurants || [];
    const results: BudgetFoodDish[] = [];

    for (const rest of restaurants) {
      const menus = rest.menu || [];
      for (const item of menus) {
        const price = Number(item.price);
        if (!price || price > 200) continue;

        let budgetTier: 'under-50' | 'under-100' | 'under-150' | 'under-200' = 'under-200';
        if (price <= 50) budgetTier = 'under-50';
        else if (price <= 100) budgetTier = 'under-100';
        else if (price <= 150) budgetTier = 'under-150';

        if (tier && budgetTier !== tier) continue;

        const cat = item.category || 'Specialty';
        if (category && category !== 'All' && !cat.toLowerCase().includes(category.toLowerCase())) continue;

        results.push({
          dish_name: item.name,
          category: cat,
          price: price,
          budget_tier: budgetTier,
          restaurant_name: rest.name,
          restaurant_slug: rest.slug || rest.id,
          neighbourhood: rest.location?.neighborhood || rest.location?.address || 'Delhi NCR',
          price_type: 'Counter Verified',
          photo_url: item.image_url || rest.cover_image_url,
          contributor_attribution: 'Physical counter record verified by Menu Maps',
        });
      }
    }

    return results;
  },

  // ==========================================================================
  // 5.8 DISCOVER BY DISH DIRECTORY
  // ==========================================================================
  getDishesDirectory() {
    const seed = getMasterSeedData();
    const restaurants = seed.restaurants || [];
    const dishKeywords = [
      { id: 'momos', label: 'Momos & Dimsums', icon: '🥟', keywords: ['momo', 'dimsum'] },
      { id: 'chole-bhature', label: 'Chole Bhature', icon: '🫓', keywords: ['chole bhature', 'bhatura', 'pindi chana'] },
      { id: 'dosa', label: 'Dosa & South Indian', icon: '🥞', keywords: ['dosa', 'uttapam', 'idli'] },
      { id: 'rolls', label: 'Kathi Rolls & Shawarma', icon: '🌯', keywords: ['roll', 'shawarma', 'frankie'] },
      { id: 'pizza', label: 'Pizza & Garlic Bread', icon: '🍕', keywords: ['pizza', 'calzone'] },
      { id: 'chaat', label: 'Chaat & Street Bites', icon: '🍲', keywords: ['chaat', 'gol gappe', 'puchka', 'dahi bhalla', 'papdi'] },
      { id: 'burgers', label: 'Burgers & Sandwiches', icon: '🍔', keywords: ['burger', 'sandwich'] },
      { id: 'sweets', label: 'Sweets & Desserts', icon: '🍨', keywords: ['jalebi', 'kulfi', 'gulab jamun', 'falooda', 'rasgulla', 'waffle'] },
      { id: 'biryani', label: 'Biryani & Rice Bowls', icon: '🍚', keywords: ['biryani', 'pulao', 'fried rice'] },
      { id: 'coffee-chai', label: 'Chai & Cold Coffee', icon: '☕', keywords: ['chai', 'coffee', 'shake', 'lassi'] },
    ];

    return dishKeywords.map((group) => {
      const matchingItems: Array<{ dish_name: string; price: number; restaurant_name: string; restaurant_slug: string; neighbourhood: string; photo_url?: string }> = [];

      for (const rest of restaurants) {
        for (const item of (rest.menu || [])) {
          const nameLower = (item.name || '').toLowerCase();
          const matches = group.keywords.some((k) => nameLower.includes(k));
          if (matches) {
            matchingItems.push({
              dish_name: item.name,
              price: Number(item.price) || 0,
              restaurant_name: rest.name,
              restaurant_slug: rest.slug || rest.id,
              neighbourhood: rest.location?.neighborhood || 'Delhi NCR',
              photo_url: item.image_url || rest.cover_image_url,
            });
          }
        }
      }

      const prices = matchingItems.map((m) => m.price).filter((p) => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 40;

      return {
        ...group,
        total_places_count: new Set(matchingItems.map((m) => m.restaurant_name)).size,
        min_price: minPrice,
        sample_dishes: matchingItems.slice(0, 8),
      };
    });
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
