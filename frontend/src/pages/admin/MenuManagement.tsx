import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { menuApi } from '../../api/menuApi';
import { MenuCategory, MenuItem, MenuItemInput } from '../../types';
import './MenuManagement.css';

interface FormState {
  id: string | null;
  categoryId: string;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
}

const emptyForm: FormState = {
  id: null,
  categoryId: '',
  name: '',
  price: '',
  description: '',
  imageUrl: '',
  isAvailable: true,
};

export default function MenuManagement() {
  const { storeId, token } = useAuth();
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadMenu = useCallback(async () => {
    if (!storeId || !token) return;
    try {
      const data = await menuApi.fetchAdminMenu(storeId, token);
      setMenu(data);
      if (data.length > 0 && !form.categoryId) {
        setForm((prev) => ({ ...prev, categoryId: data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, token]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const resetForm = () => setForm({ ...emptyForm, categoryId: menu[0]?.id || '' });

  const startEdit = (item: MenuItem) => {
    setForm({
      id: item.id,
      categoryId: item.category_id,
      name: item.name,
      price: String(item.price),
      description: item.description || '',
      imageUrl: item.image_url || '',
      isAvailable: item.is_available === 1,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storeId || !token) return;
    setUploading(true);
    setError(null);
    try {
      const url = await menuApi.uploadImage(storeId, file, token);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || !token) return;
    const price = parseInt(form.price, 10);
    if (!form.name || !form.categoryId || isNaN(price) || price < 0) {
      setError('메뉴명, 카테고리, 0 이상의 가격을 입력해주세요');
      return;
    }
    setError(null);
    const input: MenuItemInput = {
      categoryId: form.categoryId,
      name: form.name,
      price,
      description: form.description || null,
      imageUrl: form.imageUrl || null,
      isAvailable: form.isAvailable,
    };
    try {
      if (form.id) {
        await menuApi.updateMenuItem(storeId, form.id, input, token);
      } else {
        await menuApi.createMenuItem(storeId, input, token);
      }
      resetForm();
      loadMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!storeId || !token) return;
    if (!window.confirm('이 메뉴를 삭제하시겠습니까?')) return;
    try {
      await menuApi.deleteMenuItem(storeId, itemId, token);
      loadMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 실패');
    }
  };

  const formatPrice = (price: number) => price.toLocaleString('ko-KR') + '원';

  return (
    <div className="menu-mgmt">
      <h1>메뉴 관리</h1>
      {error && <div className="mgmt-error">{error}</div>}

      <section className="menu-form-section">
        <h2>{form.id ? '메뉴 수정' : '메뉴 등록'}</h2>
        <form onSubmit={handleSubmit} className="menu-form">
          <div className="form-row">
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              data-testid="menu-category"
            >
              {menu.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="메뉴명"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              data-testid="menu-name"
            />
            <input
              type="number"
              placeholder="가격"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              data-testid="menu-price"
              min="0"
            />
          </div>
          <textarea
            placeholder="메뉴 설명"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            data-testid="menu-description"
            rows={2}
          />
          <div className="form-row">
            <input type="file" accept="image/*" onChange={handleUpload} data-testid="menu-image" />
            {uploading && <span className="uploading">업로드 중...</span>}
            {form.imageUrl && <img src={form.imageUrl} alt="미리보기" className="image-preview" />}
          </div>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
              data-testid="menu-available"
            />
            <span>판매 가능</span>
          </label>
          <div className="form-actions">
            <button type="submit" data-testid="menu-submit">{form.id ? '수정' : '등록'}</button>
            {form.id && <button type="button" onClick={resetForm} className="cancel-btn">취소</button>}
          </div>
        </form>
      </section>

      <section className="menu-list-section">
        {menu.map((category) => (
          <div key={category.id} className="menu-cat-block">
            <h3>{category.name}</h3>
            <div className="menu-items-list">
              {category.items.map((item) => (
                <div key={item.id} className="menu-item-row" data-testid={`menu-row-${item.id}`}>
                  {item.image_url && <img src={item.image_url} alt={item.name} className="row-thumb" />}
                  <div className="row-info">
                    <span className="row-name">
                      {item.name}
                      {item.is_available === 0 && <span className="unavailable-tag">판매중지</span>}
                    </span>
                    <span className="row-price">{formatPrice(item.price)}</span>
                  </div>
                  <div className="row-actions">
                    <button onClick={() => startEdit(item)} data-testid={`edit-${item.id}`}>수정</button>
                    <button className="row-delete" onClick={() => handleDelete(item.id)} data-testid={`delete-${item.id}`}>삭제</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
