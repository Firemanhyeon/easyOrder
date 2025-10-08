import { Request, Response } from 'express';
import { MenuService } from '../services/menuService';
import { parse } from 'path';

export class MenuController {
  constructor(private readonly menuService: MenuService) {}


  // 가게 ID로 카테고리 조회
  getCategorysByStoreId = async (req: Request, res: Response) => {
    try {
      const { storeId } = req.params;
      const categories = await this.menuService.getCategorysByStoreId(parseInt(storeId));
      
      res.json(categories);
    } catch (error) {
      console.error('가게 카테고리 조회 에러:', error);
      res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
  }

  //가게 Id로 메뉴 조회
  getMenuByStoreId = async (req: Request, res: Response) => {
    try {
      const { storeId } = req.params;
      const menuItems = await this.menuService.getMenuByStoreId(parseInt(storeId));
      res.json(menuItems);
    } catch (error) {
      console.error('가게 메뉴 조회 에러:', error);
      res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
  }

  // 카테고리별 메뉴 조회
  getMenuByCategory = async (req: Request, res: Response) => {
    try {
      const { categoryId, storeId } = req.params;
      const menuItems = await this.menuService.getMenuByCategory(parseInt(categoryId), parseInt(storeId));
      if (!menuItems) {
        return res.status(404).json({ message: '메뉴를 찾을 수 없습니다.' });
      }
      res.json(menuItems);
    } catch (error) {
      console.error('카테고리별 메뉴 조회 에러:', error);
      res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
  }

  // 메뉴 추가
  createMenuItem = async (req: Request, res: Response) => {
    try {
      const { name, description, price, category_id, store_id } = req.body;
      const imageFile = req.file;
      if (!imageFile) {
        return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
      }
      const menuItem = await this.menuService.createMenuItem({
        storeId: parseInt(store_id),
        name,
        description,
        price: parseFloat(price),
        categoryId: parseInt(category_id),
        image: imageFile,
        isAvailable: true
      });
      res.status(201).json(menuItem);
    } catch (error) {
      console.error('메뉴 추가 에러:', error);
      res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
  }

  // 메뉴 수정
  updateMenuItem = async (req: Request, res: Response) => {
    try {
      const menuItemId = parseInt(req.params.id);
      const { name, description, price,  store_id , is_available } = req.body;
      const imageFile = req.file;
      // 이미지 파일이 선택적으로 제공될 수 있으므로, null일 수도 있습니다.
      const menuItem = await this.menuService.updateMenuItem(menuItemId,{
        name,
        description,
        price: parseFloat(price),
        image: imageFile,
        isAvailable: is_available
      });
      res.status(200).json(menuItem);
    } catch (error) {
      console.error('메뉴 수정 에러:', error);
      res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
  }

  // 메뉴 순서 저장
  saveSortOrder = async (req: Request, res: Response) => {
    try {
      console.log('메뉴 순서 저장 요청:', req.body);
      const { storeId, categoryId, order } = req.body;
      await this.menuService.saveSortOrder({ storeId, categoryId, order });
      res.status(200).json({ message: '메뉴 순서가 저장되었습니다.' });
    } catch (error) {
      console.error('메뉴 순서 저장 에러:', error);
      res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
  }

  // 카테고리 추가
  createCategory = async (req: Request, res: Response) => {
    try {
      const { storeId, name } = req.body;
      if (!storeId || !name) {
        return res.status(400).json({ message: 'storeId와 name이 필요합니다.' });
      }
      const category = await this.menuService.createCategory({ storeId: parseInt(storeId), name });
      res.status(201).json(category);
    } catch (error) {
      console.error('카테고리 추가 에러:', error);
      res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
  }

  
}
