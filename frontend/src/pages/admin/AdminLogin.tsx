import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [storeId, setStoreId] = useState('store-001');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || !username || !password) {
      setError('모든 항목을 입력해주세요');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(storeId, username, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">🍽️ 테이블오더 관리자</h1>
        <p className="login-subtitle">매장 관리 시스템에 로그인하세요</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-field">
            <span>매장 식별자</span>
            <input
              type="text"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              data-testid="login-store-id"
              autoComplete="off"
            />
          </label>
          <label className="login-field">
            <span>사용자명</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              data-testid="login-username"
              autoComplete="username"
            />
          </label>
          <label className="login-field">
            <span>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="login-password"
              autoComplete="current-password"
            />
          </label>
          {error && <div className="login-error" data-testid="login-error">{error}</div>}
          <button type="submit" className="login-submit" disabled={submitting} data-testid="login-submit">
            {submitting ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <p className="login-hint">기본 계정: admin / admin1234</p>
      </div>
    </div>
  );
}
