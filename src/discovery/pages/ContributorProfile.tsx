/**
 * Menu Maps Discovery - Public Contributor Portfolio (/discovery/contributors/:slug)
 * Verified public profile celebrating a student's approved contributions, creations, and stamps.
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Award,
  Sparkles,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Share2,
} from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { StudentProfile, StudentProject, FoodDiscoveryItem, PassportStamp } from '../types/discovery';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';
import { StudentProjectCard } from '../components/StudentProjectCard';
import { FoodDiscoveryCard } from '../components/FoodDiscoveryCard';
import { PassportWidget } from '../components/PassportWidget';
import { evaluateStudentStamps } from '../lib/discoveryPassport';
import { useToast } from '../../components/Toast';

interface ContributorProfileProps {
  slug: string;
  navigate: (path: string) => void;
}

export const ContributorProfile: React.FC<ContributorProfileProps> = ({ slug, navigate }) => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [discoveries, setDiscoveries] = useState<FoodDiscoveryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [slug]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const p = await discoveryApi.getContributorBySlug(slug);
      setProfile(p);

      if (p) {
        const [allProjs, allDiscs] = await Promise.all([
          discoveryApi.getStudentProjects(),
          discoveryApi.getApprovedFoodDiscoveries(),
        ]);

        setProjects(allProjs.filter((proj) => proj.student_id === p.id));
        setDiscoveries(allDiscs.filter((d) => d.student_id === p.id));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Portfolio link copied to clipboard!', 'success');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <DiscoveryNavbar currentPath={`/discovery/contributors/${slug}`} navigate={navigate} />
        <div className="py-24 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#0F766E] border-t-transparent animate-spin mx-auto mb-3" />
          <span className="text-xs text-stone-500 font-semibold">Loading contributor portfolio...</span>
        </div>
      </div>
    );
  }

  if (!profile || !profile.is_public_profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <DiscoveryNavbar currentPath={`/discovery/contributors/${slug}`} navigate={navigate} />
        <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
          <User className="w-12 h-12 text-stone-300 mx-auto" />
          <h2 className="hd text-xl font-bold text-[#1C1917]">Portfolio Private or Not Found</h2>
          <p className="text-xs text-stone-500">
            This student contributor has either disabled public portfolio visibility or the link is incorrect.
          </p>
          <button
            onClick={() => navigate('/discovery/contributors')}
            className="btn bg-[#0F766E] text-white px-5 py-2.5 rounded-xl text-xs font-bold"
          >
            Browse Contributors
          </button>
        </div>
      </div>
    );
  }

  const stamps = evaluateStudentStamps(
    profile,
    discoveries.length,
    projects.length > 0,
    false,
    false
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar currentPath={`/discovery/contributors/${slug}`} navigate={navigate} />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-14 space-y-10">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/discovery/contributors')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Contributors</span>
          </button>

          <button
            onClick={handleShare}
            className="btn bg-white hover:bg-stone-50 border border-[#E7E2DA] text-stone-700 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Portfolio</span>
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white border border-[#E7E2DA] rounded-[36px] p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl object-cover border border-stone-200 shadow-xs"
                />
              ) : (
                <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-br from-[#0F766E] to-teal-800 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-xs">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="hd text-2xl sm:text-3xl font-black text-[#1C1917]">
                    {profile.full_name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-[#0F766E] border border-teal-200 text-[10px] font-black uppercase tracking-wider">
                    {profile.contributor_level}
                  </span>
                </div>

                {profile.public_consent_college && profile.college_name && (
                  <p className="text-xs sm:text-sm text-stone-600 font-medium flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-stone-400" />
                    <span>{profile.college_name}</span>
                    {profile.programme && <span className="text-stone-400">· {profile.programme}</span>}
                  </p>
                )}

                {profile.bio && (
                  <p className="text-xs text-[#57534E] leading-relaxed max-w-xl pt-1">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-around sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-stone-100">
              <div className="text-center px-4 py-2 bg-[#FAF8F5] rounded-2xl border border-[#E7E2DA]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Credits</span>
                <span className="font-black text-lg text-[#0F766E]">{profile.total_credits || 0}</span>
              </div>
              <div className="text-center px-4 py-2 bg-[#FAF8F5] rounded-2xl border border-[#E7E2DA]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Accepted</span>
                <span className="font-black text-lg text-[#1C1917]">{discoveries.length + projects.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Passport Preview */}
        <PassportWidget profile={profile} earnedStamps={stamps} />

        {/* Published Student Projects */}
        {projects.length > 0 && (
          <div className="space-y-4">
            <h3 className="hd text-xl sm:text-2xl font-bold text-[#1C1917]">
              Published Projects ({projects.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <StudentProjectCard key={proj.id} project={proj} navigate={navigate} />
              ))}
            </div>
          </div>
        )}

        {/* Approved Food Discoveries */}
        {discoveries.length > 0 && (
          <div className="space-y-4">
            <h3 className="hd text-xl sm:text-2xl font-bold text-[#1C1917]">
              Verified Food Discoveries ({discoveries.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discoveries.map((disc) => (
                <FoodDiscoveryCard key={disc.id} item={disc} navigate={navigate} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
