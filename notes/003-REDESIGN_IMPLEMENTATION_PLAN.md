# People Queue App - Redesign Implementation Plan

## Overview
This document outlines the implementation plan for redesigning the People Queue application based on the design specification in `assets/output.txt`.

---

## 1. TYPOGRAPHY SYSTEM

### 1.1 Google Fonts Integration
**Task**: Add Google Fonts links to the application
- **Fonts Required**:
  - Fredoka (Semi-Bold weight: 600)
  - Poppins (Medium: 500, Bold: 700)
- **Implementation**: Add font imports to HTML or create a global CSS file
- **Question**: Does Springboard have a preferred way to include external fonts? Should we use `<link>` tags in the HTML head or `@import` in CSS?

### 1.2 Font Size Variants
**Task**: Define and implement standardized font sizes

#### Fredoka (Headers - Band Names Only)
- **Primary (single-line band name)**: Size TBD based on mockup analysis
- **Secondary (two-line band name)**: Approximately 50px smaller than primary
- **Rule**: NO other Fredoka sizes allowed in the application

#### Poppins (Body Copy)
- **Three size variants total**: Need to determine exact sizes based on mockups
  - Large: "Now Performing!" text
  - Medium: QR descriptions and body text
  - Small: Secondary/helper text
- **Two weights**: Medium (500) and Bold (700)
- **Bold usage**: Reserved for higher-priority body text only

**Questions**:
1. Do we have access to the actual mockup images to measure exact font sizes?
2. Should font sizes be responsive (using clamp/vw) or fixed pixel values for large projected screens?
3. What is the target screen size for projection? (e.g., 1920x1080, 4K?)

---

## 2. COLOR PALETTE

### 2.1 Define Color System
**Task**: Create a centralized color constant/theme file

**Colors from SongDrive Brand Palette**:
- **White Noise**: Primary text color (most frequent) - _HEX value needed_
- **Midnight Cruise**: Accent text for emphasis - _HEX value needed_
- **Bridge Drop**: Accent/background color - _HEX value needed_
- **Melody Mist**: Accent/background color (25% opacity for social button container) - _HEX value needed_
- **Cloud Sync**: SongDrive logo only (select screens) - _HEX value needed_

**Questions**:
1. **CRITICAL**: What are the exact HEX/RGB values for each of these five colors?
2. Should we create a TypeScript constants file (e.g., `src/theme/colors.ts`)?

---

## 3. BACKGROUND IMPLEMENTATION

### 3.1 SVG Background Setup
**Task**: Implement responsive SVG backgrounds

**Files Available**:
- `assets/background.svg` - Main background for all screens
- `assets/Welcome_Screen.svg` - Welcome screen (static)

**Requirements**:
- Scale responsively to all screen sizes/aspect ratios
- Do NOT rasterize
- Mobile: Rotate 90 degrees
- Desktop/Projection: Use as-is

**Implementation Approach**:
- Create a `<BackgroundLayout>` component that wraps content
- Use CSS to position SVG as background
- Use media queries to rotate for mobile

**Questions**:
1. What breakpoint defines "mobile" vs "desktop/projection"? (e.g., < 768px?)
2. Should the background be position: fixed or absolute?

---

## 4. WELCOME SCREEN

### 4.1 Create Welcome Screen Route
**Task**: New route to display static welcome screen before event

**Requirements**:
- Display `Welcome_Screen.svg`
- All text is baked into SVG (no dynamic content)
- No live/dynamic text required

**Questions**:
1. What route path should this use? `/welcome`? Or should this be the default `/` route?
2. Should there be a way to navigate from Welcome to other screens, or is this controlled backstage?
3. Is there a state to track "event has started" vs "pre-event"?

---

## 5. QR CODE SCREEN REDESIGN

### 5.1 Update SignupQRPage Component
**Current**: `src/pages/SignupQRPage.tsx` shows single Google Form QR code
**New**: Dual QR code screen

**Requirements**:
- **Two QR Codes**:
  1. Google Form (sign-up)
  2. SongDrive workspace (upload backing tracks/demos)
