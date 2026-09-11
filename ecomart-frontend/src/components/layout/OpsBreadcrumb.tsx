import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const getBreadcrumbs = (pathname: string): BreadcrumbItem[] | null => {
  // Bỏ qua trang dashboard cho cả Admin và Manager
  if (
    pathname === '/admin' ||
    pathname === '/admin/dashboard' ||
    pathname === '/manager' ||
    pathname === '/manager/dashboard'
  ) {
    return null;
  }

  // Phân hệ Admin
  if (pathname.startsWith('/admin')) {
    const dashboardItem: BreadcrumbItem = { label: 'Dashboard', path: '/admin/dashboard' };

    if (pathname === '/admin/users') {
      return [dashboardItem, { label: 'Quản trị người dùng' }];
    }
    if (pathname === '/admin/settings') {
      return [
        dashboardItem,
        { label: 'Quản trị người dùng', path: '/admin/users' },
        { label: 'Cài đặt cửa hàng' },
      ];
    }
    if (pathname === '/admin/profile') {
      return [dashboardItem, { label: 'Hồ sơ cá nhân' }];
    }
    return [dashboardItem, { label: 'Trang quản trị' }];
  }

  // Phân hệ Manager
  if (pathname.startsWith('/manager')) {
    const dashboardItem: BreadcrumbItem = { label: 'Dashboard', path: '/manager' };

    if (pathname === '/manager/categories') {
      return [dashboardItem, { label: 'Quản lý danh mục' }];
    }
    if (pathname === '/manager/brands') {
      return [dashboardItem, { label: 'Quản lý thương hiệu' }];
    }
    if (pathname === '/manager/products') {
      return [dashboardItem, { label: 'Quản lý sản phẩm' }];
    }
    if (pathname === '/manager/inventory') {
      return [dashboardItem, { label: 'Quản lý tồn kho' }];
    }
    if (pathname === '/manager/certifications') {
      return [dashboardItem, { label: 'Chứng nhận xanh' }];
    }
    if (pathname === '/manager/orders') {
      return [dashboardItem, { label: 'Quản lý đơn hàng' }];
    }
    if (pathname.startsWith('/manager/orders/')) {
      return [
        dashboardItem,
        { label: 'Quản lý đơn hàng', path: '/manager/orders' },
        { label: 'Chi tiết đơn hàng' },
      ];
    }
    if (pathname === '/manager/reviews') {
      return [dashboardItem, { label: 'Quản lý đánh giá' }];
    }
    if (pathname === '/manager/contact') {
      return [dashboardItem, { label: 'Liên hệ khách hàng' }];
    }
    if (pathname === '/manager/content') {
      return [dashboardItem, { label: 'Nội dung trang' }];
    }
    if (pathname === '/manager/profile') {
      return [dashboardItem, { label: 'Hồ sơ cá nhân' }];
    }
    return [dashboardItem, { label: 'Quản lý vận hành' }];
  }

  return null;
};

export const OpsBreadcrumb: React.FC = () => {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-end mb-4 px-1 select-none">
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-white/70 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-gray-200/70 shadow-2xs">
        {breadcrumbs.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={index}>
              {!isFirst && <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}

              {isLast ? (
                <span className="text-emerald-800 font-extrabold flex items-center gap-1 truncate max-w-[200px] sm:max-w-none">
                  {item.label}
                </span>
              ) : item.path ? (
                <Link
                  to={item.path}
                  className="flex items-center gap-1 text-slate-600 hover:text-emerald-700 transition-colors truncate max-w-[150px] sm:max-w-none"
                >
                  {isFirst && <Home className="w-3.5 h-3.5 flex-shrink-0" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className="text-slate-600 truncate max-w-[150px] sm:max-w-none">
                  {item.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};

export default OpsBreadcrumb;
