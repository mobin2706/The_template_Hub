'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown
} from 'lucide-react';
import api from '@/lib/api';
import TemplateCard from '@/components/templates/TemplateCard';
import { SkeletonGrid } from '@/components/ui/LoadingSpinner';

const categories = ['All', 'Education', 'Business', 'Design', 'Technology', 'Healthcare', 'Legal', 'Marketing', 'Other'];
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Downloaded' },
  { value: 'rating', label: 'Highest Rated' },
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category !== 'All') params.set('category', category);
      params.set('sort', sort);
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await api.get(`/templates?${params.toString()}`);
      setTemplates(res.data.templates || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlSearch = searchParams.get('search');
    const urlSort = searchParams.get('sort');
    if (urlCategory && urlCategory !== category) setCategory(urlCategory);
    if (urlSearch && urlSearch !== search) setSearch(urlSearch);
    if (urlSort && urlSort !== sort) setSort(urlSort);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTemplates();
  };

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Header */}
      <div className="pt-8 pb-6 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Browse <span className="gradient-text">Templates</span>
          </h1>
          <p className="text-[var(--text-secondary)]">
            {total > 0 ? `${total} templates found` : 'Discover professional templates'}
          </p>
        </motion.div>
      </div>

      <div className="px-4 sm:px-6 max-w-7xl mx-auto pb-20">
        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="input-field !pl-10 !pr-4"
                id="browse-search"
              />
            </form>

            {/* Sort */}
            <div className="relative min-w-[180px]">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="input-field appearance-none cursor-pointer !pr-10"
                id="sort-select"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            </div>

            {/* Filter Toggle (mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`md:hidden flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                showFilters
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                  : 'border-[var(--border-color)] text-[var(--text-secondary)]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Category Filters */}
          <div className={`mt-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setPage(1); }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    category === cat
                      ? 'gradient-primary text-white shadow-lg'
                      : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results */}
        {loading ? (
          <SkeletonGrid count={8} />
        ) : templates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Search className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No templates found</h3>
            <p className="text-[var(--text-muted)]">Try adjusting your filters or search terms</p>
            <button
              onClick={() => { setSearch(''); setCategory('All'); setSort('newest'); setPage(1); }}
              className="btn-primary mt-6"
            >
              <span>Clear Filters</span>
            </button>
          </motion.div>
        ) : (
          <>
            <div className="template-grid">
              {templates.map((template, i) => (
                <TemplateCard key={template._id} template={template} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        page === pageNum
                          ? 'gradient-primary text-white'
                          : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen gradient-mesh px-4 sm:px-6 max-w-7xl mx-auto pt-20"><SkeletonGrid count={8} /></div>}>
      <BrowseContent />
    </Suspense>
  );
}
