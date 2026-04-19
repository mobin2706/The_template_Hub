'use client';

import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <motion.div
        className={`${sizes[size]} rounded-full border-2 border-[var(--border-color)] border-t-[#7c3aed]`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <p className="text-sm text-[var(--text-muted)] animate-pulse">{text}</p>
      )}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="skeleton h-44 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="flex justify-between pt-2">
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="template-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
