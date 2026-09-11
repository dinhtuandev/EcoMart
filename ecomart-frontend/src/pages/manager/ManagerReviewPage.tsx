import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Package,
  Loader2,
  X,
  RefreshCw,
} from 'lucide-react';
import { reviewApi } from '../../services/reviewApi';
import { TablePagination } from '../../components/ui/TablePagination';
import { useToast } from '../../context/ToastContext';
import { Review, AdminReviewFilterParams, CustomAxiosError } from '../../types';

export const ManagerReviewPage: React.FC = () => {
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Filters
  const [keyword, setKeyword] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [visibilityFilter, setVisibilityFilter] = useState<boolean | undefined>(undefined);

  // Active review for detail modal
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Updating visibility loading map
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchReviews = useCallback(
    async (kw: string = keyword) => {
      setIsLoading(true);
      const params: AdminReviewFilterParams = {
        page: currentPage,
        pageSize: 12,
        keyword: kw || undefined,
        rating: ratingFilter,
        isVisible: visibilityFilter,
      };

      try {
        const res = await reviewApi.adminGetReviews(params);
        if (res.data) {
          const content = res.data.items || res.data.content || [];
          setReviews(content);
          setTotalPages(
            res.data.pagination?.totalPages ?? res.data.totalPages ?? 1
          );
          setTotalItems(
            res.data.pagination?.totalItems ?? res.data.totalElements ?? content.length
          );
        }
      } catch {
        showToast('Không thể tải danh sách đánh giá.', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, keyword, ratingFilter, visibilityFilter, showToast]
  );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    setKeyword(val);
    setCurrentPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchReviews(val);
    }, 300);
  };

  const handleToggleVisibility = async (review: Review): Promise<void> => {
    setTogglingId(review.id);
    const nextState = !review.isVisible;
    try {
      await reviewApi.adminUpdateVisibility(review.id, { isVisible: nextState });
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, isVisible: nextState } : r))
      );
      if (selectedReview?.id === review.id) {
        setSelectedReview((prev) => (prev ? { ...prev, isVisible: nextState } : null));
      }
      showToast(
        `Đã ${nextState ? 'hiển thị' : 'ẩn'} đánh giá thành công!`,
        'success'
      );
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      showToast(
        customError.response?.data?.message || 'Không thể cập nhật trạng thái hiển thị.',
        'error'
      );
    } finally {
      setTogglingId(null);
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = reviews.length;
    const visible = reviews.filter((r) => r.isVisible).length;
    const hidden = reviews.filter((r) => !r.isVisible).length;
    const avg =
      total > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
        : '0.0';
    return { total, visible, hidden, avg };
  }, [reviews]);

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Đánh Giá Sản Phẩm
          </h1>
        </div>

        <button
          type="button"
          onClick={() => fetchReviews()}
          className="p-2.5 bg-white border border-gray-200 text-slate-600 hover:text-emerald-600 rounded-xl transition-all shadow-xs self-start flex items-center gap-2 text-xs font-bold"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Đánh giá trên trang</p>
            <p className="text-xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Đang hiển thị</p>
            <p className="text-xl font-black text-emerald-600">{stats.visible}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Đã bị ẩn</p>
            <p className="text-xl font-black text-rose-600">{stats.hidden}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Rating trung bình</p>
            <p className="text-xl font-black text-amber-600">{stats.avg} ★</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={handleKeywordChange}
            placeholder="Tìm theo tên sản phẩm, tên khách hàng..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Rating Filter */}
        <select
          value={ratingFilter ?? ''}
          onChange={(e) => {
            setRatingFilter(e.target.value ? Number(e.target.value) : undefined);
            setCurrentPage(1);
          }}
          className="px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Tất cả số sao</option>
          <option value="5">5 Sao ★★★★★</option>
          <option value="4">4 Sao ★★★★☆</option>
          <option value="3">3 Sao ★★★☆☆</option>
          <option value="2">2 Sao ★★☆☆☆</option>
          <option value="1">1 Sao ★☆☆☆☆</option>
        </select>

        {/* Visibility Filter */}
        <select
          value={visibilityFilter === undefined ? '' : visibilityFilter ? 'true' : 'false'}
          onChange={(e) => {
            const val = e.target.value;
            setVisibilityFilter(val === '' ? undefined : val === 'true');
            setCurrentPage(1);
          }}
          className="px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hiển thị</option>
          <option value="false">Đang bị ẩn</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
            <p className="text-xs font-medium">Đang tải danh sách đánh giá...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-bold text-slate-700">Không tìm thấy đánh giá nào</p>
            <p className="text-xs">Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Sản Phẩm</th>
                  <th className="py-3 px-4">Khách Hàng</th>
                  <th className="py-3 px-4">Đánh Giá</th>
                  <th className="py-3 px-4">Nhận Xét</th>
                  <th className="py-3 px-4">Ngày Đăng</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {reviews.map((rev) => {
                  const isToggling = togglingId === rev.id;

                  return (
                    <tr
                      key={rev.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => setSelectedReview(rev)}
                    >
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-2.5">
                          {rev.productImageUrl ? (
                            <img
                              src={rev.productImageUrl}
                              alt={rev.productName}
                              className="w-9 h-9 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <span className="font-bold text-slate-900 line-clamp-2">
                            {rev.productName}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {rev.userFullName || 'Ẩn danh'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center text-amber-400 font-black">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} className="text-xs">
                              {s <= rev.rating ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="line-clamp-2 text-slate-600">
                          {rev.comment || <span className="italic text-slate-400">(Không có lời nhắn)</span>}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {formatDate(rev.createdAt)}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {rev.isVisible ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Hiển thị
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            <EyeOff className="w-3 h-3" /> Đang ẩn
                          </span>
                        )}
                      </td>

                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(rev)}
                          disabled={isToggling}
                          className={`p-1.5 rounded-xl border transition-all ${
                            rev.isVisible
                              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          } disabled:opacity-50`}
                          title={rev.isVisible ? 'Ẩn đánh giá' : 'Hiển thị đánh giá'}
                        >
                          {isToggling ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : rev.isVisible ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={12}
          onPageChange={(page) => setCurrentPage(page)}
          itemName="đánh giá"
        />
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onToggleVisibility={() => handleToggleVisibility(selectedReview)}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </div>
  );
};

// =============================================
// Review Detail Modal Component
// =============================================
interface ReviewDetailModalProps {
  review: Review;
  onToggleVisibility: () => Promise<void>;
  onClose: () => void;
}

const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  review,
  onToggleVisibility,
  onClose,
}) => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    await onToggleVisibility();
    setIsUpdating(false);
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b pb-3 border-gray-100">
          <h2 className="text-base font-bold text-slate-900">Chi Tiết Đánh Giá</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product info */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
          {review.productImageUrl ? (
            <img
              src={review.productImageUrl}
              alt={review.productName}
              className="w-12 h-12 rounded-xl object-cover bg-white"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
              <Package className="w-5 h-5 text-slate-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900">{review.productName}</p>
            <Link
              to={`/products/${review.productId}`}
              target="_blank"
              className="text-[11px] text-emerald-600 hover:underline"
            >
              Xem trang sản phẩm ↗
            </Link>
          </div>
        </div>

        {/* Review metadata */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
            <span className="text-slate-400 text-[10px]">Người đánh giá</span>
            <p className="font-bold text-slate-900">{review.userFullName || 'Ẩn danh'}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
            <span className="text-slate-400 text-[10px]">Thời gian</span>
            <p className="font-medium text-slate-700">{formatDate(review.createdAt)}</p>
          </div>
        </div>

        {/* Rating & Comment */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Điểm đánh giá:</span>
            <div className="flex items-center text-amber-400 text-sm">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s}>{s <= review.rating ? '★' : '☆'}</span>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-900">({review.rating}/5)</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Nội dung nhận xét
            </span>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {review.comment || <span className="italic text-slate-400">Không có lời bình luận.</span>}
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Trạng thái:</span>
            {review.isVisible ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> Hiển thị công khai
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                <EyeOff className="w-3.5 h-3.5" /> Đang bị ẩn
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleToggle}
              disabled={isUpdating}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                review.isVisible
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
              } disabled:opacity-50`}
            >
              {isUpdating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : review.isVisible ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" /> Ẩn Đánh Giá
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" /> Hiển Thị Lại
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerReviewPage;
