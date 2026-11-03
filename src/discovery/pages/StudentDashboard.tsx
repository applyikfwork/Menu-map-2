/**
 * Menu Maps Discovery - Private Student Workspace & Creator Dashboard (/student-dashboard)
 *
 * Workspace destinations:
 * 1. Overview (Real database stats, active competitions, draft quick-access)
 * 2. My Competitions (Joined challenges, deadlines, instructions, direct submit)
 * 3. Create Discovery (Full discovery editor studio)
 * 4. My Discoveries (Drafts, pending approvals, review feedback, rejection notes)
 * 5. Published Discoveries (Live links, safe revision request)
 * 6. My Achievements (Badges, verified certificates, points)
 * 7. My Profile (College, bio, avatar)
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Trophy,
  PlusCircle,
  FolderOpen,
  FileCheck2,
  Award,
  User,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit,
  Trash2,
  Send,
  Eye,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  DiscoveryItem,
  DiscoveryCompetition,
  CompetitionRegistration,
  CompetitionSubmission,
} from '../types/discovery';
import { discoveryApi } from '../lib/discoveryApi';
import { useStudentAuth } from '../context/StudentAuthContext';
import { DiscoveryEditor } from '../components/DiscoveryEditor';
import { CompetitionSubmissionModal } from '../components/CompetitionSubmissionModal';
import { useToast } from '../../components/Toast';

interface StudentDashboardProps {
  navigate: (path: string) => void;
  initialTab?: string;
}

type DashboardTab =
  | 'overview'
  | 'competitions'
  | 'create'
  | 'my_discoveries'
  | 'published'
  | 'achievements'
  | 'profile';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  navigate,
  initialTab = 'overview',
}) => {
  const { student, isAuthenticated, login, register, logout, updateProfile } = useStudentAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<DashboardTab>(
    (initialTab as DashboardTab) || 'overview'
  );

  // Student Data
  const [studentDiscoveries, setStudentDiscoveries] = useState<DiscoveryItem[]>([]);
  const [registrations, setRegistrations] = useState<CompetitionRegistration[]>([]);
  const [competitions, setCompetitions] = useState<DiscoveryCompetition[]>([]);
  const [compSubmissions, setCompSubmissions] = useState<CompetitionSubmission[]>([]);
  const [activeCompSubmissionTarget, setActiveCompSubmissionTarget] = useState<{
    competition: DiscoveryCompetition;
    registration: CompetitionRegistration;
    existingSubmission?: CompetitionSubmission | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Discovery Editor State
  const [editingItem, setEditingItem] = useState<DiscoveryItem | null>(null);

  // Auth Form State (for unauthenticated visitors)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authCollege, setAuthCollege] = useState('');

  // Status Filter in "My Discoveries"
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (student) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [student?.id]);

  const loadDashboardData = async () => {
    if (!student) return;
    setLoading(true);
    try {
      const [discs, regs, comps, subs] = await Promise.all([
        discoveryApi.getStudentDiscoveries(student.id),
        discoveryApi.getStudentRegistrations(student.id),
        discoveryApi.getCompetitions(),
        discoveryApi.getStudentCompetitionSubmissions(student.id),
      ]);
      setStudentDiscoveries(discs);
      setRegistrations(regs);
      setCompetitions(comps);
      setCompSubmissions(subs);
    } catch (e) {
      console.error('Failed to load student dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  // Auth Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) {
      showToast('Please enter your email', 'error');
      return;
    }
    if (authMode === 'register') {
      if (!authName.trim() || !authCollege.trim()) {
        showToast('Please provide your name and college', 'error');
        return;
      }
      await register(authName, authEmail, authCollege);
      showToast('Student account created! Welcome to Menu Maps Discovery.', 'success');
    } else {
      await login(authEmail);
      showToast('Welcome back to your creator dashboard!', 'success');
    }
  };

  // Delete Draft Handler
  const handleDeleteDraft = async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;
    try {
      await discoveryApi.deleteDiscovery(id, student?.id || '');
      showToast('Draft deleted', 'success');
      loadDashboardData();
    } catch (e) {
      showToast('Failed to delete draft', 'error');
    }
  };

  // Real Metrics from Database
  const totalCreated = studentDiscoveries.length;
  const draftCount = studentDiscoveries.filter((d) => d.status === 'Draft').length;
  const pendingCount = studentDiscoveries.filter(
    (d) => d.status === 'Pending Approval' || d.status === 'Under Review'
  ).length;
  const publishedCount = studentDiscoveries.filter((d) => d.status === 'Published').length;
  const rejectedCount = studentDiscoveries.filter((d) => d.status === 'Rejected').length;
  const competitionsJoined = registrations.length;

  // Unauthenticated Login / Register Screen
  if (!isAuthenticated || !student) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#FAFAF7]">
        <div className="bg-white rounded-3xl border border-[#E7E2DA] max-w-md w-full p-6 sm:p-8 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[#1FB5A0] flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-stone-900">
              {authMode === 'login' ? 'Student Dashboard Login' : 'Register as Student Contributor'}
            </h2>
            <p className="text-xs text-stone-500">
              Access your competitions, create verified food discoveries, and manage portfolio credits.
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Rohan Mehra"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    College / University
                  </label>
                  <input
                    type="text"
                    required
                    value={authCollege}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Kirori Mal College, DU"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {authMode === 'login' ? 'Open Dashboard' : 'Complete Registration'}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-stone-500">
            {authMode === 'login' ? (
              <span>
                New student?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="font-bold text-[#1FB5A0] hover:underline"
                >
                  Create contributor account
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="font-bold text-[#1FB5A0] hover:underline"
                >
                  Log in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active Editor View (when creating or editing a discovery)
  if (activeTab === 'create') {
    return (
      <div className="min-h-screen bg-[#FAFAF7] p-4 sm:p-8">
        <DiscoveryEditor
          initialDiscovery={editingItem}
          onSaved={() => {
            setEditingItem(null);
            setActiveTab('my_discoveries');
            loadDashboardData();
          }}
          onCancel={() => {
            setEditingItem(null);
            setActiveTab('overview');
          }}
        />
      </div>
    );
  }

  const displayName = student?.name || student?.email?.split('@')[0] || 'Student Explorer';
  const displayInit = displayName.charAt(0).toUpperCase();
  const displayCollege = student?.college_university || 'Student Contributor';
  const studentPoints = student?.points ?? 50;
  const studentBadges = Array.isArray(student?.badges) && student.badges.length > 0 ? student.badges : ['Campus Contributor'];

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1C1917]">
      {/* Top Bar with Student Info */}
      <header className="bg-white border-b border-[#E7E2DA] sticky top-16 sm:top-20 z-30">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1FB5A0] text-white flex items-center justify-center font-bold text-xs">
              {displayInit}
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 leading-tight">{displayName}</div>
              <div className="text-[10px] text-stone-500">{displayCollege}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingItem(null);
                setActiveTab('create');
              }}
              className="px-4 py-2 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Discovery</span>
            </button>

            <button
              onClick={logout}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Navigation Sidebar (Desktop) & Top Tabs (Mobile) */}
          <aside className="lg:col-span-3">
            <nav className="bg-white rounded-3xl border border-[#E7E2DA] p-3 sm:p-4 space-y-1 shadow-xs flex lg:flex-col overflow-x-auto no-scrollbar">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'competitions', label: 'My Competitions', icon: Trophy, badge: competitionsJoined },
                { id: 'my_discoveries', label: 'My Discoveries', icon: FolderOpen, badge: totalCreated },
                { id: 'published', label: 'Published Discoveries', icon: FileCheck2, badge: publishedCount },
                { id: 'achievements', label: 'My Achievements', icon: Award },
                { id: 'profile', label: 'My Profile', icon: User },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as DashboardTab)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#1FB5A0] text-white shadow-xs'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Dashboard Content Area */}
          <main className="lg:col-span-9 space-y-8">
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Welcome Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-[#1FB5A0] to-teal-800 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-200">
                      Menu Maps Creator Workspace
                    </span>
                    <h2 className="text-2xl font-black">Welcome, {displayName}!</h2>
                    <p className="text-xs text-teal-100 max-w-md">
                      Explore Delhi markets, document authentic counter prices, and earn official credits for your portfolio.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setActiveTab('create');
                    }}
                    className="px-5 py-2.5 rounded-full bg-white text-stone-900 hover:bg-stone-100 text-xs font-bold shadow-md cursor-pointer shrink-0"
                  >
                    Create a Discovery
                  </button>
                </div>

                {/* Real Statistics Grid (From Real Database/Storage) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E2DA] space-y-1">
                    <div className="text-[11px] text-stone-500 font-bold uppercase">Competitions</div>
                    <div className="text-2xl font-black text-stone-900">{competitionsJoined}</div>
                    <div className="text-[10px] text-stone-400">Active joined</div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E2DA] space-y-1">
                    <div className="text-[11px] text-stone-500 font-bold uppercase">Total Created</div>
                    <div className="text-2xl font-black text-stone-900">{totalCreated}</div>
                    <div className="text-[10px] text-stone-400">Discoveries documented</div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E2DA] space-y-1">
                    <div className="text-[11px] text-amber-700 font-bold uppercase">Pending Review</div>
                    <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
                    <div className="text-[10px] text-amber-600/80">In admin review queue</div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E2DA] space-y-1">
                    <div className="text-[11px] text-emerald-700 font-bold uppercase">Published</div>
                    <div className="text-2xl font-black text-[#1FB5A0]">{publishedCount}</div>
                    <div className="text-[10px] text-emerald-600/80">Live on /discovery</div>
                  </div>
                </div>

                {/* Recent Discoveries Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-stone-900">Recent Discoveries</h3>
                    <button
                      onClick={() => setActiveTab('my_discoveries')}
                      className="text-xs font-bold text-[#1FB5A0] hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  {studentDiscoveries.length === 0 ? (
                    <div className="p-8 rounded-3xl bg-white border border-[#E7E2DA] text-center space-y-3">
                      <FolderOpen className="w-10 h-10 text-stone-300 mx-auto" />
                      <div className="text-sm font-bold text-stone-800">You haven&apos;t created any discoveries yet</div>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto">
                        Document your first local food place or hidden gem and submit it for review.
                      </p>
                      <button
                        onClick={() => {
                          setEditingItem(null);
                          setActiveTab('create');
                        }}
                        className="px-5 py-2.5 rounded-full bg-[#1FB5A0] text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Create Your First Discovery
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {studentDiscoveries.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-white border border-[#E7E2DA] flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.main_image}
                              alt={item.title}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                            <div>
                              <div className="text-xs font-bold text-stone-900">{item.title}</div>
                              <div className="text-[10px] text-stone-500">
                                {item.locality} • {item.category}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                item.status === 'Published'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.status === 'Pending Approval'
                                  ? 'bg-amber-100 text-amber-800'
                                  : item.status === 'Changes Requested'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-stone-100 text-stone-700'
                              }`}
                            >
                              {item.status}
                            </span>
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setActiveTab('create');
                              }}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. MY COMPETITIONS TAB */}
            {activeTab === 'competitions' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-stone-900">My Joined Competitions</h3>
                  <p className="text-xs text-stone-500">
                    Track guidelines, submit mission deliverables, and earn portfolio scores.
                  </p>
                </div>

                {registrations.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-white border border-[#E7E2DA] text-center space-y-3">
                    <Trophy className="w-10 h-10 text-stone-300 mx-auto" />
                    <div className="text-sm font-bold text-stone-800">You haven&apos;t joined any competitions yet</div>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Explore Season 01 flagship challenges: The Great Market Mission and The Foodverse Challenge.
                    </p>
                    <button
                      onClick={() => navigate('/competitions')}
                      className="px-5 py-2.5 rounded-full bg-[#1FB5A0] text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Browse Season 01 Competitions
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {registrations.map((reg) => {
                      const comp = competitions.find((c) => c.id === reg.competition_id || c.slug === reg.competition_id);
                      const sub = compSubmissions.find((s) => s.competition_id === reg.competition_id);
                      const isEvaluated = sub?.status === 'Evaluated';
                      const isSubmitted = sub?.status === 'Submitted';
                      const isDraft = sub?.status === 'Draft';

                      return (
                        <div
                          key={reg.id}
                          className="bg-white rounded-3xl border border-[#E7E2DA] p-6 space-y-4 shadow-xs flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#1FB5A0] text-[10px] font-black uppercase">
                                {reg.participation_mode === 'team' ? `Team: ${reg.team_name}` : 'Individual'}
                              </span>
                              <span className="text-[10px] text-stone-400">
                                Joined {new Date(reg.registered_at).toLocaleDateString()}
                              </span>
                            </div>

                            <h4 className="text-base font-black text-stone-900">{reg.competition_title}</h4>
                            {comp && <p className="text-xs text-stone-600 line-clamp-2">{comp.description}</p>}

                            {/* Submission Status Pill */}
                            <div className="pt-2">
                              {isEvaluated && (
                                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                                  <div className="flex items-center justify-between font-black">
                                    <span className="flex items-center gap-1.5">
                                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Official Score</span>
                                    </span>
                                    <span className="text-sm text-emerald-700">{sub.total_score} / 100 pts</span>
                                  </div>
                                  {sub.recognition_award && (
                                    <div className="text-[11px] font-bold text-amber-800">
                                      🏆 {sub.recognition_award}
                                    </div>
                                  )}
                                </div>
                              )}

                              {isSubmitted && !isEvaluated && (
                                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-bold flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>Submitted for Evaluation • Awaiting Jury Review</span>
                                </div>
                              )}

                              {isDraft && (
                                <div className="p-2.5 rounded-xl bg-stone-100 text-xs text-stone-600 font-medium">
                                  📝 Draft Saved • Not submitted yet
                                </div>
                              )}

                              {!sub && (
                                <div className="text-[11px] text-stone-400 font-medium">
                                  ⚪ No submission recorded yet. Complete your missions and submit before the deadline.
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                            {comp ? (
                              <button
                                onClick={() =>
                                  setActiveCompSubmissionTarget({
                                    competition: comp,
                                    registration: reg,
                                    existingSubmission: sub,
                                  })
                                }
                                className="px-4 py-2 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                              >
                                <Trophy className="w-3.5 h-3.5" />
                                <span>
                                  {isEvaluated
                                    ? 'View Score & Feedback'
                                    : isSubmitted
                                    ? 'View / Edit Submission'
                                    : isDraft
                                    ? 'Continue Submission'
                                    : 'Submit Missions / Project'}
                                </span>
                              </button>
                            ) : null}

                            <button
                              onClick={() => navigate('/competitions')}
                              className="text-xs font-bold text-stone-500 hover:text-stone-900 px-2 py-1"
                            >
                              Rules →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. MY DISCOVERIES TAB */}
            {activeTab === 'my_discoveries' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-stone-900">My Discoveries</h3>
                    <p className="text-xs text-stone-500">
                      Manage all your drafts, pending approvals, and reviewed submissions.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setActiveTab('create');
                    }}
                    className="px-4 py-2 rounded-full bg-[#1FB5A0] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs self-start sm:self-auto cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>New Discovery</span>
                  </button>
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {['all', 'Draft', 'Pending Approval', 'Changes Requested', 'Rejected', 'Published'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                          statusFilter === st
                            ? 'bg-stone-900 text-white'
                            : 'bg-white border border-[#E7E2DA] text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {st === 'all' ? 'All Statuses' : st}
                      </button>
                    )
                  )}
                </div>

                {/* Discoveries List */}
                <div className="space-y-4">
                  {studentDiscoveries
                    .filter((d) => statusFilter === 'all' || d.status === statusFilter)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-3xl border border-[#E7E2DA] p-5 sm:p-6 space-y-3 shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={item.main_image}
                              alt={item.title}
                              className="w-16 h-16 rounded-2xl object-cover shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    item.status === 'Published'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : item.status === 'Pending Approval'
                                      ? 'bg-amber-100 text-amber-800'
                                      : item.status === 'Changes Requested'
                                      ? 'bg-rose-100 text-rose-800'
                                      : item.status === 'Rejected'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-stone-100 text-stone-700'
                                  }`}
                                >
                                  {item.status}
                                </span>
                                <span className="text-[10px] text-stone-400">
                                  Updated {new Date(item.updated_at).toLocaleDateString()}
                                </span>
                              </div>

                              <h4 className="text-base font-bold text-stone-900 mt-1">{item.title}</h4>
                              <div className="text-xs text-stone-500">
                                {item.locality} {item.dish_name ? `• ${item.dish_name}` : ''}
                                {item.price !== undefined ? ` (₹${item.price})` : ''}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {item.status === 'Published' ? (
                              <button
                                onClick={() => navigate(`/discovery/${item.slug}`)}
                                className="px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>View Live</span>
                              </button>
                            ) : null}

                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setActiveTab('create');
                              }}
                              className="px-3.5 py-1.5 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>{item.status === 'Published' ? 'Request Edit' : 'Edit'}</span>
                            </button>

                            {item.status === 'Draft' && (
                              <button
                                onClick={() => handleDeleteDraft(item.id)}
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-full"
                                title="Delete Draft"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Admin Feedback Box if changes requested or rejected */}
                        {item.admin_feedback && (
                          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Review Feedback from Admin:</span>
                            </div>
                            <p className="leading-relaxed pl-5">{item.admin_feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 4. PUBLISHED DISCOVERIES TAB */}
            {activeTab === 'published' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-stone-900">My Published Discoveries</h3>
                  <p className="text-xs text-stone-500">
                    Live food discoveries credited to your name on Menu Maps.
                  </p>
                </div>

                {publishedCount === 0 ? (
                  <div className="p-8 rounded-3xl bg-white border border-[#E7E2DA] text-center space-y-3">
                    <FileCheck2 className="w-10 h-10 text-stone-300 mx-auto" />
                    <div className="text-sm font-bold text-stone-800">No published discoveries yet</div>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Once your submissions are reviewed and approved by the admin, they will appear here and on the public /discovery feed.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {studentDiscoveries
                      .filter((d) => d.status === 'Published')
                      .map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-3xl border border-[#E7E2DA] p-5 space-y-4 shadow-xs flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="h-40 rounded-2xl overflow-hidden bg-stone-100">
                              <img
                                src={item.main_image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h4 className="text-base font-bold text-stone-900">{item.title}</h4>
                            <div className="text-xs text-stone-500">
                              {item.locality} • Published on{' '}
                              {item.published_at ? new Date(item.published_at).toLocaleDateString() : ''}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                            <button
                              onClick={() => navigate(`/discovery/${item.slug}`)}
                              className="px-4 py-2 rounded-full bg-[#1FB5A0] text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <span>View Live Story</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setActiveTab('create');
                              }}
                              className="text-xs font-bold text-stone-600 hover:text-stone-900"
                            >
                              Request Changes
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. ACHIEVEMENTS & CERTIFICATES TAB */}
            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-stone-900">My Achievements & Portfolio</h3>
                  <p className="text-xs text-stone-500">
                    Official credits earned for verified food discoveries and competition milestones.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-3xl bg-white border border-[#E7E2DA] space-y-2 text-center">
                    <Award className="w-8 h-8 text-[#FFC84A] mx-auto" />
                    <div className="text-xs text-stone-500 font-bold uppercase">Contribution Score</div>
                    <div className="text-3xl font-black text-stone-900">{studentPoints} pts</div>
                  </div>

                  <div className="p-5 rounded-3xl bg-white border border-[#E7E2DA] space-y-2 text-center">
                    <ShieldCheck className="w-8 h-8 text-[#1FB5A0] mx-auto" />
                    <div className="text-xs text-stone-500 font-bold uppercase">Verified Submissions</div>
                    <div className="text-3xl font-black text-[#1FB5A0]">{publishedCount}</div>
                  </div>

                  <div className="p-5 rounded-3xl bg-white border border-[#E7E2DA] space-y-2 text-center">
                    <Trophy className="w-8 h-8 text-[#FF6B4A] mx-auto" />
                    <div className="text-xs text-stone-500 font-bold uppercase">Badges Earned</div>
                    <div className="text-3xl font-black text-stone-900">{studentBadges.length}</div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-[#E7E2DA] space-y-3">
                  <h4 className="text-sm font-bold text-stone-900">Earned Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {studentBadges.map((b, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-[#1FB5A0] text-xs font-bold flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{b}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6. PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-stone-900">Student Profile</h3>
                  <p className="text-xs text-stone-500">Your public contributor attribution details.</p>
                </div>

                <div className="bg-white rounded-3xl border border-[#E7E2DA] p-6 space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={student?.name || ''}
                      onChange={(e) => updateProfile({ name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Email</label>
                    <input
                      type="email"
                      disabled
                      value={student?.email || ''}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] bg-stone-50 text-xs font-medium text-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      College / University
                    </label>
                    <input
                      type="text"
                      value={student?.college_university || ''}
                      onChange={(e) => updateProfile({ college_university: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Bio (Optional)</label>
                    <textarea
                      rows={3}
                      value={student?.bio || ''}
                      onChange={(e) => updateProfile({ bio: e.target.value })}
                      placeholder="e.g. History enthusiast and street food hunter..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] text-xs resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast('Profile details updated!', 'success')}
                    className="px-5 py-2.5 rounded-full bg-[#1FB5A0] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Dedicated Competition Submission Modal */}
      {activeCompSubmissionTarget && (
        <CompetitionSubmissionModal
          competition={activeCompSubmissionTarget.competition}
          registration={activeCompSubmissionTarget.registration}
          existingSubmission={activeCompSubmissionTarget.existingSubmission}
          onClose={() => setActiveCompSubmissionTarget(null)}
          onSaved={() => loadDashboardData()}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
