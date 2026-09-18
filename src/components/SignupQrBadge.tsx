import React, { useEffect, useMemo, useRef } from 'react';
import * as QRCode from 'qrcode';
import { borderRadius, colors, fontFamilies, safeZones } from '../styles';

type SignupQrBadgeProps = {
    label?: string;
};

export function SignupQrBadge({ label = 'Sign up' }: SignupQrBadgeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const signupUrl = useMemo(() => {
        if (typeof window === 'undefined') return '/signup';
        return `${window.location.origin}/signup`;
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;

        QRCode.toCanvas(canvasRef.current, signupUrl, {
            width: 92,
            margin: 1,
            color: {
                dark: colors.bridgeDrop,
                light: colors.whiteNoise,
            },
        }).catch((error) => {
            console.error('Signup QR code generation failed:', error);
        });
    }, [signupUrl]);

    return (
        <aside
            data-testid="signup-qr-badge"
            aria-label="Scan to sign up to perform"
            style={{
                position: 'absolute',
                right: `${safeZones.kiosk.right}px`,
                bottom: `${safeZones.kiosk.bottom}px`,
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                color: colors.bridgeDrop,
                borderRadius: `${borderRadius.large}px`,
                boxShadow: '0 10px 28px rgba(20, 42, 76, 0.22)',
                border: '1px solid rgba(45, 44, 128, 0.14)',
                fontFamily: fontFamilies.poppins,
            }}
        >
            <canvas
                ref={canvasRef}
                width={92}
                height={92}
                style={{
                    display: 'block',
                    width: '92px',
                    height: '92px',
                    borderRadius: `${borderRadius.small}px`,
                }}
            />
            <div style={{ minWidth: '88px' }}>
                <div
                    style={{
                        fontSize: '18px',
                        lineHeight: 1.1,
                        fontWeight: 800,
                        marginBottom: '4px',
                    }}
                >
                    {label}
                </div>
                <div
                    style={{
                        fontSize: '15px',
                        lineHeight: 1.2,
                        fontWeight: 700,
                        color: colors.midnightCruise,
                    }}
                >
                    /signup
                </div>
            </div>
        </aside>
    );
}
