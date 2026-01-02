import React from 'react';
import { Participant } from '../types';

type LandingPageProps = {
    participants: Participant[];
    currentPerformerId: string | null;
};

export function LandingPage({ participants, currentPerformerId }: LandingPageProps) {
    const currentPerformer = participants.find(p => p.id === currentPerformerId);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '40px',
            backgroundColor: '#000',
            color: '#fff',
            textAlign: 'center'
        }}>
            {currentPerformer ? (
                <div style={{
                    maxWidth: '90vw'
                }}>
                    <h1 style={{
                        fontSize: 'clamp(32px, 8vw, 64px)',
                        marginBottom: '16px',
                        fontWeight: 'bold'
                    }}>
                        Now Performing
                    </h1>
                    <div style={{
                        fontSize: 'clamp(28px, 6vw, 48px)',
                        fontWeight: 'bold',
                        marginTop: '32px',
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
            ) : (
                <div style={{
                    maxWidth: '90vw'
                }}>
                    <h1 style={{
                        fontSize: 'clamp(32px, 8vw, 64px)',
                        fontWeight: 'bold',
                        color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                        No one performing right now
                    </h1>
                </div>
            )}
        </div>
    );
}
