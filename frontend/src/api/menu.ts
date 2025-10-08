// src/api/menu.ts
import axios from 'axios';
import { MenuItem, MenuCategory } from '../types/menu';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const menuApi = {
  // 조회 계열
  getMenuByQR: async (qrCode: string): Promise<MenuItem> => {
    const { data } = await api.get(`/menu/${qrCode}`);
    return data;
  },

  getCategorysByStoreId: async (storeId: number): Promise<MenuCategory[]> => {
    const { data } = await api.get(`/menu/${storeId}/categories`);
    return data;
  },

  getMenuByStoreId: async (storeId: number): Promise<MenuItem[]> => {
    const { data } = await api.get(`/menu/${storeId}/items`);
    return data;
  },

  getMenuByCategory: async (storeId: number, categoryId: number): Promise<MenuItem[]> => {
    console.log('getMenuByCategory', { storeId, categoryId });
    const { data } = await api.get(`/menu/${storeId}/category/${categoryId}`);
    return data;
  },

  // 파일 업로드 계열만 multipart로
  createMenuItem: async (form: FormData): Promise<MenuItem> => {
    const { data } = await api.post(`/menu`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
// 메뉴 수정
  updateMenuItem: async (id: number, form: FormData): Promise<MenuItem> => {
    const { data } = await api.put(`/menu/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

 // 메뉴 순서 저장
  saveSortOrder: async (payload: {
    storeId: number;
    categoryId: number | 'all';
    order: { itemId: number; position: number }[];
  }) => {
    return api.post(`/menu/sort`, payload);
  },

  // 카테고리 추가
  createCategory: async (data: { storeId: number; name: string }) => {
    const { data: res } = await api.post(`/menu/category`, data);
    return res;
  },

  // 주문 생성
  createOrder: async (storeId: number, tableNumber: string, items: { id: number; qty: number }[], total: number) => {
    const { data } = await api.post(`/order`, { storeId, tableNumber, items, total });
    return data;
  },

  // 결제 승인
  confirmPayment: async (paymentKey: string, orderId: string, amount: number) => {
    const { data } = await api.post(`/payment/confirm`, { paymentKey, orderId, amount });
    return data;
  },

  //결제전 데이터체크
  prepareCheckout: async (storeId: number , tableNumber: String , items: {id: number; qty: number}[], total:number) => {
    const { data } = await api.post(`/order/preparePayment` , {storeId , tableNumber , items , total});
    return data;
  }
};
