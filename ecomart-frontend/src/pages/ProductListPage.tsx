import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Leaf,
  Sparkles,
  PackageX,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { productApi } from '../services/productApi';
import { usePublicCategories } from '../hooks/usePublicCategories';
import { usePublicBrands } from '../hooks/usePublicBrands';
import { usePublicCertifications } from '../hooks/usePublicCertifications';
import { ProductCard } from '../components/product/ProductCard';
import { Product, ProductFilterParams, PageResponse } from '../types';

export const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Unified Filter State
  const [filters, setFilters] = useState<ProductFilterParams>(() => {
    return {
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: 12,
      keyword: searchParams.get('keyword') || undefined,
      categoryId: searchParams.get('categoryId')
        ? parseInt(searchParams.get('categoryId')!, 10)
        : undefined,
      brandId: searchParams.get('brandId')
        ? parseInt(searchParams.get('brandId')!, 10)
        : undefined,
      certificationId: searchParams.get('certificationId')
        ? parseInt(searchParams.get('certificationId')!, 10)
        : undefined,
      minPrice: searchParams.get('minPrice')
        ? parseFloat(searchParams.get('minPrice')!)
        : undefined,
      maxPrice: searchParams.get('maxPrice')
        ? parseFloat(searchParams.get('maxPrice')!)
        : undefined,
      minEcoScore: searchParams.get('minEcoScore')
        ? parseInt(searchParams.get('minEcoScore')!, 10)
        : undefined,
      sort: searchParams.get('sort') || 'newest',
    };
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PageResponse<Product> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Metadata Hooks
  const { categories } = usePublicCategories();
  const { brands } = usePublicBrands();
  const { certifications } = usePublicCertifications();

  // 2. Global Debounced Fetching
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const response = await productApi.getProducts(filters, controller.signal);
        if (isMounted) {
          setProducts(response.data?.items || []);
          setPagination(response.data || null);
        }
      } catch (error: unknown) {
        if ((error as Error).name !== 'CanceledError' && isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [filters]);

  // Sync state to URL search params
  const updateFilter = (newPartial: Partial<ProductFilterParams>): void => {
    setFilters((prev) => {
      const updated = {
        ...prev,
        ...newPartial,
        // Reset to page 1 unless we are explicitly changing pages
        page: newPartial.page !== undefined ? newPartial.page : 1,
      };

      // Sync with URL query string
      const params = new URLSearchParams();
      if (updated.keyword) params.set('keyword', updated.keyword);
      if (updated.categoryId) params.set('categoryId', updated.categoryId.toString());
      if (updated.brandId) params.set('brandId', updated.brandId.toString());
      if (updated.certificationId)
        params.set('certificationId', updated.certificationId.toString());
      if (updated.minPrice) params.set('minPrice', updated.minPrice.toString());
      if (updated.maxPrice) params.set('maxPrice', updated.maxPrice.toString());
      if (updated.minEcoScore) params.set('minEcoScore', updated.minEcoScore.toString());
      if (updated.sort && updated.sort !== 'newest') params.set('sort', updated.sort);
      if (updated.page && updated.page > 1) params.set('page', updated.page.toString());

      setSearchParams(params, { replace: true });
      return updated;
    });
  };

  const handleResetFilters = (): void => {
    setFilters({
      page: 1,
      pageSize: 12,
      sort: 'newest',
    });
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Search Bar */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            EcoMart Green Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Sản Phẩm Xanh & Tiêu Chuẩn Sinh Thái
          </h1>
          <p className="text-emerald-100 text-sm leading-relaxed">
            Khám phá hàng ngàn sản phẩm đạt chứng nhận FSC, USDA Organic và điểm Eco-Score
            bền vững giúp giảm phát thải rác thải nhựa.
          </p>

          {/* Search Box */}
          <div className="pt-2">
            <div className="relative max-w-xl">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm theo tên, vật liệu sinh thái (300ms debounce)..."
                value={filters.keyword || ''}
                onChange={(e) => updateFilter({ keyword: e.target.value || undefined })}
                className="w-full pl-12 pr-4 py-3 bg-white text-slate-900 placeholder-slate-400 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-400/30 shadow-lg transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Mobile Filter Button */}
        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-800"
          >
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Bộ Lọc Sinh Thái</span>
          </button>
          <span className="text-xs text-slate-500 font-semibold">
            {pagination?.totalElements || 0} sản phẩm
          </span>
        </div>

        {/* Sidebar Filters */}
        <aside
          className={`space-y-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm lg:block ${
            isMobileFilterOpen ? 'block' : 'hidden'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-4 border-gray-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Bộ Lọc Sản Phẩm</span>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3 h-3" /> Đặt lại
            </button>
          </div>

          {/* 1. Category Filter */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh Mục Sinh Thái
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
              <button
                type="button"
                onClick={() => updateFilter({ categoryId: undefined })}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors font-semibold ${
                  !filters.categoryId
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Tất cả danh mục
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    updateFilter({
                      categoryId: filters.categoryId === cat.id ? undefined : cat.id,
                    })
                  }
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between font-medium ${
                    filters.categoryId === cat.id
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {filters.categoryId === cat.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Brand Filter */}
          <div className="space-y-3 border-t pt-4 border-gray-100">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Thương Hiệu Đối Tác
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
              <button
                type="button"
                onClick={() => updateFilter({ brandId: undefined })}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors font-semibold ${
                  !filters.brandId
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Tất cả thương hiệu
              </button>
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() =>
                    updateFilter({
                      brandId: filters.brandId === brand.id ? undefined : brand.id,
                    })
                  }
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between font-medium ${
                    filters.brandId === brand.id
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{brand.name}</span>
                  {filters.brandId === brand.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Green Certifications Filter */}
          <div className="space-y-3 border-t pt-4 border-gray-100">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Chứng Nhận Sinh Thái
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
              <button
                type="button"
                onClick={() => updateFilter({ certificationId: undefined })}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors font-semibold ${
                  !filters.certificationId
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Tất cả chứng nhận
              </button>
              {certifications.map((cert) => (
                <button
                  key={cert.id}
                  type="button"
                  onClick={() =>
                    updateFilter({
                      certificationId:
                        filters.certificationId === cert.id ? undefined : cert.id,
                    })
                  }
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between font-medium ${
                    filters.certificationId === cert.id
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cert.name}</span>
                  {filters.certificationId === cert.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Eco-Score Filter */}
          <div className="space-y-3 border-t pt-4 border-gray-100">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              Điểm Eco-Score Tối Thiểu
            </label>
            <div className="grid grid-cols-5 gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() =>
                    updateFilter({
                      minEcoScore: filters.minEcoScore === score ? undefined : score,
                    })
                  }
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filters.minEcoScore === score
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {score}🌿
                </button>
              ))}
            </div>
          </div>

          {/* 5. Price Range Filter */}
          <div className="space-y-3 border-t pt-4 border-gray-100">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Khoảng Giá (₫)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Từ (₫)"
                min={0}
                step={10000}
                value={filters.minPrice || ''}
                onChange={(e) =>
                  updateFilter({
                    minPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                placeholder="Đến (₫)"
                min={0}
                step={10000}
                value={filters.maxPrice || ''}
                onChange={(e) =>
                  updateFilter({
                    maxPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Sorter & Result count */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs font-bold text-slate-600">
              Hiển thị{' '}
              <span className="text-emerald-600 font-extrabold">
                {products.length}
              </span>{' '}
              / {pagination?.pagination?.totalItems ?? pagination?.totalElements ?? 0} sản phẩm
            </p>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-500 whitespace-nowrap">
                Sắp xếp theo:
              </label>
              <select
                value={filters.sort || 'newest'}
                onChange={(e) => updateFilter({ sort: e.target.value })}
                className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="newest">✨ Mới nhất</option>
                <option value="price_asc">📈 Giá: Thấp đến Cao</option>
                <option value="price_desc">📉 Giá: Cao đến Thấp</option>
                <option value="eco_score_desc">🌿 Điểm Eco-Score cao nhất</option>
              </select>
            </div>
          </div>

          {/* Product Items */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3 animate-pulse"
                >
                  <div className="aspect-square bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-8 bg-slate-100 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4 shadow-sm">
              <PackageX className="w-16 h-16 text-slate-300 mx-auto stroke-[1.5]" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Không tìm thấy sản phẩm phù hợp
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Hãy thử điều chỉnh lại bộ lọc giá, điểm Eco-Score hoặc xóa từ khóa tìm kiếm.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {(() => {
            const totalPages =
              pagination?.pagination?.totalPages ?? pagination?.totalPages ?? 1;
            if (totalPages <= 1) return null;

            return (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  type="button"
                  onClick={() =>
                    updateFilter({ page: Math.max(1, (filters.page || 1) - 1) })
                  }
                  disabled={(filters.page || 1) <= 1}
                  className="p-2 bg-white border border-gray-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateFilter({ page: p })}
                    className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all ${
                      (filters.page || 1) === p
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-white border border-gray-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    updateFilter({
                      page: Math.min(totalPages, (filters.page || 1) + 1),
                    })
                  }
                  disabled={(filters.page || 1) >= totalPages}
                  className="p-2 bg-white border border-gray-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
                  aria-label="Trang tiếp"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })()}
        </main>
      </div>
    </div>
  );
};

export default ProductListPage;
