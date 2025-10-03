import { StoreRepository } from '../repositories/StoreRepository';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { QrCodeRepository } from '../repositories/QrCodeRepository';
type User = { id: number; role: 'admin' | 'store_owner' };

export class StoreService {
  private storeRepository: StoreRepository;
  private prisma: PrismaClient;
  private qrCodeRepository: QrCodeRepository;

  constructor() {
    this.prisma = new PrismaClient();
    this.storeRepository = new StoreRepository(this.prisma);
    this.qrCodeRepository = new QrCodeRepository(this.prisma);
  }

  private readonly s3 = new S3Client({ region: process.env.AWS_REGION });
  private readonly qrDomain = process.env.QR_DOMAIN;

  //** 매장 목록 조회  List: admin 전체 / store_owner 본인 것만 */
  async getStores(user: User, page: number, pageSize: number) {
    const where = user.role === 'admin' ? {} : { admin_id: user.id };
    return this.storeRepository.findAll(page, pageSize, where);
  }

  // 매장 상세 조회
  async getStoreById(id: number) {
    return this.storeRepository.findById(id);
  }

  // 매장 생성
  async createStore(data: {
    name: string;
    address: string;
    phone: string;
    admin_id: number;
  }) {
    return this.storeRepository.create(data);
  }

  // 매장 삭제
  async deleteStore(id: number) {
    return this.storeRepository.delete(id);
  }

  // QR 코드 생성
  async createQrCode(storeId: number, tableNumber: number) {
    //이미 존재하는 테이블 번호인지 확인
    const existingQrCode = await this.qrCodeRepository.getQrCodeByStoreIdAndTableNumber(storeId, tableNumber);
    if (existingQrCode) {
      throw new Error('이미 존재하는 테이블 번호입니다.');
    }

    //QR 코드 생성
    const qrLink = `${this.qrDomain}/store/menu/${storeId}?table=${tableNumber}`;
    //QR코드 이미지 생성
    const qrImageBuffer = await QRCode.toBuffer(qrLink); // Buffer로 생성
    //QR코드 이미지 S3에 업로드
    
    const s3Key = `qr_codes/store_${storeId}_table_${tableNumber}_${Date.now()}.png`;
    try {
  await this.s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: s3Key,
      Body: qrImageBuffer,
      ContentType: 'image/png',
    }));
    console.log('S3 업로드 성공:', s3Key);
  } catch (error) {
    console.error('S3 업로드 에러:', error);
    throw error; // 에러를 상위로 전달
  }

    const qrImageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    //DB에 QR코드 정보 저장
    return this.qrCodeRepository.createQrCode({
      store_id: storeId,
      table_number: tableNumber,
      image_url: qrImageUrl,
      qr_link: qrLink
    });
  }
  // 특정 매장의 QR 코드 목록 조회
  async getQrCodesByStoreId(storeId: number) {
    return this.qrCodeRepository.getQrCodesByStoreId(storeId);
  }

  // QR 코드 삭제
  async deleteQrCode(id: number) {
    const qr = await this.qrCodeRepository.getQrCodeById(id);
    if (!qr) {
      throw new Error('존재하지 않는 QR 코드입니다.');
    }

    const imageUrl = qr.image_url;
    try{
      // S3에서 이미지 삭제
      await this.s3.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: imageUrl.split('.amazonaws.com/')[1], // S3 객체 키 추출
      }))
    }catch(error: any){
      throw new Error('S3 이미지 삭제에 실패했습니다.');
    }

    await this.qrCodeRepository.deleteQrCode(id);

    return {success: true};
  }

} 