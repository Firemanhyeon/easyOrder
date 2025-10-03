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

export interface Admin {
  id: number;
  email: string;
  name: string;
  role: 'admin';
  created_at: string;
  updated_at: string;
}

export interface CreateAdminData {
  email: string;
  password: string;
  name: string;
}

export interface UpdateAdminData {
  name?: string;
  password?: string;
}

// 관리자 목록 조회
export const getAdmins = async () => {
  const response = await api.get('/admins');
  return response.data;
};

// 관리자 생성
export const createAdmin = async (data: CreateAdminData) => {
  const response = await api.post('/admins', data);
  return response.data;
};

// 관리자 수정
export const updateAdmin = async (id: number, data: UpdateAdminData) => {
  const response = await api.put(`/admins/${id}`, data);
  return response.data;
};

// 관리자 삭제
export const deleteAdmin = async (id: number) => {
  const response = await api.delete(`/admins/${id}`);
  return response.data;
}; 