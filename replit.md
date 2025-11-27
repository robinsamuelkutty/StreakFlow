# Consistency Tracker

## Overview

A productivity web application designed to help users track daily consistency, build better habits, and visualize progress through smart time blocking and gamified metrics. The application provides a minimalist dashboard with a "bento box" grid layout showing consistency scores, task management, time blocking, and activity visualization.

**Core Purpose**: Enable users to maintain accountability through a visual consistency score (0-100) calculated from daily task completion, time block adherence, and streak maintenance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript, using traditional Client-Side Routing (Wouter)
- **Rationale**: Single-page application with client-side routing provides fast navigation and interactive dashboard updates without full page reloads
- **UI Library**: Shadcn/UI components built on Radix UI primitives with Tailwind CSS
- **Design System**: Material Design + Linear-inspired aesthetics with dark mode as default
- **State Management**: TanStack Query (React Query) for server state, React Context for authentication state
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

**Key Design Decisions**:
- Bento grid layout using responsive CSS Grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- Component-based architecture with reusable UI widgets (ConsistencyScore, ActivityHeatmap, TimeBlocks, etc.)
- Typography system uses Inter font for UI and body text
- Rounded corners (rounded-2xl) and consistent spacing primitives (8px, 16px, 24px, 32px, 48px)

### Backend Architecture

**Framework**: Express.js server with session-based authentication
- **Rationale**: Lightweight Node.js backend suitable for API-driven single-page applications
- **Session Management**: Express-session with 7-day session duration (604,800 seconds)
- **Authentication**: bcryptjs for password hashing, session-based auth stored server-side
- **API Structure**: RESTful endpoints under `/api/*` namespace

**Core API Endpoints**:
- `/api/auth/*` - Authentication (login, register, logout, session check)
- `/api/tasks` - Task CRUD operations
- `/api/time-blocks` - Time block management
- `/api/daily-logs` - Consistency score and daily log retrieval

**Consistency Score Algorithm**:
- Weighted calculation: 50% task completion + 50% time block adherence
- Fallback to single metric if only tasks or blocks exist
- Streak multiplier based on consecutive days with logs
- Score range: 0-100

### Data Storage

**Database**: PostgreSQL via Neon serverless driver
- **Rationale**: Relational data model suits structured task/time-block relationships with referential integrity
- **ORM**: Drizzle ORM for type-safe database queries and migrations
- **Connection**: WebSocket-based connection pooling for serverless environments

**Schema Design**:
```
users (id, email, password, createdAt)
  ├── tasks (id, userId, title, isCompleted, date, category, priority)
  ├── timeBlocks (id, userId, date, startTime, endTime, label, category, color, isCompleted)
  └── dailyLogs (id, userId, date, consistencyScore, streakDays, tasksCompleted, tasksTotal, blocksCompleted, blocksTotal, notes)
```

**Key Relationships**:
- One-to-many relationships from users to all other tables
- Cascade deletion ensures data cleanup when users are removed
- Date-based partitioning allows efficient daily queries

### Build & Deployment

**Build System**: 
- Vite for frontend bundling with React plugin
- esbuild for server-side bundling with allowlist for critical dependencies
- Dual build outputs: `dist/public` (client) and `dist/index.cjs` (server)

**Development Environment**:
- Hot Module Replacement (HMR) via Vite dev server
- Replit-specific plugins for runtime error overlay and development banner
- TypeScript with strict mode enabled across frontend and backend

## External Dependencies

### UI & Component Libraries
- **Radix UI** (@radix-ui/*): Unstyled, accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- **Shadcn/UI**: Pre-styled components built on Radix with Tailwind CSS
- **Recharts**: Chart library for consistency score trend visualization
- **date-fns**: Date manipulation and formatting

### Backend Services
- **Neon Database** (@neondatabase/serverless): Serverless PostgreSQL with WebSocket support
- **Express.js**: Web server framework
- **bcryptjs**: Password hashing
- **express-session**: Session management with connect-pg-simple for PostgreSQL session storage

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **TypeScript**: Type safety across full stack
- **Vite**: Frontend build tool and dev server
- **esbuild**: Server-side bundling

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation and schema definition
- **@hookform/resolvers**: Zod integration with React Hook Form

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant styling
- **clsx/tailwind-merge**: Conditional class name composition

**Notable Configuration**:
- Database URL must be set via `DATABASE_URL` environment variable
- Session maxAge set to 604,800 seconds (7 days) as per requirements
- Dark mode enabled by default in HTML root element