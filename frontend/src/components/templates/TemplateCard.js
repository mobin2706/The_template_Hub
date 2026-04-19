'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download, Star, Eye, Bookmark, BookmarkCheck, FileText, FileSpreadsheet, FileImage, Presentation } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api, { getMediaUrl } from '@/lib/api';
import { useState } from 'react';

const categoryColors = {
  Education: 'from-violet-500 to-purple-600',
  Business: 'from-blue-500 to-indigo-600',
  Design: 'from-pink-500 to-rose-600',
  Technology: 'from-cyan-500 to-teal-600',
  Healthcare: 'from-emerald-500 to-green-600',
  Legal: 'from-amber-500 to-yellow-600',
  Marketing: 'from-red-500 to-orange-600',
  Other: 'from-gray-500 to-slate-600'
};

const fileIcons = {
  'application/pdf': FileText,
  'application/msword': FileText,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileText,
  'application/vnd.ms-powerpoint': Presentation,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': Presentation,
  'application/vnd.ms-excel': FileSpreadsheet,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
};

export default function TemplateCard({ template, index = 0, onBookmarkToggle }) {
  const { user, isAuthenticated } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(
    user?.bookmarks?.some(b => (b._id || b) === template._id)
  );

  const FileIcon = fileIcons[template.fileType] || FileText;
  const gradientClass = categoryColors[template.category] || categoryColors.Other;

  const toggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    try {
      const res = await api.post(`/users/bookmarks/${template._id}`);
      setIsBookmarked(res.data.bookmarked);
      if (onBookmarkToggle) onBookmarkToggle(template._id, res.data.bookmarked);
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/templates/${template._id}`} className="block group">
        <div className="glass card-hover rounded-2xl overflow-hidden h-full">
          {/* Thumbnail / Header */}
          <div className="relative h-44 w-full bg-slate-900 flex items-center justify-center overflow-hidden">
            {template.thumbnailUrl ? (
              <>
                <img 
                  src={getMediaUrl(template.thumbnailUrl)} 
                  alt={template.title} 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                {/* File Icon floating delicately */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 shadow-xl">
                  <FileIcon className="w-6 h-6 text-white drop-shadow-md" />
                </div>
              </>
            ) : (
              // Fallback gradient if no thumbnail is available
              <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`}>
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 right-4 w-20 h-20 rounded-full border border-white/30" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 rounded-lg border border-white/20 rotate-12" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/10" />
                </div>
                <div className="flex items-center justify-center h-full">
                  <FileIcon className="w-14 h-14 text-white/80 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
              {template.category}
            </div>

            {/* Bookmark Button */}
            {isAuthenticated && (
              <button
                onClick={toggleBookmark}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-all"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 fill-white" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Featured badge */}
            {template.featured && (
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-xs font-semibold flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" /> Featured
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-semibold text-[var(--text-primary)] text-base mb-1.5 line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors" style={{ fontFamily: 'Space Grotesk' }}>
              {template.title}
            </h3>
            <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-3 leading-relaxed">
              {template.description}
            </p>

            {/* Tags */}
            {template.tags && template.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {template.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-[var(--surface)] text-[var(--text-muted)] text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {template.tags.length > 3 && (
                  <span className="text-xs text-[var(--text-muted)]">+{template.tags.length - 3}</span>
                )}
              </div>
            )}

            {/* Author */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-medium">
                {template.author?.name?.charAt(0)}
              </div>
              <span className="text-xs text-[var(--text-secondary)]">{template.author?.name}</span>
              <span className="text-xs text-[var(--text-muted)]">· {formatFileSize(template.fileSize)}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="text-xs font-medium">{template.averageRating?.toFixed(1) || '0.0'}</span>
                <span className="text-xs text-[var(--text-muted)]">({template.totalRatings || 0})</span>
              </div>
              <div className="flex items-center gap-1 text-[var(--text-muted)]">
                <Download className="w-3.5 h-3.5" />
                <span className="text-xs">{template.downloads?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
