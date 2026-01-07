# Open Mic Queue App - UX Review Report

## Executive Summary

I navigated through all pages of the application and tested core functionality. The app is well-structured with good basic functionality, but there are several UX improvements that would significantly enhance the user experience.

---

## Page-by-Page Analysis

### 1. Signup Page (`/`)

**Current State:**
- Clean form layout with name, description, and social links
- Shows "My Artists in Queue" section below for artists added from this device
- Has "Add to Queue" and "Backstage" buttons

**Issues Found:**

#### CRITICAL
None

#### MAJOR
1. **"My Artists in Queue" section always visible even when empty data exists**
   - The section shows with header "My Artists in Queue" and subtitle even when there are existing test participants
   - This creates visual clutter when users have added participants

2. **No visual feedback after adding participant**
   - Uses browser `alert()` which is jarring
   - Form clears but no smooth confirmation

3. **Social links display format unclear**
   - Shows as "instagram: sarahmitchellmusic" which is raw data
   - Not formatted as clickable links or with clear platform context

#### MINOR
1. **Description label could be more prominent**
   - "Description" label is small and easy to miss
   - Could benefit from helper text about character limits

2. **No character count for description**
   - Users don't know if they're approaching any limits
   - Could add subtle character counter

3. **Edit Links button styling**
   - Generic gray button doesn't stand out enough for this important action

---

### 2. Backstage Page (`/backstage`)

**Current State:**
- Shows queue of all participants
- Drag-and-drop reordering works well
- "Now Performing" indicator at top
- Individual participant cards with actions

**Issues Found:**

#### CRITICAL
None

#### MAJOR
1. **Participant cards are very tall with long descriptions**
   - The test participant "The Amazing Extraordinarily Talented Super Long Name Band..." takes up massive vertical space
   - Description text wraps but creates very tall cards
   - Hard to scan the queue when descriptions are long

2. **No visual hierarchy between name and description**
   - Name and description have similar visual weight
   - Description is italic but still prominent
   - Makes it hard to quickly scan participant names

3. **Button layout gets cramped with long text**
   - The accessibility description for drag-and-drop creates very long button text
   - Example: "1. michael 1 social link ▲ ▼ Now Performing Edit Remove"
   - All actions concatenated into one long string in accessibility tree

4. **No confirmation for "End Performance"**
   - User could accidentally end a performance
   - Should have same confirmation as "Remove"

5. **"View Display" button only shows when performer is active**
   - Users might want to preview the display page before starting
   - Button should always be available

#### MINOR
1. **No queue position indicators besides numbering**
   - Could add visual indicators like "Next up", "On deck", etc.

2. **Current performer box at top is redundant**
   - Same info shown in the queue list with blue highlight
   - Takes up vertical space

3. **No empty state guidance**
   - When queue is empty, just says "No participants in queue yet"
   - Could link to signup page or show instructions

4. **Arrow buttons feel redundant with drag-and-drop**
   - While good for accessibility, they clutter the UI
   - Could be hidden by default and shown on hover or for keyboard users

---

### 3. Display Page (`/display`)

**Current State:**
- Full-screen black background
- Large performer name
- QR code with URL below
- "Back to Backstage" button in corner

**Issues Found:**

#### CRITICAL
None

#### MAJOR
1. **No description shown for current performer**
   - Despite having a description field, it's not displayed
   - This was a requested feature but appears missing

2. **QR code is relatively small (256px)**
   - For a kiosk/projection display, could be larger
   - Recommend 400-512px for better scanning from distance

3. **URL text is very small and hard to read**
   - Good to show for manual entry, but could be larger
   - Consider making it more prominent

#### MINOR
1. **No visual indication that QR code is scannable**
   - Could add a subtle animation or instruction text
   - "Scan to view social links" or similar

2. **Back to Backstage button is small for touch targets**
   - In a kiosk scenario, buttons should be larger
   - Fixed position might conflict with projected content

---

### 4. Performer Profile Page (`/performer/:id`)

**Current State:**
- Purple gradient background
- Performer name at top
- Description shown
- Social links as clickable cards
- Clean, modern design

**Issues Found:**

#### CRITICAL
None

#### MAJOR
1. **Social links show raw usernames instead of formatted labels**
   - Shows "kochell_music" instead of something clearer
   - For platforms like Instagram, could show "@kochell_music"
   - No indication that it's clickable except hover effect

2. **No platform name shown anywhere**
   - Only icon indicates platform
   - Users unfamiliar with platform icons might be confused
   - Could show platform name on hover or as subtle text

#### MINOR
1. **Gradient background might be hard to read on some screens**
   - Purple gradient is nice but could have contrast issues
   - Consider darker overlay or different background

2. **No back button**
   - Users are stuck on this page with no way back
   - Should have a subtle "Back" or home link

3. **Empty state for no social links is good but could be better**
   - Shows "No social links added yet"
   - Could provide more context or hide the section entirely

---

### 5. Signup QR Page (`/signup-qr`)

**Current State:**
- Full-screen white background
- Large heading
- QR code (512px)
- URL text below
- Instructions
- Backstage button in corner

**Issues Found:**

#### CRITICAL
None

#### MAJOR
1. **Backstage button uses aria-label but not visually labeled**
   - Just says "Backstage"
   - For a public-facing page, this might be confusing
   - Consider making it more subtle or renaming to "Admin" or similar

