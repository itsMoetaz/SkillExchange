import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store/store';
import type { AppDispatch, RootState } from './store/store';
import { setTheme } from './store/slices/themeSlice';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { useAuth } from './hooks/useAuth';
import PasswordReset from './components/PasswordReset';
import ProfileSetup from './components/Profile/ProfileSetup'; 
import Profile from './components/Profile/Profile'; 
import Skills from './pages/Skills'; 


import './App.css';
import { getProfile } from './store/slices/profileSlice';
import { getCurrentUser } from './store/slices/authSlice';
import Landing from './pages/Landing';
import CustomToaster from './components/Common/Toast'; 

const AppContent: React.FC = () => {
  const { theme } = useSelector((state: RootState) => state.theme);
  const { isAuthenticated,  } = useAuth();
  const { profile, profileCompletion } = useSelector((state: RootState) => state.profile);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', theme);
    dispatch(setTheme(theme));
  }, [theme, dispatch]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // If we have a token, fetch the current user data
      dispatch(getCurrentUser())
        .unwrap()
        .then(() => {
          // After we have the user, fetch their profile data
          dispatch(getProfile());
        })
        .catch(error => {
          // If token is invalid, it will be handled by the auth error interceptor
          console.error("Authentication failed:", error);
        });
    }
  }, [dispatch]);

  const needsProfileSetup = () => {
    return isAuthenticated && profile && profileCompletion < 50;
  };
  
  return (
    <Router>
      <div className="App">
        <Routes>
                    <Route path="/" element={<Landing />} />
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
          <Route 
          path="/profile/setup" 
          element={isAuthenticated ? <ProfileSetup /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/skills" 
            element={isAuthenticated ? <Skills /> : <Navigate to="/login" />} 
          />          
          <Route path="/forgot-password" element={<PasswordReset />} />

          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated 
              ? (needsProfileSetup() ? "/profile/setup" : "/dashboard") 
              : "/login"} />} 
          />
          <Route path="/profile" element={
            isAuthenticated ? <Profile /> : <Navigate to="/login" />
          } />
        </Routes>
        <CustomToaster />
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