import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { loginUser, registerUser, logout, clearError, getCurrentUser } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const login = (credentials: { email: string; password: string }) => {
    return dispatch(loginUser(credentials));
  };

  const register = (userData: { name: string; email: string; password: string }) => {
    return dispatch(registerUser(userData));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const fetchCurrentUser = () => {
    return dispatch(getCurrentUser());
  };

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout: logoutUser,
    clearError: clearAuthError,
    getCurrentUser: fetchCurrentUser,
  };
};