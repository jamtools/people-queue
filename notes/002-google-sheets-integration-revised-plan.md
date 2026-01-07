# Google Sheets Integration - Revised Implementation Plan

## Overview
Transform the Open Mic Queue app to use Google Forms/Sheets for participant signups while keeping backstage as the management interface.

## Key Changes from Original Plan
- **SignupQR page STAYS** but points to Google Form URL instead of internal signup
- Google Form URL is configurable in backstage and stored in server state
- Landing page becomes simplified display view
- Backstage is isolated (no navigation links from other pages)

---

## Goals

1. **Remove internal signup form** - Replace with Google Forms
2. **SignupQR points to Google Form** - QR code generates URL from configurable setting
3. **Google Sheets integration** - Pull participant data from sheet
4. **Auto-refresh** - Manual and automatic (every minute) sync
5. **Notes field** - Backstage internal notes per participant
6. **Manual add** - Backstage can add walk-ins
7. **Secure backstage** - Only accessible via direct link

---

## Updated Data Model

### Server State Additions:
```typescript
// Add to server states
googleFormUrl: '' as string  // NEW: Configurable Google Form URL
autoRefreshEnabled: false as boolean
lastSyncTimestamp: null as number | null
```

### Participant Type Additions:
```typescript
type Participant = {
    id: string;
    name: string;
    description?: string;
    socialLinks: SocialLink[];
    order: number;
    isCurrentlyPerforming?: boolean;
    notes?: string;                    // NEW: Backstage notes
    source: 'sheets' | 'manual';       // NEW: Origin tracking
    sheetRowId?: number;               // NEW: For sync tracking
}
```

---

## Implementation Tasks - Sequential Execution

### Phase 1: Data Model & Dependencies (Tasks 1-2)

#### Task 1: Install Google Sheets API
**Subagent:** general-purpose

**Requirements:**
- Install: `pnpm install googleapis`
- Install types: `pnpm install -D @types/googleapis`
- Verify packages installed correctly

**Deliverable:** Confirmation that packages are installed

---

#### Task 2: Update Data Model
**Subagent:** backend-architect

**Requirements:**
- Update `Participant` type in `src/types.ts` to add:
  - `notes?: string`
  - `source: 'sheets' | 'manual'`
  - `sheetRowId?: number`
- Update server states in `src/index.tsx` to add:
  - `googleFormUrl: '' as string`
  - `autoRefreshEnabled: false as boolean`
  - `lastSyncTimestamp: null as number | null`
