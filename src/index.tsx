import React from 'react';
import springboard from 'springboard';
import { Participant, SocialLink } from './types';
import { SignupPage, SignupPageActions } from './pages/SignupPage';
import { BackstagePage, BackstagePageActions } from './pages/BackstagePage';
import { DisplayPage } from './pages/DisplayPage';
import { PerformerProfilePage } from './pages/PerformerProfilePage';

type AddParticipantArgs = {
    name: string;
    socialLinks: SocialLink[];
};

type UpdateParticipantArgs = {
    id: string;
    name: string;
    socialLinks: SocialLink[];
};

type ReorderParticipantsArgs = {
    participants: Participant[];
};

type RemoveParticipantArgs = {
    id: string;
};

type SetCurrentPerformerArgs = {
    id: string | null;
};

springboard.registerModule('open-mic-queue', {}, async (app) => {
    const states = await app.createStates({
        peopleQueue: [] as Participant[],
        currentPerformerId: null as string | null,
    });

    const userAgentState = await app.createUserAgentState({
        myParticipantId: null as string | null,
    });

    const actions = app.createActions({
        addParticipant: async (args: AddParticipantArgs) => {
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

        updateParticipant: async (args: UpdateParticipantArgs) => {
            states.peopleQueue.setStateImmer(queue => {
                const participant = queue.find(p => p.id === args.id);
                if (participant) {
                    participant.name = args.name;
                    participant.socialLinks = args.socialLinks;
                }
            });
        },

        reorderParticipants: async (args: ReorderParticipantsArgs) => {
            states.peopleQueue.setState(
                args.participants.map((p, index) => ({ ...p, order: index }))
            );
        },

        removeParticipant: async (args: RemoveParticipantArgs) => {
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

        setCurrentPerformer: async (args: SetCurrentPerformerArgs) => {
            states.currentPerformerId.setState(args.id);
        },
    } satisfies SignupPageActions & BackstagePageActions);

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