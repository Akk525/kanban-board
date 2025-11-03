import React, { useEffect, useState } from 'react';

interface CelebrationProps {
  show: boolean;
  onComplete: () => void;
  points: number;
  achievementUnlocked?: string;
}

export const Celebration: React.FC<CelebrationProps> = ({ 
  show, 
  onComplete, 
  points, 
  achievementUnlocked 
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          onComplete();
        }, 300); // Small delay to allow fade-out animation
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show, onComplete]);

  if (!show && !visible) return null;

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 flex items-center justify-center transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Confetti Animation */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${1 + Math.random()}s`,
            }}
          >
            <div 
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)]
              }}
            />
          </div>
        ))}
      </div>

      {/* Main Celebration Message */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center transform animate-scaleIn border-4 border-green-400">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Completed!</h2>
        <div className="flex items-center justify-center gap-2 text-lg font-semibold text-green-600 mb-4">
          <span className="text-2xl">+{points}</span>
          <span>points!</span>
        </div>
        
        {achievementUnlocked && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-400">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-sm font-semibold text-yellow-800">Achievement Unlocked!</div>
            <div className="text-lg font-bold text-yellow-900">{achievementUnlocked}</div>
          </div>
        )}
      </div>

      {/* Floating Points Animation */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={`points-${i}`}
            className="absolute text-green-500 font-bold text-xl animate-bounce"
            style={{
              left: `${45 + Math.random() * 10}%`,
              top: `${40 + Math.random() * 20}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s',
            }}
          >
            +{Math.floor(points / 5)}
          </div>
        ))}
      </div>
    </div>
  );
};
