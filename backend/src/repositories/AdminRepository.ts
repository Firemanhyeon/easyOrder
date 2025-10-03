import bcrypt from 'bcrypt';
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

export interface Store {
  id: number;
  name: string;
}

export class AdminRepository {
  constructor(private prisma: PrismaClient) {}

  // 모든 관리자 조회
  async findAll() {
    return this.prisma.admins.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  // ID로 관리자 조회
  async findById(id: number) {
    return this.prisma.admins.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });
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
    role: 'store_owner' | 'admin';
  }) {
    return this.prisma.admins.create({
      data: {
        ...data,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  // 관리자 수정
  async update(id: number, data: { name?: string; password?: string }) {
    return this.prisma.admins.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  // 관리자 삭제
  async delete(id: number) {
    return this.prisma.admins.delete({
      where: { id },
    });
  }

  async validatePassword(admin: any, password: string) {
    return bcrypt.compare(password, admin.password);
  }

  async findStoreByAdminId(adminId: number) {
    return this.prisma.stores.findFirst({
      where: { admin_id: adminId }
    });
  }
} 