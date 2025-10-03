import { Router, RequestHandler } from 'express';
import { MenuController } from '../controllers/menuController';
import { MenuService } from '../services/menuService';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleGuard } from '../middlewares/roleGuard';
import { ownStoreGuard } from '../middlewares/ownStoreGuard';
import multer from 'multer';

const router = Router();
const menuController = new MenuController(new MenuService());

const upload = multer({ storage: multer.memoryStorage() });

//모든 사용자 사용가능 (미들웨어인증x)

// 가게 ID로 카테고리 조회
router.get('/:storeId/categories', menuController.getCategorysByStoreId);

//가게 Id로 메뉴 조회
router.get('/:storeId/items', menuController.getMenuByStoreId);

// 카테고리별 메뉴 조회
router.get('/:storeId/category/:categoryId', menuController.getMenuByCategory);


// 인증 필요

router.use(authMiddleware);

// 메뉴추가
router.post('/', 
    roleGuard(['admin','store_owner']), 
    upload.single('image') as RequestHandler,
    menuController.createMenuItem
);

// 메뉴수정
router.put('/:id', 
    roleGuard(['admin','store_owner']), 
    upload.single('image') as RequestHandler,
    ownStoreGuard,
    menuController.updateMenuItem
);

// 메뉴 순서 저장
router.post('/sort', 
    roleGuard(['admin','store_owner']), 
    ownStoreGuard,
    menuController.saveSortOrder
);

// 카테고리 추가
router.post('/category',
    roleGuard(['admin','store_owner']),
    ownStoreGuard,
    menuController.createCategory
);
export default router;