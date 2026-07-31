import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const { user, isAuthenticated, isAdmin, handleLogout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2" aria-label="TechHub Home">
          <span className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded-lg text-xl tracking-wider">
            TechHub
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <Link to="/products" className="hover:text-blue-600 transition-colors">
            Sản phẩm
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-amber-600 font-semibold hover:text-amber-700 transition-colors">
              Quản trị (Admin)
            </Link>
          )}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative text-slate-700 hover:text-blue-600 p-2" aria-label="Giỏ hàng">
            🛒 <span className="hidden sm:inline">Giỏ hàng</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to="/orders" className="text-sm text-slate-700 hover:text-blue-600 font-medium">
                Đơn hàng
              </Link>
              <button
                onClick={handleLogoutClick}
                className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                Đăng xuất ({user?.fullName || 'User'})
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm text-slate-700 hover:text-blue-600 px-3 py-1.5 font-medium transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg font-medium transition-colors"
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
