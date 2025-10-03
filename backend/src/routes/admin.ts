import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleGuard } from '../middlewares/roleGuard';
import { ownStoreGuard } from '../middlewares/ownStoreGuard';

const router = Router();
const adminController = new AdminController();
// 인증이 필요한 라우트
router.use(authMiddleware);  // 이 아래의 모든 라우트는 인증 필요


// 관리자 생성
router.post('/', 
    roleGuard(['admin']), 
    adminController.createOwner
);


// 관리자 목록 조회
router.get('/',
    roleGuard(['admin']), 
    adminController.getAdmins
);



// 점주 생성
router.post('/owner', 
    roleGuard(['admin']), 
    adminController.createOwner
);

// 관리자 수정
router.put('/:id', 
    roleGuard(['admin']), 
    adminController.updateAdmin
);

// 관리자 삭제
router.delete('/:id', 
    roleGuard(['admin']), 
    adminController.deleteAdmin
);

export default router;

