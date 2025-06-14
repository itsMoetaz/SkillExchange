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
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  RocketLaunchIcon,
  StarIcon,
  SparklesIcon,
  AcademicCapIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const schema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
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
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900' 
            : 'bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50'
        }`} 
      />
      
      {/* Floating Orbs - Optimized with will-change */}
      <motion.div
        className={`absolute top-1/3 left-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-full blur-2xl sm:blur-3xl transition-colors duration-1000 ${
          isDark 
            ? 'bg-gradient-to-r from-pink-500/15 to-rose-500/15' 
            : 'bg-gradient-to-r from-pink-400/25 to-rose-400/25'
        }`}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.7, 0.3],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ willChange: 'transform, opacity' }}
      />
      
      <motion.div
        className={`absolute bottom-1/3 right-1/4 w-28 h-28 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 xl:w-96 xl:h-96 rounded-full blur-2xl sm:blur-3xl transition-colors duration-1000 ${
          isDark 
            ? 'bg-gradient-to-r from-purple-500/15 to-indigo-500/15' 
            : 'bg-gradient-to-r from-purple-400/25 to-indigo-400/25'
        }`}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.4, 0.8, 0.4],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ willChange: 'transform, opacity' }}
      />
      
      {/* Decorative Elements - Responsive sizes */}
      <motion.div
        className={`absolute top-8 right-8 sm:top-12 sm:right-12 lg:top-20 lg:right-32 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full transition-colors duration-1000 ${
          isDark 
            ? 'bg-gradient-to-r from-pink-500/40 to-rose-500/40' 
            : 'bg-gradient-to-r from-pink-400/50 to-rose-500/50'
        }`}
        animate={{ 
          y: [0, -20, 0],
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ willChange: 'transform, opacity' }}
      />
      
      <motion.div
        className={`absolute bottom-16 left-16 sm:bottom-20 sm:left-20 lg:bottom-32 lg:left-32 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 border-2 rounded-full transition-colors duration-1000 ${
          isDark ? 'border-purple-400/40' : 'border-purple-400/50'
        }`}
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ willChange: 'transform' }}
      />

      {/* Additional floating elements */}
      <motion.div
        className={`absolute top-1/2 right-8 w-3 h-3 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-full transition-colors duration-1000 ${
          isDark ? 'bg-yellow-400/30' : 'bg-yellow-400/50'
        }`}
        animate={{
          x: [0, -15, 0],
          y: [0, 10, 0],
          opacity: [0.4, 0.9, 0.4]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ willChange: 'transform, opacity' }}
      />
    </div>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

// Enhanced Journey Illustration
const RegisterIllustration = React.memo(() => {
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';

  const journeySteps = useMemo(() => [
    { step: '1', title: 'Create Profile', desc: 'Tell us about your skills', icon: UserIcon, color: 'from-emerald-400 to-green-500' },
    { step: '2', title: 'Find Matches', desc: 'Connect with perfect partners', icon: UserGroupIcon, color: 'from-blue-400 to-cyan-500' },
    { step: '3', title: 'Start Learning', desc: 'Begin your skill exchange', icon: AcademicCapIcon, color: 'from-purple-400 to-pink-500' },
    { step: '4', title: 'Achieve Goals', desc: 'Unlock your potential', icon: StarIcon, color: 'from-orange-400 to-yellow-500' },
  ], []);

  const badges = useMemo(() => [
    { text: 'Learn', icon: '📚', position: { top: '10%', left: '5%' } },
    { text: 'Connect', icon: '🤝', position: { top: '15%', right: '5%' } },
    { text: 'Grow', icon: '🌱', position: { bottom: '20%', left: '0%' } },
    { text: 'Achieve', icon: '🏆', position: { bottom: '15%', right: '0%' } },
  ], []);

  const floatingEmojis = useMemo(() => ['🎯', '💡', '🚀', '⭐', '🎉', '💪'], []);

  return (
    <div className="w-full max-w-lg mx-auto text-center px-4">
      {/* Enhanced Journey Illustration */}
      <motion.div className="relative mb-8 lg:mb-12">
        {/* Journey Path Container */}
        <motion.div
          className="w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 mx-auto relative"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {/* Central Success Hub */}
          <motion.div
            className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-600 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-1000 ${
              isDark ? 'shadow-2xl shadow-rose-500/30' : 'shadow-2xl shadow-rose-500/50'
            }`}
            animate={{ 
              boxShadow: isDark 
                ? [
                    "0 0 30px rgba(244, 63, 94, 0.3), 0 0 60px rgba(147, 51, 234, 0.2)",
                    "0 0 60px rgba(147, 51, 234, 0.4), 0 0 90px rgba(244, 63, 94, 0.3)",
                    "0 0 30px rgba(244, 63, 94, 0.3), 0 0 60px rgba(147, 51, 234, 0.2)",
                  ]
                : [
                    "0 0 30px rgba(244, 63, 94, 0.4), 0 0 60px rgba(147, 51, 234, 0.3)",
                    "0 0 60px rgba(147, 51, 234, 0.6), 0 0 90px rgba(244, 63, 94, 0.4)",
                    "0 0 30px rgba(244, 63, 94, 0.4), 0 0 60px rgba(147, 51, 234, 0.3)",
                  ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ willChange: 'box-shadow' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              style={{ willChange: 'transform' }}
            >
              <RocketLaunchIcon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 xl:w-14 xl:h-14 text-white drop-shadow-lg" />
            </motion.div>
            
            {/* Inner glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent" />
          </motion.div>

          {/* Journey Path SVG */}
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 320 320"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 2.5, ease: "easeInOut" }}
          >
            <motion.path
              d="M 40 280 Q 80 200 160 180 Q 240 160 280 80"
              stroke="url(#journeyGradient)"
              strokeWidth="4"
              fill="none"
              strokeDasharray="8 4"
              className="drop-shadow-sm"
            />
            <defs>
              <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="25%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="75%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </motion.svg>

          {/* Journey Step Points */}
          {journeySteps.map((step, index) => {
            const positions = [
              { x: 40, y: 280 }, // Start
              { x: 120, y: 220 }, // Step 2
              { x: 200, y: 200 }, // Step 3
              { x: 280, y: 80 }   // End
            ];
            
            return (
              <motion.div
                key={step.step}
                className={`absolute w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center shadow-lg transition-all duration-1000 cursor-pointer ${
                  isDark ? 'shadow-lg shadow-black/20' : 'shadow-lg shadow-gray-900/20'
                }`}
                style={{ 
                  left: positions[index].x - 24, 
                  top: positions[index].y - 24,
                  willChange: 'transform, opacity'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.2 + index * 0.3, duration: 0.6 }}
                whileHover={{ scale: 1.1, y: -5 }}
              >
                <step.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white drop-shadow-sm" />
                
                {/* Step number badge */}
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white transition-all duration-1000 ${
                  isDark ? 'bg-gray-800 shadow-lg' : 'bg-white text-gray-800 shadow-lg'
                }`}>
                  {step.step}
                </div>

                {/* Tooltip */}
                <div className={`absolute -bottom-16 left-1/2 transform -translate-x-1/2 px-3 py-2 rounded-lg text-xs font-semibold opacity-0 hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap ${
                  isDark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-800 shadow-lg border border-gray-200'
                }`}>
                  <div className="font-bold">{step.title}</div>
                  <div className="text-xs opacity-75">{step.desc}</div>
                </div>
              </motion.div>
            );
          })}

          {/* Floating Success Elements */}
          {floatingEmojis.map((emoji, index) => (
            <motion.div
              key={emoji + index}
              className="absolute text-lg sm:text-xl lg:text-2xl cursor-pointer"
              style={{
                top: `${15 + Math.random() * 70}%`,
                left: `${15 + Math.random() * 70}%`,
                willChange: 'transform, opacity'
              }}
              animate={{
                y: [0, -15, 0],
                rotate: [0, 10, -10, 0],
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 3 + index * 0.5,
                repeat: Infinity,
                delay: 2 + index * 0.3,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.3, rotate: 15 }}
            >
              {emoji}
            </motion.div>
          ))}
        </motion.div>

        {/* Inspirational Badges */}
        {badges.map((badge, index) => (
          <motion.div
            key={badge.text}
            className={`absolute px-3 py-2 sm:px-4 sm:py-2 rounded-full shadow-lg border backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all duration-1000 ${
              isDark 
                ? 'bg-gray-800/90 border-gray-600/50 text-gray-100 shadow-gray-900/30 hover:bg-gray-800' 
                : 'bg-white/90 border-gray-200/60 text-gray-700 shadow-gray-900/20 hover:bg-white'
            }`}
            style={{ ...badge.position, willChange: 'transform, opacity' }}
            animate={{
              y: [0, -6, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2.5 + index * 0.3,
              repeat: Infinity,
              delay: 2.5 + index * 0.2,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.1, y: -8 }}
          >
            <span className="text-base sm:text-lg">{badge.icon}</span>
            <span className="text-xs sm:text-sm font-semibold">
              {badge.text}
            </span>
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
              ? 'bg-gradient-to-r from-rose-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-rose-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'
          }`}
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          Start Your Learning Adventure
        </motion.h1>
        
        <motion.p 
          className={`text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed mb-8 lg:mb-10 transition-colors duration-1000 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          Join thousands of learners on a journey of discovery, growth, and meaningful connections that will transform your future.
        </motion.p>
        
        {/* Enhanced Journey Steps Cards */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {journeySteps.slice(0, 3).map((item, index) => (
            <motion.div
              key={item.step}
              className={`flex items-center gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-sm border transition-all duration-1000 cursor-pointer ${
                isDark 
                  ? 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60 hover:border-gray-600/70' 
                  : 'bg-white/60 border-gray-200/50 hover:bg-white/80 hover:border-gray-300/70'
              }`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 3 + index * 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.02, x: 5 }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg">
                {item.step}
              </div>
              <div className="flex-1">
                <div className={`font-bold text-sm sm:text-base transition-colors duration-1000 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.title}
                </div>
                <div className={`text-xs sm:text-sm transition-colors duration-1000 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {item.desc}
                </div>
              </div>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
              >
                <SparklesIcon className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-1000 ${
                  isDark ? 'text-purple-400' : 'text-purple-500'
                }`} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
});

RegisterIllustration.displayName = 'RegisterIllustration';

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading, error, isAuthenticated, clearError } = useAuth();
  const { theme } = useSelector((state: RootState) => state.theme);
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const password = watch('password');

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
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
    const { name, email, password } = data;
    const result = await registerUser({ name, email, password });
    if (result.type === 'auth/register/fulfilled') {
      navigate('/dashboard');
    }
  }, [registerUser, navigate]);

  // Enhanced Password strength checker
  const getPasswordStrength = useCallback((pwd: string) => {
    if (!pwd) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    const checks = [
      pwd.length >= 6,
      /[a-z]/.test(pwd),
      /[A-Z]/.test(pwd),
      /\d/.test(pwd),
      /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    ];
    
    strength = checks.filter(Boolean).length;
    
    if (strength <= 2) return { strength, text: 'Weak', color: isDark ? 'text-red-400' : 'text-red-500' };
    if (strength <= 3) return { strength, text: 'Fair', color: isDark ? 'text-yellow-400' : 'text-yellow-500' };
    if (strength <= 4) return { strength, text: 'Good', color: isDark ? 'text-blue-400' : 'text-blue-500' };
    return { strength, text: 'Strong', color: isDark ? 'text-green-400' : 'text-green-500' };
  }, [isDark]);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password, getPasswordStrength]);

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
          <RegisterIllustration />
        </motion.div>

        {/* Right Side - Form (Full width on mobile/tablet, fixed width on xl+) */}
        <motion.div 
          className="flex-1 xl:w-[520px] xl:max-w-2xl flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="w-full max-w-md">
            {/* Logo & Header */}
            <motion.div
              className="text-center mb-6 lg:mb-8"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 mb-4 lg:mb-6 mx-auto shadow-xl"
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-2xl sm:text-3xl lg:text-4xl">🚀</span>
              </motion.div>
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 transition-colors duration-1000 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Join SkillExchange
              </h2>
              <p className={`text-sm sm:text-base lg:text-lg transition-colors duration-1000 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Create your learning profile
              </p>
            </motion.div>

            {/* Register Form */}
            <motion.div
              className={`backdrop-blur-xl rounded-3xl shadow-2xl border p-6 sm:p-8 lg:p-10 max-h-[75vh] overflow-y-auto transition-all duration-1000 ${
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

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 lg:space-y-6">
                {/* Name Field */}
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <label className={`block text-sm sm:text-base lg:text-lg font-semibold mb-2 transition-colors duration-1000 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      {...register('name')}
                      type="text"
                      placeholder="Enter your full name"
                      className={`w-full pl-10 sm:pl-12 lg:pl-14 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm text-sm sm:text-base lg:text-lg font-medium ${
                        errors.name 
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-200/50' 
                          : isDark
                            ? 'border-gray-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 bg-gray-700/50 text-white placeholder-gray-400'
                            : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 bg-white/70 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <UserIcon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 absolute left-3 sm:left-4 lg:left-5 top-1/2 transform -translate-y-1/2 transition-colors duration-1000 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </div>
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p
                        className={`mt-2 text-sm font-medium transition-colors duration-1000 ${
                          isDark ? 'text-red-400' : 'text-red-600'
                        }`}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                      >
                        {errors.name.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Email Field */}
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <label className={`block text-sm sm:text-base lg:text-lg font-semibold mb-2 transition-colors duration-1000 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="Enter your email"
                      className={`w-full pl-10 sm:pl-12 lg:pl-14 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm text-sm sm:text-base lg:text-lg font-medium ${
                        errors.email 
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-200/50' 
                          : isDark
                            ? 'border-gray-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 bg-gray-700/50 text-white placeholder-gray-400'
                            : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 bg-white/70 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <EnvelopeIcon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 absolute left-3 sm:left-4 lg:left-5 top-1/2 transform -translate-y-1/2 transition-colors duration-1000 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        className={`mt-2 text-sm font-medium transition-colors duration-1000 ${
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
                  <label className={`block text-sm sm:text-base lg:text-lg font-semibold mb-2 transition-colors duration-1000 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      className={`w-full pl-10 sm:pl-12 lg:pl-14 pr-10 sm:pr-12 lg:pr-14 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm text-sm sm:text-base lg:text-lg font-medium ${
                        errors.password 
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-200/50' 
                          : isDark
                            ? 'border-gray-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 bg-gray-700/50 text-white placeholder-gray-400'
                            : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 bg-white/70 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <LockClosedIcon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 absolute left-3 sm:left-4 lg:left-5 top-1/2 transform -translate-y-1/2 transition-colors duration-1000 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <motion.button
                      type="button"
                      onClick={togglePassword}
                      className={`absolute right-3 sm:right-4 lg:right-5 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                        isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {showPassword ? 
                        <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" /> : 
                        <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                      }
                    </motion.button>
                  </div>
                  
                  {/* Enhanced Password Strength Indicator */}
                  <AnimatePresence>
                    {password && (
                      <motion.div
                        className="mt-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-1 flex-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <motion.div
                                key={level}
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  level <= passwordStrength.strength
                                    ? passwordStrength.strength <= 2
                                      ? 'bg-red-500'
                                      : passwordStrength.strength <= 3
                                      ? 'bg-yellow-500'
                                      : passwordStrength.strength <= 4
                                      ? 'bg-blue-500'
                                      : 'bg-green-500'
                                    : isDark ? 'bg-gray-600' : 'bg-gray-200'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ delay: level * 0.1 }}
                              />
                            ))}
                          </div>
                          <span className={`text-xs font-bold min-w-12 ${passwordStrength.color}`}>
                            {passwordStrength.text}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        className={`mt-2 text-sm font-medium transition-colors duration-1000 ${
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

                {/* Confirm Password Field */}
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <label className={`block text-sm sm:text-base lg:text-lg font-semibold mb-2 transition-colors duration-1000 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className={`w-full pl-10 sm:pl-12 lg:pl-14 pr-10 sm:pr-12 lg:pr-14 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm text-sm sm:text-base lg:text-lg font-medium ${
                        errors.confirmPassword 
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-200/50' 
                          : isDark
                            ? 'border-gray-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 bg-gray-700/50 text-white placeholder-gray-400'
                            : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 bg-white/70 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <LockClosedIcon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 absolute left-3 sm:left-4 lg:left-5 top-1/2 transform -translate-y-1/2 transition-colors duration-1000 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <motion.button
                      type="button"
                      onClick={toggleConfirmPassword}
                      className={`absolute right-3 sm:right-4 lg:right-5 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                        isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {showConfirmPassword ? 
                        <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" /> : 
                        <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                      }
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {errors.confirmPassword && (
                      <motion.p
                        className={`mt-2 text-sm font-medium transition-colors duration-1000 ${
                          isDark ? 'text-red-400' : 'text-red-600'
                        }`}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                      >
                        {errors.confirmPassword.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="w-full bg-gradient-to-r from-rose-500 via-purple-500 to-pink-600 text-white py-3 sm:py-4 lg:py-5 px-8 rounded-xl sm:rounded-2xl font-bold shadow-xl hover:shadow-2xl transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group text-sm sm:text-base lg:text-lg mt-6"
                  whileHover={{ scale: isValid && !isLoading ? 1.02 : 1 }}
                  whileTap={{ scale: isValid && !isLoading ? 0.98 : 1 }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 border-2 border-white border-t-transparent mr-3"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Create Account
                      <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 ml-3 transition-transform group-hover:rotate-12" />
                    </div>
                  )}
                </motion.button>
              </form>

              {/* Login Link */}
              <motion.div 
                className="mt-6 lg:mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <p className={`text-sm sm:text-base lg:text-lg transition-colors duration-1000 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className={`font-bold transition-colors duration-300 ${
                      isDark 
                        ? 'text-purple-400 hover:text-purple-300' 
                        : 'text-purple-600 hover:text-purple-500'
                    }`}
                  >
                    Sign in here
                  </Link>
                </p>
              </motion.div>
            </motion.div>

            {/* Footer */}
            <motion.div
              className={`text-center mt-6 lg:mt-8 text-sm sm:text-base transition-colors duration-1000 ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              © 2025 SkillExchange. Empowering growth together.
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;