import React from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { Participant } from '../types';
import { BackgroundLayout } from '../components/BackgroundLayout';
import { colors, hexToRgba, opacity, borderRadius, spacing } from '../styles';

type QueueListPageProps = {
    allParticipants: Participant[];
    queuedParticipantIds: string[];
    currentPerformerId: string | null;
};

export function QueueListPage({ allParticipants, queuedParticipantIds, currentPerformerId }: QueueListPageProps) {
    const navigate = useNavigate();

    // Get queued participants in order
    const queuedParticipants = queuedParticipantIds
        .map(id => allParticipants.find(p => p.id === id))
        .filter((p): p is Participant => p !== undefined);

    const currentPerformer = currentPerformerId
        ? allParticipants.find(p => p.id === currentPerformerId)
        : null;

    return (
        <BackgroundLayout>
            <div style={{
                maxWidth: '100%',
                margin: '0 auto',
                padding: '40px 16px',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        alignSelf: 'flex-start',
                        padding: '8px 16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: '#333',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '24px',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'}
                >
                    ← Back
                </button>

                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: colors.whiteNoise,
                    textAlign: 'center'
                }}>
                    Performance Queue
                </h1>

                <p style={{
                    fontSize: '16px',
                    color: hexToRgba(colors.whiteNoise, 0.9),
                    textAlign: 'center',
                    marginBottom: '8px'
                }}>
                    {queuedParticipants.length} {queuedParticipants.length === 1 ? 'performer' : 'performers'} in queue
                </p>

                {currentPerformer && (
                    <p style={{
                        fontSize: '14px',
                        color: hexToRgba(colors.whiteNoise, 0.8),
                        textAlign: 'center',
                        marginBottom: '32px',
                        fontStyle: 'italic'
                    }}>
                        Now performing: {currentPerformer.name}
                    </p>
                )}

                {!currentPerformer && (
                    <div style={{ marginBottom: '24px' }} />
                )}

                {queuedParticipants.length === 0 ? (
                    <div style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        backgroundColor: hexToRgba(colors.whiteNoise, 0.9),
                        borderRadius: `${borderRadius.socialContainer}px`,
                        marginBottom: '24px'
                    }}>
                        <p style={{
                            fontSize: '18px',
                            color: '#666',
                            margin: 0
                        }}>
                            No performers in the queue yet.
                        </p>
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: hexToRgba(colors.melodyMist, opacity.socialContainer),
                        borderRadius: `${borderRadius.socialContainer}px`,
                        padding: `${spacing.sm}px`,
                        marginBottom: '40px'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: `${spacing.sm}px`
                        }}>
                            {queuedParticipants.map((participant, index) => (
                                <a
                                    key={participant.id}
                                    href={`/performer/${participant.id}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 14px',
                                        backgroundColor: hexToRgba(colors.whiteNoise, opacity.socialButton),
                                        borderRadius: `${borderRadius.medium}px`,
                                        textDecoration: 'none',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.02)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    {/* Position Number */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                        color: colors.midnightCruise,
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        minWidth: '32px'
                                    }}>
                                        {index + 1}
                                    </div>

                                    {/* Performer Name */}
                                    <div style={{
                                        flex: 1,
                                        textAlign: 'center',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        lineHeight: '1.2',
                                        color: colors.midnightCruise,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        padding: '0 12px',
                                        minWidth: 0
                                    }}>
                                        {participant.name}
                                    </div>

                                    {/* Chevron Arrow */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                        color: hexToRgba(colors.midnightCruise, opacity.arrow)
                                    }}>
                                        <ChevronRight size={24} />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </BackgroundLayout>
    );
}
