# Google Sheets Integration Plan

## Overview

Transform the Open Mic Queue app from a self-service signup system to a kiosk/backstage-only system where participant data comes from Google Sheets (populated via Google Forms).

## Goals

1. **Remove public signup form** - Users sign up via Google Forms instead
2. **Backstage becomes the only data entry point** - For emergency/walk-in additions
3. **Google Sheets integration** - Pull participant data directly from a Google Sheet
4. **Auto-refresh capability** - Manually refresh or auto-refresh every minute
5. **Add notes field** - Backstage can add internal notes per participant
6. **Secure backstage access** - Only accessible via direct `/backstage` link (no navigation from other pages)

---

## Current Architecture

### What We Have Now:
- **Signup Page (`/`)**: Public form where users add themselves to queue
- **SignupQR Page (`/signup-qr`)**: QR code pointing to signup page
- **Backstage Page (`/backstage`)**: Queue management with edit/reorder/remove
- **Display Page (`/display`)**: Kiosk view showing current performer
- **Performer Profile (`/performer/:id`)**: Social links page

### Data Flow:
- Users → Signup form → Server state (`peopleQueue`)
- Backstage manages existing participants
- Display shows current performer

---

## New Architecture

### What We'll Have:

#### Pages:
1. **Landing Page (`/`)**: Simple kiosk display showing current performer (replaces signup form)
2. **~~SignupQR Page~~**: DELETE - no longer needed since there's no public signup
3. **Backstage Page (`/backstage`)**:
   - Only accessible via direct link (no nav from other pages)
   - Can manually add participants for walk-ins
   - Can edit/remove/reorder participants
   - Can add internal notes per participant
   - Shows "Refresh from Google Sheets" button
   - Has toggle for auto-refresh every minute
4. **Display Page (`/display`)**: Unchanged - kiosk view showing current performer
5. **Performer Profile (`/performer/:id`)**: Unchanged - social links page

#### Data Flow:
```
Google Forms → Google Sheets → Our App (via Google Sheets API)
                                    ↓
                          Server State (peopleQueue)
                                    ↓
                          Display Page / Performer Profiles
```

---

## Data Model Changes

### Current Participant Type:
```typescript
type Participant = {
    id: string;
    name: string;
    description?: string;
    socialLinks: SocialLink[];
    order: number;
    isCurrentlyPerforming?: boolean;
}
```

### New Participant Type:
```typescript
type Participant = {
    id: string;
    name: string;
    description?: string;
    socialLinks: SocialLink[];
    order: number;
    isCurrentlyPerforming?: boolean;
    notes?: string;           // NEW: Internal notes for backstage
    source: 'sheets' | 'manual'; // NEW: Track if from Google Sheets or manually added
    sheetRowId?: number;      // NEW: Track which row in Google Sheets (for sync)
}
```

---

## Google Sheets Integration Spec

### Environment Variables:
```bash
GOOGLE_SHEETS_CREDENTIALS=<JSON string of service account credentials>
GOOGLE_SHEET_ID=<spreadsheet ID>
GOOGLE_SHEET_NAME=<sheet name, e.g., "Responses">
```

### Expected Sheet Structure:
Assume columns in Google Sheets (from Google Forms):
```
| Timestamp | Name | Description | Instagram | YouTube | SoundCloud | Spotify | Twitter | TikTok | Facebook | Bandcamp | Custom Link |
```

### Mapping Logic:
- **Name**: Required - maps to `name`
- **Description**: Optional - maps to `description`
- **Social platforms**: Optional - each platform has its own column with username/handle
- **Row number**: Track as `sheetRowId` for incremental sync

### Sync Strategy:
1. **Full Sync**: Load all rows from sheet, create participants for new rows only
2. **Incremental Sync**: Only fetch rows with `sheetRowId > maxSheetRowId` in current queue
3. **Conflict Resolution**:
   - If participant already exists (by `sheetRowId`), skip it
   - Manual participants (no `sheetRowId`) are never overwritten
4. **Order Preservation**: New participants from sheets append to end of queue

---

## New Server Actions

### Actions to Add:
```typescript
syncFromGoogleSheets: async () => {
    // 1. Call Google Sheets API
    // 2. Parse rows into Participant objects
    // 3. Filter out already-synced rows
    // 4. Append new participants to queue
    // 5. Return { count: number of new participants added }
}

updateParticipantNotes: async (args: { id: string; notes: string }) => {
    // Update the notes field for a participant
}

addManualParticipant: async (args: { name: string; description?: string; socialLinks: SocialLink[] }) => {
    // Add a participant with source: 'manual'
    // Similar to current addParticipant but marks as manual
}
```

### Actions to Modify:
- `updateParticipant`: Add `notes` and `source` to args (optional)
- Keep existing actions: `removeParticipant`, `reorderParticipants`, `setCurrentPerformer`

---

## Auto-Refresh Feature

### Server State:
```typescript
autoRefreshEnabled: false as boolean
lastSyncTimestamp: null as number | null
```

### Implementation:
- Backstage has a toggle switch: "Auto-refresh every minute"
- When enabled, sets `autoRefreshEnabled: true`
- Client-side `useEffect` in BackstagePage:
  - If `autoRefreshEnabled === true`, call `syncFromGoogleSheets` every 60 seconds
  - Show last sync timestamp
- Manual "Refresh Now" button always available

---

## Security/Access Control

### Backstage Access:
- **No navigation links to `/backstage`** from any other page
- Remove "Backstage" buttons from:
  - Landing page (new root)
  - Display page
  - SignupQR page (to be deleted)
- Access only via direct URL: `http://jam.local:59728/backstage`

### Implementation:
- Simply remove navigation buttons
- No authentication system needed (basic obscurity is acceptable per user requirements)

---

## UI Changes

### 1. New Landing Page (`/`)
Replace current SignupPage with a simplified display view:
- Shows current performer (if any)
- Shows "No one performing right now" if queue is empty
- NO signup form
- NO backstage button
- Clean, minimal design

### 2. Backstage Page Enhancements
**Header Section:**
```
[Backstage - Queue Management]  [Auto-refresh: ON/OFF toggle] [Refresh Now]
Last synced: 2 minutes ago
```

**Queue Cards - Add Notes Field:**
Each participant card shows:
- Name, description, social links (existing)
- **NEW**: Notes field (internal only, not shown on display/profile)
- Visual indicator if source is "sheets" vs "manual"

**Add Participant Section:**
- Keep existing manual add form (for walk-ins)
- Clearly labeled "Add Walk-In Participant"

**Remove Navigation:**
- Remove "Signup Page" button (no longer exists)
- Keep "View Display" button

### 3. Delete SignupQR Page
- Remove `/signup-qr` route entirely
- Delete `SignupQRPage.tsx` file

### 4. Display Page - No Changes
- Keep as-is (shows current performer + social links)

### 5. Performer Profile - No Changes
- Keep as-is (shows social links)

---

## Implementation Plan - Sequential Tasks

### Phase 1: Setup & Dependencies
**Task 1: Install Google Sheets Dependencies**
- Install `googleapis` package: `pnpm install googleapis`
- Install types: `pnpm install -D @types/googleapis`
- Verify environment variables are accessible

**Task 2: Update Data Model**
- Update `Participant` type to include `notes`, `source`, `sheetRowId`
- Update all existing actions to handle new fields
- Update type exports

---

### Phase 2: Google Sheets Integration
**Task 3: Create Google Sheets Service**
- Create `src/services/googleSheets.ts`
- Implement `fetchParticipantsFromSheet()` function
- Parse sheet rows into `Participant` objects
- Map social platform columns to `socialLinks` array
- Test with dummy data

**Task 4: Add Sync Action**
- Create `syncFromGoogleSheets` server action
- Implement incremental sync logic
- Add `autoRefreshEnabled` and `lastSyncTimestamp` to server state
- Return sync results (count of new participants)

---

### Phase 3: Remove Public Signup
**Task 5: Delete SignupQR Page**
- Remove `/signup-qr` route from `src/index.tsx`
- Delete `src/pages/SignupQRPage.tsx` file
- Remove any imports/references

**Task 6: Replace Signup Page with Landing Page**
- Rename `SignupPage.tsx` to `LandingPage.tsx` (or create new)
- Remove signup form entirely
- Show current performer in clean, minimal design
- Remove all navigation buttons
- Make it look like a simple kiosk display

---

### Phase 4: Backstage Enhancements
**Task 7: Add Notes Field to Backstage**
- Add notes textarea to participant edit form in `QueueManager.tsx`
- Create `updateParticipantNotes` action
- Show notes in collapsed state (expand on click or always visible)
- Style notes to indicate they're internal only

**Task 8: Add Manual Participant Form**
- Update existing add form to use `addManualParticipant` action
- Mark source as 'manual'
- Label section "Add Walk-In Participant"

**Task 9: Add Refresh UI**
- Add "Refresh Now" button to BackstagePage header
- Add auto-refresh toggle switch
- Display last sync timestamp
- Show loading state during sync
- Show success/error messages after sync

**Task 10: Remove Backstage Navigation**
- Remove all "Backstage" buttons from:
  - Landing page (new root)
  - Display page
  - SignupQR page (already deleted)
- Confirm `/backstage` is only accessible via direct URL

---

### Phase 5: Testing & Polish
**Task 11: End-to-End Testing**
- Test Google Sheets sync with real sheet
- Test auto-refresh functionality
- Test manual participant addition
- Test notes field
- Test that backstage is not accessible via navigation
- Verify display page and performer profiles still work

**Task 12: Error Handling & Edge Cases**
- Handle Google Sheets API errors gracefully
- Handle empty sheets
- Handle malformed data in sheets
- Handle sync conflicts
- Add proper loading states
- Add user feedback messages

---

## Technical Details

### Google Sheets API Setup

**Authentication Flow:**
```typescript
import { google } from 'googleapis';

const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!);
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });
```

**Fetching Data:**
```typescript
const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${process.env.GOOGLE_SHEET_NAME}!A2:L`, // Skip header row
});

