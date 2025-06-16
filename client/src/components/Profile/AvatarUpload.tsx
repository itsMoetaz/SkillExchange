import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { UserCircleIcon, CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AvatarUploadProps {
  avatarUrl?: string;
  onUpload: (file: File) => void;
  onDelete: () => void;
  loading?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  avatarUrl, 
  onUpload, 
  onDelete, 
  loading = false 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(avatarUrl);
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDark = theme === 'dark';
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create preview URL
    const tempUrl = URL.createObjectURL(file);
    setPreviewUrl(tempUrl);
    
    // Call parent upload handler
    onUpload(file);
  };

  const handleDeleteClick = () => {
    setPreviewUrl(undefined);
    onDelete();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div 
        className="relative group"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        {/* Avatar Image or Placeholder */}
        <div className={`w-32 h-32 rounded-full overflow-hidden border-4 transition-all duration-500 ${
          isDark 
            ? 'border-gray-700 shadow-lg shadow-purple-900/20'
            : 'border-gray-100 shadow-lg shadow-purple-300/30'
        }`}>
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <UserCircleIcon className={`w-20 h-20 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`} />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <motion.button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className={`absolute bottom-0 right-0 p-2 rounded-full shadow-lg transition-all duration-300 ${
            isDark 
              ? 'bg-purple-600 text-white hover:bg-purple-500' 
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <CameraIcon className="w-5 h-5" />
          )}
        </motion.button>

        {/* Delete Button (only show if there's an avatar) */}
        {previewUrl && (
          <motion.button
            type="button"
            onClick={handleDeleteClick}
            disabled={loading}
            className={`absolute top-0 right-0 p-1 rounded-full transition-all duration-300 ${
              isDark 
                ? 'bg-red-600 text-white hover:bg-red-500' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <XMarkIcon className="w-4 h-4" />
          </motion.button>
        )}
      </motion.div>

      {/* Tips */}
      <p className={`mt-3 text-xs transition-colors duration-500 ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      }`}>
        Click to upload your photo
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={loading}
      />
    </div>
  );
};

export default AvatarUpload;