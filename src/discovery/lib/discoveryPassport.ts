/**
 * Menu Maps Discovery - Passport & Contributor Level Engine
 * Manages verifiable digital passport stamps, achievements, and contributor level progression.
 */

import { StudentProfile, ContributorLevel, PassportStamp } from '../types/discovery';

export interface StampDefinition {
  stamp_key: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  badge_label: string;
  unlock_condition: string;
}

export const OFFICIAL_PASSPORT_STAMPS: StampDefinition[] = [
  {
    stamp_key: 'delhi_explorer',
    name: 'Delhi Explorer',
    description: 'Joined the community and logged first interaction in Menu Maps Discovery.',
    icon: '🧭',
    color: '#0F766E', // Teal
    badge_label: 'Initiation',
    unlock_condition: 'Registered member with complete profile',
  },
  {
    stamp_key: 'market_mission',
    name: 'Market Mission Completed',
    description: 'Conducted field exploration in an iconic Delhi market or student hub.',
    icon: '📍',
    color: '#FF5A36', // Coral
    badge_label: 'Field Scout',
    unlock_condition: 'Completed at least 1 verified market or food trail challenge',
  },
  {
    stamp_key: 'hidden_food_finder',
    name: 'Hidden Food Finder',
    description: 'Discovered and submitted an authentic hidden cafe or street spot verified by Menu Maps.',
    icon: '💎',
    color: '#8B5CF6', // Purple
    badge_label: 'Discovery',
    unlock_condition: '1 approved food discovery entry',
  },
  {
    stamp_key: 'menu_detective',
    name: 'Menu Detective',
    description: 'Provided documented in-store counter price evidence verifying honest rates.',
    icon: '🔍',
    color: '#F59E0B', // Amber
    badge_label: 'Transparency',
    unlock_condition: '2 verified price evidence submissions',
  },
  {
    stamp_key: 'food_trail_creator',
    name: 'Food Trail Creator',
    description: 'Designed a high-utility student food crawl or neighbourhood exploration trail.',
    icon: '🗺️',
    color: '#10B981', // Emerald
    badge_label: 'Curator',
    unlock_condition: '1 published student food trail',
  },
  {
    stamp_key: 'creative_champion',
    name: 'Creative Champion',
    description: 'Created a published digital prototype, app concept, visual poster, or research work.',
    icon: '✨',
    color: '#EC4899', // Pink
    badge_label: 'Innovator',
    unlock_condition: '1 accepted creative project in public gallery',
  },
  {
    stamp_key: 'competition_finalist',
    name: 'Competition Finalist',
    description: 'Reached the final evaluation round in an official Menu Maps challenge.',
    icon: '🏆',
    color: '#EAB308', // Gold
    badge_label: 'Honour',
    unlock_condition: 'Awarded Finalist or Champion rank in Hall of Fame',
  },
  {
    stamp_key: 'community_leader',
    name: 'Community Leader',
    description: 'Recognized for outstanding mentorship, coordination, and community stewardship.',
    icon: '⭐',
    color: '#1E293B', // Slate
    badge_label: 'Leadership',
    unlock_condition: 'Earned 500+ credits and selected for community leadership',
  },
];

/**
 * Calculates current contributor level based on real accepted counts and credits
 */
export function calculateContributorLevel(
  acceptedCount: number,
  totalCredits: number,
  currentLevel: ContributorLevel = 'Explorer'
): { level: ContributorLevel; nextLevelProgressPercent: number; nextLevelName?: ContributorLevel } {
  // Respect manually assigned Community Leader status
  if (currentLevel === 'Community Leader') {
    return { level: 'Community Leader', nextLevelProgressPercent: 100 };
  }

  if (acceptedCount >= 5 || totalCredits >= 350) {
    return {
      level: 'Active Contributor',
      nextLevelProgressPercent: Math.min(100, Math.round((totalCredits / 600) * 100)),
      nextLevelName: 'Community Leader',
    };
  }

  if (acceptedCount >= 1 || totalCredits >= 50) {
    const progress = Math.min(100, Math.round((acceptedCount / 5) * 100));
    return {
      level: 'Contributor',
      nextLevelProgressPercent: progress,
      nextLevelName: 'Active Contributor',
    };
  }

  const progress = Math.min(100, Math.round((acceptedCount / 1) * 100));
  return {
    level: 'Explorer',
    nextLevelProgressPercent: progress,
    nextLevelName: 'Contributor',
  };
}

