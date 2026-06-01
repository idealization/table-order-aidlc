import { apiRequest } from './client';
import { MenuCategory, MenuItem, Category, MenuItemInput } from '../types';

export const menuApi = {
  fetchMenu(storeId: string): Promise<MenuCategory[]> {
    return apiRequest<{ menu: MenuCategory[] }>(`/stores/${storeId}/menu`).then((r) => r.menu);
  },

  fetchCategories(storeId: string): Promise<Category[]> {
    return apiRequest<{ categories: Category[] }>(`/stores/${storeId}/categories`).then((r) => r.categories);
  },

  // 관리자: 판매 불가 포함 전체 메뉴
  fetchAdminMenu(storeId: string, token: string): Promise<MenuCategory[]> {
    return apiRequest<{ menu: MenuCategory[] }>(`/stores/${storeId}/admin/menu`, { token }).then((r) => r.menu);
  },

  createMenuItem(storeId: string, input: MenuItemInput, token: string): Promise<MenuItem> {
    return apiRequest<{ item: MenuItem }>(`/stores/${storeId}/menu`, { method: 'POST', body: input, token }).then((r) => r.item);
  },

  updateMenuItem(storeId: string, itemId: string, input: Partial<MenuItemInput>, token: string): Promise<MenuItem> {
    return apiRequest<{ item: MenuItem }>(`/stores/${storeId}/menu/${itemId}`, { method: 'PUT', body: input, token }).then((r) => r.item);
  },

  deleteMenuItem(storeId: string, itemId: string, token: string): Promise<void> {
    return apiRequest<void>(`/stores/${storeId}/menu/${itemId}`, { method: 'DELETE', token });
  },

  createCategory(storeId: string, name: string, sortOrder: number, token: string): Promise<Category> {
    return apiRequest<{ category: Category }>(`/stores/${storeId}/categories`, { method: 'POST', body: { name, sortOrder }, token }).then((r) => r.category);
  },

  async uploadImage(storeId: string, file: File, token: string): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`/api/stores/${storeId}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      throw new Error('Image upload failed');
    }
    const data = await res.json();
    return data.url as string;
  },
};
