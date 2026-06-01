import { getDatabase } from './database';
import { v4 as uuidv4 } from 'uuid';

const db = getDatabase();

// 시드 데이터 생성
const storeId = 'store-001';
const tableIds = Array.from({ length: 5 }, (_, i) => `table-${String(i + 1).padStart(3, '0')}`);

console.log('🌱 Seeding database...');

const transaction = db.transaction(() => {
  // 매장 생성
  db.prepare(`INSERT OR IGNORE INTO stores (id, name) VALUES (?, ?)`).run(storeId, '맛있는 식당');

  // 테이블 생성 (5개)
  for (let i = 0; i < 5; i++) {
    db.prepare(`INSERT OR IGNORE INTO tables (id, store_id, table_number, password) VALUES (?, ?, ?, ?)`)
      .run(tableIds[i], storeId, i + 1, '1234');
  }

  // 카테고리 생성
  const categories = [
    { id: 'cat-main', name: '메인 메뉴', sortOrder: 1 },
    { id: 'cat-side', name: '사이드', sortOrder: 2 },
    { id: 'cat-drink', name: '음료', sortOrder: 3 },
    { id: 'cat-dessert', name: '디저트', sortOrder: 4 },
  ];

  for (const cat of categories) {
    db.prepare(`INSERT OR IGNORE INTO categories (id, store_id, name, sort_order) VALUES (?, ?, ?, ?)`)
      .run(cat.id, storeId, cat.name, cat.sortOrder);
  }

  // 메뉴 아이템 생성
  const menuItems = [
    // 메인 메뉴
    { id: uuidv4(), categoryId: 'cat-main', name: '김치찌개', price: 9000, description: '깊은 맛의 전통 김치찌개', sortOrder: 1 },
    { id: uuidv4(), categoryId: 'cat-main', name: '된장찌개', price: 8500, description: '구수한 된장찌개', sortOrder: 2 },
    { id: uuidv4(), categoryId: 'cat-main', name: '불고기', price: 15000, description: '달콤한 양념의 소불고기', sortOrder: 3 },
    { id: uuidv4(), categoryId: 'cat-main', name: '제육볶음', price: 12000, description: '매콤한 돼지고기 볶음', sortOrder: 4 },
    { id: uuidv4(), categoryId: 'cat-main', name: '비빔밥', price: 10000, description: '신선한 야채와 고추장의 조화', sortOrder: 5 },
    { id: uuidv4(), categoryId: 'cat-main', name: '돈까스', price: 11000, description: '바삭한 수제 돈까스', sortOrder: 6 },
    // 사이드
    { id: uuidv4(), categoryId: 'cat-side', name: '계란말이', price: 7000, description: '부드러운 계란말이', sortOrder: 1 },
    { id: uuidv4(), categoryId: 'cat-side', name: '김치전', price: 8000, description: '바삭한 김치전', sortOrder: 2 },
    { id: uuidv4(), categoryId: 'cat-side', name: '떡볶이', price: 6000, description: '매콤달콤 떡볶이', sortOrder: 3 },
    { id: uuidv4(), categoryId: 'cat-side', name: '감자튀김', price: 5000, description: '바삭한 감자튀김', sortOrder: 4 },
    // 음료
    { id: uuidv4(), categoryId: 'cat-drink', name: '콜라', price: 2000, description: '시원한 콜라', sortOrder: 1 },
    { id: uuidv4(), categoryId: 'cat-drink', name: '사이다', price: 2000, description: '청량한 사이다', sortOrder: 2 },
    { id: uuidv4(), categoryId: 'cat-drink', name: '맥주', price: 5000, description: '시원한 생맥주', sortOrder: 3 },
    { id: uuidv4(), categoryId: 'cat-drink', name: '소주', price: 5000, description: '참이슬', sortOrder: 4 },
    // 디저트
    { id: uuidv4(), categoryId: 'cat-dessert', name: '아이스크림', price: 3000, description: '바닐라 아이스크림', sortOrder: 1 },
    { id: uuidv4(), categoryId: 'cat-dessert', name: '식혜', price: 3000, description: '달콤한 전통 식혜', sortOrder: 2 },
  ];

  for (const item of menuItems) {
    db.prepare(`
      INSERT OR IGNORE INTO menu_items (id, store_id, category_id, name, price, description, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(item.id, storeId, item.categoryId, item.name, item.price, item.description, item.sortOrder);
  }

  // 테이블 1에 활성 세션 생성
  const sessionId = 'session-001';
  db.prepare(`INSERT OR IGNORE INTO table_sessions (id, table_id, store_id) VALUES (?, ?, ?)`)
    .run(sessionId, tableIds[0], storeId);
});

transaction();

console.log('✅ Seed data created successfully!');
console.log('');
console.log('📋 Test credentials:');
console.log(`   Store ID: ${storeId}`);
console.log(`   Tables: 1-5 (password: 1234)`);
console.log(`   Active session on Table 1: session-001`);
