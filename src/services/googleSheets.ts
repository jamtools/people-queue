import { google } from 'googleapis';
import type { PlatformType } from '../types';

export type SheetParticipant = {
    name: string;
    description?: string;
    socialLinks: Array<{
        type: PlatformType;
        url: string;
    }>;
    sheetRowId: number;
};

/**
 * Column mapping for the Google Sheet:
 * Column 0 (A): Timestamp (ignore)
 * Column 1 (B): Name (required)
 * Column 2 (C): Description (optional)
 * Column 3 (D): Instagram (optional)
 * Column 4 (E): YouTube (optional)
 * Column 5 (F): SoundCloud (optional)
 * Column 6 (G): Spotify (optional)
 * Column 7 (H): Twitter (optional)
 * Column 8 (I): TikTok (optional)
 * Column 9 (J): Facebook (optional)
 * Column 10 (K): Bandcamp (optional)
 * Column 11 (L): Custom Link (optional, use type 'custom')
 */

type SocialLinkColumn = {
    index: number;
    type: PlatformType;
};

const SOCIAL_LINK_COLUMNS: SocialLinkColumn[] = [
    { index: 3, type: 'instagram' },
    { index: 4, type: 'youtube' },
    { index: 5, type: 'soundcloud' },
    { index: 6, type: 'spotify' },
    { index: 7, type: 'twitter' },
    { index: 8, type: 'tiktok' },
    { index: 9, type: 'facebook' },
    { index: 10, type: 'bandcamp' },
    { index: 11, type: 'custom' },
];

/**
 * Fetches participants from a Google Sheet.
 *
 * @param lastRowId - If provided, only fetches rows after this row ID (for incremental sync)
 * @returns Array of SheetParticipant objects
 */
export async function fetchParticipantsFromSheet(
    lastRowId?: number
): Promise<SheetParticipant[]> {
    const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS;
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.GOOGLE_SHEET_NAME;

    if (!credentialsJson) {
        console.error('GOOGLE_SHEETS_CREDENTIALS environment variable is not set');
        return [];
    }

    if (!sheetId) {
        console.error('GOOGLE_SHEET_ID environment variable is not set');
        return [];
    }

    if (!sheetName) {
        console.error('GOOGLE_SHEET_NAME environment variable is not set');
        return [];
    }

    try {
        // Parse the credentials JSON
        const credentials = JSON.parse(credentialsJson);

        // Create auth client using service account
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        // Create sheets client
        const sheets = google.sheets({ version: 'v4', auth });

        // Determine the range to fetch
        // Row 1 is headers, so data starts at row 2
        // If lastRowId is provided, start from the row after it
        const startRow = lastRowId !== undefined ? lastRowId + 1 : 2;
        const range = `${sheetName}!A${startRow}:L`;

        // Fetch data from the sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range,
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            return [];
        }

        // Parse rows into SheetParticipant objects
        const participants: SheetParticipant[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            // Calculate the actual row number in the sheet
            const sheetRowId = startRow + i;

            // Column 1 (B) is Name - required
            const name = row[1]?.toString().trim();
            if (!name) {
                // Skip rows without a name
                continue;
            }

            // Column 2 (C) is Description - optional
            const description = row[2]?.toString().trim() || undefined;

            // Parse social links from columns 3-11
            const socialLinks: Array<{ type: PlatformType; url: string }> = [];

            for (const column of SOCIAL_LINK_COLUMNS) {
                const url = row[column.index]?.toString().trim();
                if (url) {
                    socialLinks.push({
                        type: column.type,
                        url,
                    });
                }
            }

            participants.push({
                name,
                description,
                socialLinks,
                sheetRowId,
            });
        }

        return participants;
    } catch (error) {
        console.error('Error fetching participants from Google Sheets:', error);
        return [];
    }
}
