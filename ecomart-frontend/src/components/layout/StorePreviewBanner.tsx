import React from 'react';
import { ArrowLeft, Eye } from 'lucide-react';

interface StorePreviewBannerProps {
  dashboardPath: string;
  onBack: () => void;
}

export const StorePreviewBanner: React.FC<StorePreviewBannerProps> = ({
  dashboardPath,
  onBack,
}) => {
  const isAdminDashboard = dashboardPath === '/admin';

  return (
    <div className="sticky top-0 z-50 bg-emerald-900 text-white border-b border-emerald-800 shadow-md">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 flex-shrink-0">
            <Eye className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold leading-tight">
              Chế độ xem sàn EcoMart
            </p>
            <p className="text-[11px] text-emerald-100/80 leading-tight">
              Chỉ xem giao diện khách hàng. Không thể mua hàng, giỏ hàng hay thanh toán.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-900 text-xs font-bold hover:bg-emerald-50 transition-colors shadow-sm flex-shrink-0"
          aria-label="Quay lại trang dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            Quay lại Dashboard {isAdminDashboard ? 'Admin' : 'Manager'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default StorePreviewBanner;
