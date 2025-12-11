import { PlatformType } from '../types';

export function generateSocialLinkId(): string {
    return `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateParticipantId(): string {
    return `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getPlatformIcon(type: PlatformType): string {
    const icons: Record<PlatformType, string> = {
        instagram: '📷',
        bandcamp: '🎵',
        facebook: '👥',
        soundcloud: '☁️',
        spotify: '🎧',
        twitter: '🐦',
        youtube: '▶️',
        tiktok: '🎬',
        custom: '🔗',
    };
    return icons[type] || '🔗';
}

export function extractUsername(url: string, type: PlatformType): string {
    if (!url) return '';

    try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        const path = urlObj.pathname.replace(/^\//, '').replace(/\/$/, '');
        return path || url;
    } catch {
        return url;
    }
}

export function buildSocialUrl(input: string, type: PlatformType): string {
    if (!input) return '';

    if (input.startsWith('http://') || input.startsWith('https://')) {
        return input;
    }

    const username = input.replace(/^@/, '');

    const baseUrls: Record<PlatformType, string> = {
        instagram: 'https://instagram.com/',
        bandcamp: 'https://',
        facebook: 'https://facebook.com/',
        soundcloud: 'https://soundcloud.com/',
        spotify: 'https://open.spotify.com/artist/',
        twitter: 'https://twitter.com/',
        youtube: 'https://youtube.com/@',
        tiktok: 'https://tiktok.com/@',
        custom: '',
    };

    if (type === 'bandcamp' && !username.includes('.bandcamp.com')) {
        return `https://${username}.bandcamp.com`;
    }

    return baseUrls[type] + username;
}
