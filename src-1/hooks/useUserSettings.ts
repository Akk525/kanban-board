import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';

const useUserSettings = () => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useUserSettings must be used within a SettingsProvider');
  }

  const { state, dispatch } = context;

  const updateUserSettings = (newSettings) => {
    dispatch({ type: 'UPDATE_USER_SETTINGS', payload: newSettings });
  };

  return {
    userSettings: state.userSettings,
    updateUserSettings,
  };
};

export default useUserSettings;