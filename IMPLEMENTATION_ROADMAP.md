# People Queue App - Redesign Implementation Roadmap

## Executive Summary

All critical questions have been answered. This roadmap provides a complete step-by-step implementation plan with mockups, color values, and design assets ready.

---

## Design System Specifications

### Colors (SongDrive Brand Palette)
```typescript
White Noise: #FFFFFF      // Primary text
Midnight Cruise: #2D2C80  // Accent text/icons
Bridge Drop: #142A4C      // Accent/background
Melody Mist: #ABCED6      // Social button backgrounds (25% opacity)
Cloud Sync: #59A6DB       // SongDrive logo only
```

### Typography
- **Fredoka (Semi-Bold 600)**: Band names only
  - Primary: Single-line names
  - Secondary: Two-line names (50px smaller, tighter line spacing)
- **Poppins**:
  - Large (Bold 700): "Now Performing!"
  - Medium (Bold 700): QR descriptions, button text
  - Small (Medium 500): Helper text, descriptions

### Screen Targets
- **Projection**: 1080p kiosk TV (fixed context, no responsive needed)
- **Mobile**: Phone portrait (fixed context, no responsive needed)
- **Breakpoint**: Standard mobile breakpoint (~768px)

### Font Loading
- Use CSS `@import` (esbuild compatible)
- Google Fonts: Fredoka (600), Poppins (500, 700)

---

## Assets Inventory

✅ **Available**:
- `assets/background.svg` - Main background
- `assets/Welcome_Screen.svg` - Static welcome screen
- `assets/cloud_gradient_logo.png` - SongDrive logo
- `assets/Welcome Screen.png` - Mockup
- `assets/QR Code Screen.png` - Mockup
- `assets/Short Band Name Screen.png` - Mockup
- `assets/Longer Band Name Screen.png` - Mockup
- `assets/Short Band Mobile Screen.png` - Mockup
- `assets/Long Band Mobile Screen.png` - Mockup

---

## Implementation Phases

### Phase 1: Foundation & Theme System
**Goal**: Set up styling infrastructure

#### 1.1 Create Theme Files
- [ ] `src/styles/colors.ts` - Brand color constants
- [ ] `src/styles/typography.ts` - Font definitions and sizes
- [ ] `src/styles/fonts.css` - Google Fonts import
- [ ] `src/styles/layout.ts` - Spacing, QR sizes, margins

#### 1.2 Analyze Mockups for Font Sizes
- [ ] Measure font sizes from mockup images
- [ ] Define exact px values for each typography variant
- [ ] Document line heights and letter spacing

#### 1.3 Create BackgroundLayout Component
- [ ] `src/components/BackgroundLayout.tsx`
- [ ] SVG background positioning
- [ ] No rotation needed (kiosk vs mobile are separate pages)

**Deliverable**: Complete theme system ready for use

---

### Phase 2: Welcome Screen
**Goal**: Create pre-event landing screen

#### 2.1 Create WelcomePage Component
- [ ] `src/pages/WelcomePage.tsx`
- [ ] Display `Welcome_Screen.svg` (static, no dynamic content)
- [ ] Route: `/`

#### 2.2 Update Root Route Logic
- [ ] If `currentPerformerId` is set → show DisplayPage
- [ ] If `currentPerformerId` is null → show WelcomePage
- [ ] Modify `src/index.tsx` route handler

**Deliverable**: Welcome screen shows before event starts

---

### Phase 3: QR Code Screen (Dual QR)
**Goal**: Update signup screen with two QR codes

#### 3.1 State Management
- [ ] Add `songDriveWorkspaceUrl: string` to states
- [ ] Add `showHelpText: boolean` to states (default: false)
- [ ] Add action: `setSongDriveWorkspaceUrl`
- [ ] Add action: `toggleHelpText`

#### 3.2 Create QRCodeDisplay Component
- [ ] `src/components/QRCodeDisplay.tsx`
- [ ] Props: url, size, description, descriptionPosition
- [ ] White rounded container
- [ ] Description above QR code

#### 3.3 Update SignupQRPage
- [ ] Display two QRCodeDisplay components side-by-side
- [ ] Left: Google Form QR ("Sign up to perform tonight")
- [ ] Right: SongDrive Workspace QR ("Upload backing tracks & demos")
- [ ] Conditional "Need Help Uploading?" text below
  - Text: "Need Help Uploading? Please talk to Michael at (location)"
- [ ] Larger QR codes than elsewhere
- [ ] Generous spacing between QRs

#### 3.4 Backstage Controls
- [ ] Add SongDrive Workspace URL input
- [ ] Add "Show Help Text" toggle
- [ ] Update BackstagePage component

