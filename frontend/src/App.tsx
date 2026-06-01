import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerMenu from './pages/customer/CustomerMenu';
import CustomerCart from './pages/customer/CustomerCart';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import TableManagement from './pages/admin/TableManagement';
import MenuManagement from './pages/admin/MenuManagement';
import OrderHistoryView from './pages/admin/OrderHistoryView';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Routes>
      {/* 고객용 라우트 */}
      <Route path="/store/:storeId/table/:tableId" element={<CustomerLayout />}>
        <Route index element={<Navigate to="menu" replace />} />
        <Route path="menu" element={<CustomerMenu />} />
        <Route path="cart" element={<CustomerCart />} />
        <Route path="orders" element={<CustomerOrders />} />
      </Route>

      {/* 관리자용 라우트 */}
      <Route
        path="/admin/*"
        element={
          <AuthProvider>
            <AdminRoutes />
          </AuthProvider>
        }
      />

      {/* 기본 리다이렉트 (테스트용) */}
      <Route path="/" element={<Navigate to="/store/store-001/table/table-001/menu" replace />} />
    </Routes>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tables" element={<TableManagement />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="history" element={<OrderHistoryView />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
