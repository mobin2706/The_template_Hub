'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Upload, FileUp, X, Check, AlertCircle, ArrowRight, ArrowLeft, Tag, FileText, PenLine
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const categories = ['Education', 'Business', 'Design', 'Technology', 'Healthcare', 'Legal', 'Marketing', 'Other'];

const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg', 'image/png', 'image/webp'
];

export default function UploadPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('file'); // 'file' or 'content'
  const [file, setFile] = useState(null);
  const [content, setContent] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'blockquote', 'code-block'],
      [{ color: [] }, { background: [] }],
      ['clean'],
    ],
  }), []);

  if (!authLoading && !isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && allowedTypes.includes(dropped.type)) {
      setFile(dropped);
      setError('');
    } else {
      setError('Invalid file type. Supported: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG');
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected && allowedTypes.includes(selected.type)) {
      setFile(selected);
      setError('');
    } else if (selected) {
      setError('Invalid file type');
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 8) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const canGoNext = () => {
    if (step === 1) {
      if (method === 'file') return !!file;
      if (method === 'content') return content.length > 20; // Basic check
    }
    if (step === 2) return title.trim() && description.trim() && category;
    return true;
  };

  const handleSubmit = async () => {
    if ((method === 'file' && !file) || (method === 'content' && !content) || !title || !description || !category) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      if (method === 'file') {
        formData.append('file', file);
      } else {
        formData.append('content', content);
      }
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('tags', tags.join(','));

      await api.post('/templates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
      setTimeout(() => router.push('/templates'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading template');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (success) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass rounded-3xl p-10 text-center max-w-md"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Upload Successful!
          </h2>
          <p className="text-[var(--text-secondary)]">Your template has been published and is now available for the community.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Upload <span className="gradient-text">Template</span>
          </h1>
          <p className="text-[var(--text-secondary)]">Share your knowledge with others</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= s
                  ? 'gradient-primary text-white'
                  : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border-color)]'
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 rounded-full transition-all ${
                  step > s ? 'gradient-primary' : 'bg-[var(--border-color)]'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Step 1: File Upload or Write Content */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="glass rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6" style={{ fontFamily: 'Space Grotesk' }}>
                How would you like to share your template?
              </h2>

              {/* Method Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => setMethod('file')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all group ${
                    method === 'file'
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--border-color)] hover:border-[var(--color-primary)]/50 bg-[var(--surface)]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                    method === 'file' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
                  }`}>
                    <FileUp className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[var(--text-primary)] mb-1">Upload File</h3>
                  <p className="text-sm text-[var(--text-muted)] font-normal">PDF, DOC, PPT or Spreadsheet</p>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('content')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all group ${
                    method === 'content'
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--border-color)] hover:border-[var(--color-primary)]/50 bg-[var(--surface)]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                    method === 'content' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
                  }`}>
                    <PenLine className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[var(--text-primary)] mb-1">Write Online</h3>
                  <p className="text-sm text-[var(--text-muted)] font-normal">Create an editable template directly</p>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {method === 'file' ? (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                        dragOver
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                          : file
                          ? 'border-emerald-500/40 bg-emerald-500/5'
                          : 'border-[var(--border-color)] hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                      />
                      {file ? (
                        <div>
                          <div className="w-14 h-14 mx-auto rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                            <Check className="w-7 h-7 text-emerald-400" />
                          </div>
                          <p className="text-[var(--text-primary)] font-medium mb-1">{file.name}</p>
                          <p className="text-sm text-[var(--text-muted)]">{formatFileSize(file.size)}</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                            className="mt-3 text-sm text-red-400 hover:underline"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div>
                          <FileUp className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                          <p className="text-[var(--text-primary)] font-medium mb-1">Drop your file or click to browse</p>
                          <p className="text-sm text-[var(--text-muted)]">PDF, DOC, PPT up to 50MB</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="rich-editor-container border rounded-2xl overflow-hidden glass">
                      <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        placeholder="Write your template content here..."
                        className="h-80 text-[var(--text-primary)]"
                      />
                    </div>
                    <style jsx global>{`
                      .ql-container {
                        font-family: inherit;
                        font-size: 1rem;
                        border: none !important;
                      }
                      .ql-toolbar {
                        background: var(--surface);
                        border: none !important;
                        border-bottom: 1px solid var(--border-color) !important;
                        border-top-left-radius: 1rem;
                        border-top-right-radius: 1rem;
                      }
                      .ql-editor {
                        min-height: 200px;
                        color: var(--text-primary);
                      }
                      .ql-editor.ql-blank::before {
                        color: var(--text-muted);
                        font-style: normal;
                      }
                      .ql-snow .ql-stroke {
                        stroke: var(--text-secondary);
                      }
                      .ql-snow .ql-fill {
                        fill: var(--text-secondary);
                      }
                      .ql-snow .ql-picker {
                        color: var(--text-secondary);
                      }
                    `}</style>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="glass rounded-2xl p-6 sm:p-8 space-y-5">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'Space Grotesk' }}>
                Description & Category
              </h2>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Professional Business Proposal"
                  className="input-field"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Short Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this template for?"
                  rows={4}
                  className="input-field resize-none"
                  maxLength={2000}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Category *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                        category === cat
                          ? 'gradient-primary text-white shadow-lg'
                          : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border-color)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Tags (optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add a tag and press Enter"
                    className="input-field flex-1"
                  />
                  <button onClick={addTag} className="px-4 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
                    <Tag className="w-4 h-4" />
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="glass rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6" style={{ fontFamily: 'Space Grotesk' }}>
                Review & Publish
              </h2>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-muted)]">Source</span>
                  <div className="flex items-center gap-2 mt-1">
                    {method === 'file' ? (
                      <>
                        <FileUp className="w-4 h-4 text-emerald-400" />
                        <p className="text-sm font-medium text-[var(--text-primary)]">{file?.name} ({formatFileSize(file?.size)})</p>
                      </>
                    ) : (
                      <>
                        <PenLine className="w-4 h-4 text-violet-400" />
                        <p className="text-sm font-medium text-[var(--text-primary)]">Online Rich Text Document</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-muted)]">Title</span>
                  <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{title}</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-muted)]">Description</span>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]">
                    <span className="text-xs text-[var(--text-muted)]">Category</span>
                    <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{category}</p>
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]">
                    <span className="text-xs text-[var(--text-muted)]">Tags</span>
                    <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{tags.length > 0 ? tags.join(', ') : 'None'}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="btn-outline flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={uploading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 text-base px-8 py-3"
            >
              <span className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                {uploading ? 'Publishing...' : 'Publish Template'}
              </span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
