import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileService } from '../../services/profileService';
import type { UserProfile, ProfileUpdateData, SkillFormData } from '../../types/profile';

interface ProfileState {
  profile: UserProfile | null;
  profileCompletion: number;
  isLoading: boolean;
  error: string | null;
  uploadingAvatar: boolean;
}

const initialState: ProfileState = {
  profile: null,
  profileCompletion: 0,
  isLoading: false,
  error: null,
  uploadingAvatar: false,
};

// Async thunks
export const getProfile = createAsyncThunk(
  'profile/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await profileService.getProfile();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: ProfileUpdateData, { rejectWithValue }) => {
    try {
      const data = await profileService.updateProfile(profileData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async (file: File, { rejectWithValue }) => {
    try {
      const data = await profileService.uploadAvatar(file);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload avatar');
    }
  }
);

export const deleteAvatar = createAsyncThunk(
  'profile/deleteAvatar',
  async (_, { rejectWithValue }) => {
    try {
      const data = await profileService.deleteAvatar();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete avatar');
    }
  }
);

export const addSkill = createAsyncThunk(
  'profile/addSkill',
  async (skill: SkillFormData, { rejectWithValue }) => {
    try {
      const data = await profileService.addSkill(skill);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add skill');
    }
  }
);

export const updateSkill = createAsyncThunk(
  'profile/updateSkill',
  async ({ skillId, skill }: { skillId: string; skill: Partial<SkillFormData> }, { rejectWithValue }) => {
    try {
      const data = await profileService.updateSkill(skillId, skill);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update skill');
    }
  }
);

export const deleteSkill = createAsyncThunk(
  'profile/deleteSkill',
  async (skillId: string, { rejectWithValue }) => {
    try {
      const data = await profileService.deleteSkill(skillId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete skill');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetProfile: (state) => {
      state.profile = null;
      state.profileCompletion = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
        state.profileCompletion = action.payload.profileCompletion;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
        state.profileCompletion = action.payload.profileCompletion;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Upload Avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.uploadingAvatar = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.uploadingAvatar = false;
        if (state.profile) {
          state.profile.avatar = action.payload.avatar;
        }
        state.profileCompletion = action.payload.profileCompletion;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.uploadingAvatar = false;
        state.error = action.payload as string;
      })
      
      // Delete Avatar
      .addCase(deleteAvatar.pending, (state) => {
        state.uploadingAvatar = true;
        state.error = null;
      })
      .addCase(deleteAvatar.fulfilled, (state, action) => {
        state.uploadingAvatar = false;
        if (state.profile) {
          state.profile.avatar = undefined;
        }
        state.profileCompletion = action.payload.profileCompletion;
      })
      .addCase(deleteAvatar.rejected, (state, action) => {
        state.uploadingAvatar = false;
        state.error = action.payload as string;
      })
      
      // Add Skill
      .addCase(addSkill.pending, (state) => {
        state.error = null;
      })
      .addCase(addSkill.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.skills = action.payload.skills;
        }
        state.profileCompletion = action.payload.profileCompletion;
      })
      .addCase(addSkill.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Update Skill
      .addCase(updateSkill.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.skills = action.payload.skills;
        }
        state.profileCompletion = action.payload.profileCompletion;
      })
      .addCase(updateSkill.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Delete Skill
      .addCase(deleteSkill.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.skills = action.payload.skills;
        }
        state.profileCompletion = action.payload.profileCompletion;
      })
      .addCase(deleteSkill.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetProfile } = profileSlice.actions;
export default profileSlice.reducer;