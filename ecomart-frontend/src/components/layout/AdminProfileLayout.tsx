import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

/**
 * Layout dành cho trang Hồ Sơ của Manager/Admin.
 * Có AdminHeader và AdminSidebar, nội dung hiển thị trong vùng main bên phải.
 */
export const AdminProfileLayout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-800 overflow-hidden">
      <AdminHeader />
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 h-full overflow-y-auto p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminProfileLayout;
