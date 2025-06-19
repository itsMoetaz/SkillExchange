import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  SparklesIcon, 
  AcademicCapIcon, 
  UserGroupIcon,
  ArrowRightIcon,
  PlayIcon,
  StarIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import type { RootState } from '../store/store';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useSelector((state: RootState) => state.theme);
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const isDark = theme === 'dark';

  const handleGetStarted = () => {
    if (user) {
      navigate('/skills');
    } else {
      navigate('/register');
    }
  };

  const handleExploreSkills = () => {
    navigate('/skills');
  };

  const features = [
    {
      icon: AcademicCapIcon,
      title: "Learn from Experts",
      description: "Connect with skilled professionals and passionate teachers worldwide.",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: UserGroupIcon,
      title: "Teach & Earn",
      description: "Share your expertise, help others grow, and earn money doing what you love.",
      color: "from-green-500 to-blue-500"
    },
    {
      icon: SparklesIcon,
      title: "10,000+ Skills",
      description: "Explore thousands of skills across all categories and difficulty levels.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: GlobeAltIcon,
      title: "Global Community",
      description: "Join learners and teachers from over 190 countries worldwide.",
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: UserGroupIcon },
    { label: "Skills Taught", value: "10K+", icon: SparklesIcon },
    { label: "Sessions Completed", value: "100K+", icon: CheckCircleIcon },
    { label: "Average Rating", value: "4.9★", icon: StarIcon }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Developer",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      content: "I learned React from an amazing teacher here. The 1-on-1 sessions were exactly what I needed to advance my career.",
      rating: 5,
      skill: "React Development"
    },
    {
      name: "Miguel Rodriguez",
      role: "Guitar Teacher",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      content: "Teaching guitar through SkillExchange has been incredible. I've helped over 200 students and earn great income!",
      rating: 5,
      skill: "Guitar Lessons"
    },
    {
      name: "Emily Johnson",
      role: "Marketing Manager",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      content: "The variety of skills available is amazing. I've learned photography, cooking, and even public speaking here.",
      rating: 5,
      skill: "Multiple Skills"
    }
  ];

  const popularSkills = [
    "Programming", "Web Design", "Photography", "Music Production", 
    "Language Learning", "Digital Marketing", "Cooking", "Fitness Training"
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Navigation */}
      <nav className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              SkillExchange
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium"
                whileHover={{ scale: 1.05 }}
              >
                Dashboard
              </motion.button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className={`px-6 py-2 rounded-xl font-medium transition-colors ${
                    isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Sign In
                </button>
                <motion.button
                  onClick={() => navigate('/register')}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  Get Started
                </motion.button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Learn & Teach
              <span className="block bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                Any Skill
              </span>
            </h1>
            
            <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Connect with expert teachers and eager learners in our global skill-sharing community. 
              From coding to cooking, music to marketing.
            </p>
            
            {/* Popular Skills */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {popularSkills.map((skill, index) => (
                <motion.span
                  key={skill}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    isDark ? 'bg-gray-800/50 text-gray-300' : 'bg-white/70 text-gray-700'
                  } backdrop-blur-sm border border-gray-200/20`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center gap-2 shadow-2xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{user ? 'Discover Skills' : 'Start Learning Free'}</span>
                <ArrowRightIcon className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={handleExploreSkills}
                className={`px-8 py-4 rounded-2xl font-semibold text-lg border-2 transition-all duration-300 flex items-center gap-2 ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white backdrop-blur-sm' 
                    : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 bg-white/30 backdrop-blur-sm'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlayIcon className="w-5 h-5" />
                <span>Browse Skills</span>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stat.value}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="mt-32 grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`p-8 rounded-2xl border backdrop-blur-sm ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white/70 border-gray-200/50'
              }`}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`w-12 h-12 mb-6 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {feature.title}
              </h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          className="mt-32"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              What Our Community Says
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Join thousands of learners and teachers worldwide
            </p>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                className={`max-w-4xl mx-auto p-8 rounded-2xl border backdrop-blur-sm ${
                  isDark 
                    ? 'bg-gray-800/50 border-gray-700/50' 
                    : 'bg-white/70 border-gray-200/50'
                }`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <img
                    src={testimonials[activeTestimonial].avatar}
                    alt={testimonials[activeTestimonial].name}
                    className="w-20 h-20 rounded-full mx-auto mb-6 object-cover"
                  />
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className={`text-xl mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    "{testimonials[activeTestimonial].content}"
                  </blockquote>
                  <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {testimonials[activeTestimonial].name}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {testimonials[activeTestimonial].role} • {testimonials[activeTestimonial].skill}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial
                      ? 'bg-purple-500 scale-125'
                      : isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-32 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div className={`p-12 rounded-3xl bg-gradient-to-r from-purple-500 to-blue-500 text-white`}>
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join our community today and unlock your potential
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-white text-purple-600 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                {user ? 'Explore Skills Now' : 'Sign Up Free'}
              </motion.button>
              <motion.button
                onClick={handleExploreSkills}
                className="px-8 py-4 border-2 border-white text-white rounded-2xl font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Browse Skills
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Auto-rotate testimonials */}
      {/* <div className="hidden">
        {setTimeout(() => {
          setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000)}

      </div> */}
    </div>
  );
};

export default Landing;