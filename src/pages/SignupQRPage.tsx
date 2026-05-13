/**
 * SignupQRPage Component
 *
 * Displays dual QR codes: Google Form signup + SongDrive Workspace
 * Optionally shows help text for uploading backing tracks
 */

import React from 'react';
import { BackgroundLayout } from '../components/BackgroundLayout';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { colors, getTypographyStyle, qrSizes, spacing } from '../styles';

type SignupQRPageProps = {
    googleFormUrl: string;
    songDriveWorkspaceUrl: string;
    showHelpText: boolean;
};

export function SignupQRPage({
    googleFormUrl,
    songDriveWorkspaceUrl,
    showHelpText
}: SignupQRPageProps) {
    return (
        <BackgroundLayout>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: `${spacing.xl}px`,
                }}
            >
                {/* Dual QR Code Container */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: `${spacing.xxxl}px`,
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        marginBottom: showHelpText ? `${spacing.xl}px` : '0',
                    }}
                >
                    {/* Left QR: Google Form Signup */}
                    {googleFormUrl ? (
                        <QRCodeDisplay
                            url={googleFormUrl}
                            size={qrSizes.signup}
                            description="Sign up to perform tonight"
                        />
                    ) : (
                        <div
                            style={{
                                ...getTypographyStyle('headingMedium', 'kiosk'),
                                color: colors.whiteNoise,
                                backgroundColor: 'rgba(255, 195, 0, 0.9)',
                                padding: `${spacing.md}px`,
                                borderRadius: '12px',
                                maxWidth: '400px',
                                textAlign: 'center',
                            }}
                        >
                            Google Form URL not configured. Please set it in Backstage.
                        </div>
                    )}

                    {/* Right QR: SongDrive Workspace */}
                    {songDriveWorkspaceUrl ? (
                        <QRCodeDisplay
                            url={songDriveWorkspaceUrl}
                            size={qrSizes.signup}
                            description="Upload backing tracks & demos"
                        />
                    ) : (
                        <div
                            style={{
                                ...getTypographyStyle('headingMedium', 'kiosk'),
                                color: colors.whiteNoise,
                                backgroundColor: 'rgba(255, 195, 0, 0.9)',
                                padding: `${spacing.md}px`,
                                borderRadius: '12px',
                                maxWidth: '400px',
                                textAlign: 'center',
                            }}
                        >
                            SongDrive Workspace URL not configured. Please set it in Backstage.
                        </div>
                    )}
                </div>

                {/* Optional Help Text */}
                {showHelpText && (
                    <div
                        style={{
                            textAlign: 'center',
                            maxWidth: '800px',
                        }}
                    >
                        <div
                            style={{
                                ...getTypographyStyle('headingLarge', 'kiosk'),
                                color: colors.whiteNoise,
                                marginBottom: `${spacing.sm}px`,
                            }}
                        >
                            Need Help Uploading?
                        </div>
                        <div
                            style={{
                                ...getTypographyStyle('bodySmall', 'kiosk'),
                                color: colors.whiteNoise,
                            }}
                        >
                            Please talk to Michael at (location)
                        </div>
                    </div>
                )}
            </div>
        </BackgroundLayout>
    );
}
