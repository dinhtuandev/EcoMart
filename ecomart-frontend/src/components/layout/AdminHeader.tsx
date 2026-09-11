import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf,
  LogOut,
  Eye,
  ChevronDown,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { enterStorePreview } from '../../utils/storePreview';
import { getOpsBasePath, getOpsProfilePath } from '../../utils/opsPaths';

export const AdminHeader: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi bấm bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'M';

  return (
    <header className="h-16 bg-white border-b border-gray-200/90 shadow-2xs z-30 flex items-center justify-between px-6 flex-shrink-0 select-none">
      {/* Brand Logo bên trái */}
      <div className="flex items-center gap-3">
        <Link to={getOpsBasePath(user?.role)} className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Eco<span className="text-emerald-600">Mart</span>
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80">
              {isAdmin ? 'Admin Portal' : 'Manager Portal'}
            </span>
          </div>
        </Link>
      </div>

      {/* Menu thao tác bên phải */}
      <div className="flex items-center gap-3">
        {/* Xem sàn ở chế độ chỉ xem, quay lại dashboard cùng tab */}
        <button
          type="button"
          onClick={() => {
            enterStorePreview();
            navigate('/?preview=1');
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100/90 hover:bg-slate-200 border border-slate-200/80 transition-all shadow-2xs cursor-pointer"
          title="Xem giao diện khách hàng (chỉ xem)"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>Xem Sàn EcoMart</span>
        </button>

        {/* Thông tin tài khoản Manager & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {userInitial}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-extrabold text-slate-900 leading-tight">
                {user?.fullName || 'Manager'}
              </p>
              <p className="text-[10px] font-semibold text-emerald-700 leading-tight">
                {isAdmin ? 'Quản trị viên' : 'Quản lý sàn'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Menu Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    {isAdmin ? 'Quyền Quản Trị Hệ Thống' : 'Quyền Quản Lý (Manager)'}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  to={getOpsProfilePath(user?.role)}
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Hồ sơ cá nhân</span>
                </Link>
              </div>

              <div className="border-t border-gray-100 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Đăng Xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
