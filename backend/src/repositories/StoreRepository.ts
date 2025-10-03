import { PrismaClient } from '@prisma/client';

export class StoreRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // 페이지네이션을 포함한 매장 목록 조회
  async findAll(page: number = 1, pageSize: number = 10, where: any = {}) {
  if (page < 1) page = 1;
  if (pageSize < 1) pageSize = 10;

  const [stores, total] = await Promise.all([
    this.prisma.stores.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { id: 'desc' },
      include: {
        admin: { select: { id: true, email: true, name: true } },
      },
    }),
    this.prisma.stores.count({ where }),
  ]);

  return { items: stores, total, page, pageSize };
}

  // ID로 매장 조회
  async findById(id: number) {
    try {
      return await this.prisma.stores.findUnique({
        where: { id },
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('매장 조회 중 오류 발생:', error);
      throw new Error('매장 정보를 불러오는데 실패했습니다.');
    }
  }

  // 매장 생성
  async create(data: {
    name: string;
    address: string;
    phone: string;
    admin_id: number;
  }) {
    try {
      return await this.prisma.stores.create({
        data,
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('매장 생성 중 오류 발생:', error);
      throw new Error('매장 생성에 실패했습니다.');
    }
  }

  // 매장 삭제
  async delete(id: number) {
    try {
      return await this.prisma.stores.delete({
        where: { id },
      });
    } catch (error) {
      console.error('매장 삭제 중 오류 발생:', error);
      throw new Error('매장 삭제에 실패했습니다.');
    }
  }
} 