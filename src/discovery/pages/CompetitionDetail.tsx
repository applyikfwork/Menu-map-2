/**
 * Menu Maps Discovery - Competition Detail Page (/discovery/competitions/:slug)
 * Comprehensive, production-grade challenge page with real registration, team formation,
 * tasks, judging criteria, timeline, rewards, and FAQs.
 */

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  Users,
  Award,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Sparkles,
  HelpCircle,
  Mail,
  Copy,
  Check,
  Send,
  UserCheck,
} from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { DiscoveryCompetition, CompetitionRegistration, CompetitionTeam } from '../types/discovery';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useToast } from '../../components/Toast';

interface CompetitionDetailProps {
  slug: string;
  navigate: (path: string) => void;
}

export const CompetitionDetail: React.FC<CompetitionDetailProps> = ({ slug, navigate }) => {
  const { student, isAuthenticated } = useStudentAuth();
  const { showToast } = useToast();

  const [competition, setCompetition] = useState<DiscoveryCompetition | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  // Team Registration Form
  const [teamName, setTeamName] = useState('');
  const [teamCodeGenerated, setTeamCodeGenerated] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [slug]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const comp = await discoveryApi.getCompetitionBySlug(slug);
      setCompetition(comp);

      if (comp && student) {
        const regs = await discoveryApi.getStudentRegistrations(student.id);
        const match = regs.find((r) => r.competition_id === comp.id && r.status !== 'Withdrawn');
        if (match) {
          setIsRegistered(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated || !student) {
      showToast('Please sign in or register as a student to participate.', 'info');
      navigate('/discovery/login');
      return;
    }

    if (!competition) return;

    if (competition.is_team_competition && !teamName.trim()) {
      showToast('Please provide a team name for team registration.', 'error');
      return;
    }

    setRegistering(true);
    try {
      const res = await discoveryApi.registerForCompetition({
        competitionId: competition.id,
        studentId: student.id,
        isTeam: competition.is_team_competition,
        teamName: competition.is_team_competition ? teamName.trim() : undefined,
      });

      if (res.success) {
        setIsRegistered(true);
        if (res.team) {
          setTeamCodeGenerated(res.team.team_code);
        }
        showToast('Registration confirmed successfully!', 'success');
      } else {
        showToast(res.error || 'Registration failed.', 'error');
      }
    } finally {
      setRegistering(false);
    }
  };

  const copyTeamCode = () => {
    if (teamCodeGenerated) {
      navigator.clipboard.writeText(teamCodeGenerated);
      setCopiedCode(true);
      showToast('Team code copied to clipboard!', 'success');
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <DiscoveryNavbar currentPath={`/discovery/competitions/${slug}`} navigate={navigate} />
        <div className="py-24 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#0F766E] border-t-transparent animate-spin mx-auto mb-3" />
          <span className="text-xs text-stone-500 font-semibold">Loading challenge details...</span>
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <DiscoveryNavbar currentPath={`/discovery/competitions/${slug}`} navigate={navigate} />
        <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
          <Trophy className="w-12 h-12 text-stone-300 mx-auto" />
          <h2 className="hd text-xl font-bold text-[#1C1917]">Challenge Not Found</h2>
          <p className="text-xs text-stone-500">
            This competition may have concluded or the link has changed.
          </p>
          <button
            onClick={() => navigate('/discovery/competitions')}
            className="btn bg-[#0F766E] text-white px-5 py-2.5 rounded-xl text-xs font-bold"
          >
            Browse All Challenges
          </button>
        </div>
      </div>
    );
  }

  const isRegistrationOpen = competition.status === 'Registration Open';

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar currentPath={`/discovery/competitions/${slug}`} navigate={navigate} />

      {/* Hero Banner */}
      <section className="bg-white border-b border-[#E7E2DA] pt-8 pb-12 sm:pb-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8">
          <button
            onClick={() => navigate('/discovery/competitions')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Competitions</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  {competition.status}
                </span>
                <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold">
                  {competition.format}
                </span>
                <span className="px-3 py-1 rounded-full bg-teal-50 text-[#0F766E] text-xs font-bold">
                  {competition.category}
                </span>
              </div>

              <h1 className="hd text-3xl sm:text-5xl font-black text-[#1C1917] tracking-tight leading-tight">
                {competition.title}
              </h1>

              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed max-w-2xl">
                {competition.short_description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-600 pt-2">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#0F766E]" />
                  <span>
                    {competition.is_team_competition
                      ? `Team (${competition.min_team_size}–${competition.max_team_size} members)`
                      : 'Individual participation'}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#FF5A36]" />
                  <span>Submissions close {new Date(competition.submission_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </span>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="lg:col-span-4 bg-[#FAF8F5] border border-[#E7E2DA] rounded-3xl p-6 space-y-4 shadow-2xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                  Challenge Status
                </span>
                <div className="font-bold text-base text-[#1C1917]">{competition.status}</div>
              </div>

              {isRegistered ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>You are registered for this challenge</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Prepare your deliverables and submit work directly from your student dashboard before the deadline.
                  </p>
                  <button
                    onClick={() => navigate('/discovery/dashboard?tab=submissions')}
                    className="btn w-full bg-[#0F766E] text-white min-h-[40px] text-xs font-bold rounded-xl mt-1"
                  >
                    Open Submission Desk &rarr;
                  </button>
                </div>
              ) : isRegistrationOpen ? (
                <div className="space-y-3">
                  {competition.is_team_competition && (
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                        Team Name *
                      </label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g. The Delhi Trailblazers"
                        className="w-full bg-white border border-[#E7E2DA] rounded-xl px-3 py-2 text-xs outline-hidden"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="btn w-full bg-[#0F766E] hover:bg-[#0D9488] text-white min-h-[46px] rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {registering ? 'Confirming Registration...' : 'Register for Challenge (Free)'}
                  </button>

                  <p className="text-[10px] text-stone-400 text-center">
                    Registration is 100% free for verified students.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-stone-100 text-stone-600 text-xs text-center font-medium">
                  Registration is currently closed for this challenge.
                </div>
              )}

              {teamCodeGenerated && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5 text-xs">
                  <div className="font-bold">Team Code Created:</div>
                  <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-amber-200 font-mono font-bold text-sm">
                    <span>{teamCodeGenerated}</span>
                    <button onClick={copyTeamCode} className="text-[#0F766E] font-bold flex items-center gap-1">
                      {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-800">
                    Share this code with your teammates so they can link their accounts to your squad.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Body: Full Challenge Brief */}
      <section className="py-12 max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {/* 1. About */}
            <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="hd text-xl sm:text-2xl font-bold text-[#1C1917]">About the Challenge</h2>
              <div className="text-xs sm:text-sm text-[#57534E] leading-relaxed whitespace-pre-line">
                {competition.description}
              </div>
            </div>

            {/* 2. Tasks & Instructions */}
            {competition.tasks_instructions && competition.tasks_instructions.length > 0 && (
              <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 sm:p-8 space-y-4">
                <h2 className="hd text-xl font-bold text-[#1C1917]">Tasks & Instructions</h2>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#57534E]">
                  {competition.tasks_instructions.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-teal-50 text-[#0F766E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 3. Deliverables & Required Formats */}
            <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="hd text-xl font-bold text-[#1C1917]">Required Deliverables</h2>
              <ul className="space-y-2 text-xs sm:text-sm text-[#57534E]">
                {competition.required_deliverables?.map((deliv, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{deliv}</span>
                  </li>
                ))}
              </ul>

              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA] flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-stone-500 font-medium">
                  Accepted Formats: <strong className="text-stone-800">{competition.allowed_file_formats?.join(', ')}</strong>
                </span>
                <span className="text-stone-500 font-medium">
                  Max Size: <strong className="text-stone-800">{competition.max_file_size_mb} MB</strong>
                </span>
              </div>
            </div>

            {/* 4. Judging Criteria */}
            {competition.judging_criteria && competition.judging_criteria.length > 0 && (
              <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 sm:p-8 space-y-4">
                <h2 className="hd text-xl font-bold text-[#1C1917]">Judging Criteria</h2>
                <div className="space-y-3">
                  {competition.judging_criteria.map((crit, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA] flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-[#1C1917]">{crit.title}</h4>
                        <p className="text-xs text-stone-500 mt-0.5">{crit.description}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-teal-100 text-[#0F766E] text-xs font-black shrink-0">
                        {crit.weight_percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. FAQs */}
            {competition.faqs && competition.faqs.length > 0 && (
              <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 sm:p-8 space-y-4">
                <h2 className="hd text-xl font-bold text-[#1C1917]">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {competition.faqs.map((faq, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA] space-y-1">
                      <h4 className="font-bold text-sm text-[#1C1917] flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-[#0F766E] shrink-0" />
                        <span>{faq.question}</span>
                      </h4>
                      <p className="text-xs text-stone-600 pl-6 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Timeline & Rewards */}
          <div className="lg:col-span-4 space-y-6">
            {/* Rewards Card */}
            {competition.rewards && competition.rewards.length > 0 && (
              <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="hd text-base font-bold text-[#1C1917]">Rewards & Recognition</h3>
                </div>

                <div className="space-y-2.5">
                  {competition.rewards.map((r, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs">
                      <strong className="text-amber-950 font-bold block">{r.title}</strong>
                      {r.prize && <span className="text-[#D8350F] font-black block mt-0.5">{r.prize}</span>}
                      <span className="text-stone-600 text-[11px] block mt-0.5">{r.recognition}</span>
                    </div>
                  ))}
                </div>

                {competition.certificate_eligibility && (
                  <p className="text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                    📜 {competition.certificate_eligibility}
                  </p>
                )}
              </div>
            )}

            {/* Timeline Card */}
            <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 space-y-4 shadow-2xs text-xs">
              <h3 className="hd text-base font-bold text-[#1C1917] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0F766E]" />
                <span>Important Dates</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-stone-400 block font-medium">Registration Window</span>
                  <span className="font-bold text-stone-800">
                    {new Date(competition.registration_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(competition.registration_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 block font-medium">Challenge Duration</span>
                  <span className="font-bold text-stone-800">
                    {new Date(competition.competition_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(competition.competition_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                  <span className="text-rose-700 block font-bold">Hard Submission Deadline</span>
                  <span className="font-black text-sm text-[#D8350F]">
                    {new Date(competition.submission_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Support Box */}
            <div className="bg-[#FAF8F5] border border-[#E7E2DA] rounded-3xl p-5 space-y-2 text-xs">
              <h4 className="font-bold text-stone-800 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Support & Queries</span>
              </h4>
              <p className="text-stone-500 leading-relaxed">
                {competition.contact_info || 'Reach out to the community jury team at contact@menumaps.in for questions.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
