import { Router } from 'express';
import { HistoryService } from '../services/HistoryService';
import { requireAdmin } from '../middleware/auth';
import { handle } from '../middleware/errorHandler';

const router = Router();
const historyService = new HistoryService();

// 과거 주문 내역 조회 (관리자)
router.get('/stores/:storeId/history', requireAdmin, handle((req, res) => {
  const tableId = req.query.tableId as string | undefined;
  const date = req.query.date as string | undefined;
  res.json({ history: historyService.getHistory(req.params.storeId, { tableId, date }) });
}));

export default router;
