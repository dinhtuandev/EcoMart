import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf,
  ChevronDown,
  ShoppingCart,
  LogOut,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { useCart } from '../../context/CartContext';
import { usePublicCategories } from '../../hooks/usePublicCategories';

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { categories, isLoading: isLoadingCats } = usePublicCategories();
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = (): void => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
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

        {/* Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
          <Link to="/" className="hover:text-emerald-600 transition-colors">
            Trang chủ
          </Link>

          {/* Dropdown Danh Mục Sản Phẩm */}
          <div className="relative" ref={dropdownRef}>
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
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
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
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                {totalItems}
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
