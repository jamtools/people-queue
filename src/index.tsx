import React from 'react';
import springboard from 'springboard';
import { Participant, SocialLink } from './types';
import { SignupPage } from './pages/SignupPage';
import { SignupQRPage } from './pages/SignupQRPage';
import { BackstagePage } from './pages/BackstagePage';
import { DisplayPage } from './pages/DisplayPage';
import { PerformerProfilePage } from './pages/PerformerProfilePage';
import {ModuleAPI} from 'springboard/engine/module_api';

async function createResources(app: ModuleAPI) {
    const states = await app.createStates({
        peopleQueue: [] as Participant[],
        currentPerformerId: null as string | null,
    });

    const myParticipantIdsState = await app.statesAPI.createUserAgentState('myParticipantIds', [] as string[]);

    const actions = app.createActions({
        addParticipant: async (args: { name: string; description?: string; socialLinks: SocialLink[] }) => {
            const newParticipant: Participant = {
                id: `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: args.name,
                description: args.description,
                socialLinks: args.socialLinks,
                order: states.peopleQueue.getState().length,
            };

            states.peopleQueue.setStateImmer((queue: Participant[]) => {
                queue.push(newParticipant);
            });

            return { id: newParticipant.id };
        },

        updateParticipant: async (args: { id: string; name: string; description?: string; socialLinks: SocialLink[] }) => {
            states.peopleQueue.setStateImmer((queue: Participant[]) => {
                const participant = queue.find((p: Participant) => p.id === args.id);
                if (participant) {
                    participant.name = args.name;
                    participant.description = args.description;
                    participant.socialLinks = args.socialLinks;
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
    });

    return { states, actions, userAgentState: { myParticipantIds: myParticipantIdsState } };
}

export type Actions = Awaited<ReturnType<typeof createResources>>['actions'];

springboard.registerModule('open-mic-queue', {}, async (app) => {
    const { states, actions, userAgentState } = await createResources(app);

    app.registerRoute('/', {}, () => {
        const participants = states.peopleQueue.useState();
        const myParticipantIds = userAgentState.myParticipantIds.useState();

        const myParticipants = participants.filter(p => myParticipantIds.includes(p.id));

        return (
            <SignupPage
                actions={actions}
                onAddMyParticipantId={(id) => {
                    userAgentState.myParticipantIds.setState([...myParticipantIds, id]);
                }}
                myParticipants={myParticipants}
            />
        );
    });

    app.registerRoute('/signup-qr', {}, () => {
        return <SignupQRPage />;
    });

    app.registerRoute('/backstage', {}, () => {
        const participants = states.peopleQueue.useState();
        const currentPerformerId = states.currentPerformerId.useState();

        return (
            <BackstagePage
                participants={participants}
                currentPerformerId={currentPerformerId}
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
