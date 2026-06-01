import { getDatabase } from '../database';
import { MenuItemRow } from '../types';

export class MenuItemRepository {
  findByStore(storeId: string, opts: { onlyAvailable?: boolean; categoryId?: string } = {}): MenuItemRow[] {
    const conditions = ['store_id = ?'];
    const params: unknown[] = [storeId];
    if (opts.categoryId) {
      conditions.push('category_id = ?');
      params.push(opts.categoryId);
    }
    if (opts.onlyAvailable) {
      conditions.push('is_available = 1');
    }
    return getDatabase()
      .prepare(`
        SELECT id, store_id, category_id, name, price, description, image_url, sort_order, is_available, created_at
        FROM menu_items
        WHERE ${conditions.join(' AND ')}
        ORDER BY sort_order ASC
      `)
      .all(...params) as MenuItemRow[];
  }

  findById(storeId: string, itemId: string): MenuItemRow | undefined {
    return getDatabase()
      .prepare(`
        SELECT id, store_id, category_id, name, price, description, image_url, sort_order, is_available, created_at
        FROM menu_items WHERE id = ? AND store_id = ?
      `)
      .get(itemId, storeId) as MenuItemRow | undefined;
  }

  insert(row: Omit<MenuItemRow, 'created_at'>): void {
    getDatabase()
      .prepare(`
        INSERT INTO menu_items (id, store_id, category_id, name, price, description, image_url, sort_order, is_available)
        VALUES (@id, @store_id, @category_id, @name, @price, @description, @image_url, @sort_order, @is_available)
      `)
      .run(row);
  }

  update(storeId: string, itemId: string, fields: Partial<Omit<MenuItemRow, 'id' | 'store_id' | 'created_at'>>): number {
    const keys = Object.keys(fields);
    if (keys.length === 0) return 0;
    const setClause = keys.map((k) => `${k} = @${k}`).join(', ');
    return getDatabase()
      .prepare(`UPDATE menu_items SET ${setClause} WHERE id = @id AND store_id = @store_id`)
      .run({ ...fields, id: itemId, store_id: storeId }).changes;
  }

  delete(storeId: string, itemId: string): number {
    return getDatabase()
      .prepare('DELETE FROM menu_items WHERE id = ? AND store_id = ?')
      .run(itemId, storeId).changes;
  }

  updateSortOrder(storeId: string, itemId: string, sortOrder: number): void {
    getDatabase()
      .prepare('UPDATE menu_items SET sort_order = ? WHERE id = ? AND store_id = ?')
      .run(sortOrder, itemId, storeId);
  }
}
