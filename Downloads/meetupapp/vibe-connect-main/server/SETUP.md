# Setup Guide

## Quick Start

1. **Install dependencies**:
```bash
npm install
```

2. **Set up PostgreSQL database**:
   - Create a new PostgreSQL database named `ulikme`
   - Update the `DATABASE_URL` in `.env`

3. **Configure environment variables**:
   - Copy the example below and create a `.env` file
   - Fill in all required values

4. **Initialize database**:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed  # Optional: seed with test data
```

5. **Start the server**:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the `server` directory with the following:

```env
# Server
PORT=5000
NODE_ENV=development

# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/ulikme?schema=public"

# JWT - Generate a strong random secret
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d

# Cloudinary - Get from https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth - Get from https://console.cloud.google.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple Sign-In - Get from Apple Developer Portal
APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY=your-apple-private-key

# CORS - Your frontend URL
CORS_ORIGIN=http://localhost:5173
```

## Database Setup

### Using Docker (Recommended)

```bash
docker run --name ulikme-postgres \
  -e POSTGRES_USER=ulikme \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ulikme \
  -p 5432:5432 \
  -d postgres:15
```

### Manual Setup

1. Install PostgreSQL
2. Create a database:
```sql
CREATE DATABASE ulikme;
```

3. Update `DATABASE_URL` in `.env`

## Cloudinary Setup

1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to `.env`

## Google OAuth Setup

1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs
6. Copy Client ID and Client Secret to `.env`

## Apple Sign-In Setup

1. Go to Apple Developer Portal
2. Create an App ID with Sign in with Apple capability
3. Create a Service ID
4. Generate a private key
5. Add credentials to `.env`

## Testing the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Ensure database exists

### Prisma Issues
- Run `npm run prisma:generate` after schema changes
- Run `npm run prisma:migrate` to apply migrations

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process using port 5000

### Cloudinary Upload Fails
- Verify credentials in `.env`
- Check file size (max 5MB)
- Ensure file format is supported (JPG, PNG, GIF, WEBP)
