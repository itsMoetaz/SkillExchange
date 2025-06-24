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

    const skip = (page - 1) * limit;
    
    console.log('Search parameters:', { query, category, level, type, page, limit });

    // Build search filters for User skills
    const userFilters = { isActive: true, 'skills.0': { $exists: true } };
    
    const userSkillConditions = [];
    
    if (query) {
      userSkillConditions.push({
        $or: [
          { 'skills.name': { $regex: query, $options: 'i' } },
          { 'skills.description': { $regex: query, $options: 'i' } },
          { 'skills.tags': { $in: [new RegExp(query, 'i')] } },
          { name: { $regex: query, $options: 'i' } },
          { bio: { $regex: query, $options: 'i' } }
        ]
      });
    }

    if (category) {
      userSkillConditions.push({ 'skills.category': category });
    }

    if (level && level.length > 0) {
      userSkillConditions.push({ 'skills.level': { $in: level } });
    }

    if (location) {
      userSkillConditions.push({
        $or: [
          { 'location.city': { $regex: location, $options: 'i' } },
          { 'location.country': { $regex: location, $options: 'i' } }
        ]
      });
    }

    if (rating > 0) {
      userSkillConditions.push({ 'stats.rating': { $gte: rating } });
    }

    if (type === 'teaching') {
      userSkillConditions.push({ 'skills.isTeaching': true });
    } else if (type === 'learning') {
      userSkillConditions.push({ 'skills.isLearning': true });
    }

    if (userSkillConditions.length > 0) {
      Object.assign(userFilters, { $and: userSkillConditions });
    }

    console.log('User filters:', JSON.stringify(userFilters, null, 2));

    let userSkillsQuery = User.find(userFilters);
    
    switch (sortBy) {
      case 'rating':
        userSkillsQuery = userSkillsQuery.sort({ 'stats.rating': -1 });
        break;
      case 'experience':
        userSkillsQuery = userSkillsQuery.sort({ 'skills.yearsOfExperience': -1 });
        break;
      case 'recent':
        userSkillsQuery = userSkillsQuery.sort({ createdAt: -1 });
        break;
      default:
        userSkillsQuery = userSkillsQuery.sort({ 'stats.rating': -1, createdAt: -1 });
    }

    // Don't apply pagination to the initial query - we'll paginate the final results
    const usersWithSkills = await userSkillsQuery
      .select('name email avatar bio location skills stats createdAt')
      .lean();

    console.log(`Found ${usersWithSkills.length} users with skills`);

    // Process user skills - create separate entries for EACH skill
    const userSkills = [];
    
    usersWithSkills.forEach(user => {
      // Get all user's skills
      let allUserSkills = user.skills || [];

      // Filter skills based on search criteria (but keep all that match)
      let filteredSkills = allUserSkills;

      if (query) {
        filteredSkills = filteredSkills.filter(skill => 
          skill.name?.toLowerCase().includes(query.toLowerCase()) ||
          (skill.description && skill.description.toLowerCase().includes(query.toLowerCase())) ||
          (skill.tags && skill.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) ||
          user.name?.toLowerCase().includes(query.toLowerCase()) ||
          (user.bio && user.bio.toLowerCase().includes(query.toLowerCase()))
        );
      }

      if (category) {
        filteredSkills = filteredSkills.filter(skill => skill.category === category);
      }

      if (level && level.length > 0) {
        filteredSkills = filteredSkills.filter(skill => level.includes(skill.level));
      }

      if (type === 'teaching') {
        filteredSkills = filteredSkills.filter(skill => skill.isTeaching);
      } else if (type === 'learning') {
        filteredSkills = filteredSkills.filter(skill => skill.isLearning);
      }

      // Create one entry for EACH skill that matches (not just the first one)
      filteredSkills.forEach((skill, skillIndex) => {
        userSkills.push({
          _id: `${user._id}_${skill._id || skillIndex}`, // Unique ID for each user-skill combination
          type: 'userSkill',
          name: skill.name,
          category: skill.category,
          description: skill.description,
          level: skill.level,
          rating: user.stats?.rating || 0,
          userCount: 1,
          isTeaching: skill.isTeaching,
          isLearning: skill.isLearning,
          trending: false,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
            location: user.location,
            rating: user.stats?.rating || 0,
            totalSessions: user.stats?.totalSessions || 0,
            totalReviews: user.stats?.totalReviews || 0
          },
          primarySkill: skill, // This specific skill
          skills: [skill], // Just this one skill for this entry
          skillCount: 1, // One skill per entry
          allUserSkills: filteredSkills, // All user's skills for context
          totalUserSkills: filteredSkills.length,
          createdAt: user.createdAt
        });
      });
    });

    console.log(`Processed ${userSkills.length} user skills (showing each skill separately)`);

    // Apply pagination to the final results
    const paginatedUserSkills = userSkills.slice(skip, skip + limit);

    // Get total counts for pagination
    const totalUserSkills = userSkills.length;

    res.status(200).json({
      success: true,
      data: {
        skills: [], // Empty since we're not returning Skills collection items
        userSkills: paginatedUserSkills,
        pagination: {
          currentPage: parseInt(page),
          totalSkills: 0, // No skills from Skills collection
          totalUserSkills,
          totalPages: Math.ceil(totalUserSkills / limit),
          hasMore: skip + limit < totalUserSkills
        }
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search skills',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
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
    console.log('Getting skill by ID:', skillId);

    if (!mongoose.Types.ObjectId.isValid(skillId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID'
      });
    }

    // First, try to find in Skill collection
    const skill = await Skill.findById(skillId).lean();

    if (skill) {
      // Handle Skill collection item
      const usersWithSkill = await User.find({
        'skills.name': skill.name,
        isActive: true
      })
      .select('name email avatar bio location skills stats createdAt')
      .lean();

      const skillData = {
        _id: skill._id,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        subcategory: skill.subcategory,
        difficulty: skill.availableLevels?.[0] || 'intermediate',
        prerequisites: skill.prerequisites || [],
        tags: skill.tags || [],
        rating: skill.stats?.avgRating || 0,
        reviewCount: skill.stats?.totalReviews || 0,
        userCount: skill.stats?.totalUsers || usersWithSkill.length,
        trending: skill.trending || false,
        learningPaths: skill.learningPaths || [],
        estimatedTime: skill.estimatedTime || null,
        availableLevels: skill.availableLevels || ['intermediate'],
        type: 'skill',
        users: usersWithSkill.map(user => {
          const userSkill = user.skills.find(s => s.name === skill.name);
          
          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
            location: user.location,
            rating: user.stats?.rating || 0,
            reviewCount: user.stats?.totalReviews || 0,
            level: userSkill?.level || 'intermediate',
            yearsOfExperience: userSkill?.yearsOfExperience || 0,
            isTeaching: userSkill?.isTeaching || false,
            isLearning: userSkill?.isLearning || false,
            availability: userSkill?.availability || null,
            hourlyRate: userSkill?.hourlyRate || null,
            responseTime: '< 2 hours',
            completedSessions: user.stats?.totalSessions || 0
          };
        }),
        relatedSkills: []
      };

      // Get related skills
      const relatedSkills = await Skill.find({
        category: skill.category,
        _id: { $ne: skill._id },
        isActive: true
      }).limit(4).select('_id name category stats').lean();

      skillData.relatedSkills = relatedSkills.map(related => ({
        _id: related._id,
        name: related.name,
        category: related.category,
        userCount: related.stats?.totalUsers || 0,
        rating: related.stats?.avgRating || 0
      }));

      return res.status(200).json({
        success: true,
        data: skillData
      });
    }

    // If not found in Skill collection, try to find user with this skill ID
    const userWithSkill = await User.findOne({
      'skills._id': skillId,
      isActive: true
    })
    .select('name email avatar bio location skills stats createdAt')
    .lean();

    if (!userWithSkill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Find the specific skill
    const targetSkill = userWithSkill.skills.find(skill => skill._id.toString() === skillId);

    if (!targetSkill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Find other users with the same skill name
    const otherUsersWithSkill = await User.find({
      'skills.name': targetSkill.name,
      _id: { $ne: userWithSkill._id },
      isActive: true
    })
    .select('name email avatar bio location skills stats createdAt')
    .lean();

    const allUsersWithSkill = [userWithSkill, ...otherUsersWithSkill];

    const skillData = {
      _id: targetSkill._id,
      name: targetSkill.name,
      description: targetSkill.description || `Learn ${targetSkill.name} from experienced users.`,
      category: targetSkill.category,
      subcategory: null,
      difficulty: targetSkill.level || 'intermediate',
      prerequisites: targetSkill.prerequisites || [],
      tags: targetSkill.tags || [],
      rating: userWithSkill.stats?.rating || 0,
      reviewCount: userWithSkill.stats?.totalReviews || 0,
      userCount: allUsersWithSkill.length,
      trending: false,
      learningPaths: [],
      estimatedTime: null,
      availableLevels: [targetSkill.level],
      type: 'userSkill',
      originalUser: {
        _id: userWithSkill._id,
        name: userWithSkill.name,
        email: userWithSkill.email,
        avatar: userWithSkill.avatar,
        bio: userWithSkill.bio,
        location: userWithSkill.location
      },
      users: allUsersWithSkill.map(user => {
        const userSkill = user.skills.find(s => 
          s.name.toLowerCase() === targetSkill.name.toLowerCase()
        ) || targetSkill;

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          location: user.location,
          rating: user.stats?.rating || 0,
          reviewCount: user.stats?.totalReviews || 0,
          level: userSkill.level || 'intermediate',
          yearsOfExperience: userSkill.yearsOfExperience || 0,
          isTeaching: userSkill.isTeaching || false,
          isLearning: userSkill.isLearning || false,
          availability: userSkill.availability || null,
          hourlyRate: userSkill.hourlyRate || null,
          responseTime: '< 2 hours',
          completedSessions: user.stats?.totalSessions || 0
        };
      }),
      relatedSkills: []
    };

    // Get related skills from same category
    const relatedUserSkills = await User.find({
      'skills.category': targetSkill.category,
      'skills.name': { $ne: targetSkill.name },
      isActive: true
    })
    .select('skills')
    .limit(10)
    .lean();

    const relatedSkillsMap = new Map();
    relatedUserSkills.forEach(user => {
      user.skills.forEach(skill => {
        if (skill.category === targetSkill.category && 
            skill.name !== targetSkill.name) {
          const key = skill.name;
          if (!relatedSkillsMap.has(key)) {
            relatedSkillsMap.set(key, {
              _id: skill._id,
              name: skill.name,
              category: skill.category,
              userCount: 1,
              rating: 0
            });
          } else {
            const existing = relatedSkillsMap.get(key);
            existing.userCount += 1;
          }
        }
      });
    });

    skillData.relatedSkills = Array.from(relatedSkillsMap.values()).slice(0, 4);

    res.status(200).json({
      success: true,
      data: skillData
    });

  } catch (error) {
    console.error('Error in getSkillById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skill details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
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