import { Request, Response } from 'express';
import { StoreService } from '../services/StoreService';

export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // 매장 목록 조회
  getStores = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    // 로그인 유저 정보 전달 (role, id)
    const user = req.user!;
    const stores = await this.storeService.getStores(user, page, pageSize);

    res.json(stores);
  } catch (error: any) {
    res.status(500).json({
      message: '매장 목록 조회에 실패했습니다.',
      detail: error.message || error.toString(),
    });
  }
};

  // 매장 상세 조회
  getStoreById = async (req: Request, res: Response) => {
    try {
      const store = await this.storeService.getStoreById(parseInt(req.params.id));
      if (!store) {
        return res.status(404).json({ message: '매장을 찾을 수 없습니다.' });
      }
      res.json(store);
    } catch (error) {
      res.status(500).json({ message: '매장 정보를 불러오는데 실패했습니다.' });
    }
  };

  // 매장 생성
  createStore = async (req: Request, res: Response) => {
    try {
      const { name, address, phone, admin_id } = req.body;
      const parseId = Number(admin_id);
      // 필수 필드 검증
      if (!name || !address || !phone || !admin_id) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
      }

      const store = await this.storeService.createStore({
        name,
        address,
        phone,
        admin_id: parseId,
      });

      res.status(201).json(store);
    } catch (error) {
      res.status(500).json({ message: '매장 생성에 실패했습니다.' });
    }
  };

  // 매장 삭제
  deleteStore = async (req: Request, res: Response) => {
    try {
      const store = await this.storeService.getStoreById(parseInt(req.params.id));
      if (!store) {
        return res.status(404).json({ message: '매장을 찾을 수 없습니다.' });
      }

      await this.storeService.deleteStore(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: '매장 삭제에 실패했습니다.' });
    }
  };

  // QR 코드 생성
  createQrCode = async (req: Request, res: Response) => {
    try {
      const storeId = parseInt(req.params.id);
      const { table_number } = req.body;
      if (!table_number) {
        return res.status(400).json({ message: '테이블 번호를 입력해주세요.' });
      }

      const qrCode = await this.storeService.createQrCode(storeId, table_number);
      res.status(201).json(qrCode);
    } catch (error : any) {
      res.status(500).json({ 
        message: 'QR 코드 생성에 실패했습니다.',
        detail: error.message || error.toString()
       });
    }
  };
  
  // 특정 매장의 QR 코드 목록 조회
  getQrCodesByStoreId = async (req: Request, res: Response) => {
    try {
      const storeId = parseInt(req.params.id);
      const qrCodes = await this.storeService.getQrCodesByStoreId(storeId);
      res.json(qrCodes);
    } catch (error) {
      res.status(500).json({ message: 'QR 코드 목록을 불러오는데 실패했습니다.' });
    }
  };

  // QR 코드 삭제
  deleteQrCode = async (req: Request, res: Response) => {
    try {
      const qrCodeId = parseInt(req.params.id);
      console.log("QR코드아이디", qrCodeId);
      const result = await this.storeService.deleteQrCode(qrCodeId);
      res.status(204).send(result);
    } catch (error) {
      res.status(500).json({ message: 'QR 코드 삭제에 실패했습니다.' });
    }
  }
}