- Each QR in white container with description ABOVE (not below)
- QR codes larger than elsewhere in program
- Generous spacing between QR codes (not centered too closely)
- "Need Help Uploading?" help text - **toggleable on/off**
- Can be displayed at any time during event

**State Changes Needed**:
- Add `songDriveWorkspaceUrl: string` to server states
- Add `showHelpText: boolean` to server states
- Add actions: `setSongDriveWorkspaceUrl`, `toggleHelpText`

**Questions**:
1. What should the "Need Help Uploading?" text say exactly?
2. Where is this toggle controlled? (Backstage page?)
3. What's the default state for help text visibility?
4. Do we need different QR code sizes defined as constants?

---

## 6. BAND NAME / QR CODE DISPLAY (PERFORMER DISPLAY)

### 6.1 Redesign DisplayPage Component
**Current**: `src/pages/DisplayPage.tsx`
**Purpose**: Stage display showing current performer

**Requirements**:

#### Layout Elements
1. **SongDrive Logo**: Bottom left, safe margins to prevent cropping
2. **"Now Performing!"**: Largest Poppins size, bold
3. **Band Name**: Fredoka font
   - Single-line: Primary size
   - Two-line: Secondary size (50px smaller) with tighter line spacing
   - Vertically aligned with QR code
4. **QR Code**: Links to `/performer/:id` mobile view
5. **QR Description**: Smaller Poppins, NOT bold, limited to 1 line

#### Visual Priority Order
1. Band name (most prominent)
2. QR code
3. QR description

#### Layout Rules
- All elements identical between short/long names except:
  - Band name line breaks
  - Font size reduction for long names
  - Line spacing tightening for long names
- Long names should occupy approximately same visual space as short names
- NO social icons or handles on this screen (moved to mobile view)

**Questions**:
1. What defines a "long" vs "short" band name? Character count threshold?
2. Should the app auto-detect and apply appropriate sizing, or manual override?
3. What should the QR description text say? "Scan to connect"? "View profile"?
4. Do we have the SongDrive logo file? What format? Where should it be stored?

---

## 7. MOBILE INTERFACE (PERFORMER PROFILE PAGE)

### 7.1 Redesign PerformerProfilePage Component
**Current**: `src/pages/PerformerProfilePage.tsx`
**Purpose**: Mobile view accessed via QR code scan

**Requirements**:

#### Band Name Display
- Same responsive rules as stage display:
  - Long names: Slightly smaller font
  - Reduced line spacing
  - Same overall visual weight

#### Social Link Buttons
- **Container**: Melody Mist color at ~25% opacity background
- **Individual Buttons**: White Noise at ~88% opacity
- **Icons/Text/Arrows**: Midnight Cruise color
- **Arrow Icons**: ~90% opacity (to indicate navigation)
- **Platform Logos**: Use only logos, no app icon backgrounds
- **Limit**: Maximum 3 links per band
- **Consistency**: Maintain consistent button sizing and spacing

#### Visual Hierarchy
- Band Name and SongDrive branding = strongest elements
- Social buttons = secondary

**Questions**:
1. Should we enforce the 3-link maximum in validation, or just in UI design?
2. Where should validation/warning appear if user tries to add more than 3 links?
3. Do arrow icons need to be custom SVGs or can we use existing icon library?
4. Should the background rotate 90 degrees for mobile as specified?

---

## 8. TECHNICAL IMPLEMENTATION TASKS

### 8.1 Create Shared Components

#### `<BackgroundLayout>` Component
- Wraps all pages
- Renders SVG background
- Handles mobile rotation
- File: `src/components/BackgroundLayout.tsx`

#### `<QRCodeDisplay>` Component
- Reusable QR code generator with customizable size
- White container wrapper option
- Description placement (above/below)
- File: `src/components/QRCodeDisplay.tsx`

#### `<Typography>` Component (Optional)
- Enforce font size/weight standards
- Variants: fredoka-primary, fredoka-secondary, poppins-large, poppins-medium, poppins-small
- File: `src/components/Typography.tsx`

