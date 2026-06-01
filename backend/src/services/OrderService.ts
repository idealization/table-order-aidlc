import { v4 as uuidv4 } from 'uuid';
import { OrderRepository, OrderFilter } from '../repositories/OrderRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { getDatabase } from '../database';
import { CreateOrderInput, OrderRow, OrderItemRow, OrderStatus } from '../types';
import { BadRequestError, NotFoundError } from './errors';
import { broadcastOrder } from '../sse';

const VALID_STATUSES: OrderStatus[] = ['pending', 'preparing', 'completed'];

export interface OrderWithItems extends OrderRow {
  items: OrderItemRow[];
}

export class OrderService {
  constructor(
    private orders = new OrderRepository(),
    private sessions = new SessionRepository()
  ) {}

  createOrder(storeId: string, input: CreateOrderInput): OrderWithItems {
    const { tableId, sessionId, items } = input;

    if (!tableId || !sessionId || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('tableId, sessionId, and non-empty items are required');
    }
    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new BadRequestError('Each item quantity must be an integer >= 1');
      }
      if (!Number.isInteger(item.unitPrice) || item.unitPrice < 0) {
        throw new BadRequestError('Each item unitPrice must be an integer >= 0');
      }
    }

    if (!this.sessions.isValidActive(sessionId, tableId)) {
      throw new BadRequestError('Invalid or expired session');
    }

    const orderNumber = this.orders.nextOrderNumber(storeId);
    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const orderId = uuidv4();
    const createdAt = new Date().toISOString();

    const orderRow: OrderRow = {
      id: orderId,
      store_id: storeId,
      table_id: tableId,
      session_id: sessionId,
      order_number: orderNumber,
      status: 'pending',
      total_amount: totalAmount,
      created_at: createdAt,
    };

    const itemRows: OrderItemRow[] = items.map((item) => ({
      id: uuidv4(),
      order_id: orderId,
      menu_item_id: item.menuItemId,
      menu_item_name: item.menuItemName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }));

    const db = getDatabase();
    const tx = db.transaction(() => {
      this.orders.insertOrder(orderRow);
      this.orders.insertItems(itemRows);
    });
    tx();

    const result: OrderWithItems = { ...orderRow, items: itemRows };
    broadcastOrder(storeId, result);
    return result;
  }

  getOrders(storeId: string, filter: OrderFilter = {}): OrderWithItems[] {
    const orders = this.orders.findByStore(storeId, filter);
    return orders.map((order) => ({ ...order, items: this.orders.findItems(order.id) }));
  }

  getTableOrders(storeId: string, tableId: string, sessionId: string): OrderWithItems[] {
    const orders = this.orders.findBySession(storeId, tableId, sessionId);
    return orders.map((order) => ({ ...order, items: this.orders.findItems(order.id) }));
  }

  updateOrderStatus(storeId: string, orderId: string, status: OrderStatus): void {
    if (!VALID_STATUSES.includes(status)) {
      throw new BadRequestError('Invalid status. Must be: pending, preparing, completed');
    }
    const changes = this.orders.updateStatus(storeId, orderId, status);
    if (changes === 0) throw new NotFoundError('Order not found');
  }

  deleteOrder(storeId: string, orderId: string): void {
    const changes = this.orders.delete(storeId, orderId);
    if (changes === 0) throw new NotFoundError('Order not found');
  }
}
