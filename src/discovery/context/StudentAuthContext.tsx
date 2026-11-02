/**
 * Menu Maps Discovery - Student Authentication Context
 * Manages logged-in student profile, registration, session persistence,
 * and saved discoveries.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentProfile } from '../types/discovery';
import { discoveryApi } from '../lib/discoveryApi';

const SESSION_KEY = 'menumap_student_session';

interface StudentAuthContextValue {
  student: StudentProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, college: string, password?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  savedDiscoveryIds: string[];
  toggleSave: (discoveryId: string) => boolean;
}

const StudentAuthContext = createContext<StudentAuthContextValue | null>(null);

export const StudentAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentProfile | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [savedDiscoveryIds, setSavedDiscoveryIds] = useState<string[]>([]);

  useEffect(() => {
    if (student) {
      const ids = discoveryApi.getSavedDiscoveryIds(student.id);
      setSavedDiscoveryIds(ids);
    } else {
      setSavedDiscoveryIds([]);
    }
  }, [student?.id]);

  const login = async (email: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    // Look up or auto-restore student session
    let existingProfile: StudentProfile | null = null;
    try {
      const allProfilesRaw = localStorage.getItem('menumap_student_profiles');
      const allProfiles: StudentProfile[] = allProfilesRaw ? JSON.parse(allProfilesRaw) : [];
      existingProfile = allProfiles.find((p) => p.email.toLowerCase() === cleanEmail) || null;
    } catch (e) {}

    if (!existingProfile) {
      // Create default starter profile
      existingProfile = {
        id: `student_${Date.now()}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        college_university: 'University of Delhi',
        role: 'student',
        created_at: new Date().toISOString(),
        points: 50,
        badges: ['Campus Contributor'],
      };
    }

    setStudent(existingProfile);
    localStorage.setItem(SESSION_KEY, JSON.stringify(existingProfile));
    return true;
  };

  const register = async (name: string, email: string, college: string): Promise<boolean> => {
    const newStudent: StudentProfile = {
      id: `student_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      college_university: college.trim() || 'University of Delhi',
      role: 'student',
      created_at: new Date().toISOString(),
      points: 100,
      badges: ['Campus Contributor', 'Rising Explorer'],
    };

    try {
      const allProfilesRaw = localStorage.getItem('menumap_student_profiles');
      const allProfiles: StudentProfile[] = allProfilesRaw ? JSON.parse(allProfilesRaw) : [];
      allProfiles.push(newStudent);
      localStorage.setItem('menumap_student_profiles', JSON.stringify(allProfiles));
    } catch (e) {}

    setStudent(newStudent);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newStudent));
    return true;
  };

  const logout = () => {
    setStudent(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const updateProfile = (updates: Partial<StudentProfile>) => {
    if (!student) return;
    const updated = { ...student, ...updates };
    setStudent(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  };

  const toggleSave = (discoveryId: string): boolean => {
    if (!student) return false;
    const isSaved = discoveryApi.toggleSaveDiscovery(student.id, discoveryId);
    setSavedDiscoveryIds(discoveryApi.getSavedDiscoveryIds(student.id));
    return isSaved;
  };

  return (
    <StudentAuthContext.Provider
      value={{
        student,
        isAuthenticated: !!student,
        login,
        register,
        logout,
        updateProfile,
        savedDiscoveryIds,
        toggleSave,
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
};

export const useStudentAuth = () => {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) {
    throw new Error('useStudentAuth must be used within StudentAuthProvider');
  }
  return ctx;
};
