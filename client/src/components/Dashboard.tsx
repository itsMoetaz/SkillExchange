import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRightOnRectangleIcon, 
  UserCircleIcon,
  BellIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  SparklesIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  PlusIcon,
  StarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { 
  FireIcon,
  HeartIcon,
  LightBulbIcon
} from '@heroicons/react/24/solid';
import type { RootState, AppDispatch } from '../store/store';
import { getProfile } from '../store/slices/profileSlice';
import { getTrendingSkills } from '../store/slices/skillSlice';
import LoadingSpinner from './Common/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { profile, profileCompletion, isLoading: profileLoading } = useSelector((state: RootState) => state.profile);
  const { trendingSkills, isTrendingLoading } = useSelector((state: RootState) => state.skills);
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';

  const [showOnboardingSteps, setShowOnboardingSteps] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    dispatch(getProfile());
    dispatch(getTrendingSkills(6));
  }, [dispatch]);

  // Show onboarding for incomplete profiles
  useEffect(() => {
    if (profileCompletion < 100) {
      setShowOnboardingSteps(true);
    }
  }, [profileCompletion]);

  // Navigation handlers
  const handleExploreSkills = useCallback(() => {
    navigate('/skills');
  }, [navigate]);

  const handleCompleteProfile = useCallback(() => {
    navigate('/profile/setup');
  }, [navigate]);

  const handleAddSkill = useCallback(() => {
    navigate('/profile/skills/new');
  }, [navigate]);

  // Logout handler
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  // Profile completion steps
  const completionSteps = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Add your name, bio, and location',
      completed: profile?.name && profile?.bio && profile?.location?.city,
      action: handleCompleteProfile,
      icon: UserCircleIcon
    },
    {
      id: 'avatar',
      title: 'Profile Picture',
      description: 'Upload a professional photo',
      completed: profile?.avatar,
      action: handleCompleteProfile,
      icon: UserCircleIcon
    },
    {
      id: 'skills',
      title: 'Add Skills',
      description: 'Share what you can teach or want to learn',
      completed: profile?.skills && profile.skills.length > 0,
      action: handleAddSkill,
      icon: AcademicCapIcon
    }
  ];

  const completedSteps = completionSteps.filter(step => step.completed).length;
  const nextStep = completionSteps.find(step => !step.completed);

  // Quick actions based on profile state
  const getQuickActions = () => {
    const actions = [];

    if (profileCompletion < 100) {
      actions.push({
        title: 'Complete Profile',
        description: 'Boost your visibility',
        icon: UserCircleIcon,
        gradient: 'from-blue-500 to-purple-600',
        action: handleCompleteProfile,
        priority: 'high'
      });
    }

    if (!profile?.skills || profile.skills.length === 0) {
      actions.push({
        title: 'Add Your First Skill',
        description: 'What can you teach or learn?',
        icon: PlusIcon,
        gradient: 'from-green-500 to-teal-600',
        action: handleAddSkill,
        priority: 'high'
      });
    }

    actions.push({
      title: 'Explore Skills',
      description: 'Find learning opportunities',
      icon: MagnifyingGlassIcon,
      gradient: 'from-purple-500 to-pink-600',
      action: handleExploreSkills,
      priority: 'normal'
    });

    return actions.slice(0, 3); // Show max 3 actions
  };

  const quickActions = getQuickActions();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  if (profileLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
        isDark ? 'bg-gray-900/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">SE</span>
              </div>
              <span className={`font-bold text-xl hidden sm:block ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                SkillExchange
              </span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <button className={`p-2 rounded-xl relative transition-colors ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}>
                <BellIcon className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                  3
                </span>
              </button>

              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="hidden md:block text-right">
                    <div className={`text-sm font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {profile?.name || user?.name || 'Welcome'}
                    </div>
                    <div className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {profile?.location?.city || 'Set your location'}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`relative p-1 rounded-xl transition-colors ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {profile?.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <UserCircleIcon className="w-7 h-7" />
                      </div>
                    )}
                    
                    {/* Profile completion indicator */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                      <div className="relative w-4 h-4">
                        <svg className="w-4 h-4 transform -rotate-90">
                          <circle 
                            cx="8" cy="8" r="6"
                            stroke={isDark ? '#374151' : '#e5e7eb'} 
                            strokeWidth="2" 
                            fill="transparent"
                          />
                          <circle 
                            cx="8" cy="8" r="6"
                            stroke={profileCompletion === 100 ? '#10b981' : '#3b82f6'}
                            strokeWidth="2" 
                            fill="transparent"
                            strokeDasharray={`${profileCompletion * 0.377} 37.7`}
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-lg border z-50 ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          {profile?.avatar ? (
                            <img 
                              src={profile.avatar} 
                              alt="Profile" 
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                            }`}>
                              <UserCircleIcon className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <p className={`font-semibold ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {profile?.name || user?.name || 'User'}
                            </p>
                            <p className={`text-sm ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isDark 
                              ? 'hover:bg-gray-700 text-gray-300' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <UserCircleIcon className="w-5 h-5" />
                          <span>View Profile</span>
                        </Link>

                        <Link
                          to="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isDark 
                              ? 'hover:bg-gray-700 text-gray-300' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Cog6ToothIcon className="w-5 h-5" />
                          <span>Settings</span>
                        </Link>

                        <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

                        <button
                          onClick={handleLogout}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20`}
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 p-8 text-white"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3Ccircle cx='53' cy='7' r='7'/%3E%3Ccircle cx='30' cy='30' r='7'/%3E%3Ccircle cx='7' cy='53' r='7'/%3E%3Ccircle cx='53' cy='53' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
              </div>

              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <SparklesIcon className="w-8 h-8" />
                  <h1 className="text-3xl font-bold">
                    Welcome back, {profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Friend'}!
                  </h1>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl opacity-90 mb-6 max-w-2xl"
                >
                  {profileCompletion < 100 
                    ? `Your profile is ${profileCompletion}% complete. Let's finish setting it up to unlock the full potential of skill exchange!`
                    : "You're all set! Ready to discover new skills and share your expertise with the community?"
                  }
                </motion.p>

                {profileCompletion < 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">Profile Progress</span>
                      <span className="text-sm opacity-75">{completedSteps}/{completionSteps.length} steps</span>
                    </div>
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-white rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${profileCompletion}%` }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      />
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-wrap gap-4">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={action.title}
                      onClick={action.action}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <action.icon className="w-5 h-5" />
                      {action.title}
                      <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Profile Completion Steps - Show only if incomplete */}
            {showOnboardingSteps && profileCompletion < 100 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`rounded-3xl border p-6 ${
                  isDark 
                    ? 'bg-gray-800/50 border-gray-700/50' 
                    : 'bg-white/80 border-gray-200/50'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Complete Your Profile
                  </h2>
                  <button
                    onClick={() => setShowOnboardingSteps(false)}
                    className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                      isDark 
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Hide
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {completionSteps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                        step.completed
                          ? isDark
                            ? 'bg-green-900/20 border-green-500/30'
                            : 'bg-green-50 border-green-200'
                          : isDark
                            ? 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50'
                            : 'bg-gray-50/50 border-gray-200 hover:bg-gray-100/50'
                      }`}
                      onClick={step.action}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl ${
                          step.completed
                            ? 'bg-green-500 text-white'
                            : isDark
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-gray-200 text-gray-600'
                        }`}>
                          {step.completed ? (
                            <CheckCircleIcon className="w-5 h-5" />
                          ) : (
                            <step.icon className="w-5 h-5" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-1 ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {step.title}
                          </h3>
                          <p className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {step.description}
                          </p>
                        </div>

                        {!step.completed && (
                          <ArrowRightIcon className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                            isDark ? 'text-gray-500' : 'text-gray-400'
                          }`} />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {nextStep && (
                  <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20">
                    <div className="flex items-center gap-3">
                      <LightBulbIcon className="w-6 h-6 text-blue-500" />
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Next: {nextStep.title}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {nextStep.description}
                        </p>
                      </div>
                      <button
                        onClick={nextStep.action}
                        className="ml-auto bg-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Trending Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`rounded-3xl border p-6 ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white/80 border-gray-200/50'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                    <FireIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className={`text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Trending Skills
                  </h2>
                </div>
                <button
                  onClick={handleExploreSkills}
                  className={`text-sm font-medium flex items-center gap-1 transition-colors ${
                    isDark 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  View All
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>

              {isTrendingLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" text="Loading trending skills..." />
                </div>
              ) : trendingSkills?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingSkills.slice(0, 6).map((skill, index) => (
                    <motion.div
                      key={skill._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group hover:shadow-lg ${
                        isDark 
                          ? 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50' 
                          : 'bg-gray-50/50 border-gray-200 hover:bg-white hover:shadow-md'
                      }`}
                      whileHover={{ y: -2 }}
                      onClick={handleExploreSkills}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className={`font-semibold text-lg group-hover:text-blue-500 transition-colors ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {skill.name}
                        </h3>
                        {skill.trending && (
                          <FireIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className={`text-sm mb-3 line-clamp-2 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {skill.category}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isDark 
                            ? 'bg-blue-900/30 text-blue-400' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {skill.userCount || 0} learners
                        </span>
                        
                        {skill.avgRating > 0 && (
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className={`text-sm ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {skill.avgRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <AcademicCapIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No trending skills available yet.</p>
                  <button
                    onClick={handleExploreSkills}
                    className="mt-2 text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Explore all skills
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`rounded-3xl border p-6 ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white/80 border-gray-200/50'
              }`}
            >
              <h3 className={`text-lg font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Your Journey
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <AcademicCapIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Skills Added
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        What you can share
                      </p>
                    </div>
                  </div>
                  <span className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {profile?.skills?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <UserGroupIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Connections
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        People you've met
                      </p>
                    </div>
                  </div>
                  <span className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    0
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Sessions
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Learning & teaching
                      </p>
                    </div>
                  </div>
                  <span className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    0
                  </span>
                </div>
              </div>

              {(profile?.skills?.length || 0) === 0 && (
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20">
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Ready to get started?
                  </p>
                  <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Add your first skill to begin connecting with others!
                  </p>
                  <button
                    onClick={handleAddSkill}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    Add Your First Skill
                  </button>
                </div>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className={`rounded-3xl border p-6 ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white/80 border-gray-200/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <ClockIcon className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <h3 className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Recent Activity
                </h3>
              </div>

              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <HeartIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No activity yet</p>
                <p className="text-xs mt-1">
                  Complete your profile to start your journey!
                </p>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-3xl p-6 text-white relative overflow-hidden"
            >
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">
                  Ready to Learn & Teach?
                </h3>
                <p className="text-white/90 mb-4 text-sm">
                  Join thousands of learners and teachers in our community. Share your expertise and discover new skills.
                </p>
                <motion.button
                  onClick={handleExploreSkills}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Exploring
                </motion.button>
              </div>
              
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;