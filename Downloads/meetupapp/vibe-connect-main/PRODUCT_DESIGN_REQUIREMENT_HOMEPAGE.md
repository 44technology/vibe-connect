# Product Design Requirement: Homepage Redesign

## Document Information
- **Version:** 1.0
- **Date:** January 24, 2026
- **Status:** Ready for Development
- **Priority:** High

---

## 1. Overview

### 1.1 Purpose
This document outlines the design requirements for the homepage redesign of the Vibe Connect application. The new design focuses on elegance, clarity, and improved user experience with a clean, minimalist aesthetic.

### 1.2 Design Goals
- Create a clean, elegant, and modern interface
- Improve content hierarchy and readability
- Enhance user engagement with better visual organization
- Implement consistent design language across the application

---

## 2. Design Specifications

### 2.1 Header Section

#### 2.1.1 Layout
- **Position:** Sticky top navigation (z-index: 40)
- **Background:** Pure white background (`bg-background`)
- **Padding:** 16px horizontal, 16px vertical (`px-4 py-4`)

#### 2.1.2 Accent Line
- **Position:** Immediately below status bar
- **Style:** Horizontal dashed line
- **Color:** Primary purple (`border-primary/50`)
- **Height:** 1px (`h-px`)
- **Effect:** Gradient fade from transparent to primary and back to transparent
- **CSS Class:** `bg-gradient-to-r from-transparent via-primary to-transparent border-dashed border-t border-primary/50`

#### 2.1.3 Title
- **Text:** "Events"
- **Font Size:** 3xl (30px)
- **Font Weight:** Bold (700)
- **Color:** Foreground (`text-foreground`)
- **Tracking:** Tight (`tracking-tight`)
- **Position:** Left side of header

#### 2.1.4 Action Icons
- **Position:** Right side of header
- **Spacing:** 12px gap between icons (`gap-3`)
- **Icons:**
  1. **Search Icon**
     - Size: 24px (w-6 h-6)
     - Color: Foreground
     - Hover: Background muted/50
     - Border Radius: xl (12px)
  2. **Plus Icon (Create)**
     - Size: 24px (w-6 h-6)
     - Color: Foreground
     - Hover: Background muted/50
     - Border Radius: xl (12px)
     - Action: Navigate to `/create`

---

## 3. Content Sections

### 3.1 Section Structure

#### 3.1.1 "Your Activities" Section
- **Visibility:** Only shown if user has activities (host or member)
- **Title:** "Your Activities"
- **Font Size:** xl (20px)
- **Font Weight:** Bold (700)
- **Color:** Foreground
- **Chevron:** Right-pointing chevron icon (w-5 h-5)
- **Action:** Navigate to `/my-meetups` on click
- **Spacing:** 16px margin bottom (`mb-4`)

#### 3.1.2 "Discover" Section
- **Title:** "Discover"
- **Font Size:** xl (20px)
- **Font Weight:** Bold (700)
- **Color:** Foreground
- **Chevron:** Right-pointing chevron icon (w-5 h-5)
- **Action:** Navigate to `/discover` on click
- **Spacing:** 16px margin bottom (`mb-4`)

### 3.2 Section Spacing
- **Between Sections:** 32px vertical spacing (`space-y-8`)
- **Content Padding:** 16px horizontal (`px-4`)
- **Bottom Padding:** 24px (`pb-6`)

---

## 4. Event Card Design

### 4.1 Card Layout
- **Layout:** Horizontal flex layout
- **Padding:** 12px (`p-3`)
- **Border Radius:** 2xl (16px) (`rounded-2xl`)
- **Hover Effect:** Background muted/30 (`hover:bg-muted/30`)
- **Transition:** Smooth color transition
- **Cursor:** Pointer
- **Spacing Between Cards:** 12px vertical (`space-y-3`)

### 4.2 Image Thumbnail
- **Position:** Left side
- **Size:** 80px x 80px (w-20 h-20)
- **Border Radius:** xl (12px) (`rounded-xl`)
- **Overflow:** Hidden
- **Fallback:** Gradient background with emoji if no image
  - Gradient: `from-primary/20 to-secondary/20`
  - Emoji Size: 2xl (24px)

### 4.3 Content Area
- **Position:** Right side, flex-1
- **Min Width:** 0 (for text truncation)

#### 4.3.1 Host Name
- **Position:** Top of content
- **Font Size:** sm (14px)
- **Font Weight:** Medium (500)
- **Color:** Primary purple (`text-primary`)
- **Margin:** 4px bottom (`mb-1`)
- **Special Case:** If user is host, display "You" instead of name

