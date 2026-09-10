import React from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

const sizeMap = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
  className = '',
}) => {
  const [hovered, setHovered] = React.useState<number | null>(null);

  const display = hovered !== null ? hovered : rating;

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: max }, (_, i) => {
        const value = i + 1;
        const filled = value <= display;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(value)}
            onMouseEnter={() => interactive && setHovered(value)}
            onMouseLeave={() => interactive && setHovered(null)}
            className={`transition-transform ${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default pointer-events-none'
            }`}
            aria-label={`${value} sao`}
          >
            <Star
              className={`${sizeMap[size]} transition-colors ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-slate-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
