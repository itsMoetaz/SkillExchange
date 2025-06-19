import axios from 'axios';
import type { UserProfile, ProfileUpdateData, SkillFormData } from '../types/profile';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const profileService = {
  // Get user profile
  getProfile: async (): Promise<{ user: UserProfile; profileCompletion: number }> => {
    const response = await apiClient.get('/profile');
    return response.data.data;
  },

  // Update profile
  updateProfile: async (data: ProfileUpdateData): Promise<{ user: UserProfile; profileCompletion: number }> => {
    const response = await apiClient.put('/profile', data);
    return response.data.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ avatar: string; profileCompletion: number }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Delete avatar
  deleteAvatar: async (): Promise<{ profileCompletion: number }> => {
    const response = await apiClient.delete('/profile/avatar');
    return response.data.data;
  },

  // Add skill
  addSkill: async (skill: SkillFormData): Promise<{ skills: any[]; profileCompletion: number }> => {
    const response = await apiClient.post('/profile/skills', skill);
    return response.data.data;
  },

  // Update skill
  updateSkill: async (skillId: string, skill: Partial<SkillFormData>): Promise<{ skills: any[]; profileCompletion: number }> => {
    const response = await apiClient.put(`/profile/skills/${skillId}`, skill);
    return response.data.data;
  },

  // Delete skill
  deleteSkill: async (skillId: string): Promise<{ skills: any[]; profileCompletion: number }> => {
    const response = await apiClient.delete(`/profile/skills/${skillId}`);
    return response.data.data;
  },

  deleteAccount: async (reason?: string): Promise<void> => {
  const response = await apiClient.delete('/profile/account', {
    data: { reason }
  });
  return response.data.data;
},

  // Get skill categories
  getSkillCategories: async (): Promise<{ categories: string[] }> => {
    const response = await apiClient.get('/profile/categories');
    return response.data.data;
  },
};