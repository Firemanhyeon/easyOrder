import { Request, Response, NextFunction } from "express";
import prisma from '../config/database';

export const ownStoreGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) 관리자면 통과
    if (req.user?.role === 'admin') return next();

    const ownerId = req.user?.id;
    if (!ownerId) return res.status(401).json({ message: '인증이 필요합니다.' });

    let storeId: number | undefined;

    // 2) URL 파라미터에서 먼저 시도
    // /stores/:storeId 처럼 명시적인 경우
    if (req.params.storeId !== undefined) {
      const n = Number(req.params.storeId);
      if (!Number.isNaN(n)) storeId = n;
    }
    // 일부 라우트가 /stores/:id 일 수도 있으므로 baseUrl로 구분
    if (!storeId && req.params.id !== undefined) {
      const n = Number(req.params.id);
      if (!Number.isNaN(n)) {
        if (req.baseUrl?.includes('/stores')) {
          // /api/stores/:id → storeId로 사용
          storeId = n;
        }
      }
    }

    // 3) Body에서 시도 (snake & camel 모두 지원)
    if (!storeId) {
      const b = req.body ?? {};
      const raw = b.store_id ?? b.storeId;
      if (raw !== undefined) {
        const n = Number(raw);
        if (!Number.isNaN(n)) storeId = n;
      }
    }

    // 4) 메뉴 라우트에서 /menu/:id 같은 경우 → 메뉴아이템으로 역조회
    if (!storeId && req.baseUrl?.includes('/menu') && req.params.id !== undefined) {
      const menu = await prisma.menu_items.findUnique({
        where: { id: Number(req.params.id) },
        select: { store_id: true },
      });
      if (menu) storeId = menu.store_id;
    }

    if (!storeId) {
      return res.status(400).json({ message: 'store_id가 필요합니다.' });
    }

    // 5) 실제 소유자 검증
    const store = await prisma.stores.findUnique({
      where: { id: storeId },
      select: { admin_id: true },
    });
    if (!store) return res.status(404).json({ message: '매장을 찾을 수 없습니다.' });

    if (store.admin_id !== ownerId) {
      return res.status(403).json({ message: '권한이 없습니다. (매장 소유자 아님)' });
    }

    next();
  } catch (e) {
    next(e);
  }
};
