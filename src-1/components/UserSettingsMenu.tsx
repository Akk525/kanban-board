import React, { useState } from 'react';
import UserSettingsModal from './settings/UserSettingsModal';

const UserSettingsMenu: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpenModal}
        className="flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded"
      >
        Settings
      </button>
      {isModalOpen && <UserSettingsModal onClose={handleCloseModal} />}
    </div>
  );
};

export default UserSettingsMenu;