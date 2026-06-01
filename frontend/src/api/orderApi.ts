import { apiRequest } from './client';
import { Order, CartItem } from '../types';

export interface CreateOrderPayload {
  tableId: string;
  sessionId: string;
  items: { menuItemId: string; menuItemName: string; quantity: number; unitPrice: number }[];
}

export const orderApi = {
  createOrder(storeId: string, payload: CreateOrderPayload): Promise<Order> {
    return apiRequest<{ order: Order }>(`/stores/${storeId}/orders`, { method: 'POST', body: payload }).then((r) => r.order);
  },

  fetchTableOrders(storeId: string, tableId: string, sessionId: string): Promise<Order[]> {
    return apiRequest<{ orders: Order[] }>(`/stores/${storeId}/tables/${tableId}/orders?sessionId=${sessionId}`).then((r) => r.orders);
  },

  fetchOrders(storeId: string, token: string, filter?: { status?: string; tableId?: string }): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filter?.status) params.set('status', filter.status);
    if (filter?.tableId) params.set('tableId', filter.tableId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<{ orders: Order[] }>(`/stores/${storeId}/orders${query}`, { token }).then((r) => r.orders);
  },

  updateStatus(storeId: string, orderId: string, status: string, token: string): Promise<void> {
    return apiRequest<void>(`/stores/${storeId}/orders/${orderId}/status`, { method: 'PATCH', body: { status }, token });
  },

  deleteOrder(storeId: string, orderId: string, token: string): Promise<void> {
    return apiRequest<void>(`/stores/${storeId}/orders/${orderId}`, { method: 'DELETE', token });
  },

  cartToPayload(tableId: string, sessionId: string, items: CartItem[]): CreateOrderPayload {
    return {
      tableId,
      sessionId,
      items: items.map((item) => ({
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };
  },
};
