import { getDatabase } from '../database';
import { StoreRow } from '../types';

export class StoreRepository {
  findById(storeId: string): StoreRow | undefined {
    return getDatabase()
      .prepare('SELECT id, name, created_at FROM stores WHERE id = ?')
      .get(storeId) as StoreRow | undefined;
  }

  insert(id: string, name: string): void {
    getDatabase()
      .prepare('INSERT OR IGNORE INTO stores (id, name) VALUES (?, ?)')
      .run(id, name);
  }
}
