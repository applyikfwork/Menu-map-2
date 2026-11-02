/**
 * Menu Maps Discovery - Unified Type Definitions
 * Supports:
 * - Public Discovery feed & Detail pages
 * - Student submissions, drafts & revisions
 * - Two flagship competitions & team registrations
 * - Admin approval queue, feedback & error reporting
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

export interface DiscoveryCompetition {
  id: string;
  series_name: string;
  season: string;
  title: string;
  slug: string;
  tagline: string;
  type: 'Offline exploration' | 'Online creative competition';
  duration_days: number;
  participation_type: 'Individual or team of 2–3' | 'Individual or team';
  min_team_size: number;
  max_team_size: number;
  start_date: string;
  end_date: string;
  submission_deadline: string;
  description: string;
  cover_image: string;
  tasks: Array<{
    title: string;
    points: number;
    description: string;
  }>;
  tracks?: string[];
  scoring_criteria: Array<{
    criterion: string;
    points: number;
  }>;
  rules: string[];
  status: 'Open for Registration' | 'In Progress' | 'Judging' | 'Completed';
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
