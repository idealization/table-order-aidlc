import { getDatabase } from '../database';
import { OrderRow, OrderItemRow, OrderStatus } from '../types';

export interface OrderFilter {
  status?: OrderStatus;
  tableId?: string;
}

export class OrderRepository {
  nextOrderNumber(storeId: string): number {
    const row = getDatabase()
      .prepare('SELECT MAX(order_number) as max_num FROM orders WHERE store_id = ?')
      .get(storeId) as { max_num: number | null };
    return (row?.max_num || 0) + 1;
  }

  insertOrder(row: OrderRow): void {
    getDatabase()
      .prepare(`
        INSERT INTO orders (id, store_id, table_id, session_id, order_number, status, total_amount, created_at)
        VALUES (@id, @store_id, @table_id, @session_id, @order_number, @status, @total_amount, @created_at)
      `)
      .run(row);
  }

  insertItems(items: OrderItemRow[]): void {
    const stmt = getDatabase().prepare(`
      INSERT INTO order_items (id, order_id, menu_item_id, menu_item_name, quantity, unit_price)
      VALUES (@id, @order_id, @menu_item_id, @menu_item_name, @quantity, @unit_price)
    `);
    for (const item of items) {
      stmt.run(item);
    }
  }

  findByStore(storeId: string, filter: OrderFilter = {}): OrderRow[] {
    const conditions = ['store_id = ?'];
    const params: unknown[] = [storeId];
    if (filter.status) {
      conditions.push('status = ?');
      params.push(filter.status);
    }
    if (filter.tableId) {
      conditions.push('table_id = ?');
      params.push(filter.tableId);
    }
    return getDatabase()
      .prepare(`
        SELECT id, store_id, table_id, session_id, order_number, status, total_amount, created_at
        FROM orders WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC
      `)
      .all(...params) as OrderRow[];
  }

  findBySession(storeId: string, tableId: string, sessionId: string): OrderRow[] {
    return getDatabase()
      .prepare(`
        SELECT id, store_id, table_id, session_id, order_number, status, total_amount, created_at
        FROM orders WHERE store_id = ? AND table_id = ? AND session_id = ? ORDER BY created_at DESC
      `)
      .all(storeId, tableId, sessionId) as OrderRow[];
  }

  findAllBySession(sessionId: string): OrderRow[] {
    return getDatabase()
      .prepare(`
        SELECT id, store_id, table_id, session_id, order_number, status, total_amount, created_at
        FROM orders WHERE session_id = ?
      `)
      .all(sessionId) as OrderRow[];
  }

  findItems(orderId: string): OrderItemRow[] {
    return getDatabase()
      .prepare('SELECT id, order_id, menu_item_id, menu_item_name, quantity, unit_price FROM order_items WHERE order_id = ?')
      .all(orderId) as OrderItemRow[];
  }

  findById(storeId: string, orderId: string): OrderRow | undefined {
    return getDatabase()
      .prepare(`
        SELECT id, store_id, table_id, session_id, order_number, status, total_amount, created_at
        FROM orders WHERE id = ? AND store_id = ?
      `)
      .get(orderId, storeId) as OrderRow | undefined;
  }

  updateStatus(storeId: string, orderId: string, status: OrderStatus): number {
    return getDatabase()
      .prepare('UPDATE orders SET status = ? WHERE id = ? AND store_id = ?')
      .run(status, orderId, storeId).changes;
  }

  delete(storeId: string, orderId: string): number {
    return getDatabase()
      .prepare('DELETE FROM orders WHERE id = ? AND store_id = ?')
      .run(orderId, storeId).changes;
  }

  deleteBySession(sessionId: string): void {
    const db = getDatabase();
    db.prepare('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE session_id = ?)').run(sessionId);
    db.prepare('DELETE FROM orders WHERE session_id = ?').run(sessionId);
  }
}
