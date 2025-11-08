import React, { useContext } from 'react';
import { SettingsContext } from '../../context/SettingsContext';

const NotificationSettings: React.FC = () => {
  const { state, dispatch } = useContext(SettingsContext);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_NOTIFICATION_SETTINGS', payload: { emailAlerts: event.target.checked } });
  };

  const handlePushChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_NOTIFICATION_SETTINGS', payload: { pushNotifications: event.target.checked } });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Notification Settings</h2>
      <div className="mt-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={state.notificationSettings.emailAlerts}
            onChange={handleEmailChange}
            className="mr-2"
          />
          Email Alerts
        </label>
      </div>
      <div className="mt-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={state.notificationSettings.pushNotifications}
            onChange={handlePushChange}
            className="mr-2"
          />
          Push Notifications
        </label>
      </div>
    </div>
  );
};

export default NotificationSettings;