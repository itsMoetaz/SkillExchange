import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { getUserById } from '../store/slices/userSlice';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import {
  ArrowLeftIcon,
  StarIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentUser, isLoading, error } = useSelector((state: RootState) => state.users);
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';

  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (userId) {
      dispatch(getUserById(userId));
    }
  }, [dispatch, userId]);

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'advanced': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'expert': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarSolidIcon
          key={i}
          className={`w-5 h-5 ${
            i < fullStars
              ? 'text-yellow-400'
              : isDark ? 'text-gray-600' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <ExclamationTriangleIcon className={`w-16 h-16 mx-auto mb-4 ${
            isDark ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h2 className={`text-2xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Profile Not Found
          </h2>
          <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {error || 'The user profile you\'re looking for doesn\'t exist.'}
          </p>
          <button
            onClick={() => navigate('/skills')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
          >
            Browse Skills
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'
    }`}>
      {/* Header */}
      <div className={`border-b backdrop-blur-xl sticky top-0 z-40 ${
        isDark 
          ? 'bg-gray-900/80 border-gray-700/50' 
          : 'bg-white/80 border-gray-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/skills')}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Skills
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl border p-8 mb-8 ${
            isDark 
              ? 'bg-gray-800/50 border-gray-700/50' 
              : 'bg-white/80 border-gray-200/50'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-shrink-0">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <UserIcon className={`w-12 h-12 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {currentUser.name}
              </h1>

              {currentUser.bio && (
                <p className={`text-lg mb-4 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {currentUser.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 mb-4">
                {currentUser.location && (currentUser.location.city || currentUser.location.country) && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className={`w-5 h-5 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {[currentUser.location.city, currentUser.location.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <CalendarIcon className={`w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Joined {new Date(currentUser.joinedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {currentUser.stats.rating > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {renderStars(currentUser.stats.rating)}
                  </div>
                  <span className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {currentUser.stats.rating.toFixed(1)}
                  </span>
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    ({currentUser.stats.totalReviews} reviews)
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowContactModal(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  Contact
                </div>
              </button>

              {currentUser.contactInfo.email && (
                <a
                  href={`mailto:${currentUser.contactInfo.email}`}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <EnvelopeIcon className="w-5 h-5" />
                  Email
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Sessions', value: currentUser.stats.totalSessions },
            { label: 'Teaching', value: currentUser.teachingSkills.length },
            { label: 'Learning', value: currentUser.learningSkills.length },
            { label: 'Reviews', value: currentUser.stats.totalReviews }
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={`rounded-2xl border p-6 text-center ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white/80 border-gray-200/50'
              }`}
            >
              <div className={`text-2xl font-bold mb-1 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {stat.value}
              </div>
              <div className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Skills Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Teaching Skills */}
          {currentUser.teachingSkills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-3xl border p-6 ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white/80 border-gray-200/50'
              }`}
            >
              <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                <AcademicCapIcon className="w-6 h-6 text-green-500" />
                Teaching ({currentUser.teachingSkills.length})
              </h3>
              <div className="space-y-3">
                {currentUser.teachingSkills.map((skill: any, index: number) => (
                  <SkillItem key={index} skill={skill} isDark={isDark} type="teaching" />
                ))}
              </div>
            </motion.div>
          )}

          {/* Learning Skills */}
          {currentUser.learningSkills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`rounded-3xl border p-6 ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white/80 border-gray-200/50'
              }`}
            >
              <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                <ClockIcon className="w-6 h-6 text-blue-500" />
                Learning ({currentUser.learningSkills.length})
              </h3>
              <div className="space-y-3">
                {currentUser.learningSkills.map((skill: any, index: number) => (
                  <SkillItem key={index} skill={skill} isDark={isDark} type="learning" />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <ContactModal
          user={currentUser}
          isDark={isDark}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
};

// Skill Item Component
const SkillItem: React.FC<{ skill: any; isDark: boolean; type: 'teaching' | 'learning' }> = ({ 
  skill, isDark, type 
}) => {
  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'advanced': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'expert': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className={`p-4 rounded-xl border ${
      isDark ? 'border-gray-700/50 bg-gray-700/30' : 'border-gray-200/50 bg-gray-50/50'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={`font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {skill.name}
        </h4>
        {skill.level && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getLevelColor(skill.level)}`}>
            {skill.level}
          </span>
        )}
      </div>
      
      {skill.description && (
        <p className={`text-sm mb-3 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {skill.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full ${
          isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
        }`}>
          {skill.category}
        </span>
        
        {skill.yearsOfExperience > 0 && (
          <span className={`text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {skill.yearsOfExperience} years exp.
          </span>
        )}
      </div>
    </div>
  );
};

// Contact Modal Component
const ContactModal: React.FC<{
  user: any;
  isDark: boolean;
  onClose: () => void;
}> = ({ user, isDark, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`w-full max-w-md rounded-2xl p-6 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`text-xl font-bold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Contact {user.name}
        </h3>
        
        <div className="space-y-3">
          {user.contactInfo.email && (
            <a
              href={`mailto:${user.contactInfo.email}`}
              className={`block w-full p-3 rounded-xl text-center font-medium transition-colors ${
                isDark 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              Send Email
            </a>
          )}
          
          {user.contactInfo.linkedIn && (
            <a
              href={user.contactInfo.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full p-3 rounded-xl text-center font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              LinkedIn
            </a>
          )}
          
          <button
            onClick={onClose}
            className={`w-full p-3 rounded-xl font-medium transition-colors ${
              isDark 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserProfile;