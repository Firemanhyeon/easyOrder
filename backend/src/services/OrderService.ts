import { OrderRepository } from "../repositories/OrderRepository";
import { PrismaClient , Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

type OrderItemInput = { id: number; qty: number };

export class OrderService {
    private orderRepository: OrderRepository;
    private prisma: PrismaClient;


    constructor() {
        this.prisma = new PrismaClient();
        this.orderRepository = new OrderRepository(this.prisma);
    } 

    private buildLinesAndTotal(
      menus: Array<{ id: number; price: Prisma.Decimal }>,
      items: OrderItemInput[]
    ): { serverTotal: Prisma.Decimal; lines: { menu_item_id: number; quantity: number; price_at_time: Prisma.Decimal }[] } {
      let serverTotal = new Prisma.Decimal(0);
      const lines = items.map((it: OrderItemInput) => {
      const { id, qty } = it;
      const menu = menus.find(m => m.id === id)!;
      const unit = new Prisma.Decimal(menu.price);
      serverTotal = serverTotal.add(unit.mul(qty));
      return { menu_item_id: id, quantity: qty, price_at_time: unit };
    });
    return { serverTotal, lines };
  }

    // 주문 생성
    async confirmAndCreateOrder(data: {
      storeId: number;
      tableNumber: number;
      items: OrderItemInput[];
      paidAmount: number;   // Toss 승인 응답의 실제 결제 금액
      orderCode: string;    // preparePayment에서 만든 값
      paymentKey: string;   // Toss 승인 응답
    }) {
      const { storeId, tableNumber, items, paidAmount, orderCode, paymentKey} = data;

      const menuIds = items.map((i) => i.id);
      const menus = await this.orderRepository.getMenusByIdsInStore(menuIds, storeId);
      if (menus.length !== menuIds.length) {
        throw new Error("존재하지 않거나 매장 소속이 아닌 메뉴가 포함되어 있습니다.");
      }
      const notAvail = menus.find((m) => !m.is_available);
      if (notAvail) throw new Error(`품절/비판매 메뉴 포함: ${notAvail.name}`);

      const { serverTotal, lines } = this.buildLinesAndTotal(
        menus.map((m) => ({ id: m.id, price: m.price as Prisma.Decimal })),
        items
      );

      if (!serverTotal.eq(new Prisma.Decimal(paidAmount))) {
        throw new Error("결제 금액 불일치");
      }

      const saved = await this.prisma.$transaction(async (tx) => {
        return this.orderRepository.createPaidOrderWithItemsTx(
          tx,
          {
            storeId,
            tableNumber,
            totalAmount: serverTotal,
            orderCode,
            paymentKey,
        },
        lines
      );
    });

    return {
      orderId: saved.id,
      totalAmount: saved.total_amount.toString(),
      status: saved.status,
    };
  }

    async preparePayment(data: {
    storeId: number;
    tableNumber: number;
    items: OrderItemInput[];
    total: number;
  }): Promise<{ ok: boolean; amount: number; orderId: string; reason?: string }> {
    const { storeId, tableNumber, items, total } = data;

    if (!storeId || !tableNumber) {
      return { ok: false, amount: 0, orderId: "", reason: "요청 값이 올바르지 않습니다." };
    }
    if (!items?.length) {
      return { ok: false, amount: 0, orderId: "", reason: "빈 주문입니다." };
    }

    const menuIds = items.map(i => i.id);
    const menus = await this.orderRepository.getMenusByIdsInStore(menuIds, storeId);
    if (menus.length !== menuIds.length) {
      return { ok: false, amount: 0, orderId: "", reason: "존재하지 않거나 매장 소속이 아닌 메뉴가 포함되어 있습니다." };
    }
    const notAvail = menus.find(m => !m.is_available);
    if (notAvail) {
      return { ok: false, amount: 0, orderId: "", reason: `품절/비판매 메뉴 포함: ${notAvail.name}` };
    }

    const { serverTotal } = this.buildLinesAndTotal(
      menus.map(m => ({ id: m.id, price: m.price as Prisma.Decimal })),
      items as OrderItemInput[]
    );

    const amountNumber = Number(serverTotal);
    const ok = serverTotal.eq(new Prisma.Decimal(total));

    const orderId = `order_${storeId}_${tableNumber}_${Date.now()}_${randomUUID().slice(0, 8)}`;

    return ok
      ? { ok: true, amount: amountNumber, orderId }
      : { ok: false, amount: amountNumber, orderId, reason: "금액이 변경되었습니다. 다시 확인해 주세요." };
  }
}