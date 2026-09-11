import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import StorePreviewBanner from './StorePreviewBanner';
import { useStorePreview } from '../../hooks/useStorePreview';
import { isStaffStorePreviewPathBlocked } from '../../utils/storePreview';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const { isPreview, dashboardPath, exitPreview } = useStorePreview();

  if (isPreview && isStaffStorePreviewPathBlocked(location.pathname)) {
    return <Navigate to="/?preview=1" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {isPreview && (
        <StorePreviewBanner dashboardPath={dashboardPath} onBack={exitPreview} />
      )}
      <Header />
      <main className="flex-1 w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
