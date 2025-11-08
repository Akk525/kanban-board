import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { GameStats } from './GameStats';

interface NavbarProps {
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  onSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  userName = 'Guest User',
  userEmail = 'guest@tuesday.com',
  onLogout,
  onSettings 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Brand */}
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Tuesday
            </h1>
          </div>

          {/* Right side - User menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 transition-colors text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium hidden sm:block">{userName}</span>
              <ChevronDown 
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>

                {/* Player Stats Section */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Player Stats
                  </p>
                  <div className="scale-95 origin-top">
                    <GameStats />
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      onSettings?.();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </button>
                  
                  <button
                    onClick={() => {
                      onLogout?.();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