**Deliverable**: Dual QR code screen with toggleable help text

---

### Phase 4: Display Page (Stage View)
**Goal**: Redesign performer display for projection screen

#### 4.1 Layout Structure
Based on mockups:
- [ ] Blue gradient background (using background.svg)
- [ ] Top left: "Now Performing!" (Poppins Large Bold)
- [ ] Center left: Band Name (Fredoka)
- [ ] Center right: QR Code with white container
- [ ] Above QR: "Scan to connect with this artist" (Poppins Medium Bold)
- [ ] Below band name: "1 line description" (Poppins Small, not bold)
- [ ] Bottom left: SongDrive logo

#### 4.2 Band Name Sizing Logic
- [ ] Detect "long" names (character count threshold ~15-20 chars)
- [ ] Short names: Fredoka Primary size, single line
- [ ] Long names: Fredoka Secondary size (50px smaller), two lines, tighter line-height
- [ ] Ensure consistent visual weight

#### 4.3 QR Code
- [ ] Generate QR for `/performer/:id`
- [ ] White rounded container
- [ ] Size: medium (smaller than signup QRs)
- [ ] Description above: "Scan to connect with this artist"

#### 4.4 Logo Positioning
- [ ] Bottom left corner
- [ ] Safe margins (20-30px from edges)
- [ ] Use `cloud_gradient_logo.png`

#### 4.5 Remove Social Links
- [ ] NO social icons/handles on this screen
- [ ] Moved to mobile view only

**Deliverable**: Professional stage display matching mockups

---

### Phase 5: Mobile Profile Page
**Goal**: Redesign mobile view for QR code scan

#### 5.1 Layout Structure
Based on mockups:
- [ ] Blue gradient background (no rotation needed)
- [ ] Top: Band Name (Fredoka, same sizing logic as stage)
- [ ] Below name: "1 line description" (Poppins Small)
- [ ] Social Links: 3 buttons maximum
- [ ] Bottom: "Powered by SongDrive" text + logo

