import React, { useState } from 'react';
import { SocialLink, PlatformType } from '../types';
import { generateSocialLinkId, getPlatformIcon, extractUsername, buildSocialUrl } from '../utils/socialLinks';

type SocialLinksEditorProps = {
    links: SocialLink[];
    onChange: (links: SocialLink[]) => void;
    maxLinks?: number;
};

const platformOptions: { value: PlatformType; label: string }[] = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'bandcamp', label: 'Bandcamp' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'soundcloud', label: 'SoundCloud' },
    { value: 'spotify', label: 'Spotify' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'custom', label: 'Custom Link' },
];

type LinkItemProps = {
    link: SocialLink;
    onUpdate: (id: string, value: string) => void;
    onUpdateType: (id: string, type: PlatformType) => void;
    onDelete: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
};

function LinkItem({ link, onUpdate, onUpdateType, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: LinkItemProps) {
    const icon = getPlatformIcon(link.type);
    const [showPlatformMenu, setShowPlatformMenu] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(link.id, e.target.value);
    };

    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                    type="button"
                    onClick={() => onMoveUp(link.id)}
                    disabled={!canMoveUp}
                    style={{ fontSize: '12px', padding: '2px 6px', cursor: canMoveUp ? 'pointer' : 'not-allowed' }}
                    title="Move up"
                >
                    ▲
                </button>
                <button
                    type="button"
                    onClick={() => onMoveDown(link.id)}
                    disabled={!canMoveDown}
                    style={{ fontSize: '12px', padding: '2px 6px', cursor: canMoveDown ? 'pointer' : 'not-allowed' }}
                    title="Move down"
                >
                    ▼
                </button>
            </div>

            <div style={{ position: 'relative' }}>
                <button
                    type="button"
                    onClick={() => setShowPlatformMenu(!showPlatformMenu)}
                    style={{ fontSize: '20px', padding: '8px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px' }}
                    title="Change platform"
                >
                    {icon}
                </button>
                {showPlatformMenu && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        marginTop: '4px',
                        zIndex: 1000,
                        minWidth: '150px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                        {platformOptions.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => {
                                    onUpdateType(link.id, option.value);
                                    setShowPlatformMenu(false);
                                }}
                                style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                                <span>{getPlatformIcon(option.value)}</span>
                                <span>{option.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <input
                type="text"
                placeholder="username or URL"
                value={link.url ? extractUsername(buildSocialUrl(link.url, link.type), link.type) : link.url}
                onChange={handleChange}
                style={{ flex: 1, padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
            />

            <button
                type="button"
                onClick={() => onDelete(link.id)}
                style={{ padding: '8px 12px', cursor: 'pointer', color: '#d32f2f' }}
                title="Delete"
            >
                🗑️
            </button>
        </div>
    );
}

export function SocialLinksEditor({ links, onChange, maxLinks = 15 }: SocialLinksEditorProps) {
    const handleUpdate = (id: string, url: string) => {
        const updatedLinks = links.map((link) =>
            link.id === id ? { ...link, url } : link
        );
        onChange(updatedLinks);
    };

    const handleUpdateType = (id: string, type: PlatformType) => {
        const updatedLinks = links.map((link) =>
            link.id === id ? { ...link, type } : link
        );
        onChange(updatedLinks);
    };

    const handleDelete = (id: string) => {
        const filteredLinks = links.filter((link) => link.id !== id);
        const reorderedLinks = filteredLinks.map((link, index) => ({
            ...link,
            order: index,
        }));
        onChange(reorderedLinks);
    };

    const handleMoveUp = (id: string) => {
        const index = links.findIndex(link => link.id === id);
        if (index > 0) {
            const newLinks = [...links];
            [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
            onChange(newLinks.map((link, i) => ({ ...link, order: i })));
        }
    };

    const handleMoveDown = (id: string) => {
        const index = links.findIndex(link => link.id === id);
        if (index < links.length - 1) {
            const newLinks = [...links];
            [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
            onChange(newLinks.map((link, i) => ({ ...link, order: i })));
        }
    };

    const handleAdd = () => {
        const newLink: SocialLink = {
            id: generateSocialLinkId(),
            type: 'instagram',
            url: '',
            order: links.length,
        };
        onChange([...links, newLink]);
    };

    const canAddMore = links.length < maxLinks;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {links.map((link, index) => (
                <LinkItem
                    key={link.id}
                    link={link}
                    onUpdate={handleUpdate}
                    onUpdateType={handleUpdateType}
                    onDelete={handleDelete}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    canMoveUp={index > 0}
                    canMoveDown={index < links.length - 1}
                />
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!canAddMore}
                    style={{
                        padding: '8px 16px',
                        cursor: canAddMore ? 'pointer' : 'not-allowed',
                        opacity: canAddMore ? 1 : 0.5
                    }}
                >
                    ➕ Add Link
                </button>
                {!canAddMore && (
                    <span style={{ fontSize: '12px', color: '#666' }}>
                        Maximum {maxLinks} links
                    </span>
                )}
            </div>
        </div>
    );
}
