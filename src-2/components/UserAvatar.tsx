import React from 'react';
import { useUserSettings } from '../hooks/useUserSettings';

const UserAvatar: React.FC = () => {
  const { user } = useUserSettings();

  return (
    <div className="relative inline-block">
      <img
        src={user.avatarUrl}
        alt={`${user.name}'s avatar`}
        className="w-10 h-10 rounded-full"
      />
      <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md">
        <ul className="py-1">
          <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
            View Profile
          </li>
          <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
            Settings
          </li>
          <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
            Logout
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserAvatar;