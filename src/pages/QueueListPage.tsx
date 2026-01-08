import React from 'react';
import { useNavigate } from 'react-router';
import { Participant } from '../types';
import { BackgroundLayout } from '../components/BackgroundLayout';

type QueueListPageProps = {
    allParticipants: Participant[];
    queuedParticipantIds: string[];
};

export function QueueListPage({ allParticipants, queuedParticipantIds }: QueueListPageProps) {
    const navigate = useNavigate();

    // Get queued participants in order
    const queuedParticipants = queuedParticipantIds
        .map(id => allParticipants.find(p => p.id === id))
        .filter((p): p is Participant => p !== undefined);

    return (
        <BackgroundLayout>
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '40px 20px',
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
                    color: 'white',
                    textAlign: 'center'
                }}>
                    Performance Queue
                </h1>

                <p style={{
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    textAlign: 'center',
                    marginBottom: '32px'
                }}>
                    {queuedParticipants.length} {queuedParticipants.length === 1 ? 'performer' : 'performers'} in queue
                </p>

                {queuedParticipants.length === 0 ? (
                    <div style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
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
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        marginBottom: '40px'
                    }}>
                        {queuedParticipants.map((participant, index) => (
                            <a
                                key={participant.id}
                                href={`/performer/${participant.id}`}
                                style={{
                                    display: 'block',
                                    padding: '20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                    border: '2px solid transparent'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                                    e.currentTarget.style.borderColor = '#1976d2';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px'
                                }}>
                                    <div style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: '#1976d2',
                                        minWidth: '40px'
                                    }}>
                                        {index + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: '#333',
                                            marginBottom: '4px'
                                        }}>
                                            {participant.name}
                                        </div>
                                        {participant.description && (
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#666',
                                                fontStyle: 'italic'
                                            }}>
                                                {participant.description}
                                            </div>
                                        )}
                                        {participant.socialLinks.length > 0 && (
                                            <div style={{
                                                fontSize: '13px',
                                                color: '#999',
                                                marginTop: '4px'
                                            }}>
                                                {participant.socialLinks.length} social link{participant.socialLinks.length !== 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: '24px',
                                        color: '#1976d2'
                                    }}>
                                        →
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </BackgroundLayout>
    );
}
