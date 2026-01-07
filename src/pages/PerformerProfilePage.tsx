import React from 'react';
import { useParams } from 'react-router';
import { Participant } from '../types';
import { buildSocialUrl, getPlatformIcon } from '../utils/socialLinks';

type PerformerProfilePageProps = {
    participants: Participant[];
};

export function PerformerProfilePage({ participants }: PerformerProfilePageProps) {
    const { performerId } = useParams<{ performerId: string }>();
    const performer = participants.find(p => p.id === performerId);

    if (!performer) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '20px',
                textAlign: 'center'
            }}>
                <h1>Performer not found</h1>
                <p style={{ color: '#666' }}>
                    This performer may have been removed from the queue
                </p>
            </div>
        );
    }

    const sortedLinks = [...performer.socialLinks].sort((a, b) => a.order - b.order);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '40px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                maxWidth: '600px',
                width: '100%'
            }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '32px'
                }}>
                    <h1 style={{
                        color: '#1a1a1a',
                        fontSize: '36px',
                        margin: '0 0 8px 0'
                    }}>
                        {performer.name}
                    </h1>
                    {performer.description && (
                        <p style={{
                            color: '#666',
                            fontSize: '18px',
                            margin: '0 0 16px 0',
                            fontStyle: 'italic'
                        }}>
                            {performer.description}
                        </p>
                    )}
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    {sortedLinks.length === 0 ? (
                        <div style={{
                            padding: '24px',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            textAlign: 'center',
                            color: '#666'
                        }}>
                            No social links added yet
                        </div>
                    ) : (
                        sortedLinks.map((link) => {
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
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '20px 24px',
                                        backgroundColor: '#fff',
                                        borderRadius: '12px',
                                        textDecoration: 'none',
                                        color: '#333',
                                        fontSize: '18px',
                                        fontWeight: '500',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                                    }}
                                >
                                    <Icon size={32} />
                                    <span style={{ flex: 1 }}>
                                        {link.url}
                                    </span>
                                    <span style={{ fontSize: '20px', color: '#999' }}>→</span>
                                </a>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
