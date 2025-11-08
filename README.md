# Kanban Board - Team Project Management

A modern Kanban board application similar to Jira, built with React, TypeScript, and Vite. Perfect for team collaboration and project management.

## ✨ Features

### Core Features
- **Drag & Drop**: Intuitive card movement between columns
- **Team Collaboration**: User assignment and role management
- **Rich Cards**: Support for descriptions, labels, priorities, and due dates
- **Search & Filter**: Quickly find cards across all columns
- **Comments**: Card-level discussions and updates
- **Real-time Updates**: Live collaboration with instant state updates
- **Modern UI**: Clean, responsive design built with Tailwind CSS

### Multiple Views
- **📋 Kanban View**: Classic drag-and-drop board with columns
- **📊 Table View**: Spreadsheet-like view with sorting, filtering, and CSV export
- **� Calendar View**: Monthly calendar with task visualization by due date
- **�📈 Gantt View**: Timeline visualization with start/due dates
- **🎯 Dashboard View**: Metrics, analytics, and board overview

### Dashboard Features
- **Real-Time Metrics**: Total tasks, completion rate, in-progress, and overdue counts (auto-updates when tasks are completed)
- **Live Completion Tracking**: Automatically updates when cards are moved to "Done" or marked complete
- **Priority Distribution**: Visual breakdown of tasks by priority level with percentages
- **Top Contributors**: Team member activity and completion rates based on actual task completion
- **Board Overview**: Quick access to all boards with real-time progress indicators
- **Time Filtering**: View metrics by week, month, or all time
- **Smart Stats**: Excludes archived tasks for accurate current metrics
- **Default View**: Dashboard is the first thing you see when loading the app

### Table View Features
- **Spreadsheet Layout**: See all tasks in a comprehensive table format
- **Advanced Sorting**: Sort by title, priority, status, assignee, due date, estimate, or created date
- **Powerful Filters**: Filter by priority, status (active/completed/overdue), and assignee
- **Search**: Search across task titles, descriptions, and labels
- **CSV Export**: Download filtered data as spreadsheet for reporting
- **Visual Indicators**: Color-coded priorities, overdue warnings, completion status
- **Quick Navigation**: Click any row to view full task details

### Calendar View Features
- **Monthly Grid**: Traditional calendar layout showing tasks by due date
- **Visual Task Cards**: Color-coded by priority with up to 3 tasks per day
- **Sidebar Details**: Click any date to see all tasks with full information
- **Monthly Stats**: Track total tasks, completed, and overdue for the month
- **Navigation**: Previous/Next month controls and "Today" quick jump
- **Status Indicators**: Checkmarks for completed tasks, alerts for overdue
- **Quick Actions**: Click task to view details, hover to add new tasks
- **Smart Display**: Shows task count when more than 3 tasks per day

### Gantt Chart Features
- **Timeline Visualization**: See tasks as horizontal bars on a timeline
- **Zoom Levels**: Switch between week (4 weeks) and month (3 months) views
- **Navigation**: Move forward/backward through time with arrow controls
- **Today Marker**: Red vertical line shows current date
- **Priority Colors**: Tasks color-coded by priority (urgent, high, medium, low)
- **Dependencies**: Visual indicator for tasks with dependencies
- **Interactive**: Click any task bar to view/edit details

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd kanban-board
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠️ Built With

- **[React 18](https://react.dev/)** - Frontend framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[@dnd-kit](https://dndkit.com/)** - Drag and drop functionality
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[date-fns](https://date-fns.org/)** - Date utilities
- **[recharts](https://recharts.org/)** - Charts and data visualization
- **[clsx](https://github.com/lukeed/clsx)** - Utility for constructing className strings

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Board.tsx       # Main board component with view switching
│   ├── Column.tsx      # Column component
│   ├── Card.tsx        # Card component
│   ├── CreateCardModal.tsx # Card creation modal
│   ├── ViewTabs.tsx    # View switcher component
│   ├── Gantt/          # Gantt chart view
│   │   └── GanttView.tsx
│   └── Dashboard/      # Dashboard view
│       └── DashboardView.tsx
├── context/            # React Context for state management
│   └── BoardContext.tsx
├── data/               # Sample data and utilities
│   └── sampleData.ts
├── types/              # TypeScript type definitions
│   └── index.ts
└── index.css          # Global styles and Tailwind imports
```

## 🎯 Usage

### Getting Started
When you first load the app, you'll see the **Dashboard** with an overview of all your projects, metrics, and team activity. From there, you can:
- Click any board to switch to it and view in Kanban mode
- Use the view tabs to switch between Dashboard, Kanban, Table, Calendar, and Gantt views
- Create new boards from the board selector dropdown

### Switching Views
Navigate between different views using the view tabs at the top:
- **Dashboard**: Metrics, stats, and project overview (default view)
- **Kanban**: Classic drag-and-drop board with columns
- **Table**: Spreadsheet view with sorting and filtering
- **Calendar**: Monthly calendar with task deadlines
- **Gantt**: Timeline view for project planning

### Creating Cards
1. Switch to **Kanban** view
2. Click the "+" button in any column header
3. Fill in the card details:
   - **Title** (required)
   - **Description**
   - **Assignee** - Select from team members
   - **Priority** - Low, Medium, High, or Urgent
   - **Start Date** - When work begins
   - **Due Date** - Deadline
   - **Estimate** - Hours needed (optional)
4. Add labels as needed
5. Click "Create Card"

### Dashboard Overview
The dashboard provides a comprehensive view of your workspace:
- **Key Metrics**: Total tasks, completed tasks with percentage, in-progress count, overdue alerts
- **Real-Time Updates**: Stats automatically update when you complete tasks (move to "Done" column)
- **Priority Breakdown**: See distribution of urgent, high, medium, and low priority tasks
- **Team Performance**: View top contributors with their task counts and completion rates
- **Board Cards**: Click any board card to switch to that board in Kanban view
- **Time Filters**: Toggle between This Week, This Month, or All Time views

### Using the Gantt Chart
1. Switch to **Gantt** view
2. Use **Week/Month** toggle to zoom in/out
3. Navigate with **◀ ▶** arrows
4. Click any task bar to view details
5. Look for the red "Today" line for current date reference
6. Tasks are color-coded by priority

### Using Table View
1. Click the **Table** tab to switch views
2. Click column headers to sort by any field
3. Use dropdown filters for Priority, Status, Assignee
4. Search across titles, descriptions, and labels
5. Click **Export CSV** button to download spreadsheet
6. Click any row to view full task details
7. Use **Clear all** to reset filters

### Using Calendar View
1. Click the **Calendar** tab to open monthly view
2. See tasks displayed on their due dates
3. Click any date to view all tasks in sidebar
4. Use **◀ Today ▶** buttons to navigate months
5. Click task cards to view/edit details
6. Check monthly stats (total, completed, overdue)
7. Hover over days to see "Add task" option

### Dashboard Overview
1. Switch to **Dashboard** view
2. Review key metrics at the top
3. Check priority distribution and team activity
4. Scroll to **Your Boards** section
5. Click any board card to switch to it
6. Use **New Board** button to create boards

### Moving Cards (Kanban View)
- Drag and drop cards between columns
- Cards maintain their order within columns
- Status updates automatically

### Team Management
- Assign cards to team members
- View assignee information on cards
- Filter cards by assignee
- Track team productivity in Dashboard

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Customization

### Adding New Columns
Use the "Add Column" button in the header to create new workflow stages.

### Customizing Priorities
Edit the `priorityColors` object in `src/components/Card.tsx` to modify priority styling.

### Extending Card Fields
Add new fields by:
1. Updating the `Card` interface in `src/types/index.ts`
2. Modifying the `CreateCardModal` component
3. Updating the card display in `Card.tsx`

## 📚 Additional Documentation

- **[GANTT_GUIDE.md](GANTT_GUIDE.md)** - Complete guide to using the Gantt chart view
- **[TABLE_GUIDE.md](TABLE_GUIDE.md)** - Table/spreadsheet view guide with sorting and filtering
- **[CALENDAR_GUIDE.md](CALENDAR_GUIDE.md)** - Calendar view guide for deadline management
- **[DASHBOARD_GUIDE.md](DASHBOARD_GUIDE.md)** - Dashboard features and usage guide
- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Technical implementation details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Jira and other modern project management tools
- Built with modern React best practices
- Designed for team productivity and collaboration
