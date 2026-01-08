import React from 'react';
import { useParams } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { Participant } from '../types';
import { buildSocialUrl, getPlatformIcon } from '../utils/socialLinks';
import {
    colors,
    opacity,
    hexToRgba,
    getBandNameStyle,
    getTypographyStyle,
    spacing,
    borderRadius,
    dimensions,
} from '../styles';

type PerformerProfilePageProps = {
    participants: Participant[];
};

export function PerformerProfilePage({ participants }: PerformerProfilePageProps) {
    const { performerId } = useParams<{ performerId: string }>();
    const performer = participants.find(p => p.id === performerId);

    if (!performer) {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${colors.bridgeDrop} 0%, ${colors.cloudSync} 100%)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
            }}>
                <h1 style={{
                    color: colors.whiteNoise,
                    fontSize: '32px',
                    margin: '0 0 16px 0',
                }}>
                    Performer not found
                </h1>
                <p style={{
                    color: hexToRgba(colors.whiteNoise, 0.8),
                    fontSize: '18px',
                    margin: 0,
                }}>
                    This performer may have been removed from the queue
                </p>
            </div>
        );
    }

    // Sort links by order and take max 3
    const sortedLinks = [...performer.socialLinks]
        .sort((a, b) => a.order - b.order)
        .slice(0, 3);

    return (
        <div style={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${colors.bridgeDrop} 0%, ${colors.cloudSync} 100%)`,
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Band Name Section */}
            <div style={{
                paddingTop: '40px',
                textAlign: 'center',
            }}>
                <h1 style={{
                    ...getBandNameStyle(performer.name, 'mobile'),
                    color: colors.whiteNoise,
                    margin: 0,
                    wordWrap: 'break-word',
                    padding: '0 20px',
                }}>
                    {performer.name}
                </h1>
            </div>

            {/* Description Section */}
            {performer.description && (
                <div style={{
                    marginTop: '16px',
                    textAlign: 'center',
                    padding: '0 20px',
                }}>
                    <p style={{
                        ...getTypographyStyle('body', 'mobile'),
                        color: hexToRgba(colors.whiteNoise, 0.8),
                        margin: 0,
                    }}>
                        {performer.description}
                    </p>
                </div>
            )}

            {/* Social Links Container */}
            <div style={{
                maxWidth: '500px',
                width: '100%',
                margin: '48px auto 0',
                padding: '0 20px',
            }}>
                <div style={{
                    backgroundColor: hexToRgba(colors.melodyMist, opacity.socialContainer),
                    borderRadius: `${borderRadius.socialContainer}px`,
                    padding: `${spacing.md}px`,
                }}>
                {sortedLinks.length === 0 ? (
                    <div style={{
                        ...getTypographyStyle('body', 'mobile'),
                        color: colors.whiteNoise,
                        textAlign: 'center',
                    }}>
                        No social links added yet
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: `${spacing.md}px`,
                    }}>
                        {sortedLinks.map((link) => {
                            const url = buildSocialUrl(link.url, link.type);
                            const Icon = getPlatformIcon(link.type);

                            return (
                                <a
                                    key={link.id}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: `${spacing.sm}px`,
                                        backgroundColor: hexToRgba(colors.whiteNoise, opacity.socialButton),
                                        borderRadius: `${borderRadius.socialButton}px`,
                                        textDecoration: 'none',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.02)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    {/* Platform Icon */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                        color: colors.midnightCruise,
                                    }}>
                                        <Icon size={24} />
                                    </div>

                                    {/* Handle Text */}
                                    <div style={{
                                        flex: 1,
                                        textAlign: 'center',
                                        ...getTypographyStyle('body', 'mobile'),
                                        fontWeight: 600,
                                        color: colors.midnightCruise,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        padding: `0 ${spacing.sm}px`,
                                        minWidth: 0, // Allow flex item to shrink below content size
                                    }}>
                                        {link.url}
                                    </div>

                                    {/* Chevron Arrow */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                        color: hexToRgba(colors.midnightCruise, opacity.arrow),
                                    }}>
                                        <ChevronRight size={20} />
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                )}
                </div>
            </div>

            {/* Footer */}
            <div style={{
                marginTop: 'auto',
                paddingTop: '48px',
                paddingBottom: `${spacing.lg}px`,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${spacing.sm}px`,
            }}>
                <span style={{
                    ...getTypographyStyle('footerText', 'mobile'),
                    color: colors.whiteNoise,
                }}>
                    Powered by SongDrive
                </span>
                <img
                    src="/assets/cloud_gradient_logo.png"
                    alt="SongDrive"
                    style={{
                        height: `${dimensions.footerLogoHeight}px`,
                        width: 'auto',
                    }}
                />
            </div>
        </div>
    );
}
