import React, { useState } from 'react';
import { Trophy, Award, X } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const GameStats: React.FC = () => {
  const { state } = useGame();
  const [showAchievements, setShowAchievements] = useState(false);

  const progressToNextLevel = ((state.totalPoints % 100) / 100) * 100;
  const pointsToNextLevel = 100 - (state.totalPoints % 100);

  const recentAchievements = state.achievements
    .filter(a => a.unlocked)
    .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
    .slice(0, 2); // Reduced from 3 to 2

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border p-3 mb-4"> {/* Reduced padding and margin */}
        <div className="flex items-center justify-between mb-3"> {/* Reduced margin */}
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2"> {/* Smaller text */}
            <Trophy className="text-yellow-500" size={18} /> {/* Smaller icon */}
            Player Stats
          </h2>
          <button
            onClick={() => setShowAchievements(true)}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
          >
            <Award size={14} />
            Achievements
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-3"> {/* Always 4 columns, reduced gaps and margins */}
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{state.level}</div> {/* Smaller text */}
            <div className="text-xs text-gray-500">Level</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{state.totalPoints}</div> {/* Smaller text */}
            <div className="text-xs text-gray-500">Points</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">{state.tasksCompleted}</div> {/* Smaller text */}
            <div className="text-xs text-gray-500">Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-600">
              {state.achievements.filter(a => a.unlocked).length}
            </div> {/* Smaller text */}
            <div className="text-xs text-gray-500">Badges</div>
          </div>
        </div>

        {/* Compact Level Progress Bar */}
        <div className="mb-3"> {/* Reduced margin */}
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Level {state.level}</span>
            <span>{pointsToNextLevel} to next</span> {/* Shortened text */}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5"> {/* Thinner progress bar */}
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
        </div>

        {/* Compact Recent Activity and Achievements */}
        <div className="grid grid-cols-2 gap-4 text-xs"> {/* Two columns layout with smaller text */}
          {/* Recent Points */}
          {state.recentPoints.length > 0 && (
            <div>
              <div className="font-medium text-gray-700 mb-1">Recent Activity</div>
              <div className="space-y-1">
                {state.recentPoints.slice(-2).map((recent, index) => ( // Only show 2 recent
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600 truncate">{recent.reason}</span>
                    <span className="text-green-600 font-medium">+{recent.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Achievements */}
          {recentAchievements.length > 0 && (
            <div>
              <div className="font-medium text-gray-700 mb-1">Latest Badges</div>
              <div className="flex gap-1 flex-wrap">
                {recentAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-1 bg-yellow-50 text-yellow-800 px-1.5 py-0.5 rounded text-xs"
                    title={achievement.description}
                  >
                    <span>{achievement.icon}</span>
                    <span className="truncate max-w-16">{achievement.title}</span> {/* Shorter width */}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Achievements Modal */}
      {showAchievements && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Achievements</h3>
              <button
                onClick={() => setShowAchievements(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="grid gap-3">
                {state.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      achievement.unlocked
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        achievement.unlocked ? 'text-yellow-900' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                      </div>
                      <div className={`text-sm ${
                        achievement.unlocked ? 'text-yellow-700' : 'text-gray-400'
                      }`}>
                        {achievement.description}
                      </div>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <div className="text-xs text-yellow-600 mt-1">
                          Unlocked {achievement.unlockedAt.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className={`text-sm font-bold ${
                      achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'
                    }`}>
                      {achievement.points} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
