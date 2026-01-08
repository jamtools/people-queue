import React from 'react';
import { useParams, useNavigate } from 'react-router';
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
    fontFamilies,
} from '../styles';

type PerformerProfilePageProps = {
    participants: Participant[];
};

export function PerformerProfilePage({ participants }: PerformerProfilePageProps) {
    const { performerId } = useParams<{ performerId: string }>();
    const navigate = useNavigate();
    const performer = participants.find(p => p.id === performerId);

    if (!performer) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundImage: 'url(/assets/background.svg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
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
            backgroundImage: 'url(/assets/background.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* View Queue Button */}
            <div style={{
                position: 'fixed',
                top: `${spacing.md}px`,
                right: `${spacing.md}px`,
                zIndex: 100
            }}>
                <button
                    onClick={() => navigate('/queue')}
                    style={{
                        padding: '10px 16px',
                        backgroundColor: hexToRgba(colors.midnightCruise, 0.7),
                        color: colors.whiteNoise,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = hexToRgba(colors.midnightCruise, 0.9);
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = hexToRgba(colors.midnightCruise, 0.7);
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                    }}
                >
                    View Queue
                </button>
            </div>
            {/* Band Name Section */}
            <div style={{
                paddingTop: '120px',
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
                maxWidth: '100%',
                width: '100%',
                margin: '48px auto 0',
                padding: '0 16px',
            }}>
                <div style={{
                    backgroundColor: hexToRgba(colors.melodyMist, opacity.socialContainer),
                    borderRadius: `${borderRadius.socialContainer}px`,
                    padding: `${spacing.sm}px`,
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
                        gap: `${spacing.sm}px`,
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
                                        padding: '10px 12px',
                                        backgroundColor: hexToRgba(colors.whiteNoise, opacity.socialButton),
                                        borderRadius: `${borderRadius.medium}px`,
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
                                        <Icon size={20} />
                                    </div>

                                    {/* Handle Text */}
                                    <div style={{
                                        flex: 1,
                                        textAlign: 'center',
                                        fontSize: '15px',
                                        fontWeight: 600,
                                        fontFamily: fontFamilies.poppins,
                                        lineHeight: '1.2',
                                        color: colors.midnightCruise,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        padding: '0 10px',
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
                                        <ChevronRight size={18} />
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                )}
                </div>
            </div>

            {/* Footer - Centered Text */}
            <div style={{
                marginTop: 'auto',
                paddingTop: '48px',
                paddingBottom: `${spacing.lg}px`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
            }}>
                <span style={{
                    ...getTypographyStyle('footerText', 'mobile'),
                    fontWeight: 300,
                    color: colors.whiteNoise,
                }}>
                    Powered by
                </span>
                <span style={{
                    ...getTypographyStyle('footerText', 'mobile'),
                    fontWeight: 500,
                    color: colors.whiteNoise,
                }}>
                    SongDrive
                </span>
            </div>

            {/* Floating Logo - Bottom Left */}
            <div style={{
                position: 'fixed',
                bottom: `${spacing.md}px`,
                left: `${spacing.md}px`,
            }}>
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
