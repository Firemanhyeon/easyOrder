import { OrderRepository } from "../repositories/OrderRepository";
import { PrismaClient , Prisma } from "@prisma/client";


export class OrderService {
    private orderRepository: OrderRepository;
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
        this.orderRepository = new OrderRepository(this.prisma);
    }

    // 주문 생성
    async createOrder(data: {
        storeId: number;
        tableNumber: number;
        items: { id: number; qty: number }[];
        total: number;
    }) {
        // 1) 메뉴 유효성/가격 조회 (해당 매장 소속 + 판매중)
        const { storeId , tableNumber , items } = data;
        const menuIds = items.map(i => i.id);
        const menus = await this.orderRepository.getMenusByIdsInStore(menuIds, storeId);

        if (menus.length !== menuIds.length) {
        throw new Error('존재하지 않거나 이 매장 소속이 아닌 메뉴가 포함되어 있습니다.');
        }

        // 판매중 체크
        const notAvail = menus.find(m => !m.is_available);
        if (notAvail) throw new Error(`품절/비판매 메뉴 포함: ${notAvail.name}`);

        
        // 2) 합계 계산 (현재 시점 가격 기준)
        let addTotal = new Prisma.Decimal(0);
        const lines = items.map(({ id, qty }) => {
        const menu = menus.find(m => m.id === id)!;
        const unit = new Prisma.Decimal(menu.price); // unit price
        addTotal = addTotal.add(unit.mul(qty));
        return { menu_item_id: id, quantity: qty, price_at_time: unit };
        });

        // 3) 트랜잭션: 기존 pending 주문 있으면 추가, 없으면 새로 생성
        const result = await this.prisma.$transaction(async (tx) => {
            // 동일 테이블의 최신 pending 주문
            const existing = await this.orderRepository.findPendingOrderTx(tx, storeId, tableNumber);

            if (!existing) {
                // 새 주문
                const order = await this.orderRepository.createOrderTx(tx, {
                storeId,
                tableNumber,
                totalAmount: addTotal,
                });
                await this.orderRepository.addOrderItemsTx(tx, order.id, lines);

                // 반환
                return {
                createdNewOrder: true,
                orderId: order.id,
                addedItemsCount: lines.length,
                addTotal: addTotal.toString(),
                totalAmount: order.total_amount.toString(),
                status: order.status,
                };
            } else {
                // 기존 주문에 추가
                await this.orderRepository.addOrderItemsTx(tx, existing.id, lines);

                const newTotal = new Prisma.Decimal(existing.total_amount).add(addTotal);
                const updated = await this.orderRepository.updateOrderTotalTx(tx, existing.id, newTotal);

                return {
                createdNewOrder: false,
                orderId: existing.id,
                addedItemsCount: lines.length,
                addTotal: addTotal.toString(),
                totalAmount: updated.total_amount.toString(),
                status: updated.status,
                };
            }
        });
        return result;
    }
}