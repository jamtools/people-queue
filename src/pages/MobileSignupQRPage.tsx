import React, { useEffect, useRef } from 'react';
import * as QRCode from 'qrcode';
import { colors, fontFamilies } from '../styles';

export function MobileSignupQRPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        QRCode.toCanvas(canvasRef.current, `${window.location.origin}/signup`, {
            width: 320,
            margin: 4,
            color: { dark: '#000000', light: '#FFFFFF' },
        }).then(() => {
            // The QR renderer sets a fixed CSS height; allow it to scale on phones.
            if (canvasRef.current) canvasRef.current.style.height = 'auto';
        }).catch((error) => {
            console.error('Signup QR code generation failed:', error);
        });
    }, []);

    return (
        <main style={{
            boxSizing: 'border-box',
            width: '100%',
            minHeight: '100svh',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: fontFamilies.poppins,
            backgroundColor: colors.whiteNoise,
            color: colors.bridgeDrop,
            textAlign: 'center',
        }}>
            <div style={{ width: '100%', maxWidth: '400px', minWidth: 0 }}>
                <h1 style={{ fontSize: '28px', lineHeight: 1.2, margin: '0 0 16px' }}>
                    Sign up to perform
                </h1>
                <p style={{ fontSize: '16px', margin: '0 0 24px' }}>
                    Scan this QR code with your phone to sign up.
                </p>
                <canvas
                    ref={canvasRef}
                    width={320}
                    height={320}
                    role="img"
                    aria-label="QR code for the signup form"
                    style={{ display: 'block', width: '320px', maxWidth: '100%', height: 'auto', aspectRatio: '1', margin: '0 auto 24px' }}
                />
                <a href="/signup" style={{
                    display: 'block',
                    padding: '14px 20px',
                    borderRadius: '8px',
                    backgroundColor: colors.bridgeDrop,
                    color: colors.whiteNoise,
                    fontWeight: 700,
                    textDecoration: 'none',
                }}>
                    Open signup form
                </a>
                <a href="/backstage" style={{ display: 'inline-block', padding: '16px', marginTop: '8px', color: colors.bridgeDrop }}>
                    Back to Backstage
                </a>
            </div>
        </main>
    );
}
