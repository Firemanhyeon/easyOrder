import { Router, RequestHandler } from 'express';
import { OrderController } from '../controllers/OrderController';
import { OrderService } from '../services/OrderService';
import { authMiddleware } from '../middlewares/authMiddleware';


const router = Router();
const orderController = new OrderController(new OrderService());


// 주문 생성
router.post('/', orderController.createOrder);



export default router;