import{ Request, Response, NextFunction } from 'express';

type Role = 'admin' | 'store_owner';

export const roleGuard = (roles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role as Role | undefined;

    if(!role || !roles.includes(role)) {
        return res.status(403).json({ message: '권한이 없습니다.' });
    }
    next();
}