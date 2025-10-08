import { Request , Response } from "express"
import { OrderService } from "../services/OrderService"

export class OrderController {
    constructor(private readonly orderService: OrderService) {}
    // 주문 생성
    createOrder = async (req: Request, res: Response) => {
        try {
            const { storeId, tableNumber, items, total } = req.body;
            if (!storeId || !tableNumber || !items || !total) {
                return res.status(400).json({ message: '필수 정보가 누락되었습니다.' });
            }
            const tnum = Number(tableNumber);
            const order = await this.orderService.createOrder({
                storeId: parseInt(storeId),
                tableNumber: tnum,
                items,
                total: parseFloat(total),
            });
            res.status(201).json(order);
        } catch (error) {
            console.error('주문 생성 에러:', error);
            res.status(500).json({ message: '서버 에러가 발생했습니다.' });
        }
    }

    //결제전 데이터 검증
    preparePayment = async (req: Request , res: Response) => {
        try {
            const { storeId, tableNumber, items, total } = req.body;
            if (!storeId || !tableNumber || !items || !total) {
                return res.status(400).json({ message: '필수 정보가 누락되었습니다.' });
            }
            const tnum = Number(tableNumber);
            const prepare = await this.orderService.preparePayment({
                storeId: parseInt(storeId),
                tableNumber: tnum,
                items,
                total: total,
            });
            res.status(201).json(prepare);
        } catch (error) {
            console.error('주문 생성 에러:', error);
            res.status(500).json({ message: '서버 에러가 발생했습니다.' });
        }
    }
}