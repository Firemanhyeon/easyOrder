import { Router } from 'express';
import { StoreController } from '../controllers/StoreController';
import { StoreService } from '../services/StoreService';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleGuard } from '../middlewares/roleGuard';
import { ownStoreGuard } from '../middlewares/ownStoreGuard';

const router = Router();
const storeService = new StoreService();
const storeController = new StoreController(storeService);

// 모든 매장 관련 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// GET /api/stores - 매장 목록 조회
router.get('/',
    roleGuard(['admin','store_owner']), 
    storeController.getStores
);

// GET /api/stores/:id - 매장 상세 조회
router.get('/:id',
    roleGuard(['admin','store_owner']),
    ownStoreGuard, 
    storeController.getStoreById
);

// POST /api/stores - 매장 생성
router.post('/', 
    roleGuard(['admin','store_owner']), 
    storeController.createStore
);

// DELETE /api/stores/:id - 매장 삭제
router.delete('/:id', 
    roleGuard(['admin','store_owner']), 
    ownStoreGuard, 
    storeController.deleteStore
);

// POST /api/stores/:id/qr-codes - QR 코드 생성
router.post('/:id/qr-codes', 
    roleGuard(['admin','store_owner']), 
    ownStoreGuard, 
    storeController.createQrCode
);

// GET /api/stores/:id/qr-codes - 특정 매장의 QR 코드 목록 조회
router.get('/:id/qr-codes', 
    roleGuard(['admin','store_owner']), 
    ownStoreGuard, 
    storeController.getQrCodesByStoreId
);

// DELETE /api/qr-codes/:id - QR 코드 삭제
router.delete('/qr-codes/:id', roleGuard(['admin','store_owner']), 
    ownStoreGuard, 
    storeController.deleteQrCode
);

export default router; 