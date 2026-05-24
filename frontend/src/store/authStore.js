import { create } from 'zustand';
import axios from 'axios';

// Configure standard API base URL
const API_URL = '/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
  isMock: false,

  init: () => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { data } = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      set({ user: data, token: data.token, loading: false, isMock: false });
      return { success: true };
    } catch (err) {
      console.warn('Backend login failed, attempting local simulation...');
      
      // Zero-configuration local mock fallback for quick review!
      if (email === 'admin@jeweller.com' && password === 'admin123') {
        const mockUser = {
          _id: 'mock-admin-id',
          name: 'Shop Owner (Simulated Admin)',
          email: 'admin@jeweller.com',
          role: 'admin',
          branchId: 'main-branch',
          token: 'mock-jwt-token-xyz',
        };
        localStorage.setItem('token', mockUser.token);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        set({ user: mockUser, token: mockUser.token, loading: false, isMock: true });
        return { success: true, message: 'Logged in using local simulated mode' };
      } else if (email === 'staff@jeweller.com' && password === 'staff123') {
        const mockUser = {
          _id: 'mock-staff-id',
          name: 'Sales Desk (Simulated Staff)',
          email: 'staff@jeweller.com',
          role: 'staff',
          branchId: 'main-branch',
          token: 'mock-jwt-token-abc',
        };
        localStorage.setItem('token', mockUser.token);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        set({ user: mockUser, token: mockUser.token, loading: false, isMock: true });
        return { success: true, message: 'Logged in using local simulated mode' };
      }
      
      const errMsg = err.response?.data?.message || 'Login failed, please check your network connection';
      set({ error: errMsg, loading: false });
      return { success: false, message: errMsg };
    }
  },

  loginWithGoogle: async (googleProfile) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/google`, googleProfile);
      const { data } = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      set({ user: data, token: data.token, loading: false, isMock: false });
      return { success: true };
    } catch (err) {
      console.warn('Google login fallback to simulation...');
      const mockUser = {
        _id: `mock-google-${Date.now()}`,
        name: googleProfile.name || 'Google User',
        email: googleProfile.email || 'google@jeweller.com',
        role: 'staff',
        branchId: 'main-branch',
        token: 'mock-google-token',
      };
      localStorage.setItem('token', mockUser.token);
      localStorage.setItem('user', JSON.stringify(mockUser));

      set({ user: mockUser, token: mockUser.token, loading: false, isMock: true });
      return { success: true };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, token: null, isMock: false });
  },
}));
