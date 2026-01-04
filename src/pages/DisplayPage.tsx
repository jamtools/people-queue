import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import * as QRCode from 'qrcode';
import { Participant } from '../types';
import { buildSocialUrl, getPlatformIcon } from '../utils/socialLinks';

type DisplayPageProps = {
    participants: Participant[];
    currentPerformerId: string | null;
};

export function DisplayPage({ participants, currentPerformerId }: DisplayPageProps) {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const currentPerformer = participants.find(p => p.id === currentPerformerId);

    useEffect(() => {
        if (!currentPerformer || !canvasRef.current) return;

        const origin = window.location.origin.replace('localhost', 'jam.local');
        const url = `${origin}/performer/${currentPerformer.id}`;

        QRCode.toCanvas(canvasRef.current, url, {
            width: 512,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }).catch(err => {
            console.error('QR Code generation failed:', err);
        });
    }, [currentPerformer]);

    if (!currentPerformer) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                padding: '20px'
            }}>
                <h1>No performer selected</h1>
                <p style={{ color: '#666', marginBottom: '24px' }}>
                    Select a performer from the backstage page
                </p>
                <button
                    onClick={() => navigate('/backstage')}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
                >
                    Go to Backstage
                </button>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '40px',
            backgroundColor: '#f5f5f5',
            color: '#1a1a1a'
        }}>
            <div style={{
                textAlign: 'center',
                marginBottom: '48px',
                maxWidth: '90vw'
            }}>
                <h1 style={{ fontSize: 'clamp(32px, 8vw, 64px)', marginBottom: '16px' }}>
                    Now Performing
                </h1>
                <div style={{
                    fontSize: 'clamp(28px, 6vw, 48px)',
                    fontWeight: 'bold',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto'
                }}>
                    {currentPerformer.name}
                </div>
                {currentPerformer.description && (
                    <div style={{
                        fontSize: 'clamp(18px, 3.5vw, 28px)',
                        color: '#666',
                        marginTop: '16px',
                        fontStyle: 'italic',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        hyphens: 'auto'
                    }}>
                        {currentPerformer.description}
                    </div>
                )}
            </div>

            {currentPerformer.socialLinks.length > 0 && (
                <div style={{
                    backgroundColor: '#fff',
                    padding: '48px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    maxWidth: '90vw'
                }}>
                    <div style={{ marginBottom: '32px' }}>
                        <canvas
                            ref={canvasRef}
                            style={{
                                border: '8px solid #ddd',
                                borderRadius: '8px',
                                maxWidth: '100%',
                                height: 'auto'
                            }}
                        />
                    </div>
                    <div style={{ color: '#1a1a1a', fontSize: '28px', fontWeight: 'bold', marginBottom: '32px' }}>
                        Connect with {currentPerformer.name}
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '24px',
                        justifyContent: 'center'
                    }}>
                        {currentPerformer.socialLinks
                            .sort((a, b) => a.order - b.order)
                            .map((link) => {
                                const Icon = getPlatformIcon(link.type);
                                return (
                                    <div
                                        key={link.id}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '24px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '12px',
                                            border: '2px solid #e9ecef'
                                        }}
                                    >
                                        <Icon size={48} color="#333" strokeWidth={1.5} />
                                        <div style={{
                                            color: '#333',
                                            fontSize: '20px',
                                            fontWeight: '600',
                                            wordBreak: 'break-all',
                                            textAlign: 'center'
                                        }}>
                                            {link.url}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

        </div>
    );
}
