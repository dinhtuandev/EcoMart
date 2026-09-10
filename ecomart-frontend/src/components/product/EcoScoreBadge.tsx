import React from 'react';
import { Leaf } from 'lucide-react';

export interface EcoScoreBadgeProps {
  score: number; // 1 to 5
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Component hiển thị Điểm Sinh Thái (Eco-Score) từ 1 đến 5 lá xanh
 */
export const EcoScoreBadge: React.FC<EcoScoreBadgeProps> = ({
  score,
  showLabel = true,
  size = 'md',
}) => {
  const normalizedScore = Math.max(1, Math.min(5, Math.round(score || 1)));

  const getLabel = (s: number): string => {
    switch (s) {
      case 5:
        return 'Xuất Sắc (Zero-Waste)';
      case 4:
        return 'Rất Tốt (Tự Phân Hủy)';
      case 3:
        return 'Tốt (Tái Chế / Hữu Cơ)';
      case 2:
        return 'Khá (Thân Thiện)';
      default:
        return 'Tiêu Chuẩn Xanh';
    }
  };

  const sizeClasses = {
    sm: { icon: 'w-3 h-3', text: 'text-[10px]', badge: 'px-2 py-0.5' },
    md: { icon: 'w-3.5 h-3.5', text: 'text-xs', badge: 'px-2.5 py-1' },
    lg: { icon: 'w-4 h-4', text: 'text-sm font-bold', badge: 'px-3.5 py-1.5' },
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full font-bold ${sizeClasses.badge} shadow-sm`}
      title={`Eco-Score: ${normalizedScore}/5 - ${getLabel(normalizedScore)}`}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((level) => (
          <Leaf
            key={level}
            className={`${sizeClasses.icon} transition-colors ${
              level <= normalizedScore
                ? 'fill-emerald-500 text-emerald-600'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {showLabel && (
        <span className={`${sizeClasses.text} tracking-tight`}>
          {normalizedScore}/5 <span className="hidden sm:inline font-normal opacity-90">• {getLabel(normalizedScore)}</span>
        </span>
      )}
    </div>
  );
};

export default EcoScoreBadge;
