export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_available: number;
}

export interface MenuCategory extends Category {
  items: MenuItem[];
}

export interface CartItem {
  menuItemId: string;
  menuItemName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: number;
  status: 'pending' | 'preparing' | 'completed';
  total_amount: number;
  created_at: string;
  table_id?: string;
  table_number?: number;
  session_id?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
}

export interface TableWithSession {
  id: string;
  table_number: number;
  session_id: string | null;
  is_active: number | null;
  session_started: string | null;
}

export interface HistoryEntry {
  id: string;
  table_id: string;
  session_id: string;
  order_number: number;
  status: string;
  total_amount: number;
  items: { menu_item_name: string; quantity: number; unit_price: number }[];
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
