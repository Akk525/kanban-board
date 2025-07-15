import type { Board } from '../types';

export const sampleBoard: Board = {
  id: 'board-1',
  title: 'Team Project Board',
  description: 'Track our team\'s sprint progress',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date(),
  categories: [
    {
      id: 'cat-1',
      name: 'Frontend',
      color: '#3B82F6', // Blue
      createdAt: new Date('2025-01-01'),
    },
    {
      id: 'cat-2',
      name: 'Backend',
      color: '#10B981', // Green
      createdAt: new Date('2025-01-01'),
    },
    {
      id: 'cat-3',
      name: 'Design',
      color: '#8B5CF6', // Purple
      createdAt: new Date('2025-01-01'),
    },
    {
      id: 'cat-4',
      name: 'Bug Fix',
      color: '#EF4444', // Red
      createdAt: new Date('2025-01-01'),
    },
    {
      id: 'cat-5',
      name: 'Feature',
      color: '#F59E0B', // Orange
      createdAt: new Date('2025-01-01'),
    },
  ],
  members: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'member',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'member',
    },
  ],
  columns: [
    {
      id: 'col-1',
      title: 'To Do',
      order: 0,
      cards: [
        {
          id: 'card-1',
          title: 'Design homepage mockup',
          description: 'Create wireframes and mockups for the new homepage design',
          assigneeId: '2',
          priority: 'high',
          labels: ['design', 'frontend'],
          categoryId: 'cat-3', // Design
          dueDate: new Date('2025-07-20'),
          createdAt: new Date('2025-07-10'),
          updatedAt: new Date('2025-07-10'),
          comments: [],
          columnId: 'col-1',
          order: 0,
        },
        {
          id: 'card-2',
          title: 'Set up CI/CD pipeline',
          description: 'Configure GitHub Actions for automated testing and deployment',
          assigneeId: '1',
          priority: 'medium',
          labels: ['devops', 'infrastructure'],
          categoryId: 'cat-2', // Backend
          dueDate: new Date('2025-07-25'),
          createdAt: new Date('2025-07-11'),
          updatedAt: new Date('2025-07-11'),
          comments: [],
          columnId: 'col-1',
          order: 1,
        },
      ],
    },
    {
      id: 'col-2',
      title: 'In Progress',
      order: 1,
      cards: [
        {
          id: 'card-3',
          title: 'Implement user authentication',
          description: 'Add login/logout functionality with JWT tokens',
          assigneeId: '3',
          priority: 'high',
          labels: ['backend', 'security'],
          categoryId: 'cat-2', // Backend
          dueDate: new Date('2025-07-18'),
          createdAt: new Date('2025-07-08'),
          updatedAt: new Date('2025-07-14'),
          comments: [
            {
              id: 'comment-1',
              content: 'Started working on the JWT implementation',
              authorId: '3',
              createdAt: new Date('2025-07-14'),
              updatedAt: new Date('2025-07-14'),
            },
          ],
          columnId: 'col-2',
          order: 0,
        },
      ],
    },
    {
      id: 'col-3',
      title: 'In Review',
      order: 2,
      cards: [
        {
          id: 'card-4',
          title: 'Update API documentation',
          description: 'Document all new endpoints and update existing ones',
          assigneeId: '1',
          priority: 'low',
          labels: ['documentation'],
          categoryId: 'cat-2', // Backend
          createdAt: new Date('2025-07-05'),
          updatedAt: new Date('2025-07-12'),
          comments: [],
          columnId: 'col-3',
          order: 0,
        },
      ],
    },
    {
      id: 'col-4',
      title: 'Done',
      order: 3,
      cards: [
        {
          id: 'card-5',
          title: 'Setup project structure',
          description: 'Initialize React project with TypeScript and necessary dependencies',
          assigneeId: '1',
          priority: 'high',
          labels: ['setup', 'frontend'],
          createdAt: new Date('2025-07-01'),
          updatedAt: new Date('2025-07-03'),
          comments: [
            {
              id: 'comment-2',
              content: 'Project structure is ready, all dependencies installed',
              authorId: '1',
              createdAt: new Date('2025-07-03'),
              updatedAt: new Date('2025-07-03'),
            },
          ],
          columnId: 'col-4',
          order: 0,
        },
      ],
    },
  ],
};