const rows = response.data.values || [];
```

**Parsing Rows:**
```typescript
const participants = rows.map((row, index) => {
    const [timestamp, name, description, instagram, youtube, soundcloud, spotify, twitter, tiktok, facebook, bandcamp, custom] = row;

    const socialLinks: SocialLink[] = [];
    let linkOrder = 0;

    if (instagram) socialLinks.push({ id: generateId(), type: 'instagram', url: instagram, order: linkOrder++ });
    if (youtube) socialLinks.push({ id: generateId(), type: 'youtube', url: youtube, order: linkOrder++ });
    // ... etc for all platforms

    return {
        id: generateId(),
        name: name || 'Unknown',
        description: description || undefined,
        socialLinks,
        order: index,
        source: 'sheets' as const,
        sheetRowId: index + 2, // +2 because row 1 is header, arrays are 0-indexed
    };
});
```

---

## Environment Variable Setup

Add to `.env` or configure in deployment:
```bash
# Google Sheets Integration
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
GOOGLE_SHEET_ID="1abc123def456..."
GOOGLE_SHEET_NAME="Form Responses 1"
```

---

## Migration Path

### For Existing Users:
1. Deploy new version with Google Sheets integration
2. Manually add existing participants to Google Sheet (if any)
3. Run initial sync to populate queue
4. Remove old signup links/QR codes
5. Share new `/backstage` link with organizers

### For New Users:
1. Create Google Form for signups
2. Configure form to save to Google Sheet
3. Set up service account and share sheet with service account email
4. Configure environment variables
5. Deploy app and share `/backstage` link

---

## User Workflow

### Participant Signup:
1. Participant fills out Google Form on their phone
2. Response saved to Google Sheet
3. Organizer clicks "Refresh Now" or waits for auto-sync
4. Participant appears in queue

### Backstage Management:
1. Organizer accesses `/backstage` directly
2. Views queue populated from Google Sheets
3. Can add walk-ins manually
4. Can edit, reorder, remove participants
5. Can add internal notes
6. Sets current performer
7. Views display on kiosk

### Audience Experience:
1. Sees landing page (current performer) at `/`
2. Scans QR code on display to see performer's social links
3. No self-service signup - must use Google Form

---

## Questions to Clarify Before Implementation

1. **Google Form Structure**: Do you have the form already created, or should we provide a template?
2. **Social Platform Columns**: Which platforms should we expect in the sheet? (Instagram, YouTube, etc.)
3. **Column Names**: What are the exact column names in your sheet? (e.g., "Instagram Handle" vs "Instagram" vs "IG")
4. **Empty Cells**: How should we handle empty cells? Skip the platform or show as empty?
5. **Duplicate Detection**: Should we detect duplicates by name, or always add new participants?
6. **Manual Participant Priority**: Should walk-ins appear at end of queue or be insertable at specific positions?
7. **Notes Visibility**: Should notes show in the queue list, or only when editing?
8. **Sync Conflicts**: If someone edits a participant that came from sheets, should sync overwrite or skip?

---

## Success Criteria

### Functionality:
- [ ] Google Sheets sync works and pulls participant data
- [ ] Auto-refresh works (every minute when enabled)
- [ ] Manual refresh works
- [ ] Notes field allows backstage to add internal notes
- [ ] Manual participants can be added for walk-ins
- [ ] Backstage is only accessible via direct URL
- [ ] Landing page shows current performer (no signup form)
- [ ] Display page and performer profiles still work

### UX:
- [ ] Clear visual distinction between sheet-sourced and manual participants
- [ ] Last sync timestamp visible
- [ ] Sync success/error messages shown
- [ ] Loading states during sync
- [ ] Notes are clearly marked as internal-only

### Code Quality:
- [ ] No TypeScript errors
- [ ] Proper error handling for Google API
- [ ] Clean separation of concerns (Google Sheets service)
- [ ] Updated documentation

---

## Risk Mitigation

### Risks:
1. **Google API Rate Limits**: Auto-refresh every minute might hit rate limits
   - Mitigation: Use exponential backoff, cache results
2. **Service Account Permissions**: Sheet might not be shared with service account
   - Mitigation: Clear setup instructions, error messages
3. **Malformed Data**: Sheet might have unexpected data
   - Mitigation: Robust parsing with defaults, validation
4. **Large Sheets**: Performance issues with hundreds of rows
   - Mitigation: Implement pagination, limit sync to last N rows

---

## Timeline Estimate

**Total: 12 Tasks**
- Phase 1 (2 tasks): ~30 minutes
- Phase 2 (2 tasks): ~2 hours (most complex - Google Sheets integration)
- Phase 3 (2 tasks): ~45 minutes
- Phase 4 (4 tasks): ~2 hours
- Phase 5 (2 tasks): ~1 hour

**Total Estimated Time**: ~6 hours

Can be completed in 1-2 sessions with sequential subagent execution.

---

## Next Steps

1. **Review this plan** and clarify any questions
2. **Prepare Google Sheets** with expected column structure
3. **Set up service account** and get credentials
4. **Execute tasks sequentially** using subagents
5. **Test with real data** once integration is complete
6. **Deploy** and share backstage link

Ready to proceed when you give the go-ahead!