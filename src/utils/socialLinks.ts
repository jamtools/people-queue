import React from 'react';
import { PlatformType } from '../types';
import {
    IconBrandInstagram,
    IconBrandFacebook,
    IconBrandSoundcloud,
    IconBrandSpotify,
    IconBrandTwitter,
    IconBrandYoutube,
    IconBrandTiktok,
    IconLink,
} from '@tabler/icons-react';

export function generateSocialLinkId(): string {
    return `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateParticipantId(): string {
    return `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const BandcampIcon = () => {
    return React.createElement(
        'svg',
        { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'currentColor' },
        React.createElement('path', { d: 'M0 18.75l7.437-13.5h16.563l-7.438 13.5z' })
    );
};

export function getPlatformIcon(type: PlatformType): React.ComponentType<{ size?: number }> {
    switch (type) {
        case 'instagram':
            return IconBrandInstagram;
        case 'facebook':
            return IconBrandFacebook;
        case 'soundcloud':
            return IconBrandSoundcloud;
        case 'spotify':
            return IconBrandSpotify;
        case 'twitter':
            return IconBrandTwitter;
        case 'youtube':
            return IconBrandYoutube;
        case 'tiktok':
            return IconBrandTiktok;
        case 'bandcamp':
            return BandcampIcon;
        case 'custom':
            return IconLink;
        default:
            return IconLink;
    }
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
