import React from 'react';
import springboard from 'springboard';
import { EventQueue, Participant, SocialLink } from './types';
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

const DEFAULT_EVENT_ID = 'event-open-stage-night';
const DEFAULT_EVENT_NAME = 'Open Stage Night';
const DEFAULT_SONGDRIVE_INVITE_URL = 'https://songdrive.app/invite/be8dbd0d263e602db70a3c252e';

async function createResources(app: ModuleAPI) {
    const states = await app.createStates({
        allParticipants: [] as Participant[], // All signed-up people
        queuedParticipantIds: [] as string[], // IDs of participants in the performance queue
        currentPerformerId: null as string | null,
        events: [{
            id: DEFAULT_EVENT_ID,
            name: DEFAULT_EVENT_NAME,
            queuedParticipantIds: [],
            currentPerformerId: null,
            createdAt: Date.now(),
        }] as EventQueue[],
        activeEventId: DEFAULT_EVENT_ID as string,
        googleFormUrl: '' as string,
        songDriveWorkspaceUrl: '' as string,
        songDriveInviteUrl: DEFAULT_SONGDRIVE_INVITE_URL as string,
        showHelpText: false as boolean,
        autoRefreshEnabled: false as boolean,
        lastSyncTimestamp: null as number | null,
    });

    const myParticipantIdsState = await app.statesAPI.createUserAgentState('myParticipantIds', [] as string[]);

    const getActiveEvent = (): EventQueue => {
        const events = states.events.getState();
        const activeEventId = states.activeEventId.getState();
        return events.find((event) => event.id === activeEventId) ?? events[0] ?? {
            id: DEFAULT_EVENT_ID,
            name: DEFAULT_EVENT_NAME,
            queuedParticipantIds: [],
            currentPerformerId: null,
            createdAt: Date.now(),
        };
    };

    const addParticipantToActiveEventQueue = (participantId: string) => {
        const activeEventId = getActiveEvent().id;
        states.events.setStateImmer((events: EventQueue[]) => {
            let event = events.find((item) => item.id === activeEventId);
            if (!event) {
                event = {
                    id: DEFAULT_EVENT_ID,
                    name: DEFAULT_EVENT_NAME,
                    queuedParticipantIds: [],
                    currentPerformerId: null,
                    createdAt: Date.now(),
                };
                events.push(event);
            }

            if (!event.queuedParticipantIds.includes(participantId)) {
                event.queuedParticipantIds.push(participantId);
            }
        });
    };

    const removeParticipantFromAllEventQueues = (participantId: string) => {
        states.events.setStateImmer((events: EventQueue[]) => {
            for (const event of events) {
                const index = event.queuedParticipantIds.findIndex((id) => id === participantId);
                if (index !== -1) {
                    event.queuedParticipantIds.splice(index, 1);
                }
                if (event.currentPerformerId === participantId) {
                    event.currentPerformerId = null;
                }
            }
        });
    };

    const actions = app.createActions({
        addParticipant: async (args: { name: string; description?: string; socialLinks: SocialLink[]; notes?: string; source?: 'sheets' | 'manual' | 'signup'; sheetRowId?: number; addToQueue?: boolean }) => {
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
                addParticipantToActiveEventQueue(newParticipant.id);
            }

            return { id: newParticipant.id };
        },

        signupParticipant: async (args: { participantId?: string; name: string; description?: string; socialLinks: SocialLink[]; notes?: string }) => {
            const validatedSocialLinks = args.socialLinks.slice(0, 3);
            let participantId = args.participantId;

            if (participantId) {
                let didUpdate = false;
                states.allParticipants.setStateImmer((participants: Participant[]) => {
                    const participant = participants.find((p: Participant) => p.id === participantId);
                    if (participant) {
                        participant.name = args.name;
                        participant.description = args.description;
                        participant.socialLinks = validatedSocialLinks;
                        participant.notes = args.notes;
                        participant.source = 'signup';
                        didUpdate = true;
                    }
                });

                if (!didUpdate) {
                    participantId = undefined;
                }
            }

            if (!participantId) {
                participantId = `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const newParticipant: Participant = {
                    id: participantId,
                    name: args.name,
                    description: args.description,
                    socialLinks: validatedSocialLinks,
                    order: 0,
                    notes: args.notes,
                    source: 'signup',
                    isHere: false,
                };

                states.allParticipants.setStateImmer((participants: Participant[]) => {
                    participants.push(newParticipant);
                });
            }

            addParticipantToActiveEventQueue(participantId);
            return { id: participantId };
        },

        updateParticipant: async (args: { id: string; name: string; description?: string; socialLinks: SocialLink[]; notes?: string; source?: 'sheets' | 'manual' | 'signup'; sheetRowId?: number }) => {
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
            addParticipantToActiveEventQueue(args.id);
        },

        removeFromQueue: async (args: { id: string }) => {
            const activeEventId = getActiveEvent().id;
            states.events.setStateImmer((events: EventQueue[]) => {
                const event = events.find((item) => item.id === activeEventId);
                if (!event) return;
                const index = event.queuedParticipantIds.findIndex((id: string) => id === args.id);
                if (index !== -1) event.queuedParticipantIds.splice(index, 1);
                if (event.currentPerformerId === args.id) {
                    event.currentPerformerId = null;
                }
            });
        },

        reorderQueue: async (args: { participantIds: string[] }) => {
            const activeEventId = getActiveEvent().id;
            states.events.setStateImmer((events: EventQueue[]) => {
                const event = events.find((item) => item.id === activeEventId);
                if (event) {
                    event.queuedParticipantIds = args.participantIds;
                }
            });
        },

        removeParticipant: async (args: { id: string }) => {
            // Remove from allParticipants
            states.allParticipants.setStateImmer((participants: Participant[]) => {
                const index = participants.findIndex((p: Participant) => p.id === args.id);
                if (index !== -1) {
                    participants.splice(index, 1);
                }
            });

            removeParticipantFromAllEventQueues(args.id);
        },

        setCurrentPerformer: async (args: { id: string | null }) => {
            const activeEventId = getActiveEvent().id;
            states.events.setStateImmer((events: EventQueue[]) => {
                const event = events.find((item) => item.id === activeEventId);
                if (event) {
                    event.currentPerformerId = args.id;
                }
            });
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
                addParticipantToActiveEventQueue(newParticipant.id);
            }

            return { id: newParticipant.id };
        },

        createEvent: async (args: { name: string }) => {
            const trimmedName = args.name.trim();
            if (!trimmedName) return {};
            const event: EventQueue = {
                id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: trimmedName,
                queuedParticipantIds: [],
                currentPerformerId: null,
                createdAt: Date.now(),
            };
            states.events.setStateImmer((events: EventQueue[]) => {
                events.push(event);
            });
            states.activeEventId.setState(event.id);
            return { id: event.id };
        },

        setActiveEvent: async (args: { id: string }) => {
            const exists = states.events.getState().some((event) => event.id === args.id);
            if (exists) states.activeEventId.setState(args.id);
            return {};
        },

        renameEvent: async (args: { id: string; name: string }) => {
            const trimmedName = args.name.trim();
            if (!trimmedName) return {};
            states.events.setStateImmer((events: EventQueue[]) => {
                const event = events.find((item) => item.id === args.id);
                if (event) event.name = trimmedName;
            });
            return {};
        },

        setSongDriveInviteUrl: async (args: { url: string }) => {
            states.songDriveInviteUrl.setState(args.url);
            return {};
        },
    });

    return { states, actions, userAgentState: { myParticipantIds: myParticipantIdsState } };
}

export type Actions = Awaited<ReturnType<typeof createResources>>['actions'];

springboard.registerModule('open-mic-queue', {}, async (app) => {
    const { states, actions, userAgentState } = await createResources(app);

    app.registerRoute('/', {}, () => {
        const allParticipants = states.allParticipants.useState();
        const events = states.events.useState();
        const activeEventId = states.activeEventId.useState();
        const activeEvent = events.find((event) => event.id === activeEventId) ?? events[0];
        const currentPerformerId = activeEvent?.currentPerformerId ?? null;

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

    app.registerRoute('/signup', {}, () => {
        const allParticipants = states.allParticipants.useState();
        const events = states.events.useState();
        const activeEventId = states.activeEventId.useState();
        const songDriveInviteUrl = states.songDriveInviteUrl.useState();
        const myParticipantIds = userAgentState.myParticipantIds.useState();
        const myParticipants = allParticipants.filter((participant) => myParticipantIds.includes(participant.id));
        const activeEvent = events.find((event) => event.id === activeEventId) ?? events[0];

        return (
            <SignupPage
                actions={actions}
                activeEvent={activeEvent}
                myParticipants={myParticipants}
                songDriveInviteUrl={songDriveInviteUrl}
                onAddMyParticipantId={(id) => {
                    userAgentState.myParticipantIds.setStateImmer((ids: string[]) => {
                        if (!ids.includes(id)) ids.push(id);
                    });
                }}
            />
        );
    });

    app.registerRoute('/backstage', {}, () => {
        const allParticipants = states.allParticipants.useState();
        const events = states.events.useState();
        const activeEventId = states.activeEventId.useState();
        const activeEvent = events.find((event) => event.id === activeEventId) ?? events[0];
        const queuedParticipantIds = activeEvent?.queuedParticipantIds ?? [];
        const currentPerformerId = activeEvent?.currentPerformerId ?? null;
        const googleFormUrl = states.googleFormUrl.useState();
        const songDriveWorkspaceUrl = states.songDriveWorkspaceUrl.useState();
        const songDriveInviteUrl = states.songDriveInviteUrl.useState();
        const showHelpText = states.showHelpText.useState();
        const autoRefreshEnabled = states.autoRefreshEnabled.useState();
        const lastSyncTimestamp = states.lastSyncTimestamp.useState();

        return (
            <BackstagePage
                allParticipants={allParticipants}
                queuedParticipantIds={queuedParticipantIds}
                currentPerformerId={currentPerformerId}
                events={events}
                activeEventId={activeEventId}
                googleFormUrl={googleFormUrl}
                songDriveWorkspaceUrl={songDriveWorkspaceUrl}
                songDriveInviteUrl={songDriveInviteUrl}
                showHelpText={showHelpText}
                autoRefreshEnabled={autoRefreshEnabled}
                lastSyncTimestamp={lastSyncTimestamp}
                actions={actions}
            />
        );
    });

    app.registerRoute('/display', {}, () => {
        const allParticipants = states.allParticipants.useState();
        const events = states.events.useState();
        const activeEventId = states.activeEventId.useState();
        const activeEvent = events.find((event) => event.id === activeEventId) ?? events[0];
        const currentPerformerId = activeEvent?.currentPerformerId ?? null;

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
        const events = states.events.useState();
        const activeEventId = states.activeEventId.useState();
        const activeEvent = events.find((event) => event.id === activeEventId) ?? events[0];
        const queuedParticipantIds = activeEvent?.queuedParticipantIds ?? [];
        const currentPerformerId = activeEvent?.currentPerformerId ?? null;
        return <QueueListPage allParticipants={allParticipants} queuedParticipantIds={queuedParticipantIds} currentPerformerId={currentPerformerId} eventName={activeEvent?.name ?? DEFAULT_EVENT_NAME} />;
    });

    return {};
})
