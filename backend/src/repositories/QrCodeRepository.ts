import { PrismaClient } from '@prisma/client';

export class QrCodeRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async createQrCode(data: {
        store_id: number;
        table_number: number;
        image_url: string;
        qr_link: string; // qrLink 필드 추가
    }) {
        return this.prisma.qr_codes.create({
            data: {
                store_id: data.store_id,
                table_number: data.table_number,
                image_url: data.image_url,
                qr_link: data.qr_link
            }
        });
    }

    async deleteQrCode(id: number) {
        return this.prisma.qr_codes.delete({
            where: { id }
        });
    }

    async getQrCodesByStoreId(store_id: number) {
        return this.prisma.qr_codes.findMany({
            where: { store_id }
        });
    }

    async getQrCodeByTableNumber(store_id: number, table_number: number) {
        return this.prisma.qr_codes.findFirst({
            where: {
                store_id,
                table_number
            }
        });
    }

    async getQrCodeByStoreIdAndTableNumber(store_id: number, table_number: number) {
        return this.prisma.qr_codes.findFirst({
            where: {
                store_id,
                table_number
            }
        });
    }

    async getStoreByQrCode(image_url: string) {
        return this.prisma.qr_codes.findUnique({
            where: { image_url },
            include: { store: true }
        });
    }

    async getQrCodeById(id: number) {
        return this.prisma.qr_codes.findUnique({
            where: { id }
        });
    }
}