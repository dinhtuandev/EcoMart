import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Award,
  Package,
  ShieldCheck,
  Receipt,
  Users,
  Sparkles,
  Star,
  FileText,
  Settings,
  Warehouse,
  MessageSquare,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';

export const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    ...(isManager
      ? [
          { path: '/manager', label: 'Dashboard', icon: LayoutDashboard, end: true },
          { path: '/manager/categories', label: 'Quản lý Danh mục', icon: FolderTree },
          { path: '/manager/brands', label: 'Quản lý Thương hiệu', icon: Award },
          { path: '/manager/products', label: 'Quản lý Sản phẩm', icon: Package },
          { path: '/manager/inventory', label: 'Quản lý Tồn kho', icon: Warehouse },
          { path: '/manager/certifications', label: 'Chứng nhận xanh', icon: ShieldCheck },
          { path: '/manager/orders', label: 'Quản lý Đơn hàng', icon: Receipt },
          { path: '/manager/reviews', label: 'Quản lý Đánh giá', icon: Star },
          { path: '/manager/contact', label: 'Liên hệ khách hàng', icon: MessageSquare },
          { path: '/manager/content', label: 'Nội Dung Trang', icon: FileText },
        ]
      : []),
    ...(isAdmin
      ? [
          { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
          { path: '/admin/users', label: 'Quản lý Người dùng', icon: Users },
          { path: '/admin/settings', label: 'Cài Đặt cửa hàng', icon: Settings },
        ]
      : []),
  ];

  return (
    <aside className="w-64 bg-emerald-950 text-emerald-100 h-full p-4 flex flex-col gap-2 border-r border-emerald-900/80 flex-shrink-0 select-none">
      {/* Portal Header Title */}
      <div className="flex items-center gap-2 px-3 py-2.5 text-xs font-black text-emerald-400 uppercase tracking-wider border-b border-emerald-900/60 pb-3 flex-shrink-0">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span>{isAdmin ? 'EcoMart Admin Portal' : 'EcoMart Manager Portal'}</span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 flex flex-col gap-1.5 mt-2 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-emerald-950 shadow-md font-extrabold border border-white'
                    : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/60 font-medium'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Area: User Mini Profile & Logout Button */}
      <div className="pt-3 border-t border-emerald-900/60 flex flex-col gap-2 flex-shrink-0 mt-auto">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-900/40 border border-emerald-900/50">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">
              {user?.fullName || (isAdmin ? 'Admin' : 'Manager')}
            </p>
            <p className="text-[10px] text-emerald-400 font-semibold truncate">
              {isAdmin ? 'Quản trị viên' : 'Quản lý vận hành'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/60 border border-rose-900/50 hover:border-rose-700 transition-all cursor-pointer group shadow-2xs"
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-300 transition-transform group-hover:-translate-x-0.5" />
          <span>Đăng Xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
