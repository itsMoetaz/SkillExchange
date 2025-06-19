import axios from 'axios';

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

export interface SearchFilters {
  query?: string;
  category?: string;
  level?: string[];
  type?: 'teaching' | 'learning' | 'both';
  location?: string;
  rating?: number;
  sortBy?: 'relevance' | 'rating' | 'popularity' | 'recent' | 'experience';
  page?: number;
  limit?: number;
}

export interface SkillSearchResult {
  skills: any[];
  userSkills: any[];
  totalSkills: number;
  totalUserSkills: number;
  currentPage: number;
  hasMore: boolean;
}

export const skillService = {
  // Search skills
  searchSkills: async (filters: SearchFilters): Promise<SkillSearchResult> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await apiClient.get(`/skills/search?${params.toString()}`);
    return response.data.data;
  },

  // Get trending skills
  getTrendingSkills: async (limit: number = 10): Promise<any[]> => {
    const response = await apiClient.get(`/skills/trending?limit=${limit}`);
    return response.data.data;
  },

  // Get skill categories
  getSkillCategories: async (): Promise<any[]> => {
    const response = await apiClient.get('/skills/categories');
    return response.data.data;
  },

  // Get search suggestions
  getSearchSuggestions: async (query: string): Promise<string[]> => {
    const response = await apiClient.get(`/skills/suggestions?q=${encodeURIComponent(query)}`);
    return response.data.data;
  },

  // Get popular searches
  getPopularSearches: async (): Promise<string[]> => {
    const response = await apiClient.get('/skills/popular-searches');
    return response.data.data;
  },

  // Get skill by ID
  getSkillById: async (skillId: string): Promise<any> => {
    const response = await apiClient.get(`/skills/${skillId}`);
    return response.data.data;
  },
};