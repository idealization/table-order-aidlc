import { getDatabase } from '../database';
import { TableRow } from '../types';

export interface TableWithSession extends TableRow {
  session_id: string | null;
  is_active: number | null;
  session_started: string | null;
}

export class TableRepository {
  findById(storeId: string, tableId: string): TableRow | undefined {
    return getDatabase()
      .prepare('SELECT id, store_id, table_number, password, created_at FROM tables WHERE id = ? AND store_id = ?')
      .get(tableId, storeId) as TableRow | undefined;
  }

  findByNumber(storeId: string, tableNumber: number): TableRow | undefined {
    return getDatabase()
      .prepare('SELECT id, store_id, table_number, password, created_at FROM tables WHERE store_id = ? AND table_number = ?')
      .get(storeId, tableNumber) as TableRow | undefined;
  }

  findByStoreWithSession(storeId: string): TableWithSession[] {
    return getDatabase()
      .prepare(`
        SELECT t.id, t.store_id, t.table_number, t.password, t.created_at,
               ts.id as session_id, ts.is_active, ts.started_at as session_started
        FROM tables t
        LEFT JOIN table_sessions ts ON t.id = ts.table_id AND ts.is_active = 1
        WHERE t.store_id = ?
        ORDER BY t.table_number ASC
      `)
      .all(storeId) as TableWithSession[];
  }

  insert(id: string, storeId: string, tableNumber: number, password: string): void {
    getDatabase()
      .prepare('INSERT INTO tables (id, store_id, table_number, password) VALUES (?, ?, ?, ?)')
      .run(id, storeId, tableNumber, password);
  }

  updatePassword(storeId: string, tableId: string, password: string): number {
    return getDatabase()
      .prepare('UPDATE tables SET password = ? WHERE id = ? AND store_id = ?')
      .run(password, tableId, storeId).changes;
  }
}
