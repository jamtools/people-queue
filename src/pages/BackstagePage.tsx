import React from 'react';
import { useNavigate } from 'react-router';
import { Participant } from '../types';
import { QueueManager } from '../components/QueueManager';
import type { Actions } from '../index';

type BackstagePageProps = {
    participants: Participant[];
    currentPerformerId: string | null;
    actions: Pick<Actions, 'updateParticipant' | 'reorderParticipants' | 'removeParticipant' | 'setCurrentPerformer'>;
};

export function BackstagePage({
    participants,
    currentPerformerId,
    actions,
}: BackstagePageProps) {
    const navigate = useNavigate();
    const currentPerformer = participants.find(p => p.id === currentPerformerId);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1>Backstage - Queue Management</h1>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {currentPerformer && (
                        <button
                            onClick={() => navigate('/display')}
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
                            View Display
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/')}
                        style={{
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
                        Signup Page
                    </button>
                </div>
            </div>

            {currentPerformer && (
                <div
                    style={{
                        padding: '16px',
                        marginBottom: '24px',
                        backgroundColor: '#e3f2fd',
                        border: '2px solid #1976d2',
                        borderRadius: '8px'
                    }}
                >
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                        NOW PERFORMING
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        {currentPerformer.name}
                    </div>
                    {currentPerformer.socialLinks.length > 0 && (
                        <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                            {currentPerformer.socialLinks.length} social link{currentPerformer.socialLinks.length !== 1 ? 's' : ''} displayed
                        </div>
                    )}
                </div>
            )}

            <div style={{ marginBottom: '16px' }}>
                <h2>Queue ({participants.length})</h2>
            </div>

            <QueueManager
                participants={participants}
                currentPerformerId={currentPerformerId}
                actions={actions}
            />
        </div>
    );
}
