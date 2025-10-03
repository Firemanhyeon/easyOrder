import { PrismaClient } from '@prisma/client';

export interface Admin {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'store_owner';
  created_at: Date;
  updated_at: Date;
}

export class AuthRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // 이메일로 관리자 조회
  async findByEmail(email: string) {
    return this.prisma.admins.findUnique({
      where: { email },
    });
  }

  // 관리자 생성
  async create(data: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'store_owner';
  }) {
    return this.prisma.admins.create({
      data,
    });
  }

  // ID로 관리자 조회
  async findById(id: number) {
    return this.prisma.admins.findUnique({
      where: { id },
    });
  }
} 