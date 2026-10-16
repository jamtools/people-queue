export type PlatformType = 'instagram' | 'bandcamp' | 'facebook' | 'soundcloud' | 'spotify' | 'twitter' | 'youtube' | 'tiktok' | 'custom';

export type SocialLink = {
    id: string;
    type: PlatformType;
    url: string;
    order: number;
};

export type Participant = {
    id: string;
    name: string;
    description?: string;
    socialLinks: SocialLink[];
    order: number;
    isCurrentlyPerforming?: boolean;
    notes?: string;
    source?: 'sheets' | 'manual' | 'signup';
    sheetRowId?: number;
    isHere?: boolean; // Whether the performer is physically present
};

export type EventQueue = {
    id: string;
    name: string;
    queuedParticipantIds: string[];
    currentPerformerId: string | null;
    createdAt: number;
};
