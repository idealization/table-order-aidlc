import { Outlet, NavLink, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { CartProvider, useCartContext } from '../context/CartContext';
import { tableApi } from '../api/tableApi';
import './CustomerLayout.css';

function BottomNav() {
  const { storeId, tableId } = useParams();
  const { totalItems } = useCartContext();
  const basePath = `/store/${storeId}/table/${tableId}`;

  return (
    <nav className="bottom-nav" aria-label="메인 네비게이션">
      <NavLink to={`${basePath}/menu`} className="nav-item" data-testid="nav-menu">
        <span className="nav-icon">🍽️</span>
        <span className="nav-label">메뉴</span>
      </NavLink>
      <NavLink to={`${basePath}/cart`} className="nav-item" data-testid="nav-cart">
        <span className="nav-icon">🛒</span>
        <span className="nav-label">장바구니</span>
        {totalItems > 0 && <span className="nav-badge">{totalItems}</span>}
      </NavLink>
      <NavLink to={`${basePath}/orders`} className="nav-item" data-testid="nav-orders">
        <span className="nav-icon">📋</span>
        <span className="nav-label">주문내역</span>
      </NavLink>
    </nav>
  );
}

// 테이블 자동 로그인: 저장된 비밀번호(초기 설정값)로 세션 확보 (US-C1)
function useTableAutoLogin(storeId?: string, tableId?: string) {
  useEffect(() => {
    if (!storeId || !tableId) return;
    const pwKey = `table-pw-${storeId}-${tableId}`;
    const sessionKey = `session-${storeId}-${tableId}`;
    const password = localStorage.getItem(pwKey) || '1234'; // 시드 기본 비밀번호

    tableApi.login(storeId, tableId, password)
      .then((result) => {
        localStorage.setItem(sessionKey, result.sessionId);
        localStorage.setItem(pwKey, password);
      })
      .catch((err) => {
        console.warn('Table auto-login failed:', err.message);
      });
  }, [storeId, tableId]);
}

export default function CustomerLayout() {
  const { storeId, tableId } = useParams();
  useTableAutoLogin(storeId, tableId);

  return (
    <CartProvider>
      <div className="customer-layout">
        <main className="customer-content">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </CartProvider>
  );
}
