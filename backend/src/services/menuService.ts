import { MenuRepository } from '../repositories/MenuRepository';
import { PrismaClient , Prisma } from '@prisma/client';  
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import prisma from '../config/database';

type User = { id: number; role: 'admin' | 'store_owner' };

export class MenuService {
  private menuRepository: MenuRepository;
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient = prisma) {
    this.prisma = prismaClient;
    this.menuRepository = new MenuRepository(this.prisma);
  }
  private readonly s3 = new S3Client({ region: process.env.AWS_REGION });
  
  // 가게 ID로 카테고리 조회
  async getCategorysByStoreId(storeId: number) {
    return this.menuRepository.getCategorysByStoreId(storeId);
  }
  //가게 Id로 메뉴 조회
  async getMenuByStoreId(storeId: number) {
    return this.menuRepository.getMenuByStoreId(storeId);
  }

  // 카테고리별 메뉴 조회
  async getMenuByCategory(categoryId: number, storeId: number) {
    return this.menuRepository.getMenuByCategory(categoryId,storeId);
  } 

  // 메뉴 추가
  async createMenuItem(data: {
    storeId: number;
    name: string;
    description: string;
    price: number;
    categoryId: number;
    image: Express.Multer.File;
    isAvailable?: boolean;
  }) {
    const s3Key = `menus/store_${data.storeId}_${Date.now()}.png`;
    await this.s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: s3Key,
      Body: data.image.buffer,
      ContentType: data.image.mimetype,
    }));
    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    const menuItem = await this.menuRepository.createMenuItem({
      storeId: data.storeId,
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
      imageUrl,
      isAvailable: data.isAvailable ?? true,
    });
    return menuItem;
  }

  // 메뉴 수정
  async updateMenuItem(id: number, data: {
    name?: string;
    description?: string;
    price?: number;
    categoryId?: number;
    image?: Express.Multer.File | null;
    isAvailable?: boolean;
  }) {

    //S3 관련 
    const existingData = await this.menuRepository.getMenuItemById(id);
    if (!existingData) {
      throw new Error('메뉴를 찾을 수 없습니다.');
    }
    let imageUrl: string | undefined;
    if (data.image) {
      // 기존 이미지 삭제
      if (existingData.image_url) {
        try {
          await this.s3.send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: existingData.image_url.split('.amazonaws.com/')[1],
          }));
        } catch (error) {
          console.error('기존 사진 삭제 실패:', error);
        }
      }
    
      const s3Key = `menus/store_${existingData.store_id}_${Date.now()}.png`;
      await this.s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: s3Key,
        Body: data.image.buffer,
        ContentType: data.image.mimetype,
      }));
      imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    }

    const compact = <T extends Record<string, any>>(obj: T) =>
    Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== undefined)
    ) as Partial<T>;

    const toBool = (v: any) => {
      if (v === undefined) return undefined;
      if (typeof v === 'boolean') return v;
      const s = String(v).toLowerCase().trim();
      return s === 'true' || s === '1' || s === 'yes' || s === 'on';
    };
    const toDecimalOrUndefined = (v: any) => {
      if (v === undefined || v === null) return undefined;
      const s = typeof v === 'string' ? v.trim() : String(v);
      if (s === '' || Number.isNaN(Number(s))) return undefined; // NaN 차단
      try {
        return new Prisma.Decimal(s); // Prisma가 허용하는 안전한 형태
      } catch {
        return undefined;
      }
    };
    const menuItem = await this.menuRepository.updateMenuItem(id, {
      ...compact({
        name: data.name,
        description: data.description,
        image_url: imageUrl,
        is_available: toBool(data.isAvailable),
        price: toDecimalOrUndefined(data.price),
      }),
    });
    return menuItem;
  }

  // 메뉴 정렬
  async saveSortOrder(params: {
    storeId: number;
    categoryId: number | 'all';
    order: { itemId: number; position: number }[];
  }) {
    const { storeId, categoryId, order } = params;
    // 공통: 빈 배열이면 할 일 없음
    if (!Array.isArray(order) || order.length === 0) {
      return { success: true };
    }

    // 공통: 이 매장 소속 메뉴만 오는지 검증
    const itemIds = order.map(o => o.itemId);
    const count = await this.menuRepository.countItemsInStore(itemIds, storeId);
    if (count !== itemIds.length) {
      throw new Error('정렬 대상 중 이 매장 소속이 아닌 메뉴가 포함되어 있습니다.');
    }

    // position 정규화 (0..N-1)
    const normalized = order
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((o, idx) => ({ itemId: o.itemId, position: idx }));

    if (categoryId === 'all') {
      // ===== 전체 정렬: menu_items.global_position 갱신 =====
      console.log('전체 정렬:');
      await this.prisma.$transaction(async (tx) => {
        await this.menuRepository.updateGlobalOrderTx(tx, normalized);
      });
      return { success: true };
    } else {
      // ===== 카테고리별 정렬 =====
      console.log('카테고리별 정렬:');
      const cat = await this.menuRepository.verifyCategoryInStore(categoryId, storeId);
      if (!cat) {
        throw new Error('해당 매장의 카테고리가 아니거나 존재하지 않습니다.');
      }
      await this.prisma.$transaction(async (tx) => {
        await this.menuRepository.upsertCategoryOrderTx(tx, categoryId, normalized);
      });
      return { success: true };
    }
  }
  
  async createCategory(data: { storeId: number; name: string }) {
    return this.menuRepository.createCategory(data);
  }
}