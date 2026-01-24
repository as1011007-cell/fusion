# Feud Fusion

## Overview

Feud Fusion is a social party game mobile application built with React Native and Expo. The game challenges players to think from diverse cultural perspectives by answering questions about how different demographic groups would respond to various scenarios. The app supports solo play, party mode (local multiplayer), and daily challenges.

The game features a vibrant "Electric Collision" aesthetic with neon accents, perspective bubbles, and game show-inspired visuals. Players earn points based on correct answers, with higher rewards for riskier "answer layers" (Most Common, Most Honest, Most Embarrassing).

## Recent Changes (January 2026)

### Profile System
- Full profile creation with avatar selection and name input
- Photo upload support using expo-image-picker
- Avatar shop with 16 purchasable avatars (free starters to 1000-coin premium)
- Earned coins system for avatar purchases

### Question System
- 28 diverse demographic panels implemented
- 5,500+ total questions (50 variations per template)
- No-repeat question tracking until all answered, persisted in AsyncStorage
- Panels: Gen Z, Desi Parents, Hustlers, Artists, Office Workers, Small Town, Blonde, Elder Sister, Endo Warriors, Millennials, Boomers, Teachers, Nurses, Gamers, Introverts, Extroverts, Pet Parents, Fitness Buffs, Foodies, Remote Workers, New Parents, College Students, Travelers, Music Lovers, Bookworms, Tech Workers, Only Child, Middle Child

### Email/Password Authentication & Cloud Sync (January 2026)
- Email/password registration and login system
- Password reset functionality with 6-character reset codes
- Secure password hashing with bcrypt
- AuthContext manages authentication state with AuthProvider wrapper
- Cloud sync for logged-in users: Save/Load progress to cloud
- Progress includes: profiles, avatars, settings, answered questions, XP
- AuthScreen for login, registration, and password reset flows

### Level & Experience System (January 2026)
- 11 progression titles: Newbie, Rising Star, Contender, Challenger, Champion, Elite, Master, Legend, Icon, Titan, Ultimate
- Exponential XP scaling: 100 * 1.2^(level-1) XP per level
- XP earned on game completion: base 10 XP + score/5
- Level badge displayed below profile picture
- XP progress bar on profile screen
- ProfileContext tracks experiencePoints and calculates levelInfo

### Settings
- Background music toggle
- Haptic feedback toggle
- Question history reset functionality

### Shop System (January 2026)
- Unified Shop screen with 4 tabs: Avatars, Themes, Power-Ups, Premium
- Dual currency system: Coins (for avatars) and Star Points (for themes/power cards)
- 5 purchasable UI themes: Electric Collision (free), Sunset Vibes, Ocean Breeze, Forest Mist, Galaxy Night (1500 stars each)
- Power card bundle purchase: +2 Skip, +2 Steal, +2 Double Bluff for 500 star points
- Premium purchases via Stripe: 5000 Star Points ($5) and Ad-Free Version ($5)
- ThemeContext manages theme selection and purchases with AsyncStorage persistence

### Stripe Integration
- Stripe payments for real-money purchases using stripe-replit-sync
- Backend routes: /api/stripe/products, /api/stripe/create-checkout, /api/stripe/webhook
- Webhook handling for payment confirmation
- Uses expo-web-browser to open Stripe Checkout on mobile

### Multiplayer Mode (January 2026)
- Real-time multiplayer across devices using WebSocket
- Room creation with 6-character join codes
- Room sharing via clipboard copy and native share
- Player lobby with ready status and avatar display
- Host controls for starting game and advancing rounds
- Synchronized question display across all players
- Live answer tracking (shows how many players answered)
- Round-by-round results with scoring
- Final leaderboard with winner announcement
- WebSocket server at /ws/multiplayer path
- MultiplayerContext manages connection state and game sync

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation with native stack navigator for screen transitions
- **State Management**: React Context API (GameContext) for game state, TanStack React Query for server state
- **Animations**: React Native Reanimated for smooth, performant animations throughout the UI
- **Styling**: StyleSheet API with a centralized theme system (GameColors, Typography, Spacing, BorderRadius)
- **Persistence**: AsyncStorage for local game progress and high scores

### Backend Architecture
- **Server**: Express.js running on Node.js
- **API Pattern**: RESTful routes prefixed with `/api`
- **Storage**: Currently using in-memory storage (MemStorage class) with interface designed for easy database migration

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect configured
- **Schema**: Defined in `shared/schema.ts` using Drizzle table definitions
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)

### Project Structure
```
client/           # React Native app code
  components/     # Reusable UI components
  screens/        # Screen components
  navigation/     # Navigation configuration
  context/        # React Context providers
  hooks/          # Custom React hooks
  constants/      # Theme and configuration
  data/           # Static game data (questions)
  lib/            # Utilities (API client, query client)
server/           # Express backend
  routes.ts       # API route definitions
  storage.ts      # Data storage abstraction
  templates/      # HTML templates for web
shared/           # Shared code between client/server
  schema.ts       # Database schema definitions
```

### Key Design Decisions
1. **Monorepo Structure**: Client and server share types via `shared/` directory, enabling type safety across the stack
2. **Path Aliases**: `@/` maps to `./client/` and `@shared/` maps to `./shared/` for clean imports
3. **Dark Theme Default**: App defaults to dark mode with vibrant game colors optimized for the aesthetic
4. **Offline-First Game Data**: Questions stored locally in `client/data/questions.ts` for immediate gameplay without network dependency
5. **Storage Abstraction**: IStorage interface allows swapping between MemStorage and future database implementations

## External Dependencies

### Core Services
- **PostgreSQL**: Primary database (requires DATABASE_URL environment variable)
- **Expo**: Managed workflow for React Native development and builds

### Key npm Packages
- **expo** (^54.0.23): React Native development platform
- **react-navigation**: Navigation library with native stack, bottom tabs
- **drizzle-orm**: TypeScript ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **react-native-reanimated**: Animation library
- **expo-haptics**: Haptic feedback for interactions
- **expo-linear-gradient**: Gradient backgrounds for UI elements
- **@react-native-async-storage/async-storage**: Local data persistence

### Development Configuration
- **TypeScript**: Strict mode enabled with path aliases
- **ESLint**: Using expo config with Prettier integration
- **Babel**: Module resolver for path aliases, Reanimated plugin