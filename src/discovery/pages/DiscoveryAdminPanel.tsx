/**
 * Menu Maps Discovery - Administrator Management Center (/discovery/admin)
 * Comprehensive administrative console for managing competitions, student submissions,
 * food discovery verifications, credit allocations, certificate issuance, and hall of fame entries.
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Trophy,
  FileCheck,
  UtensilsCrossed,
  Award,
  Coins,
  Plus,
  Check,
  AlertCircle,
  ExternalLink,
  Search,
  Eye,
  Send,
  Lock,
  ArrowLeft,
  Sparkles,
  Calendar,
  Building,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Compass,
  Layers,
  Zap,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { compressImageFile } from '../../lib/imageCompressor';
import {
  DiscoveryCompetition,
  CompetitionSubmission,
  FoodDiscoveryItem,
  ContributionCredit,
  DiscoveryCertificate,
  HallOfFameEntry,
  StudentProfile,
  CompetitionRegistration,
  SubmissionStatus,
  FoodDiscoveryVerificationStatus,
  AwardRank,
  CertificateType,
  CreditCategory,
  CompetitionCategory,
  CompetitionFormat,
} from '../types/discovery';
import { ADMIN_EMAIL, getCurrentAdminSession, setAdminSession } from '../../lib/supabase';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';

interface DiscoveryAdminPanelProps {
  navigate: (path: string) => void;
}

type AdminTab = 'league' | 'submissions' | 'discoveries' | 'competitions' | 'credits_certs' | 'hall_of_fame';

export const DiscoveryAdminPanel: React.FC<DiscoveryAdminPanelProps> = ({ navigate }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('league');

  // Datasets
  const [competitions, setCompetitions] = useState<DiscoveryCompetition[]>([]);
  const [submissions, setSubmissions] = useState<CompetitionSubmission[]>([]);
  const [discoveries, setDiscoveries] = useState<FoodDiscoveryItem[]>([]);
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [registrations, setRegistrations] = useState<CompetitionRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  // Success Feedback
  const [toastMsg, setToastMsg] = useState('');

  // League Image Manager state
  const [selectedCompForImage, setSelectedCompForImage] = useState('great-market-mission');
  const [compImageUrl, setCompImageUrl] = useState('');
  const [updatingImage, setUpdatingImage] = useState(false);
  const [compressingCover, setCompressingCover] = useState(false);
  const [coverFileStats, setCoverFileStats] = useState<{ sizeKb: number } | null>(null);

  // Challenge Drops state
  const [showDropModal, setShowDropModal] = useState(false);
  const [dropTitle, setDropTitle] = useState('');
  const [dropPrompt, setDropPrompt] = useState('');
  const [dropDayLabel, setDropDayLabel] = useState('Day 03 Drop');

  // Selected for review modal & scoring
  const [activeSubmission, setActiveSubmission] = useState<CompetitionSubmission | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [internalNotesInput, setInternalNotesInput] = useState('');
  const [subStatusInput, setSubStatusInput] = useState<SubmissionStatus>('Under Review');
  const [score1, setScore1] = useState(20);
  const [score2, setScore2] = useState(25);
  const [score3, setScore3] = useState(25);
  const [score4, setScore4] = useState(20);
  const [score5, setScore5] = useState(10);
  const [score6, setScore6] = useState(10);

  // Discovery Verification modal/state
  const [activeDiscovery, setActiveDiscovery] = useState<FoodDiscoveryItem | null>(null);
  const [verifiedRateInput, setVerifiedRateInput] = useState('');
  const [discStatusInput, setDiscStatusInput] = useState<FoodDiscoveryVerificationStatus>('Verified by Menu Maps');
  const [discNotesInput, setDiscNotesInput] = useState('');

  // Create Competition Form State
  const [showCreateCompModal, setShowCreateCompModal] = useState(false);
  const [compTitle, setCompTitle] = useState('');
  const [compCategory, setCompCategory] = useState<CompetitionCategory>('Online Creative Challenge');
  const [compFormat, setCompFormat] = useState<CompetitionFormat>('Online');
  const [compShortDesc, setCompShortDesc] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compDeadline, setCompDeadline] = useState('2026-06-30');
  const [compRewardTitle, setCompRewardTitle] = useState('₹10,000 Cash Prize + Certificate');

  // Issue Certificate Form State
  const [certRecipientName, setCertRecipientName] = useState('');
  const [certCollege, setCertCollege] = useState('');
  const [certActivity, setCertActivity] = useState('');
  const [certType, setCertType] = useState<CertificateType>('Participation');

  // Award Credit Form State
  const [creditStudentId, setCreditStudentId] = useState('');
  const [creditCategory, setCreditCategory] = useState<CreditCategory>('Food Discovery Credit');
  const [creditPoints, setCreditPoints] = useState('50');
  const [creditTitle, setCreditTitle] = useState('');
  const [creditDesc, setCreditDesc] = useState('');

  // Hall of Fame Form State
  const [hofCompTitle, setHofCompTitle] = useState('');
  const [hofWinnerName, setHofWinnerName] = useState('');
  const [hofCollege, setHofCollege] = useState('');
  const [hofProjectTitle, setHofProjectTitle] = useState('');
  const [hofRank, setHofRank] = useState<AwardRank>('Champion');
  const [hofCitation, setHofCitation] = useState('');

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = () => {
    const session = getCurrentAdminSession();
    if (session && session.email === ADMIN_EMAIL) {
      setIsAdmin(true);
      loadAdminData();
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin passphrase / passkey
    if (
      adminPasscode === 'admin2010' ||
      adminPasscode === 'menumaps2026' ||
      adminPasscode === 'discovery2026'
    ) {
      setAdminSession({
        email: ADMIN_EMAIL,
        token: 'admin_session_' + Date.now(),
        expiresAt: Date.now() + 86400000,
      });
      setIsAdmin(true);
      loadAdminData();
      setLoginError('');
    } else {
      setLoginError('Invalid administrator passkey.');
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [comps, subs, discs, hofs, studs, regs] = await Promise.all([
        discoveryApi.getCompetitions(false),
        discoveryApi.getAllSubmissions(),
        discoveryApi.getAllFoodDiscoveries(),
        discoveryApi.getHallOfFameEntries(),
        discoveryApi.getPublicContributors(),
        discoveryApi.getAllRegistrations(),
      ]);

      setCompetitions(comps);
      setSubmissions(subs);
      setDiscoveries(discs);
      setHallOfFame(hofs);
      setStudents(studs);
      setRegistrations(regs);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  const notifySuccess = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Image Upload with Auto-Compression (<1 MB)
  const handleUploadCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCompressingCover(true);
      const result = await compressImageFile(file, 1600, 950 * 1024);
      setCompImageUrl(result.dataUrl);
      setCoverFileStats({ sizeKb: result.compressedSizeKb });
      notifySuccess(`Cover photo compressed to ${result.compressedSizeKb} KB (< 1 MB). Ready to save!`);
    } catch (err) {
      console.error('Image compression error:', err);
      alert('Failed to compress image. Please choose another image file.');
    } finally {
      setCompressingCover(false);
    }
  };

  const handleSaveCompetitionImage = async () => {
    if (!compImageUrl.trim()) {
      alert('Please upload an image or provide an image URL first.');
      return;
    }
    setUpdatingImage(true);
    try {
      const ok = await discoveryApi.updateCompetitionImage(selectedCompForImage, compImageUrl);
      if (ok) {
        notifySuccess('Competition cover image successfully updated!');
        setCompImageUrl('');
        setCoverFileStats(null);
        loadAdminData();
      } else {
        alert('Could not update cover image for selected competition.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating cover image.');
    } finally {
      setUpdatingImage(false);
    }
  };

  const handlePublishDrop = async (dropId: string) => {
    try {
      const ok = await discoveryApi.publishChallengeDrop('foodverse-challenge', dropId);
      if (ok) {
        notifySuccess('Challenge Drop published! It is now active on student dashboards.');
        loadAdminData();
      } else {
        alert('Could not publish drop.');
      }
    } catch (err) {
      console.error(err);
      alert('Error publishing challenge drop.');
    }
  };

  // 1. Save Submission Review with 100-Point Scoring
  const handleSaveSubmissionReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;

    try {
      const isGMM =
        activeSubmission.competition_id === 'great-market-mission' ||
        activeSubmission.title.toLowerCase().includes('market');

      let judgeScores = [];
      let calculatedTotal = 0;

      if (isGMM) {
        judgeScores = [
          { criterion_title: 'Mission Task 1: Hidden Food Gems', score: Number(score1) || 0, max_score: 20 },
          { criterion_title: 'Mission Task 2: Menu Detective', score: Number(score2) || 0, max_score: 25 },
          { criterion_title: 'Mission Task 3: Budget Battle', score: Number(score3) || 0, max_score: 25 },
          { criterion_title: 'Mission Task 4: Interactive Market Map', score: Number(score4) || 0, max_score: 30 },
          { criterion_title: 'Mystery Bonus & Ground Authenticity', score: Number(score5) || 0, max_score: 10 },
        ];
        calculatedTotal = (Number(score1) || 0) + (Number(score2) || 0) + (Number(score3) || 0) + (Number(score4) || 0) + (Number(score5) || 0);
      } else {
        judgeScores = [
          { criterion_title: 'Problem Understanding & Research', score: Number(score1) || 0, max_score: 20 },
          { criterion_title: 'Innovation & Originality', score: Number(score2) || 0, max_score: 20 },
          { criterion_title: 'Usability & Practical Value', score: Number(score3) || 0, max_score: 20 },
          { criterion_title: 'Creativity & Visual/Design Quality', score: Number(score4) || 0, max_score: 20 },
          { criterion_title: 'Presentation & Explanation', score: Number(score5) || 0, max_score: 10 },
          { criterion_title: 'Completeness & Feasibility', score: Number(score6) || 0, max_score: 10 },
        ];
        calculatedTotal = (Number(score1) || 0) + (Number(score2) || 0) + (Number(score3) || 0) + (Number(score4) || 0) + (Number(score5) || 0) + (Number(score6) || 0);
      }

      const updated: CompetitionSubmission = {
        ...activeSubmission,
        status: subStatusInput,
        judge_scores: judgeScores,
        total_score: calculatedTotal,
        student_visible_feedback: feedbackInput.trim() || undefined,
        internal_admin_notes: internalNotesInput.trim() || undefined,
        reviewed_at: new Date().toISOString(),
        reviewed_by: ADMIN_EMAIL,
        is_published_to_gallery: subStatusInput === 'Published' || subStatusInput === 'Accepted',
      };

      await discoveryApi.submitProject(updated);

      // If accepted or published, publish to student_projects public gallery
      if (updated.is_published_to_gallery) {
        const slug = updated.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        await discoveryApi.saveStudentProject({
          id: 'proj_' + updated.id,
          title: updated.title,
          slug: slug + '-' + Math.random().toString(36).substring(2, 6),
          category: isGMM ? 'Market Mission Map' : 'Digital Prototype',
          short_description: updated.project_summary || updated.description.slice(0, 160),
          description: updated.description,
          cover_image_url:
            updated.attachments[0]?.file_url ||
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
          prototype_url: updated.external_prototype_url,
          video_url: updated.external_video_url,
          student_id: updated.student_id,
          creator_name: 'Student Contributor',
          competition_id: updated.competition_id,
          credit_awarded: `Jury Score: ${calculatedTotal}/100`,
          published_date: new Date().toISOString(),
          views_count: 1,
          likes_count: 0,
        });
      }

      setActiveSubmission(null);
      notifySuccess(`Submission ${updated.reference_id} marked as ${updated.status} with Jury Score ${calculatedTotal}/100.`);
      loadAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to save review');
    }
  };

  // 2. Save Discovery Verification
  const handleSaveDiscoveryVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDiscovery) return;

    try {
      const updated: FoodDiscoveryItem = {
        ...activeDiscovery,
        verification_status: discStatusInput,
        verified_counter_rate: verifiedRateInput ? parseInt(verifiedRateInput, 10) : activeDiscovery.counter_price_observed,
        verification_notes: discNotesInput.trim() || undefined,
        verification_date: new Date().toISOString(),
        verified_by: ADMIN_EMAIL,
        updated_at: new Date().toISOString(),
      };

      await discoveryApi.submitFoodDiscovery(updated);
      setActiveDiscovery(null);
      notifySuccess(`Discovery "${updated.food_place_name}" verified successfully.`);
      loadAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to update discovery verification');
    }
  };

  // 3. Create Competition
  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compTitle.trim() || !compShortDesc.trim()) return;

    try {
      const slug = compTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const newComp: DiscoveryCompetition = {
        id: 'comp_' + crypto.randomUUID(),
        title: compTitle.trim(),
        slug: slug + '-' + new Date().getFullYear(),
        short_description: compShortDesc.trim(),
        description: compDesc.trim() || compShortDesc.trim(),
        cover_image_url:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        category: compCategory,
        format: compFormat,
        is_team_competition: true,
        min_team_size: 1,
        max_team_size: 4,
        eligibility: 'All Indian university students enrolled in recognized institutions.',
        registration_start_date: new Date().toISOString(),
        registration_end_date: compDeadline,
        competition_start_date: new Date().toISOString(),
        competition_end_date: compDeadline,
        submission_deadline: compDeadline,
        rules: [
          'All food rates and menus must reflect ground in-person counter verification.',
          'Submissions must be original student work.',
          'Respect privacy of cafe staff and owners.',
        ],
        tasks_instructions: [
          'Explore assigned market or neighbourhood.',
          'Document signatures dishes and counter bills.',
          'Package your interactive map or concept.',
        ],
        required_deliverables: ['Cover Screenshot', 'Methodology Summary', 'Live Link or File'],
        allowed_file_formats: ['PDF', 'PNG', 'JPG', 'Figma Link', 'Prototype URL'],
        max_file_size_mb: 25,
        judging_criteria: [
          { title: 'Ground Accuracy & Verification', weight_percent: 40, description: 'Honesty of counter rates' },
          { title: 'Utility for Students', weight_percent: 30, description: 'Helps peers discover food easily' },
          { title: 'Execution & Polish', weight_percent: 30, description: 'Quality of deliverable' },
        ],
        rewards: [
          { title: 'Champion Award', prize: compRewardTitle, recognition: 'Official Menu Maps Trophy & Seal' },
        ],
        certificate_eligibility: 'All qualifying participants who deliver a complete submission.',
        faqs: [
          { question: 'Is participation free?', answer: 'Yes, 100% free for all students.' },
        ],
        contact_info: 'discovery@menumaps.in',
        terms_and_conditions: ['Standard student competition guidelines apply.'],
        status: 'Registration Open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await discoveryApi.saveCompetition(newComp);
      setShowCreateCompModal(false);
      setCompTitle('');
      setCompShortDesc('');
      setCompDesc('');
      notifySuccess(`Competition "${newComp.title}" published!`);
      loadAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to create competition');
    }
  };

  // 4. Issue Certificate
  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certRecipientName.trim() || !certActivity.trim()) return;

    try {
      const certNum =
        'MM-CERT-' +
        new Date().getFullYear() +
        '-' +
        Math.floor(1000 + Math.random() * 9000);

      const cert: DiscoveryCertificate = {
        id: 'cert_' + crypto.randomUUID(),
        certificate_number: certNum,
        student_id: 'manual_' + crypto.randomUUID(),
        student_name: certRecipientName.trim(),
        college_name: certCollege.trim() || undefined,
        activity_title: certActivity.trim(),
        certificate_type: certType,
        issue_date: new Date().toISOString(),
        issuing_body: 'Menu Maps Discovery Ecosystem',
        signature_title: 'Head of Student Research & Food Verification',
        verification_url: `${window.location.origin}/discovery/certificates/${certNum}`,
        is_valid: true,
      };

      await discoveryApi.issueCertificate(cert);
      setCertRecipientName('');
      setCertCollege('');
      setCertActivity('');
      notifySuccess(`Certificate ${certNum} generated successfully!`);
    } catch (err) {
      console.error(err);
      alert('Failed to issue certificate');
    }
  };

  // 5. Award Credits
  const handleAwardCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditStudentId || !creditTitle.trim()) return;

    try {
      const credit: ContributionCredit = {
        id: 'crd_' + crypto.randomUUID(),
        student_id: creditStudentId,
        category: creditCategory,
        points: parseInt(creditPoints, 10) || 50,
        title: creditTitle.trim(),
        description: creditDesc.trim() || 'Awarded by Discovery Administration.',
        awarded_by: ADMIN_EMAIL,
        reference_type: 'manual',
        awarded_at: new Date().toISOString(),
      };

      await discoveryApi.awardCredit(credit);
      setCreditTitle('');
      setCreditDesc('');
      notifySuccess(`Awarded +${credit.points} credits to student.`);
    } catch (err) {
      console.error(err);
      alert('Failed to award credit');
    }
  };

  // 6. Hall of Fame Entry
  const handleCreateHof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hofCompTitle.trim() || !hofWinnerName.trim()) return;

    try {
      const entry: HallOfFameEntry = {
        id: 'hof_' + crypto.randomUUID(),
        competition_id: 'comp_manual',
        competition_title: hofCompTitle.trim(),
        award_rank: hofRank,
        student_id: 'manual_student',
        winner_name: hofWinnerName.trim(),
        college_name: hofCollege.trim() || undefined,
        project_title: hofProjectTitle.trim() || 'Outstanding Contribution',
        citation: hofCitation.trim() || 'Recognized for exemplary innovation and food verification.',
        awarded_at: new Date().toISOString(),
        year: new Date().getFullYear(),
      };

      await discoveryApi.saveHallOfFameEntry(entry);
      setHofWinnerName('');
      setHofCollege('');
      setHofProjectTitle('');
      setHofCitation('');
      notifySuccess(`Added ${entry.winner_name} to Hall of Fame!`);
      loadAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to save Hall of Fame entry');
    }
  };

  // Login Gate if not authenticated
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
        <DiscoveryNavbar navigate={navigate} activeTab="overview" />

        <div className="max-w-md mx-auto px-4 py-20">
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm text-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-1">
              Discovery Administration
            </h2>
            <p className="text-xs text-stone-600 mb-6">
              Enter administrator passkey to access competitions, submissions, and verifications.
            </p>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="password"
                placeholder="Passkey (e.g. discovery2026 / admin2010)"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                required
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
              />
              <button
                type="submit"
                className="w-full py-3 bg-[#0F766E] text-white text-sm font-semibold rounded-xl hover:bg-[#0d635c] transition-all shadow-sm"
              >
                Access Console
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar navigate={navigate} activeTab="overview" />

      {/* Header */}
      <section className="bg-white border-b border-stone-200/80 pt-8 pb-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-800 border border-red-200">
                Staff & Lead Console
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-stone-500 font-mono">{ADMIN_EMAIL}</span>
            </div>
            <h1 className="font-serif text-3xl font-extrabold text-stone-900 tracking-tight">
              Discovery Administration Center
            </h1>
          </div>

          <button
            onClick={() => navigate('/discovery')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Public Discovery</span>
          </button>
        </div>

        {/* Tab Bar */}
        <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('league')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'league'
                ? 'bg-[#0F766E] text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Discovery League S01</span>
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'submissions'
                ? 'bg-[#0F766E] text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('discoveries')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'discoveries'
                ? 'bg-[#0F766E] text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Food Verifications ({discoveries.length})
          </button>
          <button
            onClick={() => setActiveTab('competitions')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'competitions'
                ? 'bg-[#0F766E] text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Competitions ({competitions.length})
          </button>
          <button
            onClick={() => setActiveTab('credits_certs')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'credits_certs'
                ? 'bg-[#0F766E] text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Issue Credits & Certs
          </button>
          <button
            onClick={() => setActiveTab('hall_of_fame')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'hall_of_fame'
                ? 'bg-[#0F766E] text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Hall of Fame ({hallOfFame.length})
          </button>
        </div>
      </section>

      {/* Main Admin Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {toastMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            {toastMsg}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 0: DISCOVERY LEAGUE SEASON 01 CONTROL CENTER */}
        {/* ========================================================================= */}
        {activeTab === 'league' && (() => {
          const gmmComp = competitions.find(c => c.slug === 'great-market-mission' || c.id === 'great-market-mission');
          const fvcComp = competitions.find(c => c.slug === 'foodverse-challenge' || c.id === 'foodverse-challenge');
          const gmmRegs = registrations.filter(r => r.competition_id === 'great-market-mission' || r.competition_id?.includes('market'));
          const fvcRegs = registrations.filter(r => r.competition_id === 'foodverse-challenge' || r.competition_id?.includes('foodverse'));
          const gmmSubs = submissions.filter(s => s.competition_id === 'great-market-mission' || s.title?.toLowerCase().includes('market'));
          const fvcSubs = submissions.filter(s => s.competition_id === 'foodverse-challenge' || s.title?.toLowerCase().includes('foodverse'));
          const currentTargetComp = competitions.find(c => c.slug === selectedCompForImage || c.id === selectedCompForImage);
          const currentPreviewUrl = compImageUrl || currentTargetComp?.cover_image_url || '';

          return (
            <div className="space-y-8">
              {/* Season 01 Banner */}
              <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Official Flagship Series
                      </span>
                      <span className="text-xs text-stone-400">•</span>
                      <span className="text-xs text-stone-300 font-medium">Season 01 Live</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Menu Maps Discovery League: Season 01
                    </h2>
                    <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-2xl">
                      "Discover More. Create More. Make Your Mark." Real-time control center for The Great Market Mission (Offline) and The Foodverse Challenge (Online).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={() => navigate('/discovery/competitions/discovery-league')}
                      className="px-4 py-2.5 bg-white text-stone-900 text-xs font-bold rounded-xl hover:bg-stone-100 transition-colors shadow-sm"
                    >
                      View Public Series Hub
                    </button>
                  </div>
                </div>
              </div>

              {/* 2 Flagship Challenge Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Competition 1: The Great Market Mission */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-[#FF5A36] border border-orange-200">
                        Offline Exploration
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Registration Open
                      </span>
                    </div>

                    <div className="flex gap-4 items-start mb-4">
                      {gmmComp?.cover_image_url && (
                        <img
                          src={gmmComp.cover_image_url}
                          alt="Great Market Mission"
                          className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-stone-200"
                        />
                      )}
                      <div>
                        <h3 className="font-serif text-lg font-bold text-stone-900">The Great Market Mission</h3>
                        <p className="text-xs text-stone-500 italic mt-0.5">
                          "One Market. Hidden Food Stories. Can Your Team Discover Them All?"
                        </p>
                        <p className="text-[11px] text-stone-600 font-medium mt-1">
                          Teams of 2–3 • 4 Mission Tasks • 8 Delhi NCR Markets
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200/70 text-center">
                      <div>
                        <p className="text-lg font-bold text-stone-900">{gmmRegs.length}</p>
                        <p className="text-[10px] text-stone-500 font-medium uppercase">Registrations</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-stone-900">
                          {gmmRegs.filter(r => r.is_team).length}
                        </p>
                        <p className="text-[10px] text-stone-500 font-medium uppercase">Teams Formed</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-stone-900">{gmmSubs.length}</p>
                        <p className="text-[10px] text-stone-500 font-medium uppercase">Submissions</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedCompForImage('great-market-mission');
                        setCompImageUrl('');
                      }}
                      className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Edit Cover Image
                    </button>
                    <button
                      onClick={() => navigate('/discovery/competitions/great-market-mission')}
                      className="px-3.5 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors"
                    >
                      Live Competition Page
                    </button>
                  </div>
                </div>

                {/* Competition 2: The Foodverse Challenge */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[#0F766E] border border-teal-200">
                        Online Challenge
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Registration Open
                      </span>
                    </div>

                    <div className="flex gap-4 items-start mb-4">
                      {fvcComp?.cover_image_url && (
                        <img
                          src={fvcComp.cover_image_url}
                          alt="The Foodverse Challenge"
                          className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-stone-200"
                        />
                      )}
                      <div>
                        <h3 className="font-serif text-lg font-bold text-stone-900">The Foodverse Challenge</h3>
                        <p className="text-xs text-stone-500 italic mt-0.5">
                          "Imagine the Future of Food Discovery. Then Build It."
                        </p>
                        <p className="text-[11px] text-stone-600 font-medium mt-1">
                          Solo or Teams (1–4) • 5 Tracks • Secret Drops
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200/70 text-center">
                      <div>
                        <p className="text-lg font-bold text-stone-900">{fvcRegs.length}</p>
                        <p className="text-[10px] text-stone-500 font-medium uppercase">Registrations</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-stone-900">
                          {fvcComp?.challenge_drops?.filter(d => d.is_published).length || 0} / 3
                        </p>
                        <p className="text-[10px] text-stone-500 font-medium uppercase">Drops Live</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-stone-900">{fvcSubs.length}</p>
                        <p className="text-[10px] text-stone-500 font-medium uppercase">Submissions</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedCompForImage('foodverse-challenge');
                        setCompImageUrl('');
                      }}
                      className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Edit Cover Image
                    </button>
                    <button
                      onClick={() => navigate('/discovery/competitions/foodverse-challenge')}
                      className="px-3.5 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors"
                    >
                      Live Competition Page
                    </button>
                  </div>
                </div>
              </div>

              {/* COVER IMAGE MANAGER (Admin requested: if any place need images then i add from admin panel) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-[#0F766E]">
                  <ImageIcon className="w-5 h-5" />
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Competition Cover Image Manager
                  </h3>
                </div>
                <p className="text-xs text-stone-600 mb-6 max-w-2xl">
                  Upload an image from your device (auto-compressed &lt; 1MB) or paste an image URL to replace the official cover photo on any competition. Changes reflect instantly across the homepage, directory, and detail pages.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left: Preview */}
                  <div className="lg:col-span-5 bg-stone-50 rounded-2xl p-4 border border-stone-200">
                    <p className="text-xs font-bold text-stone-700 mb-2">Live Preview for Selected Challenge</p>
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-stone-200 relative border border-stone-300">
                      {currentPreviewUrl ? (
                        <img
                          src={currentPreviewUrl}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                          No cover photo assigned
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-2 truncate">
                      {currentTargetComp?.title || 'Selected Competition'}
                    </p>
                  </div>

                  {/* Right: Controls */}
                  <div className="lg:col-span-7 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Select Competition
                      </label>
                      <select
                        value={selectedCompForImage}
                        onChange={(e) => {
                          setSelectedCompForImage(e.target.value);
                          setCompImageUrl('');
                          setCoverFileStats(null);
                        }}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                      >
                        <option value="great-market-mission">The Great Market Mission (Offline Exploration)</option>
                        <option value="foodverse-challenge">The Foodverse Challenge (Online Innovation)</option>
                        {competitions
                          .filter(c => c.slug !== 'great-market-mission' && c.slug !== 'foodverse-challenge')
                          .map(c => (
                            <option key={c.id} value={c.slug || c.id}>
                              {c.title}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Option A: Upload Photo from Phone / PC (&lt; 1MB Auto-Compressed)
                      </label>
                      <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-stone-200 hover:border-[#0F766E] rounded-xl cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors">
                        <Upload className="w-4 h-4 text-stone-500" />
                        <span className="text-xs font-semibold text-stone-700">
                          {compressingCover ? 'Compressing Image...' : 'Click to Upload Image File'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadCoverFile}
                          disabled={compressingCover}
                          className="hidden"
                        />
                      </label>
                      {coverFileStats && (
                        <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Compressed to {coverFileStats.sizeKb} KB (&lt; 1MB)
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Option B: Or Enter Image URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... or cloud URL"
                        value={compImageUrl}
                        onChange={(e) => setCompImageUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                      />
                    </div>

                    <button
                      onClick={handleSaveCompetitionImage}
                      disabled={updatingImage || compressingCover}
                      className="w-full py-2.5 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shadow-sm disabled:opacity-50"
                    >
                      {updatingImage ? 'Saving Cover Image...' : 'Save & Publish Cover Image'}
                    </button>
                  </div>
                </div>
              </div>

              {/* SECRET CHALLENGE DROPS MANAGER */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Zap className="w-5 h-5" />
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      The Foodverse Challenge — Secret Challenge Drops
                    </h3>
                  </div>
                  <span className="text-xs text-stone-500 font-medium">
                    {fvcComp?.challenge_drops?.length || 0} Secret Drops Configured
                  </span>
                </div>
                <p className="text-xs text-stone-600 mb-6 max-w-2xl">
                  Challenge Drops are surprise bonus constraints released during the competition to stretch student creativity. Once published, students see the prompt inside their dashboard.
                </p>

                <div className="space-y-4">
                  {(fvcComp?.challenge_drops || []).map((drop) => (
                    <div
                      key={drop.id}
                      className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-stone-200 text-stone-700 px-2 py-0.5 rounded">
                            {drop.day_label}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              drop.is_published
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-900 border border-amber-200'
                            }`}
                          >
                            {drop.is_published ? '✓ Published & Visible' : '⏳ Scheduled'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-stone-900">{drop.title}</h4>
                        <p className="text-xs text-stone-600 mt-1">{drop.prompt}</p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {drop.is_published ? (
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                            Active on Dashboard
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePublishDrop(drop.id)}
                            className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl hover:bg-amber-700 transition-colors shadow-2xs"
                          >
                            Publish Drop Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ========================================================================= */}
        {/* TAB 1: SUBMISSIONS REVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'submissions' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold text-stone-900">Student Deliverables</h2>
              <span className="text-xs text-stone-500 font-medium">
                {submissions.length} Total Submissions
              </span>
            </div>

            {submissions.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-stone-200">
                <p className="text-xs text-stone-500">No student submissions submitted yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 overflow-hidden shadow-2xs">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
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
                      <h3 className="font-bold text-base text-stone-900">{sub.title}</h3>
                      <p className="text-xs text-stone-600 line-clamp-2 mt-1">{sub.description}</p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-stone-500">
                        {sub.external_prototype_url && (
                          <a
                            href={sub.external_prototype_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0F766E] hover:underline flex items-center gap-1 font-medium"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Prototype Link
                          </a>
                        )}
                        {sub.external_video_url && (
                          <a
                            href={sub.external_video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#FF5A36] hover:underline flex items-center gap-1 font-medium"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Video Demo
                          </a>
                        )}
                        <span>Submitted: {new Date(sub.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveSubmission(sub);
                        setSubStatusInput(sub.status);
                        setFeedbackInput(sub.student_visible_feedback || '');
                        setInternalNotesInput(sub.internal_admin_notes || '');
                        if (sub.judge_scores && sub.judge_scores.length >= 4) {
                          setScore1(sub.judge_scores[0]?.score ?? 20);
                          setScore2(sub.judge_scores[1]?.score ?? 25);
                          setScore3(sub.judge_scores[2]?.score ?? 25);
                          setScore4(sub.judge_scores[3]?.score ?? 20);
                          setScore5(sub.judge_scores[4]?.score ?? 10);
                          setScore6(sub.judge_scores[5]?.score ?? 10);
                        } else {
                          setScore1(20);
                          setScore2(25);
                          setScore3(25);
                          setScore4(20);
                          setScore5(10);
                          setScore6(10);
                        }
                      }}
                      className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors shrink-0"
                    >
                      Review & Score
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: FOOD DISCOVERY VERIFICATIONS */}
        {/* ========================================================================= */}
        {activeTab === 'discoveries' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold text-stone-900">Food Discovery Verifications</h2>
              <span className="text-xs text-stone-500 font-medium">
                {discoveries.length} Food Places Submitted
              </span>
            </div>

            {discoveries.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-stone-200">
                <p className="text-xs text-stone-500">No food discoveries submitted yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {discoveries.map((disc) => (
                  <div key={disc.id} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs flex flex-col justify-between">
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
                      <h3 className="font-serif text-lg font-bold text-stone-900">{disc.food_place_name}</h3>
                      <p className="text-xs text-stone-500">{disc.neighbourhood} • {disc.full_address}</p>
                      <p className="text-xs font-semibold text-stone-800 mt-2">
                        Dish: {disc.featured_dish} (Observed: ₹{disc.counter_price_observed || 'N/A'})
                      </p>
                      {disc.verified_counter_rate && (
                        <p className="text-xs text-emerald-700 font-bold">
                          Official Counter Verified Rate: ₹{disc.verified_counter_rate}
                        </p>
                      )}
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2">{disc.evidence_description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[11px] text-stone-400">By: {disc.contributor_name}</span>
                      <button
                        onClick={() => {
                          setActiveDiscovery(disc);
                          setDiscStatusInput(disc.verification_status);
                          setVerifiedRateInput(disc.verified_counter_rate ? disc.verified_counter_rate.toString() : (disc.counter_price_observed ? disc.counter_price_observed.toString() : ''));
                          setDiscNotesInput(disc.verification_notes || '');
                        }}
                        className="px-3.5 py-1.5 bg-[#0F766E] text-white text-xs font-semibold rounded-lg hover:bg-[#0d635c] transition-colors"
                      >
                        Verify Spot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: COMPETITIONS */}
        {/* ========================================================================= */}
        {activeTab === 'competitions' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold text-stone-900">Manage Competitions</h2>
              <button
                onClick={() => setShowCreateCompModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Challenge</span>
              </button>
            </div>

            <div className="space-y-4">
              {competitions.map((comp) => (
                <div key={comp.id} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[#0F766E] border border-teal-200">
                        {comp.category}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">({comp.format})</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700">
                        {comp.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-stone-900">{comp.title}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">{comp.short_description}</p>
                    <p className="text-[11px] text-stone-400 mt-1">Deadline: {new Date(comp.submission_deadline).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/discovery/competitions/${comp.slug}`)}
                    className="px-3.5 py-1.5 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 shrink-0"
                  >
                    View Live Page
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ISSUE CREDITS & CERTS */}
        {/* ========================================================================= */}
        {activeTab === 'credits_certs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Issue Certificate Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-[#0F766E]">
                <Award className="w-5 h-5" />
                <h3 className="font-serif text-lg font-bold text-stone-900">Issue Official Certificate</h3>
              </div>
              <p className="text-xs text-stone-500 mb-5">
                Generates a cryptographically auditable, printable verification certificate.
              </p>

              <form onSubmit={handleIssueCertificate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Malhotra"
                    value={certRecipientName}
                    onChange={(e) => setCertRecipientName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">College / University</label>
                  <input
                    type="text"
                    placeholder="e.g. Faculty of Technology, Delhi University"
                    value={certCollege}
                    onChange={(e) => setCertCollege(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Activity / Challenge Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. North Campus Legendary Food Trail Challenge 2026"
                    value={certActivity}
                    onChange={(e) => setCertActivity(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Certificate Type</label>
                  <select
                    value={certType}
                    onChange={(e) => setCertType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  >
                    <option value="Winner">Winner</option>
                    <option value="Runner-Up">Runner-Up</option>
                    <option value="Finalist">Finalist</option>
                    <option value="Participation">Participation</option>
                    <option value="Special Recognition">Special Recognition</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shadow-sm"
                >
                  Generate & Register Certificate
                </button>
              </form>
            </div>

            {/* Award Credits Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-amber-700">
                <Coins className="w-5 h-5" />
                <h3 className="font-serif text-lg font-bold text-stone-900">Award Contribution Credits</h3>
              </div>
              <p className="text-xs text-stone-500 mb-5">
                Grant credit points to a student for research, trail creation, or leadership.
              </p>

              <form onSubmit={handleAwardCredit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Select Student</label>
                  <select
                    value={creditStudentId}
                    onChange={(e) => setCreditStudentId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  >
                    <option value="">-- Choose student profile --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} ({s.college_name || 'Student'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                    <select
                      value={creditCategory}
                      onChange={(e) => setCreditCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                    >
                      <option value="Food Discovery Credit">Food Discovery Credit</option>
                      <option value="Menu Research Credit">Menu Research Credit</option>
                      <option value="Food Trail Credit">Food Trail Credit</option>
                      <option value="Digital Innovation Credit">Digital Innovation Credit</option>
                      <option value="Leadership Credit">Leadership Credit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Points</label>
                    <input
                      type="number"
                      value={creditPoints}
                      onChange={(e) => setCreditPoints(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Audit Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Field Research: 5 Verified Menus in Nangloi"
                    value={creditTitle}
                    onChange={(e) => setCreditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors shadow-sm"
                >
                  Award Credits
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: HALL OF FAME PUBLISHER */}
        {/* ========================================================================= */}
        {activeTab === 'hall_of_fame' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">Publish to Hall of Fame</h3>
              <p className="text-xs text-stone-500 mb-5">
                Add an official champion or finalist award to the permanent honour roll.
              </p>

              <form onSubmit={handleCreateHof} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Competition Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Campus Food Trail Challenge 2026"
                    value={hofCompTitle}
                    onChange={(e) => setHofCompTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Winner Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Malhotra"
                      value={hofWinnerName}
                      onChange={(e) => setHofWinnerName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Award Rank</label>
                    <select
                      value={hofRank}
                      onChange={(e) => setHofRank(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                    >
                      <option value="Champion">Champion</option>
                      <option value="First Runner-Up">First Runner-Up</option>
                      <option value="Second Runner-Up">Second Runner-Up</option>
                      <option value="Finalist">Finalist</option>
                      <option value="Best Discovery">Best Discovery</option>
                      <option value="Jury Choice">Jury Choice</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">College</label>
                  <input
                    type="text"
                    placeholder="e.g. Faculty of Technology, Delhi University"
                    value={hofCollege}
                    onChange={(e) => setHofCollege(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Project Title</label>
                  <input
                    type="text"
                    placeholder="e.g. North Campus Maggi & Chai Map"
                    value={hofProjectTitle}
                    onChange={(e) => setHofProjectTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Citation / Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="Honoured for extraordinary ground documentation..."
                    value={hofCitation}
                    onChange={(e) => setHofCitation(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 text-white text-xs font-semibold rounded-xl hover:bg-amber-700 transition-colors shadow-sm"
                >
                  Publish to Honour Roll
                </button>
              </form>
            </div>

            {/* Existing Hall of Fame */}
            <div className="space-y-3">
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">Current Honour Roll Entries</h3>
              {hallOfFame.map((entry) => (
                <div key={entry.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-800">{entry.award_rank}</span>
                    <span className="text-[11px] text-stone-400">{entry.year}</span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-stone-900 mt-1">{entry.winner_name}</h4>
                  <p className="text-xs text-stone-600">{entry.competition_title}</p>
                  <p className="text-[11px] text-stone-500 italic mt-1">"{entry.citation}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {activeSubmission && (() => {
        const isGMM =
          activeSubmission.competition_id === 'great-market-mission' ||
          activeSubmission.title.toLowerCase().includes('market');
        const calculatedTotal = isGMM
          ? (Number(score1) || 0) + (Number(score2) || 0) + (Number(score3) || 0) + (Number(score4) || 0) + (Number(score5) || 0)
          : (Number(score1) || 0) + (Number(score2) || 0) + (Number(score3) || 0) + (Number(score4) || 0) + (Number(score5) || 0) + (Number(score6) || 0);

        return (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-xl my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                    Ref: {activeSubmission.reference_id}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">
                    {activeSubmission.title}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Challenge: {isGMM ? 'The Great Market Mission (Offline)' : 'The Foodverse Challenge (Online)'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-center">
                    <span className="text-[10px] font-bold text-[#0F766E] uppercase block">Jury Score</span>
                    <span className="text-lg font-black text-[#0F766E]">{calculatedTotal} / 100</span>
                  </div>
                </div>
              </div>

              {/* Deliverable Details Preview */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 mb-6 space-y-3">
                <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Deliverable Summary
                </p>
                <p className="text-xs text-stone-700">{activeSubmission.description}</p>

                <div className="flex flex-wrap gap-3 text-xs">
                  {activeSubmission.external_prototype_url && (
                    <a
                      href={activeSubmission.external_prototype_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0F766E] font-semibold underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open Prototype / Deck Link
                    </a>
                  )}
                  {activeSubmission.external_video_url && (
                    <a
                      href={activeSubmission.external_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF5A36] font-semibold underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Watch Video Walkthrough
                    </a>
                  )}
                  {activeSubmission.attachments && activeSubmission.attachments.length > 0 && (
                    <span className="text-stone-500">
                      📎 {activeSubmission.attachments.length} attachment(s)
                    </span>
                  )}
                </div>
              </div>

              <form onSubmit={handleSaveSubmissionReview} className="space-y-6">
                {/* 100-Point Scoring Breakdown */}
                <div className="border border-stone-200 rounded-2xl p-4 bg-white space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-[#0F766E]" />
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                        Official 100-Point Jury Scorecard
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-stone-500">Total: {calculatedTotal}/100</span>
                  </div>

                  {isGMM ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
                            <span>Mission 1: Hidden Gems</span>
                            <span className="font-bold">{score1} / 20</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={score1}
                            onChange={(e) => setScore1(parseInt(e.target.value, 10))}
                            className="w-full accent-[#0F766E]"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
                            <span>Mission 2: Menu Detective</span>
                            <span className="font-bold">{score2} / 25</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="25"
                            value={score2}
                            onChange={(e) => setScore2(parseInt(e.target.value, 10))}
                            className="w-full accent-[#0F766E]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
                            <span>Mission 3: Budget Battle</span>
                            <span className="font-bold">{score3} / 25</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="25"
                            value={score3}
                            onChange={(e) => setScore3(parseInt(e.target.value, 10))}
                            className="w-full accent-[#0F766E]"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
                            <span>Mission 4: Market Map</span>
                            <span className="font-bold">{score4} / 30</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="30"
                            value={score4}
                            onChange={(e) => setScore4(parseInt(e.target.value, 10))}
                            className="w-full accent-[#0F766E]"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
                          <span>Mystery Bonus & Ground Verification Authenticity</span>
                          <span className="font-bold">{score5} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={score5}
                          onChange={(e) => setScore5(parseInt(e.target.value, 10))}
                          className="w-full accent-[#0F766E]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
                            <span>1. Problem Understanding</span>
                            <span className="font-bold">{score1} / 20</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={score1}
                            onChange={(e) => setScore1(parseInt(e.target.value, 10))}
                            className="w-full accent-[#0F766E]"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
                            <span>2. Innovation & Originality</span>
                            <span className="font-bold">{score2} / 20</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={score2}
                            onChange={(e) => setScore2(parseInt(e.target.value, 10))}
                            className="w-full accent-[#0F766E]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
                            <span>3. Usability & Utility</span>
                            <span className="font-bold">{score3} / 20</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={score3}
                            onChange={(e) => setScore3(parseInt(e.target.value, 10))}
                            className="w-full accent-[#0F766E]"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
                            <span>4. Creativity & Visual Polish</span>
                            <span className="font-bold">{score4} / 20</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={score4}
                            onChange={(e) => setScore4(parseInt(e.target.value, 10))}
                            className="w-full accent-[#0F766E]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
                            <span>5. Presentation / Walkthrough</span>
                            <span className="font-bold">{score5} / 10</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={score5}
                            onChange={(e) => setScore5(parseInt(e.target.value, 10))}
                            className="w-full accent-[#0F766E]"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
                            <span>6. Completeness & Drops</span>
                            <span className="font-bold">{score6} / 10</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={score6}
                            onChange={(e) => setScore6(parseInt(e.target.value, 10))}
                            className="w-full accent-[#0F766E]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Evaluation Decision</label>
                  <select
                    value={subStatusInput}
                    onChange={(e) => setSubStatusInput(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  >
                    <option value="Under Review">Under Review</option>
                    <option value="Accepted">Accepted (Eligible for Certificate & Credits)</option>
                    <option value="Published">Published (Add to Public Student Showcase)</option>
                    <option value="Needs Correction">Needs Correction</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Student Visible Feedback / Jury Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide constructive feedback that the student will see in their dashboard..."
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Internal Jury Notes (Confidential)
                  </label>
                  <input
                    type="text"
                    placeholder="Private notes for jury audit..."
                    value={internalNotesInput}
                    onChange={(e) => setInternalNotesInput(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setActiveSubmission(null)}
                    className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shadow-sm"
                  >
                    Save Jury Decision & Score ({calculatedTotal}/100)
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Verify Food Discovery Modal */}
      {activeDiscovery && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-xl my-8">
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-1">
              Verify Spot: {activeDiscovery.food_place_name}
            </h3>
            <p className="text-xs text-stone-500 mb-4">{activeDiscovery.neighbourhood} • Dish: {activeDiscovery.featured_dish}</p>

            <form onSubmit={handleSaveDiscoveryVerification} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Verification Status</label>
                <select
                  value={discStatusInput}
                  onChange={(e) => setDiscStatusInput(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                >
                  <option value="Verified by Menu Maps">Verified by Menu Maps</option>
                  <option value="Needs Correction">Needs Correction</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Official Verified Counter Rate (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 70"
                  value={verifiedRateInput}
                  onChange={(e) => setVerifiedRateInput(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Internal Verification Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes on in-person counter verification, bills checked, or hours..."
                  value={discNotesInput}
                  onChange={(e) => setDiscNotesInput(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setActiveDiscovery(null)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c]"
                >
                  Confirm Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Competition Modal */}
      {showCreateCompModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-xl my-8">
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-1">
              Create New Competition
            </h3>
            <p className="text-xs text-stone-500 mb-4">Launch a new online or offline exploration challenge.</p>

            <form onSubmit={handleCreateCompetition} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Challenge Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Connaught Place Heritage Food Walk"
                  value={compTitle}
                  onChange={(e) => setCompTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={compCategory}
                    onChange={(e) => setCompCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  >
                    <option value="Online Creative Challenge">Online Creative Challenge</option>
                    <option value="Offline Exploration">Offline Exploration</option>
                    <option value="Design & UX">Design & UX</option>
                    <option value="Research & Documentation">Research & Documentation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Format</label>
                  <select
                    value={compFormat}
                    onChange={(e) => setCompFormat(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Short Summary</label>
                <input
                  type="text"
                  required
                  placeholder="One sentence description for discovery cards..."
                  value={compShortDesc}
                  onChange={(e) => setCompShortDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Submission Deadline</label>
                <input
                  type="date"
                  required
                  value={compDeadline}
                  onChange={(e) => setCompDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Prize / Reward Label</label>
                <input
                  type="text"
                  placeholder="e.g. ₹15,000 Cash Prize + Certificate"
                  value={compRewardTitle}
                  onChange={(e) => setCompRewardTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCreateCompModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c]"
                >
                  Publish Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
