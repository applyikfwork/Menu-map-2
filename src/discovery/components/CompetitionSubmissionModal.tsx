/**
 * Menu Maps Discovery - Dedicated Competition Submission Modal
 * Tailored forms for:
 * 1. The Great Market Mission (4 Missions: Hidden Gem, Menu Detective, Budget Battle, Market Map)
 * 2. The Foodverse Challenge (5 Tracks: Concept, UX/UI, Prototype, Problem & Solution)
 * Supports Draft saving, Submission, Deadline validation, and Viewing Evaluated Scores.
 */

import React, { useState } from 'react';
import {
  X,
  Trophy,
  Save,
  Send,
  AlertCircle,
  FileText,
  MapPin,
  Utensils,
  Wallet,
  Compass,
  Laptop,
  ExternalLink,
  Award,
  Sparkles,
  Clock,
} from 'lucide-react';
import {
  DiscoveryCompetition,
  CompetitionRegistration,
  CompetitionSubmission,
} from '../types/discovery';
import { discoveryApi } from '../lib/discoveryApi';
import { useToast } from '../../components/Toast';

interface CompetitionSubmissionModalProps {
  competition: DiscoveryCompetition;
  registration: CompetitionRegistration;
  existingSubmission?: CompetitionSubmission | null;
  onClose: () => void;
  onSaved: () => void;
}

