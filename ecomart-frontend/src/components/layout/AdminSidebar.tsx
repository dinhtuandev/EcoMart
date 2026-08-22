import React from 'react';
import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { path: '/admin/categories', label: 'Quản lý Danh mục', icon: FolderTree },
    { path: '/admin/brands', label: 'Quản lý Thương hiệu', icon: Award },
    { path: '/admin/products', label: 'Quản lý Sản phẩm', icon: Package },
    { path: '/admin/certifications', label: 'Chứng nhận xanh', icon: ShieldCheck },
    { path: '/admin/orders', label: 'Quản lý Đơn hàng', icon: Receipt },
    { path: '/admin/reviews', label: 'Quản lý Đánh giá', icon: Star },
    { path: '/admin/users', label: 'Quản lý Người dùng', icon: Users },
    { path: '/admin/content', label: 'Nội Dung Trang', icon: FileText },
    { path: '/admin/settings', label: 'Cài Đặt', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col gap-2 border-r border-slate-800 flex-shrink-0">
      <div className="flex items-center gap-2 px-3 py-2 text-xs font-black text-emerald-400 uppercase tracking-wider">
        <Sparkles className="w-4 h-4" />
        <span>EcoMart Admin Portal</span>
      </div>

      <nav className="flex flex-col gap-1.5 mt-2">
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
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
