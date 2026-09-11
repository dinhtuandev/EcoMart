import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  FileText,
  Edit2,
  Edit3,
  Calendar,
  Search,
  X,
  ExternalLink,
  Save,
  Globe,
  RefreshCw,
  Layers,
  Clock,
  AlignLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { contentPageApi } from '../../services/contentPageApi';
import { TablePagination } from '../../components/ui/TablePagination';
import { useToast } from '../../context/ToastContext';
import { ContentPage } from '../../types';

const stripHtml = (html: string): string => html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();

const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '---';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

const isUpdatedThisWeek = (dateString?: string): boolean => {
  if (!dateString) return false;
  const updated = new Date(dateString).getTime();
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return updated >= weekAgo;
};

interface EditModalProps {
  page: ContentPage | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: ContentPage) => void;
}

const ContentPageEditModal: React.FC<EditModalProps> = ({
  page,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (page) {
      setTitle(page.title || '');
      setContent(page.content || '');
      setError('');
    }
  }, [page]);

  if (!isOpen || !page) {
    return null;
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Tiêu đề trang không được để trống.');
      return;
    }
    if (!content.trim()) {
      setError('Nội dung trang không được để trống.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await contentPageApi.updatePage(page.slug, {
        title: title.trim(),
        content: content.trim(),
      });

      if (res.success && res.data) {
        showToast(res.message || 'Cập nhật nội dung trang thành công!', 'success');
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.message || 'Không thể cập nhật nội dung.');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Có lỗi xảy ra khi lưu nội dung trang.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-page-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="edit-page-modal-title" className="text-lg font-bold text-slate-900">
                Chỉnh Sửa Trang Chính Sách
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                <span>Slug:</span>
                <span className="font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold">
                  {page.slug}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            tabIndex={0}
            aria-label="Đóng cửa sổ"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600">
              {error}
            </div>
          )}

          {/* Title input */}
          <div>
            <label
              htmlFor="edit-page-title"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Tiêu đề trang <span className="text-rose-500">*</span>
            </label>
            <input
              id="edit-page-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề trang..."
              tabIndex={0}
              aria-label="Tiêu đề trang"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Content Textarea */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="edit-page-content"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Nội dung trang (Hỗ trợ HTML) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Sử dụng thẻ &lt;p&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;...
              </span>
            </div>
            <textarea
              id="edit-page-content"
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="<p>Nhập nội dung chính sách hoặc thông tin cửa hàng...</p>"
              tabIndex={0}
              aria-label="Nội dung trang chi tiết"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 font-mono text-xs text-slate-800 leading-relaxed outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-y"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              tabIndex={0}
              aria-label="Hủy bỏ"
              className="px-5 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              tabIndex={0}
              aria-label="Lưu thay đổi nội dung trang"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Thay Đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

type SortKey = 'id' | 'title' | 'slug' | 'updatedAt';
type SortDir = 'asc' | 'desc';

