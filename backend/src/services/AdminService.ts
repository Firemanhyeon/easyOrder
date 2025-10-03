import { PrismaClient } from '@prisma/client';
import { AdminRepository } from '../repositories/AdminRepository';
import bcrypt from 'bcrypt';

export class AdminService {
  private adminRepository: AdminRepository;
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.adminRepository = new AdminRepository(this.prisma);
  }

  // 모든 관리자 조회
  async getAllAdmins() {
    return this.adminRepository.findAll();
  }

  // ID로 관리자 조회
  async getAdminById(id: number) {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new Error('관리자를 찾을 수 없습니다.');
    }
    return admin;
  }

  // 이메일로 관리자 조회
  async getAdminByEmail(email: string) {
    const admin = await this.adminRepository.findByEmail(email);
    if (!admin) {
      throw new Error('관리자를 찾을 수 없습니다.');
    }
    return admin;
  }

  // 관리자 생성
  async createAdmin(email: string, password: string, name: string) {
    // 이메일 중복 체크
    const existingAdmin = await this.adminRepository.findByEmail(email);
    if (existingAdmin) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);
    // const hashedPassword = password
    // 관리자 생성
    return this.adminRepository.create({
      email,
      password: hashedPassword,
      name,
      role: 'store_owner'
    });
  }

  // 관리자 수정
  async updateAdmin(id: number, data: { name?: string; password?: string }) {
    const admin = await this.getAdminById(id);

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.adminRepository.update(id, updateData);
  }

  // 관리자 삭제
  async deleteAdmin(id: number) {
    const admin = await this.getAdminById(id);
    await this.adminRepository.delete(id);
  }
} 