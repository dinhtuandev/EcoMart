import React, { useEffect, useMemo, useState } from 'react';
import {
  MessageSquare,
  CheckCircle,
  Clock,
  Search,
  Eye,
  Check,
  X,
  Inbox,
} from 'lucide-react';
import { contactApi } from '../../services/contactApi';
import { TablePagination } from '../../components/ui/TablePagination';
import { useToast } from '../../context/ToastContext';
import { ContactMessage, ContactStatus } from '../../types';

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

  const isNew = message.status === 'NEW';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-detail-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
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
            aria-label="Đóng cửa sổ"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh] text-sm">
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] ${
                isNew
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {isNew ? 'Chờ xử lý' : 'Đã xử lý'}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(message.createdAt).toLocaleString('vi-VN')}
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Khách hàng</p>
            <p className="font-bold text-slate-900 mt-0.5">{message.fullName}</p>
            <p className="text-slate-600">{message.email}</p>
            {message.phone && <p className="text-emerald-700">{message.phone}</p>}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Tiêu đề</p>
            <p className="font-semibold text-slate-900 mt-0.5">{message.subject}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Nội dung</p>
            <p className="text-slate-700 mt-1 whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Đóng
          </button>
          {isNew && (
            <button
              type="button"
              onClick={() => {
                onResolve(message.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              <Check className="w-4 h-4" />
              Đánh Dấu Đã Xử Lý
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ManagerContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoadingMessages(true);
      try {
        const statusParam =
          statusFilter === 'ALL' ? undefined : (statusFilter as ContactStatus);

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
          showToast('Không thể tải tin nhắn liên hệ.', 'error');
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
  }, [currentPage, statusFilter, keyword, showToast]);

  const handleResolveMessage = async (id: number): Promise<void> => {
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

  const kpiStats = useMemo(() => {
    const pendingCount = messages.filter((m) => m.status === 'NEW').length;
    const resolvedCount = messages.filter((m) => m.status === 'RESOLVED').length;
    return {
      total: totalElements || messages.length,
      pending: pendingCount,
      resolved: resolvedCount,
    };
  }, [messages, totalElements]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <div className="p-2.5 bg-teal-500/10 text-teal-600 rounded-2xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          Hộp Thư Liên Hệ
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Xem tin nhắn từ khách và đánh dấu đã xử lý. Không sửa hoặc xóa nội dung tin nhắn.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400">Tổng tin nhắn</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{kpiStats.total}</div>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl">
            <Inbox className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-600">Chờ xử lý</div>
            <div className="text-2xl font-black text-amber-700 mt-1">{kpiStats.pending}</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
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

      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
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
            aria-label="Tìm kiếm tin nhắn liên hệ"
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl self-stretch sm:self-auto">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'NEW', label: 'Chờ xử lý' },
            { id: 'RESOLVED', label: 'Đã xử lý' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
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
            <div className="text-xs text-slate-400">Tin nhắn mới từ khách hàng sẽ xuất hiện tại đây</div>
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
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{msg.fullName}</div>
                      <div className="text-slate-500 mt-0.5">{msg.email}</div>
                      {msg.phone && (
                        <div className="text-[11px] text-emerald-600 font-medium">{msg.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-bold text-slate-800 line-clamp-1">{msg.subject}</div>
                      <div className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{msg.content}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] ${
                          msg.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {msg.status === 'RESOLVED' ? 'Đã xử lý' : 'Chờ xử lý'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(msg.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMessage(msg);
                          setIsDetailOpen(true);
                        }}
                        className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl inline-flex items-center gap-1 font-bold"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Xem</span>
                      </button>
                      {msg.status === 'NEW' && (
                        <button
                          type="button"
                          onClick={() => handleResolveMessage(msg.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
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

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalElements}
              onPageChange={setCurrentPage}
              itemName="tin nhắn"
            />
          </div>
        )}
      </div>

      <ContactDetailModal
        message={selectedMessage}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onResolve={handleResolveMessage}
      />
    </div>
  );
};

export default ManagerContactPage;
