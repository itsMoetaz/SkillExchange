const mongoose = require('mongoose');
const User = require('../models/User');

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Getting user by ID:', userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const user = await User.findById(userId)
      .select('-password -passwordResetToken -passwordResetExpires')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Process user data for frontend
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      skills: user.skills || [],
      interests: user.interests || [],
      preferences: user.preferences || {},
      stats: {
        rating: user.stats?.rating || 0,
        totalReviews: user.stats?.totalReviews || 0,
        totalSessions: user.stats?.totalSessions || 0,
        totalTeaching: user.stats?.totalTeaching || 0,
        totalLearning: user.stats?.totalLearning || 0
      },
      isActive: user.isActive,
      lastSeen: user.lastSeen,
      joinedDate: user.createdAt,
      // Separate skills by type
      teachingSkills: user.skills?.filter(skill => skill.isTeaching) || [],
      learningSkills: user.skills?.filter(skill => skill.isLearning) || [],
      // Contact info (only if user allows it)
      contactInfo: {
        email: user.preferences?.showEmail ? user.email : null,
        linkedIn: user.socialLinks?.linkedIn || null,
        github: user.socialLinks?.github || null,
        portfolio: user.socialLinks?.portfolio || null
      }
    };

    res.status(200).json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

module.exports = {
  getUserById,
  // ... other user controller functions
};