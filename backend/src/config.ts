// MVP 설정 (하드코딩 자격, 환경변수로 오버라이드 가능)
export const config = {
  jwtSecret: process.env.JWT_SECRET || 'table-order-dev-secret-change-in-prod',
  jwtExpiresIn: '16h',
  admin: {
    storeId: process.env.ADMIN_STORE_ID || 'store-001',
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin1234',
  },
};
