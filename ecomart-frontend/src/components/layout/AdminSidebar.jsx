import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const navItems = [
    { path: '/admin', label: '📊 Dashboard', end: true },
    { path: '/admin/products', label: '📦 Quản lý Sản phẩm' },
    { path: '/admin/orders', label: '🧾 Quản lý Đơn hàng' },
    { path: '/admin/users', label: '👥 Quản lý Người dùng' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col gap-2 border-r border-slate-800">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
        Admin Portal
      </div>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            `px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive ? 'bg-emerald-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
};

export default AdminSidebar;
