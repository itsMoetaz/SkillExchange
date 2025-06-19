import { toast, type Renderable } from 'react-hot-toast';

export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  style?: React.CSSProperties;
  className?: string;
  icon?: string;
  iconTheme?: {
    primary: string;
    secondary: string;
  };
}

export interface PromiseMessages {
  loading: string;
  success: string;
  error: string;
}

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    });
  },
  
  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      duration: 5000,
      position: 'top-right',
      ...options,
    });
  },
  
  warning: (message: string, options?: ToastOptions) => {
    return toast(message, {
      duration: 4500,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        color: '#92400e',
        border: '1px solid #f59e0b',
        borderRadius: '1rem',
        padding: '1rem',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      ...options,
    });
  },
  
  info: (message: string, options?: ToastOptions) => {
    return toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        color: '#1e40af',
        border: '1px solid #3b82f6',
        borderRadius: '1rem',
        padding: '1rem',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      ...options,
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        color: '#1e293b',
        border: '1px solid #cbd5e1',
        borderRadius: '1rem',
        padding: '1rem',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      ...options,
    });
  },

  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  dismissAll: () => {
    toast.dismiss();
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: PromiseMessages,
    options?: ToastOptions
  ): Promise<T> => {
    return toast.promise(promise, messages, {
      position: 'top-right',
      style: {
        borderRadius: '1rem',
        padding: '1rem',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      ...options,
    });
  },

  // Custom toast with custom JSX content
  custom: (content: Renderable, options?: ToastOptions) => {
    return toast.custom(content, {
      position: 'top-right',
      duration: 4000,
      ...options,
    });
  }
};