#### 5.2 Social Link Buttons
- [ ] Container background: Melody Mist (#ABCED6) at 25% opacity
- [ ] Individual buttons: White Noise (#FFFFFF) at 88% opacity
- [ ] Rounded corners, consistent spacing
- [ ] Icon + handle + arrow
- [ ] Icons/text/arrows: Midnight Cruise (#2D2C80)
- [ ] Arrow: 90% opacity
- [ ] Platform logos only (current lucide-react icons are fine)

#### 5.3 Validation: 3-Link Maximum
- [ ] SocialLinksEditor: Disable "Add Link" button when 3 exist
- [ ] Show warning: "Maximum 3 social links allowed"
- [ ] Server validation in `addParticipant` / `updateParticipant` actions
- [ ] Trim to first 3 if > 3 submitted

#### 5.4 Footer
- [ ] "Powered by SongDrive" text (Poppins Small)
- [ ] SongDrive logo beside text
- [ ] Bottom center positioning

**Deliverable**: Mobile-optimized profile page with enforced 3-link limit

---

### Phase 6: Polish & Testing
**Goal**: Ensure production quality

#### 6.1 Visual Verification
- [ ] Compare all screens to mockups side-by-side
- [ ] Verify exact colors (#FFFFFF, #2D2C80, #142A4C, #ABCED6, #59A6DB)
- [ ] Check font weights (Fredoka 600, Poppins 500/700)
- [ ] Verify spacing, padding, margins
- [ ] Test QR code scannability

#### 6.2 Functional Testing
- [ ] Welcome screen → Display page transition (when performer set)
- [ ] QR Code screen: both QRs generate correctly
- [ ] Help text toggles on/off
- [ ] Display page updates when performer changes
- [ ] Mobile profile accessible via QR scan
- [ ] Social links navigate correctly (open in new tab)
- [ ] 3-link enforcement works

#### 6.3 Device Testing
- [ ] Test kiosk pages on 1080p display
- [ ] Test mobile pages on phone (portrait)
- [ ] Verify legibility from distance (projection screen)

**Deliverable**: Production-ready application matching design spec

---

## File Structure

```
people-queue/
├── assets/
│   ├── background.svg
│   ├── Welcome_Screen.svg
│   ├── cloud_gradient_logo.png
│   ├── Welcome Screen.png (mockup)
│   ├── QR Code Screen.png (mockup)
│   ├── Short Band Name Screen.png (mockup)
│   ├── Longer Band Name Screen.png (mockup)
│   ├── Short Band Mobile Screen.png (mockup)
│   └── Long Band Mobile Screen.png (mockup)
├── src/
│   ├── components/
│   │   ├── BackgroundLayout.tsx (NEW)
│   │   ├── QRCodeDisplay.tsx (NEW)
│   │   ├── QueueManager.tsx
│   │   └── SocialLinksEditor.tsx (UPDATE: enforce 3-link max)
│   ├── pages/
│   │   ├── WelcomePage.tsx (NEW)
│   │   ├── SignupQRPage.tsx (UPDATE: dual QR)
│   │   ├── DisplayPage.tsx (REDESIGN)
│   │   ├── PerformerProfilePage.tsx (REDESIGN)
│   │   ├── BackstagePage.tsx (UPDATE: add controls)
│   │   ├── LandingPage.tsx
│   │   └── SignupPage.tsx
│   ├── styles/ (NEW DIRECTORY)
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── layout.ts
│   │   └── fonts.css
│   ├── utils/
│   │   └── socialLinks.ts
│   ├── services/
│   │   └── googleSheets.ts
│   ├── index.tsx (UPDATE: states, actions, routes)
│   └── types.ts
└── notes/
    └── 003-REDESIGN_IMPLEMENTATION_PLAN.md
```

---

## State Management Changes

### New Server States
```typescript
songDriveWorkspaceUrl: '' as string,
showHelpText: false as boolean,
```

### New Actions
```typescript
setSongDriveWorkspaceUrl: async (args: { url: string }) => {
    states.songDriveWorkspaceUrl.setState(args.url);
    return {};
},

toggleHelpText: async (args: { enabled: boolean }) => {
    states.showHelpText.setState(args.enabled);
    return {};
},
```

### Updated Actions
```typescript
// Enforce 3-link maximum in addParticipant and updateParticipant
addParticipant: async (args: { ... socialLinks: SocialLink[] }) => {
    if (args.socialLinks.length > 3) {
        throw new Error('Maximum 3 social links allowed');
    }
    // ... rest of implementation
},
```

---

## Design Decisions

### Band Name Length Detection
**Decision**: Use character count threshold
- Short (single-line): ≤ 15 characters
- Long (two-line): > 15 characters
- Can be tuned during testing

### QR Code Sizes
- **Signup QRs**: 512px (large, easy to scan)
- **Display QR**: 384px (medium, balanced with layout)
- **All QRs**: 2px margin, high error correction

### Background Strategy
- Kiosk pages: Use background.svg as-is (no rotation)
- Mobile pages: Use background.svg as-is (no rotation needed per spec clarification)
- Each page type targets its own device exclusively

### Font Sizing
- Use fixed px values (no responsive units needed)
- Kiosk optimized for 1080p
- Mobile optimized for phones
- Separate sizing per context (no shared breakpoints)

---

## Success Criteria

✅ **Design Accuracy**
- All colors match brand palette exactly
- Typography uses only specified fonts/weights
- Layouts match mockups pixel-perfect (within reason)

✅ **Functionality**
- Welcome screen shows before event
- Dual QR codes work and are scannable
- Display page updates in real-time
- Mobile profiles accessible via QR
- 3-link maximum enforced

✅ **Quality**
- QR codes scannable from 6+ feet away
- Text legible on projection screen
- No layout shifts or glitches
- Professional appearance

---

## Open Questions (Minor)

1. **Help text location**: The mockup shows "(location)" placeholder. Should this be:
   - Hardcoded location name?
   - Configurable in backstage?
   - Generic "the front desk"?

2. **Description field**: Both mockups show "1 line description" placeholder. Should we:
   - Use the existing `participant.description` field?
   - Limit to 1 line (truncate with ellipsis)?

3. **Welcome Screen editable?**: The welcome screen is static SVG. If host name changes, do we:
   - Edit SVG file manually?
   - Keep it generic?
   - Future enhancement: make it dynamic?

**Recommendation**: Proceed with current assumptions, these can be adjusted easily during testing.

---

## Timeline Estimate

- **Phase 1** (Foundation): 2-3 hours
- **Phase 2** (Welcome): 1 hour
- **Phase 3** (QR Screen): 2-3 hours
- **Phase 4** (Display): 3-4 hours
- **Phase 5** (Mobile): 2-3 hours
- **Phase 6** (Polish): 2-3 hours

**Total**: 12-17 hours of focused development

---

## Next Steps

1. **Measure font sizes** from mockups (Phase 1.2)
2. **Begin Phase 1**: Create theme system
3. **Iterate through phases** sequentially
4. **Test on real devices** (1080p TV + phone)
5. **Final approval** before production deployment

---

## Notes

- No new dependencies needed (qrcode, lucide-react already installed)
- All design assets acquired
- All critical questions answered
- Ready to begin implementation
