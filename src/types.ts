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
    source?: 'sheets' | 'manual';
    sheetRowId?: number;
};
