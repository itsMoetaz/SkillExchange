import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store/store';
import {
  searchSkills,
  getTrendingSkills,
  getSkillCategories,
  getPopularSearches,
  clearSkills,
  clearError
} from '../store/slices/skillSlice';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  MapPinIcon,
  UserIcon,
  AcademicCapIcon,
  SparklesIcon,
  XMarkIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const Skills: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const {
    skills,
    userSkills,
    trendingSkills,
    categories,
    totalSkills,
    totalUserSkills,
    currentPage,
    hasMore,
    isSearching,
    isTrendingLoading,
    isCategoriesLoading,
    error
  } = useSelector((state: RootState) => state.skills);
  
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';

  // Local state for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'skills' | 'people'>('skills');
  const [filters, setFilters] = useState({
    category: '',
    level: [] as string[],
    type: 'both' as 'teaching' | 'learning' | 'both',
    location: '',
    rating: 0,
    sortBy: 'relevance' as 'relevance' | 'rating' | 'popularity' | 'recent' | 'experience'
  });

  // Initialize from URL params
  useEffect(() => {
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || '';
    
    setSearchQuery(query);
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    }
  }, [searchParams]);

  // Load initial data
  useEffect(() => {
    dispatch(getTrendingSkills(8));
    dispatch(getSkillCategories());
    dispatch(getPopularSearches());
  }, [dispatch]);

  // Perform initial search when component mounts or URL params change
  useEffect(() => {
    const initialQuery = searchParams.get('query') || '';
    const initialCategory = searchParams.get('category') || '';
    
    if (initialQuery || initialCategory) {
      performSearch({
        query: initialQuery,
        ...filters,
        category: initialCategory,
        page: 1
      });
    }
  }, []);

  // Perform search function
  const performSearch = useCallback((searchFilters: any) => {
    console.log('Performing search with filters:', searchFilters);
    dispatch(clearSkills());
    dispatch(searchSkills(searchFilters));
  }, [dispatch]);

  // Handle search button click
  const handleSearch = useCallback(() => {
    const searchFilters = {
      query: searchQuery.trim(),
      ...filters,
      page: 1
    };
    
    performSearch(searchFilters);
    
    // Update URL
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('query', searchQuery.trim());
    if (filters.category) params.set('category', filters.category);
    setSearchParams(params);
  }, [searchQuery, filters, performSearch, setSearchParams]);

  // Handle Enter key in search input
  const handleSearchKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  // Load more results
  const handleLoadMore = useCallback(() => {
    if (hasMore && !isSearching) {
      const searchFilters = {
        query: searchQuery.trim(),
        ...filters,
        page: currentPage + 1
      };
      dispatch(searchSkills(searchFilters));
    }
  }, [hasMore, isSearching, searchQuery, filters, currentPage, dispatch]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Handle level toggle
  const handleLevelToggle = useCallback((level: string) => {
    setFilters(prev => ({
      ...prev,
      level: prev.level.includes(level)
        ? prev.level.filter(l => l !== level)
        : [...prev.level, level]
    }));
  }, []);

  // Handle trending skill click
  const handleTrendingSkillClick = useCallback((skillName: string) => {
    setSearchQuery(skillName);
    const searchFilters = {
      query: skillName,
      ...filters,
      page: 1
    };
    performSearch(searchFilters);
    
    // Update URL
    const params = new URLSearchParams();
    params.set('query', skillName);
    if (filters.category) params.set('category', filters.category);
    setSearchParams(params);
  }, [filters, performSearch, setSearchParams]);

  // Handle category click
  const handleCategoryClick = useCallback((categoryName: string) => {
    const newFilters = { ...filters, category: categoryName };
    setFilters(newFilters);
    
    const searchFilters = {
      query: searchQuery.trim(),
      ...newFilters,
      page: 1
    };
    performSearch(searchFilters);
    
    // Update URL
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('query', searchQuery.trim());
    params.set('category', categoryName);
    setSearchParams(params);
  }, [filters, searchQuery, performSearch, setSearchParams]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({
      category: '',
      level: [],
      type: 'both',
      location: '',
      rating: 0,
      sortBy: 'relevance'
    });
    setSearchQuery('');
    dispatch(clearSkills());
    
    // Clear URL params
    setSearchParams(new URLSearchParams());
  }, [dispatch, setSearchParams]);

  // Apply filters
  const applyFilters = useCallback(() => {
    const searchFilters = {
      query: searchQuery.trim(),
      ...filters,
      page: 1
    };
    performSearch(searchFilters);
    setShowFilters(false);
  }, [searchQuery, filters, performSearch]);

  // Skill levels
  const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (filters.category) count++;
    if (filters.level.length > 0) count++;
    if (filters.type !== 'both') count++;
    if (filters.location.trim()) count++;
    if (filters.rating > 0) count++;
    return count;
  }, [searchQuery, filters]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Header */}
      <div className={`border-b backdrop-blur-xl sticky top-0 z-40 transition-colors duration-500 ${
        isDark 
          ? 'bg-gray-900/80 border-gray-700/50' 
          : 'bg-white/80 border-gray-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className={`text-sm font-medium transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ← Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <h1 className={`text-xl font-bold transition-colors ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Discover Skills
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  showFilters
                    ? isDark ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
                    : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FunnelIcon className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className={`rounded-2xl border p-6 mb-6 transition-colors duration-500 ${
              isDark 
                ? 'bg-gray-800/50 border-gray-700/50' 
                : 'bg-white/80 border-gray-200/50'
            }`}>
              <div className="relative mb-4">
                <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Search skills or people..."
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 ${
                    isDark 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  } focus:ring-2 focus:ring-purple-500/20 focus:outline-none`}
                />
              </div>
              
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search Skills'}
              </button>
            </div>

            {/* Trending Skills */}
            {!isTrendingLoading && trendingSkills.length > 0 && (
              <div className={`rounded-2xl border p-6 mb-6 transition-colors duration-500 ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white/80 border-gray-200/50'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  <SparklesIcon className="w-5 h-5 text-purple-500" />
                  Trending Skills
                </h3>
                <div className="space-y-2">
                  {trendingSkills.slice(0, 6).map((skill, index) => (
                    <motion.button
                      key={`trending-${skill._id}-${index}`}
                      onClick={() => handleTrendingSkillClick(skill.name)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        isDark 
                          ? 'hover:bg-gray-700/50 text-gray-300' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{skill.name}</span>
                          {skill.trending && (
                            <FireIcon className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-600'
                        }`}>
                          {skill.userCount || 0}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {!isCategoriesLoading && categories.length > 0 && (
              <div className={`rounded-2xl border p-6 transition-colors duration-500 ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white/80 border-gray-200/50'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => handleCategoryClick(category.name)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        filters.category === category.name
                          ? isDark ? 'bg-purple-600/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                          : isDark ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {category.count || 0}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`rounded-2xl border p-6 mb-6 transition-colors duration-500 ${
                    isDark 
                      ? 'bg-gray-800/50 border-gray-700/50' 
                      : 'bg-white/80 border-gray-200/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Advanced Filters
                    </h3>
                    <div className="flex items-center gap-2">
                      {activeFilterCount > 0 && (
                        <button
                          onClick={clearAllFilters}
                          className={`text-sm font-medium transition-colors ${
                            isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Clear All
                        </button>
                      )}
                      <button
                        onClick={() => setShowFilters(false)}
                        className={`p-1 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Skill Level */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Skill Level
                      </label>
                      <div className="space-y-2">
                        {skillLevels.map((level) => (
                          <label key={level} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.level.includes(level)}
                              onChange={() => handleLevelToggle(level)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className={`ml-2 text-sm capitalize ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {level}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Type */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Learning Type
                      </label>
                      <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className={`w-full p-2 rounded-lg border ${
                          isDark
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        <option value="both">Both Teaching & Learning</option>
                        <option value="teaching">Teaching Only</option>
                        <option value="learning">Learning Only</option>
                      </select>
                    </div>

                    {/* Location */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Location
                      </label>
                      <input
                        type="text"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        placeholder="Enter city or country"
                        className={`w-full p-2 rounded-lg border ${
                          isDark
                            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>

                    {/* Minimum Rating */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Minimum Rating
                      </label>
                      <select
                        value={filters.rating}
                        onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                        className={`w-full p-2 rounded-lg border ${
                          isDark
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        <option value={0}>Any Rating</option>
                        <option value={1}>1+ Stars</option>
                        <option value={2}>2+ Stars</option>
                        <option value={3}>3+ Stars</option>
                        <option value={4}>4+ Stars</option>
                        <option value={5}>5 Stars</option>
                      </select>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Sort By
                      </label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className={`w-full p-2 rounded-lg border ${
                          isDark
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        <option value="relevance">Relevance</option>
                        <option value="rating">Highest Rating</option>
                        <option value="popularity">Most Popular</option>
                        <option value="recent">Most Recent</option>
                        <option value="experience">Most Experience</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setShowFilters(false)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={applyFilters}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                    >
                      Apply Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab Navigation */}
            <div className={`flex rounded-xl p-1 mb-6 ${
              isDark ? 'bg-gray-800/50' : 'bg-gray-100'
            }`}>
              <button
                onClick={() => setActiveTab('skills')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'skills'
                    ? isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 shadow-sm'
                    : isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Skills ({totalSkills || 0})
              </button>
              <button
                onClick={() => setActiveTab('people')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'people'
                    ? isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 shadow-sm'
                    : isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                People ({totalUserSkills || 0})
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`rounded-xl p-4 mb-6 ${
                isDark ? 'bg-red-900/20 border border-red-500/20' : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm ${
                  isDark ? 'text-red-400' : 'text-red-600'
                }`}>
                  {error}
                </p>
                <button
                  onClick={() => dispatch(clearError())}
                  className={`text-xs mt-1 underline ${
                    isDark ? 'text-red-300' : 'text-red-500'
                  }`}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Loading State */}
            {isSearching && skills.length === 0 && userSkills.length === 0 ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Searching skills..." />
              </div>
            ) : (
              <>
                {/* Skills Tab */}
                {activeTab === 'skills' && (
                  <div>
                    {skills.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {skills.map((skill, index) => (
                          <SkillCard 
                            key={`skill-${skill._id}-${index}`} 
                            skill={skill} 
                            isDark={isDark} 
                          />
                        ))}
                      </div>
                    ) : !isSearching && (
                      <EmptyState
                        icon={AcademicCapIcon}
                        title="No skills found"
                        description="Try adjusting your search terms or filters"
                        isDark={isDark}
                        activeFilterCount={activeFilterCount}
                        onClearFilters={clearAllFilters}
                      />
                    )}
                  </div>
                )}

                {/* People Tab */}
                {activeTab === 'people' && (
                  <div>
                    {userSkills.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userSkills.map((userSkill, index) => (
                          <UserSkillCard 
                            key={`user-skill-${userSkill._id || userSkill.user?._id}-${index}`} 
                            userSkill={userSkill} 
                            isDark={isDark} 
                          />
                        ))}
                      </div>
                    ) : !isSearching && (
                      <EmptyState
                        icon={UserIcon}
                        title="No people found"
                        description="Try adjusting your search terms or filters"
                        isDark={isDark}
                        activeFilterCount={activeFilterCount}
                        onClearFilters={clearAllFilters}
                      />
                    )}
                  </div>
                )}

                {/* Load More */}
                {hasMore && !isSearching && (skills.length > 0 || userSkills.length > 0) && (
                  <div className="text-center mt-8">
                    <button
                      onClick={handleLoadMore}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                    >
                      Load More Results
                    </button>
                  </div>
                )}

                {/* Loading More */}
                {isSearching && (skills.length > 0 || userSkills.length > 0) && (
                  <div className="text-center mt-8">
                    <LoadingSpinner size="md" text="Loading more results..." />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC<{
  icon: any;
  title: string;
  description: string;
  isDark: boolean;
  activeFilterCount: number;
  onClearFilters: () => void;
}> = ({ icon: Icon, title, description, isDark, activeFilterCount, onClearFilters }) => (
  <div className={`text-center py-12 rounded-2xl ${
    isDark ? 'bg-gray-800/50' : 'bg-white/50'
  }`}>
    <Icon className={`w-16 h-16 mx-auto mb-4 ${
      isDark ? 'text-gray-600' : 'text-gray-400'
    }`} />
    <h3 className={`text-xl font-semibold mb-2 ${
      isDark ? 'text-white' : 'text-gray-900'
    }`}>
      {title}
    </h3>
    <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
      {description}
    </p>
    {activeFilterCount > 0 && (
      <button
        onClick={onClearFilters}
        className="text-purple-500 hover:text-purple-600 font-medium"
      >
        Clear all filters
      </button>
    )}
  </div>
);

// Skill Card Component
const SkillCard: React.FC<{ skill: any; isDark: boolean }> = ({ skill, isDark }) => {
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
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          className={`w-4 h-4 ${
            i < fullStars
              ? 'text-yellow-400 fill-current'
              : i === fullStars && hasHalfStar
              ? 'text-yellow-400 fill-current opacity-50'
              : isDark ? 'text-gray-600' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <motion.div
      className={`rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg ${
        isDark 
          ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/80' 
          : 'bg-white/80 border-gray-200/50 hover:bg-white'
      }`}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold text-lg ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {skill.name || 'Unknown Skill'}
            </h3>
            {skill.trending && (
              <FireIcon className="w-5 h-5 text-orange-500" />
            )}
          </div>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {skill.category || 'Uncategorized'}
          </p>
        </div>
        {skill.availableLevels && skill.availableLevels.length > 0 && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getLevelColor(skill.availableLevels[0])}`}>
            {skill.availableLevels[0]}
          </span>
        )}
      </div>

      {skill.description && (
        <p className={`text-sm mb-4 line-clamp-3 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {skill.description}
        </p>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {skill.rating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {renderStars(skill.rating)}
              </div>
              <span className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                ({skill.rating.toFixed(1)})
              </span>
            </div>
          )}
        </div>
        {skill.userCount > 0 && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-600'
          }`}>
            {skill.userCount} user{skill.userCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {skill.isTeaching && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
            }`}>
              Teaching
            </span>
          )}
          {skill.isLearning && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
            }`}>
              Learning
            </span>
          )}
        </div>
        
        <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300">
          View Details
        </button>
      </div>
    </motion.div>
  );
};

// User Skill Card Component
const UserSkillCard: React.FC<{ userSkill: any; isDark: boolean }> = ({ userSkill, isDark }) => {
  const user = userSkill.user || {};
  const skills = userSkill.skills || [];
  const primarySkill = skills[0] || {};

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
        <StarIcon
          key={i}
          className={`w-4 h-4 ${
            i < fullStars
              ? 'text-yellow-400 fill-current'
              : isDark ? 'text-gray-600' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <motion.div
      className={`rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg ${
        isDark 
          ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/80' 
          : 'bg-white/80 border-gray-200/50 hover:bg-white'
      }`}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'User'}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <UserIcon className={`w-6 h-6 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold mb-1 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {user.name || 'Unknown User'}
          </h3>
          
          {primarySkill.name && (
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-medium ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`}>
                {primarySkill.name}
              </span>
              {primarySkill.level && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getLevelColor(primarySkill.level)}`}>
                  {primarySkill.level}
                </span>
              )}
            </div>
          )}

          {user.location && (user.location.city || user.location.country) && (
            <div className="flex items-center gap-1 mb-2">
              <MapPinIcon className={`w-4 h-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <span className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {[user.location.city, user.location.country].filter(Boolean).join(', ')}
              </span>
            </div>
          )}

          {userSkill.rating > 0 && (
            <div className="flex items-center gap-1 mb-3">
              <div className="flex">
                {renderStars(userSkill.rating)}
              </div>
              <span className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                ({userSkill.rating.toFixed(1)})
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {primarySkill.isTeaching && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                }`}>
                  Teaching
                </span>
              )}
              {primarySkill.isLearning && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                }`}>
                  Learning
                </span>
              )}
              {skills.length > 1 && (
                <span className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  +{skills.length - 1} more
                </span>
              )}
            </div>
            
            <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300">
              View Profile
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Skills;