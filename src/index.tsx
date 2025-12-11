import React from 'react';
import springboard from 'springboard';
import { Participant, SocialLink } from './types';
import { SignupPage } from './pages/SignupPage';
import { BackstagePage } from './pages/BackstagePage';
import { DisplayPage } from './pages/DisplayPage';
import { PerformerProfilePage } from './pages/PerformerProfilePage';

async function createResources(app: typeof springboard.modules[string]) {
    const states = await app.createStates({
        peopleQueue: [] as Participant[],
        currentPerformerId: null as string | null,
    });

    const userAgentState = await app.createUserAgentState({
        myParticipantId: null as string | null,
    });

    const actions = app.createActions({
        addParticipant: async (args: { name: string; socialLinks: SocialLink[] }) => {
            const newParticipant: Participant = {
                id: `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: args.name,
                socialLinks: args.socialLinks,
                order: states.peopleQueue.getState().length,
            };

            states.peopleQueue.setStateImmer(queue => {
                queue.push(newParticipant);
            });

            return newParticipant.id;
        },

        updateParticipant: async (args: { id: string; name: string; socialLinks: SocialLink[] }) => {
            states.peopleQueue.setStateImmer(queue => {
                const participant = queue.find(p => p.id === args.id);
                if (participant) {
                    participant.name = args.name;
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
            states.peopleQueue.setStateImmer(queue => {
                const index = queue.findIndex(p => p.id === args.id);
                if (index !== -1) {
                    queue.splice(index, 1);
                    queue.forEach((p, i) => {
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

    return { states, actions, userAgentState };
}

export type Actions = Awaited<ReturnType<typeof createResources>>['actions'];

springboard.registerModule('open-mic-queue', {}, async (app) => {
    const { states, actions, userAgentState } = await createResources(app);

    app.registerRoute('/', {}, () => {
        const participants = states.peopleQueue.useState();
        const myParticipantId = userAgentState.myParticipantId.useState();

        return (
            <SignupPage
                actions={actions}
                onSetMyParticipantId={(id) => userAgentState.myParticipantId.setState(id)}
                myParticipantId={myParticipantId}
            />
        );
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