#### MINOR
1. **QR code could have a border or shadow**
   - Plain white canvas on white background
   - Hard to see edges clearly

2. **Instructions text is quite long**
   - "Point your phone's camera at the QR code or enter the URL above to get started"
   - Could be more concise: "Scan or visit the URL to sign up"

---

## Severity Definitions

- **CRITICAL**: Breaks core functionality or makes the app unusable
- **MAJOR**: Significantly impacts user experience or usability
- **MINOR**: Polish issues or nice-to-have improvements

---

## Prioritized Recommendations

### High Priority (Do First)

1. **Add description to Display page**
   - Currently missing despite being a feature
   - Quick fix: Just display `currentPerformer.description` below name
   - **Impact**: High - this was a requested feature

2. **Increase QR code size on Display page**
   - Change from 256px to 400-512px
   - Better scanability from distance
   - **Impact**: High - core use case is kiosk display

3. **Improve social links formatting on Signup page**
   - Make them actual clickable links
   - Add platform name alongside username
   - Better visual design
   - **Impact**: Medium - affects user understanding

4. **Add confirmation dialog for "End Performance"**
   - Same pattern as "Remove participant"
   - Prevents accidents
   - **Impact**: Medium - prevents mistakes

5. **Reduce visual weight of descriptions in Backstage queue**
   - Make description smaller, lighter, more subtle
   - Improve name/description hierarchy
   - Consider truncating long descriptions with "show more"
   - **Impact**: High - improves scanability of queue

### Medium Priority

6. **Make "View Display" always available in Backstage**
   - Remove conditional showing
   - Let users preview before starting performance
   - **Impact**: Medium - improves workflow

7. **Replace browser `alert()` with better feedback**
   - Use toast notifications or inline success messages
   - More modern and less jarring
   - **Impact**: Medium - polish

8. **Add @ prefix for social handles where appropriate**
   - Instagram, Twitter, etc. should show @username
   - Better clarity
   - **Impact**: Low - cosmetic improvement

9. **Add back navigation to Performer Profile page**
   - Subtle link or button to return
   - Better UX when testing or exploring
   - **Impact**: Medium - prevents dead ends

10. **Show platform names on hover in Performer Profile**
    - Tooltip or subtle text
    - Helps users unfamiliar with icons
    - **Impact**: Low - accessibility improvement

### Low Priority (Polish)

11. **Add character counter to description field**
    - Shows remaining characters
    - Sets expectations
    - **Impact**: Low - nice to have

12. **Improve empty state messages**
    - Add helpful links or instructions
    - Make them actionable
    - **Impact**: Low - edge case

13. **Add visual QR code treatment**
    - Border, shadow, or background
    - Makes edges clearer
    - **Impact**: Low - cosmetic

14. **Consider truncating long descriptions in queue**
    - Show first 2 lines with "show more"
    - Keeps cards consistent height
    - **Impact**: Medium - improves scanning

15. **Add queue position indicators**
    - "Next up", "On deck" badges
    - Helps performers know their status
    - **Impact**: Low - nice to have

---

## Positive Observations

### What's Working Well

1. **Drag-and-drop implementation is smooth**
   - Works well with visual feedback
   - Arrow buttons as fallback is great for accessibility
   - Activation distance prevents accidents

2. **Color coding is clear**
   - Blue for current performer
   - Green for "Now Performing" button
   - Red for destructive actions
   - Good visual language

3. **Responsive design works**
   - Text scales with clamp()
   - Wrapping works properly
   - Mobile-friendly

4. **QR code generation works flawlessly**
   - Proper URL encoding
   - Good jam.local replacement
   - Clear and scannable

5. **User agent state tracking is clever**
   - "My Artists" feature is unique and useful
   - Allows multiple people to add from same device
   - Good UX innovation

6. **Navigation flow is logical**
   - Clear paths between pages
   - Buttons are well-placed
   - Intuitive structure

---

## Edge Cases to Consider

1. **Very long participant names** - Tested with long band name, works but creates tall cards
2. **Very long descriptions** - Same issue, needs truncation
3. **No social links** - Handled well with empty states
4. **Empty queue** - Has message but could be more helpful
5. **Multiple performers at once** - Not tested, but system only allows one
6. **Deleting current performer** - Properly clears state

---

## Accessibility Observations

### Good
- Semantic HTML (headings, buttons, labels)
- Drag-and-drop has keyboard fallback with arrows
- ARIA labels where needed
- Good color contrast
- Focus states visible

### Needs Improvement
- Long accessibility descriptions for draggable items
- Some buttons could have better labels
- Empty states could be more descriptive
- Missing skip links

---

## Performance Notes

- Page loads fast
- No performance issues observed
- QR code generation is instant
- Drag-and-drop is smooth
- No lag or stuttering

---

## Summary of Critical Path Issues

The app works well overall, but these issues affect the core user experience:

1. Missing description on Display page (requested feature)
2. QR code too small for distance scanning
3. Queue becomes hard to scan with long descriptions
4. Social links not formatted as actual links on Signup page

Fix these four issues first for the biggest impact.

---

## Recommended Next Actions

1. Fix description display on Display page
2. Increase QR code size to 400-512px
3. Improve description visual hierarchy in queue cards
4. Add confirmation to "End Performance"
5. Format social links properly throughout the app
6. Replace browser alerts with better notifications

These changes would significantly improve the user experience without major architectural changes.