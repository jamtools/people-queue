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
