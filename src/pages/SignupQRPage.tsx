import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import * as QRCode from 'qrcode';

export function SignupQRPage() {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const origin = window.location.origin.replace('localhost', 'jam.local');
        const url = `${origin}/`;

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
    }, []);

    const origin = window.location.origin.replace('localhost', 'jam.local');
    const signupUrl = `${origin}/`;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '40px',
            position: 'relative'
        }}>
            {/* Backstage button - subtle top-right corner */}
            <button
                onClick={() => navigate('/backstage')}
                aria-label="Go to backstage queue management"
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    color: '#666',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.color = '#333';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.color = '#666';
                }}
            >
                Backstage
            </button>

            {/* Main content container */}
            <div style={{
                textAlign: 'center',
                maxWidth: '800px',
                width: '100%'
            }}>
                {/* Heading */}
                <h1 style={{
                    fontSize: 'clamp(36px, 8vw, 72px)',
                    fontWeight: '800',
                    marginBottom: '24px',
                    color: '#1a1a1a',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1'
                }}>
                    Open Mic Sign Up
                </h1>

                {/* Subheading */}
                <p style={{
                    fontSize: 'clamp(18px, 4vw, 32px)',
                    color: '#666',
                    marginBottom: '64px',
                    fontWeight: '400',
                    lineHeight: '1.4'
                }}>
                    Scan the QR code to add yourself to the queue
                </p>

                {/* QR Code container */}
                <div style={{
                    backgroundColor: '#ffffff',
                    padding: '48px',
                    borderRadius: '24px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    marginBottom: '32px',
                    display: 'inline-block'
                }}>
                    <canvas
                        ref={canvasRef}
                        style={{
                            display: 'block',
                            margin: '0 auto',
                            borderRadius: '12px'
                        }}
                    />
                </div>

                {/* URL text for reference */}
                <div style={{
                    fontSize: 'clamp(14px, 3vw, 24px)',
                    color: '#999',
                    fontWeight: '500',
                    fontFamily: 'monospace',
                    letterSpacing: '0.02em',
                    marginBottom: '16px',
                    wordBreak: 'break-all'
                }}>
                    {signupUrl}
                </div>

                {/* Additional instructions */}
                <p style={{
                    fontSize: 'clamp(16px, 2.5vw, 20px)',
                    color: '#888',
                    maxWidth: '600px',
                    margin: '0 auto',
                    lineHeight: '1.6',
                    padding: '0 20px'
                }}>
                    Point your phone's camera at the QR code or enter the URL above to get started
                </p>
            </div>
        </div>
    );
}
