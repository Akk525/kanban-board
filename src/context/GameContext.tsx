import React, { createContext, useContext, useReducer, type ReactNode } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface GameState {
  totalPoints: number;
  level: number;
  tasksCompleted: number;
  achievements: Achievement[];
  recentPoints: { amount: number; reason: string; timestamp: Date }[];
}

type GameAction =
  | { type: 'TASK_COMPLETED'; priority: 'low' | 'medium' | 'high' | 'urgent' }
  | { type: 'TASK_MOVED_TO_PROGRESS' }
  | { type: 'ACHIEVEMENT_UNLOCKED'; achievementId: string }
  | { type: 'CLEAR_RECENT_POINTS' };

const initialAchievements: Achievement[] = [
  {
    id: 'first-task',
    title: 'Getting Started',
    description: 'Complete your first task',
    icon: '🎯',
    points: 50,
    unlocked: false,
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Complete 5 tasks in one day',
    icon: '⚡',
    points: 100,
    unlocked: false,
  },
  {
    id: 'task-master',
    title: 'Task Master',
    description: 'Complete 25 tasks',
    icon: '👑',
    points: 200,
    unlocked: false,
  },
  {
    id: 'high-priority-hero',
    title: 'High Priority Hero',
    description: 'Complete 10 high or urgent priority tasks',
    icon: '🔥',
    points: 150,
    unlocked: false,
  },
  {
    id: 'productivity-guru',
    title: 'Productivity Guru',
    description: 'Reach level 10',
    icon: '🧙‍♂️',
    points: 500,
    unlocked: false,
  },
];

const initialState: GameState = {
  totalPoints: 0,
  level: 1,
  tasksCompleted: 0,
  achievements: initialAchievements,
  recentPoints: [],
};

const pointsForPriority = {
  low: 10,
  medium: 20,
  high: 35,
  urgent: 50,
};

const calculateLevel = (points: number): number => {
  return Math.floor(points / 100) + 1;
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'TASK_COMPLETED': {
      const points = pointsForPriority[action.priority];
      const newTotalPoints = state.totalPoints + points;
      const newTasksCompleted = state.tasksCompleted + 1;
      const newLevel = calculateLevel(newTotalPoints);
      
      const newRecentPoints = [
        ...state.recentPoints,
        {
          amount: points,
          reason: `Completed ${action.priority} priority task`,
          timestamp: new Date(),
        },
      ].slice(-5); // Keep only last 5 point gains

      // Check for achievement unlocks
      const updatedAchievements = state.achievements.map(achievement => {
        if (achievement.unlocked) return achievement;

        let shouldUnlock = false;
        switch (achievement.id) {
          case 'first-task':
            shouldUnlock = newTasksCompleted >= 1;
            break;
          case 'task-master':
            shouldUnlock = newTasksCompleted >= 25;
            break;
          case 'high-priority-hero':
            shouldUnlock = action.priority === 'high' || action.priority === 'urgent';
            break;
          case 'productivity-guru':
            shouldUnlock = newLevel >= 10;
            break;
        }

        if (shouldUnlock) {
          return {
            ...achievement,
            unlocked: true,
            unlockedAt: new Date(),
          };
        }
        return achievement;
      });

      return {
        ...state,
        totalPoints: newTotalPoints,
        level: newLevel,
        tasksCompleted: newTasksCompleted,
        achievements: updatedAchievements,
        recentPoints: newRecentPoints,
      };
    }

    case 'TASK_MOVED_TO_PROGRESS': {
      const points = 5;
      const newTotalPoints = state.totalPoints + points;
      const newLevel = calculateLevel(newTotalPoints);

      const newRecentPoints = [
        ...state.recentPoints,
        {
          amount: points,
          reason: 'Moved task to In Progress',
          timestamp: new Date(),
        },
      ].slice(-5);

      return {
        ...state,
        totalPoints: newTotalPoints,
        level: newLevel,
        recentPoints: newRecentPoints,
      };
    }

    case 'ACHIEVEMENT_UNLOCKED': {
      const achievement = state.achievements.find(a => a.id === action.achievementId);
      if (!achievement || achievement.unlocked) return state;

      const newTotalPoints = state.totalPoints + achievement.points;
      const newLevel = calculateLevel(newTotalPoints);

      return {
        ...state,
        totalPoints: newTotalPoints,
        level: newLevel,
        achievements: state.achievements.map(a =>
          a.id === action.achievementId
            ? { ...a, unlocked: true, unlockedAt: new Date() }
            : a
        ),
      };
    }

    case 'CLEAR_RECENT_POINTS':
      return {
        ...state,
        recentPoints: [],
      };

    default:
      return state;
  }
};

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  addPoints: (priority: 'low' | 'medium' | 'high' | 'urgent') => void;
  addProgressPoints: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const addPoints = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    dispatch({ type: 'TASK_COMPLETED', priority });
  };

  const addProgressPoints = () => {
    dispatch({ type: 'TASK_MOVED_TO_PROGRESS' });
  };

  return (
    <GameContext.Provider value={{ state, dispatch, addPoints, addProgressPoints }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
