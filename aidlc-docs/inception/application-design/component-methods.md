# 컴포넌트 메서드 (Component Methods)

각 컴포넌트의 메서드 시그니처와 입출력을 정의합니다. 상세 비즈니스 규칙은 Functional Design 단계에서 다룹니다.

> 표기: TypeScript 시그니처 기준. `Promise`는 비동기, 동기 SQLite(better-sqlite3) 사용 시 동기 메서드도 허용.

---

## 1. 서비스 계층 (Service Layer)

### MenuService
```ts
getCategories(storeId: string): Category[]
getMenu(storeId: string, categoryId?: string): MenuCategory[]   // 카테고리별 그룹화
getMenuItem(storeId: string, itemId: string): MenuItem | null
createMenuItem(storeId: string, input: MenuItemInput): MenuItem  // 필수필드/가격 검증
updateMenuItem(storeId: string, itemId: string, input: Partial<MenuItemInput>): MenuItem
deleteMenuItem(storeId: string, itemId: string): void
reorderMenuItems(storeId: string, orderedIds: string[]): void
createCategory(storeId: string, name: string, sortOrder: number): Category
```

### OrderService
```ts
createOrder(storeId: string, input: CreateOrderInput): Order   // 세션검증→채번→총액계산→저장→SSE발행
getOrders(storeId: string, filter?: { status?: OrderStatus; tableId?: string }): Order[]
getTableOrders(storeId: string, tableId: string, sessionId: string): Order[]  // 현재 세션만
updateOrderStatus(storeId: string, orderId: string, status: OrderStatus): void
deleteOrder(storeId: string, orderId: string): void  // 삭제 후 총액 재계산은 조회 시 반영
```

### TableService
```ts
login(storeId: string, tableId: string, password: string): TableLoginResult  // 자격검증→활성세션 확보/생성
getTables(storeId: string): TableWithSession[]
setupTable(storeId: string, tableNumber: number, password: string): Table     // 초기 설정
completeSession(storeId: string, tableId: string): void  // 주문→이력 이동, 세션 종료, 리셋
```

### AuthService
```ts
authenticate(storeId: string, username: string, password: string): { token: string } // JWT 16h
verifyToken(token: string): AuthPayload | null
```

### HistoryService
```ts
getHistory(storeId: string, filter?: { tableId?: string; date?: string }): OrderHistoryEntry[]
```

---

## 2. 리포지토리 계층 (Repository Layer)

### OrderRepository (예시)
```ts
insertOrder(order: OrderRow): void
insertOrderItems(items: OrderItemRow[]): void
findByStore(storeId: string, filter?: OrderFilter): OrderRow[]
findBySession(storeId: string, tableId: string, sessionId: string): OrderRow[]
findItemsByOrderId(orderId: string): OrderItemRow[]
nextOrderNumber(storeId: string): number
updateStatus(orderId: string, storeId: string, status: string): number  // changes count
delete(orderId: string, storeId: string): number
deleteBySession(sessionId: string): void
```

### SessionRepository (예시)
```ts
findActive(storeId: string, tableId: string): SessionRow | null
create(storeId: string, tableId: string): SessionRow
end(sessionId: string): void   // is_active=0, ended_at 기록
```

### MenuItemRepository / CategoryRepository / TableRepository / StoreRepository / OrderHistoryRepository
```ts
// 각 엔티티에 대한 CRUD 및 조회 메서드 (findById, findByStore, insert, update, delete 등)
```

---

## 3. 횡단 관심사 (Cross-cutting)

### SSEManager
```ts
handleConnection(req: Request, res: Response): void  // 연결 등록 + keepalive
broadcastOrder(storeId: string, order: Order): void  // 매장별 클라이언트에 발행
```

### AuthMiddleware
```ts
requireAdmin(req: Request, res: Response, next: NextFunction): void  // JWT 검증
```

---

## 4. 프론트엔드 API 모듈 (api/*)

### menuApi
```ts
fetchMenu(storeId: string, categoryId?: string): Promise<MenuCategory[]>
fetchCategories(storeId: string): Promise<Category[]>
createMenuItem(storeId: string, input: MenuItemInput, token: string): Promise<MenuItem>
updateMenuItem(storeId: string, itemId: string, input: Partial<MenuItemInput>, token: string): Promise<MenuItem>
deleteMenuItem(storeId: string, itemId: string, token: string): Promise<void>
uploadImage(file: File, token: string): Promise<{ url: string }>
```

### orderApi
```ts
createOrder(storeId: string, input: CreateOrderInput): Promise<Order>
fetchTableOrders(storeId: string, tableId: string, sessionId: string): Promise<Order[]>
fetchOrders(storeId: string, token: string, filter?: OrderFilter): Promise<Order[]>
updateOrderStatus(storeId: string, orderId: string, status: OrderStatus, token: string): Promise<void>
deleteOrder(storeId: string, orderId: string, token: string): Promise<void>
```

### tableApi
```ts
login(storeId: string, tableId: string, password: string): Promise<TableLoginResult>
fetchTables(storeId: string, token: string): Promise<TableWithSession[]>
setupTable(storeId: string, tableNumber: number, password: string, token: string): Promise<Table>
completeSession(storeId: string, tableId: string, token: string): Promise<void>
```

### authApi
```ts
login(storeId: string, username: string, password: string): Promise<{ token: string }>
```

### historyApi
```ts
fetchHistory(storeId: string, token: string, filter?: { tableId?: string; date?: string }): Promise<OrderHistoryEntry[]>
```

---

## 5. 프론트엔드 훅 (Hooks)

### useCart
```ts
useCart(storeId: string, tableId: string): {
  items: CartItem[];
  addItem(item: Omit<CartItem,'quantity'>): void;
  removeItem(menuItemId: string): void;
  updateQuantity(menuItemId: string, quantity: number): void;
  clearCart(): void;
  totalAmount: number;
  totalItems: number;
}
```

### useOrderStream
```ts
useOrderStream(storeId: string, token: string): {
  orders: Order[];        // 실시간 누적
  connected: boolean;
  latestOrder: Order | null;
}
```

### useAuth (AuthContext)
```ts
useAuth(): {
  token: string | null;
  storeId: string | null;
  login(storeId: string, username: string, password: string): Promise<void>;
  logout(): void;
  isAuthenticated: boolean;
}
```
