import { PrismaClient } from '@prisma/client';
import { AdminRepository } from '../repositories/AdminRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/AuthRepository';
import prisma from '../config/database';

const VALID_ROLES = ['admin', 'store_owner'] as const;

type AdminRole = (typeof VALID_ROLES)[number];

export class AuthService {
  private adminRepository: AdminRepository;
  private prisma: PrismaClient;
  private authRepository: AuthRepository;

  constructor(prismaClient: PrismaClient = prisma) {
    this.prisma = prismaClient;
    this.adminRepository = new AdminRepository(this.prisma);
    this.authRepository = new AuthRepository(this.prisma);
  }

  // 로그인
  async login(email: string, password: string) {
    const admin = await this.authRepository.findByEmail(email);
    if (!admin) {
      throw new Error('이메일 또는 비밀번호가 일치하지 않습니다111.');
    }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    // const isPasswordValid = password;
    if (!isPasswordValid) {
      throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }

  // 회원가입
  async register(email: string, password: string, name: string, role: string) {
    // 이메일 중복 체크
    const existingAdmin = await this.authRepository.findByEmail(email);
    if (existingAdmin) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }

    // role 유효성 검사
    if (!VALID_ROLES.includes(role as AdminRole)) {
      throw new Error('유효하지 않은 역할입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 관리자 생성
    const admin = await this.authRepository.create({
      email,
      password: hashedPassword,
      name,
      role: role as AdminRole,
    });

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
  }

  // 현재 로그인한 관리자 정보 조회
  async getCurrentAdmin(id: number) {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new Error('관리자를 찾을 수 없습니다.');
    }
    return admin;
  }
} 