#### 4.3.2 Event Title
- **Font Size:** base (16px)
- **Font Weight:** Bold (700)
- **Color:** Foreground
- **Line Clamp:** 1 line (`line-clamp-1`)
- **Margin:** 8px bottom (`mb-2`)
- **Hover:** Change to primary color (`group-hover:text-primary`)

#### 4.3.3 Date & Time Row
- **Layout:** Horizontal flex with gap
- **Font Size:** xs (12px)
- **Color:** Muted foreground (`text-muted-foreground`)
- **Spacing:** 12px gap (`gap-3`)

**Date:**
- **Icon:** Calendar icon (w-3.5 h-3.5)
- **Format:** "25th Nov" (day with suffix + month abbreviation)
- **Format Logic:**
  - 1st, 21st, 31st → "st"
  - 2nd, 22nd → "nd"
  - 3rd, 23rd → "rd"
  - All others → "th"

**Time:**
- **Icon:** Clock icon (w-3.5 h-3.5)
- **Color:** Golden orange (#FF8C00) (`text-[#FF8C00]`)
- **Font Weight:** Semibold (600)
- **Format:** "11:20PM" (12-hour format with AM/PM)

#### 4.3.4 Location Row
- **Layout:** Horizontal flex with gap
- **Font Size:** xs (12px)
- **Color:** Muted foreground
- **Spacing:** 8px gap (`gap-2`)

**Location:**
- **Icon:** Map pin icon (w-3.5 h-3.5)
- **Text:** Location string
- **Line Clamp:** 1 line (`line-clamp-1`)

**Navigation Button:**
- **Position:** Right side (ml-auto)
- **Size:** 24px x 24px (w-6 h-6)
- **Background:** Primary/10 (`bg-primary/10`)
- **Border Radius:** Full (rounded-full)
- **Hover:** Background primary/20 (`group-hover:bg-primary/20`)
- **Icon:** Arrow right (w-3 h-3, text-primary)
- **Action:** Navigate to event detail page

---

## 5. Data Logic

### 5.1 "Your Activities" Filtering
```typescript
// Filter meetups where user is host or member
const yourActivities = meetups.filter((meetup) => {
  const hostId = meetup.host?.id || meetup.creator?.id;
  const isMember = meetup.members?.some(
    (member) => member.user?.id === user.id
  );
  return hostId === user.id || isMember;
}).slice(0, 5); // Limit to 5 items
```

### 5.2 "Discover" Filtering
```typescript
// Exclude user's activities from discover
const yourActivityIds = new Set(yourActivities.map((m) => m.id));
const discoverMeetups = meetups.filter(
  (m) => !yourActivityIds.has(m.id)
).slice(0, 10); // Limit to 10 items
```

### 5.3 Date Formatting
```typescript
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = date.getDate();
  const suffix = 
    day === 1 || day === 21 || day === 31 ? 'st' :
    day === 2 || day === 22 ? 'nd' :
    day === 3 || day === 23 ? 'rd' : 'th';
  return `${day}${suffix} ${date.toLocaleDateString('en-US', { month: 'short' })}`;
};
```

### 5.4 Time Formatting
```typescript
const formatTime = (timeStr?: string) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
};
```

---

## 6. Animations

### 6.1 Card Entrance Animation
- **Type:** Fade in + slide up
- **Initial:** opacity: 0, y: 20
- **Animate:** opacity: 1, y: 0
- **Stagger:** 0.05s delay per card
- **Library:** Framer Motion

### 6.2 Loading State
- **Spinner:** Rotating border animation
- **Size:** 32px x 32px
- **Colors:** Primary/20 border, primary border-top
- **Animation:** 360deg rotation, 1s duration, infinite, linear

### 6.3 Hover Effects
- **Card:** Background color transition
- **Title:** Color change to primary
- **Navigation Button:** Background color change
- **Transition Duration:** Smooth (default)

---

## 7. Color Palette

### 7.1 Primary Colors
- **Primary Purple:** `text-primary` (for host names, accents)
- **Golden Orange:** `#FF8C00` (for time display)
- **Foreground:** Black/dark gray (for titles, main text)
- **Muted Foreground:** Gray (for secondary text)

### 7.2 Background Colors
- **Main Background:** White (`bg-background`)
- **Card Hover:** Muted/30 (`bg-muted/30`)
- **Button Background:** Primary/10 (`bg-primary/10`)
- **Button Hover:** Primary/20 (`bg-primary/20`)

---

## 8. Typography

### 8.1 Font Sizes
- **Page Title:** 3xl (30px)
- **Section Titles:** xl (20px)
- **Event Title:** base (16px)
- **Host Name:** sm (14px)
- **Date/Time/Location:** xs (12px)

### 8.2 Font Weights
- **Page Title:** Bold (700)
- **Section Titles:** Bold (700)
- **Event Title:** Bold (700)
- **Host Name:** Medium (500)
- **Time:** Semibold (600)
- **Other:** Regular (400)

---

## 9. Responsive Behavior

### 9.1 Mobile (Primary)
- **Layout:** Single column
- **Card Layout:** Horizontal (image left, content right)
- **Image Size:** Fixed 80px x 80px
- **Text Truncation:** Enabled for long titles/locations

### 9.2 Tablet (Future)
- Maintain same layout with increased spacing
- Consider 2-column grid for larger screens

---

## 10. Accessibility Requirements

### 10.1 Keyboard Navigation
- All interactive elements must be keyboard accessible
- Focus states clearly visible
- Tab order logical

### 10.2 Screen Readers
- Proper ARIA labels for icons
- Descriptive alt text for images
- Semantic HTML structure

### 10.3 Color Contrast
- Text meets WCAG AA standards (4.5:1 ratio)
- Interactive elements have clear focus states

---

## 11. Edge Cases

### 11.1 Empty States
- **No Activities:** Hide "Your Activities" section
- **No Discover Events:** Show "No events found" message
- **Loading:** Show spinner with "Loading events..." text

### 11.2 Data Handling
- Handle missing images (show gradient fallback)
- Handle missing dates/times (show "TBD" or empty)
- Handle missing locations (show "Location TBD")
- Handle long text (truncate with ellipsis)

### 11.3 User States
- **Not Authenticated:** Show only "Discover" section
- **Authenticated:** Show both sections if applicable

---

## 12. Technical Implementation Notes

### 12.1 Required Dependencies
- React
- Framer Motion (for animations)
- Lucide React (for icons)
- React Router (for navigation)

### 12.2 Component Structure
```
HomePage
├── Header
│   ├── Accent Line
│   ├── Title
│   └── Action Icons
├── Your Activities Section (conditional)
│   └── Event Cards (max 5)
└── Discover Section
    └── Event Cards (max 10)
```

### 12.3 State Management
- Use React hooks (useState, useMemo)
- Filter data client-side for performance
- Cache filtered results with useMemo

---

## 13. Testing Requirements

### 13.1 Visual Testing
- Verify all spacing matches specifications
- Verify colors match design system
- Verify typography matches specifications
- Verify animations are smooth

### 13.2 Functional Testing
- Test filtering logic for "Your Activities"
- Test filtering logic for "Discover"
- Test date/time formatting
- Test navigation on all interactive elements
- Test hover states
- Test loading states
- Test empty states

### 13.3 Cross-Browser Testing
- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 14. Acceptance Criteria

### 14.1 Must Have
- ✅ Header with accent line and action icons
- ✅ "Your Activities" section (when applicable)
- ✅ "Discover" section
- ✅ Event cards with specified layout
- ✅ Date/time formatting as specified
- ✅ Color scheme as specified
- ✅ Animations as specified
- ✅ Responsive design

### 14.2 Nice to Have
- Pull-to-refresh functionality
- Infinite scroll for discover section
- Skeleton loading states
- Error handling with retry

---

## 15. Design References

### 15.1 Visual Style
- Clean, minimalist aesthetic
- Generous white space
- Subtle hover effects
- Elegant typography hierarchy

### 15.2 Inspiration
- Modern event discovery apps
- Clean social media feeds
- Minimalist design systems

---

## 16. Questions & Clarifications

### 16.1 Open Questions
- Should "Your Activities" be limited to 5 items or show all?
- Should there be pagination for "Discover" section?
- Should cards be clickable anywhere or only specific areas?

### 16.2 Assumptions
- User authentication state is available
- Event data includes all required fields
- Images are optimized and cached
- Date/time data is in ISO format

---

## 17. Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-24 | Initial requirement document | Design Team |

---

## 18. Approval

- **Design Lead:** _________________ Date: _______
- **Product Manager:** _________________ Date: _______
- **Tech Lead:** _________________ Date: _______

---

**End of Document**
