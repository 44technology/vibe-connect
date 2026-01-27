# Ulikme Admin Portal

Web-based administrative portal for managing the Ulikme platform.

## Features

- User Management
- Venue Management
- Instructor/Teacher/Mentor Management
- Content Moderation
- Campaign Management
- Analytics & Reporting

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
cd admin-portal
npm install
```

### Development

```bash
npm run dev
```

The admin portal will be available at `http://localhost:3001`

### Build

```bash
npm run build
```

## Project Structure

```
admin-portal/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (Auth, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Layout components
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   └── types/          # TypeScript type definitions
├── public/             # Static assets
└── package.json
```

## Authentication

The admin portal uses role-based access control:

- **Super Admin**: Full access
- **Admin**: Most features
- **Moderator**: Content moderation
- **Support Agent**: Support tickets
- **Analyst**: Read-only analytics

## Environment Variables

Create a `.env` file in the admin-portal directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- React Query
- Tailwind CSS
- Shadcn/ui
- Lucide Icons
