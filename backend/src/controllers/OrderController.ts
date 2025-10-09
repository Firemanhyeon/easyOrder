import { Request , Response } from "express"
import { OrderService } from "../services/OrderService"

export class OrderController {
    constructor(private readonly orderService: OrderService) {}


    // 주문 생성
    confirmOrder = async (req: Request, res: Response) => {
    try {
      const {
        storeId,
        tableNumber,
        items,
        paidAmount,   // Toss 성공 리다이렉트에서 받은 amount
        orderCode,    // preparePayment에서 받은 값(프론트가 successUrl 쿼리 or state로 보관)
        paymentKey,   // Toss에서 successUrl로 준 paymentKey
      } = req.body;

      if (
        storeId == null ||
        tableNumber == null ||
        !Array.isArray(items) ||
        items.length === 0 ||
        paidAmount == null ||
        !orderCode ||
        !paymentKey
      ) {
        return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
      }
      console.log('123123' , storeId , tableNumber , items , paidAmount , orderCode 
        , paymentKey)
      const saved = await this.orderService.confirmAndCreateOrder({
        storeId: Number(storeId),
        tableNumber: Number(tableNumber),
        items: items as { id: number; qty: number }[],
        paidAmount: Number(paidAmount),
        orderCode: String(orderCode),
        paymentKey: String(paymentKey),

      });

      return res.status(201).json(saved);
    } catch (err) {
      console.error("confirmOrder 에러:", err);
      return res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
  };

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