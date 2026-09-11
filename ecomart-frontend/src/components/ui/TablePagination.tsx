import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  itemName = 'dữ liệu',
}) => {
  if (totalItems === 0) return null;

  const effectiveTotalPages = Math.max(1, totalPages);
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Tạo danh sách trang để hiển thị gọn gàng (ví dụ 1, 2, 3...)
  const getPageNumbers = (): Array<number | string> => {
    const pages: Array<number | string> = [];
    if (effectiveTotalPages <= 7) {
      for (let i = 1; i <= effectiveTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(effectiveTotalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < effectiveTotalPages - 2) pages.push('...');
      pages.push(effectiveTotalPages);
    }
    return pages;
  };

  return (
    <div className="px-6 py-4 bg-slate-50/90 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600 select-none">
      {/* Thông tin số lượng */}
      <div className="flex items-center gap-1">
        <span>Hiển thị</span>
        <span className="font-bold text-slate-900">{startItem}</span>
        <span>-</span>
        <span className="font-bold text-slate-900">{endItem}</span>
        <span>trong tổng số</span>
        <span className="font-bold text-emerald-700 px-1 py-0.5 bg-emerald-50 rounded border border-emerald-200/60">
          {totalItems}
        </span>
        <span>{itemName}</span>
      </div>

      {/* Nút Phân trang */}
      <div className="flex items-center gap-1.5">
        {/* Nút Trước */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-2xs cursor-pointer disabled:cursor-not-allowed"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Các con số trang 1, 2, 3... */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (typeof page === 'string') {
              return (
                <span key={`dots-${index}`} className="px-2 py-1 text-slate-400">
                  ...
                </span>
              );
            }
            const isCurrent = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`min-w-[2rem] h-8 px-2.5 flex items-center justify-center rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-600 text-white border border-emerald-600 shadow-emerald-600/20'
                    : 'bg-white text-slate-700 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Nút Sau */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= effectiveTotalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-2xs cursor-pointer disabled:cursor-not-allowed"
          aria-label="Trang sau"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default TablePagination;
