/**
 * Menu Maps Discovery - Admin Competition Manager
 * Integrated directly inside the Main Admin Panel (/admin-secure-panel2010).
 * Provides full management for the TWO Season 01 Competitions:
 * 1. Overview & Metrics
 * 2. Live Content Editor (no code changes required)
 * 3. Missions & Tracks Manager
 * 4. Registration Manager & CSV Export
 * 5. Submission Review & 100-Point Criterion Judging
 */

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Edit,
  Save,
  Trash2,
  PlusCircle,
  ExternalLink,
  Award,
  Sparkles,
  Search,
  Download,
  Filter,
  Eye,
  Send,
  X,
  Compass,
  Laptop,
  Layers,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { compressImageFile } from '../../lib/imageCompressor';
import {
  DiscoveryCompetition,
  CompetitionRegistration,
  CompetitionSubmission,
  CompetitionMission,
  CompetitionTrack,
  CompetitionStatus,
  RecognitionAwardType,
} from '../types/discovery';
import { discoveryApi } from '../lib/discoveryApi';
import { useToast } from '../../components/Toast';

const RECOGNITION_AWARDS: RecognitionAwardType[] = [
  'Winner',
  'First Runner-up',
  'Second Runner-up',
  'Finalist',
  'Best Discovery',
  'Best Market Map',
  'Best Budget Experience',
  'Best Creative Concept',
  'Best User Experience',
  'Jury Choice',
];

const COMPETITION_STATUSES: CompetitionStatus[] = [
  'Draft',
  'Scheduled',
  'Registration Open',
  'Active',
  'Submissions Closed',
  'Under Evaluation',
  'Results Published',
  'Archived',
];

