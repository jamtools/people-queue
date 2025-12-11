import React, { useState, useEffect } from 'react';
import springboard from 'springboard';
import { store } from './store';
import { Participant } from './types';
import { SignupPage } from './pages/SignupPage';
import { BackstagePage } from './pages/BackstagePage';
import { DisplayPage } from './pages/DisplayPage';
import { PerformerProfilePage } from './pages/PerformerProfilePage';

function useStore() {
    const [, forceUpdate] = useState({});

    useEffect(() => {
        return store.subscribe(() => forceUpdate({}));
    }, []);

    return {
        participants: store.getParticipants(),
        currentPerformerId: store.getCurrentPerformerId(),
        addParticipant: (p: Participant) => store.addParticipant(p),
        updateParticipants: (ps: Participant[]) => store.updateParticipants(ps),
        setCurrentPerformer: (id: string | null) => store.setCurrentPerformer(id),
    };
}

springboard.registerModule('open-mic-queue', {}, async (app) => {
    app.registerRoute('/', {}, () => {
        const { participants, addParticipant } = useStore();
        return <SignupPage onAddParticipant={addParticipant} />;
    });

    app.registerRoute('/backstage', {}, () => {
        const { participants, currentPerformerId, updateParticipants, setCurrentPerformer } = useStore();
        return (
            <BackstagePage
                participants={participants}
                onUpdateParticipants={updateParticipants}
                onSetCurrentPerformer={setCurrentPerformer}
                currentPerformerId={currentPerformerId}
            />
        );
    });

    app.registerRoute('/display', {}, () => {
        const { participants, currentPerformerId } = useStore();
        return (
            <DisplayPage
                participants={participants}
                currentPerformerId={currentPerformerId}
            />
        );
    });

    app.registerRoute('/performer/:performerId', {}, () => {
        const { participants } = useStore();
        return <PerformerProfilePage participants={participants} />;
    });

    return {};
})