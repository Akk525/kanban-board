import React, { useState } from 'react';
import { X, User, Bell, Palette, Lock } from 'lucide-react';

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  onUpdateProfile?: (data: { name: string; email: string }) => void;
}

export const UserSettings: React.FC<UserSettingsProps> = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'privacy'>('profile');
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [notifications, setNotifications] = useState({
    taskAssigned: true,
    taskCompleted: true,
    taskDueSoon: true,
    mentions: true,
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [language, setLanguage] = useState('en');

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    onUpdateProfile?.({ name, email });
    // Show success message
    alert('Profile updated successfully!');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideIn">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex h-[calc(90vh-120px)]">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-200 bg-gray-50 p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                  Profile
                </button>
                
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  Notifications
                </button>
                
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'appearance'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Palette className="w-5 h-5" />
                  Appearance
                </button>
                
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'privacy'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  Privacy & Security
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
                    
                    <div className="space-y-4">
                      {/* Avatar */}
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          Change Avatar
                        </button>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Save Button */}
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleSaveProfile}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={onClose}
                          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h3>
                    
                    <div className="space-y-4">
                      {Object.entries({
                        taskAssigned: 'When a task is assigned to me',
                        taskCompleted: 'When a task is completed',
                        taskDueSoon: 'When a task is due soon',
                        mentions: 'When someone mentions me',
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">{label}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications[key as keyof typeof notifications]}
                              onChange={(e) => setNotifications({
                                ...notifications,
                                [key]: e.target.checked,
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Appearance Settings</h3>
                    
                    <div className="space-y-6">
                      {/* Theme */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Theme
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['light', 'dark', 'auto'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setTheme(t)}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                theme === t
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              <div className="text-center capitalize font-medium">{t}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Language */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                          <option value="ja">日本語</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Privacy & Security</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Change Password</h4>
                        <p className="text-sm text-gray-600 mb-3">Update your password to keep your account secure</p>
                        <button className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                          Change Password
                        </button>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600 mb-3">Add an extra layer of security to your account</p>
                        <button className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                          Enable 2FA
                        </button>
                      </div>

                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="font-medium text-red-800 mb-2">Danger Zone</h4>
                        <p className="text-sm text-red-600 mb-3">Permanently delete your account and all associated data</p>
                        <button className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
