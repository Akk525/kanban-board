import React from 'react';

const AppearanceSettings: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Appearance Settings</h2>
      <div className="mt-4">
        <label className="block mb-2">
          Theme:
          <select className="ml-2 border rounded">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System Default</option>
          </select>
        </label>
      </div>
      <div className="mt-4">
        <label className="block mb-2">
          Layout:
          <select className="ml-2 border rounded">
            <option value="grid">Grid</option>
            <option value="list">List</option>
          </select>
        </label>
      </div>
      <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">
        Save Changes
      </button>
    </div>
  );
};

export default AppearanceSettings;