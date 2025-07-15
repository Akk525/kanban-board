# Kanban Board - Team Project Management

A modern Kanban board application similar to Jira, built with React, TypeScript, and Vite. Perfect for team collaboration and project management.

## ✨ Features

- **Drag & Drop**: Intuitive card movement between columns
- **Team Collaboration**: User assignment and role management
- **Rich Cards**: Support for descriptions, labels, priorities, and due dates
- **Search & Filter**: Quickly find cards across all columns
- **Comments**: Card-level discussions and updates
- **Real-time Updates**: Live collaboration with instant state updates
- **Modern UI**: Clean, responsive design built with Tailwind CSS

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

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Board.tsx       # Main board component
│   ├── Column.tsx      # Column component
│   ├── Card.tsx        # Card component
│   └── CreateCardModal.tsx # Card creation modal
├── context/            # React Context for state management
│   └── BoardContext.tsx
├── data/               # Sample data and utilities
│   └── sampleData.ts
├── types/              # TypeScript type definitions
│   └── index.ts
└── index.css          # Global styles and Tailwind imports
```

## 🎯 Usage

### Creating Cards
1. Click the "+" button in any column header
2. Fill in the card details (title, description, assignee, priority, etc.)
3. Add labels and set due dates as needed
4. Click "Create Card"

### Moving Cards
- Drag and drop cards between columns
- Cards maintain their order within columns
- Real-time updates across the team

### Team Management
- Assign cards to team members
- View assignee information on cards
- Filter cards by assignee

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