export const AdminCompetitionManager: React.FC = () => {
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'content_editor' | 'missions_tracks' | 'registrations' | 'submissions'
  >('overview');

  const [competitions, setCompetitions] = useState<DiscoveryCompetition[]>([]);
  const [registrations, setRegistrations] = useState<CompetitionRegistration[]>([]);
  const [submissions, setSubmissions] = useState<CompetitionSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Content Editor Selection
  const [selectedCompId, setSelectedCompId] = useState<string>('');
  const [editingComp, setEditingComp] = useState<DiscoveryCompetition | null>(null);

  // Judging Modal Selection
  const [judgingSubmission, setJudgingSubmission] = useState<CompetitionSubmission | null>(null);
  const [scoresInput, setScoresInput] = useState<Record<string, number>>({});
  const [judgingNotes, setJudgingNotes] = useState('');
  const [correctionsInput, setCorrectionsInput] = useState('');
  const [awardSelection, setAwardSelection] = useState<string>('');
  const [evaluatingStatus, setEvaluatingStatus] = useState<'Under Review' | 'Evaluated'>('Evaluated');

  // Search & Filter
  const [regSearch, setRegSearch] = useState('');
  const [regCompFilter, setRegCompFilter] = useState('all');
  const [subCompFilter, setSubCompFilter] = useState('all');
  const [subStatusFilter, setSubStatusFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [comps, regs, subs] = await Promise.all([
        discoveryApi.getCompetitions(),
        discoveryApi.getCompetitionRegistrations(),
        discoveryApi.getCompetitionSubmissions(),
      ]);
      setCompetitions(comps);
      setRegistrations(regs);
      setSubmissions(subs);
      if (comps.length > 0 && !selectedCompId) {
        setSelectedCompId(comps[0].id);
        setEditingComp(JSON.parse(JSON.stringify(comps[0])));
      }
    } catch (e) {
      console.error('Failed to load competition management data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCompForEdit = (id: string) => {
    setSelectedCompId(id);
    const target = competitions.find((c) => c.id === id);
    if (target) {
      setEditingComp(JSON.parse(JSON.stringify(target)));
    }
  };

  // Image Upload from Device Handlers
  const handleCoverImageDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Compressing and uploading cover image from device...', 'info');
      const result = await compressImageFile(file, 1600, 850 * 1024);
      setEditingComp((prev) => (prev ? { ...prev, cover_image: result.dataUrl } : null));
      showToast(`Cover image uploaded from device (${result.compressedSizeKb} KB)`, 'success');
    } catch (err) {
      showToast('Failed to process image from device', 'error');
    }
  };

  const handleMissionImageDeviceUpload = async (
    missionIdx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Processing mission image from device...', 'info');
      const result = await compressImageFile(file, 1200, 600 * 1024);
      setEditingComp((prev) => {
        if (!prev || !prev.missions) return prev;
        const updated = [...prev.missions];
        updated[missionIdx] = { ...updated[missionIdx], image_url: result.dataUrl };
        return { ...prev, missions: updated };
      });
      showToast(`Mission image updated (${result.compressedSizeKb} KB)`, 'success');
    } catch (err) {
      showToast('Failed to process image from device', 'error');
    }
  };

  const handleTrackImageDeviceUpload = async (
    trackIdx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Processing track image from device...', 'info');
      const result = await compressImageFile(file, 1200, 600 * 1024);
      setEditingComp((prev) => {
        if (!prev || !prev.tracks) return prev;
        const updated = [...prev.tracks];
        updated[trackIdx] = { ...updated[trackIdx], image_url: result.dataUrl };
        return { ...prev, tracks: updated };
      });
      showToast(`Track image updated (${result.compressedSizeKb} KB)`, 'success');
    } catch (err) {
      showToast('Failed to process image from device', 'error');
    }
  };

  const handleSaveCompetitionContent = async () => {
    if (!editingComp) return;
    try {
      await discoveryApi.saveCompetition(editingComp);
      showToast(`Saved changes for ${editingComp.title}`, 'success');
      loadData();
    } catch (e) {
      showToast('Failed to save competition details', 'error');
    }
  };

  // Open Judging Modal
  const handleOpenJudging = (sub: CompetitionSubmission) => {
    setJudgingSubmission(sub);
    const initialScores = sub.scores || {};
    setScoresInput(initialScores);
    setJudgingNotes(sub.judging_notes || '');
    setCorrectionsInput(sub.corrections_requested || '');
    setAwardSelection(sub.recognition_award || '');
    setEvaluatingStatus(sub.status === 'Evaluated' ? 'Evaluated' : 'Under Review');
  };

  const calculateTotalScore = (comp: DiscoveryCompetition | undefined, scores: Record<string, number>) => {
    if (!comp) return 0;
    const raw = Object.values(scores).reduce((sum, v) => sum + (Number(v) || 0), 0);
    return Math.min(100, Math.max(0, raw));
  };

  const handleSaveJudgingScore = async () => {
    if (!judgingSubmission) return;
    try {
      await discoveryApi.scoreCompetitionSubmission(
        judgingSubmission.id,
        scoresInput,
        judgingNotes,
        correctionsInput,
        awardSelection || undefined,
        evaluatingStatus
      );
      showToast('Evaluation scores and feedback successfully saved & published!', 'success');
      setJudgingSubmission(null);
      loadData();
    } catch (e) {
      showToast('Failed to save scores', 'error');
    }
  };

  // Export Registrations CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Competition',
      'Student Name',
      'Student Email',
      'Mode',
      'Team Name',
      'Team Members',
      'Registration Date',
      'Status',
    ];
    const rows = registrations.map((r) => [
      r.id,
      r.competition_title,
      r.student_name,
      r.student_email,
      r.participation_mode,
      r.team_name || '',
      r.team_members?.join('; ') || '',
      r.registered_at,
      r.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((x) => `"${x}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `menumaps_competition_registrations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported registrations to CSV', 'success');
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-stone-500">
        Loading competition management workspace...
      </div>
    );
  }

  const currentCompForJudging = competitions.find((c) => c.id === judgingSubmission?.competition_id);

  return (
    <div className="space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#1FB5A0] text-xs font-black uppercase tracking-wider mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Official Admin Console</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">
            Competition Management
          </h2>
          <p className="text-xs text-stone-500">
            Manage the two Season 01 competitions, live editable rules, participant registrations, and 100-point submission judging.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200 self-start sm:self-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Trophy },
            { id: 'content_editor', label: 'Content Editor', icon: Edit },
            { id: 'missions_tracks', label: 'Missions & Tracks', icon: Layers },
            { id: 'registrations', label: `Registrations (${registrations.length})`, icon: Users },
            { id: 'submissions', label: `Judging & Submissions (${submissions.length})`, icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1FB5A0]' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =======================================================================
          TAB 1: OVERVIEW METRICS
      ======================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {competitions.map((comp) => {
              const compRegs = registrations.filter((r) => r.competition_id === comp.id);
              const compTeams = compRegs.filter((r) => r.participation_mode === 'team');
              const compSubs = submissions.filter((s) => s.competition_id === comp.id);
              const awaitingReview = compSubs.filter((s) => s.status === 'Submitted' || s.status === 'Under Review');
              const evaluated = compSubs.filter((s) => s.status === 'Evaluated');

              return (
                <div
                  key={comp.id}
                  className="bg-white rounded-3xl border border-stone-200 p-6 space-y-5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-teal-50 text-[#1FB5A0] text-xs font-black uppercase">
                      {comp.type}
                    </span>
                    <select
                      value={comp.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value as CompetitionStatus;
                        await discoveryApi.saveCompetition({ ...comp, status: newStatus });
                        showToast(`Status updated to ${newStatus}`, 'success');
                        loadData();
                      }}
                      className="px-2.5 py-1 rounded-xl border border-stone-200 bg-stone-50 font-bold text-[11px] text-stone-800 outline-hidden"
                    >
                      {COMPETITION_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-stone-900">{comp.title}</h3>
                    <p className="text-xs text-[#FF6B4A] font-bold">&ldquo;{comp.tagline}&rdquo;</p>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">{comp.description}</p>
                  </div>

                  {/* Real Stats Grid */}
                  <div className="grid grid-cols-3 gap-2.5 pt-2 text-center text-xs">
                    <div className="p-3 rounded-2xl bg-stone-50">
                      <div className="text-[10px] text-stone-400 font-bold uppercase">Participants</div>
                      <div className="text-lg font-black text-stone-900">{compRegs.length}</div>
                      <div className="text-[10px] text-stone-500">{compTeams.length} teams</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
                      <div className="text-[10px] text-amber-700 font-bold uppercase">Awaiting Review</div>
                      <div className="text-lg font-black text-amber-900">{awaitingReview.length}</div>
                      <div className="text-[10px] text-amber-600">{compSubs.length} total subs</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                      <div className="text-[10px] text-emerald-700 font-bold uppercase">Evaluated</div>
                      <div className="text-lg font-black text-emerald-900">{evaluated.length}</div>
                      <div className="text-[10px] text-emerald-600">Results published</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span>Deadline: {new Date(comp.submission_deadline).toLocaleDateString()}</span>
                    <button
                      onClick={() => {
                        handleSelectCompForEdit(comp.id);
                        setActiveSubTab('content_editor');
                      }}
                      className="font-bold text-[#1FB5A0] hover:underline"
                    >
                      Edit Content & Dates →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 2: CONTENT EDITOR (WITHOUT CODE CHANGES)
      ======================================================================= */}
      {activeSubTab === 'content_editor' && editingComp && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
            {competitions.map((comp) => (
              <button
                key={comp.id}
                onClick={() => handleSelectCompForEdit(comp.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  editingComp.id === comp.id
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {comp.title}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-black text-stone-900">
                  Editing: {editingComp.title}
                </h3>
                <p className="text-xs text-stone-500">
                  Updates persist live to visitors without modifying source code.
                </p>
              </div>

              <button
                onClick={handleSaveCompetitionContent}
                className="px-5 py-2.5 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Live Content</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Competition Title</label>
                <input
                  type="text"
                  value={editingComp.title}
                  onChange={(e) => setEditingComp({ ...editingComp, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={editingComp.tagline}
                  onChange={(e) => setEditingComp({ ...editingComp, tagline: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-700 mb-1">Public Introduction</label>
                <textarea
                  rows={2}
                  value={editingComp.introduction}
                  onChange={(e) => setEditingComp({ ...editingComp, introduction: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-700 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingComp.description}
                  onChange={(e) => setEditingComp({ ...editingComp, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 outline-hidden"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="block font-bold text-stone-800">
                  Competition Cover Image (Upload from Device or URL)
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  {editingComp.cover_image ? (
                    <div className="relative w-40 h-28 rounded-2xl overflow-hidden border border-stone-300 shrink-0 bg-stone-100 group shadow-2xs">
                      <img
                        src={editingComp.cover_image}
                        alt={editingComp.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingComp({ ...editingComp, cover_image: '' })}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer"
                        title="Remove cover image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-40 h-28 rounded-2xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 shrink-0 bg-white">
                      <ImageIcon className="w-7 h-7 text-stone-300" />
                      <span className="text-[11px] font-bold mt-1 text-stone-500">No Image</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-2.5 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-4 py-2.5 rounded-xl bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Upload Image from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageDeviceUpload}
                          className="hidden"
                        />
                      </label>

                      {editingComp.cover_image && (
                        <button
                          type="button"
                          onClick={() => setEditingComp({ ...editingComp, cover_image: '' })}
                          className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-white text-stone-600 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] text-stone-500 block mb-1">
                        Or enter direct image URL:
                      </span>
                      <input
                        type="url"
                        value={editingComp.cover_image}
                        onChange={(e) => setEditingComp({ ...editingComp, cover_image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Status</label>
                <select
                  value={editingComp.status}
                  onChange={(e) =>
                    setEditingComp({ ...editingComp, status: e.target.value as CompetitionStatus })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white font-bold"
                >
                  {COMPETITION_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={editingComp.start_date}
                  onChange={(e) => setEditingComp({ ...editingComp, start_date: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Submission Deadline</label>
                <input
                  type="date"
                  value={editingComp.submission_deadline.split('T')[0]}
                  onChange={(e) =>
                    setEditingComp({
                      ...editingComp,
                      submission_deadline: `${e.target.value}T23:59:59Z`,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Duration Text</label>
                <input
                  type="text"
                  value={editingComp.duration_text || `${editingComp.duration_days} days`}
                  onChange={(e) => setEditingComp({ ...editingComp, duration_text: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Participation Mode</label>
                <input
                  type="text"
                  value={editingComp.participation_type}
                  onChange={(e) =>
                    setEditingComp({ ...editingComp, participation_type: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Team Size Limits (Min / Max)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={editingComp.min_team_size}
                    onChange={(e) =>
                      setEditingComp({ ...editingComp, min_team_size: parseInt(e.target.value) || 1 })
                    }
                    className="w-1/2 px-3 py-2 rounded-xl border border-stone-200"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    min={1}
                    value={editingComp.max_team_size}
                    onChange={(e) =>
                      setEditingComp({ ...editingComp, max_team_size: parseInt(e.target.value) || 4 })
                    }
                    className="w-1/2 px-3 py-2 rounded-xl border border-stone-200"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Purchase / Coding Requirements</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingComp.purchase_requirement || 'No compulsory purchase'}
                    onChange={(e) =>
                      setEditingComp({ ...editingComp, purchase_requirement: e.target.value })
                    }
                    className="w-1/2 px-3 py-2 rounded-xl border border-stone-200"
                  />
                  <input
                    type="text"
                    value={editingComp.coding_requirement || 'Not compulsory'}
                    onChange={(e) =>
                      setEditingComp({ ...editingComp, coding_requirement: e.target.value })
                    }
                    className="w-1/2 px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
              </div>
            </div>

            {/* Editable Rules */}
            <div className="space-y-2 text-xs pt-4 border-t border-stone-100">
              <label className="block font-bold text-stone-800">
                Participation Rules (One per line)
              </label>
              <textarea
                rows={5}
                value={editingComp.rules.join('\n')}
                onChange={(e) =>
                  setEditingComp({
                    ...editingComp,
                    rules: e.target.value.split('\n').filter(Boolean),
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 font-mono text-xs outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 3: MISSIONS & TRACKS EDITOR
      ======================================================================= */}
      {activeSubTab === 'missions_tracks' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
            {competitions.map((comp) => (
              <button
                key={comp.id}
                onClick={() => handleSelectCompForEdit(comp.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  editingComp?.id === comp.id
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {comp.title}
              </button>
            ))}
          </div>

          {editingComp && editingComp.missions && editingComp.missions.length > 0 && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    The Great Market Mission — 4 Core Missions
                  </h3>
                  <p className="text-xs text-stone-500">
                    Missions must total 100 points. Edit mission titles, descriptions, and point weights.
                  </p>
                </div>
                <button
                  onClick={handleSaveCompetitionContent}
                  className="px-5 py-2.5 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Missions</span>
                </button>
              </div>

              <div className="space-y-4">
                {(editingComp.missions || []).map((mission, idx) => (
                  <div
                    key={mission.id}
                    className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-3">
                        <label className="block font-bold text-stone-700 mb-1">Mission Title</label>
                        <input
                          type="text"
                          value={mission.title}
                          onChange={(e) => {
                            const updated = [...(editingComp.missions || [])];
                            updated[idx].title = e.target.value;
                            setEditingComp({ ...editingComp, missions: updated });
                          }}
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Points</label>
                        <input
                          type="number"
                          value={mission.points}
                          onChange={(e) => {
                            const updated = [...(editingComp.missions || [])];
                            const pts = parseInt(e.target.value) || 0;
                            updated[idx].points = pts;
                            updated[idx].badge = `${pts} POINTS`;
                            setEditingComp({ ...editingComp, missions: updated });
                          }}
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-white font-bold"
                        />
                      </div>
                    </div>

$1

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Mission Visual Image (Upload from Device or URL)
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl bg-white border border-stone-200">
                        {mission.image_url ? (
                          <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-100 shadow-2xs">
                            <img
                              src={mission.image_url}
                              alt={mission.title}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...(editingComp.missions || [])];
                                updated[idx] = { ...updated[idx], image_url: '' };
                                setEditingComp({ ...editingComp, missions: updated });
                              }}
                              className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer"
                              title="Remove image"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-28 h-20 rounded-xl border border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 shrink-0 bg-stone-50">
                            <ImageIcon className="w-5 h-5 text-stone-300" />
                            <span className="text-[10px] font-bold mt-0.5 text-stone-400">No Image</span>
                          </div>
                        )}

                        <div className="flex-1 space-y-2 w-full">
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="px-3 py-1.5 rounded-lg bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload from Device</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleMissionImageDeviceUpload(idx, e)}
                                className="hidden"
                              />
                            </label>
                            {mission.image_url && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...(editingComp.missions || [])];
                                  updated[idx] = { ...updated[idx], image_url: '' };
                                  setEditingComp({ ...editingComp, missions: updated });
                                }}
                                className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <input
                            type="url"
                            value={mission.image_url || ''}
                            onChange={(e) => {
                              const updated = [...(editingComp.missions || [])];
                              updated[idx] = { ...updated[idx], image_url: e.target.value };
                              setEditingComp({ ...editingComp, missions: updated });
                            }}
                            placeholder="Or paste image URL (https://...)"
                            className="w-full px-3 py-1 rounded-lg border border-stone-200 text-xs outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {editingComp && editingComp.tracks && editingComp.tracks.length > 0 && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    The Foodverse Challenge — 5 Challenge Tracks
                  </h3>
                  <p className="text-xs text-stone-500">
                    Students pick 1 track. Edit titles, descriptions, and recommended idea prompts.
                  </p>
                </div>
                <button
                  onClick={handleSaveCompetitionContent}
                  className="px-5 py-2.5 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Tracks</span>
                </button>
              </div>

              <div className="space-y-4">
                {(editingComp.tracks || []).map((track, idx) => (
                  <div
                    key={track.id}
                    className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3 text-xs"
                  >
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Track Title</label>
                      <input
                        type="text"
                        value={track.title}
                        onChange={(e) => {
                          const updated = [...(editingComp.tracks || [])];
                          updated[idx].title = e.target.value;
                          setEditingComp({ ...editingComp, tracks: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-white font-bold"
                      />
                    </div>

$1

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Track Visual Image (Upload from Device or URL)
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl bg-white border border-stone-200">
                        {track.image_url ? (
                          <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-100 shadow-2xs">
                            <img
                              src={track.image_url}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...(editingComp.tracks || [])];
                                updated[idx] = { ...updated[idx], image_url: '' };
                                setEditingComp({ ...editingComp, tracks: updated });
                              }}
                              className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer"
                              title="Remove image"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-28 h-20 rounded-xl border border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 shrink-0 bg-stone-50">
                            <ImageIcon className="w-5 h-5 text-stone-300" />
                            <span className="text-[10px] font-bold mt-0.5 text-stone-400">No Image</span>
                          </div>
                        )}

                        <div className="flex-1 space-y-2 w-full">
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="px-3 py-1.5 rounded-lg bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload from Device</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleTrackImageDeviceUpload(idx, e)}
                                className="hidden"
                              />
                            </label>
                            {track.image_url && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...(editingComp.tracks || [])];
                                  updated[idx] = { ...updated[idx], image_url: '' };
                                  setEditingComp({ ...editingComp, tracks: updated });
                                }}
                                className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <input
                            type="url"
                            value={track.image_url || ''}
                            onChange={(e) => {
                              const updated = [...(editingComp.tracks || [])];
                              updated[idx] = { ...updated[idx], image_url: e.target.value };
                              setEditingComp({ ...editingComp, tracks: updated });
                            }}
                            placeholder="Or paste image URL (https://...)"
                            className="w-full px-3 py-1 rounded-lg border border-stone-200 text-xs outline-hidden"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Example Ideas (One per line)
                      </label>
                      <textarea
                        rows={2}
                        value={(Array.isArray(track.ideas) ? track.ideas : []).join('\n')}
                        onChange={(e) => {
                          const updated = [...(editingComp.tracks || [])];
                          updated[idx].ideas = e.target.value.split('\n').filter(Boolean);
                          setEditingComp({ ...editingComp, tracks: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-white font-mono text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =======================================================================
          TAB 4: REGISTRATIONS MANAGEMENT
      ======================================================================= */}
      {activeSubTab === 'registrations' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="text"
                value={regSearch}
                onChange={(e) => setRegSearch(e.target.value)}
                placeholder="Search by student name, email, or team name..."
                className="w-full text-xs outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={regCompFilter}
                onChange={(e) => setRegCompFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold bg-stone-50"
              >
                <option value="all">All Competitions</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              <button
                onClick={handleExportCSV}
                className="px-4 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Participant</th>
                    <th className="p-4">Competition</th>
                    <th className="p-4">Mode / Team</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {registrations
                    .filter((r) => {
                      if (regCompFilter !== 'all' && r.competition_id !== regCompFilter) return false;
                      if (!regSearch.trim()) return true;
                      const q = regSearch.toLowerCase();
                      return (
                        r.student_name.toLowerCase().includes(q) ||
                        r.student_email.toLowerCase().includes(q) ||
                        (r.team_name && r.team_name.toLowerCase().includes(q))
                      );
                    })
                    .map((reg) => (
                      <tr key={reg.id} className="hover:bg-stone-50/50">
                        <td className="p-4">
                          <div className="font-bold text-stone-900">{reg.student_name}</div>
                          <div className="text-[11px] text-stone-400">{reg.student_email}</div>
                        </td>
                        <td className="p-4 font-bold text-stone-800">{reg.competition_title}</td>
                        <td className="p-4">
                          {reg.participation_mode === 'team' ? (
                            <div>
                              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#1FB5A0] font-black text-[10px] uppercase">
                                Team: {reg.team_name}
                              </span>
                              {reg.team_members && reg.team_members.length > 0 && (
                                <div className="text-[10px] text-stone-500 mt-1">
                                  {reg.team_members.join(', ')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold text-[10px]">
                              Solo
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-stone-500">
                          {new Date(reg.registered_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              reg.status === 'Submitted'
                                ? 'bg-amber-100 text-amber-800'
                                : reg.status === 'Reviewed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {reg.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {registrations.length === 0 && (
              <div className="p-8 text-center text-xs text-stone-400">
                No competition registrations recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 5: SUBMISSIONS & 100-POINT JUDGING
      ======================================================================= */}
      {activeSubTab === 'submissions' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-600">Competition:</span>
              <select
                value={subCompFilter}
                onChange={(e) => setSubCompFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 font-bold"
              >
                <option value="all">All Competitions</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-600">Status:</span>
              <select
                value={subStatusFilter}
                onChange={(e) => setSubStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 font-bold"
              >
                <option value="all">All Statuses</option>
                <option value="Submitted">Submitted (Awaiting Review)</option>
                <option value="Under Review">Under Review</option>
                <option value="Evaluated">Evaluated</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Submissions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submissions
              .filter((sub) => {
                if (subCompFilter !== 'all' && sub.competition_id !== subCompFilter) return false;
                if (subStatusFilter !== 'all' && sub.status !== subStatusFilter) return false;
                return true;
              })
              .map((sub) => {
                const comp = competitions.find((c) => c.id === sub.competition_id);
                return (
                  <div
                    key={sub.id}
                    className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#1FB5A0] text-[10px] font-black uppercase">
                          {sub.participation_mode === 'team' ? `Team: ${sub.team_name}` : 'Individual'}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            sub.status === 'Evaluated'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.status === 'Submitted'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-black text-stone-900 leading-snug">
                          {sub.project_title || sub.market_name || sub.competition_title}
                        </h4>
                        <div className="text-xs text-stone-500 mt-0.5">
                          Submitted by <strong>{sub.student_name}</strong> ({sub.student_email})
                        </div>
                      </div>

                      {/* Score if Evaluated */}
                      {sub.status === 'Evaluated' && (
                        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Award className="w-4 h-4 text-emerald-600" />
                            <span>Score: {sub.total_score || 0} / 100</span>
                          </div>
                          {sub.recognition_award && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                              🏆 {sub.recognition_award}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenJudging(sub)}
                        className="px-4 py-2 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{sub.status === 'Evaluated' ? 'Edit Evaluation' : 'Score & Judge Entry'}</span>
                      </button>

                      <span className="text-[10px] text-stone-400">
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>

          {submissions.length === 0 && (
            <div className="p-12 text-center text-xs text-stone-400 bg-white rounded-3xl border border-stone-200">
              No project submissions received yet.
            </div>
          )}
        </div>
      )}

      {/* =======================================================================
          JUDGING & EVALUATION MODAL (100-POINT CRITERIA)
      ======================================================================= */}
      {judgingSubmission && currentCompForJudging && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900">
                  Judging: {judgingSubmission.student_name}
                </h3>
                <p className="text-xs text-stone-500">
                  {currentCompForJudging.title} • {judgingSubmission.participation_mode === 'team' ? `Team: ${judgingSubmission.team_name}` : 'Solo'}
                </p>
              </div>

              <button
                onClick={() => setJudgingSubmission(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Submitted Content Preview */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <h4 className="font-black text-stone-900 text-sm">Submitted Deliverables</h4>

                {judgingSubmission.market_name && (
                  <div>
                    <span className="font-bold text-stone-500 block">Market:</span>
                    <p className="font-bold text-stone-800">{judgingSubmission.market_name}</p>
                  </div>
                )}

                {judgingSubmission.hidden_gems_outlet1 && (
                  <div>
                    <span className="font-bold text-stone-500 block">Mission 01 (Hidden Gems):</span>
                    <p className="text-stone-800 whitespace-pre-wrap">{judgingSubmission.hidden_gems_outlet1}</p>
                    <p className="text-stone-800 whitespace-pre-wrap mt-1">{judgingSubmission.hidden_gems_outlet2}</p>
                  </div>
                )}

                {judgingSubmission.menu_detective_dishes && (
                  <div>
                    <span className="font-bold text-stone-500 block">Mission 02 (Menu Detective):</span>
                    <p className="text-stone-800 whitespace-pre-wrap">{judgingSubmission.menu_detective_dishes}</p>
                    {judgingSubmission.menu_price_evidence_urls && (
                      <p className="text-teal-700 font-mono text-[11px] mt-1">Evidence: {judgingSubmission.menu_price_evidence_urls}</p>
                    )}
                  </div>
                )}

                {judgingSubmission.budget_battle_plan && (
                  <div>
                    <span className="font-bold text-stone-500 block">Mission 03 (₹200 Budget Battle):</span>
                    <p className="text-stone-800 whitespace-pre-wrap">{judgingSubmission.budget_battle_plan} (Cost: {judgingSubmission.budget_battle_cost})</p>
                  </div>
                )}

                {judgingSubmission.market_map_url && (
                  <div>
                    <span className="font-bold text-stone-500 block">Mission 04 (Market Map Link):</span>
                    <a
                      href={judgingSubmission.market_map_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1FB5A0] font-bold underline inline-flex items-center gap-1"
                    >
                      <span>Open Market Map Artifact</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Foodverse Preview */}
                {judgingSubmission.project_title && (
                  <div>
                    <span className="font-bold text-stone-500 block">Project Title & Track:</span>
                    <p className="font-bold text-stone-900">{judgingSubmission.project_title} ({judgingSubmission.track_title})</p>
                  </div>
                )}

                {judgingSubmission.problem_statement && (
                  <div>
                    <span className="font-bold text-stone-500 block">Problem & Intended Users:</span>
                    <p className="text-stone-800">{judgingSubmission.problem_statement}</p>
                  </div>
                )}

                {judgingSubmission.prototype_url && (
                  <div>
                    <span className="font-bold text-stone-500 block">Prototype / Design Link:</span>
                    <a
                      href={judgingSubmission.prototype_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1FB5A0] font-bold underline inline-flex items-center gap-1"
                    >
                      <span>Open Figma / Prototype Artifact</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* 100-Point Rubric Scoring Form */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-stone-900 text-sm">
                    Scoring Rubric (Total Max 100 Points)
                  </h4>
                  <div className="text-base font-black text-[#1FB5A0]">
                    Total Score: {calculateTotalScore(currentCompForJudging, scoresInput)} / 100 pts
                  </div>
                </div>

                <div className="space-y-2">
                  {(currentCompForJudging.scoring_criteria || []).map((sc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-white"
                    >
                      <div>
                        <span className="font-bold text-stone-800">{sc.criterion}</span>
                        <span className="text-stone-400 text-[10px] block">Max {sc.points} pts</span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={sc.points}
                        value={scoresInput[sc.criterion] ?? ''}
                        onChange={(e) => {
                          const val = Math.min(sc.points, Math.max(0, parseInt(e.target.value) || 0));
                          setScoresInput({ ...scoresInput, [sc.criterion]: val });
                        }}
                        className="w-20 px-3 py-1.5 rounded-lg border border-stone-300 text-right font-black"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recognition Award Selector */}
              <div className="space-y-2">
                <label className="block font-bold text-stone-800">
                  Assign Recognition Award (Optional)
                </label>
                <select
                  value={awardSelection}
                  onChange={(e) => setAwardSelection(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white font-bold outline-hidden"
                >
                  <option value="">None (Standard Participation)</option>
                  {RECOGNITION_AWARDS.map((award) => (
                    <option key={award} value={award}>
                      🏆 {award}
                    </option>
                  ))}
                </select>
              </div>

              {/* Internal Judging Notes */}
              <div className="space-y-2">
                <label className="block font-bold text-stone-800">
                  Evaluation Feedback & Remarks (Visible to Student)
                </label>
                <textarea
                  rows={3}
                  value={judgingNotes}
                  onChange={(e) => setJudgingNotes(e.target.value)}
                  placeholder="Constructive feedback on discovery quality, accuracy, design flair..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 outline-hidden"
                />
              </div>

              {/* Request Corrections */}
              <div className="space-y-2">
                <label className="block font-bold text-stone-800">
                  Request Corrections (Optional)
                </label>
                <textarea
                  rows={2}
                  value={correctionsInput}
                  onChange={(e) => setCorrectionsInput(e.target.value)}
                  placeholder="Explain what specific item needs correction before re-evaluating..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 outline-hidden"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-stone-600">Mark Status:</label>
                <select
                  value={evaluatingStatus}
                  onChange={(e) => setEvaluatingStatus(e.target.value as any)}
                  className="px-2.5 py-1 rounded-xl border border-stone-200 bg-white text-xs font-bold"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Evaluated">Evaluated (Publish to Student)</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setJudgingSubmission(null)}
                  className="px-4 py-2 rounded-full border border-stone-300 hover:bg-white text-stone-700 font-bold"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveJudgingScore}
                  className="px-5 py-2 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save & Publish Evaluation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