### 8.2 Create Theme/Style System

#### Color Constants
- File: `src/theme/colors.ts`
- Export all 5 brand colors with semantic names

#### Typography Constants
- File: `src/theme/typography.ts`
- Export font families, sizes, weights, line heights

#### Spacing/Layout Constants
- File: `src/theme/layout.ts`
- QR code sizes, margins, safe zones

### 8.3 State Management Updates

#### New Server States (in `src/index.tsx`)
```typescript
songDriveWorkspaceUrl: '' as string,
showHelpText: false as boolean,
```

#### New Actions
```typescript
setSongDriveWorkspaceUrl: async (args: { url: string }) => { ... }
toggleHelpText: async (args: { enabled: boolean }) => { ... }
```

### 8.4 Update BackstagePage
- Add controls for new states:
  - SongDrive Workspace URL input
  - Help text toggle switch
- Add navigation to Welcome Screen

---

## 9. ASSET MANAGEMENT

### 9.1 Required Assets
**Current**:
- ✅ `assets/background.svg`
- ✅ `assets/Welcome_Screen.svg`

**Missing** (need to locate or create):
- ❌ SongDrive logo (for DisplayPage bottom left)
- ❌ Platform logos for social links (Instagram, Bandcamp, etc.)
  - Current implementation may be using icon library
  - Spec requires "platform logos only (no app icon backgrounds)"

**Questions**:
1. Do we have the SongDrive logo file? Format? Color variant?
2. Should we use SVG icons from an icon library, or custom logo files?
3. For social platforms, which specific logos are approved?

---

## 10. VALIDATION & CONSTRAINTS

### 10.1 Social Links Validation
- **Enforce**: Maximum 3 social links per participant
- **Where**:
  - `SocialLinksEditor` component
  - `addParticipant` / `updateParticipant` actions (server-side validation)
  - Show warning/error in UI if limit exceeded

### 10.2 Band Name Length Handling
- **Auto-detection**: Determine if name should use single-line or two-line layout
- **Possible approaches**:
  - Character count threshold
  - Measured text width
  - Manual override toggle in backstage

**Questions**:
1. What's the preferred approach for detecting long names?
2. Should there be a character limit for band names?

---

## 11. RESPONSIVE DESIGN STRATEGY

### 11.1 Breakpoints
**Question**: What are the target screen sizes?
- Large projection screen: 1920x1080? 4K?
- Mobile: Portrait orientation, typical phone sizes
- Tablet: Should we support this?

### 11.2 Font Sizing Approach
**Options**:
1. Fixed pixel sizes (better for projection, may not scale)
2. Viewport-based units (vw/vh)
3. CSS clamp() for min/max with fluid scaling
4. Media query breakpoints with fixed sizes

**Question**: Given requirement "must remain clearly legible from a distance on large projected screens", should we use fixed sizes optimized for projection, or responsive scaling?

---

## 12. TESTING STRATEGY

### 12.1 Visual Testing Checklist
- [ ] Typography matches spec (fonts, sizes, weights)
- [ ] Colors match brand palette exactly
- [ ] Background scales properly on different screen sizes
- [ ] Background rotates 90° on mobile
- [ ] QR codes generate correctly and are scannable
- [ ] Long band names wrap/resize appropriately
- [ ] Social buttons limited to 3 max
- [ ] Social button styling matches spec (opacity, colors)
- [ ] SongDrive logo positioned correctly with safe margins

### 12.2 Functional Testing
- [ ] Welcome screen displays correctly
- [ ] QR Code Screen shows both QR codes
- [ ] Help text toggles on/off
- [ ] Display page updates when performer changes
- [ ] Mobile profile page accessible via QR code
- [ ] Social links navigate correctly
- [ ] Backstage controls work for new features

---

## 13. IMPLEMENTATION ORDER (RECOMMENDED)

### Phase 1: Foundation
1. Set up color constants file (BLOCKED: need HEX values)
2. Set up typography constants file (BLOCKED: need exact sizes from mockups)
3. Create BackgroundLayout component
4. Add Google Fonts integration

