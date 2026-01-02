import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import * as QRCode from 'qrcode';

type SignupQRPageProps = {
    googleFormUrl: string;
};

export function SignupQRPage({ googleFormUrl }: SignupQRPageProps) {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !googleFormUrl) return;

        QRCode.toCanvas(canvasRef.current, googleFormUrl, {
            width: 512,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }).catch(err => {
            console.error('QR Code generation failed:', err);
        });
    }, [googleFormUrl]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '40px'
        }}>
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
                    Scan to Fill Out Signup Form
                </p>

                {/* QR Code container or error message */}
                {googleFormUrl ? (
                    <>
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
                            {googleFormUrl}
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
                    </>
                ) : (
                    <div style={{
                        backgroundColor: '#fff3cd',
                        border: '2px solid #ffc107',
                        padding: '32px',
                        borderRadius: '12px',
                        color: '#856404',
                        fontSize: 'clamp(16px, 3vw, 24px)',
                        fontWeight: '500',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Google Form URL not configured. Please set it in Backstage.
                    </div>
                )}
            </div>
        </div>
    );
}
