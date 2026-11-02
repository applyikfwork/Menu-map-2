/**
 * Menu Maps Discovery Ecosystem - Types & Data Models
 * Master type definitions for student profiles, competitions, submissions,
 * food discoveries, trails, projects, credits, achievements, passport, and certificates.
 */

// 1. Contributor Levels
export type ContributorLevel = 'Explorer' | 'Contributor' | 'Active Contributor' | 'Community Leader';

// 2. Student / Contributor Profile
export interface StudentProfile {
  id: string; // Supabase auth user id or unique uuid
  email: string;
  full_name: string;
  college_name: string;
  programme: string; // e.g. "B.Tech Computer Science" or "BA Economics"
  study_year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Postgraduate' | 'Alumni';
  city?: string;
  avatar_url?: string;
  bio?: string;
  contributor_level: ContributorLevel;
  contributor_title?: string; // e.g. "Delhi Street Food Explorer", "Campus Lead"
  total_credits: number;
  total_contributions_count: number;
  published_projects_count: number;
  competitions_count: number;
  portfolio_slug?: string;
  is_public_profile: boolean;
  public_consent_attribution: boolean;
  public_consent_college: boolean;
  is_suspended?: boolean;
  created_at: string;
  updated_at: string;
}

// 3. Competition Categories and Formats
export type CompetitionCategory =
  | 'Offline Exploration'
  | 'Online Creative Challenge'
  | 'Design & UX'
  | 'Research & Documentation'
  | 'Food Discovery Challenge'
  | 'Community Storytelling'
  | 'Custom Challenge';

export type CompetitionFormat = 'Online' | 'Offline' | 'Hybrid';

export type CompetitionStatus =
  | 'Draft'
  | 'Upcoming'
  | 'Registration Open'
  | 'Registration Closed'
  | 'Ongoing'
  | 'Submission Closed'
  | 'Under Evaluation'
  | 'Completed'
  | 'Cancelled';

export interface CompetitionFaq {
  question: string;
  answer: string;
}

export interface CompetitionReward {
  title: string;
  prize?: string;
  recognition: string;
  badge?: string;
}

export interface CompetitionJudgingCriterion {
  title: string;
  weight_percent: number;
  description: string;
}

export interface DiscoveryCompetition {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  cover_image_url: string;
  category: CompetitionCategory;
  format: CompetitionFormat;
  is_team_competition: boolean;
  min_team_size: number;
  max_team_size: number;
  eligibility: string;
  allowed_colleges?: string[];
  allowed_locations?: string[];
  registration_start_date: string;
  registration_end_date: string;
  competition_start_date: string;
  competition_end_date: string;
  submission_deadline: string;
  rules: string[];
  tasks_instructions: string[];
  required_deliverables: string[];
  allowed_file_formats: string[]; // e.g. ["PDF", "PNG", "JPG", "Figma Link", "Prototype URL"]
  max_file_size_mb: number;
  judging_criteria: CompetitionJudgingCriterion[];
  rewards: CompetitionReward[];
  certificate_eligibility: string;
  faqs: CompetitionFaq[];
  contact_info: string;
  terms_and_conditions: string[];
  status: CompetitionStatus;
  created_at: string;
  updated_at: string;
}

// 4. Competition Registrations & Teams
export interface CompetitionRegistration {
  id: string;
  competition_id: string;
  student_id: string;
  is_team: boolean;
  team_id?: string;
  status: 'Registered' | 'Confirmed' | 'Withdrawn';
  registration_notes?: string;
  registered_at: string;
}

export interface CompetitionTeam {
  id: string;
  competition_id: string;
  team_name: string;
  team_code: string; // e.g. "MM-TEAM-8942" for sharing invite
  leader_student_id: string;
  created_at: string;
}

export interface CompetitionTeamMember {
  id: string;
  team_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  college_name: string;
  role: 'Leader' | 'Member';
  status: 'Invited' | 'Accepted' | 'Declined';
  joined_at?: string;
}

// 5. Submissions
export type SubmissionStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Needs Correction'
  | 'Accepted'
  | 'Rejected'
  | 'Published';

export interface SubmissionAttachment {
  name: string;
  file_url: string;
  file_type: string;
  file_size_bytes?: number;
}

export interface CompetitionSubmission {
  id: string;
  reference_id: string; // e.g. "MM-SUB-2026-0042"
  competition_id: string;
  student_id: string;
  team_id?: string;
  title: string;
  description: string;
  project_summary?: string;
  attachments: SubmissionAttachment[];
  external_prototype_url?: string;
  external_video_url?: string;
  external_presentation_url?: string;
  status: SubmissionStatus;
  internal_admin_notes?: string;
  student_visible_feedback?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  is_published_to_gallery: boolean;
}

// 6. Food Discoveries (Verification Engine)
export type FoodDiscoveryVerificationStatus =
  | 'Student Submitted'
  | 'Awaiting Review'
  | 'Needs Correction'
  | 'Verified by Menu Maps'
  | 'Rejected';

