import { apiRequest } from './client';
import { TableWithSession } from '../types';

export interface TableLoginResult {
  success: boolean;
  tableNumber: number;
  sessionId: string;
  storeId: string;
}

export const tableApi = {
  login(storeId: string, tableId: string, password: string): Promise<TableLoginResult> {
    return apiRequest<TableLoginResult>(`/stores/${storeId}/tables/${tableId}/login`, { method: 'POST', body: { password } });
  },

  fetchTables(storeId: string, token: string): Promise<TableWithSession[]> {
    return apiRequest<{ tables: TableWithSession[] }>(`/stores/${storeId}/tables`, { token }).then((r) => r.tables);
  },

  setupTable(storeId: string, tableNumber: number, password: string, token: string): Promise<TableWithSession> {
    return apiRequest<{ table: TableWithSession }>(`/stores/${storeId}/tables/setup`, {
      method: 'POST',
      body: { tableNumber, password },
      token,
    }).then((r) => r.table);
  },

  completeSession(storeId: string, tableId: string, token: string): Promise<void> {
    return apiRequest<void>(`/stores/${storeId}/tables/${tableId}/complete`, { method: 'POST', token });
  },
};
