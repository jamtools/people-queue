/**
 * DisplayPage Component - Stage View (1080p Projection Display)
 *
 * Displays the currently performing artist with their name, description (if any),
 * and a QR code for audience members to scan and connect.
 *
 * Layout: Left/right split with text on left, QR code on right, logo bottom left
 */

import React from 'react';
import { useNavigate } from 'react-router';
import { Participant } from '../types';
import { BackgroundLayout } from '../components/BackgroundLayout';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { buildSocialUrl, getPlatformIcon } from '../utils/socialLinks';
import {
    colors,
    getTypographyStyle,
    getBandNameStyle,
    spacing,
    safeZones,
    qrSizes,
    dimensions,
} from '../styles';

type DisplayPageProps = {
    participants: Participant[];
    currentPerformerId: string | null;
};

export function DisplayPage({ participants, currentPerformerId }: DisplayPageProps) {
    const navigate = useNavigate();
    const currentPerformer = participants.find(p => p.id === currentPerformerId);
    const socialLinks = currentPerformer
        ? [...currentPerformer.socialLinks]
            .filter(link => link.url.trim().length > 0)
            .sort((a, b) => a.order - b.order)
            .slice(0, 3)
        : [];

    // Generate QR code URL for performer profile
    const getPerformerQRUrl = (performer: Participant): string => {
        const origin = window.location.origin;
        // Uncomment below line for local network testing
        // const origin = window.location.origin.replace('localhost', 'jam.local');
        return `${origin}/performer/${performer.id}`;
    };

    // No performer selected state
    if (!currentPerformer) {
        return (
            <BackgroundLayout>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        padding: `${spacing.xl}px`,
                        textAlign: 'center',
                    }}
                >
                    <h1
                        style={{
                            ...getTypographyStyle('headingLarge', 'kiosk'),
                            color: colors.whiteNoise,
                            marginBottom: `${spacing.md}px`,
                        }}
                    >
                        No performer selected
                    </h1>
                    <p
                        style={{
                            ...getTypographyStyle('bodySmall', 'kiosk'),
                            color: colors.whiteNoise,
                            opacity: 0.8,
                            marginBottom: `${spacing.lg}px`,
                        }}
                    >
                        Select a performer from the backstage page
                    </p>
                    <button
                        onClick={() => navigate('/backstage')}
                        style={{
                            padding: '16px 32px',
                            fontSize: '20px',
                            backgroundColor: colors.whiteNoise,
                            color: colors.bridgeDrop,
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontFamily: "'Poppins', sans-serif",
                            transition: 'opacity 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                        Go to Backstage
                    </button>
                </div>
            </BackgroundLayout>
        );
    }

    // Main display with performer
    return (
        <BackgroundLayout>
            {/* Main content container - flexbox left/right split */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '100vh',
                    padding: `${safeZones.kiosk.top}px ${safeZones.kiosk.right}px ${safeZones.kiosk.bottom}px ${safeZones.kiosk.left}px`,
                    gap: `${spacing.xxxl}px`,
                }}
            >
                {/* Left side - Text content */}
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: `${spacing.lg}px`,
                        minWidth: 0, // Allow flex item to shrink
                    }}
                >
                    {/* "Now Performing!" heading */}
                    <div
                        style={{
                            ...getTypographyStyle('headingLarge', 'kiosk'),
                            color: colors.whiteNoise,
                        }}
                    >
                        Now Performing!
                    </div>

                    {/* Band/Artist Name */}
                    <div
                        style={{
                            ...getBandNameStyle(currentPerformer.name, 'kiosk'),
                            color: colors.whiteNoise,
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                        }}
                    >
                        {currentPerformer.name}
                    </div>

                    {/* Social links (if provided) */}
                    {socialLinks.length > 0 && (
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: `${spacing.sm}px`,
                                alignItems: 'center',
                            }}
                        >
                            {socialLinks.map((link) => {
                                const Icon = getPlatformIcon(link.type);
                                const url = buildSocialUrl(link.url, link.type);

                                return (
                                    <a
                                        key={link.id}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            ...getTypographyStyle('socialHandle', 'kiosk'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: `${spacing.xs}px`,
                                            maxWidth: '420px',
                                            padding: '10px 16px',
                                            color: colors.whiteNoise,
                                            backgroundColor: 'rgba(255, 255, 255, 0.18)',
                                            border: '1px solid rgba(255, 255, 255, 0.34)',
                                            borderRadius: '999px',
                                            textDecoration: 'none',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon size={34} />
                                        </span>
                                        <span
                                            style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {link.url}
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    )}

                    {/* Description (if exists) */}
                    {currentPerformer.description && (
                        <div
                            style={{
                                ...getTypographyStyle('bodySmall', 'kiosk'),
                                color: colors.whiteNoise,
                                opacity: 0.8,
                                marginTop: `${spacing.md}px`,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {currentPerformer.description}
                        </div>
                    )}
                </div>

                {/* Right side - QR Code */}
                <div
                    style={{
                        flexShrink: 0,
                    }}
                >
                    <QRCodeDisplay
                        url={getPerformerQRUrl(currentPerformer)}
                        size={qrSizes.display}
                        description="Scan to connect with this artist"
                        descriptionColor={colors.whiteNoise}
                    />
                </div>
            </div>

            {/* Bottom left logo (absolute positioned) */}
            <div
                style={{
                    position: 'absolute',
                    bottom: `${safeZones.kiosk.bottom}px`,
                    left: `${safeZones.kiosk.left}px`,
                }}
            >
                <img
                    src="/assets/cloud_gradient_logo.png"
                    alt="SongDrive"
                    style={{
                        width: `${dimensions.logoKiosk.width}px`,
                        height: 'auto',
                    }}
                />
            </div>
        </BackgroundLayout>
    );
}
