import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const authService = new AuthService();
const authController = new AuthController(authService);

// 로그인
router.post('/login', authController.login);

// 현재 로그인한 관리자 정보 조회 (인증 필요)
router.get('/me', authMiddleware, authController.getCurrentAdmin);

export default router; 