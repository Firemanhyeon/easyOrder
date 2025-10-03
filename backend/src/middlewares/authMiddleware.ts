import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/** 역할 유니온 타입을 전역으로 주입 */
declare global {
  namespace Express {
    type Role = 'admin' | 'store_owner';

    interface UserPayload {
      id: number;
      email: string;
      role: Role;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: '인증 헤더가 없습니다.' });
    }
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '잘못된 인증 형식입니다.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: '토큰이 없습니다.' });

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    // 1) 토큰 디코드 (role은 string으로 먼저 받음)
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: number;
      email: string;
      role: string;
    };

    // 2) 런타임 검증으로 역할을 유니온으로 좁힘
    const r = decoded.role;
    if (r !== 'admin' && r !== 'store_owner') {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }

    // 3) 타입이 보장된 형태로 req.user에 주입
    const user: Express.UserPayload = {
      id: decoded.id,
      email: decoded.email,
      role: r, // 'admin' | 'store_owner'
    };

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: '만료된 토큰입니다.' });
    }
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
