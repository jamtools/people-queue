import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Participant } from '../types';
import { QueueManager } from '../components/QueueManager';
import { SocialLinksEditor } from '../components/SocialLinksEditor';
import type { Actions } from '../index';

type BackstagePageProps = {
    participants: Participant[];
    currentPerformerId: string | null;
    googleFormUrl: string;
    autoRefreshEnabled: boolean;
    lastSyncTimestamp: number | null;
    actions: Pick<Actions, 'updateParticipant' | 'reorderParticipants' | 'removeParticipant' | 'setCurrentPerformer' | 'setGoogleFormUrl' | 'syncFromGoogleSheets' | 'setAutoRefresh' | 'addManualParticipant'>;
};

export function BackstagePage({
    participants,
    currentPerformerId,
    googleFormUrl,
    autoRefreshEnabled,
    lastSyncTimestamp,
    actions,
}: BackstagePageProps) {
    const navigate = useNavigate();
    const currentPerformer = participants.find(p => p.id === currentPerformerId);
    const [urlInput, setUrlInput] = useState(googleFormUrl);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<string | null>(null);
    const [manualName, setManualName] = useState('');
    const [manualDescription, setManualDescription] = useState('');
    const [manualLinks, setManualLinks] = useState<any[]>([]);

    // Auto-refresh effect
    useEffect(() => {
        if (!autoRefreshEnabled) return;

        const interval = setInterval(() => {
            handleSync();
        }, 60000); // Every minute

        return () => clearInterval(interval);
    }, [autoRefreshEnabled]);

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncStatus('Syncing...');
        try {
            const result = await actions.syncFromGoogleSheets();
            if (result.added === 0) {
                setSyncStatus('No new participants');
            } else {
                setSyncStatus(`Added ${result.added} participant${result.added !== 1 ? 's' : ''}`);
            }
        } catch (error) {
            setSyncStatus('Sync failed');
            console.error('Sync error:', error);
        } finally {
            setIsSyncing(false);
            setTimeout(() => setSyncStatus(null), 3000);
        }
    };

    const getLastSyncText = () => {
        if (!lastSyncTimestamp) return 'Never';
        const minutes = Math.floor((Date.now() - lastSyncTimestamp) / 60000);
        if (minutes === 0) return 'Just now';
        if (minutes === 1) return '1 minute ago';
        return `${minutes} minutes ago`;
    };

    const handleAddManual = async () => {
        if (!manualName.trim()) {
            alert('Name is required');
            return;
        }

        await actions.addManualParticipant({
            name: manualName.trim(),
            description: manualDescription.trim() || undefined,
            socialLinks: manualLinks,
        });

        // Clear form
        setManualName('');
        setManualDescription('');
        setManualLinks([]);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1>Backstage - Queue Management</h1>
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

            {/* Google Form URL Configuration */}
            <div
                style={{
                    padding: '16px',
                    marginBottom: '24px',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                }}
            >
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>
                    Google Form URL Configuration
                </h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://forms.google.com/..."
                        style={{
                            flex: 1,
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    />
                    <button
                        onClick={() => {
                            if (urlInput && !urlInput.startsWith('https://')) {
                                alert('URL must start with https://');
                                return;
                            }
                            actions.setGoogleFormUrl({ url: urlInput });
                        }}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
                    >
                        Save
                    </button>
                </div>
                {googleFormUrl && (
                    <div style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>
                        Current URL: {googleFormUrl}
                    </div>
                )}
            </div>

            {/* Google Sheets Sync Controls */}
            <div
                style={{
                    padding: '16px',
                    marginBottom: '24px',
                    backgroundColor: '#f0f8ff',
                    border: '1px solid #1976d2',
                    borderRadius: '8px'
                }}
            >
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>
                    Google Sheets Sync
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: isSyncing ? '#ccc' : '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isSyncing ? 'not-allowed' : 'pointer',
                                fontWeight: '500',
                                fontSize: '14px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (!isSyncing) e.currentTarget.style.backgroundColor = '#43a047';
                            }}
                            onMouseLeave={(e) => {
                                if (!isSyncing) e.currentTarget.style.backgroundColor = '#4caf50';
                            }}
                        >
                            {isSyncing ? 'Syncing...' : 'Refresh from Google Sheets'}
                        </button>
                        {syncStatus && (
                            <span style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                                {syncStatus}
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                            <input
                                type="checkbox"
                                checked={autoRefreshEnabled}
                                onChange={(e) => actions.setAutoRefresh({ enabled: e.target.checked })}
                                style={{ cursor: 'pointer' }}
                            />
                            Auto-refresh every minute
                        </label>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        Last synced: {getLastSyncText()}
                    </div>
                </div>
            </div>

            {/* Add Walk-In Participant */}
            <div
                style={{
                    padding: '16px',
                    marginBottom: '24px',
                    backgroundColor: '#fff8e1',
                    border: '1px solid #ffa726',
                    borderRadius: '8px'
                }}
            >
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>
                    Add Walk-In Participant
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                            Name *
                        </label>
                        <input
                            type="text"
                            value={manualName}
                            onChange={(e) => setManualName(e.target.value)}
                            placeholder="Participant name"
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                            Description
                        </label>
                        <textarea
                            value={manualDescription}
                            onChange={(e) => setManualDescription(e.target.value)}
                            placeholder="What instruments/style will you be performing? (optional)"
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                            Social Links
                        </label>
                        <SocialLinksEditor links={manualLinks} onChange={setManualLinks} />
                    </div>
                    <button
                        onClick={handleAddManual}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#ffa726',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fb8c00'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffa726'}
                    >
                        Add to Queue
                    </button>
                </div>
            </div>

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
