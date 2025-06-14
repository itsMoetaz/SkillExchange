import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  LightBulbIcon,
  BookOpenIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

type FormData = yup.InferType<typeof schema>;

// Memoized background component for performance
const AnimatedBackground = React.memo(() => {
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Main gradient background - Responsive to theme */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ${
          isDark 
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900' 
            : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50'
        }`} 
      />
      
      {/* Floating Orbs - Optimized with will-change */}
      <motion.div
        className={`absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-full blur-2xl sm:blur-3xl transition-colors duration-1000 ${
          isDark 
            ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/15' 
            : 'bg-gradient-to-r from-blue-400/25 to-purple-400/25'
        }`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.8, 0.4],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ willChange: 'transform, opacity' }}
      />
      
      <motion.div
        className={`absolute bottom-1/4 right-1/4 w-28 h-28 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 xl:w-80 xl:h-80 rounded-full blur-2xl sm:blur-3xl transition-colors duration-1000 ${
          isDark 
            ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/15' 
            : 'bg-gradient-to-r from-cyan-400/25 to-indigo-400/25'
        }`}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.9, 0.5],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ willChange: 'transform, opacity' }}
      />
      
      {/* Geometric Shapes - Responsive sizes */}
      <motion.div
        className={`absolute top-4 right-4 sm:top-8 sm:right-8 lg:top-12 lg:right-12 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 border-2 transition-colors duration-1000 ${
          isDark ? 'border-blue-400/40' : 'border-blue-300/50'
        }`}
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ willChange: 'transform' }}
      />
      
      <motion.div
        className={`absolute bottom-8 left-8 sm:bottom-12 sm:left-12 lg:bottom-16 lg:left-16 w-6 h-6 sm:w-10 sm:h-10 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-full transition-colors duration-1000 ${
          isDark 
            ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30' 
            : 'bg-gradient-to-r from-purple-400/40 to-pink-400/40'
        }`}
        animate={{ 
          y: [-15, 15, -15],
          scale: [1, 1.1, 1],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ willChange: 'transform, opacity' }}
      />

      {/* Additional decorative elements */}
      <motion.div
        className={`absolute top-1/2 left-8 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full transition-colors duration-1000 ${
          isDark ? 'bg-yellow-400/30' : 'bg-yellow-400/50'
        }`}
        animate={{
          x: [0, 20, 0],
          y: [0, -10, 0],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ willChange: 'transform, opacity' }}
      />
    </div>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

// Enhanced illustration component
const LoginIllustration = React.memo(() => {
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';

  const skills = useMemo(() => 
    ['React', 'Node.js', 'Python', 'Design', 'AI', 'Data Science'], []
  );

  const stats = useMemo(() => [
    { number: '15K+', label: 'Learners', icon: '👥' },
    { number: '800+', label: 'Skills', icon: '🎯' },
    { number: '60+', label: 'Countries', icon: '🌍' },
  ], []);

  const orbitingElements = useMemo(() => [
    { icon: BookOpenIcon, color: 'from-emerald-400 to-green-500', delay: 0, name: 'Learn' },
    { icon: LightBulbIcon, color: 'from-amber-400 to-orange-500', delay: 0.8, name: 'Innovate' },
    { icon: UserGroupIcon, color: 'from-rose-400 to-pink-500', delay: 1.6, name: 'Connect' },
    { icon: RocketLaunchIcon, color: 'from-violet-400 to-purple-500', delay: 2.4, name: 'Launch' },
  ], []);

  return (
    <div className="w-full max-w-lg mx-auto text-center px-4">
      {/* Enhanced Main Illustration */}
      <motion.div className="relative mb-8 lg:mb-12">
        {/* Central Learning Hub */}
        <motion.div
          className="w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 mx-auto relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Main Circle with enhanced shadow */}
          <motion.div
            className={`w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-1000 ${
              isDark ? 'shadow-2xl shadow-blue-500/30' : 'shadow-2xl shadow-blue-500/50'
            }`}
            animate={{ 
              boxShadow: isDark 
                ? [
                    "0 0 30px rgba(59, 130, 246, 0.3), 0 0 60px rgba(147, 51, 234, 0.2)",
                    "0 0 60px rgba(147, 51, 234, 0.4), 0 0 90px rgba(59, 130, 246, 0.3)",
                    "0 0 30px rgba(59, 130, 246, 0.3), 0 0 60px rgba(147, 51, 234, 0.2)",
                  ]
                : [
                    "0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(147, 51, 234, 0.3)",
                    "0 0 60px rgba(147, 51, 234, 0.6), 0 0 90px rgba(59, 130, 246, 0.4)",
                    "0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(147, 51, 234, 0.3)",
                  ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ willChange: 'box-shadow' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              style={{ willChange: 'transform' }}
            >
              <AcademicCapIcon className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 xl:w-18 xl:h-18 text-white drop-shadow-lg" />
            </motion.div>
            
            {/* Inner glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent" />
          </motion.div>

          {/* Enhanced Orbiting Elements */}
          {orbitingElements.map((item, index) => {
            const radius = 45; // Base radius, will be responsive
            const angle = (index * 90 * Math.PI) / 180; // 90 degrees apart
            
            return (
              <motion.div
                key={index}
                className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-18 lg:h-18 xl:w-20 xl:h-20 bg-gradient-to-r ${item.color} rounded-full absolute flex items-center justify-center shadow-lg transition-all duration-1000 ${
                  isDark ? 'shadow-lg shadow-black/20' : 'shadow-lg shadow-gray-900/20'
                }`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  rotate: 360,
                  x: Math.cos(angle + (Date.now() / 1000) * 0.5) * (radius + window.innerWidth * 0.05),
                  y: Math.sin(angle + (Date.now() / 1000) * 0.5) * (radius + window.innerWidth * 0.05),
                }}
                transition={{
                  scale: { duration: 0.6, delay: 0.5 + index * 0.2 },
                  opacity: { duration: 0.6, delay: 0.5 + index * 0.2 },
                  rotate: { duration: 20, repeat: Infinity, ease: "linear", delay: item.delay },
                  x: { duration: 20, repeat: Infinity, ease: "linear", delay: item.delay },
                  y: { duration: 20, repeat: Infinity, ease: "linear", delay: item.delay },
                }}
                style={{ 
                  willChange: 'transform, opacity',
                  top: '50%',
                  left: '50%',
                }}
                whileHover={{ scale: 1.1 }}
              >
                <item.icon className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 text-white drop-shadow-sm" />
                
                {/* Tooltip */}
                <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                  isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800 shadow-lg'
                }`}>
                  {item.name}
                </div>
              </motion.div>
            );
          })}

          {/* Connection Lines with enhanced styling */}
          {orbitingElements.map((_, index) => (
            <motion.div
              key={`line-${index}`}
              className={`absolute w-0.5 origin-bottom transition-all duration-1000 ${
                isDark 
                  ? 'bg-gradient-to-t from-blue-500/30 via-purple-500/20 to-transparent' 
                  : 'bg-gradient-to-t from-blue-400/40 via-purple-400/30 to-transparent'
              }`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: '60px',
                opacity: 1,
                rotate: 360 + (index * 90),
              }}
              transition={{
                height: { duration: 0.8, delay: 1 + index * 0.2 },
                opacity: { duration: 0.8, delay: 1 + index * 0.2 },
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              }}
              style={{ 
                willChange: 'transform, opacity',
                top: '50%',
                left: '50%',
                transformOrigin: 'bottom center',
              }}
            />
          ))}
        </motion.div>

        {/* Enhanced Floating Skills */}
        {skills.map((skill, index) => (
          <motion.div
            key={skill}
            className={`absolute px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg border backdrop-blur-md transition-all duration-1000 cursor-pointer ${
              isDark 
                ? 'bg-gray-800/90 border-gray-600/50 text-gray-100 shadow-gray-900/30' 
                : 'bg-white/90 border-gray-200/60 text-gray-700 shadow-gray-900/20'
            }`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.8, 1, 0.8],
              scale: 1,
              y: [0, -8, 0],
            }}
            transition={{
              opacity: { duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 0.5, delay: 1.5 + index * 0.2 },
              y: { duration: 2.5 + index * 0.3, repeat: Infinity, delay: index * 0.4, ease: "easeInOut" },
            }}
            style={{ 
              willChange: 'transform, opacity',
              top: `${15 + (index % 4) * 20}%`,
              left: `${5 + (index % 5) * 20}%`,
            }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            {skill}
          </motion.div>
        ))}
      </motion.div>

      {/* Enhanced Welcome Text */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <motion.h1 
          className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6 transition-all duration-1000 ${
            isDark 
              ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'
          }`}
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          Welcome Back to SkillExchange
        </motion.h1>
        
        <motion.p 
          className={`text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed mb-8 lg:mb-10 transition-colors duration-1000 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          Continue your learning journey and connect with amazing people who share your passion for growth and innovation.
        </motion.p>
        
        {/* Enhanced Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className={`text-center p-3 sm:p-4 lg:p-6 rounded-2xl backdrop-blur-sm border transition-all duration-1000 ${
                isDark 
                  ? 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60' 
                  : 'bg-white/40 border-gray-200/50 hover:bg-white/60'
              }`}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 2.8 + index * 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2">
                {stat.icon}
              </div>
              <div className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-1 transition-colors duration-1000 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3 + index * 0.2, duration: 0.5 }}
                >
                  {stat.number}
                </motion.span>
              </div>
              <div className={`text-xs sm:text-sm lg:text-base font-medium transition-colors duration-1000 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
});

