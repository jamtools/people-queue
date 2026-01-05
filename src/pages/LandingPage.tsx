import React, { useEffect, useRef } from 'react';
import * as QRCode from 'qrcode';
import { Participant } from '../types';
import { getPlatformIcon } from '../utils/socialLinks';

type LandingPageProps = {
    participants: Participant[];
    currentPerformerId: string | null;
};

export function LandingPage({ participants, currentPerformerId }: LandingPageProps) {
    const currentPerformer = participants.find(p => p.id === currentPerformerId);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!currentPerformer || !canvasRef.current) return;

        const origin = window.location.origin;
        // const origin = window.location.origin.replace('localhost', 'jam.local');
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

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '40px',
            backgroundColor: '#f5f5f5',
            color: '#1a1a1a',
            textAlign: 'center',
            fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", cursive, sans-serif'
        }}>
            {currentPerformer ? (
                <div style={{
                    maxWidth: '90vw',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '32px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: 'clamp(32px, 8vw, 64px)',
                            marginBottom: '16px',
                            fontWeight: 'bold',
                            color: '#ff6b6b'
                        }}>
                            Now Performing!
                        </h1>
                        <div style={{
                            fontSize: 'clamp(28px, 6vw, 48px)',
                            fontWeight: 'bold',
                            marginTop: '32px',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            hyphens: 'auto',
                            color: '#4ecdc4'
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
                        <>
                            <div style={{
                                backgroundColor: '#fff',
                                padding: '24px',
                                borderRadius: '16px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                <canvas
                                    ref={canvasRef}
                                    style={{
                                        borderRadius: '8px',
                                        maxWidth: '100%',
                                        height: 'auto'
                                    }}
                                />
                                <div style={{
                                    fontSize: '18px',
                                    color: '#666',
                                    marginTop: '12px',
                                    fontWeight: '600'
                                }}>
                                    Scan to connect!
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                maxWidth: '600px',
                                width: '100%'
                            }}>
                                <div style={{
                                    fontSize: 'clamp(20px, 4vw, 28px)',
                                    fontWeight: 'bold',
                                    color: '#ff6b6b',
                                    marginBottom: '8px'
                                }}>
                                    Connect with me:
                                </div>
                                {currentPerformer.socialLinks
                                    .sort((a, b) => a.order - b.order)
                                    .map((link) => {
                                        const Icon = getPlatformIcon(link.type);
                                        return (
                                            <div
                                                key={link.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '16px 20px',
                                                    backgroundColor: '#fff',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                                    fontSize: 'clamp(14px, 3vw, 20px)',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                <Icon size={32} />
                                                <span style={{
                                                    flex: 1,
                                                    wordBreak: 'break-all',
                                                    textAlign: 'left'
                                                }}>
                                                    {link.url}
                                                </span>
                                            </div>
                                        );
                                    })}
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div style={{
                    maxWidth: '90vw'
                }}>
                    <h1 style={{
                        fontSize: 'clamp(32px, 8vw, 64px)',
                        fontWeight: 'bold',
                        color: '#4ecdc4'
                    }}>
                        Welcome to the SongDrive Open Stage
                    </h1>
                </div>
            )}
        </div>
    );
}
