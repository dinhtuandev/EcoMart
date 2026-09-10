import React, { useEffect, useState, useMemo } from 'react';
import {
  Settings,
  Store,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Save,
  CheckCircle,
  Clock,
  Search,
  Eye,
  Check,
  X,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { storeSettingApi } from '../../services/storeSettingApi';
import { contactApi } from '../../services/contactApi';
import { useToast } from '../../context/ToastContext';
import {
  UpdateStoreSettingPayload,
  ContactMessage,
  ContactStatus,
} from '../../types';

interface DetailModalProps {
  message: ContactMessage | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (id: number) => void;
}

const ContactDetailModal: React.FC<DetailModalProps> = ({
  message,
  isOpen,
  onClose,
  onResolve,
}) => {
  if (!isOpen || !message) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-detail-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 id="contact-detail-modal-title" className="text-lg font-bold text-slate-900">
                Chi Tiết Tin Nhắn Liên Hệ
              </h3>
              <div className="text-xs text-slate-500">Mã tin nhắn: #{message.id}</div>
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

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Status banner */}
          <div
            className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold border ${
              message.status === 'RESOLVED'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.status === 'RESOLVED' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600" />
              )}
              <span>
                {message.status === 'RESOLVED'
                  ? 'Đã xử lý & phản hồi'
                  : 'Đang chờ xử lý'}
              </span>
            </div>
            <span className="text-[11px] font-normal text-slate-500">
              Gửi ngày: {new Date(message.createdAt).toLocaleString('vi-VN')}
            </span>
          </div>

          {/* Sender Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <div className="text-slate-400 font-medium">Họ và tên</div>
              <div className="font-bold text-slate-900 mt-0.5">{message.fullName}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Email</div>
              <div className="font-bold text-slate-900 mt-0.5">{message.email}</div>
            </div>
            {message.phone && (
              <div>
                <div className="text-slate-400 font-medium">Số điện thoại</div>
                <div className="font-bold text-slate-900 mt-0.5">{message.phone}</div>
              </div>
            )}
            {message.resolvedAt && (
              <div>
                <div className="text-slate-400 font-medium">Thời gian xử lý</div>
                <div className="font-bold text-emerald-700 mt-0.5">
                  {new Date(message.resolvedAt).toLocaleString('vi-VN')}
                </div>
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiêu đề</div>
            <div className="text-sm font-bold text-slate-900 bg-white p-3 rounded-xl border border-gray-100">
              {message.subject}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nội dung</div>
            <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            tabIndex={0}
            aria-label="Đóng"
            className="px-5 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>

          {message.status === 'PENDING' && (
            <button
              type="button"
              onClick={() => {
                onResolve(message.id);
                onClose();
              }}
              tabIndex={0}
              aria-label="Đánh dấu đã xử lý tin nhắn này"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
            >
              <Check className="w-4 h-4" />
              <span>Đánh Dấu Đã Xử Lý</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'store' | 'messages'>('store');

  // Tab 1: Store Settings State
  const [settingsForm, setSettingsForm] = useState<UpdateStoreSettingPayload>({
    storePhone: '',
    storeEmail: '',
    storeAddress: '',
    mapEmbedUrl: '',
  });
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // Tab 2: Contact Messages State
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Message Detail Modal
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Load Store Settings on Mount
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchStoreSettings = async (): Promise<void> => {
      setLoadingSettings(true);
      try {
        const response = await storeSettingApi.getSettings(controller.signal);
        if (isMounted && response.data) {
          setSettingsForm({
            storePhone: response.data.storePhone || '',
            storeEmail: response.data.storeEmail || '',
            storeAddress: response.data.storeAddress || '',
            mapEmbedUrl: response.data.mapEmbedUrl || '',
          });
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'CanceledError') {
          console.error('Failed to load store settings:', err);
        }
      } finally {
        if (isMounted) {
          setLoadingSettings(false);
        }
      }
    };

    fetchStoreSettings();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Load Contact Messages with Debounce
  useEffect(() => {
    if (activeTab !== 'messages') return;

    let isMounted = true;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoadingMessages(true);
      try {
        const statusParam =
          statusFilter === 'ALL'
            ? undefined
            : (statusFilter as ContactStatus);

        const response = await contactApi.getAdminMessages(
          {
            page: currentPage,
            pageSize: 10,
            status: statusParam,
            keyword: keyword.trim() || undefined,
          },
          controller.signal
        );

        if (isMounted && response.data) {
          const items = response.data.content || response.data.items || [];
          setMessages(items);
          setTotalPages(response.data.totalPages || 1);
          setTotalElements(response.data.totalElements || items.length);
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'CanceledError') {
          console.error('Failed to fetch contact messages:', err);
        }
      } finally {
        if (isMounted) {
          setLoadingMessages(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [activeTab, currentPage, statusFilter, keyword]);

  // Handle Store Settings Save
  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSavingSettings(true);

    try {
      const response = await storeSettingApi.updateSettings({
        storePhone: settingsForm.storePhone?.trim(),
        storeEmail: settingsForm.storeEmail?.trim(),
        storeAddress: settingsForm.storeAddress?.trim(),
        mapEmbedUrl: settingsForm.mapEmbedUrl?.trim(),
      });

      if (response.success) {
        showToast(response.message || 'Cập nhật cấu hình cửa hàng thành công!', 'success');
      } else {
        showToast(response.message || 'Không thể cập nhật cấu hình.', 'error');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg || 'Có lỗi xảy ra khi lưu cấu hình.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle Resolve Contact Message (Optimistic Update)
  const handleResolveMessage = async (id: number): Promise<void> => {
    // Optimistic state update
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id
          ? { ...msg, status: 'RESOLVED', resolvedAt: new Date().toISOString() }
          : msg
      )
    );

    try {
      const response = await contactApi.resolveMessage(id);
      if (response.success) {
        showToast('Đã đánh dấu tin nhắn liên hệ là đã xử lý!', 'success');
      } else {
        showToast(response.message || 'Có lỗi xảy ra.', 'error');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg || 'Không thể cập nhật trạng thái tin nhắn.', 'error');
    }
  };

  // KPI calculations for messages
  const kpiStats = useMemo(() => {
    const pendingCount = messages.filter((m) => m.status === 'PENDING').length;
    const resolvedCount = messages.filter((m) => m.status === 'RESOLVED').length;
    return {
      total: totalElements || messages.length,
      pending: pendingCount,
      resolved: resolvedCount,
    };
  }, [messages, totalElements]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-2xl">
            <Settings className="w-6 h-6" />
          </div>
          Cấu Hình Hệ Thống & Hộp Thư
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Quản lý thông tin liên hệ cửa hàng, bản đồ chỉ đường và xử lý các tin nhắn từ khách hàng.
        </p>
      </div>

      {/* Tabs Control */}
      <div className="flex gap-2 p-1.5 bg-slate-200/70 rounded-2xl max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('store')}
          tabIndex={0}
          aria-label="Chuyển tab Cài đặt cửa hàng"
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'store'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Store className="w-4 h-4 text-emerald-600" />
          <span>Cài Đặt Cửa Hàng</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('messages')}
          tabIndex={0}
          aria-label="Chuyển tab Tin nhắn liên hệ"
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'messages'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-teal-600" />
          <span>Tin Nhắn Liên Hệ</span>
        </button>
      </div>

      {/* TAB 1: STORE SETTINGS FORM */}
      {activeTab === 'store' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm max-w-4xl space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-600" />
              Thông Tin Cửa Hàng & Hotline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Thông tin này sẽ được hiển thị công khai ở chân trang (Footer) và trang Liên hệ của khách hàng.
            </p>
          </div>

          {loadingSettings ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-12 bg-slate-100 rounded-2xl" />
              <div className="h-12 bg-slate-100 rounded-2xl" />
              <div className="h-12 bg-slate-100 rounded-2xl" />
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-5">
              {/* Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="setting-phone"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Số điện thoại hotline
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      id="setting-phone"
                      type="text"
                      value={settingsForm.storePhone || ''}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, storePhone: e.target.value }))
                      }
                      placeholder="0987 654 321"
                      tabIndex={0}
                      aria-label="Số điện thoại hotline cửa hàng"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="setting-email"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Email hỗ trợ cửa hàng
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      id="setting-email"
                      type="email"
                      value={settingsForm.storeEmail || ''}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, storeEmail: e.target.value }))
                      }
                      placeholder="support@ecomart.vn"
                      tabIndex={0}
                      aria-label="Email hỗ trợ cửa hàng"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="setting-address"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Địa chỉ văn phòng / Cửa hàng chính
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    id="setting-address"
                    type="text"
                    value={settingsForm.storeAddress || ''}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({ ...prev, storeAddress: e.target.value }))
                    }
                    placeholder="123 Đường Sinh Thái, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                    tabIndex={0}
                    aria-label="Địa chỉ văn phòng"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Map Embed URL */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    htmlFor="setting-map"
                    className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Đường dẫn nhúng Google Maps (iframe src)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Lấy từ Google Maps &gt; Chia sẻ &gt; Nhúng bản đồ &gt; copy thuộc tính src
                  </span>
                </div>
                <input
                  id="setting-map"
                  type="text"
                  value={settingsForm.mapEmbedUrl || ''}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({ ...prev, mapEmbedUrl: e.target.value }))
                  }
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  tabIndex={0}
                  aria-label="Đường dẫn nhúng Google Maps"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 font-mono text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              {/* Map Preview */}
              {settingsForm.mapEmbedUrl && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Xem Trước Bản Đồ Nhúng
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-inner">
                    <iframe
                      src={settingsForm.mapEmbedUrl}
                      title="Xem trước bản đồ"
                      className="w-full h-[220px] border-0"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  tabIndex={0}
                  aria-label="Lưu thay đổi cài đặt cửa hàng"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {savingSettings ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Lưu Cài Đặt</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: CONTACT MESSAGES INBOX */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-400">Tổng tin nhắn</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{kpiStats.total}</div>
              </div>
              <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl">
                <Inbox className="w-5 h-5" />
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-amber-600">Chờ xử lý</div>
                <div className="text-2xl font-black text-amber-700 mt-1">{kpiStats.pending}</div>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* Resolved */}
            <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-emerald-600">Đã xử lý</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">{kpiStats.resolved}</div>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm theo tên, email, tiêu đề..."
                tabIndex={0}
                aria-label="Tìm kiếm tin nhắn liên hệ"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl self-stretch sm:self-auto">
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'PENDING', label: 'Chờ xử lý' },
                { id: 'RESOLVED', label: 'Đã xử lý' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setCurrentPage(1);
                  }}
                  tabIndex={0}
                  aria-label={`Lọc trạng thái ${tab.label}`}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {loadingMessages ? (
              <div className="p-8 space-y-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-2xl" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <Inbox className="w-8 h-8 mx-auto text-slate-400" />
                <div className="font-bold text-sm text-slate-700">Chưa có tin nhắn liên hệ nào</div>
                <div className="text-xs text-slate-400">Các tin nhắn mới từ khách hàng sẽ xuất hiện tại đây</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Khách Hàng</th>
                      <th className="px-6 py-4">Tiêu Đề & Nội Dung</th>
                      <th className="px-6 py-4">Trạng Thái</th>
                      <th className="px-6 py-4">Thời Gian</th>
                      <th className="px-6 py-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {messages.map((msg) => (
                      <tr key={msg.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{msg.fullName}</div>
                          <div className="text-slate-500 mt-0.5">{msg.email}</div>
                          {msg.phone && (
                            <div className="text-[11px] text-emerald-600 font-medium">
                              {msg.phone}
                            </div>
                          )}
                        </td>

                        {/* Subject & snippet */}
                        <td className="px-6 py-4 max-w-xs">
                          <div className="font-bold text-slate-800 line-clamp-1">
                            {msg.subject}
                          </div>
                          <div className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
                            {msg.content}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] ${
                              msg.status === 'RESOLVED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                msg.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                              }`}
                            />
                            {msg.status === 'RESOLVED' ? 'Đã xử lý' : 'Chờ xử lý'}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(msg.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMessage(msg);
                              setIsDetailOpen(true);
                            }}
                            tabIndex={0}
                            aria-label={`Xem chi tiết tin nhắn của ${msg.fullName}`}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all inline-flex items-center gap-1 font-bold"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Xem</span>
                          </button>

                          {msg.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => handleResolveMessage(msg.id)}
                              tabIndex={0}
                              aria-label={`Đánh dấu tin nhắn của ${msg.fullName} là đã xử lý`}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                            >
                              Đã xử lý
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Trang {currentPage} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    tabIndex={0}
                    aria-label="Trang trước"
                    className="p-2 rounded-xl border border-gray-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    tabIndex={0}
                    aria-label="Trang tiếp theo"
                    className="p-2 rounded-xl border border-gray-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Detail Modal */}
          <ContactDetailModal
            message={selectedMessage}
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            onResolve={handleResolveMessage}
          />
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