- Update all existing actions to handle new optional fields (don't break existing code)

**Deliverable:** Updated types and state, no TypeScript errors

---

### Phase 2: Google Sheets Integration (Tasks 3-4)

#### Task 3: Create Google Sheets Service
**Subagent:** backend-architect

**Requirements:**
Create `src/services/googleSheets.ts` with:

```typescript
import { google } from 'googleapis';

export type SheetParticipant = {
    name: string;
    description?: string;
    socialLinks: Array<{
        type: PlatformType;
        url: string;
    }>;
    sheetRowId: number;
};

export async function fetchParticipantsFromSheet(
    lastRowId?: number
): Promise<SheetParticipant[]> {
    // 1. Authenticate with Google Sheets API using env vars
    // 2. Fetch rows from sheet (incremental if lastRowId provided)
    // 3. Parse columns into SheetParticipant objects
    // 4. Return array of participants
}
```

**Column mapping assumptions:**
- Column A: Timestamp (ignore)
- Column B: Name (required)
- Column C: Description (optional)
- Column D: Instagram (optional)
- Column E: YouTube (optional)
- Column F: SoundCloud (optional)
- Column G: Spotify (optional)
- Column H: Twitter (optional)
- Column I: TikTok (optional)
- Column J: Facebook (optional)
- Column K: Bandcamp (optional)
- Column L: Custom Link (optional)

**Environment variables to use:**
- `GOOGLE_SHEETS_CREDENTIALS` (JSON string)
- `GOOGLE_SHEET_ID`
- `GOOGLE_SHEET_NAME`

**Error handling:**
- Try/catch around API calls
- Return empty array on error
- Log errors to console

**Deliverable:** Working Google Sheets service that can fetch and parse data

---

#### Task 4: Add Sync Server Action
**Subagent:** backend-architect

**Requirements:**
Add server action in `src/index.tsx`:

```typescript
syncFromGoogleSheets: async () => {
    // 1. Get current max sheetRowId from peopleQueue
    // 2. Call fetchParticipantsFromSheet(maxRowId)
    // 3. Convert SheetParticipant[] to Participant[]
    // 4. Append to peopleQueue
    // 5. Update lastSyncTimestamp
    // 6. Return { added: number, timestamp: number }
}
```

**Logic:**
- Generate unique IDs for new participants
- Set source to 'sheets'
- Assign order numbers sequentially
- Don't overwrite existing participants with same sheetRowId

**Deliverable:** Working sync action that pulls from Google Sheets

---

### Phase 3: Update SignupQR Page (Task 5)

#### Task 5: Modify SignupQR to Use Google Form URL
**Subagent:** frontend-developer

**Requirements:**
Update `src/pages/SignupQRPage.tsx`:

**Changes:**
1. Accept `googleFormUrl` as prop (from server state)
2. Change QR code to generate from `googleFormUrl` instead of `${origin}/`
3. Update displayed URL text to show Google Form URL
4. Update heading/instructions to say "Scan to Fill Out Signup Form"
5. If `googleFormUrl` is empty, show message: "Google Form URL not configured. Please set it in Backstage."

**Update route in `src/index.tsx`:**
```typescript
app.registerRoute('/signup-qr', {}, () => {
    const googleFormUrl = states.googleFormUrl.useState();
    return <SignupQRPage googleFormUrl={googleFormUrl} />;
});
```

**Deliverable:** SignupQR page generates QR code to Google Form

---

### Phase 4: Landing Page (Task 6)

#### Task 6: Replace Signup Page with Landing Page
**Subagent:** frontend-developer

**Requirements:**
Replace `src/pages/SignupPage.tsx` with new `src/pages/LandingPage.tsx`:

**Design:**
- Minimal, clean kiosk display
- Show current performer if one is set (name + description)
- Show "No one performing right now" if queue empty
- NO signup form
- NO navigation buttons
- Black background with white text (similar to DisplayPage)

**Route update in `src/index.tsx`:**
```typescript
app.registerRoute('/', {}, () => {
    const participants = states.peopleQueue.useState();
    const currentPerformerId = states.currentPerformerId.useState();
    return (
        <LandingPage
            participants={participants}
            currentPerformerId={currentPerformerId}
        />
    );
});
```

**Deliverable:** Clean landing page with no signup form

---

### Phase 5: Backstage Enhancements (Tasks 7-10)

#### Task 7: Add Notes Field to Backstage
**Subagent:** frontend-developer

**Requirements:**
Update `src/components/QueueManager.tsx`:

1. Add notes textarea to edit form (below description, before social links)
2. Label: "Backstage Notes (Internal Only)"
3. Placeholder: "Notes for backstage use only..."
4. Save notes when saving participant edits
5. Display notes in collapsed view (small, italic, different color)

**Add action:**
```typescript
updateParticipantNotes: async (args: { id: string; notes: string }) => {
    states.peopleQueue.setStateImmer((queue: Participant[]) => {
        const participant = queue.find(p => p.id === args.id);
        if (participant) {
            participant.notes = args.notes;
        }
    });
    return {};
}
```

**Deliverable:** Notes field in backstage queue management

---

#### Task 8: Add Google Form URL Configuration
**Subagent:** frontend-developer

**Requirements:**
Update `src/pages/BackstagePage.tsx`:

Add section above queue:

```
[Google Form URL Configuration]
[Input field for URL] [Save button]
Current URL: https://forms.google.com/...
```

**Add action:**
```typescript
setGoogleFormUrl: async (args: { url: string }) => {
    states.googleFormUrl.setState(args.url);
    return {};
}
```

**UI:**
- Text input for URL
- Save button
- Show current URL below input
- Validate URL starts with "https://"

**Deliverable:** Google Form URL configuration in backstage

---

#### Task 9: Add Refresh Controls
**Subagent:** frontend-developer

**Requirements:**
Update `src/pages/BackstagePage.tsx` header:

**Add controls:**
1. "Refresh from Google Sheets" button
2. Toggle switch: "Auto-refresh every minute"
3. Display: "Last synced: X minutes ago" (or "Never")
4. Show sync status: "Syncing..." / "Added X participants"

**Add action:**
```typescript
setAutoRefresh: async (args: { enabled: boolean }) => {
    states.autoRefreshEnabled.setState(args.enabled);
    return {};
}
```

**Client-side logic:**
```typescript
useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
        actions.syncFromGoogleSheets();
    }, 60000); // Every minute

    return () => clearInterval(interval);
}, [autoRefreshEnabled]);
```

**Deliverable:** Manual and auto-refresh controls

---

#### Task 10: Add Manual Add Form
**Subagent:** frontend-developer

**Requirements:**
Update `src/pages/BackstagePage.tsx`:

Add form section:
```
[Add Walk-In Participant]
Name: [input]
Description: [textarea]
Social Links: [SocialLinksEditor]
[Add to Queue button]
```

**Add action:**
```typescript
addManualParticipant: async (args: {
    name: string;
    description?: string;
    socialLinks: SocialLink[];
}) => {
    const newParticipant: Participant = {
        id: generateId(),
        name: args.name,
        description: args.description,
        socialLinks: args.socialLinks,
        order: states.peopleQueue.getState().length,
        source: 'manual',
    };

    states.peopleQueue.setStateImmer((queue: Participant[]) => {
        queue.push(newParticipant);
    });

    return { id: newParticipant.id };
}
```

**Deliverable:** Manual participant add form in backstage

---

### Phase 6: Remove Navigation (Task 11)

#### Task 11: Isolate Backstage Access
**Subagent:** frontend-developer

**Requirements:**
Remove all navigation buttons to `/backstage` from:

1. **LandingPage** (new root page) - No buttons at all
2. **DisplayPage** - Remove "Back to Backstage" button
3. **BackstagePage** - Remove "Signup Page" button (now landing page)

Keep:
- "View Display" button in backstage (conditional on current performer)

Update backstage navigation to go to `/display` and back.

**Deliverable:** Backstage only accessible via direct URL

---

### Phase 7: Testing & Polish (Task 12)

#### Task 12: End-to-End Testing
**Subagent:** ui-ux-designer

**Requirements:**
Test complete flow:

1. **Setup:**
   - Set Google Form URL in backstage
   - Visit `/signup-qr` and verify QR code points to Google Form

2. **Data Entry:**
   - Fill out Google Form
   - Manually sync in backstage
   - Verify participant appears in queue

3. **Auto-sync:**
   - Enable auto-refresh
   - Add another form response
   - Wait 1 minute
   - Verify auto-sync works

4. **Manual Add:**
   - Add walk-in participant
   - Verify shows as "manual" source

5. **Notes:**
   - Add notes to a participant
   - Verify notes only show in backstage

6. **Display:**
   - Set performer
   - View display page
   - Verify no backstage navigation

7. **Access Control:**
   - Confirm `/backstage` not linked from any page
   - Confirm direct URL access works

**Test edge cases:**
- Empty Google Form URL
- Sync with empty sheet
- Sync errors
- Long descriptions
- Many social links
- Empty queue

**Deliverable:** Comprehensive test report, bug fixes for any issues found

---

## Environment Setup Required

Create `.env` file with:
```bash
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account",...}'
GOOGLE_SHEET_ID="abc123..."
GOOGLE_SHEET_NAME="Form Responses 1"
```

---

## Success Criteria

After all tasks:
- [ ] SignupQR page generates QR code to Google Form URL
- [ ] Google Form URL is configurable in backstage
- [ ] Sync from Google Sheets works (manual and auto)
- [ ] Notes field works in backstage
- [ ] Manual participant add works
- [ ] Landing page shows current performer (no signup form)
- [ ] Backstage isolated (no nav from other pages)
- [ ] Display page has no backstage navigation
- [ ] No TypeScript errors
- [ ] All features tested end-to-end

---

## Task Execution Order

Execute these 12 tasks sequentially with subagents:

1. Install googleapis packages
2. Update data model (types + states)
3. Create Google Sheets service
4. Add sync server action
5. Modify SignupQR page
6. Replace SignupPage with LandingPage
7. Add notes field to backstage
8. Add Google Form URL configuration
9. Add refresh controls
10. Add manual add form
11. Remove navigation to backstage
12. End-to-end testing

**Estimated time:** 6-8 hours total