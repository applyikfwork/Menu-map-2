/**
 * Menu Maps Discovery - "My Discovery" Student Dashboard (/discovery/dashboard)
 * Comprehensive, production-grade student portal for competitions, submissions,
 * food discoveries, food trails, credits, passport stamps, and profile settings.
 */

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Trophy,
  FileText,
  UtensilsCrossed,
  MapPin,
  Coins,
  ShieldCheck,
  User,
  Plus,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Upload,
  Calendar,
  Building,
  Layers,
  Award,
  ChevronRight,
  Info,
  LogOut,
  Save,
} from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';
import { PassportWidget } from '../components/PassportWidget';
import { discoveryApi } from '../lib/discoveryApi';
import {
  calculateContributorLevel,
  evaluateStudentStamps,
  OFFICIAL_PASSPORT_STAMPS,
} from '../lib/discoveryPassport';
import { compressImageFile } from '../../lib/imageCompressor';
import {
  CompetitionRegistration,
  CompetitionSubmission,
  FoodDiscoveryItem,
  StudentFoodTrail,
  FoodTrailStop,
  ContributionCredit,
  DiscoveryCompetition,
  CompetitionTeam,
  ProjectCategory,
} from '../types/discovery';

interface StudentDashboardProps {
  navigate: (path: string) => void;
  initialTab?: string;
}

