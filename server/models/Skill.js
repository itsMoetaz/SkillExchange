const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true // For search performance
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Programming & Development',
      'Design & Creative',
      'Business & Marketing',
      'Data & Analytics',
      'Languages',
      'Music & Arts',
      'Sports & Fitness',
      'Cooking & Lifestyle',
      'Academic & Education',
      'Crafts & DIY',
      'Other'
    ],
    index: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Statistics
  stats: {
    totalUsers: {
      type: Number,
      default: 0
    },
    teachingUsers: {
      type: Number,
      default: 0
    },
    learningUsers: {
      type: Number,
      default: 0
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalSessions: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  
  // Trending and popularity
  trending: {
    type: Boolean,
    default: false
  },
  popularityScore: {
    type: Number,
    default: 0
  },
  
  // Difficulty levels available
  availableLevels: [{
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  }],
  
  // SEO and search
  searchKeywords: [{
    type: String,
    lowercase: true
  }],
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better search performance
skillSchema.index({ name: 'text', description: 'text', tags: 'text' });
skillSchema.index({ category: 1, subcategory: 1 });
skillSchema.index({ 'stats.totalUsers': -1 });
skillSchema.index({ 'stats.avgRating': -1 });
skillSchema.index({ popularityScore: -1 });
skillSchema.index({ trending: -1, createdAt: -1 });

// Virtual for user count (for backward compatibility)
skillSchema.virtual('userCount').get(function() {
  return this.stats.totalUsers;
});

skillSchema.virtual('teachingCount').get(function() {
  return this.stats.teachingUsers;
});

skillSchema.virtual('learningCount').get(function() {
  return this.stats.learningUsers;
});

// Method to update statistics
skillSchema.methods.updateStats = async function() {
  const User = mongoose.model('User');
  
  // Count users with this skill
  const users = await User.find({ 'skills.name': this.name });
  
  const stats = {
    totalUsers: users.length,
    teachingUsers: users.filter(user => 
      user.skills.some(skill => skill.name === this.name && skill.isTeaching)
    ).length,
    learningUsers: users.filter(user => 
      user.skills.some(skill => skill.name === this.name && skill.isLearning)
    ).length
  };
  
  // Calculate average rating
  const ratings = users.flatMap(user => 
    user.skills
      .filter(skill => skill.name === this.name)
      .map(skill => user.stats.rating)
      .filter(rating => rating > 0)
  );
  
  if (ratings.length > 0) {
    stats.avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }
  
  this.stats = { ...this.stats, ...stats };
  return this.save();
};

module.exports = mongoose.model('Skill', skillSchema);