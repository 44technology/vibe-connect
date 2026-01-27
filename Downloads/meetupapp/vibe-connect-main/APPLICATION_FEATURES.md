# Vibe Connect Application Features

## Table of Contents
1. [Authentication & Onboarding](#authentication--onboarding)
2. [Home & Discovery](#home--discovery)
3. [Events & Meetups](#events--meetups)
4. [Social Features](#social-features)
5. [Learning & Classes](#learning--classes)
6. [Mentorship](#mentorship)
7. [Venues](#venues)
8. [User Profiles](#user-profiles)
9. [Settings & Preferences](#settings--preferences)
10. [Additional Features](#additional-features)

---

## Authentication & Onboarding

### Welcome Page (`/`)
**Purpose:** Initial landing page for new users

**Features:**
- Animated brand logo (ULIKME mascot) with floating animation
- Brand tagline: "One app to find people, places, and plans"
- "Get Started" button to navigate to onboarding
- "Sign in" link for existing users
- Gradient background with animated blur effects
- Smooth entrance animations for all elements

### Onboarding Page (`/onboarding`)
**Purpose:** Multi-step user registration and profile setup

**Features:**
- **Step 1 - Welcome:** Introduction with Uli mascot character
- **Step 2 - Signup Method:** Choose between Phone Number, Google, or Apple ID
- **Step 3 - Phone Verification:** Enter and verify phone number (automatic OTP)
- **Step 4 - Name:** Enter first and last name
- **Step 5 - Birthday:** Date picker for birth date
- **Step 6 - Gender:** Select from Male, Female, Non-binary, or Prefer not to say
- **Step 7 - Looking For:** Multi-select from 14 options:
  - Friendship, Dating, Networking, Coffee Chats, Workout Buddies, Music Lovers, Gaming, Book Club, Travel, Foodies, Movies, Shopping, Study Partners, Adventure, Nightlife
- **Step 8 - Interests:** Select up to 10 interests from 100+ options including:
  - Coffee & Drinks (Coffee, Wine, Cocktails, Beer, Tea)
  - Sports (Tennis, Basketball, Soccer, Volleyball, Swimming, Surfing, Cycling, Running, Golf, Boxing, Yoga, Fitness, Baseball, Football, Martial Arts, Rock Climbing, Paddleboarding, Kayaking, Diving, Skiing, Snowboarding, Skating, Hiking, CrossFit, Pilates, Dance Fitness)
  - Latin Music & Dance (Reggaeton, Salsa, Bachata, Merengue, Latin Jazz, Cumbia, Tango, Flamenco, Samba, Dembow, Reggae, Dancing, Music, Live Music)
  - Cuisine & Food (Cooking, Italian, Japanese, Mexican, French, Thai, Indian, Chinese, Korean, Mediterranean, Caribbean, Cuban, Peruvian, Brazilian, Spanish, Greek, Seafood, BBQ, Vegan, Vegetarian, Foodie, Fine Dining, Street Food)
  - Other Interests (Travel, Art, Reading, Gaming, Photography, Movies, Theater, Comedy, Networking, Beach, Nightlife, Wellness, Fashion, Technology, Entrepreneurship)
- **Step 9 - Bio:** Write a personal bio/description
- **Step 10 - Photos:** Upload 2-15 photos/videos for profile
- **Step 11 - Selfie Verification:** Take a selfie for account verification
- **Step 12 - Complete:** Success screen with navigation to home

**UI Features:**
- Animated step-by-step progression with Uli mascot guidance
- Smooth transitions between steps
- Form validation
- Progress indicator
- Skip options where applicable

### Login Page (`/login`)
**Purpose:** User authentication for existing users

**Features:**
- Welcome message with Uli mascot
- Three sign-in methods:
  - Phone Number (with OTP verification)
  - Google Sign-In
  - Apple ID Sign-In
- Animated message display
- Automatic navigation to home after successful login
- Error handling and toast notifications

---

## Home & Discovery

### Home Page (`/home`)
**Purpose:** Main dashboard showing personalized events and activities

**Features:**
- **Elegant Header:**
  - Purple dashed accent line
  - "Events" title
  - Search icon button
  - Plus icon button (create new event)

- **Your Activities Section:**
  - Shows meetups where user is host or attendee
  - Event cards display:
    - Square thumbnail image (left)
    - Host name (highlighted in purple if current user)
    - Event title (hover effect to primary color)
    - Date and time (formatted: "Mon, Jan 24" and "2:00 PM" in golden orange)
    - Location with MapPin icon
    - Circular navigation button with arrow icon (right)
  - Empty state when no activities

- **Discover Section:**
  - Shows all other available meetups
  - Same card design as "Your Activities"
  - Filtered to exclude user's own activities

- **Data Logic:**
  - Separates meetups into "Your Activities" and "Discover" based on user participation
  - Custom date/time formatting
  - Responsive card layout

**UI Features:**
- Smooth animations with Framer Motion
- Glassmorphism effects
- Hover interactions
- Empty states with helpful messaging

### Discover Page (`/discover`)
**Purpose:** Browse and search for meetups and venues

**Features:**
- **Search Bar:** Real-time search for vibes or venues
- **Filter Button:** Opens filter dialog with options:
  - Category filter
  - Distance (radius in miles/km)
  - Price range (Free/Paid)
  - Rating filter
- **Tabs:** Switch between "Vibes" and "Venues"
- **Personalization:**
  - Personalized meetup recommendations based on:
    - User behavior and join history
    - Location proximity
    - Time of day
    - User interests
    - Context awareness
- **Quick Access:** Classes & Lessons button with gradient background
- **Meetup Cards:** Display with:
  - Image, title, category
  - Location and distance
  - Date and time
  - Attendee count
  - Join button
- **Venue Cards:** Display with:
  - Image, name, category
  - Rating and review count
  - Distance
  - Price range
  - View details button

**UI Features:**
- Real-time filtering
- Location-based sorting
- Loading states
- Empty states

---

## Events & Meetups

### Create Vibe Page (`/create`)
**Purpose:** Create new meetup events

**Features:**
- **Multi-Step Wizard:**
  - **Step 1 - Category:** Select from Coffee, Dining, Sports, Cinema, Wellness, Activities, Events, Networking, or Custom
  - **Step 2 - Details:**
    - Title input
    - Description textarea
  - **Step 3 - Location:**
    - Search for venues
    - Venue suggestions based on category
    - View venue details (rating, reviews, menu for restaurants)
    - Option to enter custom address
  - **Step 4 - Date & Time:**
    - Date picker
    - Time picker
  - **Step 5 - Settings:**
    - Group size: 1-on-1, 2-4 people, or 4+ people
    - Visibility: Public or Private
    - Pricing: Free or Paid (with price per person input)
    - Optional: Blind meetup toggle (details hidden until 2 hours before)

- **Venue Integration:**
  - Fetches venues from backend
  - Filters venues by category type
  - Shows venue details including:
    - Name, address, city
    - Rating and reviews
    - Phone and website
    - Menu items (for restaurants)
    - Images

**UI Features:**
- Progress indicator
- Step navigation (Next/Back)
- Form validation
- Image upload for meetup cover
- Real-time venue search

### Meetup Detail Page (`/meetup/:id`)
**Purpose:** View detailed information about a specific meetup

**Features:**
- **Hero Section:**
  - Large cover image
  - Title and category badge
  - Blurred title for blind meetups (until 2 hours before)

- **Host Information:**
  - Host avatar and name (clickable to profile)
  - Anonymous display for blind meetups

- **Event Details:**
  - Date and time (formatted)
  - Location (venue name and address)
  - Map integration (if available)
  - Attendee list with avatars
  - Max attendees and current count
  - Description

- **Blind Meetup Features:**
  - Details hidden until 2 hours before event
  - Blurred location and host info
  - Countdown timer
  - Automatic reveal notification

- **Actions:**
  - Join/Leave button
  - Share button
  - Like/Heart button
  - View venue details

- **Campaigns/Promotions:**
  - Display venue campaigns (if applicable):
    - Early Bird Special
    - Group Discount
    - Student Discount
  - Campaign details with discount, time, and applicable days

**UI Features:**
- Responsive image gallery
- Smooth animations
- Loading states
- Error handling

### My Meetups Page (`/my-meetups`)
**Purpose:** View user's created and joined meetups

**Features:**
- **Tabs:**
  - Upcoming: Future meetups
  - Past: Completed meetups

- **Meetup Cards Display:**
  - Cover image
  - "Host" badge for user-created meetups
  - Title
  - Venue name
  - Date and time
  - Attendee count (current/max)
  - Click to view details

- **Filtering:**
  - Automatically separates by date
  - Shows only user's meetups (created or joined)

**UI Features:**
- Empty states for each tab
- Loading indicators
- Smooth card animations

### Surprise Me Page (`/surprise`)
**Purpose:** Discover random meetups with surprise element

**Features:**
- **Dice Roll Animation:**
  - Animated dice rolling effect
  - Random meetup selection from available upcoming meetups

- **Ad Display:**
  - Mandatory 10-second ad after dice roll
  - Countdown timer
  - Cannot skip ad

- **Meetup Display:**
  - Mystery vibe mode (details hidden until 2 hours before)
  - Blurred location and details
  - Date visible (without time)
  - Attendee count shown
  - "Details will be revealed 2 hours before" message

- **Actions:**
  - Roll Again button
  - Join Surprise Vibe button
  - Auto-navigation to meetup detail after join

**UI Features:**
- Smooth dice animation
- Ad overlay with timer
- Mystery reveal animations

---

## Social Features

### Chat Page (`/chat`)
**Purpose:** Direct messaging and group chats

**Features:**
- **Chat List View:**
  - Tabs: All, Friends, Vibes (group chats)
  - Search conversations
  - Chat previews with:
    - Avatar (with online status)
    - Name
    - Last message preview
    - Timestamp
    - Unread count badge
  - Group chat member count

- **Chat View:**
  - Message bubbles (sent/received)
  - Timestamps
  - Image support in messages
  - Real-time message updates via WebSocket
  - Message input with:
    - Text input
    - Voice recording button
    - Send button
  - Online/offline status

- **Blind Meetup Chat:**
  - Anonymous display until 2 hours before meetup
  - Blurred avatars and names
  - Automatic reveal countdown

- **Ready to Meet Feature:**
  - Multi-step dialog:
    1. Select date and time
    2. Choose venue type (Café, Restaurant, Bar, Park, Fitness, Entertainment)
    3. Select specific venue
  - Send meetup request to chat partner
  - Toast notification on success

- **Actions:**
  - Phone call button
  - Video call button
  - More options menu

**UI Features:**
- Real-time message sync
- Smooth scrolling to latest message
- Typing indicators (if implemented)
- Message status indicators

### Connections Page (`/connections`)
**Purpose:** Manage user connections and friend requests

**Features:**
- **Tabs:**
  - Connections: Accepted friends
  - Pending: Sent requests (waiting for response)
  - Requests: Received requests (with badge count)

- **Search Bar:** Filter connections by name

- **Connection Cards:**
  - User avatar
  - Name
  - Connection date ("Connected X ago")
  - Photo grid preview (first 4 photos/videos)
  - Message button
  - Photo count indicator (+X more)

- **Request Cards:**
  - Accept/Reject buttons
  - User info
  - Photo preview

- **Actions:**
  - Accept connection request
  - Reject connection request
  - Start direct chat
  - View user profile

**UI Features:**
- Badge notifications for new requests
- Smooth animations
- Photo/video grid preview
- Loading states

### Life Page (`/life`)
**Purpose:** Instagram Reels-style social feed with vertical scrolling

**Features:**
- **Full-Screen Video/Image Posts:**
  - Vertical scrolling (swipe up/down or mouse wheel)
  - One post at a time
  - Smooth transitions between posts

- **Tabs:**
  - Explore: All posts from all users
  - Friends: Posts from connections only

- **Post Display:**
  - Full-screen image/video
  - User/venue avatar and name
  - Post content text
  - Timestamp
  - Common interests indicator (star emoji if shared interests)
  - Like count and button
  - Comment count and button
  - Share button

- **Actions:**
  - Like posts (with animation)
  - Comment on posts (opens comment modal)
  - Share posts
  - Create new post (opens modal)
  - Close/exit button

- **Comment Modal:**
  - List of comments with user avatars
  - Add comment input
  - Send button
  - Real-time comment updates

- **Create Post Modal:**
  - Text input
  - Camera button
  - Photo library button
  - Location tag button

- **Progress Indicator:**
  - Top progress bar showing current position in feed
  - Navigation dots at bottom

**UI Features:**
- Touch swipe gestures
- Mouse wheel support (throttled)
- Smooth slide animations
- Full-screen immersive experience
- Gradient overlays for text readability

### Social Feed Page (`/social`)
**Purpose:** Traditional social media feed (Instagram-style)

**Features:**
- **Stories Section:**
  - Horizontal scrolling story circles
  - User's own story (with plus icon)
  - Story indicators (gradient border if has story)
  - Click to view story

- **Posts Feed:**
  - User avatar and name
  - Location tag
  - Timestamp
  - Post content text
  - Post image (square aspect ratio)
  - Like button (with count)
  - Comment button (with count)
  - Share button
  - More options menu

- **Create Post Modal:**
  - Text input
  - Camera button
  - Photo library button
  - Location tag button
  - Share button

**UI Features:**
- Like animations
- Smooth scrolling
- Story circle animations

### Venue Posts Page (`/venue-posts`)
**Purpose:** View posts from venues

**Features:**
- **Venue Post Cards:**
  - Venue avatar and name
  - Venue rating (stars)
  - Location
  - Post content
  - Post image
  - Like count and button
  - Comment count and button
  - Share button
  - Timestamp
  - "View" button to venue detail page

**UI Features:**
- Card-based layout
- Like interactions
- Smooth animations

---

## Learning & Classes

### Classes Page (`/classes`)
**Purpose:** Browse and search for classes and lessons

**Features:**
- **Search Bar:** Search classes by title or instructor name
- **Category Filter:** Filter by:
  - All, Tennis, Yoga, Swimming, Golf, Skydiving, Cooking, Dance, Art
- **Filter Dialog:**
  - Price range
  - Distance
  - Rating
  - Show enrolled only toggle

- **Class Cards Display:**
  - Cover image
  - Title
  - Instructor name and avatar
  - Category badge
  - Location and distance
  - Price
  - Duration
  - Next available time
  - Student count
  - Rating

- **Suggestion Feature:**
  - If no search results found, shows "Request This Class" button
  - Dialog to submit class request
  - Description input
  - Category selection
  - Success notification

**UI Features:**
- Real-time filtering
- Loading states
- Empty states with suggestion option
- Smooth card animations

### Class Detail Page (`/class/:id`)
**Purpose:** View detailed information about a specific class

**Features:**
- **Hero Section:**
  - Large cover image
  - Skill and category badges
  - Title
  - Price (with FREE badge if $0)

- **Quick Stats:**
  - Enrolled count
  - Available spots
  - Rating

- **Class Description:**
  - Full description text

- **Venue Information:**
  - Venue name and address
  - Map integration
  - Phone and website links

- **Schedule:**
  - Start date and time
  - End date and time
  - Recurring schedule (if applicable)

- **Instructor Information:**
  - Instructor name and avatar
  - Rating
  - Bio

- **Enrollment:**
  - Enroll button (if not enrolled)
  - Cancel enrollment button (if enrolled)
  - Payment dialog for paid classes:
    - Payment method selection (Card/Cash)
    - Card details form (Card number, Expiry, CVC)
    - Payment processing

- **Enrolled Students:**
  - List of enrolled users with avatars
  - View all button

**UI Features:**
- Payment form validation
- Loading states
- Success/error notifications
- Responsive layout

### My Classes Page (`/my-classes`)
**Purpose:** View user's enrolled classes

**Features:**
- **Tabs:**
  - Upcoming: Future classes
  - Past: Completed classes

- **Class Cards Display:**
  - Cover image
  - Skill badge
  - Title
  - Date (formatted: "Monday, January 24")
  - Time range (start - end)
  - Venue name
  - Schedule info
  - Enrolled indicator (checkmark)
  - Click to view details

- **Empty States:**
  - "No upcoming classes" with browse button
  - "No past classes"

**UI Features:**
- Automatic date-based filtering
- Loading indicators
- Smooth animations

---

## Mentorship

### Mentors Page (`/mentors`)
**Purpose:** Browse and search for mentors and trainers

**Features:**
- **Elegant Design:**
  - Glassmorphism header with subtitle
  - Gradient search bar with hover effects
  - Category chips with gradient backgrounds and animations
  - Stats banner with animated count
  - Smooth animations throughout

- **Search Bar:**
  - Real-time search
  - Clear button
  - Search by name, title, company, bio, or expertise

- **Category Filter:**
  - All, Technology, Business & Entrepreneurship, Finance, Marketing, Design, Career, Leadership
  - Animated category chips with layoutId transitions

- **Expertise Filter Dialog:**
  - Multi-select expertise tags
  - Toggle expertise filters
  - Applied filters display

- **Mentor Cards Display:**
  - Avatar with verification badge
  - Name and title
  - Company name
  - Location
  - Expertise tags
  - Rating and review count
  - Student count
  - Years of experience
  - Click to view details

- **Stats Banner:**
  - Total mentors count (animated)
  - Gradient background with blur effect

- **Suggestion Feature:**
  - If no search results, shows "Request This Mentor" button
  - Dialog to submit mentor request
  - Description input
  - Category selection
  - Loading spinner during submission
  - Success notification

**UI Features:**
- Elegant glassmorphism effects
- Smooth hover animations
- Stagger animations for cards
- Empty state with gradient icon
- Filter dialog with rounded corners and gradients

### Mentor Detail Page (`/mentor/:id`)
**Purpose:** View detailed information about a specific mentor

**Features:**
- **Hero Section:**
  - Cover image (if available)
  - Large avatar with verification badge
  - Name and title
  - Company name
  - Location

- **Quick Stats:**
  - Rating and review count
  - Student count
  - Years of experience

- **Bio Section:**
  - Full biography text

- **Areas of Expertise:**
  - Expertise tags/chips
  - Clickable tags

- **Achievements & Awards:**
  - List of achievements
  - Award icons

- **Available Classes:**
  - List of classes taught by mentor
  - Class cards with:
    - Title and skill
    - Date and time
    - Price
    - Enrolled count
  - "View All Classes" button
  - "Browse All Classes" link

- **Actions:**
  - Share button
  - Contact/Message button (if implemented)

**UI Features:**
- Responsive layout
- Smooth animations
- Loading states
- Empty states

---

## Venues

### Venue Detail Page (`/venue/:id`)
**Purpose:** View detailed information about a venue

**Features:**
- **Hero Section:**
  - Large cover image
  - Venue name
  - Rating and review count
  - Price range
  - Distance
  - Category

- **Tabs:**
  - Overview: General information
  - Menu: Restaurant menu items (if restaurant)
  - Campaigns: Promotions and discounts
  - Posts: Venue's social posts

- **Overview Tab:**
  - Description
  - Address with map
  - Phone number (clickable)
  - Website link
  - Hours of operation
  - Amenities list
  - Photos gallery

- **Menu Tab (Restaurants):**
  - Menu items with:
    - Image
    - Name and description
    - Price
    - Ingredients list
    - Calories
    - Category
  - AR View button (placeholder for 3D/AR menu items)

- **Campaigns Tab:**
  - Active promotions:
    - Happy Hour (50% off drinks and appetizers)
    - Ladies Night (Free entry, 30% off drinks)
    - Student Discount (25% off)
    - Weekend Special (Buy 2 Get 1)
    - Early Bird (20% off before 6 PM)
    - Free Appetizer (with main course)
    - Free Dessert (with orders over $50)
  - Campaign details:
    - Discount amount
    - Description
    - Time range
    - Applicable days
    - Campaign image

- **Posts Tab:**
  - Venue's social media posts
  - Like and comment functionality

- **Actions:**
  - Share button
  - Favorite/Heart button
  - Create vibe at this venue button

**UI Features:**
- Tab navigation
- Image galleries
- Map integration
- AR placeholder (for future implementation)
- Smooth animations

---

## User Profiles

### Profile Page (`/profile`)
**Purpose:** View and edit current user's profile

**Features:**
- **Profile Header:**
  - Large avatar
  - Display name
  - Bio
  - Location
  - Edit button

- **Stats:**
  - Connections count (clickable)
  - Vibes count (clickable)
  - Badges count (clickable)

- **Media Tabs:**
  - All: Photos and videos
  - Photos: Images only
  - Videos: Videos only
  - Grid layout with thumbnails
  - Click to view full screen

- **Interests:**
  - Display selected interests with emojis
  - Edit interests button
  - Interest selection modal with:
    - All available interests from onboarding
    - Search/filter
    - Multi-select
    - Save button

- **Looking For:**
  - Display selected options
  - Edit button

- **Edit Profile Modal:**
  - Display name input
  - First name input
  - Last name input
  - Bio textarea
  - Save button

- **Actions:**
  - Edit profile
  - View connections
  - View my meetups
  - View badges
  - Settings

**UI Features:**
- Image/video viewer with navigation
- Interest selection with search
- Form validation
- Loading states
- Success notifications

### User Profile Page (`/user/:userId`)
**Purpose:** View another user's profile

**Features:**
- **Profile Header:**
  - Large avatar
  - Display name
  - Bio
  - Location
  - Verification badge (if verified)

- **Stats:**
  - Connections count
  - Vibes count
  - Badges count

- **Common Interests Indicator:**
  - Shows shared interests with current user
  - Highlighted interest tags

- **Media Tabs:**
  - All, Photos, Videos
  - Grid layout
  - Click to view full screen

- **Interests:**
  - Display user's interests
  - Common interests highlighted

- **Looking For:**
  - Display user's preferences

- **Connection Status:**
  - "Connect" button (if not connected)
  - "Pending" badge (if request sent)
  - "Accept/Reject" buttons (if request received)
  - "Connected" badge (if already connected)
  - "Message" button (if connected)

- **Actions:**
  - Connect/Send request
  - Accept/Reject request
  - Start chat
  - View connections
  - View user's vibes
  - View user's badges
  - Share profile

**UI Features:**
- Common interests highlighting
- Connection status management
- Smooth animations
- Loading states

### User Connections Page (`/user/:userId/connections`)
**Purpose:** View a user's connections list

**Features:**
- List of user's connections
- Connection cards with:
  - Avatar
  - Name
  - Connection date
- Click to view connection's profile

### User Vibes Page (`/user/:userId/vibes`)
**Purpose:** View a user's created meetups

**Features:**
- List of meetups created by user
- Meetup cards with:
  - Cover image
  - Title
  - Date and time
  - Location
  - Attendee count
- Click to view meetup details

### User Badges Page (`/user/:userId/badges`)
**Purpose:** View a user's earned badges

**Features:**
- Grid of earned badges
- Badge cards with:
  - Badge icon
  - Badge name
  - Description
  - Earned date

---

## Settings & Preferences

### Settings Page (`/settings`)
**Purpose:** Application settings and preferences

**Features:**
- **Account Section:**
  - Edit Profile (navigate to profile page)
  - Email Settings (coming soon)
  - Phone Number (coming soon)
  - Language Selection:
    - English
    - Spanish
    - Dialog with language selection
    - Success notification

- **Privacy Section:**
  - Privacy Settings (coming soon)
  - Notifications (coming soon)

- **Support Section:**
  - Help Center (coming soon)
  - Contact Us (coming soon)

- **Account Actions:**
  - Logout button (with confirmation dialog)
  - Delete Account button (with confirmation dialog)

**UI Features:**
- Sectioned layout
- Confirmation dialogs
- Language change with toast notification
- Smooth transitions

---

## Additional Features

### Badges Page (`/badges`)
**Purpose:** View earned and available badges

**Features:**
- **Stats:**
  - Earned badges count
  - In progress badges count

- **Earned Badges Section:**
  - Grid of earned badges
  - Badge cards with:
    - Icon
    - Name
    - Earned date

- **In Progress Section:**
  - List of badges in progress
  - Progress bars showing completion
  - Current progress / Total required
  - Badge descriptions

**Badge Types:**
- First Vibe (Attended first meetup)
- Social Butterfly (Connected with 10+ people)
- Verified Member (Completed profile verification)
- Vibe Master (Host 10 successful vibes)
- Community Leader (Get 50 connections)
- Regular (Attend vibes 4 weeks in a row)
- Explorer (Visit 20 different venues)
- Quick Connect (Make 5 connections in one vibe)
- Perfect Host (Get 5-star rating as host)

**UI Features:**
- Progress bars with percentages
- Badge icons with colors
- Smooth animations
- Empty states

### NotFound Page (`/*`)
**Purpose:** 404 error page for invalid routes

**Features:**
- Error message
- "Go Home" button
- Navigation back to home page

---

## Global Features

### Language Support
- **Supported Languages:**
  - English (default)
  - Spanish
- **Language Context:**
  - Global language state management
  - Translation function `t()`
  - Persistent language preference (localStorage)
  - Language change affects all pages

### Navigation
- **Bottom Navigation Bar:**
  - Home icon
  - Discover icon
  - Create icon (plus)
  - Chat icon
  - Profile icon
  - Active state indicators
  - Badge notifications (if applicable)

- **Mobile Layout:**
  - Consistent header styling
  - Safe area handling (notch support)
  - Glassmorphism effects
  - Back button navigation

### Authentication Context
- **User State Management:**
  - Current user data
  - Authentication status
  - Login/logout functions
  - User update functions
  - OTP verification
  - Google/Apple sign-in

### Data Fetching
- **React Query Integration:**
  - Caching and refetching
  - Loading states
  - Error handling
  - Optimistic updates

### UI Components
- **Reusable Components:**
  - UserAvatar (with online status, sizes)
  - CategoryChip
  - Button (multiple variants)
  - Input
  - Textarea
  - Dialog/Modal
  - Tabs
  - Toast notifications (Sonner)

### Animations
- **Framer Motion:**
  - Page transitions
  - Component animations
  - Hover effects
  - Layout animations
  - Stagger effects

### Responsive Design
- **Mobile-First:**
  - Optimized for mobile screens
  - Touch-friendly interactions
  - Swipe gestures
  - Responsive layouts

---

## Technical Stack

- **Frontend Framework:** React with TypeScript
- **Routing:** React Router DOM
- **State Management:** React Context API, React Query
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **UI Components:** Custom components (Shadcn/ui-like)
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Date Handling:** date-fns
- **API:** REST API with React Query hooks
- **Real-time:** WebSocket for chat (if implemented)

---

*Last Updated: January 24, 2026*
