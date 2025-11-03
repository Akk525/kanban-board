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
  streak: number; // Consecutive days with completed tasks
  highPriorityCompleted: number;
  urgentCompleted: number;
  achievements: Achievement[];
  recentPoints: { amount: number; reason: string; timestamp: Date }[];
  lastCompletionDate?: Date;
}

type GameAction =
  | { type: 'TASK_COMPLETED'; priority: 'low' | 'medium' | 'high' | 'urgent' }
  | { type: 'TASK_MOVED_TO_PROGRESS' }
  | { type: 'ACHIEVEMENT_UNLOCKED'; achievementId: string }
  | { type: 'CLEAR_RECENT_POINTS' };

const initialAchievements: Achievement[] = [
  // Beginner Achievements (50-100 points)
  {
    id: 'first-task',
    title: 'First Steps',
    description: 'Complete your first task',
    icon: '🎯',
    points: 50,
    unlocked: false,
  },
  {
    id: 'quick-learner',
    title: 'Quick Learner',
    description: 'Complete 3 tasks',
    icon: '📚',
    points: 75,
    unlocked: false,
  },
  {
    id: 'getting-warmed-up',
    title: 'Getting Warmed Up',
    description: 'Complete 5 tasks',
    icon: '🔥',
    points: 100,
    unlocked: false,
  },
  
  // Intermediate Achievements (100-200 points)
  {
    id: 'task-warrior',
    title: 'Task Warrior',
    description: 'Complete 10 tasks',
    icon: '⚔️',
    points: 150,
    unlocked: false,
  },
  {
    id: 'dedicated-doer',
    title: 'Dedicated Doer',
    description: 'Complete 15 tasks',
    icon: '💪',
    points: 175,
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
  
  // Advanced Achievements (200-400 points)
  {
    id: 'productivity-pro',
    title: 'Productivity Pro',
    description: 'Complete 50 tasks',
    icon: '🚀',
    points: 300,
    unlocked: false,
  },
  {
    id: 'task-legend',
    title: 'Task Legend',
    description: 'Complete 100 tasks',
    icon: '🏆',
    points: 500,
    unlocked: false,
  },
  {
    id: 'century-club',
    title: 'Century Club',
    description: 'Complete 200 tasks',
    icon: '💯',
    points: 750,
    unlocked: false,
  },
  
  // Priority-Based Achievements (150-300 points)
  {
    id: 'priority-aware',
    title: 'Priority Aware',
    description: 'Complete 5 high or urgent priority tasks',
    icon: '⚠️',
    points: 100,
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
    id: 'urgent-master',
    title: 'Urgent Master',
    description: 'Complete 5 urgent priority tasks',
    icon: '💥',
    points: 200,
    unlocked: false,
  },
  {
    id: 'crisis-manager',
    title: 'Crisis Manager',
    description: 'Complete 20 high or urgent priority tasks',
    icon: '🚨',
    points: 300,
    unlocked: false,
  },
  
  // Streak Achievements (100-400 points)
  {
    id: 'consistency-counts',
    title: 'Consistency Counts',
    description: 'Complete tasks for 3 days in a row',
    icon: '📅',
    points: 150,
    unlocked: false,
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Complete tasks for 7 days in a row',
    icon: '🗓️',
    points: 250,
    unlocked: false,
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Complete tasks for 14 days in a row',
    icon: '🔥',
    points: 400,
    unlocked: false,
  },
  {
    id: 'habit-master',
    title: 'Habit Master',
    description: 'Complete tasks for 30 days in a row',
    icon: '🌟',
    points: 1000,
    unlocked: false,
  },
  
  // Level-Based Achievements (200-1000 points)
  {
    id: 'level-up',
    title: 'Level Up!',
    description: 'Reach level 5',
    icon: '⬆️',
    points: 200,
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
  {
    id: 'master-organizer',
    title: 'Master Organizer',
    description: 'Reach level 15',
    icon: '🎓',
    points: 750,
    unlocked: false,
  },
  {
    id: 'legendary-achiever',
    title: 'Legendary Achiever',
    description: 'Reach level 20',
    icon: '👑',
    points: 1000,
    unlocked: false,
  },
  
  // Speed Achievements (100-300 points)
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Complete 5 tasks in one session',
    icon: '⚡',
    points: 100,
    unlocked: false,
  },
  {
    id: 'productivity-burst',
    title: 'Productivity Burst',
    description: 'Complete 10 tasks in one session',
    icon: '💨',
    points: 200,
    unlocked: false,
  },
  {
    id: 'task-tornado',
    title: 'Task Tornado',
    description: 'Complete 20 tasks in one session',
    icon: '🌪️',
    points: 350,
    unlocked: false,
  },
  
  // Point Milestones (Variable)
  {
    id: 'point-collector',
    title: 'Point Collector',
    description: 'Earn 500 total points',
    icon: '💰',
    points: 100,
    unlocked: false,
  },
  {
    id: 'point-hoarder',
    title: 'Point Hoarder',
    description: 'Earn 1000 total points',
    icon: '💎',
    points: 200,
    unlocked: false,
  },
  {
    id: 'point-millionaire',
    title: 'Point Master',
    description: 'Earn 2500 total points',
    icon: '🏅',
    points: 500,
    unlocked: false,
  },
  
  // Special Achievements (200-500 points)
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Complete a task before 9 AM',
    icon: '🌅',
    points: 150,
    unlocked: false,
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Complete a task after 9 PM',
    icon: '🦉',
    points: 150,
    unlocked: false,
  },
  {
    id: 'weekend-warrior',
    title: 'Weekend Warrior',
    description: 'Complete tasks on Saturday and Sunday',
    icon: '🎉',
    points: 200,
    unlocked: false,
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete 10 tasks with no overdue items',
    icon: '✨',
    points: 250,
    unlocked: false,
  },
  {
    id: 'comeback-kid',
    title: 'Comeback Kid',
    description: 'Complete a task after a 3+ day break',
    icon: '🎯',
    points: 100,
    unlocked: false,
  },
];

