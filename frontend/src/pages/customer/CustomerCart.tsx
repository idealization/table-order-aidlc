import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartContext } from '../../context/CartContext';
import { orderApi } from '../../api/orderApi';
import './CustomerCart.css';

export default function CustomerCart() {
  const { storeId, tableId } = useParams();
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCartContext();
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const handleOrder = async () => {
    if (items.length === 0 || !storeId || !tableId) return;

    setOrdering(true);
    setError(null);

    try {
      const sessionId = localStorage.getItem(`session-${storeId}-${tableId}`) || 'session-001';
      const payload = orderApi.cartToPayload(tableId, sessionId, items);
      const order = await orderApi.createOrder(storeId, payload);

      setOrderSuccess(order.order_number);
      clearCart();

      // 5초 후 메뉴 화면으로 리다이렉트
      setTimeout(() => {
        navigate(`/store/${storeId}/table/${tableId}/menu`);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문 처리 중 오류가 발생했습니다');
    } finally {
      setOrdering(false);
    }
  };

  if (orderSuccess !== null) {
    return (
      <div className="order-success">
        <div className="success-icon">✅</div>
        <h2>주문이 완료되었습니다!</h2>
        <p className="order-number">주문번호: #{orderSuccess}</p>
        <p className="redirect-msg">5초 후 메뉴 화면으로 이동합니다...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-icon">🛒</div>
        <h2>장바구니가 비어있습니다</h2>
        <p>메뉴에서 원하는 음식을 추가해보세요</p>
        <button
          className="go-menu-btn"
          onClick={() => navigate(`/store/${storeId}/table/${tableId}/menu`)}
        >
          메뉴 보기
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">장바구니</h1>

      <div className="cart-items">
        {items.map(item => (
          <div key={item.menuItemId} className="cart-item">
            <div className="cart-item-info">
              <h3 className="cart-item-name">{item.menuItemName}</h3>
              <p className="cart-item-price">{formatPrice(item.unitPrice)}</p>
            </div>
            <div className="cart-item-controls">
              <button
                className="qty-btn"
                onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                aria-label="수량 감소"
              >
                −
              </button>
              <span className="qty-value">{item.quantity}</span>
              <button
                className="qty-btn"
                onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                aria-label="수량 증가"
              >
                +
              </button>
              <button
                className="remove-btn"
                onClick={() => removeItem(item.menuItemId)}
                aria-label={`${item.menuItemName} 삭제`}
              >
                🗑️
              </button>
            </div>
            <div className="cart-item-subtotal">
              {formatPrice(item.unitPrice * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="cart-footer">
        <div className="cart-total">
          <span>총 금액</span>
          <span className="total-price">{formatPrice(totalAmount)}</span>
        </div>
        <button
          className="order-btn"
          onClick={handleOrder}
          disabled={ordering}
        >
          {ordering ? '주문 중...' : `주문하기 (${formatPrice(totalAmount)})`}
        </button>
      </div>
    </div>
  );
}
