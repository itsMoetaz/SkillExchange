import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { skillService, type SearchFilters, type SkillSearchResult } from '../../services/skillService';

interface SkillState {
  skills: any[];
  userSkills: any[];
  trendingSkills: any[];
  categories: any[];
  popularSearches: string[];
  searchSuggestions: string[];
  currentSkill: any | null;
  
  // Pagination & Meta
  totalSkills: number;
  totalUserSkills: number;
  currentPage: number;
  hasMore: boolean;
  
  // Loading states
  isLoading: boolean;
  isSearching: boolean;
  isTrendingLoading: boolean;
  isCategoriesLoading: boolean;
  
  // Filters
  activeFilters: SearchFilters;
  
  // Error
  error: string | null;
}

const initialState: SkillState = {
  skills: [],
  userSkills: [],
  trendingSkills: [],
  categories: [],
  popularSearches: [],
  searchSuggestions: [],
  currentSkill: null,
  
  totalSkills: 0,
  totalUserSkills: 0,
  currentPage: 1,
  hasMore: false,
  
  isLoading: false,
  isSearching: false,
  isTrendingLoading: false,
  isCategoriesLoading: false,
  
  activeFilters: {
    page: 1,
    limit: 12,
    sortBy: 'relevance'
  },
  
  error: null,
};

// Async thunks
export const searchSkills = createAsyncThunk(
  'skills/searchSkills',
  async (filters: SearchFilters, { rejectWithValue }) => {
    try {
      const data = await skillService.searchSkills(filters);
      return { data, filters };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search skills');
    }
  }
);

export const getTrendingSkills = createAsyncThunk(
  'skills/getTrendingSkills',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const data = await skillService.getTrendingSkills(limit);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trending skills');
    }
  }
);

export const getSkillCategories = createAsyncThunk(
  'skills/getSkillCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await skillService.getSkillCategories();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const getSearchSuggestions = createAsyncThunk(
  'skills/getSearchSuggestions',
  async (query: string, { rejectWithValue }) => {
    try {
      const data = await skillService.getSearchSuggestions(query);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suggestions');
    }
  }
);

export const getPopularSearches = createAsyncThunk(
  'skills/getPopularSearches',
  async (_, { rejectWithValue }) => {
    try {
      const data = await skillService.getPopularSearches();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch popular searches');
    }
  }
);

export const getSkillById = createAsyncThunk(
  'skills/getSkillById',
  async (skillId: string, { rejectWithValue }) => {
    try {
      const data = await skillService.getSkillById(skillId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch skill');
    }
  }
);

const skillSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateFilters: (state, action) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },
    clearSkills: (state) => {
      state.skills = [];
      state.userSkills = [];
      state.currentPage = 1;
      state.hasMore = false;
    },
    clearCurrentSkill: (state) => {
      state.currentSkill = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Search Skills
      .addCase(searchSkills.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchSkills.fulfilled, (state, action) => {
        state.isSearching = false;
        const { data, filters } = action.payload;
        
        if (filters.page === 1) {
          state.skills = data.skills;
          state.userSkills = data.userSkills;
        } else {
          state.skills = [...state.skills, ...data.skills];
          state.userSkills = [...state.userSkills, ...data.userSkills];
        }
        
        state.totalSkills = data.totalSkills;
        state.totalUserSkills = data.totalUserSkills;
        state.currentPage = data.currentPage;
        state.hasMore = data.hasMore;
        state.activeFilters = filters;
      })
      .addCase(searchSkills.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      })
      
      // Trending Skills
      .addCase(getTrendingSkills.pending, (state) => {
        state.isTrendingLoading = true;
      })
      .addCase(getTrendingSkills.fulfilled, (state, action) => {
        state.isTrendingLoading = false;
        state.trendingSkills = action.payload;
      })
      .addCase(getTrendingSkills.rejected, (state, action) => {
        state.isTrendingLoading = false;
        state.error = action.payload as string;
      })
      
      // Categories
      .addCase(getSkillCategories.pending, (state) => {
        state.isCategoriesLoading = true;
      })
      .addCase(getSkillCategories.fulfilled, (state, action) => {
        state.isCategoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(getSkillCategories.rejected, (state, action) => {
        state.isCategoriesLoading = false;
        state.error = action.payload as string;
      })
      
      // Search Suggestions
      .addCase(getSearchSuggestions.fulfilled, (state, action) => {
        state.searchSuggestions = action.payload;
      })
      
      // Popular Searches
      .addCase(getPopularSearches.fulfilled, (state, action) => {
        state.popularSearches = action.payload;
      })
      
      // Get Skill By ID
      .addCase(getSkillById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSkillById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSkill = action.payload;
      })
      .addCase(getSkillById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateFilters, clearSkills, clearCurrentSkill } = skillSlice.actions;
export default skillSlice.reducer;