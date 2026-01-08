import React from 'react';
import springboard from 'springboard';
import { Participant, SocialLink } from './types';
import { SignupPage } from './pages/SignupPage';
import { LandingPage } from './pages/LandingPage';
import { SignupQRPage } from './pages/SignupQRPage';
import { BackstagePage } from './pages/BackstagePage';
import { DisplayPage } from './pages/DisplayPage';
import { PerformerProfilePage } from './pages/PerformerProfilePage';
import { WelcomePage } from './pages/WelcomePage';
import {ModuleAPI} from 'springboard/engine/module_api';

// Import Google Fonts for typography
import './styles/fonts.css';

// @platform "node"
import { fetchParticipantsFromSheet } from './services/googleSheets';
// @platform end

async function createResources(app: ModuleAPI) {
    const states = await app.createStates({
        peopleQueue: [] as Participant[],
        currentPerformerId: null as string | null,
        googleFormUrl: '' as string,
        songDriveWorkspaceUrl: '' as string,
        showHelpText: false as boolean,
        autoRefreshEnabled: false as boolean,
        lastSyncTimestamp: null as number | null,
    });

    const myParticipantIdsState = await app.statesAPI.createUserAgentState('myParticipantIds', [] as string[]);

    const actions = app.createActions({
        addParticipant: async (args: { name: string; description?: string; socialLinks: SocialLink[]; notes?: string; source?: 'sheets' | 'manual'; sheetRowId?: number }) => {
            // Enforce 3-link maximum (take first 3 if more provided)
            const validatedSocialLinks = args.socialLinks.slice(0, 3);

            const newParticipant: Participant = {
                id: `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: args.name,
                description: args.description,
                socialLinks: validatedSocialLinks,
                order: states.peopleQueue.getState().length,
                notes: args.notes,
                source: args.source,
                sheetRowId: args.sheetRowId,
            };

            states.peopleQueue.setStateImmer((queue: Participant[]) => {
                queue.push(newParticipant);
            });

            return { id: newParticipant.id };
        },

        updateParticipant: async (args: { id: string; name: string; description?: string; socialLinks: SocialLink[]; notes?: string; source?: 'sheets' | 'manual'; sheetRowId?: number }) => {
            // Enforce 3-link maximum (take first 3 if more provided)
            const validatedSocialLinks = args.socialLinks.slice(0, 3);

            states.peopleQueue.setStateImmer((queue: Participant[]) => {
                const participant = queue.find((p: Participant) => p.id === args.id);
                if (participant) {
                    participant.name = args.name;
                    participant.description = args.description;
                    participant.socialLinks = validatedSocialLinks;
                    if (args.notes !== undefined) participant.notes = args.notes;
                    if (args.source !== undefined) participant.source = args.source;
                    if (args.sheetRowId !== undefined) participant.sheetRowId = args.sheetRowId;
                }
            });
        },

        reorderParticipants: async (args: { participants: Participant[] }) => {
            states.peopleQueue.setState(
                args.participants.map((p, index) => ({ ...p, order: index }))
            );
        },

        removeParticipant: async (args: { id: string }) => {
            states.peopleQueue.setStateImmer((queue: Participant[]) => {
                const index = queue.findIndex((p: Participant) => p.id === args.id);
                if (index !== -1) {
                    queue.splice(index, 1);
                    queue.forEach((p: Participant, i: number) => {
                        p.order = i;
                    });
                }
            });

            if (states.currentPerformerId.getState() === args.id) {
                states.currentPerformerId.setState(null);
            }
        },

        setCurrentPerformer: async (args: { id: string | null }) => {
            states.currentPerformerId.setState(args.id);
        },

        syncFromGoogleSheets: async () => {
            // Get the current max sheetRowId from peopleQueue
            const currentQueue = states.peopleQueue.getState();
            const maxRowId = currentQueue.reduce((max, p) => {
                if (p.sheetRowId !== undefined && p.sheetRowId > max) {
                    return p.sheetRowId;
                }
                return max;
            }, 0);

            // Fetch new participants from Google Sheets
            const sheetParticipants = await fetchParticipantsFromSheet(maxRowId > 0 ? maxRowId : undefined);

            // Convert SheetParticipant[] to Participant[] and append to queue
            let addedCount = 0;
            for (const sheetParticipant of sheetParticipants) {
                // Check if this sheetRowId already exists (safety check)
                const exists = currentQueue.some(p => p.sheetRowId === sheetParticipant.sheetRowId);
                if (!exists) {
                    const newParticipant: Participant = {
                        id: `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        name: sheetParticipant.name,
                        description: sheetParticipant.description,
                        socialLinks: sheetParticipant.socialLinks.map((link, index) => ({
                            ...link,
                            id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
                            order: index,
                        })),
                        order: states.peopleQueue.getState().length,
                        source: 'sheets',
                        sheetRowId: sheetParticipant.sheetRowId,
                    };

                    states.peopleQueue.setStateImmer((queue: Participant[]) => {
                        queue.push(newParticipant);
                    });

                    addedCount++;
                }
            }

            // Update lastSyncTimestamp
            const timestamp = Date.now();
            states.lastSyncTimestamp.setState(timestamp);

            return { added: addedCount, timestamp };
        },

        setGoogleFormUrl: async (args: { url: string }) => {
            states.googleFormUrl.setState(args.url);
            return {};
        },

        setAutoRefresh: async (args: { enabled: boolean }) => {
            states.autoRefreshEnabled.setState(args.enabled);
            return {};
        },

        setSongDriveWorkspaceUrl: async (args: { url: string }) => {
            states.songDriveWorkspaceUrl.setState(args.url);
            return {};
        },

        toggleHelpText: async (args: { enabled: boolean }) => {
            states.showHelpText.setState(args.enabled);
            return {};
        },

        addManualParticipant: async (args: { name: string; description?: string; socialLinks: SocialLink[] }) => {
            // Enforce 3-link maximum (take first 3 if more provided)
            const validatedSocialLinks = args.socialLinks.slice(0, 3);

            const newParticipant: Participant = {
                id: `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: args.name,
                description: args.description,
                socialLinks: validatedSocialLinks,
                order: states.peopleQueue.getState().length,
                source: 'manual',
            };

            states.peopleQueue.setStateImmer((queue: Participant[]) => {
                queue.push(newParticipant);
            });

            return { id: newParticipant.id };
        },
    });

    return { states, actions, userAgentState: { myParticipantIds: myParticipantIdsState } };
}

export type Actions = Awaited<ReturnType<typeof createResources>>['actions'];

springboard.registerModule('open-mic-queue', {}, async (app) => {
    const { states, actions, userAgentState } = await createResources(app);

    app.registerRoute('/', {}, () => {
        const participants = states.peopleQueue.useState();
        const currentPerformerId = states.currentPerformerId.useState();

        // Show WelcomePage when no performer is selected (pre-event)
        // Show DisplayPage when a performer is selected (during event)
        if (currentPerformerId === null) {
            return <WelcomePage />;
        }

        return (
            <DisplayPage
                participants={participants}
                currentPerformerId={currentPerformerId}
            />
        );
    });

    app.registerRoute('/signup-qr', {}, () => {
        const googleFormUrl = states.googleFormUrl.useState();
        const songDriveWorkspaceUrl = states.songDriveWorkspaceUrl.useState();
        const showHelpText = states.showHelpText.useState();
        return (
            <SignupQRPage
                googleFormUrl={googleFormUrl}
                songDriveWorkspaceUrl={songDriveWorkspaceUrl}
                showHelpText={showHelpText}
            />
        );
    });

    app.registerRoute('/backstage', {}, () => {
        const participants = states.peopleQueue.useState();
        const currentPerformerId = states.currentPerformerId.useState();
        const googleFormUrl = states.googleFormUrl.useState();
        const songDriveWorkspaceUrl = states.songDriveWorkspaceUrl.useState();
        const showHelpText = states.showHelpText.useState();
        const autoRefreshEnabled = states.autoRefreshEnabled.useState();
        const lastSyncTimestamp = states.lastSyncTimestamp.useState();

        return (
            <BackstagePage
                participants={participants}
                currentPerformerId={currentPerformerId}
                googleFormUrl={googleFormUrl}
                songDriveWorkspaceUrl={songDriveWorkspaceUrl}
                showHelpText={showHelpText}
                autoRefreshEnabled={autoRefreshEnabled}
                lastSyncTimestamp={lastSyncTimestamp}
                actions={actions}
            />
        );
    });

    app.registerRoute('/display', {}, () => {
        const participants = states.peopleQueue.useState();
        const currentPerformerId = states.currentPerformerId.useState();

        return (
            <DisplayPage
                participants={participants}
                currentPerformerId={currentPerformerId}
            />
        );
    });

    app.registerRoute('/performer/:performerId', {}, () => {
        const participants = states.peopleQueue.useState();
        return <PerformerProfilePage participants={participants} />;
    });

    return {};
})
