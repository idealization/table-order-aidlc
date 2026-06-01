import { getDatabase } from '../database';
import { SessionRow } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class SessionRepository {
  findActive(storeId: string, tableId: string): SessionRow | undefined {
    return getDatabase()
      .prepare(`
        SELECT id, table_id, store_id, started_at, ended_at, is_active
        FROM table_sessions
        WHERE table_id = ? AND store_id = ? AND is_active = 1
      `)
      .get(tableId, storeId) as SessionRow | undefined;
  }

  findById(sessionId: string): SessionRow | undefined {
    return getDatabase()
      .prepare('SELECT id, table_id, store_id, started_at, ended_at, is_active FROM table_sessions WHERE id = ?')
      .get(sessionId) as SessionRow | undefined;
  }

  isValidActive(sessionId: string, tableId: string): boolean {
    const row = getDatabase()
      .prepare('SELECT id FROM table_sessions WHERE id = ? AND table_id = ? AND is_active = 1')
      .get(sessionId, tableId);
    return !!row;
  }

  create(storeId: string, tableId: string): SessionRow {
    const id = uuidv4();
    getDatabase()
      .prepare('INSERT INTO table_sessions (id, table_id, store_id) VALUES (?, ?, ?)')
      .run(id, tableId, storeId);
    return this.findById(id)!;
  }

  end(sessionId: string): void {
    getDatabase()
      .prepare("UPDATE table_sessions SET is_active = 0, ended_at = datetime('now') WHERE id = ?")
      .run(sessionId);
  }
}
