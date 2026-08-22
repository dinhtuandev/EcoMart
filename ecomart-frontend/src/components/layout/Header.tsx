import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf,
  ChevronDown,
  ShoppingCart,
  LogOut,
  ShieldCheck,
  Layers,
  Search,
  X,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { useCart } from '../../context/CartContext';
import { usePublicCategories } from '../../hooks/usePublicCategories';
import { productApi } from '../../services/productApi';
import { Product, CustomAxiosError } from '../../types';
import EcoScoreBadge from '../product/EcoScoreBadge';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

// Helper highlight keyword in text
const HighlightText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-amber-100 text-amber-900 font-bold px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalQuantity } = useCart();
  const { categories, isLoading: isLoadingCats } = usePublicCategories();
  const navigate = useNavigate();

  // Category dropdown state
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Live Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Live Search Effect with Debounce 300ms & AbortController (No memory leak)
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setIsSearchOpen(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      return;
    }

    const handler = setTimeout(async () => {
      // Abort previous inflight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsSearching(true);
      try {
        const res = await productApi.getProducts(
          { keyword: trimmedQuery, pageSize: 5 },
          controller.signal
        );
        if (res.data) {
          const items = res.data.items || res.data.content || [];
          setSearchResults(items);
          setIsSearchOpen(true);
        }
      } catch (error: unknown) {
        const e = error as CustomAxiosError;
        if (e.name !== 'CanceledError' && e.name !== 'AbortError') {
          console.error('Search error:', error);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchQuery]);

  // Click outside to close dropdowns & Escape key listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCategoryDropdownOpen(false);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchOpen(false);
    navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogoutClick = (): void => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo EcoMart */}
        <Link
          to="/"
          className="flex items-center gap-2 group flex-shrink-0"
          aria-label="EcoMart Trang chủ"
        >
          <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-0.5">
              Eco<span className="text-emerald-600">Mart</span>
            </span>
            <p className="text-[9px] font-bold text-slate-400 -mt-1 tracking-wider uppercase">
              Sống Xanh Bền Vững
            </p>
          </div>
        </Link>

        {/* Live Search Input (Desktop & Tablet) */}
        <div
          ref={searchContainerRef}
          className="relative flex-1 max-w-md mx-2 hidden md:block"
        >
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setIsSearchOpen(true);
              }}
              placeholder="Tìm kiếm sản phẩm sinh thái..."
              tabIndex={0}
              aria-label="Tìm kiếm sản phẩm"
              className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all"
            />
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setIsSearchOpen(false);
                }}
                tabIndex={0}
                aria-label="Xóa từ khóa"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </form>

          {/* Search Dropdown Results */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 border-b border-gray-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
                Gợi Ý Sản Phẩm
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {searchResults.map((item) => (
                  <Link
                    key={item.id}
                    to={`/products/${item.id}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors block"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          item.images?.[0]?.imageUrl ||
                          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100'
                        }
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          <HighlightText text={item.name} highlight={searchQuery} />
                        </p>
                        <p className="text-[11px] font-black text-emerald-600 mt-0.5">
                          {formatCurrency(item.sellingPrice)}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <EcoScoreBadge score={item.ecoScore} size="sm" showLabel={false} />
                    </div>
                  </Link>
                ))}
              </div>

              <div className="p-2 border-t border-gray-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full py-1.5 px-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Xem tất cả kết quả cho &quot;{searchQuery}&quot;</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
          <Link to="/" className="hover:text-emerald-600 transition-colors">
            Trang chủ
          </Link>

          {/* Dropdown Danh Mục Sản Phẩm */}
          <div className="relative" ref={categoryDropdownRef}>
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors py-2"
              aria-expanded={isCategoryDropdownOpen}
              aria-haspopup="true"
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Danh mục</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isCategoryDropdownOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'
                }`}
              />
            </button>

            {/* Dropdown Content */}
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in">
                <div className="px-3 py-1.5 border-b border-gray-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Danh Mục Sinh Thái
                </div>
                {isLoadingCats ? (
                  <div className="p-4 text-center text-xs text-slate-400">Đang tải...</div>
                ) : categories.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Chưa có danh mục nào.
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto py-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products?category=${cat.id}`}
                        onClick={() => setIsCategoryDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                      >
                        <Leaf className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="truncate">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="p-2 border-t border-gray-50 bg-slate-50/50 rounded-b-2xl">
                  <Link
                    to="/products"
                    onClick={() => setIsCategoryDropdownOpen(false)}
                    className="block text-center text-xs font-bold text-emerald-600 hover:text-emerald-700 py-1"
                  >
                    Xem tất cả sản phẩm &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link to="/products" className="hover:text-emerald-600 transition-colors">
            Sản phẩm
          </Link>

          <Link to="/contact" className="hover:text-emerald-600 transition-colors">
            Liên hệ
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 text-amber-600 font-bold hover:text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg transition-colors text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          )}
        </nav>

        {/* User Actions & Cart */}
        <div className="flex items-center gap-3">
          {/* Giỏ hàng */}
          <Link
            to="/cart"
            className="relative p-2 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-black rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center shadow-md">
                {totalQuantity > 99 ? '99+' : totalQuantity}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-gray-200 transition-colors"
                title="Hồ sơ cá nhân & Sổ địa chỉ"
              >
                <div className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {user?.fullName || 'User'}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogoutClick}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                title="Đăng xuất"
                aria-label="Đăng xuất tài khoản"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-bold text-slate-700 hover:text-emerald-600 px-3 py-2 rounded-xl transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
