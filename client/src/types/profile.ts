export interface Skill {
  _id?: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description?: string;
  tags: string[];
  yearsOfExperience?: number;
  certifications: string[];
  isTeaching: boolean;
  isLearning: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Location {
  city?: string;
  country?: string;
}

export interface Contact {
  phone?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
}

export interface AvailableHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
}

export interface Preferences {
  availableHours: AvailableHours[];
  meetingTypes: ('online' | 'in-person' | 'hybrid')[];
  languages: string[];
  maxDistance: number; // in kilometers
  sessionDuration: number; // in minutes
}

export interface Stats {
  skillsShared: number;
  skillsLearned: number;
  rating: number;
  totalSessions: number;
  totalReviews: number;
}

export interface ProfileCompletionSteps {
  basicInfo: boolean;
  skills: boolean;
  preferences: boolean;
  avatar: boolean;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: string;
  location: Location;
  contact: Contact;
  skills: Skill[];
  preferences: Preferences;
  stats: Stats;
  profileCompleted: boolean;
  profileCompletionSteps: ProfileCompletionSteps;
  profileCompletionPercentage: number;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface ProfileUpdateData {
  name?: string;
  bio?: string;
  dateOfBirth?: string;
  location?: Partial<Location>;
  contact?: Partial<Contact>;
  preferences?: Partial<Preferences>;
}

export interface SkillFormData {
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description?: string;
  tags: string[];
  yearsOfExperience?: number;
  certifications: string[];
  isTeaching: boolean;
  isLearning: boolean;
}

export const SKILL_CATEGORIES = [
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
] as const;

export const SKILL_LEVELS = [
  'beginner',
  'intermediate', 
  'advanced',
  'expert'
] as const;

export const MEETING_TYPES = [
  'online',
  'in-person',
  'hybrid'
] as const;

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const;