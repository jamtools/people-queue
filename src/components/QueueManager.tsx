import React, { useState } from 'react';
import { Participant } from '../types';
import { SocialLinksEditor } from './SocialLinksEditor';

type QueueManagerProps = {
    participants: Participant[];
    onUpdateParticipants: (participants: Participant[]) => void;
    onSetCurrentPerformer: (id: string | null) => void;
    currentPerformerId: string | null;
};

export function QueueManager({ participants, onUpdateParticipants, onSetCurrentPerformer, currentPerformerId }: QueueManagerProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editLinks, setEditLinks] = useState(participants.find(p => p.id === editingId)?.socialLinks || []);

    const handleMoveUp = (id: string) => {
        const index = participants.findIndex(p => p.id === id);
        if (index > 0) {
            const newParticipants = [...participants];
            [newParticipants[index - 1], newParticipants[index]] = [newParticipants[index], newParticipants[index - 1]];
            onUpdateParticipants(newParticipants.map((p, i) => ({ ...p, order: i })));
        }
    };

    const handleMoveDown = (id: string) => {
        const index = participants.findIndex(p => p.id === id);
        if (index < participants.length - 1) {
            const newParticipants = [...participants];
            [newParticipants[index], newParticipants[index + 1]] = [newParticipants[index + 1], newParticipants[index]];
            onUpdateParticipants(newParticipants.map((p, i) => ({ ...p, order: i })));
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Remove this participant from the queue?')) {
            const newParticipants = participants.filter(p => p.id !== id).map((p, i) => ({ ...p, order: i }));
            onUpdateParticipants(newParticipants);
            if (currentPerformerId === id) {
                onSetCurrentPerformer(null);
            }
        }
    };

    const handleStartEdit = (participant: Participant) => {
        setEditingId(participant.id);
        setEditName(participant.name);
        setEditLinks(participant.socialLinks);
    };

    const handleSaveEdit = () => {
        if (editingId) {
            const newParticipants = participants.map(p =>
                p.id === editingId ? { ...p, name: editName, socialLinks: editLinks } : p
            );
            onUpdateParticipants(newParticipants);
            setEditingId(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {participants.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                    No participants in queue yet
                </div>
            ) : (
                participants.map((participant, index) => (
                    <div
                        key={participant.id}
                        style={{
                            border: currentPerformerId === participant.id ? '2px solid #1976d2' : '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '16px',
                            backgroundColor: currentPerformerId === participant.id ? '#e3f2fd' : 'white'
                        }}
                    >
                        {editingId === participant.id ? (
                            <div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                                        Social Links
                                    </label>
                                    <SocialLinksEditor links={editLinks} onChange={setEditLinks} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={handleSaveEdit}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#666',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                                            {index + 1}. {participant.name}
                                        </div>
                                        {participant.socialLinks.length > 0 && (
                                            <div style={{ fontSize: '14px', color: '#666' }}>
                                                {participant.socialLinks.length} social link{participant.socialLinks.length !== 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={() => handleMoveUp(participant.id)}
                                            disabled={index === 0}
                                            style={{
                                                padding: '4px 8px',
                                                cursor: index === 0 ? 'not-allowed' : 'pointer',
                                                opacity: index === 0 ? 0.5 : 1
                                            }}
                                            title="Move up"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            onClick={() => handleMoveDown(participant.id)}
                                            disabled={index === participants.length - 1}
                                            style={{
                                                padding: '4px 8px',
                                                cursor: index === participants.length - 1 ? 'not-allowed' : 'pointer',
                                                opacity: index === participants.length - 1 ? 0.5 : 1
                                            }}
                                            title="Move down"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {currentPerformerId === participant.id ? (
                                        <button
                                            onClick={() => onSetCurrentPerformer(null)}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#f44336',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            End Performance
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onSetCurrentPerformer(participant.id)}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#4caf50',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Now Performing
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleStartEdit(participant)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#666',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(participant.id)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#d32f2f',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
