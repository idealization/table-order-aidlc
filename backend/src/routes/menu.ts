import { Router } from 'express';
import { MenuService } from '../services/MenuService';
import { requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { handle } from '../middleware/errorHandler';

const router = Router();
const menuService = new MenuService();

// --- 고객/공개 조회 ---

// 카테고리 목록 조회
router.get('/stores/:storeId/categories', handle((req, res) => {
  res.json({ categories: menuService.getCategories(req.params.storeId) });
}));

// 전체 메뉴 조회 (카테고리별 그룹, 판매 가능만)
router.get('/stores/:storeId/menu', handle((req, res) => {
  const categoryId = req.query.categoryId as string | undefined;
  res.json({ menu: menuService.getMenu(req.params.storeId, categoryId, true) });
}));

// 메뉴 상세 조회
router.get('/stores/:storeId/menu/:itemId', handle((req, res) => {
  res.json({ item: menuService.getMenuItem(req.params.storeId, req.params.itemId) });
}));

// --- 관리자 메뉴 관리 (보호) ---

// 관리자: 전체 메뉴 (판매 불가 포함)
router.get('/stores/:storeId/admin/menu', requireAdmin, handle((req, res) => {
  res.json({ menu: menuService.getMenu(req.params.storeId, undefined, false) });
}));

// 메뉴 등록
router.post('/stores/:storeId/menu', requireAdmin, handle((req, res) => {
  const item = menuService.createMenuItem(req.params.storeId, req.body);
  res.status(201).json({ item });
}));

// 메뉴 수정
router.put('/stores/:storeId/menu/:itemId', requireAdmin, handle((req, res) => {
  const item = menuService.updateMenuItem(req.params.storeId, req.params.itemId, req.body);
  res.json({ item });
}));

// 메뉴 삭제
router.delete('/stores/:storeId/menu/:itemId', requireAdmin, handle((req, res) => {
  menuService.deleteMenuItem(req.params.storeId, req.params.itemId);
  res.json({ success: true });
}));

// 메뉴 순서 조정
router.post('/stores/:storeId/menu/reorder', requireAdmin, handle((req, res) => {
  menuService.reorderMenuItems(req.params.storeId, req.body.orderedIds || []);
  res.json({ success: true });
}));

// 카테고리 등록
router.post('/stores/:storeId/categories', requireAdmin, handle((req, res) => {
  const category = menuService.createCategory(req.params.storeId, req.body.name, req.body.sortOrder ?? 0);
  res.status(201).json({ category });
}));

// 이미지 업로드
router.post('/stores/:storeId/upload', requireAdmin, upload.single('image'), handle((req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file provided' });
    return;
  }
  res.json({ url: `/uploads/${req.file.filename}` });
}));

export default router;
