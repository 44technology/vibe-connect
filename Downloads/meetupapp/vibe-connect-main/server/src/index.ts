import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';
import { createServer } from 'http';
import { errorHandler } from './middleware/errorHandler.js';
import { setupSocket } from './socket/chatSocket.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import meetupRoutes from './routes/meetupRoutes.js';
import venueRoutes from './routes/venueRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import classRoutes from './routes/classRoutes.js';
import suggestionRoutes from './routes/suggestionRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import postRoutes from './routes/postRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Setup Socket.io
const io = setupSocket(httpServer);

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8080',
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow Google OAuth domains
    if (origin.includes('accounts.google.com') || origin.includes('googleapis.com')) {
      return callback(null, true);
    }
    
    // In development, allow all local network IPs (for mobile device access)
    if (process.env.NODE_ENV === 'development') {
      // Allow localhost and local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      const isLocalNetwork = 
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(origin);
      
      if (isLocalNetwork) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'ULIKME API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login with email/phone',
        'POST /api/auth/google': 'Google OAuth login',
        'POST /api/auth/apple': 'Apple Sign-In',
        'GET /api/auth/me': 'Get current user (requires auth)',
      },
      users: {
        'GET /api/users': 'Search users (requires auth)',
        'GET /api/users/:userId': 'Get user profile (requires auth)',
        'PUT /api/users': 'Update own profile (requires auth)',
        'POST /api/users/avatar': 'Upload avatar (requires auth)',
      },
      meetups: {
        'GET /api/meetups': 'Get all meetups',
        'GET /api/meetups/nearby': 'Get nearby meetups (query: latitude, longitude, radius)',
        'GET /api/meetups/:id': 'Get meetup details',
        'POST /api/meetups': 'Create meetup (requires auth)',
        'PUT /api/meetups/:id': 'Update meetup (requires auth)',
        'DELETE /api/meetups/:id': 'Delete meetup (requires auth)',
        'POST /api/meetups/:id/join': 'Join meetup (requires auth)',
        'DELETE /api/meetups/:id/leave': 'Leave meetup (requires auth)',
      },
      venues: {
        'GET /api/venues': 'Get all venues',
        'GET /api/venues/nearby': 'Get nearby venues (query: latitude, longitude, radius)',
        'GET /api/venues/:id': 'Get venue details',
        'POST /api/venues': 'Create venue (requires auth)',
        'PUT /api/venues/:id': 'Update venue (requires auth)',
        'DELETE /api/venues/:id': 'Delete venue (requires auth)',
      },
      chats: {
        'GET /api/chats': 'Get all user chats (requires auth)',
        'GET /api/chats/:id': 'Get chat details (requires auth)',
        'GET /api/chats/:id/messages': 'Get chat messages (requires auth)',
        'POST /api/chats/direct': 'Create direct chat (requires auth)',
        'POST /api/chats/group': 'Create group chat (requires auth)',
        'POST /api/chats/:id/messages': 'Send message (requires auth)',
      },
      matches: {
        'GET /api/matches': 'Get all matches (requires auth)',
        'GET /api/matches/:id': 'Get match details (requires auth)',
        'POST /api/matches': 'Create match request (requires auth)',
        'PUT /api/matches/:id': 'Update match status (requires auth)',
      },
      classes: {
        'GET /api/classes': 'Get all classes',
        'GET /api/classes/nearby': 'Get nearby classes (query: latitude, longitude, radius)',
        'GET /api/classes/:id': 'Get class details',
        'POST /api/classes': 'Create class (requires auth, venue owner)',
        'POST /api/classes/:id/enroll': 'Enroll in class (requires auth)',
        'DELETE /api/classes/:id/enroll': 'Cancel enrollment (requires auth)',
      },
      suggestions: {
        'GET /api/suggestions/classes': 'Get class suggestions (query: skill, category)',
        'POST /api/suggestions/classes/request': 'Request a class suggestion (requires auth)',
      },
      auth: {
        'POST /api/auth/otp/send': 'Send OTP to phone number',
        'POST /api/auth/otp/verify': 'Verify OTP and login/register',
      },
      stories: {
        'POST /api/stories': 'Create story (requires auth, multipart/form-data with image)',
        'GET /api/stories': 'Get all active stories (requires auth)',
        'POST /api/stories/:id/view': 'Mark story as viewed (requires auth)',
      },
      posts: {
        'POST /api/posts': 'Create post (requires auth, optional image)',
        'GET /api/posts': 'Get posts (requires auth, query: venueId, meetupId)',
        'POST /api/posts/:id/like': 'Like/unlike post (requires auth)',
        'POST /api/posts/:id/comment': 'Comment on post (requires auth)',
      },
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meetups', meetupRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
    hint: 'Make sure you are using the correct endpoint. All API routes start with /api/',
    availableEndpoints: {
      health: 'GET /health',
      apiInfo: 'GET /api',
      auth: 'POST /api/auth/register, POST /api/auth/login, etc.',
      users: 'GET /api/users, GET /api/users/:id, etc.',
      meetups: 'GET /api/meetups, POST /api/meetups, etc.',
      venues: 'GET /api/venues, POST /api/venues, etc.',
      chats: 'GET /api/chats, POST /api/chats, etc.',
      matches: 'GET /api/matches, POST /api/matches, etc.',
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { io };
