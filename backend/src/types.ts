export type OrderStatus = 'pending' | 'preparing' | 'completed';

export interface StoreRow {
  id: string;
  name: string;
  created_at: string;
}

export interface TableRow {
  id: string;
  store_id: string;
  table_number: number;
  password: string;
  created_at: string;
}

export interface SessionRow {
  id: string;
  table_id: string;
  store_id: string;
  started_at: string;
  ended_at: string | null;
  is_active: number;
}

export interface CategoryRow {
  id: string;
  store_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface MenuItemRow {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_available: number;
  created_at: string;
}

export interface OrderRow {
  id: string;
  store_id: string;
  table_id: string;
  session_id: string;
  order_number: number;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
}

export interface OrderHistoryRow {
  id: string;
  store_id: string;
  table_id: string;
  session_id: string;
  order_number: number;
  status: string;
  total_amount: number;
  items_json: string;
  created_at: string;
  archived_at: string;
}

export interface MenuItemInput {
  categoryId: string;
  name: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isAvailable?: boolean;
}

export interface CreateOrderItemInput {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderInput {
  tableId: string;
  sessionId: string;
  items: CreateOrderItemInput[];
}
