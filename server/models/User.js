const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); 

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
    ]
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true
  }],
  yearsOfExperience: {
    type: Number,
    min: 0,
    max: 50
  },
  certifications: [{
    type: String,
    trim: true
  }],
  isTeaching: {
    type: Boolean,
    default: false
  },
  isLearning: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  // Profile Info
  avatar: {
    type: String, // Cloudinary URL
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  
  // Location
  location: {
    city: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    }
  },

  // Contact Info
  contact: {
    phone: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    github: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    }
  },

  // Skills
  skills: [skillSchema],

  // Preferences
  preferences: {
    availableHours: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startTime: String, // "09:00"
      endTime: String,   // "17:00"
    }],
    meetingTypes: [{
      type: String,
      enum: ['online', 'in-person', 'hybrid']
    }],
    languages: [{
      type: String,
      trim: true
    }],
    maxDistance: {
      type: Number, // in kilometers
      default: 50
    },
    sessionDuration: {
      type: Number, // in minutes
      default: 60
    }
  },

  // Stats
  stats: {
    skillsShared: {
      type: Number,
      default: 0
    },
    skillsLearned: {
      type: Number,
      default: 0
    },
    rating: {
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

  // Profile Completion
  profileCompleted: {
    type: Boolean,
    default: false
  },
  profileCompletionSteps: {
    basicInfo: { type: Boolean, default: false },
    skills: { type: Boolean, default: false },
    preferences: { type: Boolean, default: false },
    avatar: { type: Boolean, default: false }
  },

  // Existing fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetCode: String,
  passwordResetExpires: Date,
  passwordResetCodeExpires: Date,
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ 'skills.category': 1 });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ 'skills.level': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for profile completion percentage
userSchema.virtual('profileCompletionPercentage').get(function() {
  const steps = this.profileCompletionSteps;
  const totalSteps = Object.keys(steps).length;
  const completedSteps = Object.values(steps).filter(Boolean).length;
  return Math.round((completedSteps / totalSteps) * 100);
});

// Update profile completion status
userSchema.methods.updateProfileCompletion = function() {
  const steps = this.profileCompletionSteps;
  
  // Check basic info
  steps.basicInfo = !!(this.name && this.bio && this.location.city && this.location.country);
  
  // Check skills
  steps.skills = this.skills.length > 0;
  
  // Check preferences
  steps.preferences = !!(this.preferences.meetingTypes.length > 0 && 
                        this.preferences.languages.length > 0);
  
  // Check avatar
  steps.avatar = !!this.avatar;
  
  // Update overall completion
  this.profileCompleted = Object.values(steps).every(Boolean);
  
  return this.profileCompletionPercentage;
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

// Update profile completion before saving
userSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isModified('bio') || 
      this.isModified('location') || this.isModified('skills') || 
      this.isModified('preferences') || this.isModified('avatar')) {
    this.updateProfileCompletion();
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);