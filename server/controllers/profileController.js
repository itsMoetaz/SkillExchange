const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const sharp = require('sharp');
const streamifier = require('streamifier');
require('dotenv').config(); 

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profileCompletion: user.profileCompletionPercentage
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      dateOfBirth,
      location,
      contact,
      preferences
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (location) user.location = { ...user.location, ...location };
    if (contact) user.contact = { ...user.contact, ...contact };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user,
        profileCompletion: user.profileCompletionPercentage
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`skillexchange/avatars/${publicId}`);
    }

    // Process and optimize image
    const processedImage = await sharp(req.file.buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "avatars" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    // Update user avatar
    user.avatar = result.secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: result.secure_url,
        profileCompletion: user.profileCompletionPercentage
      }
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar'
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.user.id;
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
};
// Delete avatar
const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.avatar) {
      // Delete from Cloudinary
      const publicId = user.avatar.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`skillexchange/avatars/${publicId}`);
      
      // Remove from user
      user.avatar = null;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Avatar deleted successfully',
      data: {
        profileCompletion: user.profileCompletionPercentage
      }
    });

  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete avatar'
    });
  }
};

// Add skill
const addSkill = async (req, res) => {
  try {
    const {
      name,
      category,
      level,
      description,
      tags,
      yearsOfExperience,
      certifications,
      isTeaching,
      isLearning
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if skill already exists
    const existingSkill = user.skills.find(skill => 
      skill.name.toLowerCase() === name.toLowerCase() &&
      skill.category === category
    );

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists'
      });
    }

    // Add new skill
    user.skills.push({
      name,
      category,
      level,
      description,
      tags: tags || [],
      yearsOfExperience,
      certifications: certifications || [],
      isTeaching: isTeaching || false,
      isLearning: isLearning || false
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      data: {
        skills: user.skills,
        profileCompletion: user.profileCompletionPercentage
      }
    });

  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add skill'
    });
  }
};

// Update skill
const updateSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const updateData = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const skill = user.skills.id(skillId);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Update skill fields
    Object.keys(updateData).forEach(key => {
      if (skill[key] !== undefined) {
        skill[key] = updateData[key];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: {
        skills: user.skills,
        profileCompletion: user.profileCompletionPercentage
      }
    });

  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update skill'
    });
  }
};

// Delete skill
const deleteSkill = async (req, res) => {
  try {
    const { skillId } = req.params;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const skill = user.skills.id(skillId);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    skill.deleteOne();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skill deleted successfully',
      data: {
        skills: user.skills,
        profileCompletion: user.profileCompletionPercentage
      }
    });

  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete skill'
    });
  }
};

// Get skill categories
const getSkillCategories = async (req, res) => {
  try {
    const categories = [
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
    ];

    res.status(200).json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// Configure multer for avatar upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  addSkill,
  updateSkill,
  deleteSkill,
  getSkillCategories,
  upload,
  deleteAccount
};