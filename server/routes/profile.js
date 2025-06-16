const express = require('express');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  addSkill,
  updateSkill,
  deleteSkill,
  getSkillCategories,
  upload
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Profile routes
router.get('/', protect, getProfile);

router.put('/', protect, [
  body('name').optional().isLength({ min: 2, max: 50 }).trim(),
  body('bio').optional().isLength({ max: 500 }).trim(),
  body('location.city').optional().trim(),
  body('location.country').optional().trim(),
  body('contact.phone').optional().trim(),
  body('contact.website').optional().isURL(),
  body('contact.linkedin').optional().isURL(),
  body('contact.github').optional().isURL(),
  body('contact.twitter').optional().isURL(),
], handleValidationErrors, updateProfile);

// Avatar routes
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', protect, deleteAvatar);

// Skill routes
router.post('/skills', protect, [
  body('name').isLength({ min: 1, max: 100 }).trim(),
  body('category').isIn([
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
  ]),
  body('level').isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  body('description').optional().isLength({ max: 500 }).trim(),
  body('yearsOfExperience').optional().isInt({ min: 0, max: 50 }),
], handleValidationErrors, addSkill);

router.put('/skills/:skillId', protect, [
  body('name').optional().isLength({ min: 1, max: 100 }).trim(),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  body('description').optional().isLength({ max: 500 }).trim(),
  body('yearsOfExperience').optional().isInt({ min: 0, max: 50 }),
], handleValidationErrors, updateSkill);

router.delete('/skills/:skillId', protect, deleteSkill);

// Categories route
router.get('/categories', getSkillCategories);

module.exports = router;