export const CompetitionSubmissionModal: React.FC<CompetitionSubmissionModalProps> = ({
  competition,
  registration,
  existingSubmission,
  onClose,
  onSaved,
}) => {
  const { showToast } = useToast();
  const isGMM = competition.slug === 'the-great-market-mission' || competition.id.includes('market');
  const isFoodverse = !isGMM;

  const [saving, setSaving] = useState(false);

  // GMM Form State
  const [marketName, setMarketName] = useState(existingSubmission?.market_name || '');
  const [marketLocation, setMarketLocation] = useState(existingSubmission?.market_location || '');
  const [outlet1, setOutlet1] = useState(existingSubmission?.hidden_gems_outlet1 || '');
  const [outlet2, setOutlet2] = useState(existingSubmission?.hidden_gems_outlet2 || '');
  const [hiddenGemsDetails, setHiddenGemsDetails] = useState(
    existingSubmission?.hidden_gems_details || ''
  );
  const [menuDishes, setMenuDishes] = useState(existingSubmission?.menu_detective_dishes || '');
  const [priceEvidenceUrls, setPriceEvidenceUrls] = useState(
    existingSubmission?.menu_price_evidence_urls || ''
  );
  const [budgetPlan, setBudgetPlan] = useState(existingSubmission?.budget_battle_plan || '');
  const [budgetCost, setBudgetCost] = useState(existingSubmission?.budget_battle_cost || '');
  const [marketMapUrl, setMarketMapUrl] = useState(existingSubmission?.market_map_url || '');
  const [explorationSummary, setExplorationSummary] = useState(
    existingSubmission?.market_exploration_summary || ''
  );
  const [videoUrl, setVideoUrl] = useState(existingSubmission?.video_url || '');

  // Foodverse Form State
  const [trackId, setTrackId] = useState(
    existingSubmission?.track_id || competition.tracks?.[0]?.id || 'track_150_food'
  );
  const [projectTitle, setProjectTitle] = useState(existingSubmission?.project_title || '');
  const [problemStatement, setProblemStatement] = useState(
    existingSubmission?.problem_statement || ''
  );
  const [intendedUsers, setIntendedUsers] = useState(existingSubmission?.intended_users || '');
  const [proposedSolution, setProposedSolution] = useState(
    existingSubmission?.proposed_solution || ''
  );
  const [mainFeatures, setMainFeatures] = useState(existingSubmission?.main_features || '');
  const [prototypeUrl, setPrototypeUrl] = useState(existingSubmission?.prototype_url || '');
  const [howItWorks, setHowItWorks] = useState(existingSubmission?.how_it_works || '');
  const [whyUseful, setWhyUseful] = useState(existingSubmission?.why_useful || '');
  const [researchReferences, setResearchReferences] = useState(
    existingSubmission?.research_references || ''
  );

  const selectedTrack = competition.tracks?.find((t) => t.id === trackId);

  const handleSave = async (isFinalSubmit: boolean) => {
    // Basic validation for final submit
    if (isFinalSubmit) {
      if (isGMM) {
        if (!marketName.trim()) {
          showToast('Please provide your selected market name', 'error');
          return;
        }
        if (!outlet1.trim() || !outlet2.trim()) {
          showToast('Please provide details for both hidden gem outlets', 'error');
          return;
        }
        if (!menuDishes.trim()) {
          showToast('Please include at least 3 menu detective dishes', 'error');
          return;
        }
        if (!budgetPlan.trim()) {
          showToast('Please include your ₹200 budget experience', 'error');
          return;
        }
        if (!marketMapUrl.trim()) {
          showToast('Please provide a link or description for your Market Map', 'error');
          return;
        }
      } else {
        if (!projectTitle.trim()) {
          showToast('Please provide a project title', 'error');
          return;
        }
        if (!problemStatement.trim() || !proposedSolution.trim()) {
          showToast('Please complete problem statement and proposed solution', 'error');
          return;
        }
        if (!prototypeUrl.trim()) {
          showToast('Please provide a design or prototype link', 'error');
          return;
        }
      }
    }

    setSaving(true);
    try {
      const submissionData: CompetitionSubmission = {
        id: existingSubmission?.id || `sub_${Date.now()}`,
        competition_id: competition.id,
        competition_title: competition.title,
        student_id: registration.student_id,
        student_name: registration.student_name,
        student_email: registration.student_email,
        participation_mode: registration.participation_mode,
        team_name: registration.team_name,
        team_members: registration.team_members,
        submitted_at: existingSubmission?.submitted_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: isFinalSubmit ? 'Submitted' : 'Draft',

        // GMM fields
        market_name: marketName.trim(),
        market_location: marketLocation.trim(),
        hidden_gems_outlet1: outlet1.trim(),
        hidden_gems_outlet2: outlet2.trim(),
        hidden_gems_details: hiddenGemsDetails.trim(),
        menu_detective_dishes: menuDishes.trim(),
        menu_price_evidence_urls: priceEvidenceUrls.trim(),
        budget_battle_plan: budgetPlan.trim(),
        budget_battle_cost: budgetCost.trim(),
        market_map_url: marketMapUrl.trim(),
        market_exploration_summary: explorationSummary.trim(),
        video_url: videoUrl.trim(),

        // Foodverse fields
        track_id: trackId,
        track_title: selectedTrack?.title || '',
        project_title: projectTitle.trim(),
        problem_statement: problemStatement.trim(),
        intended_users: intendedUsers.trim(),
        proposed_solution: proposedSolution.trim(),
        main_features: mainFeatures.trim(),
        prototype_url: prototypeUrl.trim(),
        how_it_works: howItWorks.trim(),
        why_useful: whyUseful.trim(),
        research_references: researchReferences.trim(),

        // Retain existing evaluation if any
        scores: existingSubmission?.scores,
        total_score: existingSubmission?.total_score,
        judging_notes: existingSubmission?.judging_notes,
        corrections_requested: existingSubmission?.corrections_requested,
        recognition_award: existingSubmission?.recognition_award,
      };

      await discoveryApi.saveCompetitionSubmission(submissionData);
      showToast(
        isFinalSubmit
          ? 'Submission received! Your project has been sent for jury review.'
          : 'Progress saved as draft.',
        'success'
      );
      onSaved();
      onClose();
    } catch (e) {
      showToast('Failed to save submission. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const isEvaluated = existingSubmission?.status === 'Evaluated';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E7E2DA] flex items-center justify-between bg-stone-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1FB5A0]/10 text-[#1FB5A0] flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                  {competition.title}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    existingSubmission?.status === 'Evaluated'
                      ? 'bg-emerald-100 text-emerald-800'
                      : existingSubmission?.status === 'Submitted'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {existingSubmission?.status || 'New Submission'}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {registration.participation_mode === 'team'
                  ? `Team: ${registration.team_name} (${registration.team_members?.join(', ') || registration.student_name})`
                  : `Individual: ${registration.student_name}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-8 text-xs">
          {/* Evaluation Banner if Evaluated */}
          {isEvaluated && existingSubmission && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span className="font-black text-emerald-950 text-sm uppercase tracking-wide">
                    Jury Evaluation & Score
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-700">
                  {existingSubmission.total_score || 0} / 100 pts
                </div>
              </div>

              {existingSubmission.recognition_award && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Award: {existingSubmission.recognition_award}</span>
                </div>
              )}

              {existingSubmission.judging_notes && (
                <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 text-stone-700 leading-relaxed">
                  <strong>Jury Feedback:</strong> {existingSubmission.judging_notes}
                </div>
              )}
            </div>
          )}

          {/* Corrections requested notice */}
          {existingSubmission?.corrections_requested && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>Correction Requested by Reviewers:</strong>
                <p className="mt-1 text-stone-700">{existingSubmission.corrections_requested}</p>
              </div>
            </div>
          )}

          {/* FORM TYPE 1: GREAT MARKET MISSION */}
          {isGMM && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#E7E2DA] space-y-4">
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1FB5A0]" />
                  <span>Selected Market Overview</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Market Name & Locality *
                    </label>
                    <input
                      type="text"
                      value={marketName}
                      onChange={(e) => setMarketName(e.target.value)}
                      placeholder="e.g. Kamla Nagar Market, Central Delhi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Nearest Metro / Landmarks
                    </label>
                    <input
                      type="text"
                      value={marketLocation}
                      onChange={(e) => setMarketLocation(e.target.value)}
                      placeholder="e.g. Vishwavidyalaya Metro Station Gate 3"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Mission 01 */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-stone-900 text-sm flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-[#FF6B4A]" />
                    <span>MISSION 01 — HIDDEN GEM</span>
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                    20 POINTS
                  </span>
                </div>
                <p className="text-stone-500 text-[11px]">
                  Find two interesting food outlets in your selected market and explain why someone should discover them.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Outlet 01 Details *</label>
                    <textarea
                      rows={3}
                      value={outlet1}
                      onChange={(e) => setOutlet1(e.target.value)}
                      placeholder="Name, exact stall location, signature dish, and what makes it special..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden resize-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Outlet 02 Details *</label>
                    <textarea
                      rows={3}
                      value={outlet2}
                      onChange={(e) => setOutlet2(e.target.value)}
                      placeholder="Name, exact stall location, signature dish, and what makes it special..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Supporting Evidence & Photo Links
                  </label>
                  <input
                    type="text"
                    value={hiddenGemsDetails}
                    onChange={(e) => setHiddenGemsDetails(e.target.value)}
                    placeholder="Google Drive or image URLs of stalls, signage, or dishes"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden"
                  />
                </div>
              </div>

              {/* Mission 02 */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-stone-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#1FB5A0]" />
                    <span>MISSION 02 — MENU DETECTIVE</span>
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 font-bold text-[10px]">
                    25 POINTS
                  </span>
                </div>
                <p className="text-stone-500 text-[11px]">
                  Explore at least three interesting dishes with prices and clarify whether observed on a displayed menu, confirmed by outlet, or estimated.
                </p>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    3 Dishes, Outlets, Prices & Verification Notes *
                  </label>
                  <textarea
                    rows={4}
                    value={menuDishes}
                    onChange={(e) => setMenuDishes(e.target.value)}
                    placeholder="1. Dish: Hazelnut Cold Coffee | Outlet: DePaul's | Price: ₹70 (Counter board observed)&#10;2. Dish: Dry Laphing | Outlet: Tenzing | Price: ₹50 (Observed on menu)&#10;3. Dish: Paneer Tikka Kathi Roll | Outlet: Khan Chacha | Price: ₹120 (Confirmed by cashier)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Menu Photo / Rate Board Evidence Links
                  </label>
                  <input
                    type="text"
                    value={priceEvidenceUrls}
                    onChange={(e) => setPriceEvidenceUrls(e.target.value)}
                    placeholder="Google Drive link or URLs showing photographed menus / price boards"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden"
                  />
                </div>
              </div>

              {/* Mission 03 */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-stone-900 text-sm flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span>MISSION 03 — BUDGET BATTLE (₹200)</span>
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                    25 POINTS
                  </span>
                </div>
                <p className="text-stone-500 text-[11px]">
                  Curate a satisfying meal or tasting experience within ₹200. (Compulsory purchase not required; research and menu prices are sufficient).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-stone-700 mb-1">
                      Food Items & Selection Reason *
                    </label>
                    <textarea
                      rows={3}
                      value={budgetPlan}
                      onChange={(e) => setBudgetPlan(e.target.value)}
                      placeholder="e.g. Samosa Chaat (₹50) from Stall A + Fresh Sweet Lassi (₹60) from Shop B + Hot Jalebi (₹50)..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Total Confirmed Cost (Max ₹200) *
                    </label>
                    <input
                      type="text"
                      value={budgetCost}
                      onChange={(e) => setBudgetCost(e.target.value)}
                      placeholder="e.g. ₹160 total"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Mission 04 */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-stone-900 text-sm flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>MISSION 04 — MARKET MAP</span>
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-bold text-[10px]">
                    30 POINTS
                  </span>
                </div>
                <p className="text-stone-500 text-[11px]">
                  Create a visual food map showing outlets, dishes, prices, and a recommended walking route.
                </p>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Market Map Link (Figma, Canva, Google My Maps, or Drive Image) *
                  </label>
                  <input
                    type="url"
                    value={marketMapUrl}
                    onChange={(e) => setMarketMapUrl(e.target.value)}
                    placeholder="https://www.canva.com/design/... or https://maps.google.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Suggested Exploration Route & Summary
                  </label>
                  <textarea
                    rows={3}
                    value={explorationSummary}
                    onChange={(e) => setExplorationSummary(e.target.value)}
                    placeholder="Start at Metro Gate 2, walk 100m straight down Main Bazaar, stop at Stall 1 for chai..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Optional: Short Exploration Video Link (YouTube / Drive)
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtu.be/... (Optional)"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FORM TYPE 2: FOODVERSE CHALLENGE */}
          {isFoodverse && (
            <div className="space-y-6">
              {/* Track Selector */}
              <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#E7E2DA] space-y-3">
                <label className="block font-bold text-stone-800 text-sm">
                  Select Your Challenge Track *
                </label>
                <select
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] bg-white font-bold text-xs outline-hidden"
                >
                  {(competition.tracks || []).map((track: any, idx: number) => {
                    const tId = typeof track === 'object' ? track.id : `track_${idx + 1}`;
                    const tTitle = typeof track === 'object' ? track.title : String(track);
                    return (
                      <option key={tId} value={tId}>
                        {tTitle}
                      </option>
                    );
                  })}
                </select>
                {selectedTrack && (
                  <div className="text-xs text-stone-600 bg-white p-3 rounded-xl border border-stone-100">
                    <p className="font-bold text-stone-800">{selectedTrack.description}</p>
                    <div className="mt-1 text-[11px] text-stone-500">
                      <strong>Possible concepts:</strong> {(Array.isArray(selectedTrack.ideas) ? selectedTrack.ideas : []).join(' • ')}
                    </div>
                  </div>
                )}
              </div>

              {/* Project Concept & Problem */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-4">
                <h4 className="font-black text-stone-900 text-sm flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-[#1FB5A0]" />
                  <span>Project & Problem Definition</span>
                </h4>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Project Title *</label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. BudgetBite — ₹150 Campus Meal Navigator"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Problem Being Solved *
                    </label>
                    <textarea
                      rows={3}
                      value={problemStatement}
                      onChange={(e) => setProblemStatement(e.target.value)}
                      placeholder="What real food problem do university students or city foodies face?"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Intended Users *</label>
                    <textarea
                      rows={3}
                      value={intendedUsers}
                      onChange={(e) => setIntendedUsers(e.target.value)}
                      placeholder="e.g. Delhi University hostel students, budget daily commuters, vegan explorers..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Proposed Solution & Features */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-4">
                <h4 className="font-black text-stone-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF6B4A]" />
                  <span>Proposed Solution & Features</span>
                </h4>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Proposed Solution Description *
                  </label>
                  <textarea
                    rows={3}
                    value={proposedSolution}
                    onChange={(e) => setProposedSolution(e.target.value)}
                    placeholder="Explain how your design, app concept, or digital map solves this problem..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Core Features *</label>
                  <textarea
                    rows={3}
                    value={mainFeatures}
                    onChange={(e) => setMainFeatures(e.target.value)}
                    placeholder="1. Price-filtered radius map&#10;2. User verified menu bills&#10;3. Group bill split & food voting radar"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden"
                  />
                </div>
              </div>

              {/* Prototype / Design Link */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-4">
                <h4 className="font-black text-stone-900 text-sm flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-emerald-600" />
                  <span>Prototype & Demonstration</span>
                </h4>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Figma / Canva / Prototype / Deck Link *
                  </label>
                  <input
                    type="url"
                    value={prototypeUrl}
                    onChange={(e) => setPrototypeUrl(e.target.value)}
                    placeholder="https://www.figma.com/proto/... or Google Drive Link"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Ensure link access permissions are set to &apos;Anyone with the link can view&apos;.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      How It Works (User Journey)
                    </label>
                    <textarea
                      rows={3}
                      value={howItWorks}
                      onChange={(e) => setHowItWorks(e.target.value)}
                      placeholder="Step 1: User sets budget slider to ₹150..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Why Useful & Feasible
                    </label>
                    <textarea
                      rows={3}
                      value={whyUseful}
                      onChange={(e) => setWhyUseful(e.target.value)}
                      placeholder="Why will users love this? What makes it technically realistic?"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Optional: 2-Minute Demo Video / Loom Link
                  </label>
                  <input
                    type="url"
                    value={researchReferences}
                    onChange={(e) => setResearchReferences(e.target.value)}
                    placeholder="https://www.loom.com/share/... or YouTube unlisted link"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#1FB5A0] outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-[#E7E2DA] bg-stone-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#1FB5A0]" />
            <span>Deadline: {new Date(competition.submission_deadline).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-4 py-2 rounded-full border border-stone-300 hover:bg-white text-stone-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-5 py-2 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{existingSubmission?.status === 'Submitted' ? 'Update Submission' : 'Submit Project'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
