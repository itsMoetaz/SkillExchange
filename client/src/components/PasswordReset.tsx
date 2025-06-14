import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { usePasswordReset } from '../hooks/usePasswordReset';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

// Step schemas
const emailSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const codeSchema = yup.object({
  code: yup.string().required('Reset code is required').length(6, 'Reset code must be 6 digits'),
});

const passwordSchema = yup.object({
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

type EmailFormData = yup.InferType<typeof emailSchema>;
type CodeFormData = yup.InferType<typeof codeSchema>;
type PasswordFormData = yup.InferType<typeof passwordSchema>;

// Enhanced animated background
const AnimatedBackground = React.memo(() => {
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div 
        className={`absolute inset-0 transition-all duration-1000 ${
          isDark 
            ? 'bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900' 
            : 'bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50'
        }`} 
      />
      
      {/* Floating Security Elements */}
      <motion.div
        className={`absolute top-1/4 left-1/5 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full blur-3xl transition-colors duration-1000 ${
          isDark 
            ? 'bg-gradient-to-r from-indigo-500/20 to-blue-500/15' 
            : 'bg-gradient-to-r from-indigo-400/30 to-blue-400/25'
        }`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
          rotate: [0, 120, 240, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ willChange: 'transform, opacity' }}
      />
      
      <motion.div
        className={`absolute bottom-1/4 right-1/5 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-88 lg:h-88 rounded-full blur-3xl transition-colors duration-1000 ${
          isDark 
            ? 'bg-gradient-to-r from-purple-500/15 to-pink-500/20' 
            : 'bg-gradient-to-r from-purple-400/25 to-pink-400/30'
        }`}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [360, 240, 120, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ willChange: 'transform, opacity' }}
      />

      {/* Security Icons */}
      {[ShieldCheckIcon, KeyIcon, LockClosedIcon].map((Icon, index) => (
        <motion.div
          key={index}
          className={`absolute w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 transition-colors duration-1000 ${
            isDark ? 'text-indigo-400/30' : 'text-indigo-500/40'
          }`}
          style={{
            top: `${20 + index * 25}%`,
            right: `${10 + index * 15}%`,
            willChange: 'transform, opacity'
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

// Step Progress Bar Component
const StepProgressBar = React.memo(({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';
  
  const steps = useMemo(() => [
    { id: 1, title: 'Enter Email', icon: EnvelopeIcon },
    { id: 2, title: 'Verify Code', icon: ShieldCheckIcon },
    { id: 3, title: 'New Password', icon: KeyIcon },
  ], []);

  return (
    <div className="w-full mb-8 lg:mb-12">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <React.Fragment key={step.id}>
              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <motion.div
                  className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? isDark
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-indigo-500 border-indigo-400 text-white'
                      : isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-400'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  animate={isCurrent ? { 
                    boxShadow: [
                      '0 0 0 0 rgba(79, 70, 229, 0.4)',
                      '0 0 0 10px rgba(79, 70, 229, 0)',
                      '0 0 0 0 rgba(79, 70, 229, 0.4)',
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: isCurrent ? Infinity : 0 }}
                >
                  {isCompleted ? (
                    <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  ) : (
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  )}
                </motion.div>
                <p className={`mt-2 text-xs sm:text-sm font-medium text-center transition-colors duration-500 ${
                  isCurrent
                    ? isDark ? 'text-indigo-400' : 'text-indigo-600'
                    : isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
              </motion.div>
              
              {index < steps.length - 1 && (
                <motion.div
                  className={`flex-1 h-0.5 mx-4 transition-all duration-500 ${
                    currentStep > step.id
                      ? 'bg-green-500'
                      : isDark ? 'bg-gray-700' : 'bg-gray-300'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: currentStep > step.id ? 1 : 0.3 }}
                  transition={{ duration: 0.8, delay: index * 0.3 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Progress percentage */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
});

StepProgressBar.displayName = 'StepProgressBar';

const PasswordReset: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { sendResetCode, verifyCode, resetUserPassword, clearResetError, isLoading, error } = usePasswordReset();
  const { theme } = useSelector((state: RootState) => state.theme);
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  // Form configurations for each step
  const emailForm = useForm<EmailFormData>({
    resolver: yupResolver(emailSchema),
    mode: 'onChange',
  });

  const codeForm = useForm<CodeFormData>({
    resolver: yupResolver(codeSchema),
    mode: 'onChange',
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
    mode: 'onChange',
  });

  // Countdown timer for resend code
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    clearResetError();
  }, [currentStep, clearResetError]);

  const togglePassword = useCallback(() => setShowPassword(prev => !prev), []);
  const toggleConfirmPassword = useCallback(() => setShowConfirmPassword(prev => !prev), []);

  // Step 1: Send reset code
  const handleSendResetCode = useCallback(async (data: EmailFormData) => {
    const result = await sendResetCode(data.email);
    if (result.type === 'auth/forgotPassword/fulfilled') {
      setEmail(data.email);
      setCurrentStep(2);
      setCountdown(60); // 60 seconds countdown
    }
  }, [sendResetCode]);

  // Step 2: Verify reset code
  const handleVerifyCode = useCallback(async (data: CodeFormData) => {
    const result = await verifyCode(email, data.code);
    if (result.type === 'auth/verifyResetCode/fulfilled') {
      setResetToken(result.payload.resetToken);
      setCurrentStep(3);
    }
  }, [verifyCode, email]);

  // Step 3: Reset password
  const handleResetPassword = useCallback(async (data: PasswordFormData) => {
    const result = await resetUserPassword(resetToken, data.password);
    if (result.type === 'auth/resetPassword/fulfilled') {
      // Show success and redirect to login
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [resetUserPassword, resetToken, navigate]);

  // Resend code function
  const handleResendCode = useCallback(async () => {
    if (countdown === 0) {
      const result = await sendResetCode(email);
      if (result.type === 'auth/forgotPassword/fulfilled') {
        setCountdown(60);
      }
    }
  }, [sendResetCode, email, countdown]);

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      clearResetError();
    }
  }, [currentStep, clearResetError]);

  // Password strength checker
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

  const passwordStrength = useMemo(() => 
    getPasswordStrength(passwordForm.watch('password')), 
    [passwordForm.watch('password'), getPasswordStrength]
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          className="w-full max-w-md"
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
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 mb-6 mx-auto shadow-xl"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShieldCheckIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
            </motion.div>
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 transition-colors duration-1000 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Reset Password
            </h1>
            <p className={`text-sm sm:text-base lg:text-lg transition-colors duration-1000 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Secure your account in just a few steps
            </p>
          </motion.div>

          {/* Progress Bar */}
          <StepProgressBar currentStep={currentStep} totalSteps={3} />

          {/* Main Form Container */}
          <motion.div
            className={`backdrop-blur-xl rounded-3xl shadow-2xl border p-6 sm:p-8 lg:p-10 transition-all duration-1000 ${
              isDark 
                ? 'bg-gray-800/80 border-gray-700/50 shadow-gray-900/50' 
                : 'bg-white/80 border-gray-200/50 shadow-gray-900/20'
            }`}
            layout
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
                  transition={{ duration: 0.4 }}
                >
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* Step 1: Email Input */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center mb-6">
                    <h2 className={`text-xl font-bold mb-2 transition-colors duration-1000 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Enter Your Email
                    </h2>
                    <p className={`text-sm transition-colors duration-1000 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      We'll send you a reset code to verify your identity
                    </p>
                  </div>

                  <form onSubmit={emailForm.handleSubmit(handleSendResetCode)} className="space-y-6">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 transition-colors duration-1000 ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          {...emailForm.register('email')}
                          type="email"
                          placeholder="Enter your email address"
                          className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm text-sm font-medium ${
                            emailForm.formState.errors.email 
                              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-200/50' 
                              : isDark
                                ? 'border-gray-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 bg-gray-700/50 text-white placeholder-gray-400'
                                : 'border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/50 bg-white/70 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                        <EnvelopeIcon className={`h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-1000 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                      </div>
                      <AnimatePresence>
                        {emailForm.formState.errors.email && (
                          <motion.p
                            className={`mt-2 text-sm font-medium transition-colors duration-1000 ${
                              isDark ? 'text-red-400' : 'text-red-600'
                            }`}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                          >
                            {emailForm.formState.errors.email.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={!emailForm.formState.isValid || isLoading}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-8 rounded-xl font-bold shadow-xl hover:shadow-2xl transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                      whileHover={{ scale: emailForm.formState.isValid && !isLoading ? 1.02 : 1 }}
                      whileTap={{ scale: emailForm.formState.isValid && !isLoading ? 0.98 : 1 }}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                          Sending Code...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          Send Reset Code
                          <ArrowRightIcon className="h-5 w-5 ml-3 transition-transform group-hover:translate-x-1" />
                        </div>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Code Verification */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center mb-6">
                    <h2 className={`text-xl font-bold mb-2 transition-colors duration-1000 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Verify Reset Code
                    </h2>
                    <p className={`text-sm transition-colors duration-1000 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Enter the 6-digit code sent to <span className="font-semibold text-indigo-500">{email}</span>
                    </p>
                  </div>

                  <form onSubmit={codeForm.handleSubmit(handleVerifyCode)} className="space-y-6">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 transition-colors duration-1000 ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Reset Code
                      </label>
                      <div className="relative">
                        <input
                          {...codeForm.register('code')}
                          type="text"
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm text-sm font-medium text-center tracking-widest ${
                            codeForm.formState.errors.code 
                              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-200/50' 
                              : isDark
                                ? 'border-gray-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 bg-gray-700/50 text-white placeholder-gray-400'
                                : 'border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/50 bg-white/70 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                        <ShieldCheckIcon className={`h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-1000 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                      </div>
                      <AnimatePresence>
                        {codeForm.formState.errors.code && (
                          <motion.p
                            className={`mt-2 text-sm font-medium transition-colors duration-1000 ${
                              isDark ? 'text-red-400' : 'text-red-600'
                            }`}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                          >
                            {codeForm.formState.errors.code.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Resend Code */}
                    <div className="text-center">
                      <p className={`text-sm transition-colors duration-1000 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Didn't receive the code?{' '}
                        {countdown > 0 ? (
                          <span className="font-semibold">
                            Resend in {countdown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={isLoading}
                            className={`font-semibold transition-colors duration-300 ${
                              isDark 
                                ? 'text-indigo-400 hover:text-indigo-300' 
                                : 'text-indigo-600 hover:text-indigo-500'
                            } disabled:opacity-50`}
                          >
                            Resend Code
                          </button>
                        )}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        type="button"
                        onClick={goBack}
                        className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all duration-300 ${
                          isDark 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-center">
                          <ArrowLeftIcon className="h-5 w-5 mr-2" />
                          Back
                        </div>
                      </motion.button>

                      <motion.button
                        type="submit"
                        disabled={!codeForm.formState.isValid || isLoading}
                        className="flex-[2] bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-8 rounded-xl font-bold shadow-xl hover:shadow-2xl transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                        whileHover={{ scale: codeForm.formState.isValid && !isLoading ? 1.02 : 1 }}
                        whileTap={{ scale: codeForm.formState.isValid && !isLoading ? 0.98 : 1 }}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                            Verifying...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            Verify Code
                            <ArrowRightIcon className="h-5 w-5 ml-3 transition-transform group-hover:translate-x-1" />
                          </div>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 3: New Password */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center mb-6">
                    <h2 className={`text-xl font-bold mb-2 transition-colors duration-1000 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Create New Password
                    </h2>
                    <p className={`text-sm transition-colors duration-1000 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Choose a strong password to secure your account
                    </p>
                  </div>

                  <form onSubmit={passwordForm.handleSubmit(handleResetPassword)} className="space-y-5">
                    {/* New Password */}
                    <div>
                      <label className={`block text-sm font-semibold mb-2 transition-colors duration-1000 ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          {...passwordForm.register('password')}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm text-sm font-medium ${
                            passwordForm.formState.errors.password 
                              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-200/50' 
                              : isDark
                                ? 'border-gray-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 bg-gray-700/50 text-white placeholder-gray-400'
                                : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 bg-white/70 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                        <LockClosedIcon className={`h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-1000 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <motion.button
                          type="button"
                          onClick={togglePassword}
                          className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                            isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {showPassword ? 
                            <EyeSlashIcon className="h-5 w-5" /> : 
                            <EyeIcon className="h-5 w-5" />
                          }
                        </motion.button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      <AnimatePresence>
                        {passwordForm.watch('password') && (
                          <motion.div
                            className="mt-3"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
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
                        {passwordForm.formState.errors.password && (
                          <motion.p
                            className={`mt-2 text-sm font-medium transition-colors duration-1000 ${
                              isDark ? 'text-red-400' : 'text-red-600'
                            }`}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                          >
                            {passwordForm.formState.errors.password.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className={`block text-sm font-semibold mb-2 transition-colors duration-1000 ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          {...passwordForm.register('confirmPassword')}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm text-sm font-medium ${
                            passwordForm.formState.errors.confirmPassword 
                              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-200/50' 
                              : isDark
                                ? 'border-gray-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 bg-gray-700/50 text-white placeholder-gray-400'
                                : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 bg-white/70 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                        <LockClosedIcon className={`h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-1000 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <motion.button
                          type="button"
                          onClick={toggleConfirmPassword}
                          className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                            isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {showConfirmPassword ? 
                            <EyeSlashIcon className="h-5 w-5" /> : 
                            <EyeIcon className="h-5 w-5" />
                          }
                        </motion.button>
                      </div>
                      <AnimatePresence>
                        {passwordForm.formState.errors.confirmPassword && (
                          <motion.p
                            className={`mt-2 text-sm font-medium transition-colors duration-1000 ${
                              isDark ? 'text-red-400' : 'text-red-600'
                            }`}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                          >
                            {passwordForm.formState.errors.confirmPassword.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <motion.button
                        type="button"
                        onClick={goBack}
                        className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all duration-300 ${
                          isDark 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-center">
                          <ArrowLeftIcon className="h-5 w-5 mr-2" />
                          Back
                        </div>
                      </motion.button>

                      <motion.button
                        type="submit"
                        disabled={!passwordForm.formState.isValid || isLoading}
                        className="flex-[2] bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-8 rounded-xl font-bold shadow-xl hover:shadow-2xl transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                        whileHover={{ scale: passwordForm.formState.isValid && !isLoading ? 1.02 : 1 }}
                        whileTap={{ scale: passwordForm.formState.isValid && !isLoading ? 0.98 : 1 }}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                            Resetting...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            Reset Password
                            <CheckCircleIcon className="h-5 w-5 ml-3 transition-transform group-hover:rotate-12" />
                          </div>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Back to Login */}
          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Link
              to="/login"
              className={`text-sm font-semibold transition-colors duration-300 ${
                isDark 
                  ? 'text-indigo-400 hover:text-indigo-300' 
                  : 'text-indigo-600 hover:text-indigo-500'
              }`}
            >
              ← Back to Login
            </Link>
          </motion.div>

          {/* Footer */}
          <motion.div
            className={`text-center mt-6 text-sm transition-colors duration-1000 ${
              isDark ? 'text-gray-500' : 'text-gray-500'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            © 2025 SkillExchange. Secure password recovery.
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PasswordReset;