/**
 * Menu Maps Discovery - Admin Review & Publishing Panel
 * Integrated inside the Admin Console (/admin-secure-panel2010).
 * Gives the platform owner 100% control over published content.
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Edit,
  Eye,
  Trash2,
  ExternalLink,
  MessageSquare,
  Clock,
  MapPin,
  Tag,
  Search,
  Check,
  X,
  FileCheck2,
  Flag,
} from 'lucide-react';
import {
  DiscoveryItem,
  DiscoveryRevision,
  DiscoveryReport,
  PriceVerificationType,
} from '../types/discovery';
import { discoveryApi } from '../lib/discoveryApi';
import { AdminCompetitionManager } from './AdminCompetitionManager';
import { useToast } from '../../components/Toast';

interface AdminDiscoveryReviewPanelProps {
  navigate: (path: string) => void;
}

export const AdminDiscoveryReviewPanel: React.FC<AdminDiscoveryReviewPanelProps> = ({
  navigate,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'submissions' | 'competitions' | 'revisions' | 'reports'>('submissions');
  const [discoveries, setDiscoveries] = useState<DiscoveryItem[]>([]);
  const [revisions, setRevisions] = useState<DiscoveryRevision[]>([]);
  const [reports, setReports] = useState<DiscoveryReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('Pending Approval');
  const [searchQuery, setSearchQuery] = useState('');

  // Review & Edit Modal
  const [reviewItem, setReviewItem] = useState<DiscoveryItem | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackModalTarget, setFeedbackModalTarget] = useState<{
    id: string;
    action: 'reject' | 'changes';
  } | null>(null);

  useEffect(() => {
    loadAllQueueData();
  }, []);

  const loadAllQueueData = async () => {
    setLoading(true);
    try {
      const [allDiscs, revs, reps] = await Promise.all([
        discoveryApi.getAdminQueue(),
        discoveryApi.getAdminRevisionsQueue(),
        discoveryApi.getReportsQueue(),
      ]);
      setDiscoveries(allDiscs);
      setRevisions(revs);
      setReports(reps);
    } catch (e) {
      console.error('Failed to load admin discovery queue', e);
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleApprove = async (id: string) => {
    try {
      await discoveryApi.approveDiscovery(id);
      showToast('Discovery approved and published live!', 'success');
      loadAllQueueData();
      if (reviewItem?.id === id) setReviewItem(null);
    } catch (e) {
      showToast('Failed to approve discovery', 'error');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackModalTarget) return;
    if (!feedbackInput.trim()) {
      showToast('Please provide feedback message for the student', 'error');
      return;
    }

    try {
      if (feedbackModalTarget.action === 'reject') {
        await discoveryApi.rejectDiscovery(feedbackModalTarget.id, feedbackInput.trim());
        showToast('Discovery rejected with feedback', 'info');
      } else {
        await discoveryApi.requestChanges(feedbackModalTarget.id, feedbackInput.trim());
        showToast('Change request sent to student dashboard', 'info');
      }
      setFeedbackModalTarget(null);
      setFeedbackInput('');
      loadAllQueueData();
      if (reviewItem?.id === feedbackModalTarget.id) setReviewItem(null);
    } catch (e) {
      showToast('Failed to submit feedback', 'error');
    }
  };

  const handleSetDiscoveryOfWeek = async (id: string) => {
    try {
      await discoveryApi.setDiscoveryOfWeek(id);
      showToast('Set as Discovery of the Week!', 'success');
      loadAllQueueData();
    } catch (e) {
      showToast('Failed to set featured discovery', 'error');
    }
  };

  const handleUnpublish = async (id: string) => {
    if (!confirm('Unpublish this discovery from the public feed?')) return;
    try {
      await discoveryApi.unpublishDiscovery(id);
      showToast('Discovery unpublished (archived)', 'info');
      loadAllQueueData();
    } catch (e) {
      showToast('Failed to unpublish', 'error');
    }
  };

  const handleApproveRevision = async (revId: string) => {
    try {
      await discoveryApi.approveRevision(revId);
      showToast('Revision approved and merged into live discovery!', 'success');
      loadAllQueueData();
    } catch (e) {
      showToast('Failed to approve revision', 'error');
    }
  };

  const handleRejectRevision = async (revId: string) => {
    try {
      await discoveryApi.rejectRevision(revId, 'Revision rejected by admin');
      showToast('Revision rejected. Live discovery remains unchanged.', 'info');
      loadAllQueueData();
    } catch (e) {
      showToast('Failed to reject revision', 'error');
    }
  };

  const handleResolveReport = async (reportId: string, status: 'Reviewed' | 'Dismissed') => {
    try {
      await discoveryApi.updateReportStatus(reportId, status);
      showToast(`Report marked as ${status}`, 'success');
      loadAllQueueData();
    } catch (e) {
      showToast('Failed to update report', 'error');
    }
  };

  const pendingSubmissionsCount = discoveries.filter(
    (d) => d.status === 'Pending Approval' || d.status === 'Under Review'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#1FB5A0] text-[10px] font-black uppercase tracking-wider">
              Quality Assurance
            </span>
            <span className="text-xs text-stone-400">Strict Human Review</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900 mt-1">Discovery Content Management</h2>
          <p className="text-xs text-stone-500">
            Review incoming student submissions, verify physical counter prices, and manage published food stories.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'submissions' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Submissions Queue ({pendingSubmissionsCount})
          </button>
          <button
            onClick={() => setActiveTab('competitions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'competitions' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Competition Management
          </button>
          <button
            onClick={() => setActiveTab('revisions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'revisions' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Pending Revisions ({revisions.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reports' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Visitor Reports ({reports.filter((r) => r.status === 'Pending').length})
          </button>
        </div>
      </div>

      {/* 1. SUBMISSIONS QUEUE TAB */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {/* Status Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-stone-200">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {['Pending Approval', 'All', 'Changes Requested', 'Rejected', 'Published', 'Draft'].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      statusFilter === st
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {st === 'All' ? 'All Submissions' : st}
                  </button>
                )
              )}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, student..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs outline-hidden"
              />
            </div>
          </div>

          {/* Submissions List */}
          <div className="space-y-3">
            {discoveries
              .filter((d) => {
                if (statusFilter !== 'All' && d.status !== statusFilter) return false;
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase();
                  return (
                    d.title.toLowerCase().includes(q) ||
                    d.contributor_name.toLowerCase().includes(q) ||
                    d.locality.toLowerCase().includes(q)
                  );
                }
                return true;
              })
              .map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 transition-all space-y-3 shadow-2xs"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.main_image}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-100"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'Pending Approval'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : item.status === 'Changes Requested'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="text-[10px] text-stone-500 font-bold">{item.category}</span>
                          <span className="text-[10px] text-stone-400">• {item.locality}</span>
                          {item.is_discovery_of_week && (
                            <span className="px-2 py-0.5 rounded-md bg-[#1FB5A0] text-white text-[9px] font-black uppercase">
                              Discovery of Week
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-stone-900 leading-snug">{item.title}</h4>
                        <div className="text-xs text-stone-500">
                          Submitted by <strong className="text-stone-700">{item.contributor_name}</strong>
                          {item.contributor_college ? ` (${item.contributor_college})` : ''} •{' '}
                          {item.dish_name ? `Dish: ${item.dish_name} (₹${item.price || 'N/A'})` : 'No dish price'}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => setReviewItem(item)}
                        className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-stone-500" />
                        <span>Inspect / Edit</span>
                      </button>

                      {item.status !== 'Published' && (
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="px-4 py-1.5 rounded-xl bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Publish</span>
                        </button>
                      )}

                      {item.status === 'Published' && (
                        <>
                          <button
                            onClick={() => handleSetDiscoveryOfWeek(item.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                              item.is_discovery_of_week
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                            <span>{item.is_discovery_of_week ? 'Featured ✓' : 'Make Featured'}</span>
                          </button>

                          <button
                            onClick={() => handleUnpublish(item.id)}
                            className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800 text-xs font-bold cursor-pointer"
                          >
                            Unpublish
                          </button>
                        </>
                      )}

                      {item.status === 'Pending Approval' && (
                        <>
                          <button
                            onClick={() => setFeedbackModalTarget({ id: item.id, action: 'changes' })}
                            className="px-3 py-1.5 rounded-xl border border-amber-200 text-amber-800 hover:bg-amber-50 text-xs font-bold cursor-pointer"
                          >
                            Request Changes
                          </button>
                          <button
                            onClick={() => setFeedbackModalTarget({ id: item.id, action: 'reject' })}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* COMPETITIONS MANAGEMENT TAB */}
      {activeTab === 'competitions' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
          <AdminCompetitionManager />
        </div>
      )}

      {/* 2. REVISIONS QUEUE TAB */}
      {activeTab === 'revisions' && (
        <div className="space-y-4">
          {revisions.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-2">
              <FileCheck2 className="w-8 h-8 text-stone-300 mx-auto" />
              <div className="text-sm font-bold text-stone-800">No pending revisions</div>
              <p className="text-xs text-stone-500">
                When students edit published discoveries, their proposed changes appear here safely without altering live content.
              </p>
            </div>
          ) : (
            revisions.map((rev) => (
              <div key={rev.id} className="p-5 rounded-2xl bg-white border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-stone-500">
                    Revision by <strong className="text-stone-800">{rev.editor_name}</strong> •{' '}
                    {new Date(rev.submitted_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveRevision(rev.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Merge to Live</span>
                    </button>
                    <button
                      onClick={() => handleRejectRevision(rev.id)}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold cursor-pointer"
                    >
                      Reject Revision
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 text-xs space-y-1">
                  <div className="font-bold text-stone-900">
                    Proposed Title: {rev.proposed_content.title}
                  </div>
                  <p className="text-stone-600 line-clamp-2">
                    {rev.proposed_content.short_description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. VISITOR REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-2">
              <Flag className="w-8 h-8 text-stone-300 mx-auto" />
              <div className="text-sm font-bold text-stone-800">No reported issues</div>
              <p className="text-xs text-stone-500">
                Visitor reports regarding incorrect prices or closed shops will be logged here.
              </p>
            </div>
          ) : (
            reports.map((rep) => (
              <div key={rep.id} className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">
                    {rep.report_reason}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolveReport(rep.id, 'Reviewed')}
                      className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep.id, 'Dismissed')}
                      className="px-3 py-1 rounded-lg text-stone-500 hover:bg-stone-100 text-xs"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>

                <div className="text-xs font-bold text-stone-900">
                  Target: {rep.discovery_title}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl">
                  &ldquo;{rep.description}&rdquo;
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Full Content Inspection & Edit Modal */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setReviewItem(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold">
                Admin Inspection & Direct Edit
              </span>
              <h3 className="text-xl font-black text-stone-900">{reviewItem.title}</h3>
              <div className="text-xs text-stone-500">
                Submitted by {reviewItem.contributor_name} • {reviewItem.locality}
              </div>
            </div>

            <div className="h-52 rounded-2xl overflow-hidden bg-stone-100">
              <img src={reviewItem.main_image} alt={reviewItem.title} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <strong className="block text-stone-700 mb-1">Short Introduction:</strong>
                <p className="text-stone-600 leading-relaxed">{reviewItem.short_description}</p>
              </div>

              <div>
                <strong className="block text-stone-700 mb-1">Full Story:</strong>
                <p className="text-stone-600 whitespace-pre-line leading-relaxed">{reviewItem.full_description}</p>
              </div>

              {reviewItem.dish_name && (
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="font-bold text-stone-800">
                    Dish: {reviewItem.dish_name} (₹{reviewItem.price})
                  </div>
                  <div className="text-stone-500 text-[11px] mt-0.5">
                    Price Type: {reviewItem.price_type}
                  </div>
                  {reviewItem.price_evidence && (
                    <div className="text-stone-600 text-[11px] mt-0.5">
                      Evidence: {reviewItem.price_evidence}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Direct Admin Action Bar */}
            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => navigate(`/discovery/${reviewItem.slug}`)}
                className="px-4 py-2 rounded-full border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Preview Public Page</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFeedbackModalTarget({ id: reviewItem.id, action: 'changes' });
                  }}
                  className="px-4 py-2 rounded-full border border-amber-200 text-amber-800 hover:bg-amber-50 text-xs font-bold"
                >
                  Request Changes
                </button>
                <button
                  onClick={() => handleApprove(reviewItem.id)}
                  className="px-5 py-2 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs font-bold shadow-xs"
                >
                  Approve & Publish Live
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Message Input Modal */}
      {feedbackModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900">
              {feedbackModalTarget.action === 'reject' ? 'Rejection Reason' : 'Change Request Feedback'}
            </h3>
            <p className="text-xs text-stone-500">
              This message will be visible to the student inside their creator dashboard.
            </p>
            <textarea
              rows={4}
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="e.g. Please upload a clear photo of the price board, or check Sunday closing timings..."
              className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#1FB5A0] outline-hidden resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setFeedbackModalTarget(null)}
                className="px-4 py-2 rounded-full border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                className="px-5 py-2 rounded-full bg-stone-900 text-white text-xs font-bold cursor-pointer"
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
