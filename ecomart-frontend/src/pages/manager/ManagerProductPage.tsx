import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { productApi } from '../../services/productApi';
import { usePublicCategories } from '../../hooks/usePublicCategories';
import { usePublicBrands } from '../../hooks/usePublicBrands';
import { usePublicCertifications } from '../../hooks/usePublicCertifications';
import { AdminProductModal } from '../../components/product/AdminProductModal';
import { EcoScoreBadge } from '../../components/product/EcoScoreBadge';
import { TablePagination } from '../../components/ui/TablePagination';
import { useToast } from '../../context/ToastContext';
import { Product, AdminProductFilterParams, CustomAxiosError } from '../../types';

export const ManagerProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [selectedBrand, setSelectedBrand] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<
    'ALL' | 'VISIBLE' | 'HIDDEN' | 'OUT_OF_STOCK'
  >('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Metadata Hooks
  const { categories } = usePublicCategories();
  const { brands } = usePublicBrands();
  const { certifications } = usePublicCertifications();
  const { showToast } = useToast();

  // 1. Debounce Search 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // 2. Fetch danh sách Products từ Backend
  const fetchProducts = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      try {
        const params: AdminProductFilterParams = {
          page: 1,
          pageSize: 100, // Load danh sách quản trị
          keyword: debouncedKeyword || undefined,
          categoryId: selectedCategory > 0 ? selectedCategory : undefined,
          brandId: selectedBrand > 0 ? selectedBrand : undefined,
        };
        const response = await productApi.adminGetProducts(params, signal);
        const items: Product[] = Array.isArray(response.data)
          ? (response.data as Product[])
          : response.data?.items || response.data?.content || [];
        setProducts(items);
      } catch (error: unknown) {
        if ((error as Error).name !== 'CanceledError') {
          showToast('Không thể tải danh sách sản phẩm quản trị.', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedKeyword, selectedCategory, selectedBrand, showToast]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchProducts]);

  // 3. Xử lý Mở Modal Thêm mới / Chỉnh sửa
  const handleOpenCreateModal = (): void => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product): void => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (savedProduct: Product): void => {
    setProducts((prev) => {
      const index = prev.findIndex((p) => p.id === savedProduct.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = savedProduct;
        return updated;
      }
      return [savedProduct, ...prev];
    });
  };

  // 4. Optimistic Update: Toggle Trạng thái Hiển thị (Bật / Ẩn)
  const handleToggleVisibility = async (product: Product): Promise<void> => {
    const originalProducts = [...products];
    const newStatus = !product.isVisible;

    // Optimistic: Cập nhật ngay trong state
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isVisible: newStatus } : p))
    );

    try {
      await productApi.adminUpdateProduct(product.id, {
        name: product.name,
        categoryId: product.category?.id || 0,
        brandId: product.brand?.id || 0,
        sellingPrice: product.sellingPrice,
        originalPrice: product.originalPrice,
        ecoScore: product.ecoScore,
        materialInfo: product.materialInfo,
        quantityInStock: product.quantityInStock,
        description: product.description,
        isVisible: newStatus,
      });
      showToast(
        `Đã ${newStatus ? 'hiển thị' : 'tạm ẩn'} sản phẩm "${product.name}" thành công!`,
        'success'
      );
    } catch (error: unknown) {
      // Rollback nếu thất bại
      setProducts(originalProducts);
      const customError = error as CustomAxiosError;
      const message =
        customError.response?.data?.message ||
        'Không thể cập nhật trạng thái sản phẩm. Đã khôi phục dữ liệu.';
      showToast(message, 'error');
    }
  };

  // 5. Lọc danh sách theo Tab trạng thái
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const stock = product.quantityInStock ?? (product as unknown as { stockQuantity?: number }).stockQuantity ?? 0;
      if (filterStatus === 'ALL') return true;
      if (filterStatus === 'VISIBLE') return product.isVisible;
      if (filterStatus === 'HIDDEN') return !product.isVisible;
      if (filterStatus === 'OUT_OF_STOCK') return stock <= 0;
      return true;
    });
  }, [products, filterStatus]);

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedKeyword, selectedCategory, selectedBrand, filterStatus]);

  // Danh sách hiển thị theo trang
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  // Helper định dạng tiền VNĐ
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header & Nút tạo mới */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quản Lý Sản Phẩm Sinh Thái
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Sản Phẩm Mới</span>
        </button>
      </div>

      {/* Thống kê nhanh 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tổng sản phẩm
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{products.length}</p>
          </div>
          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Đang kinh doanh
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {products.filter((p) => p.isVisible).length}
            </p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tạm ẩn
            </p>
            <p className="text-2xl font-extrabold text-rose-500 mt-1">
              {products.filter((p) => !p.isVisible).length}
            </p>
          </div>
          <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Hết hàng trong kho
            </p>
            <p className="text-2xl font-extrabold text-amber-500 mt-1">
              {products.filter((p) => p.quantityInStock <= 0).length}
            </p>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Bộ lọc & Tìm kiếm */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Debounce 300ms */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm (300ms debounce)..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Lọc Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white"
            >
              <option value={0}>-- Tất cả danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Brand */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white"
            >
              <option value={0}>-- Tất cả thương hiệu --</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-t pt-3 border-gray-100">
          <span className="text-xs font-bold text-slate-500">Trạng thái:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                filterStatus === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('VISIBLE')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                filterStatus === 'VISIBLE'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đang kinh doanh
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('HIDDEN')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                filterStatus === 'HIDDEN'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tạm ẩn
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('OUT_OF_STOCK')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                filterStatus === 'OUT_OF_STOCK'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hết hàng
            </button>
          </div>
        </div>
      </div>

      {/* Bảng Dữ Liệu Products */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Đang tải danh sách sản phẩm...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Package className="w-12 h-12 text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-medium">Không tìm thấy sản phẩm nào phù hợp.</p>
            {(debouncedKeyword || selectedCategory > 0 || selectedBrand > 0) && (
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword('');
                  setSelectedCategory(0);
                  setSelectedBrand(0);
                }}
                className="text-xs text-emerald-600 font-bold hover:underline"
              >
                Đặt lại bộ lọc tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-14">ID</th>
                  <th className="py-3.5 px-4">Sản Phẩm Sinh Thái</th>
                  <th className="py-3.5 px-4">Danh Mục & Hãng</th>
                  <th className="py-3.5 px-4">Giá Bán</th>
                  <th className="py-3.5 px-4 text-center">Tồn Kho</th>
                  <th className="py-3.5 px-4">Eco-Score</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedProducts.map((product) => {
                  const primaryImg =
                    product.images?.find((img) => img.isPrimary)?.imageUrl ||
                    product.images?.[0]?.imageUrl ||
                    product.thumbnailUrl ||
                    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300';

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-emerald-50/30 transition-colors even:bg-slate-50/50"
                    >
                      {/* ID */}
                      <td className="py-4 px-4 font-mono text-xs text-slate-400">
                        #{product.id}
                      </td>

                      {/* Tên sản phẩm & Hình ảnh */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={primaryImg}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300';
                            }}
                          />
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 line-clamp-1 hover:text-emerald-600 transition-colors">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">
                              SKU: {product.sku || `PRD-${product.id}`}
                            </p>
                          </div>
                        </div>
                      </td>

                    {/* Danh mục */}
                    <td className="py-4 px-4 text-xs font-semibold text-slate-600">
                      {product.category?.name || (product as unknown as { categoryName?: string }).categoryName || '---'}
                    </td>

                    {/* Thương hiệu */}
                    <td className="py-4 px-4 text-xs font-semibold text-slate-600">
                      {product.brand?.name || (product as unknown as { brandName?: string }).brandName || '---'}
                    </td>

                    {/* Giá bán */}
                    <td className="py-4 px-4 font-bold text-emerald-700 text-sm whitespace-nowrap">
                      {formatCurrency(product.sellingPrice ?? (product as unknown as { price?: number }).price ?? 0)}
                    </td>

                    {/* Tồn kho */}
                    <td className="py-4 px-4 text-center">
                      {(() => {
                        const stock = product.quantityInStock ?? (product as unknown as { stockQuantity?: number }).stockQuantity ?? 0;
                        return (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                              stock <= 0
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : stock <= 10
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-gray-200'
                            }`}
                          >
                            {stock <= 0 ? 'Hết hàng' : `${stock} món`}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Điểm EcoScore */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <EcoScoreBadge score={product.ecoScore} showLabel={false} />
                    </td>

                    {/* Trạng thái hiển thị */}
                    <td className="py-4 px-4 text-center whitespace-nowrap min-w-[150px]">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 shadow-2xs ${
                          product.isVisible
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            product.isVisible ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span className="whitespace-nowrap tracking-tight">
                          {product.isVisible ? 'Đang hoạt động' : 'Đang ẩn'}
                        </span>
                      </span>
                    </td>

                    {/* Nút hành động */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Nút Sửa */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(product)}
                          className="p-2 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-100/80 border border-slate-200/80 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95 flex items-center justify-center"
                          title="Chỉnh sửa sản phẩm"
                          aria-label={`Chỉnh sửa sản phẩm ${product.name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Nút Toggle Visibility */}
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(product)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                            product.isVisible
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                          title={
                            product.isVisible ? 'Nhấn để ẩn sản phẩm' : 'Nhấn để hiển thị'
                          }
                        >
                          {product.isVisible ? 'Ẩn' : 'Bật'}
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

        {/* Table Footer Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          itemsPerPage={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          itemName="sản phẩm"
        />
      </div>

      {/* Modal Thêm/Sửa Sản phẩm */}
      <AdminProductModal
        isOpen={isModalOpen}
        productToEdit={productToEdit}
        categories={categories}
        brands={brands}
        certifications={certifications}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default ManagerProductPage;
