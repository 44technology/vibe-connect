# Price Check App

A React Native Expo app for price comparison and receipt scanning.

## Features

- 📱 Receipt scanning with camera
- 💰 Price tracking and comparison
- 🛒 Shopping history
- 🤖 AI-powered recommendations
- 🌍 Multi-language support (English/Spanish)
- 🔐 User authentication with Supabase

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Supabase:**
   - Create a `.env` file in the root directory
   - Add your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   - Install Expo Go on your mobile device
   - Scan the QR code from the terminal
   - Or press 'w' to open in web browser
   - Web URL: http://localhost:8082

## Project Structure

- `app/` - Expo Router pages
- `contexts/` - React contexts (Auth, Language)
- `lib/` - Supabase configuration
- `supabase/` - Database migrations and functions

## Database Schema

The app uses Supabase with the following main tables:
- `profiles` - User profiles
- `stores` - Store information
- `products` - Product catalog
- `receipts` - Receipt records
- `receipt_items` - Individual items from receipts
- `price_history` - Price tracking
- `shopping_patterns` - User shopping patterns

## Development

- **Lint:** `npm run lint`
- **Type check:** `npm run typecheck`
- **Build web:** `npm run build:web`

## Deployment

### Netlify Deploy

1. **Build the project:**
   ```bash
   npm run build:web
   ```

2. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build:web`
   - Set publish directory: `dist`
   - Add environment variables:
     - `EXPO_PUBLIC_SUPABASE_URL`
     - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
     - `EXPO_PUBLIC_GOOGLE_VISION_API_KEY` (for real OCR)

3. **Environment Variables:**
   - **Supabase:** Get from your Supabase project settings
   - **Google Vision API:** Get from Google Cloud Console
     - Enable Vision API
     - Create API key
     - Add to Netlify environment variables

### Real OCR Setup

To enable real OCR functionality:

1. **Get Google Vision API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Vision API
   - Create credentials (API Key)
   - Restrict the key to Vision API only

2. **Add to Environment:**
   - Add `EXPO_PUBLIC_GOOGLE_VISION_API_KEY` to your environment variables
   - The app will automatically use real OCR when the key is present
   - Without the key, it falls back to mock data for development
