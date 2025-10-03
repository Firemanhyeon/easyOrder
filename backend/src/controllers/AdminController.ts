import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthService } from '../services/AuthService';
import { AdminService } from '../services/AdminService';


export class AdminController {
    private adminService: AdminService;
    private authService: AuthService;

    constructor() {
        this.adminService = new AdminService();
        this.authService = new AuthService();
    }


    //점주생성
    createOwner =  async(req: Request, res: Response) => {
        try {
          const { email, password, name } = req.body;
          // 비밀번호 해시
          
          // 관리자 계정 생성
          const admin = await this.adminService.createAdmin(email, password, name);
    
          res.status(201).json({
            message: '관리자 계정이 생성되었습니다.',
            admin: {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: admin.role
            }
          });
        } catch (error) {
          res.status(400).json({ 
            message: error instanceof Error ? error.message : '관리자 계정 생성에 실패했습니다.' 
          });
        }
      }

    // 관리자 목록 조회
    getAdmins = async (req: Request, res: Response) => {
        try {
            console.log("관리자목록조회");
            const admins = await this.adminService.getAllAdmins();
            res.json(admins);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    // 관리자 생성
    createAdmin = async (req: Request, res: Response) => {
        try {
            const { email, password, name } = req.body;
            const admin = await this.adminService.createAdmin(email, password, name);
            res.status(201).json(admin);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    // 관리자 수정
    updateAdmin = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { name, password } = req.body;
            const admin = await this.adminService.updateAdmin(Number(id), { name, password });
            res.json(admin);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    // 관리자 삭제
    deleteAdmin = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this.adminService.deleteAdmin(Number(id));
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };
}