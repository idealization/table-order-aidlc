import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../api/orderApi';
import { Order } from '../../types';
import './OrderDetailModal.css';

interface Props {
  order: Order;
  onClose: () => void;
  onChanged: () => void;
}

const STATUSES: { value: 'pending' | 'preparing' | 'completed'; label: string }[] = [
  { value: 'pending', label: '대기중' },
  { value: 'preparing', label: '준비중' },
  { value: 'completed', label: '완료' },
];

export default function OrderDetailModal({ order, onClose, onChanged }: Props) {
  const { storeId, token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: number) => price.toLocaleString('ko-KR') + '원';

  const handleStatusChange = async (status: 'pending' | 'preparing' | 'completed') => {
    if (!storeId || !token) return;
    setBusy(true);
    setError(null);
    try {
      await orderApi.updateStatus(storeId, order.id, status, token);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : '상태 변경 실패');
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!storeId || !token) return;
    setBusy(true);
    setError(null);
    try {
      await orderApi.deleteOrder(storeId, order.id, token);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 실패');
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} data-testid="order-detail-modal">
        <div className="modal-header">
          <h2>주문 #{order.order_number}</h2>
          <button className="modal-close" onClick={onClose} data-testid="modal-close">✕</button>
        </div>

        <div className="modal-body">
          <table className="detail-items">
            <thead>
              <tr><th>메뉴</th><th>수량</th><th>금액</th></tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.menu_item_name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.unit_price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="detail-total">
            <span>총 금액</span>
            <span className="detail-total-amount">{formatPrice(order.total_amount)}</span>
          </div>

          <div className="status-section">
            <span className="status-label">주문 상태</span>
            <div className="status-buttons">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  className={`status-btn ${order.status === s.value ? 'active' : ''}`}
                  onClick={() => handleStatusChange(s.value)}
                  disabled={busy}
                  data-testid={`status-${s.value}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="modal-error">{error}</div>}
        </div>

        <div className="modal-footer">
          {!confirmDelete ? (
            <button className="delete-btn" onClick={() => setConfirmDelete(true)} disabled={busy} data-testid="delete-order">
              주문 삭제
            </button>
          ) : (
            <div className="confirm-delete">
              <span>정말 삭제하시겠습니까?</span>
              <button className="confirm-yes" onClick={handleDelete} disabled={busy} data-testid="confirm-delete">삭제</button>
              <button className="confirm-no" onClick={() => setConfirmDelete(false)} disabled={busy}>취소</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
