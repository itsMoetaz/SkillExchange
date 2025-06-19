const mongoose = require('mongoose');
const Skill = require('../models/Skill');
require('dotenv').config();

const skillsData = [
  // Programming & Development
  {
    name: 'JavaScript',
    description: 'Popular programming language for web development, both frontend and backend.',
    category: 'Programming & Development',
    subcategory: 'Web Development',
    tags: ['programming', 'web', 'frontend', 'backend', 'nodejs', 'react', 'vue'],
    trending: true,
    popularityScore: 95,
    availableLevels: ['beginner', 'intermediate', 'advanced', 'expert'],
    searchKeywords: ['js', 'javascript', 'programming', 'web development'],
    stats: {
      totalUsers: 1245,
      teachingUsers: 234,
      learningUsers: 1011,
      avgRating: 4.5,
      totalSessions: 5420,
      totalReviews: 892
    }
  },
  {
    name: 'Python',
    description: 'Versatile programming language great for beginners and experts alike.',
    category: 'Programming & Development',
    subcategory: 'Data Science',
    tags: ['programming', 'data science', 'machine learning', 'web', 'automation'],
    trending: true,
    popularityScore: 92,
    availableLevels: ['beginner', 'intermediate', 'advanced', 'expert'],
    searchKeywords: ['python', 'programming', 'data science', 'ml'],
    stats: {
      totalUsers: 1156,
      teachingUsers: 198,
      learningUsers: 958,
      avgRating: 4.6,
      totalSessions: 4890,
      totalReviews: 756
    }
  },
  {
    name: 'React',
    description: 'Popular JavaScript library for building user interfaces.',
    category: 'Programming & Development',
    subcategory: 'Web Development',
    tags: ['react', 'javascript', 'frontend', 'ui', 'components'],
    trending: true,
    popularityScore: 89,
    availableLevels: ['beginner', 'intermediate', 'advanced', 'expert'],
    searchKeywords: ['react', 'reactjs', 'frontend', 'javascript'],
    stats: {
      totalUsers: 987,
      teachingUsers: 156,
      learningUsers: 831,
      avgRating: 4.4,
      totalSessions: 3210,
      totalReviews: 543
    }
  },

  // Design & Creative
  {
    name: 'Figma',
    description: 'Collaborative design tool for creating user interfaces and prototypes.',
    category: 'Design & Creative',
    subcategory: 'UI/UX Design',
    tags: ['design', 'ui', 'ux', 'prototyping', 'collaboration'],
    trending: true,
    popularityScore: 87,
    availableLevels: ['beginner', 'intermediate', 'advanced'],
    searchKeywords: ['figma', 'design', 'ui', 'ux', 'prototype'],
    stats: {
      totalUsers: 756,
      teachingUsers: 123,
      learningUsers: 633,
      avgRating: 4.7,
      totalSessions: 2340,
      totalReviews: 421
    }
  },

  // Languages
  {
    name: 'English',
    description: 'Global language for communication, business, and education.',
    category: 'Languages',
    subcategory: 'English',
    tags: ['language', 'communication', 'business', 'conversation'],
    trending: false,
    popularityScore: 85,
    availableLevels: ['beginner', 'intermediate', 'advanced', 'expert'],
    searchKeywords: ['english', 'language', 'communication', 'speaking'],
    stats: {
      totalUsers: 1456,
      teachingUsers: 345,
      learningUsers: 1111,
      avgRating: 4.3,
      totalSessions: 6780,
      totalReviews: 1234
    }
  },

  // Add more skills as needed...
];

const seedSkills = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillexchange');
    console.log('Connected to MongoDB');

    // Clear existing skills
    await Skill.deleteMany({});
    console.log('Cleared existing skills');

    // Insert new skills
    const skills = await Skill.insertMany(skillsData);
    console.log(`Seeded ${skills.length} skills`);

    console.log('Skill seeding completed successfully');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding skills:', error);
    process.exit(1);
  }
};

// Run the seeding
seedSkills();