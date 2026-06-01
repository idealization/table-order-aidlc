import { Router } from 'express';
import { AuthService } from '../services/AuthService';
import { handle } from '../middleware/errorHandler';

const router = Router();
const authService = new AuthService();

// 관리자 로그인
router.post('/auth/login', handle((req, res) => {
  const { storeId, username, password } = req.body;
  const result = authService.authenticate(storeId, username, password);
  res.json(result);
}));

export default router;
