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
import { QueueListPage } from './pages/QueueListPage';
import {ModuleAPI} from 'springboard/engine/module_api';

// Import Google Fonts for typography
import './styles/fonts.css';

// @platform "node"
import { fetchParticipantsFromSheet } from './services/googleSheets';
import '../server/public_assets';
// @platform end

async function createResources(app: ModuleAPI) {
    const states = await app.createStates({
        allParticipants: [] as Participant[], // All signed-up people
        queuedParticipantIds: [] as string[], // IDs of participants in the performance queue
        currentPerformerId: null as string | null,
        googleFormUrl: '' as string,
        songDriveWorkspaceUrl: '' as string,
        showHelpText: false as boolean,
        autoRefreshEnabled: false as boolean,
        lastSyncTimestamp: null as number | null,
    });

    const myParticipantIdsState = await app.statesAPI.createUserAgentState('myParticipantIds', [] as string[]);

    const actions = app.createActions({
        addParticipant: async (args: { name: string; description?: string; socialLinks: SocialLink[]; notes?: string; source?: 'sheets' | 'manual'; sheetRowId?: number; addToQueue?: boolean }) => {
            // Enforce 3-link maximum (take first 3 if more provided)
            const validatedSocialLinks = args.socialLinks.slice(0, 3);

            const newParticipant: Participant = {
                id: `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: args.name,
                description: args.description,
                socialLinks: validatedSocialLinks,
                order: 0, // Order will be determined by position in queuedParticipantIds
                notes: args.notes,
                source: args.source,
                sheetRowId: args.sheetRowId,
                isHere: false,
            };

            // Add to allParticipants
            states.allParticipants.setStateImmer((participants: Participant[]) => {
                participants.push(newParticipant);
            });

            // Optionally add to queue
            if (args.addToQueue) {
                states.queuedParticipantIds.setStateImmer((ids: string[]) => {
                    ids.push(newParticipant.id);
                });
            }

            return { id: newParticipant.id };
        },

        updateParticipant: async (args: { id: string; name: string; description?: string; socialLinks: SocialLink[]; notes?: string; source?: 'sheets' | 'manual'; sheetRowId?: number }) => {
            // Enforce 3-link maximum (take first 3 if more provided)
            const validatedSocialLinks = args.socialLinks.slice(0, 3);

            states.allParticipants.setStateImmer((participants: Participant[]) => {
                const participant = participants.find((p: Participant) => p.id === args.id);
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

        toggleParticipantHere: async (args: { id: string; isHere: boolean }) => {
            states.allParticipants.setStateImmer((participants: Participant[]) => {
                const participant = participants.find((p: Participant) => p.id === args.id);
                if (participant) {
                    participant.isHere = args.isHere;
                }
            });
        },

        addToQueue: async (args: { id: string }) => {
            const queuedIds = states.queuedParticipantIds.getState();
            if (!queuedIds.includes(args.id)) {
                states.queuedParticipantIds.setStateImmer((ids: string[]) => {
                    ids.push(args.id);
                });
            }
        },

        removeFromQueue: async (args: { id: string }) => {
            states.queuedParticipantIds.setStateImmer((ids: string[]) => {
                const index = ids.findIndex((id: string) => id === args.id);
                if (index !== -1) {
                    ids.splice(index, 1);
                }
            });

            // If this was the current performer, clear it
            if (states.currentPerformerId.getState() === args.id) {
                states.currentPerformerId.setState(null);
            }
        },

        reorderQueue: async (args: { participantIds: string[] }) => {
            states.queuedParticipantIds.setState(args.participantIds);
        },

        removeParticipant: async (args: { id: string }) => {
            // Remove from allParticipants
            states.allParticipants.setStateImmer((participants: Participant[]) => {
                const index = participants.findIndex((p: Participant) => p.id === args.id);
                if (index !== -1) {
                    participants.splice(index, 1);
                }
            });

            // Remove from queue if present
            states.queuedParticipantIds.setStateImmer((ids: string[]) => {
                const index = ids.findIndex((id: string) => id === args.id);
                if (index !== -1) {
                    ids.splice(index, 1);
                }
            });

            // Clear current performer if needed
            if (states.currentPerformerId.getState() === args.id) {
                states.currentPerformerId.setState(null);
            }
        },

        setCurrentPerformer: async (args: { id: string | null }) => {
            states.currentPerformerId.setState(args.id);
        },

        syncFromGoogleSheets: async () => {
            // Get the current max sheetRowId from allParticipants
            const currentParticipants = states.allParticipants.getState();
            const maxRowId = currentParticipants.reduce((max, p) => {
                if (p.sheetRowId !== undefined && p.sheetRowId > max) {
                    return p.sheetRowId;
                }
                return max;
            }, 0);

            // Fetch new participants from Google Sheets
            const sheetParticipants = await fetchParticipantsFromSheet(maxRowId > 0 ? maxRowId : undefined);

            // Convert SheetParticipant[] to Participant[] and add to allParticipants
            let addedCount = 0;
            for (const sheetParticipant of sheetParticipants) {
                // Check if this sheetRowId already exists (safety check)
                const exists = currentParticipants.some(p => p.sheetRowId === sheetParticipant.sheetRowId);
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
                        order: 0,
                        source: 'sheets',
                        sheetRowId: sheetParticipant.sheetRowId,
                        isHere: false,
                    };

                    states.allParticipants.setStateImmer((participants: Participant[]) => {
                        participants.push(newParticipant);
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

        addManualParticipant: async (args: { name: string; description?: string; notes?: string; socialLinks: SocialLink[]; addToQueue?: boolean }) => {
            // Enforce 3-link maximum (take first 3 if more provided)
            const validatedSocialLinks = args.socialLinks.slice(0, 3);

            const newParticipant: Participant = {
                id: `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: args.name,
                description: args.description,
                notes: args.notes,
                socialLinks: validatedSocialLinks,
                order: 0,
                source: 'manual',
                isHere: false,
            };

            states.allParticipants.setStateImmer((participants: Participant[]) => {
                participants.push(newParticipant);
            });

            // Optionally add to queue
            if (args.addToQueue) {
                states.queuedParticipantIds.setStateImmer((ids: string[]) => {
                    ids.push(newParticipant.id);
                });
            }

            return { id: newParticipant.id };
        },
    });

    return { states, actions, userAgentState: { myParticipantIds: myParticipantIdsState } };
}

