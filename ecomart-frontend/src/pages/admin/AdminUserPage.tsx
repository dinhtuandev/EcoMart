import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  Lock,
  Unlock,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { userApi } from '../../services/userApi';
import { TablePagination } from '../../components/ui/TablePagination';
import { useToast } from '../../context/ToastContext';
import { User, PageResponse, CustomAxiosError } from '../../types';

export const AdminUserPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pageData, setPageData] = useState<PageResponse<User>>({
    content: [],
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 1,
    last: true,
  });

  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'LOCKED'>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modal xác nhận khóa / mở khóa
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState<boolean>(false);

  const { showToast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  // DEBOUNCE SEARCH: Chỉ cập nhật debouncedKeyword sau 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchKeyword.trim());
      setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchKeyword]);

  // Load danh sách người dùng khi keyword, filter hoặc page thay đổi
  useEffect(() => {
    // Hủy request cũ nếu còn đang chạy
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);

    const isActiveParam =
      statusFilter === 'ACTIVE' ? true : statusFilter === 'LOCKED' ? false : undefined;

    userApi
      .adminGetUsers(
        {
          keyword: debouncedKeyword || undefined,
          isActive: isActiveParam,
          page: currentPage,
          pageSize: 10,
        },
        controller.signal
      )
      .then((response) => {
        const raw = response.data;
        const resAny = response as unknown as {
          pagination?: { page?: number; pageSize?: number; totalPages?: number; totalItems?: number };
        };
        const content: User[] = Array.isArray(raw)
          ? (raw as User[])
          : raw?.items || raw?.content || [];
        setUsers(content);

        const totalP = resAny.pagination?.totalPages ?? raw?.totalPages ?? 1;
        const pageNum = resAny.pagination?.page ?? raw?.pageNumber ?? currentPage;
        const totalElem = resAny.pagination?.totalItems ?? raw?.totalElements ?? content.length;

        setPageData({
          content,
          pageNumber: pageNum,
          pageSize: 10,
          totalElements: totalElem,
          totalPages: totalP,
          last: pageNum >= totalP,
        });
      })
      .catch((error: unknown) => {
        const customError = error as CustomAxiosError;
        if (customError.name === 'CanceledError') {
          return;
        }
        showToast('Không thể tải danh sách người dùng.', 'error');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [debouncedKeyword, statusFilter, currentPage, showToast]);

  // Xử lý xác nhận Khóa / Mở khóa tài khoản (Optimistic Update)
  const handleConfirmToggleStatus = async (): Promise<void> => {
    if (!userToToggle) {
      return;
    }

    const targetUser = userToToggle;
    const newStatus = !targetUser.isActive;
    setIsTogglingStatus(true);

    try {
      await userApi.adminUpdateUserStatus(targetUser.id, {
        isActive: newStatus,
      });

      // OPTIMISTIC UPDATE: Cập nhật dòng table ngay lập tức không cần fetch lại toàn bộ list
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === targetUser.id ? { ...u, isActive: newStatus } : u
        )
      );

      const actionText = newStatus ? 'Mở khóa' : 'Khóa';
      showToast(`Đã ${actionText.toLowerCase()} tài khoản "${targetUser.email}" thành công!`, 'success');
      setUserToToggle(null);
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      showToast(
        customError.response?.data?.message || 'Cập nhật trạng thái người dùng thất bại.',
        'error'
      );
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Quản Trị Người Dùng & Khách Hàng
            </h1>
          </div>
        </div>
      </div>

      {/* Thanh công cụ: Search & Bộ lọc trạng thái */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input (Debounce 500ms) */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo Tên hoặc Email..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => setSearchKeyword('')}
              className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Dropdown Lọc trạng thái */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-xs font-bold text-slate-600 flex-shrink-0">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'LOCKED');
              setCurrentPage(1);
            }}
            className="px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
          >
            <option value="ALL">Tất Cả Người Dùng</option>
            <option value="ACTIVE">Đang Hoạt Động</option>
            <option value="LOCKED">Đã Bị Khóa</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách người dùng */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-xs font-medium">Đang tải danh sách người dùng...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Không tìm thấy người dùng nào phù hợp</p>
            <p className="text-xs text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-gray-100 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Khách Hàng</th>
                  <th className="py-4 px-6">Liên Hệ</th>
                  <th className="py-4 px-6">Vai Trò</th>
                  <th className="py-4 px-6">Ngày Tham Gia</th>
                  <th className="py-4 px-6">Trạng Thái</th>
                  <th className="py-4 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {users.map((item, index) => {
                  const isEven = index % 2 === 0;
                  const isAdminRole = item.role === 'ADMIN';

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors duration-150 ${
                        isEven ? 'bg-white' : 'bg-slate-50/40'
                      } hover:bg-emerald-50/30`}
                    >
                      {/* ID */}
                      <td className="py-4 px-6 font-mono text-xs text-slate-500 font-bold">
                        #{item.id}
                      </td>

                      {/* Khách Hàng */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {(item.fullName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{item.fullName || 'Người dùng EcoMart'}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{item.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SĐT */}
                      <td className="py-4 px-6 text-xs text-slate-600">
                        {item.phoneNumber ? (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {item.phoneNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Chưa cập nhật</span>
                        )}
                      </td>

                      {/* Vai Trò */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black ${
                            isAdminRole
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {item.role}
                        </span>
                      </td>

                      {/* Ngày Tham Gia */}
                      <td className="py-4 px-6 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '2026'}
                        </span>
                      </td>

                      {/* Trạng Thái */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đang hoạt động</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Đã khóa</span>
                          </span>
                        )}
                      </td>

                      {/* Thao Tác (Khóa / Mở khóa) */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {isAdminRole ? (
                          <span className="text-xs text-slate-400 italic">Quản trị viên</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setUserToToggle(item)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm hover:shadow transition-all cursor-pointer ${
                              item.isActive
                                ? 'bg-rose-500 hover:bg-rose-600'
                                : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                          >
                            {item.isActive ? (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Khóa</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Mở Khóa</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Thanh phân trang Pagination */}
        <TablePagination
          currentPage={pageData.pageNumber}
          totalPages={pageData.totalPages}
          totalItems={pageData.totalElements}
          itemsPerPage={pageData.pageSize || 10}
          onPageChange={(page) => setCurrentPage(page)}
          itemName="người dùng"
        />
      </div>

      {/* Modal xác nhận Khóa / Mở khóa tài khoản */}
      {userToToggle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-gray-100 animate-scale-up">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  userToToggle.isActive
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {userToToggle.isActive ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {userToToggle.isActive ? 'Khóa Tài Khoản?' : 'Mở Khóa Tài Khoản?'}
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-[200px]">
                  {userToToggle.email}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {userToToggle.isActive
                ? `Bạn có chắc chắn muốn KHÓA tài khoản của "${userToToggle.fullName}" (${userToToggle.email})? Người dùng này sẽ không thể đăng nhập vào hệ thống.`
                : `Bạn có chắc chắn muốn MỞ KHÓA cho tài khoản "${userToToggle.fullName}" (${userToToggle.email})? Người dùng này sẽ có thể đăng nhập lại bình thường.`}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToToggle(null)}
                disabled={isTogglingStatus}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleStatus}
                disabled={isTogglingStatus}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 ${
                  userToToggle.isActive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isTogglingStatus ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : userToToggle.isActive ? (
                  'Xác Nhận Khóa'
                ) : (
                  'Xác Nhận Mở Khóa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserPage;
