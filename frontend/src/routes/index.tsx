import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import QRScanPage from '../pages/QRScanPage';
import LoginPage from '../pages/LoginPage';
import CartPage from '../pages/CartPage';
import OrderPage from '../pages/OrderPage';
import AdminDashboard from '../pages/admin/Dashboard';
import StoreDashboard from '../pages/store/Dashboard';
import ProtectedRoute from '../components/ProtectedRoute';



const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* 공개 라우트 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<QRScanPage />} />
      
      

      {/* 관리자 전용 라우트 */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={["admin","store_owner"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />


      {/* 점주 전용 라우트 */}
      <Route path="/store/dashboard" element={
        <ProtectedRoute allowedRoles={["store_owner"]}>
          <StoreDashboard />
        </ProtectedRoute>
      } />



      {/* 인증이 필요한 라우트 */}
      <Route path="/cart" element={
        <ProtectedRoute>
          <CartPage />
        </ProtectedRoute>
      } />
      <Route path="/order" element={
        <ProtectedRoute>
          <OrderPage />
        </ProtectedRoute>
      } />


      {/* 기본 리다이렉트 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter; 