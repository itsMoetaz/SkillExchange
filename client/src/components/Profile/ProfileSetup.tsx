import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store/store';
import { updateProfile, uploadAvatar, deleteAvatar, addSkill, getProfile } from '../../store/slices/profileSlice';
import type { ProfileUpdateData, SkillFormData } from '../../types/profile';
import { SKILL_CATEGORIES, SKILL_LEVELS, MEETING_TYPES } from '../../types/profile';
import AvatarUpload from './AvatarUpload';
import {
  UserCircleIcon,
  CogIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SparklesIcon,
  AcademicCapIcon,
  StarIcon,
  FireIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

// Interface definitions
interface EditingSkill {
  index: number;
  skill: SkillFormData;
}

// Step validation schemas
const basicInfoSchema = yup.object({
  bio: yup.string().required('Tell us about yourself').max(500, 'Bio must be under 500 characters'),
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

const skillSchema = yup.object({
  name: yup.string().required('Skill name is required').min(2, 'At least 2 characters'),
  category: yup.string().required('Category is required'),
  level: yup.string().required('Level is required'),
  description: yup.string().max(500, 'Description must be under 500 characters').nullable().default(''),
  yearsOfExperience: yup.number().min(0, 'Must be 0 or more').max(50, 'Must be 50 or less').required(),
  isTeaching: yup.boolean().required(),
  isLearning: yup.boolean().required(),
});

const preferencesSchema = yup.object({
  meetingTypes: yup.array().min(1, 'Select at least one meeting type').required(),
  languages: yup.array().min(1, 'Add at least one language').required(),
  sessionDuration: yup.number().min(15, 'Minimum 15 minutes').max(240, 'Maximum 4 hours').required(),
  maxDistance: yup.number().min(1, 'Minimum 1 km').max(500, 'Maximum 500 km').required(),
});

// Type definitions
type BasicInfoData = yup.InferType<typeof basicInfoSchema>;
type SkillData = yup.InferType<typeof skillSchema>;
type PreferencesData = {
  meetingTypes: string[];
  languages: string[];
  sessionDuration: number;
  maxDistance: number;
};

/**
 * Animated background component
 */
const AnimatedBackground = React.memo(() => {
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div 
        className={`absolute inset-0 transition-all duration-1000 ${
          isDark 
            ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900' 
            : 'bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50'
        }`} 
      />
      
      {/* Floating Elements */}
      <motion.div
        className={`absolute top-1/4 left-1/6 w-64 h-64 rounded-full blur-3xl transition-colors duration-1000 ${
          isDark 
            ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/15' 
            : 'bg-gradient-to-r from-purple-400/30 to-indigo-400/25'
        }`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className={`absolute bottom-1/4 right-1/6 w-80 h-80 rounded-full blur-3xl transition-colors duration-1000 ${
          isDark 
            ? 'bg-gradient-to-r from-indigo-500/15 to-blue-500/20' 
            : 'bg-gradient-to-r from-indigo-400/25 to-blue-400/30'
        }`}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Floating Icons */}
      {[AcademicCapIcon, SparklesIcon, StarIcon, FireIcon].map((Icon, index) => (
        <motion.div
          key={index}
          className={`absolute w-8 h-8 transition-colors duration-1000 ${
            isDark ? 'text-purple-400/30' : 'text-purple-500/40'
          }`}
          style={{
            top: `${20 + index * 20}%`,
            right: `${10 + index * 10}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8 + index * 2,
            repeat: Infinity,
            delay: index * 1.5,
            ease: "easeInOut",
          }}
        >
          <Icon />
        </motion.div>
      ))}
    </div>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

/**
 * Step Progress Component
 */
const StepProgress = React.memo(({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';
  
  const steps = useMemo(() => [
    { id: 1, title: 'Welcome', icon: UserCircleIcon, description: 'Upload photo & tell us about yourself' },
    { id: 2, title: 'Skills', icon: AcademicCapIcon, description: 'Add skills you can teach or want to learn' },
    { id: 3, title: 'Preferences', icon: CogIcon, description: 'Set your availability & preferences' },
    { id: 4, title: 'Complete', icon: CheckCircleIcon, description: 'Your profile is ready!' },
  ], []);

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <React.Fragment key={step.id}>
              <motion.div
                className="flex flex-col items-center flex-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? isDark
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-purple-500 border-purple-400 text-white'
                      : isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-400'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  animate={isCurrent ? { 
                    boxShadow: [
                      '0 0 0 0 rgba(147, 51, 234, 0.4)',
                      '0 0 0 10px rgba(147, 51, 234, 0)',
                      '0 0 0 0 rgba(147, 51, 234, 0.4)',
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: isCurrent ? Infinity : 0 }}
                >
                  <step.icon className="w-6 h-6" />
                </motion.div>
                <div className="mt-3 text-center">
                  <p className={`text-sm font-semibold transition-colors duration-500 ${
                    isCurrent
                      ? isDark ? 'text-purple-400' : 'text-purple-600'
                      : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className={`text-xs mt-1 transition-colors duration-500 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
              
              {index < steps.length - 1 && (
                <motion.div
                  className={`h-0.5 flex-1 mx-4 transition-all duration-500 ${
                    currentStep > step.id
                      ? 'bg-green-500'
                      : isDark ? 'bg-gray-700' : 'bg-gray-300'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: currentStep > step.id ? 1 : 0.3 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Overall Progress */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
});

StepProgress.displayName = 'StepProgress';

/**
 * Skill Card Component
 */
const SkillCard = React.memo(({ skill, onEdit, onDelete }: {
  skill: SkillFormData;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return isDark ? 'text-green-400 bg-green-400/20' : 'text-green-600 bg-green-100';
      case 'intermediate': return isDark ? 'text-blue-400 bg-blue-400/20' : 'text-blue-600 bg-blue-100';
      case 'advanced': return isDark ? 'text-purple-400 bg-purple-400/20' : 'text-purple-600 bg-purple-100';
      case 'expert': return isDark ? 'text-orange-400 bg-orange-400/20' : 'text-orange-600 bg-orange-100';
      default: return isDark ? 'text-gray-400 bg-gray-400/20' : 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <motion.div
      className={`p-4 rounded-xl border transition-all duration-300 ${
        isDark 
          ? 'bg-gray-700/50 border-gray-600 hover:border-purple-500' 
          : 'bg-white/70 border-gray-200 hover:border-purple-400'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      layout
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className={`font-semibold text-lg mb-1 transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {skill.name}
          </h4>
          <p className={`text-sm transition-colors duration-300 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {skill.category}
          </p>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
            {skill.level}
          </span>
          
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDark 
                  ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-400/20' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'
              }`}
              aria-label="Edit skill"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDark 
                  ? 'text-gray-400 hover:text-red-400 hover:bg-red-400/20' 
                  : 'text-gray-500 hover:text-red-600 hover:bg-red-100'
              }`}
              aria-label="Delete skill"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {skill.description && (
        <p className={`text-sm mb-3 transition-colors duration-300 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {skill.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          {skill.yearsOfExperience != null && skill.yearsOfExperience > 0 && (
            <span className={`transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {skill.yearsOfExperience} years exp.
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {skill.isTeaching && (
            <span className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-300 ${
              isDark 
                ? 'bg-green-400/20 text-green-400' 
                : 'bg-green-100 text-green-700'
            }`}>
              Teaching
            </span>
          )}
          {skill.isLearning && (
            <span className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-300 ${
              isDark 
                ? 'bg-yellow-400/20 text-yellow-400' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              Learning
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

SkillCard.displayName = 'SkillCard';

/**
 * Main ProfileSetup Component
 */
const ProfileSetup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [skills, setSkills] = useState<SkillFormData[]>([]);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<EditingSkill | null>(null);
  const [newLanguage, setNewLanguage] = useState('');
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { profile, error, uploadingAvatar } = useSelector((state: RootState) => state.profile);
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';

  // Form instances
  const basicInfoForm = useForm<BasicInfoData>({
    resolver: yupResolver(basicInfoSchema),
    mode: 'onChange',
    defaultValues: {
      bio: '',
      location: { city: '', country: '' },
      contact: { website: '', linkedin: '', github: '' },
    }
  });

  const skillForm = useForm<SkillData>({
    resolver: yupResolver(skillSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      category: '',
      level: 'beginner',
      description: '',
      yearsOfExperience: 0,
      isTeaching: false,
      isLearning: false,
    }
  });

  const preferencesForm = useForm<PreferencesData>({
    resolver: yupResolver(preferencesSchema),
    mode: 'onChange',
    defaultValues: {
      meetingTypes: [],
      languages: ['English'],
      sessionDuration: 60,
      maxDistance: 25,
    }
  });

  // Load profile on mount
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  // Pre-populate forms if profile exists
  useEffect(() => {
    if (profile) {
      basicInfoForm.reset({
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

      if (profile.skills && profile.skills.length > 0) {
        setSkills(profile.skills);
      }

      preferencesForm.reset({
        meetingTypes: profile.preferences?.meetingTypes || [],
        languages: profile.preferences?.languages || ['English'],
        sessionDuration: profile.preferences?.sessionDuration || 60,
        maxDistance: profile.preferences?.maxDistance || 25,
      });
    }
  }, [profile, basicInfoForm, preferencesForm]);

  // Handle avatar upload
  const handleAvatarUpload = useCallback(async (file: File) => {
    await dispatch(uploadAvatar(file));
  }, [dispatch]);

  const handleAvatarDelete = useCallback(async () => {
    await dispatch(deleteAvatar());
  }, [dispatch]);

  // Handle step 1 completion
  const handleBasicInfoSubmit = useCallback(async (data: BasicInfoData) => {
    const profileData: ProfileUpdateData = {
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
      setCurrentStep(2);
    }
  }, [dispatch]);

  // Handle adding/editing skill
const handleSkillSubmit = useCallback((data: SkillData) => {
  try {
    console.log("Submitting skill:", data); // Debug output
    
    // Validate required fields
    if (!data.name || !data.category) {
      console.error("Skill name and category are required");
      return;
    }
    
    // Create skill object
    const skillData: SkillFormData = {
      name: data.name,
      category: data.category,
      level: data.level as 'beginner' | 'intermediate' | 'advanced' | 'expert',
      description: data.description || '',
      yearsOfExperience: data.yearsOfExperience || 0,
      isTeaching: data.isTeaching || false,
      isLearning: data.isLearning || false,
      tags: [],
      certifications: []
    };

    if (editingSkill) {
      // Update existing skill
      const updatedSkills = [...skills];
      updatedSkills[editingSkill.index] = skillData;
      setSkills(updatedSkills);
      setEditingSkill(null);
    } else {
      // Add new skill
      setSkills(prev => [...prev, skillData]);
    }
    
    // Reset form and close modal
    skillForm.reset({
      name: '',
      category: '',
      level: 'beginner',
      description: '',
      yearsOfExperience: 0,
      isTeaching: false,
      isLearning: false
    });
    setShowSkillForm(false);
  } catch (error) {
    console.error("Error adding skill:", error);
  }
}, [skills, editingSkill, skillForm]);

  // Delete skill
  const handleDeleteSkill = useCallback((index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Edit skill
  const handleEditSkill = useCallback((index: number) => {
    const skill = skills[index];
    setEditingSkill({ index, skill });
    skillForm.reset({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      description: skill.description || '',
      yearsOfExperience: skill.yearsOfExperience || 0,
      isTeaching: skill.isTeaching,
      isLearning: skill.isLearning,
    });
    setShowSkillForm(true);
  }, [skills, skillForm]);

  // Handle step 2 completion
  const handleSkillsNext = useCallback(async () => {
    if (skills.length > 0) {
      // Save all skills
      for (const skill of skills) {
        await dispatch(addSkill(skill));
      }
      setCurrentStep(3);
    }
  }, [skills, dispatch]);

  // Handle step 3 completion
  const handlePreferencesSubmit = useCallback(async (data: PreferencesData) => {
    const profileData: ProfileUpdateData = {
      preferences: {
        ...data,
        meetingTypes: data.meetingTypes as ("online" | "in-person" | "hybrid")[],
      },
    };

    const result = await dispatch(updateProfile(profileData));
    if (result.meta.requestStatus === 'fulfilled') {
      setCurrentStep(4);
    }
  }, [dispatch]);

  // Handle completion
  const handleComplete = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  // Navigation
  const goBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipStep = useCallback(() => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  // Add language
  const handleAddLanguage = useCallback(() => {
    if (newLanguage.trim()) {
      const currentLanguages = preferencesForm.getValues('languages') || [];
      if (!currentLanguages.includes(newLanguage.trim())) {
        preferencesForm.setValue('languages', [...currentLanguages, newLanguage.trim()], { shouldValidate: true });
        setNewLanguage('');
      }
    }
  }, [newLanguage, preferencesForm]);

  // Remove language
  const handleRemoveLanguage = useCallback((language: string) => {
    const currentLanguages = preferencesForm.getValues('languages') || [];
    if (currentLanguages.length > 1) {
      preferencesForm.setValue(
        'languages', 
        currentLanguages.filter(lang => lang !== language),
        { shouldValidate: true }
      );
    }
  }, [preferencesForm]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 mb-6 mx-auto shadow-xl"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <SparklesIcon className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className={`text-3xl font-bold mb-2 transition-colors duration-1000 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Complete Your Profile
            </h1>
            <p className={`text-lg transition-colors duration-1000 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Let's set up your SkillExchange profile in just a few steps
            </p>
          </motion.div>

          {/* Progress */}
          <StepProgress currentStep={currentStep} totalSteps={4} />

          {/* Main Content */}
          <motion.div
            className={`backdrop-blur-xl rounded-3xl shadow-2xl border p-8 transition-all duration-1000 ${
              isDark 
                ? 'bg-gray-800/80 border-gray-700/50 shadow-gray-900/50' 
                : 'bg-white/80 border-gray-200/50 shadow-gray-900/20'
            }`}
            layout
          >
            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className={`flex items-center gap-3 p-4 mb-6 rounded-xl border transition-all duration-1000 ${
                    isDark 
                      ? 'bg-red-900/30 border-red-700/50 text-red-300' 
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* Step 1: Basic Info & Avatar */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center mb-8">
                    <h2 className={`text-2xl font-bold mb-2 transition-colors duration-1000 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Welcome to SkillExchange! 👋
                    </h2>
                    <p className={`text-sm transition-colors duration-1000 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Start by uploading a photo and telling us about yourself
                    </p>
                  </div>

                  {/* Avatar Upload */}
                  <div className="flex justify-center mb-8">
                    <AvatarUpload
                      avatarUrl={profile?.avatar}
                      onUpload={handleAvatarUpload}
                      onDelete={handleAvatarDelete}
                      loading={uploadingAvatar}
                    />
                  </div>

                  <form onSubmit={basicInfoForm.handleSubmit(handleBasicInfoSubmit)} className="space-y-6">
                    {/* Form implementation */}
                    <div>
                      <label className={`block text-sm font-semibold mb-2 transition-colors duration-1000 ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Tell us about yourself *
                      </label>
                      <textarea
                        {...basicInfoForm.register('bio')}
                        placeholder="Share your passions, interests, and what makes you unique..."
                        rows={4}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm text-sm resize-none ${
                          basicInfoForm.formState.errors.bio 
                            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-200/50' 
                            : isDark
                              ? 'border-gray-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 bg-gray-700/50 text-white placeholder-gray-400'
                              : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 bg-white/70 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                      {basicInfoForm.formState.errors.bio && (
                        <p className="mt-2 text-sm font-medium text-red-500">
                          {basicInfoForm.formState.errors.bio.message}
                        </p>
                      )}
                    </div>

                    {/* Location Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          City *
                        </label>
                        <input
                          {...basicInfoForm.register('location.city')}
                          type="text"
                          placeholder="Enter your city"
                          className={`w-full p-3 rounded-xl border ${
                            isDark 
                              ? 'bg-gray-700/50 border-gray-600 text-white' 
                              : 'bg-white/70 border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          Country *
                        </label>
                        <input
                          {...basicInfoForm.register('location.country')}
                          type="text"
                          placeholder="Enter your country"
                          className={`w-full p-3 rounded-xl border ${
                            isDark 
                              ? 'bg-gray-700/50 border-gray-600 text-white' 
                              : 'bg-white/70 border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <motion.button
                        type="button"
                        onClick={skipStep}
                        className={`flex-1 py-3 px-4 rounded-xl ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Skip
                      </motion.button>

                      <motion.button
                        type="submit"
                        className="flex-[2] bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-xl"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-center">
                          Next: Add Skills
                          <ArrowRightIcon className="h-5 w-5 ml-2" />
                        </div>
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Skills */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center mb-6">
                    <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Add Your Skills
                    </h2>
                  </div>

                  {/* Skills List */}
                  <div className="space-y-4 mb-6">
                    {skills.map((skill, index) => (
                      <SkillCard
                        key={index}
                        skill={skill}
                        onEdit={() => handleEditSkill(index)}
                        onDelete={() => handleDeleteSkill(index)}
                      />
                    ))}

                    {skills.length === 0 && (
                      <div className={`text-center p-8 border-2 border-dashed rounded-xl ${
                        isDark ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
                      }`}>
                        No skills added yet
                      </div>
                    )}
                  </div>

                  {/* Add Skill Button */}
                  <button
                    type="button"
                    onClick={() => setShowSkillForm(true)}
                    className={`w-full p-4 rounded-xl border-2 border-dashed ${
                      isDark 
                        ? 'border-purple-500/50 bg-purple-500/10 text-purple-400' 
                        : 'border-purple-400/50 bg-purple-50 text-purple-600'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <PlusIcon className="h-5 w-5 mr-3" />
                      Add New Skill
                    </div>
                  </button>

                  {/* Skill Form Modal */}
{showSkillForm && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className={`w-full max-w-md rounded-2xl shadow-2xl border p-6 ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {editingSkill ? 'Edit Skill' : 'Add New Skill'}
      </h3>

      <form onSubmit={skillForm.handleSubmit(handleSkillSubmit)} className="space-y-4">
        {/* Skill Name - Required */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Skill Name *
          </label>
          <input
            {...skillForm.register('name', { required: 'Skill name is required' })}
            type="text"
            placeholder="e.g. JavaScript, Cooking, Photography"
            className={`w-full p-3 rounded-lg border ${
              isDark
                ? 'border-gray-600 bg-gray-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          />
          {skillForm.formState.errors.name && (
            <p className="text-red-500 text-xs mt-1">
              {skillForm.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Category - Required */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Category *
          </label>
          <select
            {...skillForm.register('category', { required: 'Category is required' })}
            className={`w-full p-3 rounded-lg border ${
              isDark
                ? 'border-gray-600 bg-gray-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          >
            <option value="">Select a category</option>
            {SKILL_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {skillForm.formState.errors.category && (
            <p className="text-red-500 text-xs mt-1">
              {skillForm.formState.errors.category.message}
            </p>
          )}
        </div>

        {/* Level */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Level
          </label>
          <select
            {...skillForm.register('level')}
            className={`w-full p-3 rounded-lg border ${
              isDark
                ? 'border-gray-600 bg-gray-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          >
            {SKILL_LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Skill Type (Teaching/Learning) */}
        <div className="flex gap-4">
          <div className="flex items-center">
            <input
              {...skillForm.register('isTeaching')}
              type="checkbox"
              id="isTeaching"
              className="mr-2"
            />
            <label htmlFor="isTeaching" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              I can teach this
            </label>
          </div>
          <div className="flex items-center">
            <input
              {...skillForm.register('isLearning')}
              type="checkbox"
              id="isLearning"
              className="mr-2"
            />
            <label htmlFor="isLearning" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              I want to learn this
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setShowSkillForm(false);
              setEditingSkill(null);
              skillForm.reset();
            }}
            className={`py-2 px-4 rounded-lg ${
              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-purple-600 text-white py-2 px-4 rounded-lg"
          >
            {editingSkill ? 'Update Skill' : 'Add Skill'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

                  {/* Navigation */}
                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={goBack}
                      className={`flex items-center px-4 py-3 rounded-xl ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      <ArrowLeftIcon className="h-5 w-5 mr-2" />
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleSkillsNext}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-3 rounded-xl"
                    >
                      Next
                      <ArrowRightIcon className="h-5 w-5 ml-2 inline-block" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Preferences */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center mb-6">
                    <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Set Your Preferences
                    </h2>
                  </div>

                  <form onSubmit={preferencesForm.handleSubmit(handlePreferencesSubmit)} className="space-y-6">
                    {/* Meeting Types */}
                    <div>
                      <label className={`block text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        How do you prefer to meet? *
                      </label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Controller
                          name="meetingTypes"
                          control={preferencesForm.control}
                          render={({ field }) => (
                            <>
                              {MEETING_TYPES.map((type) => (
                                <div
                                  key={type}
                                  className={`p-3 rounded-xl border-2 cursor-pointer ${
                                    field.value?.includes(type)
                                      ? isDark 
                                        ? 'border-purple-500 bg-purple-500/20' 
                                        : 'border-purple-500 bg-purple-50'
                                      : isDark
                                        ? 'border-gray-600' 
                                        : 'border-gray-200'
                                  }`}
                                  onClick={() => {
                                    const currentValues = field.value || [];
                                    const newValues = currentValues.includes(type)
                                      ? currentValues.filter(v => v !== type)
                                      : [...currentValues, type];
                                      
                                    field.onChange(newValues);
                                  }}
                                >
                                  {type}
                                </div>
                              ))}
                            </>
                          )}
                        />
                      </div>
                    </div>

                    {/* Languages */}
                    <div>
                      <label className={`block text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        Languages you speak *
                      </label>
                      
                      <div className="mb-2">
                        {preferencesForm.getValues('languages')?.map((lang, idx) => (
                          <span key={idx} className="inline-block mr-2 mb-2 px-3 py-1 bg-gray-100 rounded-full">
                            {lang}
                            <button
                              type="button"
                              onClick={() => handleRemoveLanguage(lang)}
                              className="ml-2 text-gray-500"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          className={`flex-1 p-2 border rounded-lg ${
                            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                          placeholder="Add a language..."
                        />
                        <button
                          type="button"
                          onClick={handleAddLanguage}
                          className="bg-purple-600 text-white p-2 rounded-lg"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-4 mt-6">
                      <button
                        type="button"
                        onClick={goBack}
                        className={`flex items-center px-4 py-3 rounded-xl ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Back
                      </button>

                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-3 rounded-xl"
                      >
                        Complete Setup
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 4: Complete */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircleIcon className="w-12 h-12 text-white" />
                    </div>
                    
                    <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Profile Complete!
                    </h2>
                    
                    <p className={`mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      You're all set to start exchanging skills!
                    </p>

                    <button
                      onClick={handleComplete}
                      className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-600"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSetup;