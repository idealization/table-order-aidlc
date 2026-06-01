import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

export default function AdminLayout() {
  const { logout, storeId } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-brand">
          <span className="admin-logo">🍽️ 테이블오더 관리자</span>
          <span className="admin-store">{storeId}</span>
        </div>
        <nav className="admin-nav" aria-label="관리자 네비게이션">
          <NavLink to="/admin/dashboard" className="admin-nav-item" data-testid="nav-dashboard">대시보드</NavLink>
          <NavLink to="/admin/tables" className="admin-nav-item" data-testid="nav-tables">테이블 관리</NavLink>
          <NavLink to="/admin/menu" className="admin-nav-item" data-testid="nav-menu-mgmt">메뉴 관리</NavLink>
          <NavLink to="/admin/history" className="admin-nav-item" data-testid="nav-history">과거 내역</NavLink>
        </nav>
        <button className="admin-logout" onClick={handleLogout} data-testid="admin-logout">로그아웃</button>
      </header>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
