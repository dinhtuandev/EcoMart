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
import NotFoundPage from '../pages/NotFoundPage';

import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminCategoryPage from '../pages/admin/AdminCategoryPage';
import AdminBrandPage from '../pages/admin/AdminBrandPage';
import AdminProductPage from '../pages/admin/AdminProductPage';
import AdminCertificationPage from '../pages/admin/AdminCertificationPage';
import AdminOrderPage from '../pages/admin/AdminOrderPage';
import AdminOrderDetailPage from '../pages/admin/AdminOrderDetailPage';
import AdminUserPage from '../pages/admin/AdminUserPage';

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
          <Route path="/admin/certifications" element={<AdminCertificationPage />} />
          <Route path="/admin/orders" element={<AdminOrderPage />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="/admin/users" element={<AdminUserPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
