const mongoose = require('mongoose');
const Skill = require('../models/Skill');
const User = require('../models/User');

// Search skills and users
const searchSkills = async (req, res) => {
  try {
    const {
      query = '',
      category = '',
      level = [],
      type = 'both',
      location = '',
      rating = 0,
      sortBy = 'relevance',
      page = 1,
      limit = 12
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;


    // Build search filters for skills
    let skillFilters = { isActive: true };

    // Text search for skills
    if (query.trim()) {
      skillFilters.$or = [
        { name: { $regex: query.trim(), $options: 'i' } },
        { description: { $regex: query.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(query.trim(), 'i')] } },
        { searchKeywords: { $in: [new RegExp(query.trim(), 'i')] } },
        { category: { $regex: query.trim(), $options: 'i' } },
        { subcategory: { $regex: query.trim(), $options: 'i' } }
      ];
    }

    // Category filter for skills
    if (category) {
      skillFilters.category = category;
    }

    // Rating filter for skills (based on average rating)
    if (rating > 0) {
      skillFilters['stats.avgRating'] = { $gte: parseFloat(rating) };
    }

    // Level filter for skills (check if level exists in availableLevels)
    if (Array.isArray(level) && level.length > 0) {
      skillFilters.availableLevels = { $in: level };
    } else if (level && !Array.isArray(level)) {
      skillFilters.availableLevels = { $in: [level] };
    }

    // Type filter for skills (based on teaching/learning users)
    if (type === 'teaching') {
      skillFilters['stats.teachingUsers'] = { $gt: 0 };
    } else if (type === 'learning') {
      skillFilters['stats.learningUsers'] = { $gt: 0 };
    }

    // Build sort options for skills
    let skillSortOptions = {};
    switch (sortBy) {
      case 'rating':
        skillSortOptions = { 'stats.avgRating': -1, 'stats.totalUsers': -1 };
        break;
      case 'popularity':
        skillSortOptions = { 'stats.totalUsers': -1, 'stats.avgRating': -1 };
        break;
      case 'recent':
        skillSortOptions = { createdAt: -1 };
        break;
      case 'experience':
        skillSortOptions = { 'stats.totalSessions': -1, 'stats.avgRating': -1 };
        break;
      default: // relevance
        if (query.trim()) {
          skillSortOptions = { score: { $meta: 'textScore' }, popularityScore: -1 };
          skillFilters.$text = { $search: query.trim() };
        } else {
          skillSortOptions = { popularityScore: -1, 'stats.totalUsers': -1 };
        }
    }


    // Get skills with pagination
    const skillsQuery = Skill.find(skillFilters);
    
    if (skillFilters.$text) {
      skillsQuery.select({ score: { $meta: 'textScore' } });
    }
    
    const skills = await skillsQuery
      .sort(skillSortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalSkills = await Skill.countDocuments(skillFilters);


    // Now search for users with skills matching the criteria
    let userPipeline = [];

    // Start with basic user match
    let userMatchFilters = {};

    // Location filter for users
    if (location.trim()) {
      userMatchFilters.$or = [
        { 'location.city': { $regex: location.trim(), $options: 'i' } },
        { 'location.country': { $regex: location.trim(), $options: 'i' } },
        { 'location.state': { $regex: location.trim(), $options: 'i' } }
      ];
    }

    // Rating filter for users
    if (rating > 0) {
      userMatchFilters['stats.rating'] = { $gte: parseFloat(rating) };
    }

    // Text search in user fields
    if (query.trim()) {
      const queryOr = userMatchFilters.$or || [];
      userMatchFilters.$or = [
        ...queryOr,
        { name: { $regex: query.trim(), $options: 'i' } },
        { bio: { $regex: query.trim(), $options: 'i' } },
        { 'skills.name': { $regex: query.trim(), $options: 'i' } }
      ];
    }

    // Add initial match stage if we have user filters
    if (Object.keys(userMatchFilters).length > 0) {
      userPipeline.push({ $match: userMatchFilters });
    }

    // Unwind skills to filter at skill level
    userPipeline.push({ $unwind: { path: '$skills', preserveNullAndEmptyArrays: false } });

    // Build skill-level filters
    let skillLevelFilters = {};

    // Category filter at skill level
    if (category) {
      skillLevelFilters['skills.category'] = category;
    }

    // Level filter at skill level
    if (Array.isArray(level) && level.length > 0) {
      skillLevelFilters['skills.level'] = { $in: level };
    } else if (level && !Array.isArray(level)) {
      skillLevelFilters['skills.level'] = level;
    }

    // Type filter at skill level
    if (type === 'teaching') {
      skillLevelFilters['skills.isTeaching'] = true;
    } else if (type === 'learning') {
      skillLevelFilters['skills.isLearning'] = true;
    }

    // Skill name search
    if (query.trim()) {
      const skillQueryOr = skillLevelFilters.$or || [];
      skillLevelFilters.$or = [
        ...skillQueryOr,
        { 'skills.name': { $regex: query.trim(), $options: 'i' } },
        { 'skills.description': { $regex: query.trim(), $options: 'i' } }
      ];
    }

    // Add skill-level match if we have filters
    if (Object.keys(skillLevelFilters).length > 0) {
      userPipeline.push({ $match: skillLevelFilters });
    }

    // Group back to get users with their matching skills
    userPipeline.push({
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        email: { $first: '$email' },
        avatar: { $first: '$avatar' },
        location: { $first: '$location' },
        bio: { $first: '$bio' },
        stats: { $first: '$stats' },
        skills: { $push: '$skills' }, // Keep all matching skills
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' }
      }
    });

    // Sort users
    let userSortOptions = {};
    switch (sortBy) {
      case 'rating':
        userSortOptions = { 'stats.rating': -1, 'stats.totalSessions': -1 };
        break;
      case 'popularity':
        userSortOptions = { 'stats.totalSessions': -1, 'stats.rating': -1 };
        break;
      case 'recent':
        userSortOptions = { createdAt: -1 };
        break;
      case 'experience':
        userSortOptions = { 'stats.totalSessions': -1, 'stats.yearsOfExperience': -1 };
        break;
      default:
        userSortOptions = { 'stats.rating': -1, 'stats.totalSessions': -1 };
    }

    userPipeline.push({ $sort: userSortOptions });


    // Get total count before pagination
    const totalUserPipeline = [...userPipeline, { $count: 'total' }];
    const totalUserResult = await User.aggregate(totalUserPipeline);
    const totalUserSkills = totalUserResult[0]?.total || 0;

    // Add pagination to user pipeline
    userPipeline.push(
      { $skip: skip },
      { $limit: limitNum }
    );

    const userSkills = await User.aggregate(userPipeline);


    // Format response
    const response = {
      success: true,
      data: {
        skills: skills.map(skill => ({
          _id: skill._id,
          name: skill.name,
          category: skill.category,
          subcategory: skill.subcategory,
          description: skill.description,
          tags: skill.tags,
          availableLevels: skill.availableLevels,
          userCount: skill.stats?.totalUsers || 0,
          rating: skill.stats?.avgRating || 0,
          isTeaching: (skill.stats?.teachingUsers || 0) > 0,
          isLearning: (skill.stats?.learningUsers || 0) > 0,
          level: skill.availableLevels?.[0] || 'intermediate',
          trending: skill.trending,
          popularityScore: skill.popularityScore,
          createdAt: skill.createdAt
        })),
        userSkills: userSkills.map(user => ({
          _id: user._id,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            location: user.location,
            bio: user.bio
          },
          skills: user.skills,
          rating: user.stats?.rating || 0,
          totalSessions: user.stats?.totalSessions || 0,
          createdAt: user.createdAt
        })),
        totalSkills,
        totalUserSkills,
        currentPage: pageNum,
        hasMore: (pageNum * limitNum) < Math.max(totalSkills, totalUserSkills),
        filters: {
          query: query.trim(),
          category,
          level,
          type,
          location: location.trim(),
          rating: parseFloat(rating) || 0,
          sortBy
        }
      }
    };



    res.status(200).json(response);

  } catch (error) {
    console.error('Search skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search skills',
      error: error.message
    });
  }
};

