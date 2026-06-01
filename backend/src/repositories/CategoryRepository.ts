import { getDatabase } from '../database';
import { CategoryRow } from '../types';

export class CategoryRepository {
  findByStore(storeId: string): CategoryRow[] {
    return getDatabase()
      .prepare('SELECT id, store_id, name, sort_order, created_at FROM categories WHERE store_id = ? ORDER BY sort_order ASC')
      .all(storeId) as CategoryRow[];
  }

  findById(storeId: string, categoryId: string): CategoryRow | undefined {
    return getDatabase()
      .prepare('SELECT id, store_id, name, sort_order, created_at FROM categories WHERE id = ? AND store_id = ?')
      .get(categoryId, storeId) as CategoryRow | undefined;
  }

  insert(id: string, storeId: string, name: string, sortOrder: number): void {
    getDatabase()
      .prepare('INSERT INTO categories (id, store_id, name, sort_order) VALUES (?, ?, ?, ?)')
      .run(id, storeId, name, sortOrder);
  }

  update(storeId: string, categoryId: string, name: string, sortOrder: number): number {
    return getDatabase()
      .prepare('UPDATE categories SET name = ?, sort_order = ? WHERE id = ? AND store_id = ?')
      .run(name, sortOrder, categoryId, storeId).changes;
  }

  delete(storeId: string, categoryId: string): number {
    return getDatabase()
      .prepare('DELETE FROM categories WHERE id = ? AND store_id = ?')
      .run(categoryId, storeId).changes;
  }
}
