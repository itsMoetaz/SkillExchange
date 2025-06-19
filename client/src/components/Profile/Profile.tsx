import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store/store';
import { getProfile, updateProfile, uploadAvatar, deleteAvatar, deleteAccount } from '../../store/slices/profileSlice';
import { logout } from '../../store/slices/authSlice';
import AvatarUpload from './AvatarUpload';
import {
  UserCircleIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  CogIcon,
  MoonIcon,
  XMarkIcon,
  SunIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  
} from '@heroicons/react/24/outline';
import { useForm, Controller, type Resolver, type SubmitHandler, } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SKILL_CATEGORIES, SKILL_LEVELS, MEETING_TYPES } from '../../types/profile';
import type { ProfileUpdateData, SkillFormData } from '../../types/profile';
import { toggleTheme } from '../../store/slices/themeSlice';

// Form schemas
const basicInfoSchema = yup.object({
  name: yup.string().required('Name is required'),
  bio: yup.string().optional().max(500, 'Bio must be under 500 characters'),
  location: yup.object({
    city: yup.string().required('City is required'),
    country: yup.string().required('Country is required'),
  }),
  contact: yup.object({
    website: yup.string().url('Invalid website URL').optional().nullable(),
    linkedin: yup.string().url('Invalid LinkedIn URL').optional().nullable(),
    github: yup.string().url('Invalid GitHub URL').optional().nullable(),
  }),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

// Form interface types
interface BasicInfoData {
  name: string;
  bio?: string | undefined;
  location: {
    city: string;
    country: string;
  };
  contact: {
    website?: string | null;
    linkedin?: string | null;
    github?: string | null;
  };
}

interface SecurityData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface DeleteAccountData {
  confirmPassword: string;
  reason?: string;
}

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { profile, profileCompletion, isLoading, error, uploadingAvatar } = useSelector((state: RootState) => state.profile);
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';
  
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  // Form setup
const basicInfoForm = useForm<BasicInfoData>({
  resolver: yupResolver(basicInfoSchema) as Resolver<BasicInfoData>,
  mode: 'onChange',
  defaultValues: {
    name: profile?.name || '',
    bio: profile?.bio || '',
    location: {
      city: profile?.location?.city || '',
      country: profile?.location?.country || '',
    },
    contact: {
      website: profile?.contact?.website || '',
      linkedin: profile?.contact?.linkedin || '',
      github: profile?.contact?.github || '',
    },
  }
});

  const securityForm = useForm<SecurityData>({
    resolver: yupResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  // Update form values when profile is loaded
  useEffect(() => {
    if (profile) {
      basicInfoForm.reset({
        name: profile.name,
        bio: profile.bio || '',
        location: {
          city: profile.location?.city || '',
          country: profile.location?.country || '',
        },
        contact: {
          website: profile.contact?.website || '',
          linkedin: profile.contact?.linkedin || '',
          github: profile.contact?.github || '',
        }
      });
    }
  }, [profile, basicInfoForm]);

  // Avatar handlers
  const handleAvatarUpload = useCallback(async (file: File) => {
    await dispatch(uploadAvatar(file));
  }, [dispatch]);

  const handleAvatarDelete = useCallback(async () => {
    await dispatch(deleteAvatar());
  }, [dispatch]);

  // Form submit handlers
const handleBasicInfoSubmit: SubmitHandler<BasicInfoData> = useCallback(async (data) => {
  const profileData: ProfileUpdateData = {
    name: data.name,
    bio: data.bio,
    location: data.location,
    contact: {
      website: data.contact.website || undefined,
      linkedin: data.contact.linkedin || undefined,
      github: data.contact.github || undefined,
    },
  };

  const result = await dispatch(updateProfile(profileData));
  if (result.meta.requestStatus === 'fulfilled') {
    setIsEditing(false);
    
    // Remove the localStorage caching and hard redirect
    // Just navigate using React Router
    navigate('/dashboard');
  }
}, [dispatch, navigate]);

  const handlePasswordChange = useCallback(async (data: SecurityData) => {
    // This would connect to a password change API endpoint
    console.log('Changing password:', data);
    
    // Reset form after submission
    securityForm.reset({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  }, [securityForm]);

  // Account deletion handlers
  const handleDeleteAccountConfirm = useCallback(() => {
    setShowConfirmation(true);
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    try {
      await dispatch(deleteAccount({ reason: deleteReason })).unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  }, [dispatch, navigate, deleteReason]);

  // Tab options
  const tabOptions = [
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'account', label: 'Account', icon: CogIcon },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    } p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('/dashboard')}
          className={`mb-6 flex items-center gap-2 py-2 px-4 rounded-lg transition-colors duration-300 ${
            isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </motion.button>

        {/* Page Title */}
        <motion.h1
          className={`text-3xl font-bold mb-8 transition-colors duration-500 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Your Profile
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Profile Summary & Navigation */}
          <motion.div 
            className="lg:col-span-4 xl:col-span-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Profile Card */}
            <motion.div
              className={`rounded-2xl shadow-xl border backdrop-blur-xl transition-colors duration-500 overflow-hidden mb-6 ${
                isDark 
                  ? 'bg-gray-800/80 border-gray-700/50' 
                  : 'bg-white/80 border-gray-200/50'
              }`}
              layout
            >
              {/* Profile Header with Background */}
              <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                {/* Profile Avatar */}
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <AvatarUpload
                      avatarUrl={profile?.avatar}
                      onUpload={handleAvatarUpload}
                      onDelete={handleAvatarDelete}
                      loading={uploadingAvatar}
                    />
                    
                    {/* Profile Completion Indicator */}
                    <div className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                      <div className="relative w-6 h-6">
                        <svg className="w-6 h-6">
                          <circle 
                            className="text-gray-200 dark:text-gray-700" 
                            strokeWidth="3" 
                            stroke="currentColor" 
                            fill="transparent" 
                            r="10" 
                            cx="12" 
                            cy="12"
                          />
                          <circle 
                            className="text-green-500" 
                            strokeWidth="3" 
                            strokeDasharray={`${profileCompletion * 0.628} 100`}
                            strokeLinecap="round" 
                            stroke="currentColor" 
                            fill="transparent" 
                            r="10" 
                            cx="12" 
                            cy="12"
                          />
                        </svg>
                        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-semibold ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          {profileCompletion}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Profile Content */}
              <div className="pt-20 pb-6 px-6">
                <h2 className={`text-xl font-bold text-center mb-1 transition-colors duration-500 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {profile?.name || "User"}
                </h2>
                <p className={`text-sm text-center mb-4 transition-colors duration-500 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {profile?.location?.city && profile?.location?.country
                    ? `${profile.location.city}, ${profile.location.country}`
                    : "Location not set"}
                </p>
                
                {/* Profile Stats */}
                <div className="grid grid-cols-3 gap-2 mt-6 text-center">
                  <div>
                    <div className={`text-lg font-bold transition-colors duration-500 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {profile?.skills?.filter(s => s.isTeaching)?.length || 0}
                    </div>
                    <div className={`text-xs transition-colors duration-500 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Teaching
                    </div>
                  </div>
                  <div>
                    <div className={`text-lg font-bold transition-colors duration-500 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {profile?.skills?.filter(s => s.isLearning)?.length || 0}
                    </div>
                    <div className={`text-xs transition-colors duration-500 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Learning
                    </div>
                  </div>
                  <div>
                    <div className={`text-lg font-bold transition-colors duration-500 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {profile?.stats?.totalSessions || 0}
                    </div>
                    <div className={`text-xs transition-colors duration-500 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Sessions
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div
              className={`rounded-2xl shadow-xl border backdrop-blur-xl transition-colors duration-500 overflow-hidden ${
                isDark 
                  ? 'bg-gray-800/80 border-gray-700/50' 
                  : 'bg-white/80 border-gray-200/50'
              }`}
              layout
            >
              <nav className="p-2">
                {tabOptions.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-colors duration-300 ${
                      activeTab === tab.id
                        ? isDark 
                          ? 'bg-gray-700 text-white' 
                          : 'bg-gray-100 text-gray-900'
                        : isDark
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' 
                          : 'text-gray-700 hover:bg-gray-100/80'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
          
          {/* Right Column - Main Content */}
          <motion.div 
            className="lg:col-span-8 xl:col-span-9"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <motion.div
              className={`rounded-2xl shadow-xl border backdrop-blur-xl transition-colors duration-500 p-6 ${
                isDark 
                  ? 'bg-gray-800/80 border-gray-700/50' 
                  : 'bg-white/80 border-gray-200/50'
              }`}
              layout
            >
              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className={`flex items-center gap-3 p-4 mb-6 rounded-xl border ${
                      isDark 
                        ? 'bg-red-900/30 border-red-700/50 text-red-300' 
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  >
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence mode="wait">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className={`text-xl font-bold transition-colors duration-500 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        Profile Information
                      </h2>
                      
                      <motion.button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-colors duration-300 ${
                          isEditing
                            ? isDark 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-200 text-gray-700'
                            : isDark
                              ? 'bg-purple-600 text-white hover:bg-purple-700' 
                              : 'bg-purple-500 text-white hover:bg-purple-600'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isEditing ? (
                          <>
                            <XMarkIcon className="w-5 h-5" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <PencilSquareIcon className="w-5 h-5" />
                            Edit Profile
                          </>
                        )}
                      </motion.button>
                    </div>

                    {isEditing ? (
                      <form onSubmit={basicInfoForm.handleSubmit(handleBasicInfoSubmit)} className="space-y-6">
                        {/* Name */}
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Full Name *
                          </label>
                          <input
                            {...basicInfoForm.register('name')}
                            type="text"
                            className={`w-full p-3 rounded-lg border transition-colors duration-300 ${
                              isDark
                                ? 'bg-gray-700/50 border-gray-600 text-white focus:border-purple-500' 
                                : 'bg-white/70 border-gray-300 text-gray-900 focus:border-purple-500'
                            }`}
                          />
                          {basicInfoForm.formState.errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                              {basicInfoForm.formState.errors.name.message}
                            </p>
                          )}
                        </div>

                        {/* Bio */}
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Bio
                          </label>
                          <textarea
                            {...basicInfoForm.register('bio')}
                            rows={4}
                            className={`w-full p-3 rounded-lg border transition-colors duration-300 ${
                              isDark
                                ? 'bg-gray-700/50 border-gray-600 text-white focus:border-purple-500' 
                                : 'bg-white/70 border-gray-300 text-gray-900 focus:border-purple-500'
                            }`}
                          ></textarea>
                          {basicInfoForm.formState.errors.bio && (
                            <p className="mt-1 text-sm text-red-500">
                              {basicInfoForm.formState.errors.bio.message}
                            </p>
                          )}
                        </div>

                        {/* Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              City *
                            </label>
                            <input
                              {...basicInfoForm.register('location.city')}
                              type="text"
                              className={`w-full p-3 rounded-lg border transition-colors duration-300 ${
                                isDark
                                  ? 'bg-gray-700/50 border-gray-600 text-white focus:border-purple-500' 
                                  : 'bg-white/70 border-gray-300 text-gray-900 focus:border-purple-500'
                              }`}
                            />
                            {basicInfoForm.formState.errors.location?.city && (
                              <p className="mt-1 text-sm text-red-500">
                                {basicInfoForm.formState.errors.location.city.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Country *
                            </label>
                            <input
                              {...basicInfoForm.register('location.country')}
                              type="text"
                              className={`w-full p-3 rounded-lg border transition-colors duration-300 ${
                                isDark
                                  ? 'bg-gray-700/50 border-gray-600 text-white focus:border-purple-500' 
                                  : 'bg-white/70 border-gray-300 text-gray-900 focus:border-purple-500'
                              }`}
                            />
                            {basicInfoForm.formState.errors.location?.country && (
                              <p className="mt-1 text-sm text-red-500">
                                {basicInfoForm.formState.errors.location.country.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                          <h3 className={`text-lg font-medium mb-4 transition-colors duration-500 ${
                            isDark ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            Contact Information
                          </h3>
                          
                          <div className="space-y-4">
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Website
                              </label>
                              <input
                                {...basicInfoForm.register('contact.website')}
                                type="text"
                                placeholder="https://yourwebsite.com"
                                className={`w-full p-3 rounded-lg border transition-colors duration-300 ${
                                  isDark
                                    ? 'bg-gray-700/50 border-gray-600 text-white focus:border-purple-500' 
                                    : 'bg-white/70 border-gray-300 text-gray-900 focus:border-purple-500'
                                }`}
                              />
                              {basicInfoForm.formState.errors.contact?.website && (
                                <p className="mt-1 text-sm text-red-500">
                                  {basicInfoForm.formState.errors.contact.website.message}
                                </p>
                              )}
                            </div>
                            
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                LinkedIn
                              </label>
                              <input
                                {...basicInfoForm.register('contact.linkedin')}
                                type="text"
                                placeholder="https://linkedin.com/in/username"
                                className={`w-full p-3 rounded-lg border transition-colors duration-300 ${
                                  isDark
                                    ? 'bg-gray-700/50 border-gray-600 text-white focus:border-purple-500' 
                                    : 'bg-white/70 border-gray-300 text-gray-900 focus:border-purple-500'
                                }`}
                              />
                              {basicInfoForm.formState.errors.contact?.linkedin && (
                                <p className="mt-1 text-sm text-red-500">
                                  {basicInfoForm.formState.errors.contact.linkedin.message}
                                </p>
                              )}
                            </div>
                            
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                GitHub
                              </label>
                              <input
                                {...basicInfoForm.register('contact.github')}
                                type="text"
                                placeholder="https://github.com/username"
                                className={`w-full p-3 rounded-lg border transition-colors duration-300 ${
                                  isDark
                                    ? 'bg-gray-700/50 border-gray-600 text-white focus:border-purple-500' 
                                    : 'bg-white/70 border-gray-300 text-gray-900 focus:border-purple-500'
                                }`}
                              />
                              {basicInfoForm.formState.errors.contact?.github && (
                                <p className="mt-1 text-sm text-red-500">
                                  {basicInfoForm.formState.errors.contact.github.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4">
                          <motion.button
                            type="submit"
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 px-6 rounded-lg font-medium"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="flex items-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Saving...
                              </div>
                            ) : (
                              'Save Changes'
                            )}
                          </motion.button>
                        </div>
                      </form>
                    ) : (
                      // Profile View Mode
                      <div className="space-y-8">
                        {/* Basic Information */}
                        <div>
                          <h3 className={`text-lg font-medium mb-4 transition-colors duration-500 ${
                            isDark ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            Basic Information
                          </h3>
                          
                          <div className={`p-4 rounded-lg transition-colors duration-500 ${
                            isDark ? 'bg-gray-700/50' : 'bg-gray-50/70'
                          }`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5">
                              <div>
                                <p className={`text-sm font-medium transition-colors duration-500 ${
                                  isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Full Name
                                </p>
                                <p className={`transition-colors duration-500 ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {profile?.name || 'Not set'}
                                </p>
                              </div>
                              
                              <div>
                                <p className={`text-sm font-medium transition-colors duration-500 ${
                                  isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Email
                                </p>
                                <p className={`transition-colors duration-500 ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {profile?.email || 'Not set'}
                                </p>
                              </div>
                              
                              <div>
                                <p className={`text-sm font-medium transition-colors duration-500 ${
                                  isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Location
                                </p>
                                <p className={`transition-colors duration-500 ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {profile?.location?.city && profile?.location?.country
                                    ? `${profile.location.city}, ${profile.location.country}`
                                    : 'Not set'
                                  }
                                </p>
                              </div>
                              
                              <div>
                                <p className={`text-sm font-medium transition-colors duration-500 ${
                                  isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Member Since
                                </p>
                                <p className={`transition-colors duration-500 ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {profile?.createdAt
                                    ? new Date(profile.createdAt).toLocaleDateString()
                                    : 'Not available'
                                  }
                                </p>
                              </div>
                            </div>

                            {/* Bio */}
                            <div className="mt-5">
                              <p className={`text-sm font-medium transition-colors duration-500 ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Bio
                              </p>
                              <p className={`whitespace-pre-wrap transition-colors duration-500 ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                {profile?.bio || 'No bio provided yet.'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                          <h3 className={`text-lg font-medium mb-4 transition-colors duration-500 ${
                            isDark ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            Contact Information
                          </h3>
                          
                          <div className={`p-4 rounded-lg transition-colors duration-500 ${
                            isDark ? 'bg-gray-700/50' : 'bg-gray-50/70'
                          }`}>
                            <div className="space-y-4">
                              <div>
                                <p className={`text-sm font-medium transition-colors duration-500 ${
                                  isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Website
                                </p>
                                <p className={`transition-colors duration-500 ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {profile?.contact?.website ? (
                                    <a 
                                      href={profile.contact.website} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className={`hover:underline transition-colors duration-500 ${
                                        isDark ? 'text-blue-400' : 'text-blue-600'
                                      }`}
                                    >
                                      {profile.contact.website}
                                    </a>
                                  ) : (
                                    'Not set'
                                  )}
                                </p>
                              </div>
                              
                              <div>
                                <p className={`text-sm font-medium transition-colors duration-500 ${
                                  isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  LinkedIn
                                </p>
                                <p className={`transition-colors duration-500 ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {profile?.contact?.linkedin ? (
                                    <a 
                                      href={profile.contact.linkedin} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className={`hover:underline transition-colors duration-500 ${
                                        isDark ? 'text-blue-400' : 'text-blue-600'
                                      }`}
                                    >
                                      {profile.contact.linkedin}
                                    </a>
                                  ) : (
                                    'Not set'
                                  )}
                                </p>
                              </div>
                              
                              <div>
                                <p className={`text-sm font-medium transition-colors duration-500 ${
                                  isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  GitHub
                                </p>
                                <p className={`transition-colors duration-500 ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {profile?.contact?.github ? (
                                    <a 
                                      href={profile.contact.github} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className={`hover:underline transition-colors duration-500 ${
                                        isDark ? 'text-blue-400' : 'text-blue-600'
                                      }`}
                                    >
                                      {profile.contact.github}
                                    </a>
                                  ) : (
                                    'Not set'
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {/* Security Tab */}
                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className={`text-xl font-bold mb-6 transition-colors duration-500 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Security Settings
                    </h2>

                    {/* Password Change Form */}
                    <div className={`p-6 mb-6 rounded-lg transition-colors duration-500 ${
                      isDark ? 'bg-gray-700/50' : 'bg-gray-50/70'
                    }`}>
                      <h3 className={`text-lg font-medium mb-4 transition-colors duration-500 ${
                        isDark ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        Change Password
                      </h3>
                      
                      <form onSubmit={securityForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Current Password *
                          </label>
                          <input
                            {...securityForm.register('currentPassword')}
                            type="password"
                            className={`w-full p-3 rounded-lg border transition-colors duration-300 ${
                              isDark
                                ? 'bg-gray-700/50 border-gray-600 text-white focus:border-purple-500' 
                                : 'bg-white/70 border-gray-300 text-gray-900 focus:border-purple-500'
                            }`}
                          />
                          {securityForm.formState.errors.currentPassword && (
                            <p className="mt-1 text-sm text-red-500">
                              {securityForm.formState.errors.currentPassword.message}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            New Password *
                          </label>
                          <input
                            {...securityForm.register('newPassword')}
                            type="password"
                            className={`w-full p-3 rounded-lg border transition-colors duration-300 ${
                              isDark
                                ? 'bg-gray-700/50 border-gray-600 text-white focus:border-purple-500' 
                                : 'bg-white/70 border-gray-300 text-gray-900 focus:border-purple-500'
                            }`}
                          />
                          {securityForm.formState.errors.newPassword && (
                            <p className="mt-1 text-sm text-red-500">
                              {securityForm.formState.errors.newPassword.message}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Confirm New Password *
                          </label>
                          <input
                            {...securityForm.register('confirmPassword')}
                            type="password"
                            className={`w-full p-3 rounded-lg border transition-colors duration-300 ${
                              isDark
                                ? 'bg-gray-700/50 border-gray-600 text-white focus:border-purple-500' 
                                : 'bg-white/70 border-gray-300 text-gray-900 focus:border-purple-500'
                            }`}
                          />
                          {securityForm.formState.errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-500">
                              {securityForm.formState.errors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                        
                        <div className="pt-2">
                          <motion.button
                            type="submit"
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 px-6 rounded-lg font-medium"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Update Password
                          </motion.button>
                        </div>
                      </form>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className={`p-6 rounded-lg transition-colors duration-500 ${
                      isDark ? 'bg-gray-700/50' : 'bg-gray-50/70'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`text-lg font-medium mb-1 transition-colors duration-500 ${
                            isDark ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            Two-Factor Authentication
                          </h3>
                          <p className={`text-sm transition-colors duration-500 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        
                        <button 
                          className={`py-2 px-4 rounded-lg text-sm transition-colors duration-300 ${
                            isDark 
                              ? 'bg-gray-600 text-white hover:bg-gray-500' 
                              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          }`}
                        >
                          Set Up 2FA
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className={`text-xl font-bold mb-6 transition-colors duration-500 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Account Settings
                    </h2>

                       {/* Theme Preference - Add this new section */}
    <div className={`p-6 mb-6 rounded-lg transition-colors duration-500 ${
      isDark ? 'bg-gray-700/50' : 'bg-gray-50/70'
    }`}>
      <h3 className={`text-lg font-medium mb-4 transition-colors duration-500 ${
        isDark ? 'text-gray-200' : 'text-gray-800'
      }`}>
        Theme Preference
      </h3>
      
      <div className="flex items-center justify-between">
        <div>
          <p className={`font-medium transition-colors duration-500 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Dark Mode
          </p>
          <p className={`text-sm transition-colors duration-500 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Toggle between dark and light mode
          </p>
        </div>
        
        <motion.div
          className="relative"
          initial={false}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            onClick={() => dispatch(toggleTheme())}
            className={`p-2 rounded-full transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                : 'bg-gray-200 text-blue-500 hover:bg-gray-300'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              key={theme}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isDark ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </div>

                    {/* Email Preferences */}
                    <div className={`p-6 mb-6 rounded-lg transition-colors duration-500 ${
                      isDark ? 'bg-gray-700/50' : 'bg-gray-50/70'
                    }`}>
                      <h3 className={`text-lg font-medium mb-4 transition-colors duration-500 ${
                        isDark ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        Email Preferences
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium transition-colors duration-500 ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Skill Match Notifications
                            </p>
                            <p className={`text-sm transition-colors duration-500 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Receive emails when there's a new skill match
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium transition-colors duration-500 ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Session Reminders
                            </p>
                            <p className={`text-sm transition-colors duration-500 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Receive reminders before scheduled sessions
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium transition-colors duration-500 ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Marketing Emails
                            </p>
                            <p className={`text-sm transition-colors duration-500 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Receive updates about new features and promotions
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Delete Account */}
                    <div className={`p-6 rounded-lg border transition-colors duration-500 ${
                      isDark 
                        ? 'bg-red-900/20 border-red-800/30 text-white' 
                        : 'bg-red-50 border-red-100 text-gray-900'
                    }`}>
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${
                          isDark ? 'bg-red-500/20' : 'bg-red-100'
                        }`}>
                          <ExclamationTriangleIcon className={`w-6 h-6 ${
                            isDark ? 'text-red-400' : 'text-red-500'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className={`text-lg font-medium mb-2 ${
                            isDark ? 'text-red-300' : 'text-red-600'
                          }`}>
                            Delete Account
                          </h3>
                          <p className={`text-sm mb-4 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Permanently delete your account and all of your data. This action cannot be undone.
                          </p>
                          
                          <motion.button
                            onClick={handleDeleteAccountConfirm}
                            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-300 ${
                              isDark 
                                ? 'bg-red-500 text-white hover:bg-red-600' 
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Delete My Account
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowConfirmation(false)}
            />
            
            <motion.div
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-2xl shadow-2xl z-50 ${
                isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              }`}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-center mb-6">
                <div className={`p-3 rounded-full ${
                  isDark ? 'bg-red-500/20' : 'bg-red-100'
                }`}>
                  <ExclamationTriangleIcon className={`w-8 h-8 ${
                    isDark ? 'text-red-400' : 'text-red-600'
                  }`} />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-center mb-4">
                Delete Your Account?
              </h3>
              
              <p className={`text-center mb-6 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                This will permanently delete your account, all of your data, and remove you from all skill exchanges. This action cannot be undone.
              </p>
              
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Please tell us why you're leaving (optional)
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  rows={2}
                  className={`w-full p-3 rounded-lg border transition-colors duration-300 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Your feedback helps us improve"
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className={`flex-1 py-3 px-4 rounded-lg transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDeleteAccount}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-300 ${
                    isDark 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Yes, Delete Account
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;