### Phase 2: Welcome Screen
5. Create WelcomePage component
6. Add route for welcome screen
7. Add backstage navigation to welcome screen

### Phase 3: QR Code Screen Updates
8. Add new server states (songDriveWorkspaceUrl, showHelpText)
9. Add new actions
10. Update SignupQRPage component for dual QR codes
11. Add backstage controls for new settings

### Phase 4: Display Page Redesign
12. Obtain SongDrive logo asset
13. Implement band name responsive sizing logic
14. Redesign DisplayPage layout
15. Add SongDrive logo positioning

### Phase 5: Mobile Profile Page Redesign
16. Update PerformerProfilePage styling
17. Implement social button containers with new styling
18. Add 3-link maximum enforcement
19. Update background for mobile rotation

### Phase 6: Polish & Testing
20. Visual testing against mockups
21. QR code scanning tests
22. Responsive testing on multiple devices
23. Legibility testing on projection screen

---

## 14. CRITICAL QUESTIONS SUMMARY

### Design Assets & Specifications
1. **What are the exact HEX/RGB color values for the 5 brand colors?**

White noise: #FFFFFF
Midnight Cruise: #2D2C80
Bridge Drop: #142A4C
Melody Mist: #ABCED6
Cloud Sync: #59A6DB

2. **Do we have access to the actual mockup images** to measure font sizes precisely?

attached to message

3. **Do we have the SongDrive logo file?** What format and color variant?

Copy /Users/mickmister/code/people-queue/_debug/cloud_gradient_logo.png into ./assets

4. **What are the exact font sizes** for each variant? (Can we extract from mockups?)

do your best to extract from mockups

### Screen & Display
5. **What is the target projection screen resolution?** (1920x1080, 4K, other?)

1080 kiosk tv

6. **What breakpoint defines mobile vs desktop?** (768px, 1024px, other?)

whatever mobile breakpoint usually is

7. **Should fonts be fixed pixel sizes or responsive** (vw/clamp)?

responsive I suppose
note that the kiosk pages will only be displayed on the tv, and mobile pages will only be displayed on the phone
so the individual pages don't need to cater to both screen sizes

### Routing & Navigation
8. **What route should the Welcome Screen use?** (`/`, `/welcome`, other?)

`/`

9. **How is the Welcome Screen dismissed/navigated away from?** (Backstage control, timer, manual?)

when a performer is playing, the root route should show the performer instead of the welcome screen

### Feature Behavior
10. **What is the exact text for the "Need Help Uploading?" help message?**

"Need Help Uploading?"

11. **What should the QR description text say on the Display page?** ("Scan to connect", "View profile", other?)

"Scan to connect"

12. **How should we detect long vs short band names?** (Character count, text width measurement, manual toggle?)

I trust your judgement on this

13. **Should we enforce 3-link maximum via validation** or just UI design guidelines?

yes enforce

### Technical Implementation
14. **Does Springboard have preferences for font loading?** (`<link>` vs `@import` vs other?)

it uses esbuild and @import should be fine in css file

15. **Where should theme/style files be located?** Follow existing Springboard conventions?

in src/styles

---

## 15. RISKS & CONSIDERATIONS

### High Risk
- **Missing color values**: Cannot implement correctly without exact brand colors
- **Font size ambiguity**: Need precise measurements to match mockups
- **Missing SongDrive logo**: Required for DisplayPage, blocks that component

### Medium Risk
- **Long name detection logic**: May need iteration to get right
- **Responsive scaling**: Balance between projection legibility and mobile responsiveness
- **QR code sizing**: Need to ensure scannability at different sizes

### Low Risk
- **Background SVG rotation**: Standard CSS transform
- **Social link limit**: Straightforward validation
- **Google Fonts integration**: Standard implementation

---

## NEXT STEPS

1. **Gather missing information** (answer questions above)
2. **Obtain design assets** (mockup images, logo files, color specs)
3. **Review and approve this plan** with stakeholders
4. **Begin Phase 1 implementation** once all blocking questions answered
