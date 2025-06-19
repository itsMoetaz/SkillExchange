const express = require('express');
const {
  searchSkills,
  getTrendingSkills,
  getSkillCategories,
  getSearchSuggestions,
  getPopularSearches,
  getSkillById
} = require('../controllers/skillsController');
const { protect } = require('../middleware/auth');
const { query } = require('express-validator');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
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

/**
 * @swagger
 * /api/skills/search:
 *   get:
 *     summary: Search skills and users
 *     tags: [Skills]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Skill category
 *       - in: query
 *         name: level
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [beginner, intermediate, advanced, expert]
 *         description: Skill levels
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [teaching, learning, both]
 *         description: Learning type
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Location filter
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Minimum rating
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [relevance, rating, popularity, recent, experience]
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     skills:
 *                       type: array
 *                     userSkills:
 *                       type: array
 *                     totalSkills:
 *                       type: number
 *                     totalUserSkills:
 *                       type: number
 *                     currentPage:
 *                       type: number
 *                     hasMore:
 *                       type: boolean
 */
router.get('/search', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('rating').optional().isFloat({ min: 0, max: 5 }),
], handleValidationErrors, searchSkills);

/**
 * @swagger
 * /api/skills/trending:
 *   get:
 *     summary: Get trending skills
 *     tags: [Skills]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of trending skills to return
 *     responses:
 *       200:
 *         description: Trending skills
 */
router.get('/trending', [
  query('limit').optional().isInt({ min: 1, max: 50 }),
], handleValidationErrors, getTrendingSkills);

/**
 * @swagger
 * /api/skills/categories:
 *   get:
 *     summary: Get skill categories
 *     tags: [Skills]
 *     responses:
 *       200:
 *         description: Skill categories with stats
 */
router.get('/categories', getSkillCategories);

/**
 * @swagger
 * /api/skills/suggestions:
 *   get:
 *     summary: Get search suggestions
 *     tags: [Skills]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query for suggestions
 *     responses:
 *       200:
 *         description: Search suggestions
 */
router.get('/suggestions', [
  query('q').isLength({ min: 2 }).trim(),
], handleValidationErrors, getSearchSuggestions);

/**
 * @swagger
 * /api/skills/popular-searches:
 *   get:
 *     summary: Get popular searches
 *     tags: [Skills]
 *     responses:
 *       200:
 *         description: Popular search queries
 */
router.get('/popular-searches', getPopularSearches);

/**
 * @swagger
 * /api/skills/{skillId}:
 *   get:
 *     summary: Get skill by ID
 *     tags: [Skills]
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill ID
 *     responses:
 *       200:
 *         description: Skill details
 *       404:
 *         description: Skill not found
 */
router.get('/:skillId', getSkillById);

module.exports = router;