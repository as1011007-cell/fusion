# Feud Fusion - App Store Submission Guide

## App Information

**App Name**: Feud Fusion: What Would They Say?

**Subtitle**: Think Like Someone Else

**Category**: Games > Trivia / Party

**Age Rating**: 12+ (Infrequent/Mild Mature Themes - diverse cultural perspectives)

---

## App Description

### Short Description (80 characters)
Guess how different groups think in this hilarious social party game!

### Full Description

**Think you know what others would say? Prove it!**

Feud Fusion challenges you to step outside your own perspective and guess how different groups of people would respond to hilarious, thought-provoking questions.

**FEATURES:**

**28 Unique Demographic Panels**
From Gen Z to Boomers, Desi Parents to Gamers, Artists to Office Workers - each group thinks differently. Can you get inside their heads?

**Three Risk Levels**
- Most Common: Play it safe with the popular answer
- Most Honest: Dig deeper for the real response  
- Most Embarrassing: High risk, high reward!

**Multiple Game Modes**
- Solo Play: Test your perspective-reading skills
- Party Mode: Pass the phone and compete with friends
- Online Multiplayer: Create rooms and play with friends anywhere!
- Daily Challenge: Fresh questions every day

**Real-Time Multiplayer**
- Create private game rooms with 6-character codes
- Share room codes via text, social media, or QR
- Live lobby chat while waiting for players
- See everyone's answers in real-time
- Play again together without leaving the room!

**Earn & Customize**
- Collect coins and star points as you play
- Unlock 16 unique avatars
- Choose from 5 stunning visual themes
- Power up with Skip, Steal, and Double Bluff cards

**Cloud Save**
Create an account to sync your progress, avatars, and purchases across all your devices!

**5,500+ Questions**
Our massive question library ensures you'll never see the same question twice!

---

## Keywords

feud, trivia, party game, perspective, social game, family feud, guess, survey, multiplayer, thinking game

---

## What's New (Version 1.0.0)

Welcome to Feud Fusion! This is our launch version featuring:
- 28 demographic panels with unique perspectives
- 5,500+ diverse questions
- Solo, Party, Daily Challenge, and Online Multiplayer modes
- Real-time multiplayer with private rooms and lobby chat
- Email/password accounts with cloud sync
- Avatar shop with 16 collectible avatars
- 5 visual themes to customize your experience
- Power cards: Skip, Steal, and Double Bluff
- Level and XP progression system

---

## Screenshots Needed

1. **Home Screen** - Show the main menu with Play Now, Party Mode, Daily Challenge buttons
2. **Panel Selection** - Display the carousel of demographic panels
3. **Gameplay** - Active question with answer options and timer
4. **Results** - Score reveal with points earned
5. **Shop** - Avatar or theme selection screen
6. **Profile** - Player stats and avatar display

**Screenshot Sizes Required:**
- iPhone 6.7" (1290 x 2796)
- iPhone 6.5" (1284 x 2778)
- iPhone 5.5" (1242 x 2208)
- iPad Pro 12.9" (2048 x 2732)
- Android Phone (1080 x 1920 or 1440 x 2560)

---

## Privacy Policy

**Privacy Policy URL**: `https://YOUR-REPLIT-DOMAIN/privacy`

After publishing, your privacy policy will be available at your app's domain + `/privacy`

The privacy policy page is already created and includes:
- What data is collected
- How data is processed
- Payment processing (Stripe)
- User rights
- Contact information

---

## Support

**Support Email**: support@feudfusion.app

The `/support` route redirects to this email address.

---

## App Store Icon Requirements

**iOS:**
- 1024 x 1024 px (App Store)
- No transparency, no rounded corners (Apple adds these)

**Android:**
- 512 x 512 px (Google Play)
- Foreground: 108 x 108 dp (safe zone for adaptive icons)
- Background color: #0A0E27

**Icon files are ready at:**
- `assets/images/icon.png` (main icon)
- `assets/images/splash-icon.png` (splash screen)

---

## Pricing

**Base App**: Free

**In-App Purchases:**
- 5,000 Star Points: $5.99
- Ad-Free Version: $5.99
- Support the Developer (Coffee Tip): $3.99

---

## In-App Purchase Configuration

### iOS App Store Connect Product IDs

Create these products in App Store Connect > Your App > In-App Purchases:

| Product Name | Product ID | Type | Price Tier |
|--------------|------------|------|------------|
| 5000 Star Points | `com.feudfusion.starpoints5000` | Consumable | Tier 6 ($5.99) |
| Ad-Free Version | `com.feudfusion.adfree` | Non-Consumable | Tier 6 ($5.99) |
| Support Developer | `com.feudfusion.support` | Consumable | Tier 4 ($3.99) |

**Setup Instructions:**

