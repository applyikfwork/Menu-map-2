/**
 * Menu Maps Discovery - Competition Registration Modal
 * Handles individual & team registration for Season 01 Competitions.
 */

import React, { useState } from 'react';
import { X, Trophy, Users, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { DiscoveryCompetition } from '../types/discovery';
import { discoveryApi } from '../lib/discoveryApi';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useToast } from '../../components/Toast';

interface CompetitionJoinModalProps {
  competition: DiscoveryCompetition;
  onClose: () => void;
  navigate: (path: string) => void;
}

export const CompetitionJoinModal: React.FC<CompetitionJoinModalProps> = ({
  competition,
  onClose,
  navigate,
}) => {
  const { student, login, register } = useStudentAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'individual' | 'team'>('individual');
  const [studentName, setStudentName] = useState(student?.name || '');
  const [studentEmail, setStudentEmail] = useState(student?.email || '');
  const [college, setCollege] = useState(student?.college_university || '');
  const [teamName, setTeamName] = useState('');
  const [member2, setMember2] = useState('');
  const [member3, setMember3] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentEmail.trim()) {
      showToast('Please provide your name and email', 'error');
      return;
    }
    if (mode === 'team' && !teamName.trim()) {
      showToast('Please enter your team name', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Ensure student is logged in/registered
      if (!student) {
        await register(studentName, studentEmail, college);
      }

      const currentStudentId = student?.id || `student_${Date.now()}`;
      const teamMembers = mode === 'team' ? [studentName, member2, member3].filter(Boolean) : undefined;

      await discoveryApi.registerForCompetition({
        id: `reg_${Date.now()}`,
        competition_id: competition.id,
        competition_title: competition.title,
        student_id: currentStudentId,
        student_name: studentName.trim(),
        student_email: studentEmail.trim(),
        participation_mode: mode,
        team_name: mode === 'team' ? teamName.trim() : undefined,
        team_members: teamMembers,
        registered_at: new Date().toISOString(),
        status: 'Registered',
      });

      showToast(`Successfully registered for ${competition.title}!`, 'success');
      onClose();
      navigate('/student-dashboard?tab=competitions');
    } catch (e) {
      showToast('Failed to complete registration', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#1FB5A0] text-[10px] font-black uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>Season 01 Registration</span>
            </div>
            <h3 className="text-xl font-black text-stone-900 leading-tight">
              {competition.title}
            </h3>
            <p className="text-xs text-stone-500">{competition.tagline}</p>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">Participation Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('individual')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  mode === 'individual'
                    ? 'border-[#1FB5A0] bg-[#1FB5A0]/5 text-stone-900 shadow-xs'
                    : 'border-[#E7E2DA] text-stone-600 hover:bg-stone-50'
                }`}
              >
                <User className={`w-4 h-4 ${mode === 'individual' ? 'text-[#1FB5A0]' : 'text-stone-400'}`} />
                <div>
                  <div className="text-xs font-black">Solo Explorer</div>
                  <div className="text-[10px] text-stone-500">Individual Entry</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('team')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  mode === 'team'
                    ? 'border-[#1FB5A0] bg-[#1FB5A0]/5 text-stone-900 shadow-xs'
                    : 'border-[#E7E2DA] text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Users className={`w-4 h-4 ${mode === 'team' ? 'text-[#1FB5A0]' : 'text-stone-400'}`} />
                <div>
                  <div className="text-xs font-black">Team Entry</div>
                  <div className="text-[10px] text-stone-500">2 to 3 Students</div>
                </div>
              </button>
            </div>
          </div>

          {/* Student Leader Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {mode === 'team' ? 'Team Leader Name' : 'Your Full Name'}
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">College / University</label>
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Hindu College, DU"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Team Fields */}
          {mode === 'team' && (
            <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#E7E2DA] space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. The Campus Foodies"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Team Member 2</label>
                  <input
                    type="text"
                    value={member2}
                    onChange={(e) => setMember2(e.target.value)}
                    placeholder="Member name"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Team Member 3 (Optional)</label>
                  <input
                    type="text"
                    value={member3}
                    onChange={(e) => setMember3(e.target.value)}
                    placeholder="Member name"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? 'Registering...' : 'Confirm Registration'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
