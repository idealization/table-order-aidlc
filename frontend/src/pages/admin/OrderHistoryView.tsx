import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { historyApi } from '../../api/historyApi';
import { tableApi } from '../../api/tableApi';
import { HistoryEntry, TableWithSession } from '../../types';
import './OrderHistoryView.css';

export default function OrderHistoryView() {
  const { storeId, token } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [tables, setTables] = useState<TableWithSession[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    if (!storeId || !token) return;
    setLoading(true);
    try {
      const data = await historyApi.fetchHistory(storeId, token, {
        date: dateFilter || undefined,
        tableId: tableFilter || undefined,
      });
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }, [storeId, token, dateFilter, tableFilter]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!storeId || !token) return;
    tableApi.fetchTables(storeId, token).then(setTables).catch(console.error);
  }, [storeId, token]);

  const formatPrice = (price: number) => price.toLocaleString('ko-KR') + '원';
  const formatDateTime = (s: string) => new Date(s).toLocaleString('ko-KR');

  const tableNumberOf = (tableId: string) =>
    tables.find((t) => t.id === tableId)?.table_number ?? '?';

  return (
    <div className="history-view">
      <h1>과거 주문 내역</h1>

      <div className="history-filters">
        <label>
          날짜
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            data-testid="history-date"
          />
        </label>
        <label>
          테이블
          <select value={tableFilter} onChange={(e) => setTableFilter(e.target.value)} data-testid="history-table">
            <option value="">전체</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>{t.table_number}번</option>
            ))}
          </select>
        </label>
        {(dateFilter || tableFilter) && (
          <button className="clear-filter" onClick={() => { setDateFilter(''); setTableFilter(''); }}>
            필터 초기화
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">불러오는 중...</div>
      ) : history.length === 0 ? (
        <div className="history-empty">과거 주문 내역이 없습니다</div>
      ) : (
        <div className="history-list">
          {history.map((entry) => (
            <div key={entry.id} className="history-card" data-testid={`history-${entry.order_number}`}>
              <div className="history-card-header">
                <span className="hc-table">{tableNumberOf(entry.table_id)}번 테이블</span>
                <span className="hc-number">주문 #{entry.order_number}</span>
              </div>
              <div className="history-items">
                {entry.items.map((item, idx) => (
                  <div key={idx} className="hc-item">
                    <span>{item.menu_item_name} × {item.quantity}</span>
                    <span>{formatPrice(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="history-footer">
                <span className="hc-total">{formatPrice(entry.total_amount)}</span>
              </div>
              <div className="history-meta">
                <span>주문: {formatDateTime(entry.created_at)}</span>
                <span>완료: {formatDateTime(entry.archived_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
