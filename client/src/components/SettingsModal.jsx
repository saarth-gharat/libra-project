import { useState, useEffect } from 'react';
import { X, Camera, User, Shield, Bell, Palette, Sun, Moon, Monitor, Lock, Eye, EyeOff, Check, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function SettingsModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { dark: theme, toggle, setTheme } = useTheme();
  const toggleTheme = toggle;
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Theme customization state
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [accentColor, setAccentColor] = useState('blue');
  const [compactSidebar, setCompactSidebar] = useState(false);
  const [showAnimations, setShowAnimations] = useState(true);
  const [enableBlur, setEnableBlur] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  
  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    smsNotifications: false,
    dueDateReminders: true,
    overdueAlerts: true,
    newBookAnnouncements: true
  });
  const [savingNotifications, setSavingNotifications] = useState(false);
  
  // Sync with theme context and load saved preferences
  useEffect(() => {
    if (isOpen) {
      // Load saved preferences first
      const savedPrefs = localStorage.getItem('themePreferences');
      let savedTheme = null;
      if (savedPrefs) {
        try {
          const prefs = JSON.parse(savedPrefs);
          savedTheme = prefs.theme;
          setAccentColor(prefs.accentColor || 'blue');
          setCompactSidebar(prefs.compactSidebar || false);
          setShowAnimations(prefs.showAnimations !== undefined ? prefs.showAnimations : true);
          setEnableBlur(prefs.enableBlur || false);
        } catch (e) {
          console.error('Error parsing theme preferences:', e);
        }
      }
      
      // Determine which theme to show in the modal
      // If saved theme is 'system', detect current system preference
      if (savedTheme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setSelectedTheme(systemPrefersDark ? 'dark' : 'light');
      } else if (savedTheme === 'dark' || savedTheme === 'light') {
        setSelectedTheme(savedTheme);
      } else {
        // Fallback to current theme context
        const currentTheme = theme ? 'dark' : 'light';
        setSelectedTheme(currentTheme);
      }
    }
  }, [isOpen, theme]);
  
  // Save preferences
  const savePreferences = (themeToSave = selectedTheme) => {
    const preferences = {
      theme: themeToSave,
      accentColor,
      compactSidebar,
      showAnimations,
      enableBlur
    };
    localStorage.setItem('themePreferences', JSON.stringify(preferences));
  };
  
  // Handle theme change
  const handleThemeChange = (newTheme) => {
    setSelectedTheme(newTheme);
    
    if (newTheme === 'system') {
      // For system mode, detect system preference and apply it
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemPrefersDark);
    } else {
      // For light/dark modes, set directly
      setTheme(newTheme === 'dark');
    }
    
    // Pass the newTheme to save correctly
    savePreferences(newTheme);
  };
  
  // Handle accent color change
  const handleAccentColorChange = (color) => {
    setAccentColor(color);
    document.documentElement.style.setProperty('--accent-color', `var(--${color}-500)`);
    savePreferences();
  };
  
  // Handle display option changes
  const handleDisplayOptionChange = (option, value) => {
    switch(option) {
      case 'compactSidebar':
        setCompactSidebar(value);
        break;
      case 'showAnimations':
        setShowAnimations(value);
        document.documentElement.style.setProperty('--animations-enabled', value ? '1' : '0');
        break;
      case 'enableBlur':
        setEnableBlur(value);
        document.documentElement.style.setProperty('--blur-enabled', value ? 'blur(12px)' : 'none');
        break;
    }
    savePreferences();
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      setPasswordMessage({ type: 'success', text: response.data.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationChange = (key) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveNotificationPreferences = async () => {
    setSavingNotifications(true);
    try {
      localStorage.setItem('notificationPreferences', JSON.stringify(notificationPrefs));
      // Show success feedback
      setTimeout(() => {
        setSavingNotifications(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      setSavingNotifications(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size should be less than 5MB');
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update user context with new avatar
      // This would require updating the AuthContext to handle avatar updates
      setAvatarPreview(response.data.avatar_url);
      setAvatarFile(null);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
          >
            <div className="flex">
              {/* Sidebar */}
              <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h2>
                </div>
                
                <div className="p-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {tabs.find(t => t.id === activeTab)?.label}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Manage your {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} settings
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Picture</h4>
                        
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            <img
                              src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=ffffff&size=128`}
                              alt="Profile"
                              className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                            />
                            <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                              <Camera size={16} className="text-white" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                          
                          <div>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                              Upload a new profile picture
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                              JPG, PNG or GIF. Max size 5MB
                            </p>
                            {avatarFile && (
                              <button
                                onClick={uploadAvatar}
                                disabled={uploading}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                              >
                                {uploading ? 'Uploading...' : 'Upload Picture'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Name
                            </label>
                            <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                              {user?.name}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Email
                            </label>
                            <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                              {user?.email}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Role
                            </label>
                            <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white capitalize">
                              {user?.role}
                            </p>
                          </div>
                          {user?.student_id && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Student ID
                              </label>
                              <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                                {user.student_id}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'appearance' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Theme</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Customize the appearance of the application
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div 
                            className={`bg-white dark:bg-gray-700 rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${selectedTheme === 'light' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'}`}
                            onClick={() => handleThemeChange('light')}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <Sun className="w-4 h-4 text-blue-500" />
                              <span className="font-medium text-gray-900 dark:text-white">Light</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Bright and clean interface</div>
                          </div>
                                                      
                          <div 
                            className={`bg-gray-800 rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${selectedTheme === 'dark' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-600 hover:border-blue-400'}`}
                            onClick={() => handleThemeChange('dark')}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <Moon className="w-4 h-4 text-purple-400" />
                              <span className="font-medium text-white">Dark</span>
                            </div>
                            <div className="text-xs text-gray-400">Easy on the eyes at night</div>
                          </div>
                                                      
                          <div 
                            className={`bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${selectedTheme === 'system' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'}`}
                            onClick={() => handleThemeChange('system')}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <Monitor className="w-4 h-4 text-indigo-500" />
                              <span className="font-medium text-gray-900 dark:text-white">Auto</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Follows system preference</div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Accent Color
                            </label>
                            <div className="flex gap-2">
                              {[
                                { name: 'blue', color: 'bg-blue-500' },
                                { name: 'purple', color: 'bg-purple-500' },
                                { name: 'green', color: 'bg-green-500' },
                                { name: 'red', color: 'bg-red-500' },
                                { name: 'orange', color: 'bg-orange-500' }
                              ].map(({ name, color }) => (
                                <button
                                  key={name}
                                  className={`${color} w-8 h-8 rounded-full border-2 ${accentColor === name ? 'border-gray-800 ring-2 ring-gray-400' : 'border-white shadow-sm hover:scale-110'} transition-all duration-200`}
                                  title={name.charAt(0).toUpperCase() + name.slice(1)}
                                  onClick={() => handleAccentColorChange(name)}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-3">Display Options</h5>
                            <div className="space-y-3">
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                  type="checkbox" 
                                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                  checked={compactSidebar}
                                  onChange={(e) => handleDisplayOptionChange('compactSidebar', e.target.checked)}
                                />
                                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Compact sidebar</span>
                              </label>
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                  type="checkbox" 
                                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                  checked={showAnimations}
                                  onChange={(e) => handleDisplayOptionChange('showAnimations', e.target.checked)}
                                />
                                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Show animations</span>
                              </label>
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                  type="checkbox" 
                                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                  checked={enableBlur}
                                  onChange={(e) => handleDisplayOptionChange('enableBlur', e.target.checked)}
                                />
                                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Enable blur effects</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notification Preferences</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Choose which notifications you want to receive
                        </p>
                        
                        <div className="space-y-4 max-w-md">
                          {/* Email Notifications */}
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                            </div>
                            <button
                              onClick={() => handleNotificationChange('emailNotifications')}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                notificationPrefs.emailNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                notificationPrefs.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>

                          {/* Due Date Reminders */}
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Due Date Reminders</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Get reminded before book due dates</p>
                            </div>
                            <button
                              onClick={() => handleNotificationChange('dueDateReminders')}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                notificationPrefs.dueDateReminders ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                notificationPrefs.dueDateReminders ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>

                          {/* Overdue Alerts */}
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Overdue Alerts</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when books are overdue</p>
                            </div>
                            <button
                              onClick={() => handleNotificationChange('overdueAlerts')}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                notificationPrefs.overdueAlerts ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                notificationPrefs.overdueAlerts ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>

                          {/* New Book Announcements */}
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">New Book Announcements</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Be notified when new books are added</p>
                            </div>
                            <button
                              onClick={() => handleNotificationChange('newBookAnnouncements')}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                notificationPrefs.newBookAnnouncements ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                notificationPrefs.newBookAnnouncements ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>

                          {/* Save Button */}
                          <button
                            onClick={saveNotificationPreferences}
                            disabled={savingNotifications}
                            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white dark:text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {savingNotifications ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Check size={18} />
                                Save Preferences
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Enter your current password and create a new password
                        </p>
                        
                        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                          {/* Current Password */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter current password"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>

                          {/* New Password */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter new password"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Minimum 6 characters
                            </p>
                          </div>

                          {/* Confirm Password */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Confirm new password"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>

                          {/* Message */}
                          {passwordMessage && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg ${
                              passwordMessage.type === 'success' 
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                            }`}>
                              {passwordMessage.type === 'success' ? <Check size={18} /> : <XCircle size={18} />}
                              <span className="text-sm">{passwordMessage.text}</span>
                            </div>
                          )}

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white dark:text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {passwordLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Changing Password...
                              </>
                            ) : (
                              <>
                                <Lock size={18} />
                                Change Password
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}