// Get trending skills - simplified and fixed
const getTrendingSkills = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    const trendingSkills = await Skill.find({
      isActive: true,
      $or: [
        { trending: true },
        { 'stats.totalUsers': { $gte: 1 } }
      ]
    })
    .sort({ 
      trending: -1, 
      popularityScore: -1, 
      'stats.totalUsers': -1,
      'stats.avgRating': -1 
    })
    .limit(limitNum)
    .select('name category description stats trending popularityScore createdAt')
    .lean();


    const formattedSkills = trendingSkills.map(skill => ({
      _id: skill._id,
      name: skill.name,
      category: skill.category,
      description: skill.description,
      userCount: skill.stats?.totalUsers || 0,
      avgRating: skill.stats?.avgRating || 0,
      teacherCount: skill.stats?.teachingUsers || 0,
      learnerCount: skill.stats?.learningUsers || 0,
      trending: skill.trending,
      popularityScore: skill.popularityScore,
      createdAt: skill.createdAt
    }));

    res.status(200).json({
      success: true,
      data: formattedSkills
    });

  } catch (error) {
    console.error('Get trending skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending skills',
      error: error.message
    });
  }
};

// Get skill categories - fixed aggregation
const getSkillCategories = async (req, res) => {
  try {
    const categories = await Skill.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$category',
          name: { $first: '$category' },
          count: { $sum: 1 },
          totalUsers: { $sum: '$stats.totalUsers' },
          teachingUsers: { $sum: '$stats.teachingUsers' },
          learningUsers: { $sum: '$stats.learningUsers' },
          avgRating: { $avg: '$stats.avgRating' },
          skills: { $push: '$name' }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
          totalUsers: 1,
          teachingUsers: 1,
          learningUsers: 1,
          avgRating: { $round: [{ $ifNull: ['$avgRating', 0] }, 1] },
          skills: { $slice: ['$skills', 5] }
        }
      },
      { $sort: { count: -1 } }
    ]);


    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get skill categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skill categories',
      error: error.message
    });
  }
};