1. Go to App Store Connect > Apps > Your App
2. Click "In-App Purchases" under Monetization in the sidebar
3. Click the "+" button to create each product
4. For each product:
   - **Reference Name**: Internal name (e.g., "Star Points 5000")
   - **Product ID**: Use the exact ID from the table above (must match code)
   - **Type**: Consumable or Non-Consumable as specified
   - **Price**: Select from Apple's price tiers
   - **Localization**: Add display name and description in each supported language
   - **Review Screenshot**: Add a screenshot showing where the purchase appears in app
5. Submit products for review with your app binary

**Important Notes:**
- Product IDs must match exactly between App Store Connect and `client/services/StoreKitService.ts`
- Test purchases using Sandbox tester accounts before submission
- In-app purchases are reviewed together with the app binary
- Apple takes 30% commission (15% for Small Business Program members)

### Google Play Billing Product IDs

For Google Play, create matching products in Google Play Console > Monetization > In-app products:

| Product Name | Product ID | Type |
|--------------|------------|------|
| 5000 Star Points | `starpoints5000` | Managed Product |
| Ad-Free Version | `adfree` | Managed Product |
| Support Developer | `support` | Managed Product |

**Note:** Google Play uses shorter product IDs without the bundle identifier prefix.

---

---

## Google Play Store Specific

### Data Safety Declaration

When filling out the Data Safety form in Google Play Console, provide:

**Data collected:**
- Email address (Account management, Authentication)
- Name/Username (Profile display, Multiplayer)
- Purchase history (In-app purchases via Stripe)
- Game progress (Cloud sync)

**Data NOT collected:**
- Location
- Device identifiers for advertising
- Contacts
- Photos/Videos (except optional profile photo upload)

**Data sharing:**
- Payment data shared with Stripe for processing purchases
- No data sold to third parties

**Data security:**
- Data encrypted in transit (HTTPS)
- Passwords hashed with bcrypt
- Users can delete their account and data

### Content Rating (IARC)

When completing the content rating questionnaire:
- No violence or gore
- No sexual content
- No profanity (user-generated chat in multiplayer - moderate)
- No controlled substances
- No gambling with real money
- Interactive elements: Users Interact (multiplayer chat)
- In-app purchases: Yes

**Expected rating:** PEGI 3 / Everyone

### Store Listing Graphics

**Feature Graphic** (required): 1024 x 500 px
- Display the app name "Feud Fusion" with colorful demographic bubbles
- Use brand colors: Dark blue (#0A0E27), Magenta (#FF2E93), Cyan (#00D4FF)

**Phone Screenshots**: 1080 x 1920 px minimum (16:9 or taller)
- Minimum 2, maximum 8
- Recommended: 4-6 screenshots showing key features

**7-inch Tablet**: 1080 x 1920 px (optional)
**10-inch Tablet**: 1200 x 1920 px (optional)

---

## Building for Google Play

### Using EAS Build (Expo Application Services)

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configure EAS** (run in project root):
   ```bash
   eas build:configure
   ```

3. **Build Android App Bundle (AAB)**:
   ```bash
   eas build --platform android --profile production
   ```

4. **Download the AAB** from the Expo dashboard after build completes

5. **Upload to Google Play Console**:
   - Go to Google Play Console > Your App > Release > Production
   - Create new release and upload the AAB file
   - Fill in release notes from "What's New" section above

### App Signing

- Google Play uses App Signing by Google Play (recommended)
- EAS handles the upload key automatically
- First upload will establish your app's signing key

---

## Checklist Before Submission

### Developer Accounts
- [ ] Set up Google Play Developer Account ($25 one-time fee)
- [ ] Set up Apple Developer Account ($99/year) - for iOS

### App Content
- [ ] Privacy policy page is live and accessible
- [ ] Test all game modes work correctly
- [ ] Test multiplayer with multiple devices
- [ ] Test in-app purchases in test mode
- [ ] Verify cloud sync works

### Store Listing
- [ ] Prepare app icon (512 x 512 px)
- [ ] Create feature graphic (1024 x 500 px)
- [ ] Take 4-6 phone screenshots
- [ ] Write short description (80 chars max)
- [ ] Write full description (4000 chars max)

### Google Play Specific
- [ ] Complete Data Safety form
- [ ] Complete Content Rating questionnaire
- [ ] Set up pricing (Free with in-app purchases)
- [ ] Configure Stripe for production payments
- [ ] Select target countries/regions

### Build & Submit
- [ ] Build production AAB with EAS
- [ ] Upload to Google Play Console
- [ ] Submit for review

---

## Next Steps

1. **Create Google Play Developer Account**: https://play.google.com/console/signup ($25 one-time)
2. **Publish your app on Replit** to get your live domain for privacy policy URL
3. **Run EAS build** to generate the AAB file
4. **Upload to Google Play Console** and complete the store listing
5. **Submit for review** (typically 1-7 days)
