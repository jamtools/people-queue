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
            width: 256,
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

    const origin = window.location.origin.replace('localhost', 'jam.local');
    const performerUrl = `${origin}/performer/${currentPerformer.id}`;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '40px',
            backgroundColor: '#000',
            color: '#fff'
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
                        color: 'rgba(255, 255, 255, 0.8)',
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
                    textAlign: 'center'
                }}>
                    <div style={{ marginBottom: '24px' }}>
                        <canvas
                            ref={canvasRef}
                            style={{
                                border: '8px solid #000',
                                borderRadius: '8px',
                                maxWidth: '100%',
                                height: 'auto'
                            }}
                        />
                    </div>
                    <div style={{ color: '#000', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                        Scan for Social Links
                    </div>
                    <div style={{ color: '#666', fontSize: '18px' }}>
                        {performerUrl}
                    </div>
                </div>
            )}

            <button
                onClick={() => navigate('/backstage')}
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#666'}
            >
                Back to Backstage
            </button>
        </div>
    );
}
