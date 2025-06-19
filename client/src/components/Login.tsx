import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  SparklesIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';
import type { RootState, AppDispatch } from '../store/store';
import { loginUser, clearError } from '../store/slices/authSlice';
import { showToast } from '../utils/toastHelpers';


interface SerializedError {
  name?: string;
  message?: string;
  stack?: string;
}


// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    // Check for API error format
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    // Check for serialized error format
    if ('name' in error && 'message' in error) {
      return (error as SerializedError).message || 'An error occurred';
    }
  }
  
  return 'An unexpected error occurred';
};

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isLoading,  user } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';

  // Get the intended destination with proper typing
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showToast.error('Please fill in all fields');
      return;
    }

    const loadingToast = showToast.loading('Signing you in...');

    try {
      await dispatch(loginUser(formData)).unwrap();
      showToast.dismiss(loadingToast);
      showToast.success('Welcome back! 🎉');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      showToast.dismiss(loadingToast);
      const errorMessage = getErrorMessage(error);
      showToast.error(errorMessage);
    } 
  };

  const handleDemoLogin = async () => {
    const demoCredentials = {
      email: 'demo@skillexchange.com',
      password: 'demo123'
    };
    
    const loadingToast = showToast.loading('Signing you in...');

    try {
      await dispatch(loginUser(demoCredentials)).unwrap();
      showToast.dismiss(loadingToast);
      showToast.success('Logged in with demo account! 🚀');    
      navigate('/dashboard', { replace: true });
    } catch (error: unknown) {
      showToast.dismiss(loadingToast);
      const errorMessage = getErrorMessage(error);
      showToast.error(errorMessage || 'Demo login failed. Please try again.');
    } 
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-md w-full mx-4">
        {/* Back button */}
        <motion.button
          onClick={() => navigate('/')}
          className={`mb-8 flex items-center gap-2 text-sm font-medium transition-colors ${
            isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
          whileHover={{ x: -4 }}
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Home
        </motion.button>

        <motion.div
          className={`rounded-2xl border backdrop-blur-sm p-8 shadow-2xl ${
            isDark 
              ? 'bg-gray-800/50 border-gray-700/50' 
              : 'bg-white/80 border-gray-200/50'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Welcome Back
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your password"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className={`ml-2 text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className={`text-sm font-medium transition-colors ${
                  isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                }`}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Demo Login */}
          <div className="mt-6">
            <div className={`relative text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className={`absolute inset-0 flex items-center`}>
                <div className={`w-full border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`} />
              </div>
              <div className={`relative px-4 text-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                or
              </div>
            </div>
            
            <motion.button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className={`w-full mt-4 py-3 rounded-xl border font-medium transition-all duration-300 ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
              } disabled:opacity-50`}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
            >
              Try Demo Account
            </motion.button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Don't have an account?{' '}
            </span>
            <Link
              to="/register"
              className={`text-sm font-medium transition-colors ${
                isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
              }`}
            >
              Sign up for free
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;