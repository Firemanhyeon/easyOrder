import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 로그인
  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
      }
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (error) {
      console.error('AuthController login error:', error);
      if (error instanceof Error) {
        return res.status(401).json({ message: error.message });
      }
      res.status(500).json({ message: '로그인에 실패했습니다.' });
    }
  };

  // 회원가입
  register = async (req: Request, res: Response) => {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password || !name || !role) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
      }

      const result = await this.authService.register(email, password, name, role);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: '회원가입에 실패했습니다.' });
    }
  };

  // 현재 로그인한 관리자 정보 조회
  getCurrentAdmin = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '인증이 필요합니다.' });
      }
      const admin = await this.authService.getCurrentAdmin(req.user.id);
      res.json(admin);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };
} 