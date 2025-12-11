import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
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

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const url = `${window.location.origin}/performer/${currentPerformer.id}`;

        const size = 256;
        const moduleSize = 8;
        const modules = size / moduleSize;

        canvas.width = size;
        canvas.height = size;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = 'black';
        const data = url.split('').map(c => c.charCodeAt(0));

        for (let y = 0; y < modules; y++) {
            for (let x = 0; x < modules; x++) {
                const index = (y * modules + x) % data.length;
                if (data[index] % 2 === 0) {
                    ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
                }
            }
        }

        const quietZone = moduleSize * 2;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = moduleSize;
        ctx.strokeRect(quietZone, quietZone, size - quietZone * 2, size - quietZone * 2);
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
                        cursor: 'pointer'
                    }}
                >
                    Go to Backstage
                </button>
            </div>
        );
    }

    const performerUrl = `${window.location.origin}/performer/${currentPerformer.id}`;

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
                marginBottom: '48px'
            }}>
                <h1 style={{ fontSize: '64px', marginBottom: '16px' }}>
                    Now Performing
                </h1>
                <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
                    {currentPerformer.name}
                </div>
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
                    cursor: 'pointer'
                }}
            >
                Back to Backstage
            </button>
        </div>
    );
}
