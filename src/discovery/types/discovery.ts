/**
 * Menu Maps Discovery - Unified Type Definitions
 * Supports:
 * - Public Discovery feed & Detail pages
 * - Student submissions, drafts & revisions
 * - Two flagship competitions (The Great Market Mission & The Foodverse Challenge)
 * - Main Admin Panel competition management, scoring, and review
 */

export type DiscoveryCategory =
  | 'Hidden Gems'
  | 'Dishes Worth Trying'
  | 'Budget-Friendly'
  | 'Local Food Experiences'
  | 'Vegetarian'
  | 'Street Eats'
  | 'Heritage';

export type PriceVerificationType =
  | 'Counter price observed'
  | 'Restaurant-confirmed'
  | 'Submitted but unverified'
  | 'Estimated';

export type DiscoveryStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Under Review'
  | 'Changes Requested'
  | 'Rejected'
  | 'Published'
  | 'Archived';

export interface DiscoveryGalleryImage {
  url: string;
  caption?: string;
}

export interface DiscoveryItem {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  category: DiscoveryCategory;
  city: string;
  locality: string;
  market_name?: string;
  restaurant_name?: string;
  restaurant_slug?: string;
  address?: string;
  map_link?: string;
  main_image: string;
  gallery: DiscoveryGalleryImage[];
  dish_name?: string;
  price?: number;
  price_type?: PriceVerificationType;
  price_evidence?: string;
  food_highlights?: string[];
  visitor_tips?: string[];
  opening_hours?: string;
  why_interesting?: string;
  contributor_id: string;
  contributor_name: string;
  contributor_avatar?: string;
  contributor_college?: string;
  team_id?: string;
  team_name?: string;
  competition_id?: string;
  competition_name?: string;
  status: DiscoveryStatus;
  admin_feedback?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  is_featured?: boolean;
  is_discovery_of_week?: boolean;
  tags?: string[];
  saves_count?: number;
}

export interface DiscoveryRevision {
  id: string;
  discovery_id: string;
  editor_id: string;
  editor_name: string;
  proposed_content: Partial<DiscoveryItem>;
  submitted_at: string;
  review_status: 'Pending Approval' | 'Approved' | 'Rejected';
  admin_feedback?: string;
}

export interface DiscoveryReport {
  id: string;
  discovery_id: string;
  discovery_title: string;
  report_reason: string;
  description: string;
  reporter_email?: string;
  submitted_at: string;
  status: 'Pending' | 'Reviewed' | 'Dismissed';
}

// =============================================================================
// COMPETITION DEFINITIONS (SEASON 01)
// =============================================================================

export type CompetitionStatus =
  | 'Draft'
  | 'Scheduled'
  | 'Registration Open'
  | 'Active'
  | 'Submissions Closed'
  | 'Under Evaluation'
  | 'Results Published'
  | 'Archived';

export type RecognitionAwardType =
  | 'Winner'
  | 'First Runner-up'
  | 'Second Runner-up'
  | 'Finalist'
  | 'Best Discovery'
  | 'Best Market Map'
  | 'Best Budget Experience'
  | 'Best Creative Concept'
  | 'Best User Experience'
  | 'Jury Choice';

export interface CompetitionMission {
  id: string;
  mission_number: number;
  title: string;
  badge: string; // e.g. '20 POINTS'
  points: number;
  description: string;
  requirements: string[];
  enabled: boolean;
}

export interface CompetitionTrack {
  id: string;
  track_number: number;
  title: string;
  description: string;
  ideas: string[];
  enabled: boolean;
}

export interface CompetitionScoringCriterion {
  criterion: string;
  points: number;
}

export interface CompetitionFAQ {
  question: string;
  answer: string;
}

export interface DiscoveryCompetition {
  id: string;
  series_name: string;
  season: string;
  title: string;
  slug: string;
  tagline: string;
  introduction: string;
  description: string;
  type: string; // 'Offline exploration' | 'Online creative challenge'
  duration_days: number;
  duration_text?: string;
  participation_type: string;
  min_team_size: number;
  max_team_size: number;
  start_date: string;
  end_date: string;
  submission_deadline: string;
  cover_image: string;
  difficulty?: string;
  purchase_requirement?: string;
  coding_requirement?: string;
  // Great Market Mission missions
  missions?: CompetitionMission[];
  // Foodverse Challenge tracks
  tracks?: CompetitionTrack[];
  // Generic fallback tasks for compatibility
  tasks?: Array<{
    title: string;
    points: number;
    description: string;
  }>;
  submission_checklist?: string[];
  scoring_criteria: CompetitionScoringCriterion[];
  rules: string[];
  guidelines?: string[];
  recognition_details?: string[];
  faqs?: CompetitionFAQ[];
  status: CompetitionStatus;
}

export interface CompetitionRegistration {
  id: string;
  competition_id: string;
  competition_title: string;
  student_id: string;
  student_name: string;
  student_email: string;
  participation_mode: 'individual' | 'team';
  team_name?: string;
  team_members?: string[];
  registered_at: string;
  status: 'Registered' | 'Submitted' | 'Reviewed';
}

export interface CompetitionSubmission {
  id: string;
  competition_id: string;
  competition_title: string;
  student_id: string;
  student_name: string;
  student_email: string;
  participation_mode: 'individual' | 'team';
  team_name?: string;
  team_members?: string[];
  submitted_at: string;
  updated_at: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Evaluated';

  // Great Market Mission specific fields
  market_name?: string;
  market_location?: string;
  hidden_gems_outlet1?: string;
  hidden_gems_outlet2?: string;
  hidden_gems_details?: string;
  menu_detective_dishes?: string;
  menu_price_evidence_urls?: string;
  budget_battle_plan?: string;
  budget_battle_cost?: string;
  market_map_url?: string;
  market_exploration_summary?: string;
  video_url?: string;

  // Foodverse Challenge specific fields
  track_id?: string;
  track_title?: string;
  project_title?: string;
  problem_statement?: string;
  intended_users?: string;
  proposed_solution?: string;
  main_features?: string;
  prototype_url?: string;
  how_it_works?: string;
  why_useful?: string;
  research_references?: string;

  // General attachments
  attachment_urls?: string[];

  // Admin evaluation & scoring
  scores?: Record<string, number>; // criterion -> score
  total_score?: number; // auto-calculated sum, max 100
  judging_notes?: string;
  corrections_requested?: string;
  recognition_award?: RecognitionAwardType | string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  college_university: string;
  bio?: string;
  role: 'student' | 'contributor';
  created_at: string;
  points: number;
  badges: string[];
}
