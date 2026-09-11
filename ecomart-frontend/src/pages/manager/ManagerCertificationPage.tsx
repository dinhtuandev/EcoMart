import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Award,
  Layers,
} from 'lucide-react';
import { certificationApi } from '../../services/certificationApi';
import { CertificationModal } from '../../components/certification/CertificationModal';
import { TablePagination } from '../../components/ui/TablePagination';
import { useToast } from '../../context/ToastContext';
import { EcoCertification, Certification, CustomAxiosError } from '../../types';

export const ManagerCertificationPage: React.FC = () => {
  const [certifications, setCertifications] = useState<EcoCertification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [certToEdit, setCertToEdit] = useState<Certification | null>(null);

  const { showToast } = useToast();

  // 1. Debounce Search 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // 2. Fetch danh sách Certifications từ Backend
  const fetchCertifications = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      try {
        const response = await certificationApi.adminGetCertifications(signal);
        setCertifications(response.data || []);
      } catch (error: unknown) {
        if ((error as Error).name !== 'CanceledError') {
          showToast('Không thể tải danh sách chứng nhận sinh thái.', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchCertifications(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchCertifications]);

  // 3. Xử lý Mở Modal Thêm mới / Chỉnh sửa
  const handleOpenCreateModal = (): void => {
    setCertToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cert: Certification): void => {
    setCertToEdit(cert);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (savedCert: Certification): void => {
    setCertifications((prev) => {
      const index = prev.findIndex((c) => c.id === savedCert.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = savedCert;
        return updated;
      }
      return [savedCert, ...prev];
    });
  };

  // 4. Optimistic Update: Toggle Trạng thái Hoạt động (Bật / Tắt)
  const handleToggleStatus = async (cert: Certification): Promise<void> => {
    const originalCerts = [...certifications];
    const newStatus = !cert.isActive;

    // Optimistic: Cập nhật ngay trong state
    setCertifications((prev) =>
      prev.map((c) => (c.id === cert.id ? { ...c, isActive: newStatus } : c))
    );

    try {
      await certificationApi.adminUpdateCertification(cert.id, {
        name: cert.name,
        description: cert.description,
        iconUrl: cert.iconUrl,
        isActive: newStatus,
      });
      showToast(
        `Đã ${newStatus ? 'kích hoạt' : 'tạm ẩn'} chứng nhận "${cert.name}" thành công!`,
        'success'
      );
    } catch (error: unknown) {
      // Rollback nếu thất bại
      setCertifications(originalCerts);
      const customError = error as CustomAxiosError;
      const message =
        customError.response?.data?.message ||
        'Không thể cập nhật trạng thái chứng nhận. Đã khôi phục dữ liệu.';
      showToast(message, 'error');
    }
  };

  // 5. Lọc danh sách theo keyword và status
  const filteredCertifications = useMemo(() => {
    return certifications.filter((cert) => {
      const matchesKeyword =
        !debouncedKeyword.trim() ||
        cert.name.toLowerCase().includes(debouncedKeyword.toLowerCase().trim()) ||
        (cert.description &&
          cert.description.toLowerCase().includes(debouncedKeyword.toLowerCase().trim()));

      const matchesStatus =
        filterStatus === 'ALL'
          ? true
          : filterStatus === 'ACTIVE'
          ? cert.isActive
          : !cert.isActive;

      return matchesKeyword && matchesStatus;
    });
  }, [certifications, debouncedKeyword, filterStatus]);

  // Reset về trang 1 khi thay đổi lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedKeyword, filterStatus]);

  // Danh sách hiển thị theo trang
  const paginatedCertifications = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCertifications.slice(startIndex, startIndex + pageSize);
  }, [filteredCertifications, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredCertifications.length / pageSize);

  // Format ngày tháng chuẩn Việt Nam DD/MM/YYYY
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '---';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Nút tạo mới */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quản Lý Chứng Nhận Sinh Thái
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Chứng Nhận</span>
        </button>
      </div>

      {/* Thống kê nhanh 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tổng số chứng nhận
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {certifications.length}
            </p>
          </div>
          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Đang áp dụng
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {certifications.filter((c) => c.isActive).length}
            </p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Đang tạm ẩn
            </p>
            <p className="text-2xl font-extrabold text-rose-500 mt-1">
              {certifications.filter((c) => !c.isActive).length}
            </p>
          </div>
          <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Bộ lọc & Tìm kiếm */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Debounce 300ms */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mô tả chứng nhận (300ms debounce)..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">Trạng thái:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilterStatus('ALL')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterStatus === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({certifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('ACTIVE')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterStatus === 'ACTIVE'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đang áp dụng
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('INACTIVE')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterStatus === 'INACTIVE'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tạm ẩn
            </button>
          </div>
        </div>
      </div>

      {/* Bảng Dữ Liệu Certifications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Đang tải chứng nhận sinh thái...</p>
          </div>
        ) : filteredCertifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <ShieldCheck className="w-12 h-12 text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-medium">Không tìm thấy chứng nhận nào phù hợp.</p>
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
                  <th className="py-3.5 px-4 w-16">ID</th>
                  <th className="py-3.5 px-4">Tên Chứng Nhận</th>
                  <th className="py-3.5 px-4">Mô Tả / Tiêu Chuẩn</th>
                  <th className="py-3.5 px-4 w-32">Ngày Tạo</th>
                  <th className="py-3.5 px-4 w-36 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 w-36 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedCertifications.map((cert) => (
                  <tr
                    key={cert.id}
                    className="hover:bg-emerald-50/30 transition-colors even:bg-slate-50/50"
                  >
                    {/* ID */}
                    <td className="py-4 px-4 font-mono text-xs text-slate-400">
                      #{cert.id}
                    </td>

                    {/* Tên chứng nhận */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                            {cert.name}
                          </p>
                          {cert.issuedBy && (
                            <p className="text-[11px] text-slate-400">
                              Cấp bởi: {cert.issuedBy}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Mô tả */}
                    <td className="py-4 px-4 text-slate-600 text-xs">
                      <p className="line-clamp-2 max-w-md">
                        {cert.description || (
                          <span className="text-slate-400 italic">Chưa có mô tả</span>
                        )}
                      </p>
                    </td>

                    {/* Ngày tạo */}
                    <td className="py-4 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(cert.createdAt)}
                    </td>

                    {/* Badge Trạng thái */}
                    <td className="py-4 px-4 text-center whitespace-nowrap min-w-[160px]">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 shadow-2xs ${
                          cert.isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            cert.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span className="whitespace-nowrap tracking-tight">
                          {cert.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                        </span>
                      </span>
                    </td>

                    {/* Nút hành động */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Nút Sửa */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(cert)}
                          className="p-2 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-100/80 border border-slate-200/80 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95 flex items-center justify-center"
                          title="Chỉnh sửa chứng nhận"
                          aria-label={`Chỉnh sửa chứng nhận ${cert.name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Nút Toggle Status */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cert)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                            cert.isActive
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                          title={cert.isActive ? 'Nhấn để tạm ngưng' : 'Nhấn để kích hoạt'}
                        >
                          {cert.isActive ? 'Tắt' : 'Bật'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCertifications.length}
          itemsPerPage={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          itemName="chứng nhận"
        />
      </div>

      {/* Modal Thêm/Sửa */}
      <CertificationModal
        isOpen={isModalOpen}
        certToEdit={certToEdit}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default ManagerCertificationPage;
