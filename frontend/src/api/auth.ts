import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: {
    id: number;
    email: string;
    name: string;
    role: 'admin' | 'store_owner';
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  console.log('Attempting login to:', `${API_URL}/auth/login`);
  console.log('With credentials:', { email });
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    console.log('Login response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<LoginResponse['admin']> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}; 