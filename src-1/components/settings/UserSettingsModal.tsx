import React, { useState } from 'react';
import { useBoardContext } from '../../context/BoardContext';
import { useSettingsContext } from '../../context/SettingsContext';
import ProfileSettings from './ProfileSettings';
import NotificationSettings from './NotificationSettings';
import AppearanceSettings from './AppearanceSettings';
import AccountSettings from './AccountSettings';

const UserSettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { state: boardState } = useBoardContext();
  const { state: settingsState, dispatch: settingsDispatch } = useSettingsContext();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'account'>('profile');

  const handleTabChange = (tab: 'profile' | 'notifications' | 'appearance' | 'account') => {
    setActiveTab(tab);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission logic here
    // For example, dispatch settings updates to the context
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">User Settings</h2>
        <div className="flex mb-4">
          <button onClick={() => handleTabChange('profile')} className={`flex-1 ${activeTab === 'profile' ? 'font-bold' : ''}`}>Profile</button>
          <button onClick={() => handleTabChange('notifications')} className={`flex-1 ${activeTab === 'notifications' ? 'font-bold' : ''}`}>Notifications</button>
          <button onClick={() => handleTabChange('appearance')} className={`flex-1 ${activeTab === 'appearance' ? 'font-bold' : ''}`}>Appearance</button>
          <button onClick={() => handleTabChange('account')} className={`flex-1 ${activeTab === 'account' ? 'font-bold' : ''}`}>Account</button>
        </div>
        <form onSubmit={handleSubmit}>
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'account' && <AccountSettings />}
          <div className="flex justify-end mt-4">
            <button type="button" onClick={onClose} className="mr-2 text-gray-500">Cancel</button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSettingsModal;