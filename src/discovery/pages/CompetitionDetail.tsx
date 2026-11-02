/**
 * Menu Maps Discovery - Competition Detail Page (/discovery/competitions/:slug)
 * Comprehensive, production-grade challenge page with real registration, team formation,
 * tasks, missions, challenge tracks, drops, judging criteria, timeline, rewards, and FAQs.
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
  MapPin,
  Laptop,
  ShieldCheck,
  Flame,
  Layers,
  ChevronRight,
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

  // Common Registration State
  const [teamName, setTeamName] = useState('');
  const [teamCodeGenerated, setTeamCodeGenerated] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Great Market Mission Specific Registration State
  const [selectedMarket, setSelectedMarket] = useState('Kamla Nagar');
  const [member2Name, setMember2Name] = useState('');
  const [member2Email, setMember2Email] = useState('');
  const [member3Name, setMember3Name] = useState('');
  const [member3Email, setMember3Email] = useState('');
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);

  // Foodverse Challenge Specific Registration State
  const [isTeamMode, setIsTeamMode] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState('Track 01 — ₹150 Food Explorer');
  const [rulesAgreed, setRulesAgreed] = useState(false);

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

    const isGMM = competition.slug === 'great-market-mission';
    const isFVC = competition.slug === 'foodverse-challenge';

    // Great Market Mission validation
    if (isGMM) {
      if (!teamName.trim()) {
        showToast('Please provide a squad/team name.', 'error');
        return;
      }
      if (!member2Name.trim() || !member2Email.trim()) {
        showToast('The Great Market Mission requires at least 2 team members. Please provide Member 2 details.', 'error');
        return;
      }
      if (!safetyConfirmed) {
        showToast('Please confirm agreement to the safety and vendor etiquette rules.', 'error');
        return;
      }
    }

    // Foodverse validation
    if (isFVC && isTeamMode && !teamName.trim()) {
      showToast('Please enter a team name for team participation.', 'error');
      return;
    }

    const teamMembersInfo = [];
    if (isGMM && member2Name.trim()) {
      teamMembersInfo.push({ name: member2Name.trim(), email: member2Email.trim() });
    }
    if (isGMM && member3Name.trim()) {
      teamMembersInfo.push({ name: member3Name.trim(), email: member3Email.trim() });
    }

    const effectiveIsTeam = isGMM ? true : (isFVC ? isTeamMode : competition.is_team_competition);

    setRegistering(true);
    try {
      const res = await discoveryApi.registerForCompetition({
        competitionId: competition.id,
        studentId: student.id,
        isTeam: effectiveIsTeam,
        teamName: effectiveIsTeam ? teamName.trim() : undefined,
        selectedMarket: isGMM ? selectedMarket : undefined,
        selectedTrack: isFVC ? selectedTrack : undefined,
        safetyRulesConfirmed: isGMM ? safetyConfirmed : true,
        teamMembersInfo: teamMembersInfo.length > 0 ? teamMembersInfo : undefined,
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
            Browse All Competitions
          </button>
        </div>
      </div>
    );
  }

  const isRegistrationOpen = competition.status === 'Registration Open';
  const isGMM = competition.slug === 'great-market-mission';
  const isFVC = competition.slug === 'foodverse-challenge';

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar currentPath={`/discovery/competitions/${slug}`} navigate={navigate} />

      {/* Series Header Pill Banner */}
      {competition.series_name && (
        <div className="bg-[#FAF8F5] border-b border-[#E7E2DA] py-2 px-4 text-center">
          <button
            onClick={() => navigate('/discovery/competitions/discovery-league')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0F766E] hover:underline"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Part of {competition.series_name} • {competition.season || 'Season 01'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-white border-b border-[#E7E2DA] pt-8 sm:pt-12 pb-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8">
          <button
            onClick={() => navigate('/discovery/competitions')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#78716C] hover:text-[#0F766E] mb-6 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Competitions</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  competition.format === 'Offline'
                    ? 'bg-[#FF5A36] text-white'
                    : 'bg-[#0F766E] text-white'
                }`}>
                  {competition.format === 'Offline' ? <MapPin className="w-3 h-3 inline mr-1" /> : <Laptop className="w-3 h-3 inline mr-1" />}
                  {competition.format} Exploration
                </span>
                <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold">
                  {competition.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                  {competition.is_team_competition
                    ? `Teams of ${competition.min_team_size}–${competition.max_team_size}`
                    : 'Individual or Squads'}
                </span>
              </div>

              <h1 className="hd text-3xl sm:text-4xl md:text-5xl font-black text-[#1C1917] tracking-tight">
                {competition.title}
              </h1>

              {competition.tagline && (
                <p className="font-serif italic text-lg sm:text-xl text-[#FF5A36] font-semibold">
                  "{competition.tagline}"
                </p>
              )}

              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed max-w-2xl">
                {competition.short_description}
              </p>

              <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-stone-600">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#0F766E]" />
                  <span>
                    {competition.submission_deadline
                      ? `Deadline: ${new Date(competition.submission_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : 'Dates to be announced by Admin'}
                  </span>
                </span>
                <span>•</span>
                <span>No Purchase Required</span>
                <span>•</span>
                <span>Free Student Participation</span>
              </div>
            </div>

            {/* Quick Action / Registration Box */}
            <div className="lg:col-span-4 bg-[#FAF8F5] border border-[#E7E2DA] rounded-3xl p-6 space-y-4 shadow-2xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                  Challenge Status
                </span>
                <div className="font-bold text-base text-[#1C1917] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{competition.status}</span>
                </div>
              </div>

              {isRegistered ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>You are registered for this challenge</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Submit your deliverables or track jury review directly from your dashboard.
                  </p>
                  <button
                    onClick={() => navigate('/discovery/dashboard?tab=competitions')}
                    className="w-full py-2.5 bg-[#0F766E] text-white text-xs font-bold rounded-xl mt-1 hover:bg-[#0d635c] transition-colors"
                  >
                    Open Student Dashboard &rarr;
                  </button>
                </div>
              ) : isRegistrationOpen ? (
                <div className="space-y-3">
                  {/* Great Market Mission Registration Form */}
                  {isGMM && (
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block mb-0.5">
                          Squad / Team Name *
                        </label>
                        <input
                          type="text"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="e.g. North Campus Foodies"
                          className="w-full bg-white border border-[#E7E2DA] rounded-xl px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-[#0F766E]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block mb-0.5">
                          Market to Explore *
                        </label>
                        <select
                          value={selectedMarket}
                          onChange={(e) => setSelectedMarket(e.target.value)}
                          className="w-full bg-white border border-[#E7E2DA] rounded-xl px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-[#0F766E]"
                        >
                          {competition.allowed_locations?.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-[#E7E2DA] space-y-2">
                        <p className="font-bold text-[10px] uppercase text-stone-500">Team Members (2–3 Students):</p>
                        <p className="text-[10px] text-stone-400">Leader: {student?.full_name || 'You (Logged In)'}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            placeholder="Member 2 Name *"
                            value={member2Name}
                            onChange={(e) => setMember2Name(e.target.value)}
                            className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-[11px]"
                          />
                          <input
                            type="email"
                            placeholder="Member 2 Email *"
                            value={member2Email}
                            onChange={(e) => setMember2Email(e.target.value)}
                            className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-[11px]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            placeholder="Member 3 (Optional)"
                            value={member3Name}
                            onChange={(e) => setMember3Name(e.target.value)}
                            className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-[11px]"
                          />
                          <input
                            type="email"
                            placeholder="Member 3 Email"
                            value={member3Email}
                            onChange={(e) => setMember3Email(e.target.value)}
                            className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-[11px]"
                          />
                        </div>
                      </div>

                      <label className="flex items-start gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={safetyConfirmed}
                          onChange={(e) => setSafetyConfirmed(e.target.checked)}
                          className="w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E] mt-0.5"
                        />
                        <span className="text-[10px] text-stone-600 leading-snug">
                          My team agrees to daytime public exploration, vendor courtesy, no trespassing, and honest counter rates.
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Foodverse Challenge Registration Form */}
                  {isFVC && (
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block mb-0.5">
                          Participation Format
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setIsTeamMode(false)}
                            className={`py-1.5 rounded-xl font-bold border transition-colors ${
                              !isTeamMode
                                ? 'bg-[#0F766E] text-white border-[#0F766E]'
                                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                            }`}
                          >
                            Individual (Solo)
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsTeamMode(true)}
                            className={`py-1.5 rounded-xl font-bold border transition-colors ${
                              isTeamMode
                                ? 'bg-[#0F766E] text-white border-[#0F766E]'
                                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                            }`}
                          >
                            Team (Up to 4)
                          </button>
                        </div>
                      </div>

                      {isTeamMode && (
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block mb-0.5">
                            Team Name *
                          </label>
                          <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="e.g. Pixel Cravers"
                            className="w-full bg-white border border-[#E7E2DA] rounded-xl px-3 py-2 text-xs outline-hidden"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block mb-0.5">
                          Primary Challenge Track
                        </label>
                        <select
                          value={selectedTrack}
                          onChange={(e) => setSelectedTrack(e.target.value)}
                          className="w-full bg-white border border-[#E7E2DA] rounded-xl px-3 py-2 text-xs outline-hidden"
                        >
                          <option value="Track 01 — ₹150 Food Explorer">Track 01 — ₹150 Food Explorer</option>
                          <option value="Track 02 — Vegetarian Food Hunter">Track 02 — Vegetarian Food Hunter</option>
                          <option value="Track 03 — Hidden Delhi Food Explorer">Track 03 — Hidden Delhi Food Explorer</option>
                          <option value="Track 04 — Friends Food Planner">Track 04 — Friends Food Planner</option>
                          <option value="Track 05 — Best Dish for Your Budget">Track 05 — Best Dish for Your Budget</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Generic Challenge Fallback Form */}
                  {!isGMM && !isFVC && competition.is_team_competition && (
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
                    className="w-full py-3 bg-[#0F766E] hover:bg-[#0d635c] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {registering ? 'Confirming Registration...' : 'Register for Challenge (Free)'}
                  </button>

                  <p className="text-[10px] text-stone-400 text-center">
                    100% free for all students. Zero mandatory purchases.
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
                    Share this code with teammates so they can link their profiles to your squad.
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
            {/* 1. About the Challenge */}
            <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="hd text-xl sm:text-2xl font-bold text-[#1C1917]">About the Challenge</h2>
              <div className="text-xs sm:text-sm text-[#57534E] leading-relaxed whitespace-pre-line">
                {competition.description}
              </div>
            </div>

            {/* 2. THE 4 MISSION TASKS (for Great Market Mission) */}
            {competition.missions && competition.missions.length > 0 && (
              <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0F766E] bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                    Core Mission Structure (100 Points Total)
                  </span>
                  <h2 className="hd text-xl sm:text-2xl font-bold text-[#1C1917] mt-2">
                    The Four Field Missions
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Your team must complete all four sequential missions in your selected market:
                  </p>
                </div>

                <div className="space-y-4">
                  {competition.missions.map((mission) => (
                    <div
                      key={mission.mission_number}
                      className="p-5 rounded-2xl border border-stone-200 bg-[#FAF8F5]/80 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-base font-bold text-stone-900">
                          Mission 0{mission.mission_number} — {mission.title}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-teal-100 text-[#0F766E] font-black text-xs">
                          {mission.points} Points
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 font-semibold">{mission.task_summary}</p>
                      
                      <div className="space-y-1.5 text-xs text-stone-600">
                        {mission.instructions.map((inst, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-[#0F766E] font-bold">•</span>
                            <span>{inst}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-stone-200/60 flex flex-wrap items-center gap-4 text-[11px] text-stone-500">
                        <span><strong>Deliverable:</strong> {mission.deliverables.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2b. MYSTERY BONUS CHALLENGES (Great Market Mission) */}
            {competition.bonus_challenges && competition.bonus_challenges.length > 0 && (
              <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="hd text-xl font-bold text-[#1C1917]">Optional Mystery Bonus Challenges</h3>
                </div>
                <p className="text-xs text-stone-500">
                  Earn extra bonus points for your team! Fixed transparent scoring rules apply.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {competition.bonus_challenges.map((bonus, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-950">{bonus.title}</span>
                        <span className="font-black text-emerald-700">+{bonus.points} Pts</span>
                      </div>
                      <p className="text-stone-700">{bonus.description}</p>
                      <p className="text-[11px] text-stone-500 italic mt-1">{bonus.condition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. CHALLENGE TRACKS (for Foodverse Challenge) */}
            {competition.tracks && competition.tracks.length > 0 && (
              <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5A36] bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                    5 Challenge Tracks
                  </span>
                  <h2 className="hd text-xl sm:text-2xl font-bold text-[#1C1917] mt-2">
                    Choose Your Focus Track
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Select one real food discovery problem to research and solve:
                  </p>
                </div>

                <div className="space-y-4">
                  {competition.tracks.map((track) => (
                    <div
                      key={track.track_number}
                      className="p-5 rounded-2xl border border-stone-200 bg-[#FAF8F5]/80 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-base font-bold text-stone-900">
                          Track 0{track.track_number}: {track.title}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-800 text-[10px] font-bold">
                          Selectable Track
                        </span>
                      </div>
                      <p className="text-xs text-stone-800 font-semibold italic">"{track.problem_statement}"</p>
                      <p className="text-xs text-stone-600">
                        <strong>Target User:</strong> {track.target_user}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {track.suggested_features.map((f, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-[11px] text-stone-700 font-medium">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3b. SECRET CHALLENGE DROPS (Foodverse Challenge) */}
            {competition.challenge_drops && competition.challenge_drops.length > 0 && (
              <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#FF5A36]" />
                    <h3 className="hd text-xl font-bold text-[#1C1917]">Foodverse Challenge Drops</h3>
                  </div>
                  <span className="text-xs text-stone-400 font-medium">Released during challenge</span>
                </div>
                <p className="text-xs text-stone-500">
                  Surprise creative prompts dropped to stretch your product design and test real-world user empathy:
                </p>

                <div className="space-y-3">
                  {competition.challenge_drops.map((drop) => (
                    <div
                      key={drop.id}
                      className={`p-4 rounded-2xl border text-xs space-y-1.5 transition-colors ${
                        drop.is_published
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                          : 'bg-stone-50 border-stone-200 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          <span>{drop.day_label}: {drop.title}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          drop.is_published ? 'bg-amber-200 text-amber-900' : 'bg-stone-200 text-stone-600'
                        }`}>
                          {drop.is_published ? 'Released' : 'Secret until Scheduled Day'}
                        </span>
                      </div>
                      <p className="text-stone-700 leading-relaxed">
                        {drop.is_published ? drop.prompt : 'Locked challenge constraint. Unlocks for all participants on schedule.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Safety & Fair Participation Rules */}
            {competition.safety_guidelines && competition.safety_guidelines.length > 0 && (
              <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-3">
                <h3 className="hd text-lg font-bold text-stone-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0F766E]" />
                  <span>Safety, Ethics & Fair Participation Rules</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-stone-600">
                  {competition.safety_guidelines.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 5. Required Deliverables */}
            <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="hd text-xl sm:text-2xl font-bold text-[#1C1917]">Required Deliverables</h2>
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
                  Max File Limit: <strong className="text-stone-800">{competition.max_file_size_mb} MB</strong>
                </span>
              </div>
            </div>

            {/* 6. 100-Point Judging Criteria */}
            {competition.judging_criteria && competition.judging_criteria.length > 0 && (
              <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 sm:p-8 space-y-4">
                <h2 className="hd text-xl sm:text-2xl font-bold text-[#1C1917]">Official 100-Point Evaluation Matrix</h2>
                <div className="space-y-3">
                  {competition.judging_criteria.map((crit, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA] flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-[#1C1917]">{crit.title}</h4>
                        <p className="text-xs text-stone-500 mt-0.5">{crit.description}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-teal-100 text-[#0F766E] text-xs font-black shrink-0">
                        {crit.weight_percent} Points
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. FAQs */}
            {competition.faqs && competition.faqs.length > 0 && (
              <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 sm:p-8 space-y-4">
                <h2 className="hd text-xl sm:text-2xl font-bold text-[#1C1917]">Frequently Asked Questions</h2>
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
                <span>Timeline & Schedule</span>
              </h3>

              <div className="space-y-3">
                {competition.registration_start_date && (
                  <div>
                    <span className="text-stone-400 block font-medium">Registration Window</span>
                    <span className="font-bold text-stone-800">
                      {new Date(competition.registration_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {competition.registration_end_date ? new Date(competition.registration_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                    </span>
                  </div>
                )}

                {competition.competition_start_date && (
                  <div>
                    <span className="text-stone-400 block font-medium">Active Challenge Days</span>
                    <span className="font-bold text-stone-800">
                      {new Date(competition.competition_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {competition.competition_end_date ? new Date(competition.competition_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                    </span>
                  </div>
                )}

                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                  <span className="text-rose-700 block font-bold">Hard Submission Deadline</span>
                  <span className="font-black text-sm text-[#D8350F]">
                    {competition.submission_deadline
                      ? new Date(competition.submission_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'Dates to be announced'}
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
                {competition.contact_info || 'Reach out to the community jury team at discovery@menumaps.in for questions.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
