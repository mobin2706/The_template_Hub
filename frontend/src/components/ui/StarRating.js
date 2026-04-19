'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

export default function StarRating({ rating = 0, onRate, size = 'md', readOnly = false, showValue = true }) {
  const [hoveredStar, setHoveredStar] = useState(0);

  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const displayRating = hoveredStar || rating;

  return (
    <div className="star-rating flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onRate && onRate(star)}
          onMouseEnter={() => !readOnly && setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(0)}
          className={`star ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <Star
            className={`${sizes[size]} transition-all duration-150 ${
              star <= displayRating
                ? 'text-amber-400 fill-amber-400'
                : 'text-[var(--text-muted)]'
            }`}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-[var(--text-secondary)]">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
