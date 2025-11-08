import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { UserSettings } from '../types';

interface SettingsState {
  userSettings: UserSettings;
}

type SettingsAction =
  | { type: 'UPDATE_SETTINGS'; payload: UserSettings };

const initialState: SettingsState = {
  userSettings: {
    name: '',
    email: '',
    profilePicture: '',
    notifications: {
      emailAlerts: false,
      pushNotifications: false,
    },
    appearance: {
      theme: 'light',
      layout: 'default',
    },
  },
};

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return { ...state, userSettings: { ...state.userSettings, ...action.payload } };
    default:
      return state;
  }
}

const SettingsContext = createContext<{
  state: SettingsState;
  dispatch: React.Dispatch<SettingsAction>;
} | null>(null);

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  return (
    <SettingsContext.Provider value={{ state, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
};