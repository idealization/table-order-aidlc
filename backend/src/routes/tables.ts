import { Router } from 'express';
import { TableService } from '../services/TableService';
import { requireAdmin } from '../middleware/auth';
import { handle } from '../middleware/errorHandler';

const router = Router();
const tableService = new TableService();

// 테이블 로그인 (고객)
router.post('/stores/:storeId/tables/:tableId/login', handle((req, res) => {
  const result = tableService.login(req.params.storeId, req.params.tableId, req.body.password);
  res.json(result);
}));

// 테이블 목록 조회 (관리자)
router.get('/stores/:storeId/tables', requireAdmin, handle((req, res) => {
  res.json({ tables: tableService.getTables(req.params.storeId) });
}));

// 테이블 초기 설정 (관리자)
router.post('/stores/:storeId/tables/setup', requireAdmin, handle((req, res) => {
  const table = tableService.setupTable(req.params.storeId, req.body.tableNumber, req.body.password);
  res.status(201).json({ table });
}));

// 테이블 이용 완료 (관리자)
router.post('/stores/:storeId/tables/:tableId/complete', requireAdmin, handle((req, res) => {
  tableService.completeSession(req.params.storeId, req.params.tableId);
  res.json({ success: true, message: 'Table session completed' });
}));

export default router;
