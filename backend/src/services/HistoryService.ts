import { OrderHistoryRepository, HistoryFilter } from '../repositories/OrderHistoryRepository';
import { OrderItemRow } from '../types';

export interface HistoryEntry {
  id: string;
  table_id: string;
  session_id: string;
  order_number: number;
  status: string;
  total_amount: number;
  items: Pick<OrderItemRow, 'menu_item_name' | 'quantity' | 'unit_price'>[];
  created_at: string;
  archived_at: string;
}

export class HistoryService {
  constructor(private history = new OrderHistoryRepository()) {}

  getHistory(storeId: string, filter: HistoryFilter = {}): HistoryEntry[] {
    const rows = this.history.findByStore(storeId, filter);
    return rows.map((row) => ({
      id: row.id,
      table_id: row.table_id,
      session_id: row.session_id,
      order_number: row.order_number,
      status: row.status,
      total_amount: row.total_amount,
      items: JSON.parse(row.items_json),
      created_at: row.created_at,
      archived_at: row.archived_at,
    }));
  }
}
