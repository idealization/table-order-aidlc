import { Router } from 'express';
import { OrderService } from '../services/OrderService';
import { requireAdmin } from '../middleware/auth';
import { handle } from '../middleware/errorHandler';
import { OrderStatus } from '../types';
import { BadRequestError } from '../services/errors';

const router = Router();
const orderService = new OrderService();

// 주문 생성 (고객)
router.post('/stores/:storeId/orders', handle((req, res) => {
  const order = orderService.createOrder(req.params.storeId, req.body);
  res.status(201).json({ order });
}));

// 주문 목록 조회 (관리자)
router.get('/stores/:storeId/orders', requireAdmin, handle((req, res) => {
  const status = req.query.status as OrderStatus | undefined;
  const tableId = req.query.tableId as string | undefined;
  res.json({ orders: orderService.getOrders(req.params.storeId, { status, tableId }) });
}));

// 테이블별 주문 조회 (고객, 현재 세션)
router.get('/stores/:storeId/tables/:tableId/orders', handle((req, res) => {
  const sessionId = req.query.sessionId as string | undefined;
  if (!sessionId) throw new BadRequestError('sessionId is required');
  res.json({ orders: orderService.getTableOrders(req.params.storeId, req.params.tableId, sessionId) });
}));

// 주문 상태 변경 (관리자)
router.patch('/stores/:storeId/orders/:orderId/status', requireAdmin, handle((req, res) => {
  orderService.updateOrderStatus(req.params.storeId, req.params.orderId, req.body.status);
  res.json({ success: true, orderId: req.params.orderId, status: req.body.status });
}));

// 주문 삭제 (관리자)
router.delete('/stores/:storeId/orders/:orderId', requireAdmin, handle((req, res) => {
  orderService.deleteOrder(req.params.storeId, req.params.orderId);
  res.json({ success: true });
}));

export default router;
