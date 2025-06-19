import React from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Custom toast types
export const showToast = {
  success: (message: string, options?: any) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    });
  },
  
  error: (message: string, options?: any) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      ...options,
    });
  },
  
  warning: (message: string, options?: any) => {
    toast((t) => (
      <CustomToast 
        type="warning" 
        message={message} 
        toast={t}
      />
    ), {
      duration: 4500,
      position: 'top-right',
      ...options,
    });
  },
  
  info: (message: string, options?: any) => {
    toast((t) => (
      <CustomToast 
        type="info" 
        message={message} 
        toast={t}
      />
    ), {
      duration: 4000,
      position: 'top-right',
      ...options,
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  },

  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages, {
      position: 'top-right',
    });
  }
};

// Custom toast component for warning and info
const CustomToast: React.FC<{
  type: 'warning' | 'info';
  message: string;
  toast: any;
}> = ({ type, message, toast: t }) => {
  const config = {
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-gradient-to-r from-amber-50 to-orange-50',
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      textColor: 'text-amber-800'
    },
    info: {
      icon: InformationCircleIcon,
      bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      textColor: 'text-blue-800'
    }
  };

  const { icon: Icon, bgColor, borderColor, iconColor, iconBg, textColor } = config[type];

  return (
    <div
      className={`
        ${t.visible ? 'animate-enter' : 'animate-leave'}
        max-w-md w-full ${bgColor} border ${borderColor} rounded-2xl p-4 shadow-lg backdrop-blur-sm
        transform transition-all duration-300 ease-out
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 p-2 ${iconBg} rounded-xl`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${textColor}`}>
            {message}
          </p>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className={`flex-shrink-0 p-1 rounded-lg transition-colors ${textColor} hover:bg-black/5`}
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Main Toaster component with custom styling
const CustomToaster: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName="toast-container"
      containerStyle={{
        top: 20,
        right: 20,
        zIndex: 9999,
      }}
      toastOptions={{
        // Default options for all toasts
        className: '',
        duration: 4000,
        style: {
          minWidth: '250px',
          maxWidth: '400px',
        },
        
        // Custom styles for different types
        success: {
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            borderRadius: '1rem',
            padding: '1rem',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            backdropFilter: 'blur(8px)',
          },
          iconTheme: {
            primary: '#10b981',
            secondary: '#ecfdf5',
          },
        },
        
        error: {
          duration: 5000,
          style: {
            background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
            color: '#7f1d1d',
            border: '1px solid #fca5a5',
            borderRadius: '1rem',
            padding: '1rem',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            backdropFilter: 'blur(8px)',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fef2f2',
          },
        },
        
        loading: {
          style: {
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            color: '#1e293b',
            border: '1px solid #cbd5e1',
            borderRadius: '1rem',
            padding: '1rem',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            backdropFilter: 'blur(8px)',
          },
          iconTheme: {
            primary: '#6366f1',
            secondary: '#f1f5f9',
          },
        },
      }}
    />
  );
};

export default CustomToaster;