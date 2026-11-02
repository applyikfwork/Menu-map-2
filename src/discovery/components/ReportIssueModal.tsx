/**
 * Menu Maps Discovery - Report Issue Modal
 * Allows visitors to report inaccurate information for admin review.
 */

import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { useToast } from '../../components/Toast';

interface ReportIssueModalProps {
  discoveryId: string;
  discoveryTitle: string;
  onClose: () => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  discoveryId,
  discoveryTitle,
  onClose,
}) => {
  const { showToast } = useToast();
  const [reason, setReason] = useState('Inaccurate Price');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast('Please provide brief details of the issue', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await discoveryApi.saveReport({
        id: `report_${Date.now()}`,
        discovery_id: discoveryId,
        discovery_title: discoveryTitle,
        report_reason: reason,
        description: description.trim(),
        reporter_email: email.trim() || undefined,
        submitted_at: new Date().toISOString(),
        status: 'Pending',
      });
      setSubmitted(true);
      showToast('Report submitted for admin review. Thank you!', 'success');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e) {
      showToast('Failed to submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Thank You for Your Feedback</h3>
            <p className="text-xs text-stone-600">
              Our review team will inspect this discovery and cross-check the counter information.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-stone-900">
              <AlertCircle className="w-5 h-5 text-[#FF6B4A]" />
              <h3 className="font-bold text-base">Report Incorrect Information</h3>
            </div>

            <p className="text-xs text-stone-500">
              Reporting for: <strong className="text-stone-800">{discoveryTitle}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Issue Category</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
              >
                <option value="Inaccurate Price">Inaccurate or Changed Price</option>
                <option value="Closed / Relocated">Outlet Closed or Relocated</option>
                <option value="Incorrect Address">Incorrect Address or Location</option>
                <option value="Wrong Dish / Menu Info">Wrong Dish / Menu Information</option>
                <option value="Other">Other Observation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Details & Correct Information
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Current counter price is ₹90, or shop is closed on Mondays..."
                rows={3}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E7E2DA] text-xs focus:ring-2 focus:ring-[#1FB5A0] outline-hidden resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Your Email (Optional, for confirmation)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-xl border border-[#E7E2DA] text-xs focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-full bg-[#1FB5A0] text-white text-xs font-bold hover:bg-[#199d8b] transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
