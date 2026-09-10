import React from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ProductListPage from '../pages/ProductListPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import ProfilePage from '../pages/ProfilePage';
import ContactPage from '../pages/ContactPage';
import ContentPage from '../pages/ContentPage';
import NotFoundPage from '../pages/NotFoundPage';

import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminCategoryPage from '../pages/admin/AdminCategoryPage';
import AdminBrandPage from '../pages/admin/AdminBrandPage';
import AdminProductPage from '../pages/admin/AdminProductPage';
import AdminInventoryPage from '../pages/admin/AdminInventoryPage';
import AdminCertificationPage from '../pages/admin/AdminCertificationPage';
import AdminOrderPage from '../pages/admin/AdminOrderPage';
import AdminOrderDetailPage from '../pages/admin/AdminOrderDetailPage';
import AdminReviewPage from '../pages/admin/AdminReviewPage';
import AdminUserPage from '../pages/admin/AdminUserPage';
import AdminContentPage from '../pages/admin/AdminContentPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
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
        <Route path="/pages/:slug" element={<ContentPage />} />
        <Route path="/payment/vnpay/return" element={<VNPayReturnPage />} />
        <Route path="/payment/vnpay/mock" element={<VNPayMockPage />} />

        {/* Customer Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']} />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Protected Routes with Admin Layout */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/categories" element={<AdminCategoryPage />} />
          <Route path="/admin/brands" element={<AdminBrandPage />} />
          <Route path="/admin/products" element={<AdminProductPage />} />
          <Route path="/admin/inventory" element={<AdminInventoryPage />} />
          <Route path="/admin/certifications" element={<AdminCertificationPage />} />
          <Route path="/admin/orders" element={<AdminOrderPage />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="/admin/reviews" element={<AdminReviewPage />} />
          <Route path="/admin/users" element={<AdminUserPage />} />
          <Route path="/admin/content" element={<AdminContentPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
