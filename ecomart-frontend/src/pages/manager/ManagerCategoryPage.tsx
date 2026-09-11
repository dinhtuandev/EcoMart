import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  CheckCircle2,
  XCircle,
  Leaf,
  Layers,
} from 'lucide-react';
import { categoryApi } from '../../services/categoryApi';
import { CategoryModal } from '../../components/category/CategoryModal';
import { TablePagination } from '../../components/ui/TablePagination';
import { useToast } from '../../context/ToastContext';
import { Category, CustomAxiosError } from '../../types';

export const ManagerCategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const { showToast } = useToast();

  // 1. Debounce Search 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // 2. Fetch danh sách Category từ Backend
  const fetchCategories = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      try {
        const response = await categoryApi.adminGetCategories(signal);
        setCategories(response.data || []);
      } catch (error: unknown) {
        if ((error as Error).name !== 'CanceledError') {
          showToast('Không thể tải danh sách danh mục sản phẩm.', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchCategories]);

  // 3. Xử lý Mở Modal Thêm mới / Chỉnh sửa
  const handleOpenCreateModal = (): void => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category): void => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (savedCategory: Category): void => {
    setCategories((prev) => {
      const index = prev.findIndex((c) => c.id === savedCategory.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = savedCategory;
        return updated;
      }
      return [savedCategory, ...prev];
    });
  };

  // 4. Optimistic Update: Toggle Trạng thái Hoạt động (Bật / Tắt)
  const handleToggleStatus = async (category: Category): Promise<void> => {
    const originalCategories = [...categories];
    const newStatus = !category.isActive;

    // Optimistic: Cập nhật ngay trong state
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? { ...c, isActive: newStatus } : c))
    );

    try {
      await categoryApi.adminUpdateCategory(category.id, {
        name: category.name,
        description: category.description,
        isActive: newStatus,
      });
      showToast(
        `Đã ${newStatus ? 'kích hoạt hiển thị' : 'ẩn'} danh mục "${category.name}" thành công!`,
        'success'
      );
    } catch (error: unknown) {
      // Rollback nếu thất bại
      setCategories(originalCategories);
      const customError = error as CustomAxiosError;
      const message =
        customError.response?.data?.message ||
        'Không thể cập nhật trạng thái danh mục. Đã khôi phục dữ liệu.';
      showToast(message, 'error');
    }
  };

      {/* 5. Lọc danh sách theo keyword và status */}
  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesKeyword =
        !debouncedKeyword.trim() ||
        category.name.toLowerCase().includes(debouncedKeyword.toLowerCase().trim()) ||
        (category.description &&
          category.description.toLowerCase().includes(debouncedKeyword.toLowerCase().trim()));

      const matchesStatus =
        filterStatus === 'ALL'
          ? true
          : filterStatus === 'ACTIVE'
          ? category.isActive
          : !category.isActive;

      return matchesKeyword && matchesStatus;
    });
  }, [categories, debouncedKeyword, filterStatus]);

  // Reset về trang 1 mỗi khi lọc/tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedKeyword, filterStatus]);

  // Danh sách hiển thị theo trang
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCategories.slice(startIndex, startIndex + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredCategories.length / pageSize);

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
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quản Lý Danh Mục Sản Phẩm
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Danh Mục</span>
        </button>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tổng số danh mục
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{categories.length}</p>
          </div>
          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Đang hiển thị
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {categories.filter((c) => c.isActive).length}
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
              {categories.filter((c) => !c.isActive).length}
            </p>
          </div>
          <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Bộ lọc & Tìm kiếm */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Debounce */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mô tả danh mục (300ms debounce)..."
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
              Tất cả ({categories.length})
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
              Hiển thị
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

      {/* Bảng Dữ Liệu Categories */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Đang tải danh mục sản phẩm...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <FolderTree className="w-12 h-12 text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-medium">Không tìm thấy danh mục nào phù hợp.</p>
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
                  <th className="py-3.5 px-4">Tên Danh Mục</th>
                  <th className="py-3.5 px-4">Mô Tả</th>
                  <th className="py-3.5 px-4 w-32">Ngày Tạo</th>
                  <th className="py-3.5 px-4 w-44 min-w-[160px] text-center whitespace-nowrap">Trạng Thái</th>
                  <th className="py-3.5 px-4 w-40 min-w-[140px] text-right whitespace-nowrap">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-emerald-50/30 transition-colors even:bg-slate-50/50"
                  >
                    {/* ID */}
                    <td className="py-4 px-4 font-mono text-xs text-slate-400">
                      #{category.id}
                    </td>

                    {/* Tên danh mục */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Leaf className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                            {category.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Mô tả */}
                    <td className="py-4 px-4 text-slate-600 text-xs">
                      <p className="line-clamp-2 max-w-md">
                        {category.description || (
                          <span className="text-slate-400 italic">Chưa có mô tả</span>
                        )}
                      </p>
                    </td>

                    {/* Ngày tạo */}
                    <td className="py-4 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(category.createdAt)}
                    </td>

                    {/* Badge Trạng thái */}
                    <td className="py-4 px-4 text-center whitespace-nowrap min-w-[160px]">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 shadow-2xs ${
                          category.isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            category.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span className="whitespace-nowrap tracking-tight">
                          {category.isActive ? 'Đang hoạt động' : 'Đang ẩn'}
                        </span>
                      </span>
                    </td>

                    {/* Nút hành động */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Nút Sửa */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(category)}
                          className="p-2 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-100/80 border border-slate-200/80 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95 flex items-center justify-center"
                          title="Chỉnh sửa danh mục"
                          aria-label={`Chỉnh sửa danh mục ${category.name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Nút Toggle Status */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(category)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                            category.isActive
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                          title={category.isActive ? 'Nhấn để ẩn' : 'Nhấn để hiển thị'}
                        >
                          {category.isActive ? 'Ẩn' : 'Bật'}
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
          totalItems={filteredCategories.length}
          itemsPerPage={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          itemName="danh mục"
        />
      </div>

      {/* Modal Thêm/Sửa */}
      <CategoryModal
        isOpen={isModalOpen}
        categoryToEdit={categoryToEdit}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default ManagerCategoryPage;