// Get search suggestions - improved
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.toString().trim().length < 2) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const queryTerm = q.toString().trim();
    
    const suggestions = await Skill.find({
      isActive: true,
      $or: [
        { name: { $regex: queryTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(queryTerm, 'i')] } },
        { searchKeywords: { $in: [new RegExp(queryTerm, 'i')] } },
        { category: { $regex: queryTerm, $options: 'i' } }
      ]
    })
    .sort({ 'stats.totalUsers': -1, popularityScore: -1 })
    .limit(10)
    .select('name category stats.totalUsers')
    .lean();

    const suggestionsList = suggestions.map(skill => ({
      text: skill.name,
      type: 'skill',
      category: skill.category,
      userCount: skill.stats?.totalUsers || 0
    }));

    res.status(200).json({
      success: true,
      data: suggestionsList
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions',
      error: error.message
    });
  }
};

// Get popular searches - improved
const getPopularSearches = async (req, res) => {
  try {
    const popularSkills = await Skill.find({
      isActive: true,
      'stats.totalUsers': { $gte: 1 }
    })
    .sort({ 'stats.totalUsers': -1, popularityScore: -1 })
    .limit(10)
    .select('name stats.totalUsers')
    .lean();

    const searchesList = popularSkills.map(skill => skill.name);

    res.status(200).json({
      success: true,
      data: searchesList
    });

  } catch (error) {
    console.error('Get popular searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular searches',
      error: error.message
    });
  }
};

// Get skill by ID - simplified
const getSkillById = async (req, res) => {
  try {
    const { skillId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(skillId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID'
      });
    }

    const skill = await Skill.findById(skillId).lean();

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Get users who have this skill
    const usersWithSkill = await User.find({
      'skills.name': skill.name
    })
    .select('name email avatar location stats skills')
    .limit(20)
    .lean();

    const userSkills = usersWithSkill
      .map(user => {
        const userSkill = user.skills?.find(s => s.name === skill.name);
        if (!userSkill) return null;
        
        return {
          _id: user._id,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            location: user.location
          },
          skill: {
            _id: skill._id,
            name: skill.name,
            category: skill.category
          },
          level: userSkill.level || 'intermediate',
          isTeaching: userSkill.isTeaching || false,
          isLearning: userSkill.isLearning || false,
          yearsOfExperience: userSkill.yearsOfExperience || 0,
          rating: user.stats?.rating || 0
        };
      })
      .filter(Boolean);

    res.status(200).json({
      success: true,
      data: {
        skill: {
          ...skill,
          userCount: skill.stats?.totalUsers || 0,
          rating: skill.stats?.avgRating || 0
        },
        userSkills,
        userCount: userSkills.length
      }
    });

  } catch (error) {
    console.error('Get skill by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skill',
      error: error.message
    });
  }
};

module.exports = {
  searchSkills,
  getTrendingSkills,
  getSkillCategories,
  getSearchSuggestions,
  getPopularSearches,
  getSkillById
};