LoginIllustration.displayName = 'LoginIllustration';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, isAuthenticated, clearError } = useAuth();
  const { theme } = useSelector((state: RootState) => state.theme);
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = useCallback(async (data: FormData) => {
    const result = await login(data);
    if (result.type === 'auth/login/fulfilled') {
      navigate('/dashboard');
    }
  }, [login, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background - Full page coverage */}
      <AnimatedBackground />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col xl:flex-row">
        {/* Left Side - Illustration (Hidden on mobile/tablet, shown on xl+) */}
        <motion.div 
          className="hidden xl:flex xl:flex-1 xl:max-w-3xl items-center justify-center p-8 2xl:p-12"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <LoginIllustration />
        </motion.div>

        {/* Right Side - Form (Full width on mobile/tablet, fixed width on xl+) */}
        <motion.div 
          className="flex-1 xl:w-[480px] xl:max-w-2xl flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="w-full max-w-md">
            {/* Logo & Header */}
            <motion.div
              className="text-center mb-8 lg:mb-10"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4 lg:mb-6 mx-auto shadow-xl"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-2xl sm:text-3xl lg:text-4xl">⚡</span>
              </motion.div>
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 transition-colors duration-1000 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Sign In
              </h2>
              <p className={`text-sm sm:text-base lg:text-lg transition-colors duration-1000 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Access your learning dashboard
              </p>
            </motion.div>

            {/* Login Form */}
            <motion.div
              className={`backdrop-blur-xl rounded-3xl shadow-2xl border p-6 sm:p-8 lg:p-10 transition-all duration-1000 ${
                isDark 
                  ? 'bg-gray-800/80 border-gray-700/50 shadow-gray-900/50' 
                  : 'bg-white/80 border-gray-200/50 shadow-gray-900/20'
              }`}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Error Alert */}
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
                    transition={{ duration: 0.4, type: "spring" }}
                  >
                    <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base font-medium">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg:space-y-8">
                {/* Email Field */}
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <label className={`block text-sm sm:text-base lg:text-lg font-semibold mb-3 transition-colors duration-1000 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="Enter your email"
                      className={`w-full pl-12 sm:pl-14 lg:pl-16 pr-4 py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm text-sm sm:text-base lg:text-lg font-medium ${
                        errors.email 
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-200/50' 
                          : isDark
                            ? 'border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-gray-700/50 text-white placeholder-gray-400'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 bg-white/70 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <EnvelopeIcon className={`h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 absolute left-4 sm:left-5 lg:left-6 top-1/2 transform -translate-y-1/2 transition-colors duration-1000 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        className={`mt-2 text-sm sm:text-base font-medium transition-colors duration-1000 ${
                          isDark ? 'text-red-400' : 'text-red-600'
                        }`}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <label className={`block text-sm sm:text-base lg:text-lg font-semibold mb-3 transition-colors duration-1000 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className={`w-full pl-12 sm:pl-14 lg:pl-16 pr-12 sm:pr-14 lg:pr-16 py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm text-sm sm:text-base lg:text-lg font-medium ${
                        errors.password 
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-200/50' 
                          : isDark
                            ? 'border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-gray-700/50 text-white placeholder-gray-400'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 bg-white/70 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <LockClosedIcon className={`h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 absolute left-4 sm:left-5 lg:left-6 top-1/2 transform -translate-y-1/2 transition-colors duration-1000 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <motion.button
                      type="button"
                      onClick={togglePassword}
                      className={`absolute right-4 sm:right-5 lg:right-6 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                        isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {showPassword ? 
                        <EyeSlashIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" /> : 
                        <EyeIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                      }
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        className={`mt-2 text-sm sm:text-base font-medium transition-colors duration-1000 ${
                          isDark ? 'text-red-400' : 'text-red-600'
                        }`}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Forgot Password */}
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className={`text-sm sm:text-base lg:text-lg font-semibold transition-colors duration-300 ${
                      isDark 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-500'
                    }`}
                  >
                    Forgot your password?
                  </Link>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white py-3 sm:py-4 lg:py-5 px-8 rounded-xl sm:rounded-2xl font-bold shadow-xl hover:shadow-2xl transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group text-sm sm:text-base lg:text-lg"
                  whileHover={{ scale: isValid && !isLoading ? 1.02 : 1 }}
                  whileTap={{ scale: isValid && !isLoading ? 0.98 : 1 }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 border-2 border-white border-t-transparent mr-3"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Sign In
                      <ArrowRightIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 ml-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </motion.button>
              </form>

              {/* Register Link */}
              <motion.div 
                className="mt-8 lg:mt-10 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <p className={`text-sm sm:text-base lg:text-lg transition-colors duration-1000 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className={`font-bold transition-colors duration-300 ${
                      isDark 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-500'
                    }`}
                  >
                    Create one now
                  </Link>
                </p>
              </motion.div>
            </motion.div>

            {/* Footer */}
            <motion.div
              className={`text-center mt-8 lg:mt-10 text-sm sm:text-base transition-colors duration-1000 ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              © 2025 SkillExchange. Connecting minds worldwide.
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;