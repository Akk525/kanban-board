import React from 'react';
import { useUserSettings } from '../../hooks/useUserSettings';

const AccountSettings: React.FC = () => {
  const { userSettings, updateUserSettings } = useUserSettings();

  const handlePasswordChange = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newPassword = (event.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
    // Logic to handle password change
    updateUserSettings({ ...userSettings, password: newPassword });
  };

  const handleAccountDeletion = () => {
    // Logic to handle account deletion
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Call deletion function
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Account Settings</h2>
      <form onSubmit={handlePasswordChange} className="mt-4">
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Change Password</label>
          <input
            type="password"
            name="password"
            id="password"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Update Password</button>
      </form>
      <button
        onClick={handleAccountDeletion}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md"
      >
        Delete Account
      </button>
    </div>
  );
};

export default AccountSettings;