import { v4 as uuidv4 } from 'uuid';
import { TableRepository, TableWithSession } from '../repositories/TableRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { OrderRepository } from '../repositories/OrderRepository';
import { OrderHistoryRepository } from '../repositories/OrderHistoryRepository';
import { getDatabase } from '../database';
import { TableRow } from '../types';
import { BadRequestError, UnauthorizedError } from './errors';

export interface TableLoginResult {
  success: true;
  tableNumber: number;
  sessionId: string;
  storeId: string;
}

export class TableService {
  constructor(
    private tables = new TableRepository(),
    private sessions = new SessionRepository(),
    private orders = new OrderRepository(),
    private history = new OrderHistoryRepository()
  ) {}

  login(storeId: string, tableId: string, password: string): TableLoginResult {
    if (!password) throw new BadRequestError('Password is required');

    const table = this.tables.findById(storeId, tableId);
    if (!table || table.password !== password) {
      throw new UnauthorizedError('Invalid credentials');
    }

    let session = this.sessions.findActive(storeId, tableId);
    if (!session) {
      session = this.sessions.create(storeId, tableId);
    }

    return { success: true, tableNumber: table.table_number, sessionId: session.id, storeId };
  }

  getTables(storeId: string): TableWithSession[] {
    return this.tables.findByStoreWithSession(storeId);
  }

  setupTable(storeId: string, tableNumber: number, password: string): TableRow {
    if (!Number.isInteger(tableNumber) || tableNumber < 1) {
      throw new BadRequestError('Valid tableNumber is required');
    }
    if (!password) throw new BadRequestError('Password is required');

    const existing = this.tables.findByNumber(storeId, tableNumber);
    if (existing) {
      this.tables.updatePassword(storeId, existing.id, password);
      // 활성 세션 보장
      if (!this.sessions.findActive(storeId, existing.id)) {
        this.sessions.create(storeId, existing.id);
      }
      return this.tables.findById(storeId, existing.id)!;
    }

    const id = uuidv4();
    this.tables.insert(id, storeId, tableNumber, password);
    this.sessions.create(storeId, id);
    return this.tables.findById(storeId, id)!;
  }

  completeSession(storeId: string, tableId: string): void {
    const session = this.sessions.findActive(storeId, tableId);
    if (!session) throw new BadRequestError('No active session for this table');

    const db = getDatabase();
    const tx = db.transaction(() => {
      const orders = this.orders.findAllBySession(session.id);
      for (const order of orders) {
        const items = this.orders.findItems(order.id);
        this.history.insert({
          id: uuidv4(),
          store_id: storeId,
          table_id: tableId,
          session_id: session.id,
          order_number: order.order_number,
          status: order.status,
          total_amount: order.total_amount,
          items_json: JSON.stringify(items),
          created_at: order.created_at,
        });
      }
      this.orders.deleteBySession(session.id);
      this.sessions.end(session.id);
    });
    tx();
  }
}
