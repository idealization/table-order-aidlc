import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrderStream } from '../../hooks/useOrderStream';
import { orderApi } from '../../api/orderApi';
import { tableApi } from '../../api/tableApi';
import { Order, TableWithSession } from '../../types';
import OrderDetailModal from './OrderDetailModal';
import './AdminDashboard.css';

interface TableGroup {
  tableId: string;
  tableNumber: number;
  orders: Order[];
  totalAmount: number;
}

const PREVIEW_COUNT = 5; // 최신 주문 미리보기 개수 (BR-VIEW-2)

export default function AdminDashboard() {
  const { storeId, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<TableWithSession[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [highlightedTables, setHighlightedTables] = useState<Set<string>>(new Set());
  const [tableFilter, setTableFilter] = useState<string>('all');
  const { latestOrder, connected, eventCount } = useOrderStream(storeId);

  const loadData = useCallback(async () => {
    if (!storeId || !token) return;
    try {
      const [ordersData, tablesData] = await Promise.all([
        orderApi.fetchOrders(storeId, token),
        tableApi.fetchTables(storeId, token),
      ]);
      setOrders(ordersData);
      setTables(tablesData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, [storeId, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 신규 주문(SSE) 도착 시 갱신 + 해당 테이블 강조
  useEffect(() => {
    if (latestOrder && eventCount > 0) {
      loadData();
      const tid = latestOrder.table_id;
      if (tid) {
        setHighlightedTables((prev) => new Set(prev).add(tid));
        setTimeout(() => {
          setHighlightedTables((prev) => {
            const next = new Set(prev);
            next.delete(tid);
            return next;
          });
        }, 4000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventCount]);

  const formatPrice = (price: number) => price.toLocaleString('ko-KR') + '원';

  // 테이블별 주문 그룹화
  const tableGroups: TableGroup[] = tables
    .filter((t) => tableFilter === 'all' || t.id === tableFilter)
    .map((table) => {
      const tableOrders = orders.filter((o) => o.table_id === table.id);
      return {
        tableId: table.id,
        tableNumber: table.table_number,
        orders: tableOrders,
        totalAmount: tableOrders.reduce((sum, o) => sum + o.total_amount, 0),
      };
    });

  const statusLabel = (status: string) =>
    status === 'pending' ? '대기중' : status === 'preparing' ? '준비중' : '완료';

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>실시간 주문 모니터링</h1>
        <div className="dashboard-controls">
          <span className={`sse-status ${connected ? 'connected' : 'disconnected'}`} data-testid="sse-status">
            {connected ? '🟢 실시간 연결됨' : '🔴 연결 끊김'}
          </span>
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="table-filter"
            data-testid="table-filter"
          >
            <option value="all">전체 테이블</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>{t.table_number}번 테이블</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-grid">
        {tableGroups.map((group) => (
          <div
            key={group.tableId}
            className={`table-card ${highlightedTables.has(group.tableId) ? 'highlighted' : ''}`}
            data-testid={`table-card-${group.tableNumber}`}
          >
            <div className="table-card-header">
              <span className="table-number">{group.tableNumber}번 테이블</span>
              <span className="table-total">{formatPrice(group.totalAmount)}</span>
            </div>
            {group.orders.length === 0 ? (
              <div className="table-empty">주문 없음</div>
            ) : (
              <div className="table-orders">
                {group.orders.slice(0, PREVIEW_COUNT).map((order) => (
                  <button
                    key={order.id}
                    className={`order-preview status-${order.status}`}
                    onClick={() => setSelectedOrder(order)}
                    data-testid={`order-preview-${order.order_number}`}
                  >
                    <span className="op-number">#{order.order_number}</span>
                    <span className="op-summary">
                      {order.items.map((i) => `${i.menu_item_name}×${i.quantity}`).join(', ')}
                    </span>
                    <span className="op-status">{statusLabel(order.status)}</span>
                  </button>
                ))}
                {group.orders.length > PREVIEW_COUNT && (
                  <span className="more-orders">+{group.orders.length - PREVIEW_COUNT}건 더</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onChanged={() => {
            loadData();
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
