# FEUD FUSION: Design Guidelines

## Brand Identity

**Purpose**: A social party game that challenges players to think from diverse cultural perspectives, not their own.

**Aesthetic Direction**: **Electric Collision** - High contrast, neon-accented, chaotic-fun. Think game show meets street culture meets psychology lab. The visual language should feel ALIVE and UNPREDICTABLE, like opinions colliding in real-time.

**Memorable Element**: Dynamic "perspective bubbles" - animated orbs representing each cultural group that pulse, merge, and clash during gameplay. These aren't just decorative; they're the visual heartbeat of the game.

---

## Navigation Architecture

**Root Navigation**: Stack-based with modal overlays for game rounds.

**Screen Flow**:
1. **Splash** → **Home** → **Game Setup** → **Active Round** → **Results** → **Leaderboard**
2. **Drawer** (swipe from left): Profile, Friends, Power Cards Store, Settings, Tutorial

**No Authentication Required** (local multiplayer focus with optional cloud save for progression)

---

## Screen-by-Screen Specifications

### 1. Home Screen
**Purpose**: Gateway to game modes, daily challenges, and social features.

**Layout**:
- Header: Transparent, profile avatar (top-left), coin balance + settings (top-right)
- Main: Non-scrollable center-focused layout
  - Large animated logo with perspective bubbles floating around it
  - 3 primary action buttons stacked vertically (PLAY NOW, PARTY MODE, DAILY CHALLENGE)
  - Floating notification badge for friend challenges (bottom-right)
- Safe Area: Top = headerHeight + 24px, Bottom = 24px

**Components**: Large CTAs with glow effects, animated background particles

---

### 2. Game Setup Screen
**Purpose**: Select panel, difficulty, and start game.

**Layout**:
- Header: Custom header with back button (left), "CHOOSE YOUR FEUD" title (center)
- Main: Scrollable vertical list
  - Panel selector: Horizontal carousel of perspective cards (Gen Z, Desi Parents, Hustlers, etc.)
  - Layer strategy toggle: 3 chips (Most Common, Most Honest, Most Embarrassing) with risk indicators
  - Player count selector (if multiplayer)
  - START FEUD button (bottom, fixed)
- Safe Area: Top = 24px, Bottom = 80px (fixed button height + 24px)

**Components**: Swipeable cards, toggle chips, progress dots

---

### 3. Active Round Screen
**Purpose**: Display question, accept answers, show live scoring.

**Layout**:
- Header: Minimal, timer (top-center), panel icon (top-left), score (top-right)
- Main: Non-scrollable
  - Question card (top 30%, bold text, panel context)
  - Answer input field or multiple choice buttons (middle 40%)
  - Power card dock (bottom 20%, horizontal scroll)
  - Floating "SUBMIT" button (bottom-right)
- Safe Area: Top = headerHeight + 16px, Bottom = 80px

**Components**: Animated timer ring, pulsing power cards, haptic feedback on submit

---

### 4. Results Screen
**Purpose**: Reveal answers, show scoring breakdown, build tension.

**Layout**:
- Header: None (full-screen modal)
- Main: Scrollable results animation
  - Chosen layer reveal (Most Common/Honest/Embarrassing)
  - Answer flip cards with perspective bubble animations
  - Points earned with celebratory particles
  - "NEXT ROUND" button (bottom)
- Safe Area: Top = 40px, Bottom = 80px

**Components**: Staggered reveal animations, confetti/particle effects, sound cues

---

### 5. Party Mode Lobby
**Purpose**: Assign team roles, explain rules, build anticipation.

**Layout**:
- Header: "PARTY MODE" title, exit button (top-right)
- Main: Scrollable
  - Connected players list with assigned roles (Talker, Whisperer, Saboteur)
  - Role explanation cards
  - House rules toggles
  - "START CHAOS" button (fixed bottom)
- Safe Area: Top = headerHeight + 24px, Bottom = 80px

**Components**: Player avatars with role badges, animated role icons

---

### 6. Profile/Settings Drawer
**Purpose**: Manage profile, view stats, access store.

**Layout**:
- Scrollable vertical list
  - User avatar (editable, large)
  - Display name
  - Win/loss stats
  - Power cards inventory
  - Theme toggle (Light/Dark/Neon)
  - Notifications, privacy, tutorial access

**Components**: Avatar picker modal, stats visualizations

---

## Color Palette

**Primary**: #FF006E (Hot Pink) - Bold, unapologetic, attention-grabbing
**Secondary**: #00F5FF (Electric Cyan) - Energy, fusion, digital
**Accent**: #FFD700 (Gold) - Rewards, correct answers
**Background Dark**: #0A0E27 (Deep Navy) - Premium feel, contrast base
**Background Light**: #F8F9FA (Off-white) - Clean, breathable
**Surface**: #1C1F3A (Midnight Blue) - Cards, panels
**Text Primary**: #FFFFFF (White)
**Text Secondary**: #A0A8C0 (Cool Gray)
**Semantic Colors**:
- Correct: #00FF87 (Neon Green)
- Wrong: #FF0044 (Crimson Red)
- Warning: #FFAA00 (Amber)

**Usage**: Dark mode default. Perspective bubbles use gradient blends of Primary/Secondary. Power cards glow with their assigned colors.

---

## Typography

**Primary Font**: **Poppins** (Google Font) - Bold, geometric, modern
**Secondary Font**: **Inter** (Google Font) - Clean, legible for body text

**Type Scale**:
- Display (Questions): Poppins Bold, 28px
- Title (Panels, Headers): Poppins SemiBold, 20px
- Body (Answers, Descriptions): Inter Regular, 16px
- Caption (Hints, Scores): Inter Medium, 12px
- Button: Poppins Bold, 18px, uppercase

---

## Visual Design

**Touchable Feedback**: Scale animation (0.95) + color shift on press
**Floating Buttons** (Submit, Next Round):
- Shadow: offset (0, 2), opacity 0.10, radius 2
- Border radius: 16px
- Background: Linear gradient (Primary to Secondary)

**Icons**: Feather icons from @expo/vector-icons for UI controls
**NO emojis** - use custom perspective bubble illustrations instead

---

## Assets to Generate

**REQUIRED**:
1. **icon.png** - Hot pink/cyan fusion logo with perspective bubbles colliding
2. **splash-icon.png** - Same as icon.png but optimized for splash screen
3. **empty-challenges.png** - Illustration of lone perspective bubble waiting for player (USED: Daily Challenge empty state)
4. **empty-friends.png** - Two bubbles with question marks between them (USED: Friends list empty state)

**RECOMMENDED**:
5. **avatar-gen-z.png** - Stylized Gen Z representative avatar (USED: Panel selection, results)
6. **avatar-desi-parents.png** - Stylized Desi Parents avatar (USED: Panel selection)
7. **avatar-hustlers.png** - Hustler archetype avatar (USED: Panel selection)
8. **avatar-artists.png** - Artist archetype avatar (USED: Panel selection)
9. **power-card-mute.png** - Icon for Mute power card (USED: Power card dock)
10. **power-card-steal.png** - Icon for Steal power card (USED: Power card dock)
11. **power-card-bluff.png** - Icon for Double Bluff power card (USED: Power card dock)
12. **onboarding-perspective.png** - Illustration showing multiple bubbles merging (USED: Tutorial first screen)
13. **celebration-confetti.png** - Particle burst for correct answers (USED: Results screen)

**Asset Style**: Geometric, high-contrast, neon-outlined. Match the electric collision aesthetic. Avatars should be diverse, stylized, NOT realistic.