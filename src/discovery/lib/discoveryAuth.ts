/**
 * Menu Maps Discovery - Student Authentication Engine
 * Provides secure student registration, login, session guards, and profile updates.
 */

import { StudentProfile, ContributorLevel } from '../types/discovery';
import { getSupabaseClient } from '../../lib/supabase';

const STUDENT_SESSION_KEY = 'menumap_student_session';
const STUDENTS_STORAGE_KEY = 'menumap_tbl_discovery_profiles';

// SHA-256 helper for client/browser password hashing
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password.trim() + '_mm_discovery_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Session Helpers
export function getCurrentStudentSession(): StudentProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STUDENT_SESSION_KEY) || localStorage.getItem(STUDENT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id && parsed.email) {
      return parsed as StudentProfile;
    }
  } catch (e) {
    // invalid JSON
  }
  return null;
}

export function setStudentSession(student: StudentProfile): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(student);
    sessionStorage.setItem(STUDENT_SESSION_KEY, serialized);
    localStorage.setItem(STUDENT_SESSION_KEY, serialized);
    window.dispatchEvent(new CustomEvent('menumap_student_auth_changed', { detail: student }));
  } catch (e) {
    console.error('Failed to set student session', e);
  }
}

export function clearStudentSession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STUDENT_SESSION_KEY);
    localStorage.removeItem(STUDENT_SESSION_KEY);
    window.dispatchEvent(new CustomEvent('menumap_student_auth_changed', { detail: null }));
  } catch (e) {
    console.error('Failed to clear student session', e);
  }
}

// Local store helpers
function getLocalProfiles(): Array<StudentProfile & { password_hash?: string }> {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalProfiles(profiles: Array<StudentProfile & { password_hash?: string }>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save local profiles', e);
  }
}

export interface RegisterStudentParams {
  email: string;
  password: string;
  fullName: string;
  collegeName: string;
  programme: string;
  studyYear: StudentProfile['study_year'];
  city?: string;
  avatarUrl?: string;
  publicAttributionConsent: boolean;
  publicCollegeConsent: boolean;
}

/**
 * Register a new student contributor
 */
export async function registerStudent(
  params: RegisterStudentParams
): Promise<{ success: boolean; student?: StudentProfile; error?: string }> {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanName = params.fullName.trim();
  const cleanCollege = params.collegeName.trim();
  const cleanProgramme = params.programme.trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: 'Please enter your full name.' };
  }
  if (!cleanCollege) {
    return { success: false, error: 'Please specify your college or university name.' };
  }
  if (!params.password || params.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  const existingLocal = getLocalProfiles();
  if (existingLocal.some((p) => p.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  const passwordHash = await hashPassword(params.password);
  const now = new Date().toISOString();
  const portfolioSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

  const newProfile: StudentProfile & { password_hash: string } = {
    id: 'stu_' + crypto.randomUUID(),
    email: cleanEmail,
    password_hash: passwordHash,
    full_name: cleanName,
    college_name: cleanCollege,
    programme: cleanProgramme || 'Undergraduate',
    study_year: params.studyYear || '1st Year',
    city: params.city || 'Delhi NCR',
    avatar_url: params.avatarUrl,
    bio: '',
    contributor_level: 'Explorer',
    contributor_title: 'Student Explorer',
    total_credits: 0,
    total_contributions_count: 0,
    published_projects_count: 0,
    competitions_count: 0,
    portfolio_slug: portfolioSlug,
    is_public_profile: true,
    public_consent_attribution: params.publicAttributionConsent,
    public_consent_college: params.publicCollegeConsent,
    created_at: now,
    updated_at: now,
  };

  // 1. Supabase insert if available
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // Optional Supabase auth signup attempt
      try {
        await supabase.auth.signUp({
          email: cleanEmail,
          password: params.password,
          options: {
            data: { full_name: cleanName, college_name: cleanCollege },
          },
        });
      } catch (authErr) {
        // ignore if signup is offline or restricted
      }

      await supabase.from('discovery_profiles').upsert([newProfile]);
    } catch (e) {
      console.warn('Supabase remote profile insert notice:', e);
    }
  }

  // 2. Local persistence
  existingLocal.push(newProfile);
  saveLocalProfiles(existingLocal);

  const { password_hash, ...publicStudent } = newProfile;
  setStudentSession(publicStudent);
  return { success: true, student: publicStudent };
}

/**
 * Log in an existing student
 */
export async function loginStudent(
  email: string,
  passwordCandidate: string
): Promise<{ success: boolean; student?: StudentProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !passwordCandidate) {
    return { success: false, error: 'Please enter both email and password.' };
  }

  const expectedHash = await hashPassword(passwordCandidate);

  // 1. Check remote Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('discovery_profiles')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (data && !error) {
        if (data.is_suspended) {
          return { success: false, error: 'This account has been suspended by administration.' };
        }
        if (data.password_hash && data.password_hash !== expectedHash) {
          return { success: false, error: 'Invalid password. Please check your credentials.' };
        }
        const { password_hash, ...student } = data;
        setStudentSession(student);
        return { success: true, student };
      }
    } catch (e) {
      console.warn('Supabase profile login notice:', e);
    }
  }

  // 2. Check local profiles
  const locals = getLocalProfiles();
  const matched = locals.find((p) => p.email.toLowerCase() === cleanEmail);
  if (!matched) {
    return { success: false, error: 'No account found with this email. Please register.' };
  }
  if (matched.is_suspended) {
    return { success: false, error: 'This account has been suspended by administration.' };
  }
  if (matched.password_hash && matched.password_hash !== expectedHash) {
    return { success: false, error: 'Invalid password. Please try again.' };
  }

  const { password_hash, ...student } = matched;
  setStudentSession(student);
  return { success: true, student };
}

/**
 * Update Student Profile
 */
export async function updateStudentProfile(
  studentId: string,
  updates: Partial<StudentProfile>
): Promise<{ success: boolean; student?: StudentProfile; error?: string }> {
  const current = getCurrentStudentSession();
  if (!current || current.id !== studentId) {
    return { success: false, error: 'Unauthorized to update this profile.' };
  }

  const updated: StudentProfile = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // 1. Supabase sync
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('discovery_profiles').update(updates).eq('id', studentId);
    } catch (e) {
      console.warn('Supabase profile update warning:', e);
    }
  }

  // 2. Local sync
  const locals = getLocalProfiles();
  const idx = locals.findIndex((p) => p.id === studentId);
  if (idx !== -1) {
    locals[idx] = { ...locals[idx], ...updates, updated_at: updated.updated_at };
    saveLocalProfiles(locals);
  }

  setStudentSession(updated);
  return { success: true, student: updated };
}
