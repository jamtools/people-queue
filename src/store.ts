import { Participant } from './types';

class Store {
    private participants: Participant[] = [];
    private currentPerformerId: string | null = null;
    private listeners: Set<() => void> = new Set();

    subscribe(listener: () => void) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify() {
        this.listeners.forEach(listener => listener());
    }

    getParticipants(): Participant[] {
        return this.participants;
    }

    getCurrentPerformerId(): string | null {
        return this.currentPerformerId;
    }

    addParticipant(participant: Participant) {
        const order = this.participants.length;
        this.participants.push({ ...participant, order });
        this.notify();
    }

    updateParticipants(participants: Participant[]) {
        this.participants = participants;
        this.notify();
    }

    setCurrentPerformer(id: string | null) {
        this.currentPerformerId = id;
        this.notify();
    }
}

export const store = new Store();
