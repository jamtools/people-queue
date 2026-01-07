# Open Mic Queue App - Implementation Plan

## Current State Analysis

### What's Already Built ✅

1. **Data Model** (`src/types.ts`)
   - Participant type with id, name, socialLinks, order
   - SocialLink type with id, type, url, order
   - Platform types: instagram, bandcamp, facebook, soundcloud, spotify, twitter, youtube, tiktok, custom

2. **State Management** (`src/index.tsx`)
   - Server states: `peopleQueue`, `currentPerformerId`
   - User agent state: `myParticipantIds` (array of participant IDs for this device)
   - Actions: addParticipant, updateParticipant, reorderParticipants, removeParticipant, setCurrentPerformer

3. **SignupPage** (`src/pages/SignupPage.tsx`)
   - Form to add participant name and social links
   - Shows all artists added from this device
   - Allows editing social links for "my artists"
   - Button to navigate to backstage

4. **BackstagePage** (`src/pages/BackstagePage.tsx`)
   - Shows current performer
   - Shows full queue
   - Uses QueueManager component
   - Navigation to display page and signup page

5. **QueueManager Component** (`src/components/QueueManager.tsx`)
   - Shows list of all participants in queue
   - Move up/down buttons for reordering (no drag-and-drop yet)
   - Edit participant details (name and social links)
   - "Now Performing" button to set current performer
   - "End Performance" button to clear current performer
   - Remove participant button

6. **DisplayPage** (`src/pages/DisplayPage.tsx`)
   - Shows current performer's name
   - Has a canvas element (currently renders a fake QR code pattern)
   - Shows URL to performer's profile page

7. **PerformerProfilePage** (`src/pages/PerformerProfilePage.tsx`)
   - Linktree-style page showing performer's name
   - Lists all social links with icons
   - Clean gradient design

8. **Social Links Components**
   - SocialLinksEditor component
   - Platform icon utilities using @tabler/icons-react

---

## What Needs to Be Done 🚧

### Task 1: Add Description Field to Participant Type
**Goal:** Allow users to add a description of their act

**Changes needed:**
- Update `Participant` type in `src/types.ts` to include `description?: string`
- Update `addParticipant` action to accept description
- Update `updateParticipant` action to include description
- Add description textarea to SignupPage form
- Add description display/edit to QueueManager
- Show description on DisplayPage when performer is active
- Show description on PerformerProfilePage

---

### Task 2: Install and Integrate QRCode Library
**Goal:** Replace fake QR code with real QR codes using the `qrcode` package

**Changes needed:**
- Install: `pnpm install qrcode`
- Install types: `pnpm install -D @types/qrcode`
- Update `DisplayPage.tsx` to use `QRCode.toCanvas()` instead of manual canvas drawing
- Update the QR code to properly encode the performer profile URL

---

### Task 3: Implement Drag-and-Drop in QueueManager
**Goal:** Replace up/down arrow buttons with drag-and-drop reordering

**Options:**
- Use `react-beautiful-dnd` (if compatible with React 19)
- Use native HTML5 drag and drop API
- Use a simpler library like `@dnd-kit/core`

**Changes needed:**
- Choose and install drag-and-drop library
- Update QueueManager component to support dragging
- Keep the `reorderParticipants` action (just call it from drag handler)
- Provide visual feedback during drag

---

### Task 4: Create QR Code Entry Page
**Goal:** Create a dedicated page showing just a QR code to access the signup page

**Changes needed:**
- Create new route: `/signup-qr`
- Create new page component: `SignupQRPage.tsx`
- Use QRCode.toCanvas to generate QR code pointing to signup page (`${window.location.origin}/`)
- Full-screen display optimized for printing or projecting
- Include instructions like "Scan to sign up for open mic"

---

### Task 5: Add Time-Based Queue Features (Optional Enhancement)
**Goal:** Allow backstage to schedule performers at particular times

**Changes needed:**
- Add `scheduledTime?: string` to Participant type
- Add time picker in backstage for each participant
- Display scheduled times in queue
- Visual indicator when it's someone's scheduled time

---

### Task 6: Polish and Testing
**Goal:** Ensure all features work together smoothly

**Changes needed:**
- Test full user flow: scan QR → signup → backstage → display → profile
- Verify QR codes scan properly on mobile devices
- Test drag-and-drop reordering
- Ensure description appears in all relevant places
- Check responsive design on mobile
- Add loading states where appropriate
- Handle edge cases (empty queue, deleted performers, etc.)

---

## Sequential Implementation Order

### Phase 1: Data Model Updates
1. **Task 1** - Add description field (subagent: backend-architect or general-purpose)
   - This is foundational and affects multiple components
   - Should be done first to avoid rework

### Phase 2: Core Feature Completion
2. **Task 2** - Install QRCode library (subagent: general-purpose)
   - Install packages and replace fake QR implementation
   - Straightforward and doesn't depend on other tasks

3. **Task 4** - Create QR entry page (subagent: frontend-developer)
   - Create the entry point page with real QR code
   - Can be done in parallel with Task 3

### Phase 3: UX Improvements
4. **Task 3** - Drag-and-drop reordering (subagent: frontend-developer)
   - Improve queue management UX
   - More complex, should be done after core features

### Phase 4: Optional Enhancements
5. **Task 5** - Time-based scheduling (optional, subagent: general-purpose)
   - Only if needed by user requirements

### Phase 5: Final Polish
6. **Task 6** - Testing and polish (subagent: ui-ux-designer or debugger)
   - End-to-end testing
   - Bug fixes and refinements

---

## Questions for Clarification

1. **Description field:** Should it be required or optional? What's a good placeholder text?
2. **Time scheduling:** Do you want performers scheduled for specific times, or just a sequential queue?
3. **Drag-and-drop:** Any preference on library or interaction style?
4. **Entry QR page:** Should this be the default landing page, or a separate route accessed from backstage?
5. **Mobile optimization:** Is this primarily for desktop/kiosk use, or should it work well on mobile?

---

## Notes

- The app uses Springboard framework with server-side state management
- All state is synchronized across clients automatically
- User agent state (`myParticipantIds`) is client-specific for tracking "my artists"
- QR codes should encode full URLs with domain for proper scanning
- Currently using @tabler/icons-react for social platform icons
