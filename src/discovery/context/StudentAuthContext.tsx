/**
 * Menu Maps Discovery - Student Authentication Context
 * Reactive provider for student state, login, register, logout, and notifications.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StudentProfile, DiscoveryNotification } from '../types/discovery';
import {
  getCurrentStudentSession,
  loginStudent,
  registerStudent,
  updateStudentProfile,
  clearStudentSession,
  RegisterStudentParams,
} from '../lib/discoveryAuth';
import { discoveryApi } from '../lib/discoveryApi';
import { useToast } from '../../components/Toast';

interface StudentAuthContextValue {
  student: StudentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  notifications: DiscoveryNotification[];
  unreadNotificationsCount: number;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (params: RegisterStudentParams) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<boolean>;
  refreshStudent: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

const StudentAuthContext = createContext<StudentAuthContextValue | null>(null);

export const StudentAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [student, setStudent] = useState<StudentProfile | null>(() => getCurrentStudentSession());
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<DiscoveryNotification[]>([]);

  const fetchNotifications = async (studentId: string) => {
    try {
      const items = await discoveryApi.getStudentNotifications(studentId);
      setNotifications(items);
    } catch (e) {}
  };

  useEffect(() => {
    const handleAuthChange = (e: any) => {
      setStudent(e.detail);
      if (e.detail?.id) {
        fetchNotifications(e.detail.id);
      } else {
        setNotifications([]);
      }
    };

    window.addEventListener('menumap_student_auth_changed', handleAuthChange);
    if (student?.id) {
      fetchNotifications(student.id);
    }

    return () => window.removeEventListener('menumap_student_auth_changed', handleAuthChange);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await loginStudent(email, pass);
      if (res.success && res.student) {
        setStudent(res.student);
        fetchNotifications(res.student.id);
        showToast(`Welcome back, ${res.student.full_name}!`, 'success');
        return { success: true };
      }
      return { success: false, error: res.error || 'Login failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (params: RegisterStudentParams) => {
    setIsLoading(true);
    try {
      const res = await registerStudent(params);
      if (res.success && res.student) {
        setStudent(res.student);
        fetchNotifications(res.student.id);
        showToast(`Welcome to Menu Maps Discovery, ${res.student.full_name}!`, 'success');
        return { success: true };
      }
      return { success: false, error: res.error || 'Registration failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStudentSession();
    setStudent(null);
    setNotifications([]);
    showToast('Logged out of Discovery.', 'info');
  };

  const updateProfile = async (updates: Partial<StudentProfile>): Promise<boolean> => {
    if (!student) return false;
    const res = await updateStudentProfile(student.id, updates);
    if (res.success && res.student) {
      setStudent(res.student);
      showToast('Profile updated successfully.', 'success');
      return true;
    }
    showToast(res.error || 'Failed to update profile.', 'error');
    return false;
  };

  const refreshStudent = async () => {
    const s = getCurrentStudentSession();
    setStudent(s);
    if (s?.id) {
      fetchNotifications(s.id);
    }
  };

  const markNotificationRead = async (id: string) => {
    await discoveryApi.markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;

  return (
    <StudentAuthContext.Provider
      value={{
        student,
        isAuthenticated: !!student,
        isLoading,
        notifications,
        unreadNotificationsCount,
        login,
        register,
        logout,
        updateProfile,
        refreshStudent,
        markNotificationRead,
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
};

export const useStudentAuth = (): StudentAuthContextValue => {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
};
