/**
 * QRCodeDisplay Component
 *
 * Displays a QR code in a white rounded container with a description.
 * Used for both signup QR codes and performer profile QR codes.
 */

import React, { useEffect, useRef } from 'react';
import * as QRCode from 'qrcode';
import { colors, getTypographyStyle, borderRadius, dimensions } from '../styles';

type QRCodeDisplayProps = {
    url: string;
    size: number;
    description: string;
    descriptionColor?: string;
};

export function QRCodeDisplay({ url, size, description, descriptionColor = colors.bridgeDrop }: QRCodeDisplayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !url) return;

        QRCode.toCanvas(canvasRef.current, url, {
            width: size,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }).catch(err => {
            console.error('QR Code generation failed:', err);
        });
    }, [url, size]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
            }}
        >
            {/* Description above QR code */}
            <div
                style={{
                    ...getTypographyStyle('headingMedium', 'kiosk'),
                    color: descriptionColor,
                    textAlign: 'center',
                }}
            >
                {description}
            </div>

            {/* White rounded container with QR code */}
            <div
                style={{
                    backgroundColor: colors.whiteNoise,
                    padding: `${dimensions.qrContainerPadding}px`,
                    borderRadius: `${borderRadius.qrContainer}px`,
                    display: 'inline-block',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
            >
                <canvas
                    ref={canvasRef}
                    style={{
                        display: 'block',
                        borderRadius: '8px',
                    }}
                />
            </div>
        </div>
    );
}
