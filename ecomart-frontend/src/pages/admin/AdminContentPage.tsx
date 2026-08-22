import React, { useEffect, useState, useMemo } from 'react';
import {
  FileText,
  Edit3,
  Calendar,
  Search,
  X,
  ExternalLink,
  Save,
  Globe,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { contentPageApi } from '../../services/contentPageApi';
import { useToast } from '../../context/ToastContext';
import { ContentPage } from '../../types';

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

export const AdminContentPage: React.FC = () => {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchPages = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await contentPageApi.getAllPages(controller.signal);
        if (isMounted && response.data) {
          setPages(response.data);
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'CanceledError') {
          console.error('Failed to fetch content pages:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPages();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleOpenEdit = (page: ContentPage): void => {
    setSelectedPage(page);
    setIsModalOpen(true);
  };

  const handleUpdateSuccess = (updated: ContentPage): void => {
    setPages((prev) =>
      prev.map((item) => (item.slug === updated.slug ? updated : item))
    );
  };

  // Filtered pages by keyword
  const filteredPages = useMemo(() => {
    if (!searchKeyword.trim()) return pages;
    const q = searchKeyword.toLowerCase();
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    );
  }, [pages, searchKeyword]);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            Quản Lý Nội Dung Trang Chính Sách
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý và cập nhật nội dung các trang điều khoản, bảo mật, giới thiệu và đổi trả của hệ thống.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-slate-700 shadow-sm self-start sm:self-auto">
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>Tổng số: {pages.length} trang</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề hoặc slug trang..."
            tabIndex={0}
            aria-label="Tìm kiếm trang chính sách"
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      {/* Content Pages Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200 text-slate-500 space-y-2">
          <FileText className="w-8 h-8 mx-auto text-slate-400" />
          <div className="font-bold text-sm text-slate-700">Chưa có trang nào phù hợp</div>
          <div className="text-xs text-slate-400">Thử thay đổi từ khóa tìm kiếm</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((p) => (
            <div
              key={p.id || p.slug}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              {/* Card Top */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    /{p.slug}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(p.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-slate-900 line-clamp-2">
                  {p.title}
                </h3>

                {/* Content snippet preview (strips HTML tags) */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-4">
                  {p.content.replace(/<[^>]*>?/gm, '')}
                </p>
              </div>

              {/* Card Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                <Link
                  to={`/pages/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={0}
                  aria-label={`Xem trang ${p.title} trên giao diện khách hàng`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Xem Trước</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(p)}
                  tabIndex={0}
                  aria-label={`Chỉnh sửa trang ${p.title}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chỉnh Sửa</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <ContentPageEditModal
        page={selectedPage}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default AdminContentPage;
