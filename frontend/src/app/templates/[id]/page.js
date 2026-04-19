'use client';

import { useState, useEffect, use, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Download, Star, ArrowLeft, Calendar, FileText, HardDrive,
  User, Bookmark, BookmarkCheck, Share2, Flag, ChevronRight,
  Presentation, FileSpreadsheet, Send, Edit3, Save, X
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import StarRating from '@/components/ui/StarRating';
import TemplateCard from '@/components/templates/TemplateCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const fileIcons = {
  'application/pdf': FileText,
  'application/msword': FileText,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileText,
  'application/vnd.ms-powerpoint': Presentation,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': Presentation,
  'application/vnd.ms-excel': FileSpreadsheet,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
};

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

export default function TemplateDetailPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [template, setTemplate] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Content Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'blockquote', 'code-block'],
      ['clean'],
    ],
  }), []);

  useEffect(() => {
    fetchTemplate();
  }, [id]);

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const [templateRes, reviewsRes] = await Promise.all([
        api.get(`/templates/${id}`),
        api.get(`/reviews/${id}`)
      ]);
      const templateData = templateRes.data.template;
      setTemplate(templateData);
      setEditContent(templateData.content || '');
      setReviews(reviewsRes.data.reviews || []);

      // Check bookmark status
      if (user?.bookmarks) {
        setIsBookmarked(user.bookmarks.some(b => (b._id || b) === id));
      }

      // Fetch related templates
      try {
        const relatedRes = await api.get(`/templates?category=${templateData.category}&limit=4`);
        setRelated(relatedRes.data.templates?.filter(t => t._id !== id).slice(0, 3) || []);
      } catch (e) {}
    } catch (error) {
      console.error('Error fetching template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const link = document.createElement('a');
      link.href = `${backendUrl}/api/templates/${id}/download`;
      link.download = template.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTemplate(prev => ({ ...prev, downloads: (prev.downloads || 0) + 1 }));
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveContent = async () => {
    if (!isAuthenticated) return router.push('/auth/login');
    setSaving(true);
    try {
      const res = await api.put(`/templates/${id}`, { content: editContent });
      setTemplate(prev => ({ ...prev, content: res.data.template.content }));
      setIsEditing(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving content');
    } finally {
      setSaving(false);
    }
  };

  const toggleBookmark = async () => {
    if (!isAuthenticated) return router.push('/auth/login');
    try {
      const res = await api.post(`/users/bookmarks/${id}`);
      setIsBookmarked(res.data.bookmarked);
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return router.push('/auth/login');
    if (!reviewRating) return;

    setSubmittingReview(true);
    try {
      const res = await api.post(`/reviews/${id}`, {
        rating: reviewRating,
        comment: reviewComment
      });
      setReviews([res.data.review, ...reviews]);
      setReviewRating(0);
      setReviewComment('');
      // Refresh template to get updated rating
      const updatedTemplate = await api.get(`/templates/${id}`);
      setTemplate(updatedTemplate.data.template);
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const getFileExtension = (type) => {
    const map = {
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'application/vnd.ms-powerpoint': 'PPT',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
      'application/vnd.ms-excel': 'XLS',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    };
    return map[type] || 'FILE';
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading template..." />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen gradient-mesh flex flex-col items-center justify-center">
        <FileText className="w-16 h-16 text-[var(--text-muted)] mb-4" />
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Template not found</h2>
        <Link href="/templates" className="btn-primary mt-4"><span>Browse Templates</span></Link>
      </div>
    );
  }

  const FileIcon = fileIcons[template.fileType] || FileText;
  const gradientClass = categoryColors[template.category] || categoryColors.Other;
  const hasReviewed = reviews.some(r => r.user?._id === user?.id);
  const isOwner = template.author?._id === user?.id;

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl overflow-hidden"
            >
              {/* Preview Area */}
              <div className="relative h-56 sm:h-72 w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                {template.thumbnailUrl ? (
                  <>
                    <img 
                      src={template.thumbnailUrl.startsWith('http') ? template.thumbnailUrl : `http://localhost:5001${template.thumbnailUrl}`} 
                      alt={template.title} 
                      className="absolute inset-0 w-full h-full object-cover opacity-90 scale-100 transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  </>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`}>
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-6 right-6 w-24 h-24 rounded-full border border-white/30" />
                      <div className="absolute bottom-6 left-6 w-16 h-16 rounded-lg border border-white/20 rotate-12" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-white/10" />
                    </div>
                    <FileIcon className="w-20 h-20 text-white/80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                )}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-sm font-medium shadow-lg z-10">
                  {template.category}
                </div>
                {template.featured && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-amber-500/90 text-white text-sm font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-white" /> Featured
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between mb-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Space Grotesk' }}>
                    {template.title}
                  </h1>
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                  {template.description}
                </p>

                {/* Editable Content Area */}
                {(template.content || isOwner) && (
                  <div className="mt-8 pt-8 border-t border-[var(--border-color)]">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Space Grotesk' }}>
                        Template <span className="gradient-text">Content</span>
                      </h2>
                      {isAuthenticated && (
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border-color)] text-sm font-medium text-[var(--color-primary)] transition-all"
                        >
                          {isEditing ? <><X className="w-4 h-4" /> Cancel</> : <><Edit3 className="w-4 h-4" /> Edit Template</>}
                        </button>
                      )}
                    </div>

                    <div className="glass rounded-2xl overflow-hidden min-h-[200px] relative">
                      <AnimatePresence mode="wait">
                        {isEditing ? (
                          <motion.div
                            key="editing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-1"
                          >
                            <ReactQuill
                              theme="snow"
                              value={editContent}
                              onChange={setEditContent}
                              modules={modules}
                              className="bg-transparent"
                            />
                            <div className="p-4 flex justify-end gap-3 bg-[var(--surface)] border-t border-[var(--border-color)]">
                              <button
                                onClick={() => setIsEditing(false)}
                                className="px-5 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveContent}
                                disabled={saving}
                                className="btn-primary !py-2 !px-6 flex items-center gap-2 text-sm"
                              >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Changes'}
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="viewing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-6 sm:p-8"
                          >
                            {template.content ? (
                              <div 
                                className="prose prose-invert max-w-none text-[var(--text-secondary)]"
                                dangerouslySetInnerHTML={{ __html: template.content }}
                              />
                            ) : (
                              <div className="text-center py-10">
                                <FileText className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-20" />
                                <p className="text-[var(--text-muted)] italic">This template only has a downloadable file.</p>
                                {isAuthenticated && (
                                  <button onClick={() => setIsEditing(true)} className="mt-4 text-[var(--color-primary)] hover:underline text-sm font-medium">
                                    Add editable content
                                  </button>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <style jsx global>{`
                      .ql-container { font-family: inherit; font-size: 1.05rem; border: none !important; }
                      .ql-toolbar { background: var(--surface); border: none !important; border-bottom: 1px solid var(--border-color) !important; }
                      .ql-editor { min-height: 300px; color: var(--text-primary); line-height: 1.6; }
                      .prose h1 { font-size: 2rem; color: var(--text-primary); margin-bottom: 1rem; }
                      .prose h2 { font-size: 1.5rem; color: var(--text-primary); margin-top: 2rem; margin-bottom: 0.8rem; }
                      .prose p { margin-bottom: 1.2rem; }
                      .prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.2rem; }
                    `}</style>
                  </div>
                )}

                {/* Tags */}
                {template.tags?.length > 0 && !isEditing && (
                  <div className="flex flex-wrap gap-2 mb-6 mt-8">
                    {template.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-[var(--surface)] text-[var(--text-muted)] text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--text-secondary)] mt-6">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-[var(--text-primary)]">{template.averageRating?.toFixed(1)}</span>
                    <span>({template.totalRatings} ratings)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Download className="w-4 h-4" />
                    <span>{template.downloads?.toLocaleString()} downloads</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(template.createdAt)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 sm:p-8"
            >
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: 'Space Grotesk' }}>
                Reviews ({reviews.length})
              </h2>

              {/* Review Form */}
              {isAuthenticated && !hasReviewed && !isOwner && (
                <form onSubmit={handleReviewSubmit} className="mb-8 p-5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Write a Review</h3>
                  <div className="mb-4">
                    <StarRating rating={reviewRating} onRate={setReviewRating} size="lg" showValue={false} />
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this template..."
                    rows={3}
                    className="input-field resize-none mb-3"
                  />
                  <button
                    type="submit"
                    disabled={!reviewRating || submittingReview}
                    className="btn-primary text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </span>
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-center text-[var(--text-muted)] py-8">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map((review, i) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold shrink-0">
                          {review.user?.name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-semibold text-[var(--text-primary)]">{review.user?.name}</h4>
                            <span className="text-xs text-[var(--text-muted)]">{formatDate(review.createdAt)}</span>
                          </div>
                          <StarRating rating={review.rating} readOnly size="sm" showValue={false} />
                          {review.comment && (
                            <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6 sticky top-24"
            >
              {/* Download Button (Only show if file exists) */}
              {template.fileUrl ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full btn-primary text-base py-4 rounded-xl flex items-center justify-center gap-2 mb-4"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    {downloading ? 'Downloading...' : 'Download Template'}
                  </span>
                </motion.button>
              ) : (
                <div className="w-full p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center mb-4">
                  <p className="text-sm font-semibold text-violet-400">Online Template</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Read and edit directly in browser</p>
                </div>
              )}

              {/* Bookmark & Share */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={toggleBookmark}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-sm font-medium ${
                    isBookmarked
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  {isBookmarked ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--color-primary)] transition-all text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>

              {/* File Info */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-color)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Details</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Type</span>
                  <span className="text-[var(--text-primary)] font-medium">
                    {template.fileUrl ? getFileExtension(template.fileType) : 'Online Editor'}
                  </span>
                </div>
                {template.fileSize > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Size</span>
                    <span className="text-[var(--text-primary)] font-medium">{formatFileSize(template.fileSize)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Category</span>
                  <span className="text-[var(--text-primary)] font-medium">{template.category}</span>
                </div>
              </div>

              {/* Author */}
              <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Created by</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold">
                    {template.author?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{template.author?.name}</p>
                    {template.author?.bio && (
                      <p className="text-xs text-[var(--text-muted)] line-clamp-1">{template.author.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Templates */}
        {related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Space Grotesk' }}>
                Related <span className="gradient-text">Templates</span>
              </h2>
              <Link href={`/templates?category=${template.category}`} className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="template-grid">
              {related.map((t, i) => (
                <TemplateCard key={t._id} template={t} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
