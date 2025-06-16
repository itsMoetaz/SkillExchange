import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900 p-4">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <motion.div
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <UserCircleIcon className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Welcome back, {user?.name}! 🎉
                </motion.h1>
                <p className="text-gray-600 dark:text-gray-400">Ready to continue your learning journey?</p>
                <Link to="/profile/setup" className="btn btn-primary">
  Complete Your Profile
</Link>
              </div>
            </div>
            <motion.button 
              onClick={logout}
              className="btn btn-outline btn-sm gap-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Welcome Card */}
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* Background Animation */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-16 -right-16 w-32 h-32 bg-white/10 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">🚀 Your Learning Dashboard</h2>
            <p className="text-white/90 mb-6">
              This is your personalized learning hub where you'll track progress, connect with peers, and discover new skills.
            </p>
            
            {/* User Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <h3 className="font-semibold mb-2">👤 Profile</h3>
                <p className="text-sm opacity-90"><strong>Name:</strong> {user?.name}</p>
                <p className="text-sm opacity-90"><strong>Email:</strong> {user?.email}</p>
                <p className="text-sm opacity-90"><strong>Role:</strong> {user?.role}</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <h3 className="font-semibold mb-2">📊 Progress</h3>
                <p className="text-sm opacity-90">Skills learned: <strong>0</strong></p>
                <p className="text-sm opacity-90">Skills taught: <strong>0</strong></p>
                <p className="text-sm opacity-90">Connections: <strong>0</strong></p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <h3 className="font-semibold mb-2">🎯 Goals</h3>
                <p className="text-sm opacity-90">Complete your profile</p>
                <p className="text-sm opacity-90">Find your first skill match</p>
                <p className="text-sm opacity-90">Start learning!</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Coming Soon Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {[
            {
              title: "Skill Matching",
              description: "Find perfect learning partners based on your interests and goals",
              icon: "🎯",
              color: "from-green-400 to-emerald-500"
            },
            {
              title: "Learning Sessions",
              description: "Schedule and manage your skill exchange sessions",
              icon: "📅",
              color: "from-blue-400 to-cyan-500"
            },
            {
              title: "Progress Tracking",
              description: "Monitor your learning journey and celebrate achievements",
              icon: "📈",
              color: "from-purple-400 to-pink-500"
            },
            {
              title: "Community Hub",
              description: "Connect with learners from around the world",
              icon: "🌍",
              color: "from-orange-400 to-yellow-500"
            },
            {
              title: "Skill Verification",
              description: "Get your skills verified by the community",
              icon: "✅",
              color: "from-indigo-400 to-purple-500"
            },
            {
              title: "Achievements",
              description: "Unlock badges and rewards as you learn and teach",
              icon: "🏆",
              color: "from-rose-400 to-pink-500"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {feature.description}
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-500 dark:text-gray-400 inline-block">
                Coming Soon
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer Message */}
        <motion.div
          className="text-center mt-12 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            🚧 We're building something amazing! More features coming very soon...
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;