type DashboardTab =
  | 'overview'
  | 'competitions'
  | 'submissions'
  | 'discoveries'
  | 'trails'
  | 'credits'
  | 'passport'
  | 'profile';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  navigate,
  initialTab = 'overview',
}) => {
  const { student, loading: authLoading, logout, updateProfile } = useStudentAuth();

  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    const validTabs: DashboardTab[] = [
      'overview',
      'competitions',
      'submissions',
      'discoveries',
      'trails',
      'credits',
      'passport',
      'profile',
    ];
    return validTabs.includes(initialTab as DashboardTab)
      ? (initialTab as DashboardTab)
      : 'overview';
  });

  // Data states
  const [registrations, setRegistrations] = useState<CompetitionRegistration[]>([]);
  const [competitionsMap, setCompetitionsMap] = useState<Record<string, DiscoveryCompetition>>({});
  const [submissions, setSubmissions] = useState<CompetitionSubmission[]>([]);
  const [foodDiscoveries, setFoodDiscoveries] = useState<FoodDiscoveryItem[]>([]);
  const [foodTrails, setFoodTrails] = useState<StudentFoodTrail[]>([]);
  const [credits, setCredits] = useState<ContributionCredit[]>([]);
  const [availableCompetitions, setAvailableCompetitions] = useState<DiscoveryCompetition[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Modals & form state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionCompId, setSubmissionCompId] = useState('');
  const [submissionTitle, setSubmissionTitle] = useState('');
  const [submissionCategory, setSubmissionCategory] = useState<ProjectCategory>('Digital Prototype');
  const [submissionDescription, setSubmissionDescription] = useState('');
  const [submissionSummary, setSubmissionSummary] = useState('');
  const [submissionPrototypeUrl, setSubmissionPrototypeUrl] = useState('');
  const [submissionVideoUrl, setSubmissionVideoUrl] = useState('');
  const [submissionCoverUrl, setSubmissionCoverUrl] = useState('');
  const [submittingProject, setSubmittingProject] = useState(false);

  // New Discovery Form State
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [discPlaceName, setDiscPlaceName] = useState('');
  const [discNeighbourhood, setDiscNeighbourhood] = useState('');
  const [discAddress, setDiscAddress] = useState('');
  const [discCategory, setDiscCategory] = useState('Hidden Gem Cafe');
  const [discFeaturedDish, setDiscFeaturedDish] = useState('');
  const [discCounterPrice, setDiscCounterPrice] = useState('');
  const [discEvidence, setDiscEvidence] = useState('');
  const [discPhotoUrl, setDiscPhotoUrl] = useState('');
  const [discAttribution, setDiscAttribution] = useState<'With Name' | 'Anonymous' | 'With College'>('With Name');
  const [submittingDiscovery, setSubmittingDiscovery] = useState(false);

  // New Trail Form State
  const [showTrailModal, setShowTrailModal] = useState(false);
  const [trailTitle, setTrailTitle] = useState('');
  const [trailNeighbourhood, setTrailNeighbourhood] = useState('');
  const [trailDuration, setTrailDuration] = useState('2 hours (Walking Trail)');
  const [trailBudget, setTrailBudget] = useState('250');
  const [trailDescription, setTrailDescription] = useState('');
  const [trailStops, setTrailStops] = useState<FoodTrailStop[]>([
    {
      stop_number: 1,
      place_name: '',
      landmark: '',
      must_try_dish: '',
      estimated_price: 60,
      why_special: '',
    },
    {
      stop_number: 2,
      place_name: '',
      landmark: '',
      must_try_dish: '',
      estimated_price: 120,
      why_special: '',
    },
  ]);
  const [submittingTrail, setSubmittingTrail] = useState(false);

  // Profile Edit State
  const [editFullName, setEditFullName] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editProgramme, setEditProgramme] = useState('');
  const [editStudyYear, setEditStudyYear] = useState<any>('1st Year');
  const [editCity, setEditCity] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editAttributionConsent, setEditAttributionConsent] = useState(true);
  const [editCollegeConsent, setEditCollegeConsent] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Copy Feedback state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !student) {
      navigate('/discovery/login');
      return;
    }

    if (student) {
      loadAllDashboardData(student.id);
      // Initialize profile edit values
      setEditFullName(student.full_name || '');
      setEditCollege(student.college_name || '');
      setEditProgramme(student.programme || '');
      setEditStudyYear(student.study_year || '1st Year');
      setEditCity(student.city || 'Delhi NCR');
      setEditBio(student.bio || '');
      setEditTitle(student.contributor_title || '');
      setEditIsPublic(student.is_public_profile ?? true);
      setEditAttributionConsent(student.public_consent_attribution ?? true);
      setEditCollegeConsent(student.public_consent_college ?? true);
    }
  }, [student, authLoading]);

  const loadAllDashboardData = async (studentId: string) => {
    setLoadingData(true);
    try {
      const [regs, comps, subs, discs, trls, crds] = await Promise.all([
        discoveryApi.getStudentRegistrations(studentId),
        discoveryApi.getCompetitions(false),
        discoveryApi.getStudentSubmissions(studentId),
        discoveryApi.getStudentFoodDiscoveries(studentId),
        discoveryApi.getFoodTrails(false),
        discoveryApi.getStudentCredits(studentId),
      ]);

      setRegistrations(regs);
      setAvailableCompetitions(comps);
      setSubmissions(subs);
      setFoodDiscoveries(discs);
      setCredits(crds);

      // Student's own food trails
      const myTrails = trls.filter((t) => t.student_id === studentId);
      setFoodTrails(myTrails);

      // Map of competition objects
      const cMap: Record<string, DiscoveryCompetition> = {};
      comps.forEach((c) => {
        cMap[c.id] = c;
      });
      setCompetitionsMap(cMap);
    } catch (e) {
      console.error('Error loading student dashboard data', e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Image Upload helper
  const handleImageFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1200, 600 * 1024);
      setter(compressed.dataUrl);
    } catch (err) {
      console.error('Failed to compress image:', err);
      alert('Could not compress image. Please choose another picture.');
    }
  };

  // 1. Submit Project Handler
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    if (!submissionCompId || !submissionTitle.trim() || !submissionDescription.trim()) {
      alert('Please fill in the competition, project title, and description.');
      return;
    }

    setSubmittingProject(true);
    try {
      const selectedComp = competitionsMap[submissionCompId];
      const newSub: CompetitionSubmission = {
        id: 'sub_' + crypto.randomUUID(),
        reference_id: 'MM-SUB-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        competition_id: submissionCompId,
        student_id: student.id,
        title: submissionTitle.trim(),
        description: submissionDescription.trim(),
        project_summary: submissionSummary.trim() || submissionDescription.slice(0, 160),
        attachments: submissionCoverUrl
          ? [
              {
                name: 'Cover / Visual Asset',
                file_url: submissionCoverUrl,
                file_type: 'image/jpeg',
              },
            ]
          : [],
        external_prototype_url: submissionPrototypeUrl.trim() || undefined,
        external_video_url: submissionVideoUrl.trim() || undefined,
        status: 'Submitted',
        submitted_at: new Date().toISOString(),
        is_published_to_gallery: false,
      };

      await discoveryApi.submitProject(newSub);

      // Award +50 submission credit
      await discoveryApi.awardCredit({
        id: 'crd_' + crypto.randomUUID(),
        student_id: student.id,
        category: 'Competition Credit',
        points: 50,
        title: `Project Submission: ${newSub.title}`,
        description: `Delivered submission for ${selectedComp?.title || 'Competition'}.`,
        awarded_by: 'Menu Maps Engine',
        reference_type: 'competition',
        reference_id: newSub.id,
        awarded_at: new Date().toISOString(),
      });

      // Reset & Reload
      setShowSubmitModal(false);
      setSubmissionTitle('');
      setSubmissionDescription('');
      setSubmissionSummary('');
      setSubmissionPrototypeUrl('');
      setSubmissionVideoUrl('');
      setSubmissionCoverUrl('');
      await loadAllDashboardData(student.id);
      setActiveTab('submissions');
    } catch (err) {
      console.error('Failed to submit project', err);
      alert('Failed to submit project. Please try again.');
    } finally {
      setSubmittingProject(false);
    }
  };

  // 2. Submit Discovery Handler
  const handleDiscoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    if (!discPlaceName.trim() || !discNeighbourhood.trim() || !discFeaturedDish.trim()) {
      alert('Please fill in the place name, neighbourhood, and signature dish.');
      return;
    }

    setSubmittingDiscovery(true);
    try {
      const newDisc: FoodDiscoveryItem = {
        id: 'disc_' + crypto.randomUUID(),
        student_id: student.id,
        contributor_name: student.full_name,
        food_place_name: discPlaceName.trim(),
        neighbourhood: discNeighbourhood.trim(),
        full_address: discAddress.trim() || discNeighbourhood.trim() + ', Delhi NCR',
        category: discCategory,
        featured_dish: discFeaturedDish.trim(),
        counter_price_observed: discCounterPrice ? parseInt(discCounterPrice, 10) : undefined,
        evidence_description: discEvidence.trim() || 'Verified in person at counter.',
        photo_urls: discPhotoUrl ? [discPhotoUrl] : [],
        verification_status: 'Student Submitted',
        public_attribution_preference: discAttribution,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await discoveryApi.submitFoodDiscovery(newDisc);

      // Award +50 discovery submission credit
      await discoveryApi.awardCredit({
        id: 'crd_' + crypto.randomUUID(),
        student_id: student.id,
        category: 'Food Discovery Credit',
        points: 50,
        title: `Food Discovery Submitted: ${newDisc.food_place_name}`,
        description: `Logged honest discovery of ${newDisc.featured_dish} in ${newDisc.neighbourhood}.`,
        awarded_by: 'Menu Maps Verification Desk',
        reference_type: 'food_discovery',
        reference_id: newDisc.id,
        awarded_at: new Date().toISOString(),
      });

      setShowDiscoveryModal(false);
      setDiscPlaceName('');
      setDiscNeighbourhood('');
      setDiscAddress('');
      setDiscFeaturedDish('');
      setDiscCounterPrice('');
      setDiscEvidence('');
      setDiscPhotoUrl('');
      await loadAllDashboardData(student.id);
      setActiveTab('discoveries');
    } catch (err) {
      console.error('Failed to submit discovery', err);
      alert('Failed to submit discovery. Please try again.');
    } finally {
      setSubmittingDiscovery(false);
    }
  };

  // 3. Submit Food Trail Handler
  const handleTrailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    if (!trailTitle.trim() || !trailNeighbourhood.trim()) {
      alert('Please provide a title and neighbourhood for your food trail.');
      return;
    }

    setSubmittingTrail(true);
    try {
      const slug = trailTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const newTrail: StudentFoodTrail = {
        id: 'trail_' + crypto.randomUUID(),
        title: trailTitle.trim(),
        slug: slug + '-' + Math.random().toString(36).substring(2, 6),
        neighbourhood: trailNeighbourhood.trim(),
        description: trailDescription.trim() || `Curated student food crawl across ${trailNeighbourhood}.`,
        cover_image_url:
          'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1200&q=80',
        student_id: student.id,
        creator_name: student.full_name,
        creator_college: student.college_name,
        total_duration_estimate: trailDuration,
        budget_estimate_for_one: parseInt(trailBudget, 10) || 250,
        stops: trailStops.filter((s) => s.place_name.trim().length > 0),
        status: 'Submitted',
        created_at: new Date().toISOString(),
      };

      await discoveryApi.saveFoodTrail(newTrail);

      // Award +75 trail credit
      await discoveryApi.awardCredit({
        id: 'crd_' + crypto.randomUUID(),
        student_id: student.id,
        category: 'Food Trail Credit',
        points: 75,
        title: `Food Trail Created: ${newTrail.title}`,
        description: `Designed a ${newTrail.stops.length}-stop trail in ${newTrail.neighbourhood}.`,
        awarded_by: 'Menu Maps Trail Review',
        reference_type: 'trail',
        reference_id: newTrail.id,
        awarded_at: new Date().toISOString(),
      });

      setShowTrailModal(false);
      setTrailTitle('');
      setTrailNeighbourhood('');
      setTrailDescription('');
      await loadAllDashboardData(student.id);
      setActiveTab('trails');
    } catch (err) {
      console.error('Failed to submit trail', err);
      alert('Failed to submit food trail.');
    } finally {
      setSubmittingTrail(false);
    }
  };

  // 4. Update Profile Settings
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setSavingProfile(true);
    setProfileSuccessMsg('');
    try {
      const res = await updateProfile({
        full_name: editFullName.trim(),
        college_name: editCollege.trim(),
        programme: editProgramme.trim(),
        study_year: editStudyYear,
        city: editCity.trim(),
        bio: editBio.trim(),
        contributor_title: editTitle.trim(),
        is_public_profile: editIsPublic,
        public_consent_attribution: editAttributionConsent,
        public_consent_college: editCollegeConsent,
      });

      if (res.success) {
        setProfileSuccessMsg('Profile settings updated successfully!');
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      } else {
        alert(res.error || 'Failed to update profile');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  if (authLoading || !student) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Level Progression details
  const levelInfo = calculateContributorLevel(
    student.total_contributions_count,
    student.total_credits,
    student.contributor_level
  );

  const tabs: Array<{ id: DashboardTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'overview', label: 'Overview', icon: <Compass className="w-4 h-4" /> },
    {
      id: 'competitions',
      label: 'My Competitions',
      icon: <Trophy className="w-4 h-4" />,
      badge: registrations.length,
    },
    {
      id: 'submissions',
      label: 'My Submissions',
      icon: <FileText className="w-4 h-4" />,
      badge: submissions.length,
    },
    {
      id: 'discoveries',
      label: 'Food Discoveries',
      icon: <UtensilsCrossed className="w-4 h-4" />,
      badge: foodDiscoveries.length,
    },
    {
      id: 'trails',
      label: 'Food Trails',
      icon: <MapPin className="w-4 h-4" />,
      badge: foodTrails.length,
    },
    {
      id: 'credits',
      label: 'Credits & Points',
      icon: <Coins className="w-4 h-4" />,
      badge: student.total_credits,
    },
    { id: 'passport', label: 'Discovery Passport', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile & Privacy', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar navigate={navigate} activeTab="my_discovery" />

      {/* Profile Header Hero */}
      <section className="bg-white border-b border-stone-200/80 pt-8 pb-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#14B8A6] text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white shrink-0">
              {student.full_name ? student.full_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {student.full_name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-[#0F766E] border border-teal-200">
                  {student.contributor_level}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 font-medium flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-stone-400" />
                  {student.college_name || 'Delhi University'}
                </span>
                <span className="text-stone-300">•</span>
                <span>{student.programme} ({student.study_year})</span>
              </p>
              {student.contributor_title && (
                <p className="text-xs text-[#FF5A36] font-semibold mt-1">
                  ★ {student.contributor_title}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {student.is_public_profile && student.portfolio_slug && (
              <button
                onClick={() => navigate(`/discovery/contributors/${student.portfolio_slug}`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-white hover:border-stone-300 transition-colors shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                <span>View Public Portfolio</span>
              </button>
            )}
            <button
              onClick={() => {
                logout();
                navigate('/discovery');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:text-red-700 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-stone-100 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0F766E] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Tab Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Contributor Level Progress Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                    Current Contributor Tier
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 mt-2">
                    {student.contributor_level}
                  </h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {levelInfo.nextLevelName
                      ? `Next Milestone: ${levelInfo.nextLevelName}`
                      : 'Maximum community distinction reached!'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-serif text-3xl font-extrabold text-[#0F766E]">
                    {student.total_credits}
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                    Total Credits Earned
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(8, levelInfo.nextLevelProgressPercent))}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-stone-500 font-medium">
                <span>{levelInfo.nextLevelProgressPercent}% Completed</span>
                <span>
                  {levelInfo.nextLevelName ? `Towards ${levelInfo.nextLevelName}` : 'Leader Status'}
                </span>
              </div>
            </div>

            {/* Metric Counters Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center mb-3">
                  <Coins className="w-5 h-5" />
                </div>
                <div className="font-serif text-2xl font-bold text-stone-900">{student.total_credits}</div>
                <p className="text-xs text-stone-500 mt-0.5">Contribution Credits</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="font-serif text-2xl font-bold text-stone-900">{registrations.length}</div>
                <p className="text-xs text-stone-500 mt-0.5">Competitions Joined</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="font-serif text-2xl font-bold text-stone-900">{submissions.length}</div>
                <p className="text-xs text-stone-500 mt-0.5">Projects Submitted</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div className="font-serif text-2xl font-bold text-stone-900">{foodDiscoveries.length}</div>
                <p className="text-xs text-stone-500 mt-0.5">Food Discoveries</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="p-5 rounded-2xl bg-[#0F766E] text-white text-left hover:bg-[#0d635c] transition-all shadow-sm flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm">Submit Project</h4>
                    <p className="text-xs text-teal-100 mt-0.5">Deliver work for registered challenge</p>
                  </div>
                  <Plus className="w-5 h-5 shrink-0" />
                </button>

                <button
                  onClick={() => setShowDiscoveryModal(true)}
                  className="p-5 rounded-2xl bg-white border border-stone-200 text-left hover:border-stone-300 hover:shadow-xs transition-all flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">Add Food Discovery</h4>
                    <p className="text-xs text-stone-500 mt-0.5">Submit a local gem (+50 credits)</p>
                  </div>
                  <UtensilsCrossed className="w-5 h-5 text-[#FF5A36] shrink-0" />
                </button>

                <button
                  onClick={() => setShowTrailModal(true)}
                  className="p-5 rounded-2xl bg-white border border-stone-200 text-left hover:border-stone-300 hover:shadow-xs transition-all flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">Build Food Trail</h4>
                    <p className="text-xs text-stone-500 mt-0.5">Curate a student crawl (+75 credits)</p>
                  </div>
                  <MapPin className="w-5 h-5 text-amber-600 shrink-0" />
                </button>
              </div>
            </div>

            {/* Recent Submissions Snippet */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-lg font-bold text-stone-900">Recent Submissions</h3>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className="text-xs font-semibold text-[#0F766E] hover:underline"
                >
                  View All ({submissions.length})
                </button>
              </div>

              {submissions.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center">
                  <p className="text-xs text-stone-500">You haven't submitted any projects yet.</p>
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="mt-3 px-4 py-2 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors"
                  >
                    Submit First Project
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 overflow-hidden shadow-2xs">
                  {submissions.slice(0, 3).map((sub) => (
                    <div key={sub.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-stone-500">
                            {sub.reference_id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              sub.status === 'Accepted' || sub.status === 'Published'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : sub.status === 'Under Review'
                                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-stone-900">{sub.title}</h4>
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{sub.project_summary || sub.description}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('submissions')}
                        className="text-xs font-semibold text-stone-600 hover:text-[#0F766E] shrink-0"
                      >
                        Details →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY COMPETITIONS */}
        {/* ========================================================================= */}
        {activeTab === 'competitions' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Registered Competitions</h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Track deadlines, manage your team invites, and submit your challenge deliverables.
                </p>
              </div>
              <button
                onClick={() => navigate('/discovery/competitions')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Explore Open Competitions</span>
              </button>
            </div>

            {registrations.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-lg mx-auto">
                <Trophy className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-stone-900 mb-1">No Active Registrations</h3>
                <p className="text-xs text-stone-600 mb-6 leading-relaxed">
                  You haven't joined any competitions yet. Register for an online or offline exploration challenge to earn credits and compete for cash rewards.
                </p>
                <button
                  onClick={() => navigate('/discovery/competitions')}
                  className="px-5 py-2.5 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shadow-sm"
                >
                  Browse Challenges
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((reg) => {
                  const comp = competitionsMap[reg.competition_id];
                  return (
                    <div
                      key={reg.id}
                      className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[#0F766E] border border-teal-200">
                            {comp ? comp.category : 'Challenge'}
                          </span>
                          <span className="text-xs text-stone-400">•</span>
                          <span className="text-xs text-stone-500 font-medium">
                            {reg.is_team ? 'Team Registration' : 'Individual Participant'}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-stone-900">
                          {comp ? comp.title : 'Competition ID: ' + reg.competition_id}
                        </h3>
                        <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                          {comp ? comp.short_description : 'Registered challenge'}
                        </p>

                        {comp && (
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-stone-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              Deadline: {new Date(comp.submission_deadline).toLocaleDateString()}
                            </span>
                            <span>Format: {comp.format}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {comp && (
                          <button
                            onClick={() => navigate(`/discovery/competitions/${comp.slug}`)}
                            className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                          >
                            View Guidelines
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSubmissionCompId(reg.competition_id);
                            setShowSubmitModal(true);
                          }}
                          className="px-4 py-2 bg-[#0F766E] text-white rounded-xl text-xs font-semibold hover:bg-[#0d635c] transition-colors shadow-2xs"
                        >
                          Submit Work
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MY SUBMISSIONS */}
        {/* ========================================================================= */}
        {activeTab === 'submissions' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">My Submissions</h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Track the evaluation progress and reviewer comments on your project submissions.
                </p>
              </div>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Submit New Work</span>
              </button>
            </div>

            {submissions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-lg mx-auto">
                <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-stone-900 mb-1">No Submissions Yet</h3>
                <p className="text-xs text-stone-600 mb-6 leading-relaxed">
                  Submit your prototypes, food maps, posters, or videos for any competition you've registered for.
                </p>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2.5 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shadow-sm"
                >
                  Create Submission
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => {
                  const comp = competitionsMap[sub.competition_id];
                  return (
                    <div
                      key={sub.id}
                      className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                              {sub.reference_id}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                sub.status === 'Accepted' || sub.status === 'Published'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : sub.status === 'Under Review'
                                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                  : sub.status === 'Needs Correction'
                                  ? 'bg-orange-50 text-orange-900 border border-orange-200'
                                  : 'bg-stone-100 text-stone-700'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </div>
                          <h3 className="font-serif text-lg font-bold text-stone-900">{sub.title}</h3>
                          <p className="text-xs text-[#0F766E] font-medium mt-0.5">
                            Challenge: {comp ? comp.title : 'Competition #' + sub.competition_id}
                          </p>
                        </div>
                        <span className="text-[11px] text-stone-400">
                          Submitted on {new Date(sub.submitted_at).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-4">
                        {sub.description}
                      </p>

                      {/* Links / Assets */}
                      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-stone-100 text-xs">
                        {sub.external_prototype_url && (
                          <a
                            href={sub.external_prototype_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#0F766E] hover:underline font-medium"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Live Prototype
                          </a>
                        )}
                        {sub.external_video_url && (
                          <a
                            href={sub.external_video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#FF5A36] hover:underline font-medium"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Walkthrough Video
                          </a>
                        )}
                        {sub.attachments && sub.attachments.length > 0 && (
                          <span className="text-stone-500">
                            {sub.attachments.length} file attached
                          </span>
                        )}
                      </div>

                      {/* Reviewer Feedback if present */}
                      {sub.student_visible_feedback && (
                        <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900">
                          <p className="font-semibold mb-0.5">Jury & Reviewer Feedback:</p>
                          <p>{sub.student_visible_feedback}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: MY FOOD DISCOVERIES */}
        {/* ========================================================================= */}
        {activeTab === 'discoveries' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">My Food Discoveries</h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Local street spots and hidden gems you have submitted for counter-price verification.
                </p>
              </div>
              <button
                onClick={() => setShowDiscoveryModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Submit New Food Spot</span>
              </button>
            </div>

            {foodDiscoveries.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-lg mx-auto">
                <UtensilsCrossed className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-stone-900 mb-1">No Discoveries Submitted</h3>
                <p className="text-xs text-stone-600 mb-6 leading-relaxed">
                  Know a pocket-friendly paratha joint, late-night roll cart, or authentic cafe in your campus area? Submit it to earn credits!
                </p>
                <button
                  onClick={() => setShowDiscoveryModal(true)}
                  className="px-5 py-2.5 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shadow-sm"
                >
                  Submit First Spot (+50 Credits)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {foodDiscoveries.map((disc) => (
                  <div
                    key={disc.id}
                    className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                          {disc.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            disc.verification_status === 'Verified by Menu Maps'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {disc.verification_status}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-stone-900">
                        {disc.food_place_name}
                      </h3>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {disc.neighbourhood}
                      </p>
                      <p className="text-xs text-stone-700 font-semibold mt-2">
                        Must Try: {disc.featured_dish}
                      </p>
                      {disc.counter_price_observed && (
                        <p className="text-xs text-[#0F766E] font-medium">
                          Observed Counter Rate: ₹{disc.counter_price_observed}
                        </p>
                      )}
                      <p className="text-xs text-stone-600 mt-2 line-clamp-2">
                        {disc.evidence_description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-stone-100 text-[11px] text-stone-400 flex items-center justify-between">
                      <span>Attribution: {disc.public_attribution_preference}</span>
                      <span>{new Date(disc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: MY FOOD TRAILS */}
        {/* ========================================================================= */}
        {activeTab === 'trails' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">My Food Trails</h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Curated multi-stop walking food crawls and student budget journeys designed by you.
                </p>
              </div>
              <button
                onClick={() => setShowTrailModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Build New Food Trail</span>
              </button>
            </div>

            {foodTrails.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-lg mx-auto">
                <MapPin className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-stone-900 mb-1">No Food Trails Yet</h3>
                <p className="text-xs text-stone-600 mb-6 leading-relaxed">
                  Design a step-by-step street food crawl (e.g. "Kamla Nagar Chai & Momos Trail under ₹150"). Once approved, your trail is featured in the public directory!
                </p>
                <button
                  onClick={() => setShowTrailModal(true)}
                  className="px-5 py-2.5 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shadow-sm"
                >
                  Create Trail (+75 Credits)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {foodTrails.map((trail) => (
                  <div
                    key={trail.id}
                    className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {trail.status}
                        </span>
                        <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">{trail.title}</h3>
                        <p className="text-xs text-stone-500">{trail.neighbourhood} • Est. Budget: ₹{trail.budget_estimate_for_one}</p>
                      </div>
                      <span className="text-xs text-stone-400">{trail.total_duration_estimate}</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100">
                      <p className="text-xs font-semibold text-stone-700 mb-2">
                        Stops ({trail.stops.length}):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {trail.stops.map((stop) => (
                          <div key={stop.stop_number} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60 text-xs">
                            <span className="font-bold text-[#0F766E]">Stop #{stop.stop_number}: </span>
                            <span className="font-semibold text-stone-900">{stop.place_name}</span>
                            <p className="text-stone-500 text-[11px] mt-0.5">{stop.must_try_dish} (₹{stop.estimated_price})</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CREDITS & AUDIT LOG */}
        {/* ========================================================================= */}
        {activeTab === 'credits' && (
          <div>
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  Verified Ledger Balance
                </span>
                <div className="font-serif text-4xl sm:text-5xl font-extrabold text-[#0F766E] mt-2">
                  {student.total_credits} <span className="text-lg font-sans text-stone-500 font-semibold">Credits</span>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Credits are awarded for honest food discoveries, menu transparency research, creative challenges, and peer leadership.
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs space-y-2 shrink-0">
                <p className="font-semibold text-stone-800">Earn More Credits:</p>
                <div className="flex items-center gap-2 text-stone-600">
                  <span className="font-bold text-teal-700">+50</span> Food Discovery Submission
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <span className="font-bold text-teal-700">+75</span> Food Trail Creation
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <span className="font-bold text-teal-700">+100</span> Competition Project Submission
                </div>
              </div>
            </div>

            <h3 className="font-serif text-xl font-bold text-stone-900 mb-4">Credit Audit Log</h3>

            {credits.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center">
                <Coins className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-xs text-stone-500">No credit audit records yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 overflow-hidden shadow-2xs">
                {credits.map((c) => (
                  <div key={c.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                          {c.category}
                        </span>
                        <span className="text-xs text-stone-400">
                          {new Date(c.awarded_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-stone-900">{c.title}</h4>
                      <p className="text-xs text-stone-500">{c.description}</p>
                    </div>
                    <div className="font-serif text-lg font-bold text-emerald-700 shrink-0">
                      +{c.points}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: PASSPORT */}
        {/* ========================================================================= */}
        {activeTab === 'passport' && (
          <div className="space-y-8">
            <PassportWidget profile={student} onActionClick={() => setActiveTab('submissions')} />

            {/* All Available Passport Stamps Catalog */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
                All Discovery Stamps Catalog
              </h3>
              <p className="text-xs text-stone-600 mb-6 leading-relaxed">
                Collect verifiable digital stamps in your passport through ground food research and civic participation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {OFFICIAL_PASSPORT_STAMPS.map((stamp) => (
                  <div
                    key={stamp.stamp_key}
                    className="p-4 rounded-2xl border border-stone-200/80 bg-stone-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 shadow-2xs" style={{ backgroundColor: `${stamp.color}15` }}>
                        {stamp.icon}
                      </div>
                      <h4 className="font-bold text-sm text-stone-900">{stamp.name}</h4>
                      <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">{stamp.description}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-stone-200/60 text-[10px] text-stone-600">
                      <strong>Unlock: </strong>{stamp.unlock_condition}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: PROFILE & PRIVACY SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-1">
              Profile & Privacy Settings
            </h2>
            <p className="text-xs text-stone-600 mb-6 leading-relaxed">
              Manage your student credentials, bio, and fine-grained public portfolio privacy settings.
            </p>

            {profileSuccessMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                {profileSuccessMsg}
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">College / University</label>
                  <input
                    type="text"
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Programme / Degree</label>
                  <input
                    type="text"
                    value={editProgramme}
                    onChange={(e) => setEditProgramme(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Year of Study</label>
                  <select
                    value={editStudyYear}
                    onChange={(e) => setEditStudyYear(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Special Contributor Title</label>
                <input
                  type="text"
                  placeholder="e.g. Delhi Street Food Explorer"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Bio / Statement</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell the community about your food explorations, projects, or interests..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                />
              </div>

              {/* Privacy Toggles */}
              <div className="pt-4 border-t border-stone-100 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Privacy & Public Visibility
                </p>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsPublic}
                    onChange={(e) => setEditIsPublic(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E]"
                  />
                  <div>
                    <p className="text-xs font-semibold text-stone-800">Public Portfolio</p>
                    <p className="text-[11px] text-stone-500">Show my profile in the Contributors Directory</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editAttributionConsent}
                    onChange={(e) => setEditAttributionConsent(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E]"
                  />
                  <div>
                    <p className="text-xs font-semibold text-stone-800">Attribution Name Consent</p>
                    <p className="text-[11px] text-stone-500">Credit my name on food discoveries and trails I create</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editCollegeConsent}
                    onChange={(e) => setEditCollegeConsent(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E]"
                  />
                  <div>
                    <p className="text-xs font-semibold text-stone-800">College Display Consent</p>
                    <p className="text-[11px] text-stone-500">Display my college on public project cards</p>
                  </div>
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shadow-sm disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Settings'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SUBMIT PROJECT MODAL */}
      {/* ========================================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-xl my-8">
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-1">Submit Competition Project</h3>
            <p className="text-xs text-stone-600 mb-5">
              Submit your work for review. Once accepted, your project can be published to the public gallery.
            </p>

            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Select Competition</label>
                <select
                  value={submissionCompId}
                  onChange={(e) => setSubmissionCompId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                >
                  <option value="">-- Choose registered challenge --</option>
                  {availableCompetitions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.format})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Campus Hidden Food Map & Radar"
                  value={submissionTitle}
                  onChange={(e) => setSubmissionTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Deliverable Type</label>
                <select
                  value={submissionCategory}
                  onChange={(e) => setSubmissionCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                >
                  <option value="Food Map">Food Map</option>
                  <option value="Digital Prototype">Digital Prototype (Figma / Web)</option>
                  <option value="App Design">App Design</option>
                  <option value="Creative Poster">Creative Poster</option>
                  <option value="Food Trail Concept">Food Trail Concept</option>
                  <option value="Research Paper">Research Paper</option>
                  <option value="Short Video">Short Video</option>
                  <option value="Presentation">Presentation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Detailed Description & Methodology</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain what you created, how you verified ground info, and why it benefits students..."
                  value={submissionDescription}
                  onChange={(e) => setSubmissionDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Prototype / Web Link</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={submissionPrototypeUrl}
                    onChange={(e) => setSubmissionPrototypeUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Video / Walkthrough Link</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={submissionVideoUrl}
                    onChange={(e) => setSubmissionVideoUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Upload Visual Proof / Cover Screenshot</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFileSelect(e, setSubmissionCoverUrl)}
                  className="w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#0F766E] hover:file:bg-teal-100"
                />
                {submissionCoverUrl && (
                  <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Image attached and compressed (&lt;1MB)
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProject}
                  className="px-5 py-2 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shadow-sm disabled:opacity-50"
                >
                  {submittingProject ? 'Submitting...' : 'Submit Entry (+50 Credits)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SUBMIT FOOD DISCOVERY MODAL */}
      {/* ========================================================================= */}
      {showDiscoveryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-xl my-8">
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-1">Submit Food Discovery</h3>
            <p className="text-xs text-stone-600 mb-5">
              Submit a hidden eatery or street stall. We will verify the counter price and list it with your credit.
            </p>

            <form onSubmit={handleDiscoverySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Place Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tom Uncle Maggi Point / Chache Di Hatti"
                  value={discPlaceName}
                  onChange={(e) => setDiscPlaceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Neighbourhood</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kamla Nagar, Hauz Khas"
                    value={discNeighbourhood}
                    onChange={(e) => setDiscNeighbourhood(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={discCategory}
                    onChange={(e) => setDiscCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                  >
                    <option value="Hidden Gem Cafe">Hidden Gem Cafe</option>
                    <option value="Street Food Legend">Street Food Legend</option>
                    <option value="Pocket-Friendly Canteen">Pocket-Friendly Canteen</option>
                    <option value="Late Night Corner">Late Night Corner</option>
                    <option value="Heritage Bakery">Heritage Bakery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Signature Must-Try Dish</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cheese Butter Maggi / Chole Bhature"
                    value={discFeaturedDish}
                    onChange={(e) => setDiscFeaturedDish(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Observed Counter Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 70"
                    value={discCounterPrice}
                    onChange={(e) => setDiscCounterPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Why is this place special? (Evidence & notes)</label>
                <textarea
                  rows={3}
                  placeholder="Share landmark cues, what time it opens, and why students love it..."
                  value={discEvidence}
                  onChange={(e) => setDiscEvidence(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Upload Photo of Spot / Counter Menu</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFileSelect(e, setDiscPhotoUrl)}
                  className="w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#0F766E] hover:file:bg-teal-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Public Attribution</label>
                <select
                  value={discAttribution}
                  onChange={(e) => setDiscAttribution(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                >
                  <option value="With Name">Display my full name</option>
                  <option value="With College">Display my name + college</option>
                  <option value="Anonymous">Anonymous student explorer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowDiscoveryModal(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDiscovery}
                  className="px-5 py-2 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shadow-sm disabled:opacity-50"
                >
                  {submittingDiscovery ? 'Submitting...' : 'Submit Discovery (+50 Credits)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BUILD FOOD TRAIL MODAL */}
      {/* ========================================================================= */}
      {showTrailModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-xl my-8">
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-1">Build Food Trail</h3>
            <p className="text-xs text-stone-600 mb-5">
              Create a sequence of 2 or more stops for other students to explore together.
            </p>

            <form onSubmit={handleTrailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Trail Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Campus 3-Stop Evening Street Trail"
                  value={trailTitle}
                  onChange={(e) => setTrailTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Neighbourhood</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kamla Nagar"
                    value={trailNeighbourhood}
                    onChange={(e) => setTrailNeighbourhood(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 hours"
                    value={trailDuration}
                    onChange={(e) => setTrailDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Budget for One (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    value={trailBudget}
                    onChange={(e) => setTrailBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Trail Stops</label>
                <div className="space-y-3">
                  {trailStops.map((stop, idx) => (
                    <div key={stop.stop_number} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                      <div className="font-bold text-[#0F766E]">Stop #{idx + 1}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Place Name"
                          value={stop.place_name}
                          onChange={(e) => {
                            const updated = [...trailStops];
                            updated[idx].place_name = e.target.value;
                            setTrailStops(updated);
                          }}
                          className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Must Try Dish"
                          value={stop.must_try_dish}
                          onChange={(e) => {
                            const updated = [...trailStops];
                            updated[idx].must_try_dish = e.target.value;
                            setTrailStops(updated);
                          }}
                          className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Price (₹)"
                          value={stop.estimated_price}
                          onChange={(e) => {
                            const updated = [...trailStops];
                            updated[idx].estimated_price = parseInt(e.target.value, 10) || 0;
                            setTrailStops(updated);
                          }}
                          className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Why Special / Note"
                          value={stop.why_special}
                          onChange={(e) => {
                            const updated = [...trailStops];
                            updated[idx].why_special = e.target.value;
                            setTrailStops(updated);
                          }}
                          className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setTrailStops([
                        ...trailStops,
                        {
                          stop_number: trailStops.length + 1,
                          place_name: '',
                          landmark: '',
                          must_try_dish: '',
                          estimated_price: 80,
                          why_special: '',
                        },
                      ]);
                    }}
                    className="text-xs font-semibold text-[#0F766E] hover:underline"
                  >
                    + Add Another Stop
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowTrailModal(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTrail}
                  className="px-5 py-2 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shadow-sm disabled:opacity-50"
                >
                  {submittingTrail ? 'Submitting...' : 'Submit Trail (+75 Credits)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
