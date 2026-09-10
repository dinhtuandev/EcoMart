import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  Leaf,
  Sparkles,
  PackageX,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  RotateCcw,
  Filter,
  LayoutGrid,
  List,
} from 'lucide-react';
import { productApi } from '../../services/productApi';
import { usePublicCategories } from '../../hooks/usePublicCategories';
import { usePublicBrands } from '../../hooks/usePublicBrands';
import { usePublicCertifications } from '../../hooks/usePublicCertifications';
import { ProductCard } from '../../components/product/ProductCard';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Product, ProductFilterParams, PageResponse } from '../../types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá: Thấp → Cao' },
  { value: 'price_desc', label: 'Giá: Cao → Thấp' },
  { value: 'eco_score_desc', label: 'Eco-Score cao nhất' },
];

export const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close custom sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          const resAny = response as unknown as {
            data?: unknown;
            pagination?: { totalPages?: number; totalItems?: number; page?: number; pageSize?: number };
          };
          const items: Product[] = Array.isArray(response.data)
            ? (response.data as Product[])
            : response.data?.items || response.data?.content || [];
          setProducts(items);

          if (resAny.pagination) {
            setPagination({
              items,
              pagination: resAny.pagination,
              totalPages: resAny.pagination.totalPages,
              totalElements: resAny.pagination.totalItems,
            } as unknown as PageResponse<Product>);
          } else {
            setPagination((response.data as PageResponse<Product>) || null);
          }
        }
      } catch (error: unknown) {
        if ((error as Error).name !== 'CanceledError' && isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [filters]);

  // Sync state to URL
  const updateFilter = (newPartial: Partial<ProductFilterParams>): void => {
    setFilters((prev) => {
      const updated = {
        ...prev,
        ...newPartial,
        page: newPartial.page !== undefined ? newPartial.page : 1,
      };
      const params = new URLSearchParams();
      if (updated.keyword) params.set('keyword', updated.keyword);
      if (updated.categoryId) params.set('categoryId', updated.categoryId.toString());
      if (updated.brandId) params.set('brandId', updated.brandId.toString());
      if (updated.certificationId) params.set('certificationId', updated.certificationId.toString());
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
    setFilters({ page: 1, pageSize: 12, sort: 'newest' });
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters =
    !!filters.keyword ||
    !!filters.categoryId ||
    !!filters.brandId ||
    !!filters.certificationId ||
    !!filters.minPrice ||
    !!filters.maxPrice ||
    !!filters.minEcoScore;

  const totalPages = pagination?.pagination?.totalPages ?? pagination?.totalPages ?? 1;
  const totalItems = pagination?.pagination?.totalItems ?? pagination?.totalElements ?? 0;

  return (
    <div className="space-y-8 pb-16">
      {/* ── MAIN GRID ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between bg-surface p-4 rounded-2xl border border-border shadow-sm">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="inline-flex items-center gap-2 text-sm font-bold text-softdark"
          >
            <Filter className="w-4 h-4 text-primary-600" />
            Bộ Lọc Sinh Thái
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-accent-500 inline-block" />
            )}
          </button>
          <span className="text-xs text-softdark-muted font-semibold">
            {totalItems} sản phẩm
          </span>
        </div>

        {/* ── SIDEBAR ────────────────────────────────────────────── */}
        <aside
          className={`space-y-6 bg-surface p-5 rounded-2xl border border-border shadow-sm lg:block lg:sticky lg:top-20 lg:self-start ${
            isMobileFilterOpen ? 'block' : 'hidden'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4 border-border">
            <div className="flex items-center gap-2 font-bold text-softdark text-sm">
              <SlidersHorizontal className="w-4 h-4 text-primary-600" />
              Bộ Lọc Sản Phẩm
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-primary-700 hover:text-primary-900 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Đặt lại
              </button>
            )}
          </div>

          {/* 1. Category */}
          <FilterSection label="Danh Mục Sinh Thái">
            <FilterOption
              label="Tất cả danh mục"
              active={!filters.categoryId}
              onClick={() => updateFilter({ categoryId: undefined })}
            />
            {categories.map((cat) => (
              <FilterOption
                key={cat.id}
                label={cat.name}
                active={filters.categoryId === cat.id}
                onClick={() =>
                  updateFilter({ categoryId: filters.categoryId === cat.id ? undefined : cat.id })
                }
              />
            ))}
          </FilterSection>

          {/* 2. Brand */}
          <FilterSection label="Thương Hiệu Đối Tác" divider>
            <FilterOption
              label="Tất cả thương hiệu"
              active={!filters.brandId}
              onClick={() => updateFilter({ brandId: undefined })}
            />
            {brands.map((brand) => (
              <FilterOption
                key={brand.id}
                label={brand.name}
                active={filters.brandId === brand.id}
                onClick={() =>
                  updateFilter({ brandId: filters.brandId === brand.id ? undefined : brand.id })
                }
              />
            ))}
          </FilterSection>

          {/* 3. Certifications */}
          <FilterSection
            label="Chứng Nhận Sinh Thái"
            labelIcon={<Sparkles className="w-3.5 h-3.5 text-primary-600" />}
            divider
            scrollable={false}
          >
            <FilterOption
              label="Tất cả chứng nhận"
              active={!filters.certificationId}
              onClick={() => updateFilter({ certificationId: undefined })}
            />
            {certifications.map((cert) => (
              <FilterOption
                key={cert.id}
                label={cert.name}
                active={filters.certificationId === cert.id}
                onClick={() =>
                  updateFilter({
                    certificationId: filters.certificationId === cert.id ? undefined : cert.id,
                  })
                }
              />
            ))}
          </FilterSection>

          {/* 4. Eco-Score */}
          <FilterSection
            label="Điểm Eco-Score Tối Thiểu"
            labelIcon={<Leaf className="w-3.5 h-3.5 text-primary-600" />}
            divider
          >
            <div className="grid grid-cols-5 gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() =>
                    updateFilter({ minEcoScore: filters.minEcoScore === score ? undefined : score })
                  }
                  className={`py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    filters.minEcoScore === score
                      ? 'bg-primary-700 text-white shadow-sm'
                      : 'bg-primary-50 text-primary-800 hover:bg-primary-100'
                  }`}
                >
                  {score}🌿
                </button>
              ))}
            </div>
          </FilterSection>

          {/* 5. Price Range */}
          <FilterSection label="Khoảng Giá (₫)" divider>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Từ (₫)"
                min={0}
                step={10000}
                value={filters.minPrice || ''}
                onChange={(e) =>
                  updateFilter({ minPrice: e.target.value ? parseFloat(e.target.value) : undefined })
                }
                className="w-full px-2.5 py-1.5 bg-primary-50/60 border border-border rounded-xl text-xs text-softdark focus:outline-none focus:border-primary-500 transition-colors"
              />
              <input
                type="number"
                placeholder="Đến (₫)"
                min={0}
                step={10000}
                value={filters.maxPrice || ''}
                onChange={(e) =>
                  updateFilter({ maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })
                }
                className="w-full px-2.5 py-1.5 bg-primary-50/60 border border-border rounded-xl text-xs text-softdark focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </FilterSection>
        </aside>

        {/* ── PRODUCT GRID AREA ──────────────────────────────────── */}
        <main className="lg:col-span-3 space-y-5">
          {/* Sorter & View Toggle Bar */}
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs font-bold text-softdark-muted">
              Hiển thị{' '}
              <span className="text-primary-700 font-extrabold">{products.length}</span>
              {' '}/ <span className="font-extrabold text-softdark">{totalItems}</span> sản phẩm
            </p>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              {/* View Mode Toggle: Grid ⊞ / List ☰ */}
              <div className="flex items-center bg-primary-50/70 p-1 rounded-xl border border-primary-200/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Chế độ xem lưới (Grid)"
                  aria-label="Chế độ xem lưới"
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-primary-800 shadow-2xs font-bold'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="Chế độ xem danh sách (List)"
                  aria-label="Chế độ xem danh sách"
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-primary-800 shadow-2xs font-bold'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <label className="text-xs font-bold text-softdark-muted whitespace-nowrap">
                  Sắp xếp:
                </label>

                <div className="relative w-full sm:w-auto" ref={sortRef}>
                  <button
                    type="button"
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className={`w-full sm:w-auto min-w-[170px] flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs ${
                      isSortOpen
                        ? 'bg-accent-50/90 text-accent-950 border-accent-400 ring-2 ring-accent-400/30'
                        : 'bg-surface text-softdark border-border hover:border-accent-300 hover:bg-accent-50/40'
                    }`}
                  >
                    <span>
                      {SORT_OPTIONS.find((s) => s.value === (filters.sort || 'newest'))?.label || 'Mới nhất'}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-accent-600 transition-transform duration-200 ${
                        isSortOpen ? 'rotate-180 text-accent-700' : 'text-softdark-muted'
                      }`}
                    />
                  </button>

                  {/* Custom Accent Dropdown Menu */}
                  {isSortOpen && (
                    <div className="absolute right-0 top-full mt-1.5 z-30 w-full sm:w-52 rounded-2xl bg-surface border border-accent-200/90 shadow-xl shadow-accent-950/5 p-1.5 space-y-1 backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-150">
                      {SORT_OPTIONS.map((option) => {
                        const isSelected = (filters.sort || 'newest') === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              updateFilter({ sort: option.value });
                              setIsSortOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                              isSelected
                                ? 'bg-gradient-to-r from-accent-100/90 via-accent-50 to-primary-50/60 text-accent-950 border border-accent-300/80 shadow-2xs'
                                : 'text-softdark hover:bg-accent-50/80 hover:text-accent-900'
                            }`}
                          >
                            <span>{option.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-accent-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Products — scrollable container, only cards scroll */}
          <div className="lg:overflow-y-auto lg:max-h-[calc(100vh-12rem)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {isLoading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-surface rounded-3xl p-4 border border-border space-y-3 animate-pulse"
                >
                  <div className="aspect-square bg-primary-100/70 rounded-2xl" />
                  <div className="h-4 bg-primary-100/70 rounded-xl w-3/4" />
                  <div className="h-3 bg-primary-100/70 rounded-xl w-1/2" />
                  <div className="h-9 bg-primary-100/70 rounded-2xl mt-2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={PackageX}
              title="Không tìm thấy sản phẩm phù hợp"
              description="Hãy thử điều chỉnh lại bộ lọc giá, điểm Eco-Score hoặc xóa từ khóa tìm kiếm."
              variant="primary"
              action={
                hasActiveFilters ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleResetFilters}
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Xóa tất cả bộ lọc
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 pb-2">
              <button
                type="button"
                onClick={() => updateFilter({ page: Math.max(1, (filters.page || 1) - 1) })}
                disabled={(filters.page || 1) <= 1}
                aria-label="Trang trước"
                className="p-2 bg-surface border border-border rounded-xl text-softdark hover:bg-primary-50 hover:border-primary-400 disabled:opacity-40 transition-all"
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
                      ? 'bg-primary-700 text-white shadow-md shadow-primary-700/20'
                      : 'bg-surface border border-border text-softdark hover:bg-primary-50 hover:border-primary-400'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  updateFilter({ page: Math.min(totalPages, (filters.page || 1) + 1) })
                }
                disabled={(filters.page || 1) >= totalPages}
                aria-label="Trang tiếp"
                className="p-2 bg-surface border border-border rounded-xl text-softdark hover:bg-primary-50 hover:border-primary-400 disabled:opacity-40 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          </div>
        </main>

      </div>
    </div>
  );
};

export default ProductListPage;

// ─── Sub-components ──────────────────────────────────────────────────────────

interface FilterSectionProps {
  label: string;
  labelIcon?: React.ReactNode;
  divider?: boolean;
  scrollable?: boolean;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  label,
  labelIcon,
  divider,
  scrollable = true,
  children,
}) => (
  <div className={`space-y-2.5 ${divider ? 'border-t pt-4 border-border' : ''}`}>
    <label className="flex items-center gap-1.5 text-xs font-extrabold text-softdark uppercase tracking-wider">
      {labelIcon}
      {label}
    </label>
    <div className={`space-y-1 text-xs ${scrollable ? 'max-h-48 overflow-y-auto pr-1' : ''}`}>
      {children}
    </div>
  </div>
);

interface FilterOptionProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const FilterOption: React.FC<FilterOptionProps> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-between font-semibold ${
      active
        ? 'bg-primary-100 text-primary-800 font-extrabold'
        : 'text-softdark-muted hover:bg-primary-50 hover:text-softdark'
    }`}
  >
    <span className="truncate">{label}</span>
    {active && <span className="w-2 h-2 rounded-full bg-primary-700 shrink-0" />}
  </button>
);
