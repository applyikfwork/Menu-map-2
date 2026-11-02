/**
 * Menu Maps Discovery - Student Project Card
 * Showcases approved student work in the public creations gallery.
 */

import React from 'react';
import { Eye, Heart, Sparkles, ExternalLink, User, ArrowRight } from 'lucide-react';
import { StudentProject } from '../types/discovery';

interface StudentProjectCardProps {
  project: StudentProject;
  navigate: (path: string) => void;
}

export const StudentProjectCard: React.FC<StudentProjectCardProps> = ({ project, navigate }) => {
  return (
    <div className="bg-white border border-[#E7E2DA] rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Cover Media */}
        <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
          <img
            src={project.cover_image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Category Pill */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
              {project.category}
            </span>
          </div>

          {/* Competition source if linked */}
          {project.competition_title && (
            <div className="absolute bottom-3 left-3 right-3 truncate">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md truncate max-w-full">
                <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                <span className="truncate">{project.competition_title}</span>
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#0F766E]" />
              <strong className="text-stone-800 font-bold truncate max-w-[140px]">{project.creator_name}</strong>
            </span>
            {project.creator_college && (
              <span className="text-[11px] text-stone-400 truncate max-w-[130px]">
                {project.creator_college}
              </span>
            )}
          </div>

          <h3 className="hd text-base sm:text-lg font-bold text-[#1C1917] group-hover:text-[#0F766E] transition-colors leading-snug line-clamp-1">
            {project.title}
          </h3>

          <p className="text-xs text-[#57534E] leading-relaxed line-clamp-2">
            {project.short_description || project.description}
          </p>

          {project.credit_awarded && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0F766E] text-[11px] font-bold">
              <span>🏅 {project.credit_awarded}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 sm:p-6 pt-0 border-t border-stone-100 flex items-center justify-between">
        <button
          onClick={() => navigate(`/discovery/creations/${project.slug}`)}
          className="text-xs font-bold text-[#0F766E] hover:text-[#0D9488] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View Project</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        <span className="text-[11px] text-stone-400">
          {new Date(project.published_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
};
