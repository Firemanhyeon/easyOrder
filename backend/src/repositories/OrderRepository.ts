import { PrismaClient , Prisma } from "@prisma/client";

export class OrderRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    // 이 매장 소속 + 판매중 메뉴만 조회
    async getMenusByIdsInStore(itemIds: number[], storeId: number) {
        if (!itemIds.length) return Promise.resolve([]);
        return await this.prisma.menu_items.findMany({
            where: { id: { in: itemIds }, store_id: storeId },
            select: { id: true, name: true, price: true, is_available: true },
        });
    }

    //주문생성
    async createPaidOrderWithItemsTx(
      tx: Prisma.TransactionClient,
      params: {
        storeId: number;
        tableNumber: number;
        totalAmount: Prisma.Decimal;
        orderCode: string;
        paymentKey: string;
        paymentMethod?: string;
        approvedAt?: Date;
    },
      items: { menu_item_id: number; quantity: number; price_at_time: Prisma.Decimal }[]
    ) {
    const order = await tx.orders.create({
      data: {
        store_id: params.storeId,
        table_number: params.tableNumber,
        total_amount: params.totalAmount,
        status: 'confirmed',              // 결제 성공 → 확정
        order_code: params.orderCode,
        payment_key: params.paymentKey,

      },
    });

    if (items.length) {
      await tx.order_items.createMany({
        data: items.map(r => ({
          order_id: order.id,
          menu_item_id: r.menu_item_id,
          quantity: r.quantity,
          price_at_time: r.price_at_time,
        })),
      });
    }
    return order;
  }
}