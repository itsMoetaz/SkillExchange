import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, verifyResetCode, resetPassword, clearError } from '../store/slices/authSlice';
import type { RootState, AppDispatch } from '../store/store';

export const usePasswordReset = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const sendResetCode = useCallback(async (email: string) => {
    return dispatch(forgotPassword(email));
  }, [dispatch]);

  const verifyCode = useCallback(async (email: string, code: string) => {
    return dispatch(verifyResetCode({ email, code }));
  }, [dispatch]);

  const resetUserPassword = useCallback(async (resetToken: string, password: string) => {
    return dispatch(resetPassword({ resetToken, password }));
  }, [dispatch]);

  const clearResetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    sendResetCode,
    verifyCode,
    resetUserPassword,
    clearResetError,
    isLoading,
    error,
  };
};