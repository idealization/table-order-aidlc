import { apiRequest } from './client';
import { HistoryEntry } from '../types';

export const historyApi = {
  fetchHistory(storeId: string, token: string, filter?: { tableId?: string; date?: string }): Promise<HistoryEntry[]> {
    const params = new URLSearchParams();
    if (filter?.tableId) params.set('tableId', filter.tableId);
    if (filter?.date) params.set('date', filter.date);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<{ history: HistoryEntry[] }>(`/stores/${storeId}/history${query}`, { token }).then((r) => r.history);
  },
};