export interface FoodDiscoveryItem {
  id: string;
  student_id: string;
  contributor_name: string;
  food_place_name: string;
  neighbourhood: string; // e.g. "Kamla Nagar", "Hauz Khas Village"
  full_address: string;
  latitude?: number;
  longitude?: number;
  category: string; // e.g. "Hidden Gem Cafe", "Street Food Legend", "Late Night Roll Corner"
  featured_dish: string;
  counter_price_observed?: number;
  price_notes?: string;
  photo_urls: string[];
  evidence_description: string;
  verification_status: FoodDiscoveryVerificationStatus;
  verified_counter_rate?: number;
  verified_by?: string;
  verification_date?: string;
  verification_notes?: string;
  is_promoted_to_main_directory?: boolean;
  public_attribution_preference: 'With Name' | 'Anonymous' | 'With College';
  created_at: string;
  updated_at: string;
}

// 7. Student Food Trails
export interface FoodTrailStop {
  stop_number: number;
  place_name: string;
  landmark: string;
  must_try_dish: string;
  estimated_price: number;
  why_special: string;
  walking_time_from_prev?: string;
}

export interface StudentFoodTrail {
  id: string;
  title: string;
  slug: string;
  neighbourhood: string;
  description: string;
  cover_image_url: string;
  student_id: string;
  creator_name: string;
  creator_college?: string;
  total_duration_estimate: string; // e.g. "2 hours (Walking Trail)"
  budget_estimate_for_one: number;
  stops: FoodTrailStop[];
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Featured';
  created_at: string;
}

// 8. Student Creations (Public Gallery)
export type ProjectCategory =
  | 'Food Map'
  | 'Digital Prototype'
  | 'App Design'
  | 'Creative Poster'
  | 'Food Trail Concept'
  | 'Research Paper'
  | 'Short Video'
  | 'Visual Concept'
  | 'Presentation';

export interface StudentProject {
  id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  short_description: string;
  description: string;
  cover_image_url: string;
  media_urls?: string[];
  prototype_url?: string;
  video_url?: string;
  presentation_url?: string;
  student_id: string;
  creator_name: string;
  creator_college?: string;
  competition_id?: string;
  competition_title?: string;
  credit_awarded?: string;
  published_date: string;
  views_count: number;
  likes_count: number;
}

// 9. Contribution Credits
export type CreditCategory =
  | 'Food Discovery Credit'
  | 'Menu Research Credit'
  | 'Food Trail Credit'
  | 'Creative Credit'
  | 'Digital Innovation Credit'
  | 'Community Credit'
  | 'Competition Credit'
  | 'Leadership Credit';

export interface ContributionCredit {
  id: string;
  student_id: string;
  category: CreditCategory;
  points: number; // e.g. 50, 100, 250
  title: string;
  description: string;
  awarded_by: string; // Admin email or system
  reference_type?: 'competition' | 'food_discovery' | 'trail' | 'project' | 'manual';
  reference_id?: string;
  awarded_at: string;
}

// 10. Passport Stamps & Achievements
export interface PassportStamp {
  id: string;
  stamp_key: string; // e.g. "delhi_explorer", "market_mission", "hidden_food_finder"
  name: string;
  description: string;
  icon: string;
  color: string;
  earned_at: string;
  activity_name: string;
}

export interface StudentAchievement {
  id: string;
  student_id: string;
  stamp_key: string;
  title: string;
  description: string;
  icon: string;
  badge_color: string;
  earned_at: string;
}

// 11. Hall of Fame (Competition Champions & Results)
export type AwardRank =
  | 'Champion'
  | 'First Runner-Up'
  | 'Second Runner-Up'
  | 'Finalist'
  | 'Best Discovery'
  | 'Best Food Trail'
  | 'Best Creative Project'
  | 'Jury Choice'
  | 'Special Recognition';

export interface HallOfFameEntry {
  id: string;
  competition_id: string;
  competition_title: string;
  award_rank: AwardRank;
  student_id: string;
  winner_name: string;
  college_name?: string;
  team_name?: string;
  project_title: string;
  project_id?: string;
  citation: string;
  awarded_at: string;
  year: number;
}

// 12. Certificates
export type CertificateType =
  | 'Participation'
  | 'Completion'
  | 'Winner'
  | 'Runner-Up'
  | 'Finalist'
  | 'Special Recognition'
  | 'Contribution Recognition';

export interface DiscoveryCertificate {
  id: string;
  certificate_number: string; // e.g. "MM-CERT-2026-8941"
  student_id: string;
  student_name: string;
  college_name?: string;
  activity_title: string;
  certificate_type: CertificateType;
  issue_date: string;
  issuing_body: string; // "Menu Maps Delhi NCR"
  signature_title: string; // "Head of Community & Platform Architecture"
  verification_url: string;
  is_valid: boolean;
}

// 13. Community Announcements & Opportunities
export type OpportunityType =
  | 'Announcement'
  | 'Competition'
  | 'Campus Opportunity'
  | 'Collaboration Activity'
  | 'Leadership Application';

export interface DiscoveryAnnouncement {
  id: string;
  title: string;
  summary: string;
  body: string;
  opportunity_type: OpportunityType;
  action_label?: string;
  action_url?: string;
  is_pinned: boolean;
  published_at: string;
}

// 14. In-App Notifications
export interface DiscoveryNotification {
  id: string;
  student_id: string;
  title: string;
  message: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}
