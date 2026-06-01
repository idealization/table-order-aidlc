import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Order } from '../../types';
import { orderApi } from '../../api/orderApi';
import './CustomerOrders.css';

export default function CustomerOrders() {
  const { storeId, tableId } = useParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId || !tableId) return;
    const sessionId = localStorage.getItem(`session-${storeId}-${tableId}`) || 'session-001';

    orderApi.fetchTableOrders(storeId, tableId, sessionId)
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load orders:', err);
        setLoading(false);
      });
  }, [storeId, tableId]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '대기중';
      case 'preparing': return '준비중';
      case 'completed': return '완료';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'preparing': return 'status-preparing';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">주문 내역을 불러오는 중...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="empty-orders">
        <div className="empty-icon">📋</div>
        <h2>주문 내역이 없습니다</h2>
        <p>메뉴에서 음식을 주문해보세요</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1 className="orders-title">주문 내역</h1>

      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <span className="order-num">주문 #{order.order_number}</span>
                <span className="order-time">{formatTime(order.created_at)}</span>
              </div>
              <span className={`order-status ${getStatusClass(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div className="order-items">
              {order.items.map(item => (
                <div key={item.id} className="order-item-row">
                  <span className="item-name">{item.menu_item_name}</span>
                  <span className="item-qty">x{item.quantity}</span>
                  <span className="item-price">{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="order-total">
              <span>합계</span>
              <span className="total-amount">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
