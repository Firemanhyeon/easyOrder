import { PrismaClient , Prisma } from "@prisma/client";

export class OrderRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    // 이 매장 소속 + 판매중 메뉴만 조회
    getMenusByIdsInStore(itemIds: number[], storeId: number) {
        if (!itemIds.length) return Promise.resolve([]);
        return this.prisma.menu_items.findMany({
            where: { id: { in: itemIds }, store_id: storeId },
            select: { id: true, name: true, price: true, is_available: true },
        });
    }

    // 최신 pending 주문(동일 매장/테이블)
    findPendingOrderTx(tx: Prisma.TransactionClient, storeId: number, tableNumber: number) {
        return tx.orders.findFirst({
            where: { store_id: storeId, table_number: tableNumber, status: 'pending' },
            orderBy: { id: 'desc' },
        });
    }

    // 새 주문 생성
    createOrderTx(
        tx: Prisma.TransactionClient,
        params: { storeId: number; tableNumber: number; totalAmount: Prisma.Decimal },
    ) {
        return tx.orders.create({
        data: {
            store_id: params.storeId,
            table_number: params.tableNumber,
            total_amount: params.totalAmount,
            status: 'pending', // 초기 상태
        },
        });
    }

    // 주문 아이템 여러 개 추가
    addOrderItemsTx(
        tx: Prisma.TransactionClient,
        orderId: number,
        rows: { menu_item_id: number; quantity: number; price_at_time: Prisma.Decimal }[],
    ) {
        
        return tx.order_items.createMany({
            data: rows.map(r => ({
                order_id: orderId,
                menu_item_id: r.menu_item_id,
                quantity: r.quantity,
                price_at_time: r.price_at_time,
            })),
        });
    }

    // 총액 증액 (updated_at은 @updatedAt로 자동 반영)
    updateOrderTotalTx(
        tx: Prisma.TransactionClient,
        orderId: number,
        total: Prisma.Decimal,
    ) {
        return tx.orders.update({
            where: { id: orderId },
            data: { total_amount: total },
        });
    }
}