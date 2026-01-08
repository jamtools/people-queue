import React from 'react';
import { useParams } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { Participant } from '../types';
import { buildSocialUrl, getPlatformIcon } from '../utils/socialLinks';
import { BackgroundLayout } from '../components/BackgroundLayout';
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
            <BackgroundLayout>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: `${spacing.xl}px ${spacing.md}px`,
                    textAlign: 'center',
                }}>
                    <h1 style={{
                        ...getTypographyStyle('headingLarge', 'mobile'),
                        color: colors.whiteNoise,
                        margin: '0 0 16px 0',
                    }}>
                        Performer not found
                    </h1>
                    <p style={{
                        ...getTypographyStyle('body', 'mobile'),
                        color: hexToRgba(colors.whiteNoise, 0.8),
                        margin: 0,
                    }}>
                        This performer may have been removed from the queue
                    </p>
                </div>
            </BackgroundLayout>
        );
    }

    // Sort links by order and take max 3
    const sortedLinks = [...performer.socialLinks]
        .sort((a, b) => a.order - b.order)
        .slice(0, 3);

    return (
        <BackgroundLayout>
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                padding: `${spacing.md}px`,
            }}>
                {/* Band Name Section */}
                <div style={{
                    paddingTop: `${spacing.xxl}px`,
                    textAlign: 'center',
                }}>
                    <h1 style={{
                        ...getBandNameStyle(performer.name, 'mobile'),
                        color: colors.whiteNoise,
                        margin: 0,
                    }}>
                        {performer.name}
                    </h1>
                </div>

                {/* Description Section */}
                {performer.description && (
                    <div style={{
                        marginTop: `${spacing.sm}px`,
                        textAlign: 'center',
                    }}>
                        <p style={{
                            ...getTypographyStyle('body', 'mobile'),
                            color: hexToRgba(colors.whiteNoise, 0.8),
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            padding: `0 ${spacing.md}px`,
                        }}>
                            {performer.description}
                        </p>
                    </div>
                )}

                {/* Social Links Container */}
                <div style={{
                    maxWidth: '500px',
                    width: '100%',
                    margin: `${spacing.xl}px auto`,
                    backgroundColor: hexToRgba(colors.melodyMist, opacity.socialContainer),
                    borderRadius: `${borderRadius.socialContainer}px`,
                    padding: `${spacing.lg}px`,
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
                                            height: `${dimensions.socialButton.height}px`,
                                            padding: `0 ${spacing.md}px`,
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
                                            color: colors.midnightCruise,
                                        }}>
                                            <Icon size={dimensions.socialButton.iconSize} />
                                        </div>

                                        {/* Handle Text */}
                                        <div style={{
                                            flex: 1,
                                            textAlign: 'center',
                                            ...getTypographyStyle('socialHandle', 'mobile'),
                                            color: colors.midnightCruise,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            padding: `0 ${spacing.sm}px`,
                                        }}>
                                            {link.url}
                                        </div>

                                        {/* Chevron Arrow */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: hexToRgba(colors.midnightCruise, opacity.arrow),
                                        }}>
                                            <ChevronRight size={dimensions.socialButton.chevronSize} />
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: 'auto',
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
        </BackgroundLayout>
    );
}
