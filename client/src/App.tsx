import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store/store';
import type { RootState } from './store/store';
import { setTheme } from './store/slices/themeSlice';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ThemeToggle from './components/ThemeToggle';
import { useAuth } from './hooks/useAuth';
import PasswordReset from './components/PasswordReset';

import './App.css';

const AppContent: React.FC = () => {
  const { theme } = useSelector((state: RootState) => state.theme);
  const { isAuthenticated, getCurrentUser } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', theme);
    dispatch(setTheme(theme));
  }, [theme, dispatch]);

  useEffect(() => {
    // Check for existing user session
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      getCurrentUser();
    }
  }, [getCurrentUser, isAuthenticated]);

  return (
    <Router>
      <div className="App">
        <ThemeToggle />
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route path="/forgot-password" element={<PasswordReset />} />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;