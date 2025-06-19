import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { SparklesIcon } from '@heroicons/react/24/outline';
import type { RootState } from '../../store/store';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  fullScreen = false,
  className = ''
}) => {
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {/* Animated Logo Spinner */}
      <motion.div
        className={`relative ${sizeClasses[size]}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className={`${sizeClasses[size]} bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center`}>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <SparklesIcon className={`${
              size === 'sm' ? 'w-3 h-3' :
              size === 'md' ? 'w-5 h-5' :
              size === 'lg' ? 'w-7 h-7' :
              'w-10 h-10'
            } text-white`} />
          </motion.div>
        </div>
        
        {/* Outer Ring */}
        <motion.div
          className={`absolute inset-0 border-2 border-transparent border-t-purple-500 rounded-xl ${sizeClasses[size]}`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>

      {/* Loading Text */}
      {text && (
        <motion.p
          className={`font-medium ${textSizeClasses[size]} ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {text}
        </motion.p>
      )}

      {/* Loading Dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full ${
              isDark ? 'bg-gray-600' : 'bg-gray-400'
            }`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ${
        isDark 
          ? 'bg-gray-900/80' 
          : 'bg-white/80'
      }`}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;

// Alternative simple spinner for inline use
export const SimpleSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`inline-block w-5 h-5 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin ${className}`} />
);

// Skeleton loader for content placeholders
export const SkeletonLoader: React.FC<{ 
  lines?: number; 
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'button';
}> = ({ 
  lines = 3, 
  className = '',
  variant = 'text'
}) => {
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';

  const baseClass = `animate-pulse ${
    isDark ? 'bg-gray-700' : 'bg-gray-200'
  }`;

  if (variant === 'avatar') {
    return <div className={`${baseClass} rounded-full w-10 h-10 ${className}`} />;
  }

  if (variant === 'button') {
    return <div className={`${baseClass} rounded-lg h-10 w-24 ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`${baseClass} rounded-xl h-48 w-full ${className}`}>
        <div className="p-4 space-y-3">
          <div className={`h-4 ${baseClass} rounded w-3/4`} />
          <div className={`h-4 ${baseClass} rounded w-1/2`} />
          <div className={`h-4 ${baseClass} rounded w-2/3`} />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 ${baseClass} rounded ${
            index === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};