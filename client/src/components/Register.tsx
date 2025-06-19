import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  SparklesIcon,
  ArrowLeftIcon,
  CheckIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import type { RootState, AppDispatch } from '../store/store';
import { registerUser, clearError } from '../store/slices/authSlice';

interface SerializedError {
  name?: string;
  message?: string;
  stack?: string;
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    if ('name' in error && 'message' in error) {
      return (error as SerializedError).message || 'An error occurred';
    }
  }
  
  return 'An unexpected error occurred';
};

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    interests: [] as string[],
    goals: [] as string[],
    experience: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { isLoading, error, user } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const skillCategories = [
    'Programming & Development',
    'Design & Creative',
    'Business & Marketing',
    'Music & Arts',
    'Language Learning',
    'Fitness & Sports',
    'Cooking & Nutrition',
    'Photography',
    'Writing & Content',
    'Science & Math',
    'Crafts & DIY',
    'Personal Development'
  ];

  const learningGoals = [
    'Learn new skills for career growth',
    'Explore hobbies and interests',
    'Teach others and share knowledge',
    'Build professional network',
    'Earn extra income teaching',
    'Personal enrichment'
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting my learning journey' },
    { value: 'intermediate', label: 'Intermediate', description: 'I have some experience in various skills' },
    { value: 'advanced', label: 'Advanced', description: 'I have expertise in several areas' },
    { value: 'expert', label: 'Expert', description: 'I\'m ready to teach and share knowledge' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return false;
    }
    if (!formData.password) {
      toast.error('Please enter a password');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.interests.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }
    if (formData.goals.length === 0) {
      toast.error('Please select at least one goal');
      return;
    }

    const loadingToast = toast.loading('Creating your account...');

    try {
      await dispatch(registerUser(formData)).unwrap();
      toast.dismiss(loadingToast);
      toast.success('Account created successfully! Welcome! 🎉');
      navigate('/profile/setup');
    } catch (error: unknown) {
      toast.dismiss(loadingToast);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Create Your Account
        </h2>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Start your skill exchange journey
        </p>
      </div>

      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${
              isDark 
                ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
            } focus:ring-2 focus:ring-purple-500/20 focus:outline-none`}
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${
              isDark 
                ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
            } focus:ring-2 focus:ring-purple-500/20 focus:outline-none`}
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-300 ${
                isDark 
                  ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
              } focus:ring-2 focus:ring-purple-500/20 focus:outline-none`}
              placeholder="Create a password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-300 ${
                isDark 
                  ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
              } focus:ring-2 focus:ring-purple-500/20 focus:outline-none`}
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          What interests you?
        </h2>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Select the skills you'd like to learn or teach
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {skillCategories.map((category) => (
          <motion.button
            key={category}
            onClick={() => toggleInterest(category)}
            className={`p-4 text-sm rounded-xl border transition-all duration-300 text-left ${
              formData.interests.includes(category)
                ? isDark 
                  ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' 
                  : 'bg-purple-100 border-purple-500 text-purple-700'
                : isDark 
                  ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{category}</span>
              {formData.interests.includes(category) && (
                <CheckIcon className="w-4 h-4" />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} text-center`}>
        Selected: {formData.interests.length} categories
      </p>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          What are your goals?
        </h2>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Help us personalize your experience
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {learningGoals.map((goal) => (
          <motion.button
            key={goal}
            onClick={() => toggleGoal(goal)}
            className={`w-full p-4 text-left rounded-xl border transition-all duration-300 ${
              formData.goals.includes(goal)
                ? isDark 
                  ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' 
                  : 'bg-purple-100 border-purple-500 text-purple-700'
                : isDark 
                  ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <span>{goal}</span>
              {formData.goals.includes(goal) && (
                <CheckIcon className="w-5 h-5" />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          What's your experience level?
        </h2>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          This helps us recommend the right content for you
        </p>
      </div>

      <div className="space-y-4">
        {experienceLevels.map((level) => (
          <motion.button
            key={level.value}
            onClick={() => setFormData(prev => ({ ...prev, experience: level.value as any }))}
            className={`w-full p-4 text-left rounded-xl border transition-all duration-300 ${
              formData.experience === level.value
                ? isDark 
                  ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' 
                  : 'bg-purple-100 border-purple-500 text-purple-700'
                : isDark 
                  ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{level.label}</span>
              {formData.experience === level.value && (
                <CheckIcon className="w-5 h-5" />
              )}
            </div>
            <p className={`text-sm ${
              formData.experience === level.value
                ? isDark ? 'text-purple-300/80' : 'text-purple-600/80'
                : isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {level.description}
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-md w-full mx-4">
        {/* Back button */}
        <motion.button
          onClick={() => step === 1 ? navigate('/') : handleBack()}
          className={`mb-8 flex items-center gap-2 text-sm font-medium transition-colors ${
            isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
          whileHover={{ x: -4 }}
        >
          <ArrowLeftIcon className="w-4 h-4" />
          {step === 1 ? 'Back to Home' : 'Previous Step'}
        </motion.button>

        <motion.div
          className={`rounded-2xl border backdrop-blur-sm p-8 shadow-2xl ${
            isDark 
              ? 'bg-gray-800/50 border-gray-700/50' 
              : 'bg-white/80 border-gray-200/50'
          }`}
          layout
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4 dark:bg-gray-700">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Step {step} of 4
            </p>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <motion.button
                onClick={handleBack}
                className={`flex-1 py-3 rounded-xl border font-medium transition-all duration-300 ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50' 
                    : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                Back
              </motion.button>
            )}
            
            <motion.button
              onClick={step === 4 ? handleSubmit : handleNext}
              disabled={isLoading || (step === 2 && formData.interests.length === 0) || (step === 3 && formData.goals.length === 0)}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : step === 4 ? (
                'Complete Registration'
              ) : (
                <>
                  Continue
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>

          {/* Sign In Link */}
          {step === 1 && (
            <div className="mt-8 text-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Already have an account?{' '}
              </span>
              <Link
                to="/login"
                className={`text-sm font-medium transition-colors ${
                  isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                }`}
              >
                Sign in
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Register;