export const ManagerContentPage: React.FC = () => {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const pageSize = 10;
  const { showToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const fetchPages = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      try {
        const response = await contentPageApi.getAllPages(signal);
        setPages(response.data || []);
      } catch (error: unknown) {
        if ((error as Error).name !== 'CanceledError') {
          showToast('Không thể tải danh sách nội dung trang.', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchPages(controller.signal);
    return () => controller.abort();
  }, [fetchPages]);

  const handleOpenEdit = (page: ContentPage): void => {
    setSelectedPage(page);
    setIsModalOpen(true);
  };

  const handleUpdateSuccess = (updated: ContentPage): void => {
    setPages((prev) =>
      prev.map((item) => (item.slug === updated.slug ? updated : item))
    );
  };

  const handleSort = (key: SortKey): void => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir(key === 'updatedAt' || key === 'id' ? 'desc' : 'asc');
  };

  const filteredPages = useMemo(() => {
    const q = debouncedKeyword.toLowerCase().trim();
    const filtered = !q
      ? pages
      : pages.filter((p) => {
          const preview = stripHtml(p.content).toLowerCase();
          return (
            p.title.toLowerCase().includes(q) ||
            p.slug.toLowerCase().includes(q) ||
            preview.includes(q)
          );
        });

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'id') {
        cmp = (a.id || 0) - (b.id || 0);
      } else if (sortKey === 'updatedAt') {
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else {
        cmp = (a[sortKey] || '').localeCompare(b[sortKey] || '', 'vi');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [pages, debouncedKeyword, sortKey, sortDir]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedKeyword, sortKey, sortDir]);

  const paginatedPages = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPages.slice(startIndex, startIndex + pageSize);
  }, [filteredPages, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPages.length / pageSize);
  const updatedThisWeek = pages.filter((p) => isUpdatedThisWeek(p.updatedAt)).length;
  const lastUpdated = pages.reduce<string | undefined>((latest, p) => {
    if (!p.updatedAt) return latest;
    if (!latest) return p.updatedAt;
    return new Date(p.updatedAt) > new Date(latest) ? p.updatedAt : latest;
  }, undefined);

  const sortIndicator = (key: SortKey): string => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quản Lý Nội Dung Trang
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Chỉnh sửa tiêu đề và nội dung các trang chính sách hiển thị cho khách hàng.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchPages()}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl border border-gray-200 shadow-sm transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tổng số trang
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{pages.length}</p>
          </div>
          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Cập nhật 7 ngày gần đây
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{updatedThisWeek}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Lần cập nhật mới nhất
            </p>
            <p className="text-sm font-extrabold text-slate-900 mt-1.5">
              {formatDateTime(lastUpdated)}
            </p>
          </div>
          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, slug hoặc nội dung..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            aria-label="Tìm kiếm trang nội dung"
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => setSearchKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-gray-100 rounded-xl text-xs font-bold text-slate-600 self-stretch md:self-auto">
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>
            {filteredPages.length}/{pages.length} trang
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Đang tải nội dung trang...</p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <FileText className="w-12 h-12 text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-medium">Không tìm thấy trang nội dung nào phù hợp.</p>
            {debouncedKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                className="text-xs text-emerald-600 font-bold hover:underline"
              >
                Xóa từ khóa tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16">
                    <button type="button" onClick={() => handleSort('id')} className="hover:text-emerald-700">
                      ID{sortIndicator('id')}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">
                    <button type="button" onClick={() => handleSort('title')} className="hover:text-emerald-700">
                      Tiêu đề{sortIndicator('title')}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">
                    <button type="button" onClick={() => handleSort('slug')} className="hover:text-emerald-700">
                      Đường dẫn{sortIndicator('slug')}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Nội dung</th>
                  <th className="py-3.5 px-4 w-40">
                    <button type="button" onClick={() => handleSort('updatedAt')} className="hover:text-emerald-700">
                      Cập nhật{sortIndicator('updatedAt')}
                    </button>
                  </th>
                  <th className="py-3.5 px-4 w-40 min-w-[140px] text-right whitespace-nowrap">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedPages.map((page) => {
                  const preview = stripHtml(page.content);
                  return (
                    <tr
                      key={page.id || page.slug}
                      className="hover:bg-emerald-50/30 transition-colors even:bg-slate-50/50"
                    >
                      <td className="py-4 px-4 font-mono text-xs text-slate-400">
                        #{page.id}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <AlignLeft className="w-4 h-4" />
                          </div>
                          <p className="font-bold text-slate-900 line-clamp-2">{page.title}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          /{page.slug}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 text-xs">
                        <p className="line-clamp-2 max-w-md">
                          {preview || (
                            <span className="text-slate-400 italic">Chưa có nội dung</span>
                          )}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-xs whitespace-nowrap">
                        {formatDateTime(page.updatedAt)}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/pages/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-100/80 border border-slate-200/80 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95 flex items-center justify-center"
                            title="Xem trước trên giao diện khách"
                            aria-label={`Xem trước trang ${page.title}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(page)}
                            className="p-2 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-100/80 border border-slate-200/80 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95 flex items-center justify-center"
                            title="Chỉnh sửa nội dung"
                            aria-label={`Chỉnh sửa trang ${page.title}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredPages.length}
          itemsPerPage={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          itemName="trang"
        />
      </div>

      <ContentPageEditModal
        page={selectedPage}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default ManagerContentPage;
