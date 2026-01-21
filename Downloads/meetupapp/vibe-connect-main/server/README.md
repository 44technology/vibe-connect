# ULIKME Backend API

Express.js backend server for the ULIKME meetup application with PostgreSQL, Prisma ORM, JWT authentication, Socket.io, and Cloudinary integration.

## Features

- ✅ **PostgreSQL + Prisma ORM** - Type-safe database access
- ✅ **JWT Authentication** - Multiple auth providers (Email, Phone, Google, Apple)
- ✅ **REST API** - Complete CRUD operations for users, meetups, venues, chats, and matches
- ✅ **Socket.io** - Real-time chat functionality
- ✅ **Cloudinary** - Image upload and storage
- ✅ **Geolocation** - Nearby meetups and venues queries
- ✅ **Zod Validation** - Input validation for all endpoints
- ✅ **Error Handling** - Comprehensive error handling middleware

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.io
- **File Upload**: Cloudinary
- **Validation**: Zod

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- Cloudinary account (for image uploads)
- Google OAuth credentials (for Google Sign-In)
- Apple Developer account (for Apple Sign-In)

## Installation

1. **Install dependencies**:
```bash
cd server
npm install
```

2. **Set up environment variables**:
Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ulikme?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY=your-apple-private-key

# CORS
CORS_ORIGIN=http://localhost:5173
```

3. **Set up the database**:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed the database
npm run prisma:seed
```

## Running the Server

**Development mode** (with hot reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email/phone and password
- `POST /api/auth/google` - Google OAuth authentication
- `POST /api/auth/apple` - Apple Sign-In authentication
- `GET /api/auth/me` - Get current user profile (requires auth)

### Users (`/api/users`)

- `GET /api/users` - Search users
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users` - Update own profile (requires auth)
- `POST /api/users/avatar` - Upload avatar (requires auth)

### Meetups (`/api/meetups`)

- `GET /api/meetups` - Get all meetups
- `GET /api/meetups/nearby` - Get nearby meetups (query: latitude, longitude, radius, limit)
- `GET /api/meetups/:id` - Get meetup details
- `POST /api/meetups` - Create meetup (requires auth)
- `PUT /api/meetups/:id` - Update meetup (requires auth, creator only)
- `DELETE /api/meetups/:id` - Delete meetup (requires auth, creator only)
- `POST /api/meetups/:id/join` - Join a meetup (requires auth)
- `DELETE /api/meetups/:id/leave` - Leave a meetup (requires auth)

### Venues (`/api/venues`)

- `GET /api/venues` - Get all venues
- `GET /api/venues/nearby` - Get nearby venues (query: latitude, longitude, radius, limit)
- `GET /api/venues/:id` - Get venue details
- `POST /api/venues` - Create venue (requires auth)
- `PUT /api/venues/:id` - Update venue (requires auth)
- `DELETE /api/venues/:id` - Delete venue (requires auth)

### Chats (`/api/chats`)

- `GET /api/chats` - Get all user's chats (requires auth)
- `GET /api/chats/:id` - Get chat details and messages (requires auth)
- `GET /api/chats/:id/messages` - Get chat messages (requires auth)
- `POST /api/chats/direct` - Create direct chat (requires auth)
- `POST /api/chats/group` - Create group chat (requires auth)
- `POST /api/chats/:id/messages` - Send message (requires auth)

### Matches (`/api/matches`)

- `GET /api/matches` - Get all matches (requires auth)
- `GET /api/matches/:id` - Get match details (requires auth)
- `POST /api/matches` - Create a match request (requires auth)
- `PUT /api/matches/:id` - Update match status (accept/reject) (requires auth)

## Socket.io Events

### Client → Server

- `join-chats` - Join all chat rooms for the user
- `join-chat` - Join a specific chat room
- `send-message` - Send a message to a chat
- `mark-read` - Mark messages as read
- `typing` - Send typing indicator

### Server → Client

- `new-message` - New message received
- `messages-read` - Messages marked as read
- `user-typing` - User typing indicator
- `joined-chat` - Successfully joined a chat
- `error` - Error occurred

### Socket Connection

Connect to Socket.io with authentication:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

## Database Schema

The Prisma schema includes the following models:

- **User** - User accounts with authentication
- **Meetup** - Meetup events
- **Venue** - Venue locations
- **MeetupMember** - Many-to-many relationship between users and meetups
- **Chat** - Chat rooms (direct or group)
- **ChatMember** - Many-to-many relationship between users and chats
- **Message** - Chat messages
- **Match** - User matches/connections

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // For validation errors
}
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## File Uploads

Image uploads are handled via multipart/form-data. Supported formats: JPG, JPEG, PNG, GIF, WEBP. Max file size: 5MB.

## Geolocation Queries

Nearby queries use the Haversine formula to calculate distances. Provide `latitude`, `longitude`, and optional `radius` (in kilometers) and `limit` parameters.

## Development

### Project Structure

```
server/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── cloudinary.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── meetupController.ts
│   │   ├── venueController.ts
│   │   ├── chatController.ts
│   │   └── matchController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── validateRequest.ts
│   │   └── validateQuery.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── meetupRoutes.ts
│   │   ├── venueRoutes.ts
│   │   ├── chatRoutes.ts
│   │   └── matchRoutes.ts
│   ├── socket/
│   │   └── chatSocket.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── geolocation.ts
│   │   └── upload.ts
│   ├── validations/
│   │   ├── userValidation.ts
│   │   ├── meetupValidation.ts
│   │   ├── venueValidation.ts
│   │   ├── chatValidation.ts
│   │   └── matchValidation.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## License

ISC
