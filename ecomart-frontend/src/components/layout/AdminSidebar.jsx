import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const navItems = [
    { path: '/admin', label: '📊 Dashboard', end: true },
    { path: '/admin/products', label: '📦 Quản lý Sản phẩm' },
    { path: '/admin/orders', label: '🧾 Quản lý Đơn hàng' },
  ];

  return (
    <aside className="w-64 bg-slate-800 text-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col gap-2">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
        Admin Portal
      </div>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            `px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'
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
