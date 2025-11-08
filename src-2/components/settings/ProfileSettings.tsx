import React, { useState } from 'react';
import { useUserSettings } from '../../hooks/useUserSettings';

const ProfileSettings: React.FC = () => {
  const { userSettings, updateUserSettings } = useUserSettings();
  const [name, setName] = useState(userSettings.name);
  const [email, setEmail] = useState(userSettings.email);
  const [profilePicture, setProfilePicture] = useState(userSettings.profilePicture);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserSettings({ name, email, profilePicture });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Profile Settings</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-4">
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Profile Picture URL</label>
          <input
            type="url"
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white rounded-md px-4 py-2">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;