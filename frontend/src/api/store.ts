import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// API 요청을 위한 axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  admin_id: number;
  created_at: string;
  updated_at: string;
  admin: {
    id: number;
    email: string;
    name: string;
  };
  qr_codes: {
    id: number;
    table_number: number;
    qr_code: string;
  }[];
}

export interface CreateStoreData {
  name: string;
  address: string;
  phone: string;
  admin_id: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 매장 목록 조회 (페이지네이션)
export const getStores = async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Store>> => {
  const response = await api.get('/stores', {
    params: { page, pageSize }
  });
  return response.data;
};

// 매장 생성
export const createStore = async (data: CreateStoreData): Promise<Store> => {
  const response = await api.post('/stores', data);
  return response.data;
};

// 매장 삭제
export const deleteStore = async (id: number): Promise<void> => {
  await api.delete(`/stores/${id}`);
};

// QR 코드 생성
export const createQrCode = async (storeId: number, tableNumber: number) => {
  const response = await api.post(`/stores/${storeId}/qr-codes`, {
    table_number: tableNumber,
  });
  return response.data;
};

// QR 코드 삭제
export const deleteQrCode = async (qrCodeId: number) => {
  await api.delete(`/qr-codes/${qrCodeId}`);
};

export const storeApi = {
  // 매장 목록 조회
  getStores: async (page: number = 1, pageSize: number = 10) => {
    const response = await api.get(`/stores?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  // 매장 상세 조회
  getStoreById: async (id: number) => {
    const response = await api.get(`/stores/${id}`);
    return response.data;
  },

  // QR 코드로 매장 조회
  getStoreByQrCode: async (qrCode: string) => {
    const response = await api.get(`/stores/qr/${qrCode}`);
    return response.data;
  },
  // 특정 매장의 QR 코드 목록 조회
  getQrCodes: async (storeId: number) => {
    const response = await api.get(`/stores/${storeId}/qr-codes`);
    return response.data;
  },

  // 매장 생성
  createStore: async (data: CreateStoreData) => {
    const response = await api.post('/stores', data);
    return response.data;
  },

  // 매장 삭제
  deleteStore: async (id: number) => {
    await api.delete(`/stores/${id}`);
  },

  // QR 코드 생성
  createQrCode: async (storeId: number, tableNumber: number) => {
    const response = await api.post(`/stores/${storeId}/qr-codes`, {
      table_number: tableNumber,
    });
    return response.data;
  },

  // QR 코드 삭제
  deleteQrCode: async (qrCodeId: number) => {
    await api.delete(`/stores/qr-codes/${qrCodeId}`);
  },
}; 