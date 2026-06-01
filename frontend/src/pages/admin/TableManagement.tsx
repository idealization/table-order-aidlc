import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tableApi } from '../../api/tableApi';
import { TableWithSession } from '../../types';
import './TableManagement.css';

export default function TableManagement() {
  const { storeId, token } = useAuth();
  const [tables, setTables] = useState<TableWithSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmComplete, setConfirmComplete] = useState<string | null>(null);

  const loadTables = useCallback(async () => {
    if (!storeId || !token) return;
    try {
      const data = await tableApi.fetchTables(storeId, token);
      setTables(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load tables:', err);
      setLoading(false);
    }
  }, [storeId, token]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || !token) return;
    const num = parseInt(tableNumber, 10);
    if (!num || num < 1 || !password) {
      setError('테이블 번호와 비밀번호를 입력해주세요');
      return;
    }
    setError(null);
    try {
      await tableApi.setupTable(storeId, num, password, token);
      setMessage(`${num}번 테이블이 설정되었습니다`);
      setTableNumber('');
      setPassword('');
      loadTables();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '테이블 설정 실패');
    }
  };

  const handleComplete = async (tableId: string) => {
    if (!storeId || !token) return;
    try {
      await tableApi.completeSession(storeId, tableId, token);
      setMessage('테이블 이용이 완료 처리되었습니다');
      setConfirmComplete(null);
      loadTables();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '이용 완료 처리 실패');
      setConfirmComplete(null);
    }
  };

  if (loading) return <div className="loading">테이블 정보를 불러오는 중...</div>;

  return (
    <div className="table-mgmt">
      <h1>테이블 관리</h1>

      {message && <div className="mgmt-message" data-testid="mgmt-message">{message}</div>}
      {error && <div className="mgmt-error">{error}</div>}

      <section className="setup-section">
        <h2>테이블 초기 설정</h2>
        <form onSubmit={handleSetup} className="setup-form">
          <input
            type="number"
            placeholder="테이블 번호"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            data-testid="setup-table-number"
            min="1"
          />
          <input
            type="text"
            placeholder="테이블 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="setup-table-password"
          />
          <button type="submit" data-testid="setup-submit">설정 / 활성화</button>
        </form>
      </section>

      <section className="tables-section">
        <h2>테이블 목록</h2>
        <div className="tables-grid">
          {tables.map((table) => (
            <div key={table.id} className="mgmt-card" data-testid={`mgmt-table-${table.table_number}`}>
              <div className="mgmt-card-header">
                <span className="mgmt-table-num">{table.table_number}번</span>
                <span className={`mgmt-status ${table.is_active ? 'active' : 'inactive'}`}>
                  {table.is_active ? '사용중' : '비어있음'}
                </span>
              </div>
              {table.is_active ? (
                confirmComplete === table.id ? (
                  <div className="confirm-row">
                    <span>이용 완료?</span>
                    <button className="confirm-yes" onClick={() => handleComplete(table.id)} data-testid={`confirm-complete-${table.table_number}`}>확인</button>
                    <button className="confirm-no" onClick={() => setConfirmComplete(null)}>취소</button>
                  </div>
                ) : (
                  <button
                    className="complete-btn"
                    onClick={() => setConfirmComplete(table.id)}
                    data-testid={`complete-${table.table_number}`}
                  >
                    이용 완료
                  </button>
                )
              ) : (
                <div className="mgmt-idle">대기 중</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