const initialState: GameState = {
  totalPoints: 0,
  level: 1,
  tasksCompleted: 0,
  streak: 0,
  highPriorityCompleted: 0,
  urgentCompleted: 0,
  achievements: initialAchievements,
  recentPoints: [],
  lastCompletionDate: undefined,
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

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const isConsecutiveDay = (lastDate: Date, currentDate: Date): boolean => {
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(lastDate, yesterday);
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'TASK_COMPLETED': {
      const points = pointsForPriority[action.priority];
      const newTotalPoints = state.totalPoints + points;
      const newTasksCompleted = state.tasksCompleted + 1;
      const newLevel = calculateLevel(newTotalPoints);
      const now = new Date();
      
      // Track high priority and urgent tasks
      const newHighPriorityCompleted = state.highPriorityCompleted + 
        (action.priority === 'high' || action.priority === 'urgent' ? 1 : 0);
      const newUrgentCompleted = state.urgentCompleted + 
        (action.priority === 'urgent' ? 1 : 0);
      
      // Calculate streak
      let newStreak = state.streak;
      if (!state.lastCompletionDate) {
        newStreak = 1;
      } else if (isSameDay(state.lastCompletionDate, now)) {
        // Same day, keep streak
        newStreak = state.streak;
      } else if (isConsecutiveDay(state.lastCompletionDate, now)) {
        // Consecutive day, increase streak
        newStreak = state.streak + 1;
      } else {
        // Streak broken, restart
        newStreak = 1;
      }
      
      const newRecentPoints = [
        ...state.recentPoints,
        {
          amount: points,
          reason: `Completed ${action.priority} priority task`,
          timestamp: now,
        },
      ].slice(-5); // Keep only last 5 point gains

      // Check for achievement unlocks
      const updatedAchievements = state.achievements.map(achievement => {
        if (achievement.unlocked) return achievement;

        let shouldUnlock = false;
        const currentHour = now.getHours();
        const isWeekend = now.getDay() === 0 || now.getDay() === 6;
        
        switch (achievement.id) {
          // Task count achievements
          case 'first-task':
            shouldUnlock = newTasksCompleted >= 1;
            break;
          case 'quick-learner':
            shouldUnlock = newTasksCompleted >= 3;
            break;
          case 'getting-warmed-up':
            shouldUnlock = newTasksCompleted >= 5;
            break;
          case 'task-warrior':
            shouldUnlock = newTasksCompleted >= 10;
            break;
          case 'dedicated-doer':
            shouldUnlock = newTasksCompleted >= 15;
            break;
          case 'task-master':
            shouldUnlock = newTasksCompleted >= 25;
            break;
          case 'productivity-pro':
            shouldUnlock = newTasksCompleted >= 50;
            break;
          case 'task-legend':
            shouldUnlock = newTasksCompleted >= 100;
            break;
          case 'century-club':
            shouldUnlock = newTasksCompleted >= 200;
            break;
            
          // Priority-based achievements
          case 'priority-aware':
            shouldUnlock = newHighPriorityCompleted >= 5;
            break;
          case 'high-priority-hero':
            shouldUnlock = newHighPriorityCompleted >= 10;
            break;
          case 'urgent-master':
            shouldUnlock = newUrgentCompleted >= 5;
            break;
          case 'crisis-manager':
            shouldUnlock = newHighPriorityCompleted >= 20;
            break;
            
          // Streak achievements
          case 'consistency-counts':
            shouldUnlock = newStreak >= 3;
            break;
          case 'week-warrior':
            shouldUnlock = newStreak >= 7;
            break;
          case 'unstoppable':
            shouldUnlock = newStreak >= 14;
            break;
          case 'habit-master':
            shouldUnlock = newStreak >= 30;
            break;
            
          // Level achievements
          case 'level-up':
            shouldUnlock = newLevel >= 5;
            break;
          case 'productivity-guru':
            shouldUnlock = newLevel >= 10;
            break;
          case 'master-organizer':
            shouldUnlock = newLevel >= 15;
            break;
          case 'legendary-achiever':
            shouldUnlock = newLevel >= 20;
            break;
            
          // Speed achievements (tasks in one session - simplified to total)
          case 'speed-demon':
            shouldUnlock = newTasksCompleted >= 5;
            break;
          case 'productivity-burst':
            shouldUnlock = newTasksCompleted >= 10;
            break;
          case 'task-tornado':
            shouldUnlock = newTasksCompleted >= 20;
            break;
            
          // Point milestones
          case 'point-collector':
            shouldUnlock = newTotalPoints >= 500;
            break;
          case 'point-hoarder':
            shouldUnlock = newTotalPoints >= 1000;
            break;
          case 'point-millionaire':
            shouldUnlock = newTotalPoints >= 2500;
            break;
            
          // Special achievements
          case 'early-bird':
            shouldUnlock = currentHour < 9;
            break;
          case 'night-owl':
            shouldUnlock = currentHour >= 21;
            break;
          case 'weekend-warrior':
            shouldUnlock = isWeekend;
            break;
        }

        if (shouldUnlock) {
          return {
            ...achievement,
            unlocked: true,
            unlockedAt: now,
          };
        }
        return achievement;
      });

      return {
        ...state,
        totalPoints: newTotalPoints,
        level: newLevel,
        tasksCompleted: newTasksCompleted,
        streak: newStreak,
        highPriorityCompleted: newHighPriorityCompleted,
        urgentCompleted: newUrgentCompleted,
        achievements: updatedAchievements,
        recentPoints: newRecentPoints,
        lastCompletionDate: now,
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
