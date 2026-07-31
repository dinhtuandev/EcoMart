import React from 'react';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-center items-center gap-2 my-6">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Trang trước"
        className="px-3 py-1.5 rounded-md text-sm border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Trang trước
      </button>

      <span className="text-sm font-medium text-slate-600 px-3">
        Trang {currentPage} / {totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Trang tiếp"
        className="px-3 py-1.5 rounded-md text-sm border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Trang tiếp
      </button>
    </div>
  );
};

export default Pagination;
