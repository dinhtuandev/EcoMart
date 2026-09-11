import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';
import AdminProfileLayout from '../components/layout/AdminProfileLayout';
import ProtectedRoute from './ProtectedRoute';

import HomePage from '../pages/customer/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ProductListPage from '../pages/customer/ProductListPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderHistoryPage from '../pages/customer/OrderHistoryPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import ProfilePage from '../pages/customer/ProfilePage';
import ContactPage from '../pages/customer/ContactPage';
import PolicyPage from '../pages/customer/PolicyPage';
import ContentPage from '../pages/ContentPage';
import NotFoundPage from '../pages/NotFoundPage';

import ManagerDashboardPage from '../pages/manager/ManagerDashboardPage';
import ManagerCategoryPage from '../pages/manager/ManagerCategoryPage';
import ManagerBrandPage from '../pages/manager/ManagerBrandPage';
import ManagerProductPage from '../pages/manager/ManagerProductPage';
import ManagerInventoryPage from '../pages/manager/ManagerInventoryPage';
import ManagerCertificationPage from '../pages/manager/ManagerCertificationPage';
import ManagerOrderPage from '../pages/manager/ManagerOrderPage';
import ManagerOrderDetailPage from '../pages/manager/ManagerOrderDetailPage';
import ManagerReviewPage from '../pages/manager/ManagerReviewPage';
import ManagerContentPage from '../pages/manager/ManagerContentPage';
import ManagerContactPage from '../pages/manager/ManagerContactPage';
import AdminUserPage from '../pages/admin/AdminUserPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import VNPayReturnPage from '../pages/VNPayReturnPage';
import VNPayMockPage from '../pages/VNPayMockPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public / Customer Routes with Main Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/policy" element={<PolicyPage />} />
        <Route path="/pages/:slug" element={<ContentPage />} />
        <Route path="/payment/vnpay/return" element={<VNPayReturnPage />} />
        <Route path="/payment/vnpay/mock" element={<VNPayMockPage />} />

        {/* Customer Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'MANAGER', 'ADMIN']} />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Manager-Only Protected Routes with Admin Layout */}
      <Route element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/manager" element={<ManagerDashboardPage />} />
          <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />
          <Route path="/manager/categories" element={<ManagerCategoryPage />} />
          <Route path="/manager/brands" element={<ManagerBrandPage />} />
          <Route path="/manager/products" element={<ManagerProductPage />} />
          <Route path="/manager/inventory" element={<ManagerInventoryPage />} />
          <Route path="/manager/certifications" element={<ManagerCertificationPage />} />
          <Route path="/manager/orders" element={<ManagerOrderPage />} />
          <Route path="/manager/orders/:id" element={<ManagerOrderDetailPage />} />
          <Route path="/manager/reviews" element={<ManagerReviewPage />} />
          <Route path="/manager/contact" element={<ManagerContactPage />} />
          <Route path="/manager/content" element={<ManagerContentPage />} />
        </Route>

        <Route element={<AdminProfileLayout />}>
          <Route path="/manager/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Admin-Only Protected Routes with Admin Layout */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUserPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />

          {/* Fallback: Admin không có quyền truy cập các route Manager */}
          <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        <Route element={<AdminProfileLayout />}>
          <Route path="/admin/profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
