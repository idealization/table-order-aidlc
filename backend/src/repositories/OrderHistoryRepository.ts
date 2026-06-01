import { getDatabase } from '../database';
import { OrderHistoryRow } from '../types';

export interface HistoryFilter {
  tableId?: string;
  date?: string; // YYYY-MM-DD
}

export class OrderHistoryRepository {
  insert(row: Omit<OrderHistoryRow, 'archived_at'>): void {
    getDatabase()
      .prepare(`
        INSERT INTO order_history (id, store_id, table_id, session_id, order_number, status, total_amount, items_json, created_at)
        VALUES (@id, @store_id, @table_id, @session_id, @order_number, @status, @total_amount, @items_json, @created_at)
      `)
      .run(row);
  }

  findByStore(storeId: string, filter: HistoryFilter = {}): OrderHistoryRow[] {
    const conditions = ['store_id = ?'];
    const params: unknown[] = [storeId];
    if (filter.tableId) {
      conditions.push('table_id = ?');
      params.push(filter.tableId);
    }
    if (filter.date) {
      conditions.push("date(created_at) = ?");
      params.push(filter.date);
    }
    return getDatabase()
      .prepare(`
        SELECT id, store_id, table_id, session_id, order_number, status, total_amount, items_json, created_at, archived_at
        FROM order_history WHERE ${conditions.join(' AND ')} ORDER BY archived_at DESC, created_at DESC
      `)
      .all(...params) as OrderHistoryRow[];
  }
}