export type Actions = Awaited<ReturnType<typeof createResources>>['actions'];

springboard.registerModule('open-mic-queue', {}, async (app) => {
    const { states, actions, userAgentState } = await createResources(app);

    app.registerRoute('/', {}, () => {
        const allParticipants = states.allParticipants.useState();
        const currentPerformerId = states.currentPerformerId.useState();

        // Show WelcomePage when no performer is selected (pre-event)
        // Show DisplayPage when a performer is selected (during event)
        if (currentPerformerId === null) {
            return <WelcomePage />;
        }

        return (
            <DisplayPage
                participants={allParticipants}
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
        const allParticipants = states.allParticipants.useState();
        const queuedParticipantIds = states.queuedParticipantIds.useState();
        const currentPerformerId = states.currentPerformerId.useState();
        const googleFormUrl = states.googleFormUrl.useState();
        const songDriveWorkspaceUrl = states.songDriveWorkspaceUrl.useState();
        const showHelpText = states.showHelpText.useState();
        const autoRefreshEnabled = states.autoRefreshEnabled.useState();
        const lastSyncTimestamp = states.lastSyncTimestamp.useState();

        return (
            <BackstagePage
                allParticipants={allParticipants}
                queuedParticipantIds={queuedParticipantIds}
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
        const allParticipants = states.allParticipants.useState();
        const currentPerformerId = states.currentPerformerId.useState();

        return (
            <DisplayPage
                participants={allParticipants}
                currentPerformerId={currentPerformerId}
            />
        );
    });

    app.registerRoute('/performer/:performerId', {}, () => {
        const allParticipants = states.allParticipants.useState();
        return <PerformerProfilePage participants={allParticipants} />;
    });

    app.registerRoute('/queue', {}, () => {
        const allParticipants = states.allParticipants.useState();
        const queuedParticipantIds = states.queuedParticipantIds.useState();
        const currentPerformerId = states.currentPerformerId.useState();
        return <QueueListPage allParticipants={allParticipants} queuedParticipantIds={queuedParticipantIds} currentPerformerId={currentPerformerId} />;
    });

    return {};
})
