/**
 * Menu Maps Discovery - Project Detail Page (/discovery/creations/:slug)
 * Deep-dive view of an approved student project with prototype embeds, media, and attribution.
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowLeft,
  User,
  GraduationCap,
  ExternalLink,
  Award,
  Calendar,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { StudentProject } from '../types/discovery';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';
import { useToast } from '../../components/Toast';

interface ProjectDetailProps {
  slug: string;
  navigate: (path: string) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ slug, navigate }) => {
  const { showToast } = useToast();
  const [project, setProject] = useState<StudentProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [slug]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const p = await discoveryApi.getStudentProjectBySlug(slug);
      setProject(p);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Project link copied to clipboard!', 'success');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <DiscoveryNavbar currentPath={`/discovery/creations/${slug}`} navigate={navigate} />
        <div className="py-24 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#0F766E] border-t-transparent animate-spin mx-auto mb-3" />
          <span className="text-xs text-stone-500 font-semibold">Loading project...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <DiscoveryNavbar currentPath={`/discovery/creations/${slug}`} navigate={navigate} />
        <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-stone-300 mx-auto" />
          <h2 className="hd text-xl font-bold text-[#1C1917]">Project Not Found</h2>
          <p className="text-xs text-stone-500">This creation may be private or unapproved.</p>
          <button
            onClick={() => navigate('/discovery/creations')}
            className="btn bg-[#0F766E] text-white px-5 py-2.5 rounded-xl text-xs font-bold"
          >
            Browse All Creations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar currentPath={`/discovery/creations/${slug}`} navigate={navigate} />

      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-14">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate('/discovery/creations')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Creations</span>
          </button>

          <button
            onClick={handleShare}
            className="btn bg-white hover:bg-stone-50 border border-[#E7E2DA] text-stone-700 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Project</span>
          </button>
        </div>

        {/* Project Card */}
        <div className="bg-white border border-[#E7E2DA] rounded-[36px] overflow-hidden shadow-xs p-6 sm:p-10 space-y-8">
          {/* Header Area */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-teal-50 text-[#0F766E] text-xs font-bold border border-teal-200">
                {project.category}
              </span>
              {project.credit_awarded && (
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
                  🏅 {project.credit_awarded}
                </span>
              )}
            </div>

            <h1 className="hd text-2xl sm:text-4xl lg:text-5xl font-black text-[#1C1917] tracking-tight leading-tight">
              {project.title}
            </h1>

            {/* Creator Attribution Bar */}
            <div className="flex flex-wrap items-center gap-4 py-3 border-y border-stone-100 text-xs text-stone-600">
              <span className="flex items-center gap-1.5 font-bold text-stone-900">
                <User className="w-4 h-4 text-[#0F766E]" />
                <span>Created by {project.creator_name}</span>
              </span>

              {project.creator_college && (
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-stone-400" />
                  <span>{project.creator_college}</span>
                </span>
              )}

              <span className="flex items-center gap-1.5 text-stone-400">
                <Calendar className="w-4 h-4" />
                <span>Published {new Date(project.published_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </span>
            </div>
          </div>

          {/* Cover Media */}
          <div className="rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 aspect-video w-full max-h-[520px]">
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="hd text-xl font-bold text-[#1C1917]">Project Brief & Documentation</h3>
            <div className="text-xs sm:text-sm text-[#57534E] leading-relaxed whitespace-pre-line">
              {project.description}
            </div>
          </div>

          {/* External Links Strip */}
          {(project.prototype_url || project.video_url || project.presentation_url) && (
            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#E7E2DA] space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-600">
                Interactive Artifacts & External Links
              </h4>
              <div className="flex flex-wrap gap-3">
                {project.prototype_url && (
                  <a
                    href={project.prototype_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn bg-[#0F766E] hover:bg-[#0D9488] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs"
                  >
                    <span>Open Interactive Prototype</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {project.presentation_url && (
                  <a
                    href={project.presentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn bg-white hover:bg-stone-50 border border-[#E7E2DA] text-[#1C1917] px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <span>View Presentation / Deck</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {project.video_url && (
                  <a
                    href={project.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn bg-white hover:bg-stone-50 border border-[#E7E2DA] text-[#1C1917] px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <span>Watch Walkthrough Video</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Challenge Origin */}
          {project.competition_title && (
            <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 text-xs flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0F766E] block">
                  Challenge Submission
                </span>
                <strong className="text-stone-800 font-bold block mt-0.5">{project.competition_title}</strong>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
