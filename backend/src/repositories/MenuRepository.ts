import { PrismaClient, Prisma } from '@prisma/client';

export class MenuRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // ========== 조회 ==========

  // 가게 ID로 카테고리 조회
  async getCategorysByStoreId(storeId: number) {
    const store = await this.prisma.stores.findUnique({ where: { id: storeId } });
    if (!store) throw new Error('Store not found');

    return this.prisma.menu_categories.findMany({
      where: { store_id: store.id },
      orderBy: { id: 'asc' },
    });
  }

  // 가게 ID로 메뉴 조회 (전체 보기용) - global_order 기준
  async getMenuByStoreId(storeId: number) {
    const store = await this.prisma.stores.findUnique({ where: { id: storeId } });
    if (!store) throw new Error('Store not found');

    return this.prisma.menu_items.findMany({
      where: { store_id: store.id },
      orderBy: [{ global_order: 'asc' }, { id: 'asc' }], // 🔁 스키마의 global_order 사용
    });
  }

  // 카테고리별 메뉴 조회 (다대다 + 카테고리 정렬 사용)
  async getMenuByCategory(categoryId: number, storeId: number) {
    // 조인 테이블을 기준으로 item_order 정렬해서 아이템 반환
    const links = await this.prisma.menu_item_categories.findMany({
      where: {
        category_id: categoryId,
        item: { store_id: storeId },
      },
      orderBy: { item_order: 'asc' }, // 🔁 스키마의 item_order 사용
      include: { item: true },
    });

    return links.map((l) => l.item);
  }

  // 메뉴 ID로 메뉴 조회
  async getMenuItemById(id: number) {
    return this.prisma.menu_items.findUnique({ where: { id } });
  }

  // ========== 생성/수정 ==========

  // 메뉴 추가
  // - menu_items에 생성하면서 (legacy 호환 위해) category_id도 함께 기록
  // - menu_item_categories에 링크 + item_order 넣어둔다.
  async createMenuItem(data: {
    storeId: number;
    name: string;
    description: string;
    price: number;
    categoryId: number;
    imageUrl: string | null;
    isAvailable?: boolean;
  }) {
    const { storeId, name, description, price, categoryId, imageUrl, isAvailable = true } = data;

    return this.prisma.$transaction(async (tx) => {
      // global_order = 현재 개수(또는 max+1)로 잡아 간단 정렬
      const countInStore = await tx.menu_items.count({ where: { store_id: storeId } });
      const nextGlobalOrder = countInStore; // 0부터 시작

      // 해당 카테고리 내 다음 item_order
      const agg = await tx.menu_item_categories.aggregate({
        where: { category_id: categoryId },
        _max: { item_order: true },
      });
      const nextItemOrder = (agg._max.item_order ?? -1) + 1;

      const item = await tx.menu_items.create({
        data: {
          store_id: storeId,
          name,
          description,
          price,
          image_url: imageUrl ?? undefined,
          is_available: isAvailable,
          // ⚠️ 스키마에 category_id 컬럼이 있으므로 legacy 호환을 위해 같이 채워줌
          category_id: categoryId,
          global_order: nextGlobalOrder, // 🔁 스키마의 global_order
        },
      });

      await tx.menu_item_categories.create({
        data: {
          item_id: item.id,
          category_id: categoryId,
          item_order: nextItemOrder, // 🔁 스키마의 item_order
        },
      });

      return item;
    });
  }

  // 메뉴 수정 (부분 업데이트 허용)
  async updateMenuItem(id: number, data: {
    name?: string;
    description?: string;
    price?: Prisma.Decimal | number;
    image_url?: string;
    is_available?: boolean;
  }) {
    return this.prisma.menu_items.update({
      where: { id },
      data,
    });
  }

  // ========== 정렬 저장용(서비스에서 트랜잭션으로 호출) ==========

  // 이 매장 소속 아이템 개수(검증용)
  async countItemsInStore(itemIds: number[], storeId: number) {
    if (!itemIds.length) return 0;
    return this.prisma.menu_items.count({
      where: { id: { in: itemIds }, store_id: storeId },
    });
  }

  // 해당 카테고리가 이 매장 소속인지 검증
  async verifyCategoryInStore(categoryId: number, storeId: number) {
    return this.prisma.menu_categories.findFirst({
      where: { id: categoryId, store_id: storeId },
      select: { id: true },
    });
  }

  // "전체" 정렬 저장: menu_items.global_order 업데이트
  updateGlobalOrderTx(
    tx: Prisma.TransactionClient,
    rows: { itemId: number; position: number }[],
  ) {
    return Promise.all(
      rows.map(({ itemId, position }) =>
        tx.menu_items.update({
          where: { id: itemId },
          data: { global_order: position }, // 🔁 global_order
        })
      )
    );
  }

  // 카테고리별 정렬 저장: menu_item_categories upsert + item_order 갱신
  upsertCategoryOrderTx(
    tx: Prisma.TransactionClient,
    categoryId: number,
    rows: { itemId: number; position: number }[],
  ) {
    return Promise.all(
      rows.map(({ itemId, position }) =>
        tx.menu_item_categories.upsert({
          where: {
            // 🔁 @@unique([item_id, category_id]) 로 생성되는 WhereUniqueInput 키
            item_id_category_id: { item_id: itemId, category_id: categoryId },
          },
          update: { item_order: position },      // 🔁 item_order
          create: { item_id: itemId, category_id: categoryId, item_order: position },
        })
      )
    );
  }

  // 카테고리 추가
  async createCategory(data: { storeId: number; name: string }) {
    const { storeId, name } = data;
    return this.prisma.menu_categories.create({
      data: {
        store_id: storeId,
        name,
      },
    });
  }
}