/**
 * Generates the student's earned digital stamps
 */
export function evaluateStudentStamps(
  profile: StudentProfile,
  acceptedContributionsCount: number,
  hasPublishedProject: boolean,
  hasPublishedTrail: boolean,
  isFinalistOrWinner: boolean
): PassportStamp[] {
  const earned: PassportStamp[] = [];
  const baseDate = profile.created_at || new Date().toISOString();

  // 1. Delhi Explorer: awarded upon profile completion
  earned.push({
    id: `stamp_delhi_explorer_${profile.id}`,
    stamp_key: 'delhi_explorer',
    name: 'Delhi Explorer',
    description: 'Registered member with complete profile in Menu Maps Discovery.',
    icon: '🧭',
    color: '#0F766E',
    earned_at: baseDate,
    activity_name: 'Community Onboarding',
  });

  // 2. Hidden Food Finder
  if (acceptedContributionsCount >= 1) {
    earned.push({
      id: `stamp_hidden_food_${profile.id}`,
      stamp_key: 'hidden_food_finder',
      name: 'Hidden Food Finder',
      description: 'Discovered an authentic food gem verified by Menu Maps.',
      icon: '💎',
      color: '#8B5CF6',
      earned_at: profile.updated_at || baseDate,
      activity_name: 'Verified Food Discovery',
    });
  }

  // 3. Menu Detective
  if (acceptedContributionsCount >= 2) {
    earned.push({
      id: `stamp_menu_detective_${profile.id}`,
      stamp_key: 'menu_detective',
      name: 'Menu Detective',
      description: 'Documented authentic in-store counter rate evidence.',
      icon: '🔍',
      color: '#F59E0B',
      earned_at: profile.updated_at || baseDate,
      activity_name: 'Counter Price Documentation',
    });
  }

  // 4. Food Trail Creator
  if (hasPublishedTrail) {
    earned.push({
      id: `stamp_trail_creator_${profile.id}`,
      stamp_key: 'food_trail_creator',
      name: 'Food Trail Creator',
      description: 'Designed a published neighbourhood exploration food trail.',
      icon: '🗺️',
      color: '#10B981',
      earned_at: profile.updated_at || baseDate,
      activity_name: 'Food Trail Curation',
    });
  }

  // 5. Creative Champion
  if (hasPublishedProject) {
    earned.push({
      id: `stamp_creative_champ_${profile.id}`,
      stamp_key: 'creative_champion',
      name: 'Creative Champion',
      description: 'Published an approved digital project in the student gallery.',
      icon: '✨',
      color: '#EC4899',
      earned_at: profile.updated_at || baseDate,
      activity_name: 'Student Creations Showcase',
    });
  }

  // 6. Competition Finalist
  if (isFinalistOrWinner) {
    earned.push({
      id: `stamp_finalist_${profile.id}`,
      stamp_key: 'competition_finalist',
      name: 'Competition Finalist',
      description: 'Reached official competition finals and inducted into Hall of Fame.',
      icon: '🏆',
      color: '#EAB308',
      earned_at: profile.updated_at || baseDate,
      activity_name: 'Official Challenge Recognition',
    });
  }

  // 7. Community Leader
  if (profile.contributor_level === 'Community Leader') {
    earned.push({
      id: `stamp_community_leader_${profile.id}`,
      stamp_key: 'community_leader',
      name: 'Community Leader',
      description: 'Conferred leadership status for exemplary contributions.',
      icon: '⭐',
      color: '#1E293B',
      earned_at: profile.updated_at || baseDate,
      activity_name: 'Community Stewardship Appointment',
    });
  }

  return earned;
}
