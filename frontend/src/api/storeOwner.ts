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

export interface StoreOwner {
  id: number;
  email: string;
  name: string;
  role: 'admin';
  created_at: string;
  updated_at: string;
}

export interface CreateStoreOwnerData {
  email: string;
  password: string;
  name: string;
}

export interface UpdateStoreOwnerData {
  name?: string;
  password?: string;
}

// 점주 목록 조회
export const getStoreOwners = async () => {
  const response = await api.get('/store-owners');
  return response.data;
};

// 점주 생성
export const createStoreOwner = async (data: CreateStoreOwnerData) => {
  const response = await api.post('/store-owners', data);
  return response.data;
};

// 점주 수정
export const updateStoreOwner = async (id: number, data: UpdateStoreOwnerData) => {
  const response = await api.put(`/store-owners/${id}`, data);
  return response.data;
};

// 점주 삭제
export const deleteStoreOwner = async (id: number) => {
  const response = await api.delete(`/store-owners/${id}`);
  return response.data;
}; 