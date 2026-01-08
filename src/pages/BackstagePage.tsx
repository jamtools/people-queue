import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Participant } from '../types';
import { QueueManager } from '../components/QueueManager';
import { SocialLinksEditor } from '../components/SocialLinksEditor';
import { ParticipantItem } from '../components/ParticipantItem';
import type { Actions } from '../index';

type BackstagePageProps = {
    allParticipants: Participant[];
    queuedParticipantIds: string[];
    currentPerformerId: string | null;
    googleFormUrl: string;
    songDriveWorkspaceUrl: string;
    showHelpText: boolean;
    autoRefreshEnabled: boolean;
    lastSyncTimestamp: number | null;
    actions: Pick<Actions, 'updateParticipant' | 'reorderQueue' | 'removeParticipant' | 'removeFromQueue' | 'addToQueue' | 'setCurrentPerformer' | 'setGoogleFormUrl' | 'setSongDriveWorkspaceUrl' | 'toggleHelpText' | 'syncFromGoogleSheets' | 'setAutoRefresh' | 'addManualParticipant' | 'toggleParticipantHere'>;
};

export function BackstagePage({
    allParticipants,
    queuedParticipantIds,
    currentPerformerId,
    googleFormUrl,
    songDriveWorkspaceUrl,
    showHelpText,
    autoRefreshEnabled,
    lastSyncTimestamp,
    actions,
}: BackstagePageProps) {
    const navigate = useNavigate();

    // Get queued participants in order
    const queuedParticipants = queuedParticipantIds
        .map(id => allParticipants.find(p => p.id === id))
        .filter((p): p is Participant => p !== undefined);

    const currentPerformer = allParticipants.find(p => p.id === currentPerformerId);

    // Filter state for all participants list
    const [hereFilter, setHereFilter] = useState<'all' | 'here' | 'not-here'>('all');
    const [queueFilter, setQueueFilter] = useState<'all' | 'in-queue' | 'not-in-queue'>('all');
    const [urlInput, setUrlInput] = useState(googleFormUrl);
    const [workspaceUrlInput, setWorkspaceUrlInput] = useState(songDriveWorkspaceUrl);
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
            addToQueue: false, // Don't add to queue automatically - must be done manually
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

            {/* SongDrive Workspace URL Configuration */}
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
                    SongDrive Workspace URL Configuration
                </h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                        type="text"
                        value={workspaceUrlInput}
                        onChange={(e) => setWorkspaceUrlInput(e.target.value)}
                        placeholder="https://songdrive.com/workspace/..."
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
                            if (workspaceUrlInput && !workspaceUrlInput.startsWith('https://')) {
                                alert('URL must start with https://');
                                return;
                            }
                            actions.setSongDriveWorkspaceUrl({ url: workspaceUrlInput });
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
                {songDriveWorkspaceUrl && (
                    <div style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>
                        Current URL: {songDriveWorkspaceUrl}
                    </div>
                )}
            </div>

            {/* QR Code Screen Help Text Toggle */}
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
                    QR Code Screen Settings
                </h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                    <input
                        type="checkbox"
                        checked={showHelpText}
                        onChange={(e) => actions.toggleHelpText({ enabled: e.target.checked })}
                        style={{ cursor: 'pointer' }}
                    />
                    Show "Need Help Uploading?" text on QR Code screen
                </label>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', marginLeft: '24px' }}>
                    When enabled, displays help text below the QR codes directing users to talk to Michael for upload assistance.
                </div>
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
                        Add Participant
                    </button>
                </div>
            </div>

            {/* All Participants Section */}
            <div
                style={{
                    padding: '16px',
                    marginBottom: '24px',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                }}
            >
                <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>
                        All Signed Up ({allParticipants.length})
                    </h3>

                    {/* Filter Row 1: Here Status */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#666', minWidth: '80px' }}>
                            Presence:
                        </span>
                        <button
                            onClick={() => setHereFilter('all')}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: hereFilter === 'all' ? '#1976d2' : '#e0e0e0',
                                color: hereFilter === 'all' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500'
                            }}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setHereFilter('here')}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: hereFilter === 'here' ? '#1976d2' : '#e0e0e0',
                                color: hereFilter === 'here' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500'
                            }}
                        >
                            Here
                        </button>
                        <button
                            onClick={() => setHereFilter('not-here')}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: hereFilter === 'not-here' ? '#1976d2' : '#e0e0e0',
                                color: hereFilter === 'not-here' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500'
                            }}
                        >
                            Not Here
                        </button>
                    </div>

                    {/* Filter Row 2: Queue Status */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#666', minWidth: '80px' }}>
                            Queue:
                        </span>
                        <button
                            onClick={() => setQueueFilter('all')}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: queueFilter === 'all' ? '#1976d2' : '#e0e0e0',
                                color: queueFilter === 'all' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500'
                            }}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setQueueFilter('in-queue')}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: queueFilter === 'in-queue' ? '#1976d2' : '#e0e0e0',
                                color: queueFilter === 'in-queue' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500'
                            }}
                        >
                            In Queue
                        </button>
                        <button
                            onClick={() => setQueueFilter('not-in-queue')}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: queueFilter === 'not-in-queue' ? '#1976d2' : '#e0e0e0',
                                color: queueFilter === 'not-in-queue' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500'
                            }}
                        >
                            Not In Queue
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {allParticipants
                        .filter(p => {
                            // Apply "Here" filter
                            if (hereFilter === 'here' && p.isHere !== true) return false;
                            if (hereFilter === 'not-here' && p.isHere === true) return false;

                            // Apply "Queue" filter
                            const isInQueue = queuedParticipantIds.includes(p.id);
                            if (queueFilter === 'in-queue' && !isInQueue) return false;
                            if (queueFilter === 'not-in-queue' && isInQueue) return false;

                            return true;
                        })
                        .map(participant => {
                            const isInQueue = queuedParticipantIds.includes(participant.id);
                            return (
                                <ParticipantItem
                                    key={participant.id}
                                    participant={participant}
                                    currentPerformerId={currentPerformerId}
                                    isInQueue={isInQueue}
                                    showHereCheckbox={true}
                                    actions={actions}
                                />
                            );
                        })}
                </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <h2>Queue ({queuedParticipants.length})</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {queuedParticipants.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#666', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                        No participants in queue yet. Add people from the "All Signed Up" section above.
                    </div>
                ) : (
                    queuedParticipants.map((participant, index) => (
                        <ParticipantItem
                            key={participant.id}
                            participant={participant}
                            index={index}
                            currentPerformerId={currentPerformerId}
                            isInQueue={true}
                            actions={actions}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
