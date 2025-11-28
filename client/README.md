# AnuragOS Frontend

A terminal-style portfolio interface built with Next.js, featuring a unique OS-like experience with a file explorer and CLI.

## Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS
- **State Management**: Jotai
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Features

- 🖥️ Terminal-style CLI interface
- 📁 File explorer navigation
- 🪟 Draggable, resizable windows
- 🎨 Dark theme with green terminal aesthetics
- 📱 Responsive design
- ⚡ Real-time data from backend API

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on port 4000

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local if backend is on different port
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   Navigate to http://localhost:3000

## Project Structure

```
client/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── core/               # Core UI components
│   │   │   ├── BootAnimation.tsx
│   │   │   ├── CLI.tsx         # Terminal interface
│   │   │   ├── FolderTree.tsx  # File explorer
│   │   │   ├── MainLayout.tsx  # Main layout
│   │   │   ├── Window.tsx      # Draggable window
│   │   │   └── WindowManager.tsx
│   │   ├── modules/            # Feature modules
│   │   │   ├── AboutModule.tsx
│   │   │   ├── ProjectsModule.tsx
│   │   │   ├── JourneyModule.tsx
│   │   │   ├── BlogModule.tsx
│   │   │   └── ContactModule.tsx
│   │   └── ui/                 # Reusable UI components
│   ├── lib/
│   │   ├── api.ts              # Backend API client
│   │   ├── commands.ts         # CLI command processor
│   │   ├── data.ts             # File system data
│   │   └── utils.ts            # Utility functions
│   └── store/
│       └── atoms.ts            # Jotai state atoms
└── public/                     # Static assets
```

## Available Commands

Type these commands in the CLI:

- `help` - Show available commands
- `ls` - List directory contents
- `about` - Open About module
- `projects` - Open Projects Hub
- `journey` - Open Journey timeline
- `blog` - Open Blog posts
- `contact` - Open Contact form
- `ai-lab` - Open AI Lab (coming soon)
- `clear` - Clear terminal
- `exit` - End session

## Modules

### About Module
Displays personal information, tagline, and skills fetched from the backend.

### Projects Module
Shows all published projects with:
- Project descriptions
- Tech stack tags
- GitHub and live links
- Star/fork counts

### Journey Module
Timeline view of professional journey with:
- Year-based entries
- Category badges (education, work, project, achievement)
- Chronological ordering

### Blog Module
Lists published blog posts with:
- Title and publication date
- Content preview
- Tags

### Contact Module
Contact form with:
- Name, email, subject, message fields
- Form validation
- Success/error feedback
- Rate limiting protection

## API Integration

The frontend connects to the backend API at `http://localhost:4000` by default.

### API Endpoints Used

- `GET /api/health` - Health check
- `GET /api/about` - About information
- `GET /api/projects` - Published projects
- `GET /api/journey` - Journey timeline
- `GET /api/blog` - Blog posts
- `POST /api/contact` - Submit contact form

## Customization

### Theme Colors

Edit `src/app/globals.css` to customize the color scheme:

```css
:root {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 142 76% 36%;  /* Green accent */
  /* ... more colors */
}
```

### File System Structure

Edit `src/lib/data.ts` to modify the file explorer structure:

```typescript
export const initialFileSystem: FileSystemItem[] = [
  {
    name: 'your-folder',
    type: 'folder',
    id: 'your-folder',
    children: [...]
  },
  // ... more items
];
```

### Commands

Add new commands in `src/lib/commands.ts`:

```typescript
case "your-command":
  return { 
    type: "open_module", 
    content: "Opening...", 
    moduleId: "your-module" 
  };
```

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:4000)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

Private
