import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Award,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  CheckCircle2,
  XCircle,
  Tag,
  Building2,
} from 'lucide-react';
import { brandApi } from '../../services/brandApi';
import { BrandModal } from '../../components/brand/BrandModal';
import { useToast } from '../../context/ToastContext';
import { Brand, CustomAxiosError } from '../../types';

export const AdminBrandPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null);

  const { showToast } = useToast();

  // 1. Debounce Search 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // 2. Fetch danh sách Brands từ Backend
  const fetchBrands = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      try {
        const response = await brandApi.adminGetBrands(signal);
        setBrands(response.data || []);
      } catch (error: unknown) {
        if ((error as Error).name !== 'CanceledError') {
          showToast('Không thể tải danh sách thương hiệu đối tác.', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchBrands(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchBrands]);

  // 3. Xử lý Mở Modal Thêm mới / Chỉnh sửa
  const handleOpenCreateModal = (): void => {
    setBrandToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (brand: Brand): void => {
    setBrandToEdit(brand);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (savedBrand: Brand): void => {
    setBrands((prev) => {
      const index = prev.findIndex((b) => b.id === savedBrand.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = savedBrand;
        return updated;
      }
      return [savedBrand, ...prev];
    });
  };

  // 4. Optimistic Update: Toggle Trạng thái Hoạt động (Bật / Tắt)
  const handleToggleStatus = async (brand: Brand): Promise<void> => {
    const originalBrands = [...brands];
    const newStatus = !brand.isActive;

    // Optimistic: Cập nhật ngay trong state
    setBrands((prev) =>
      prev.map((b) => (b.id === brand.id ? { ...b, isActive: newStatus } : b))
    );

    try {
      await brandApi.adminUpdateBrand(brand.id, {
        name: brand.name,
        description: brand.description,
        isActive: newStatus,
      });
      showToast(
        `Đã ${newStatus ? 'kích hoạt' : 'tạm ngưng'} thương hiệu "${brand.name}" thành công!`,
        'success'
      );
    } catch (error: unknown) {
      // Rollback nếu thất bại
      setBrands(originalBrands);
      const customError = error as CustomAxiosError;
      const message =
        customError.response?.data?.message ||
        'Không thể cập nhật trạng thái thương hiệu. Đã khôi phục dữ liệu.';
      showToast(message, 'error');
    }
  };

  // 5. Lọc danh sách theo keyword và status
  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const matchesKeyword =
        !debouncedKeyword.trim() ||
        brand.name.toLowerCase().includes(debouncedKeyword.toLowerCase().trim()) ||
        (brand.description &&
          brand.description.toLowerCase().includes(debouncedKeyword.toLowerCase().trim()));

      const matchesStatus =
        filterStatus === 'ALL'
          ? true
          : filterStatus === 'ACTIVE'
          ? brand.isActive
          : !brand.isActive;

      return matchesKeyword && matchesStatus;
    });
  }, [brands, debouncedKeyword, filterStatus]);

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
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quản Lý Thương Hiệu Đối Tác
            </h1>
            <p className="text-sm text-slate-500">
              Quản lý các thương hiệu xanh đồng hành sản xuất bền vững cùng EcoMart
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Thương Hiệu</span>
        </button>
      </div>

      {/* Thống kê nhanh 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tổng số thương hiệu
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{brands.length}</p>
          </div>
          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Đang hoạt động
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {brands.filter((b) => b.isActive).length}
            </p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tạm ngưng
            </p>
            <p className="text-2xl font-extrabold text-rose-500 mt-1">
              {brands.filter((b) => !b.isActive).length}
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
            placeholder="Tìm theo tên hoặc mô tả thương hiệu (300ms debounce)..."
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
              Tất cả ({brands.length})
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
              Đang hoạt động
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
              Tạm ngưng
            </button>
          </div>
        </div>
      </div>

      {/* Bảng Dữ Liệu Brands */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Đang tải thương hiệu đối tác...</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Award className="w-12 h-12 text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-medium">Không tìm thấy thương hiệu nào phù hợp.</p>
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
                  <th className="py-3.5 px-4">Tên Thương Hiệu</th>
                  <th className="py-3.5 px-4">Mô Tả / Cam Kết</th>
                  <th className="py-3.5 px-4 w-32">Ngày Tạo</th>
                  <th className="py-3.5 px-4 w-36 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 w-36 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredBrands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="hover:bg-emerald-50/30 transition-colors even:bg-slate-50/50"
                  >
                    {/* ID */}
                    <td className="py-4 px-4 font-mono text-xs text-slate-400">
                      #{brand.id}
                    </td>

                    {/* Tên thương hiệu */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                            {brand.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Mô tả */}
                    <td className="py-4 px-4 text-slate-600 text-xs">
                      <p className="line-clamp-2 max-w-md">
                        {brand.description || (
                          <span className="text-slate-400 italic">Chưa có mô tả</span>
                        )}
                      </p>
                    </td>

                    {/* Ngày tạo */}
                    <td className="py-4 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(brand.createdAt)}
                    </td>

                    {/* Badge Trạng thái */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          brand.isActive
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            brand.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {brand.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                      </span>
                    </td>

                    {/* Nút hành động */}
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Nút Sửa */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(brand)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Chỉnh sửa thương hiệu"
                          aria-label={`Chỉnh sửa thương hiệu ${brand.name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Nút Toggle Status */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(brand)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                            brand.isActive
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                          title={brand.isActive ? 'Nhấn để tạm ngưng' : 'Nhấn để kích hoạt'}
                        >
                          {brand.isActive ? 'Tắt' : 'Bật'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      <BrandModal
        isOpen={isModalOpen}
        brandToEdit={brandToEdit}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default AdminBrandPage;
