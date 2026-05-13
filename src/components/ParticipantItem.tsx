import React, { useState } from 'react';
import { Participant } from '../types';
import { SocialLinksEditor } from './SocialLinksEditor';
import type { Actions } from '../index';

type ParticipantItemProps = {
    participant: Participant;
    index?: number; // Optional index for queue position display
    currentPerformerId: string | null;
    isInQueue: boolean;
    showHereCheckbox?: boolean; // Whether to show the "Here" checkbox
    actions: Pick<Actions, 'updateParticipant' | 'removeFromQueue' | 'addToQueue' | 'setCurrentPerformer' | 'toggleParticipantHere' | 'removeParticipant'>;
};

export function ParticipantItem({
    participant,
    index,
    currentPerformerId,
    isInQueue,
    showHereCheckbox = false,
    actions,
}: ParticipantItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [editName, setEditName] = useState(participant.name);
    const [editDescription, setEditDescription] = useState(participant.description || '');
    const [editNotes, setEditNotes] = useState(participant.notes || '');
    const [editLinks, setEditLinks] = useState(participant.socialLinks);

    const isCurrentPerformer = currentPerformerId === participant.id;

    const handleStartEdit = () => {
        setIsEditing(true);
        setEditName(participant.name);
        setEditDescription(participant.description || '');
        setEditNotes(participant.notes || '');
        setEditLinks(participant.socialLinks);
    };

    const handleSaveEdit = async () => {
        await actions.updateParticipant({
            id: participant.id,
            name: editName,
            description: editDescription.trim() || undefined,
            notes: editNotes.trim() || undefined,
            socialLinks: editLinks,
        });
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    return (
        <div
            style={{
                border: isCurrentPerformer ? '2px solid #1976d2' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: isCurrentPerformer ? '#e3f2fd' : 'white',
            }}
        >
            {isEditing ? (
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
                            Description
                        </label>
                        <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="What instruments/style will you be performing? (optional)"
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                            Backstage Notes (Internal Only)
                        </label>
                        <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Notes for backstage use only..."
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                backgroundColor: '#fffbf0'
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
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontWeight: '500'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
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
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontWeight: '500'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#666'}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                <div style={{
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word'
                                }}>
                                    {index !== undefined ? `${index + 1}. ` : ''}{participant.name}
                                </div>
                                {showHereCheckbox && (
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={participant.isHere === true}
                                            onChange={(e) => actions.toggleParticipantHere({ id: participant.id, isHere: e.target.checked })}
                                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                        <span style={{
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: participant.isHere ? '#4caf50' : '#999',
                                            transition: 'color 0.2s ease'
                                        }}>
                                            {participant.isHere ? 'Here' : 'Not Here'}
                                        </span>
                                    </label>
                                )}
                            </div>
                            {participant.notes && (
                                <div
                                    style={{
                                        fontSize: '13px',
                                        color: '#d97706',
                                        marginBottom: '6px',
                                        fontWeight: '500',
                                        wordWrap: 'break-word',
                                        overflowWrap: 'break-word',
                                        backgroundColor: '#fef3c7',
                                        padding: '6px 10px',
                                        borderRadius: '4px',
                                        border: '1px solid #fbbf24',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <span style={{ fontWeight: '700' }}>Note:</span> {participant.notes}
                                </div>
                            )}
                            {participant.description && (
                                <div
                                    style={{
                                        fontSize: '13px',
                                        color: '#666',
                                        marginBottom: '4px',
                                        fontStyle: 'italic',
                                        wordWrap: 'break-word',
                                        overflowWrap: 'break-word'
                                    }}
                                    title={participant.description.length > 120 ? participant.description : undefined}
                                >
                                    {participant.description.length > 120
                                        ? participant.description.substring(0, 120) + '...'
                                        : participant.description
                                    }
                                </div>
                            )}
                            {participant.socialLinks.length > 0 && (
                                <div style={{ fontSize: '13px', color: '#666' }}>
                                    {participant.socialLinks.length} social link{participant.socialLinks.length !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px', alignItems: 'center' }}>
                        {isCurrentPerformer ? (
                            <button
                                onClick={() => {
                                    if (confirm('End the current performance?')) {
                                        actions.setCurrentPerformer({ id: null });
                                    }
                                }}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d32f2f'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f44336'}
                            >
                                End Performance
                            </button>
                        ) : isInQueue && (
                            <button
                                onClick={() => actions.setCurrentPerformer({ id: participant.id })}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#4caf50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#43a047'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4caf50'}
                            >
                                Set As Performing
                            </button>
                        )}
                        {!isInQueue && (
                            <button
                                onClick={() => actions.addToQueue({ id: participant.id })}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#4caf50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#43a047'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4caf50'}
                            >
                                Add to Queue
                            </button>
                        )}
                        <a
                            href={`/performer/${participant.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
                        >
                            View Profile
                        </a>
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                onBlur={() => setTimeout(() => setShowMenu(false), 200)}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#666',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s ease',
                                    lineHeight: '1'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#666'}
                            >
                                ⋮
                            </button>
                            {showMenu && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '4px',
                                        backgroundColor: 'white',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        zIndex: 1000,
                                        minWidth: '180px'
                                    }}
                                >
                                    <button
                                        onClick={() => {
                                            setShowMenu(false);
                                            handleStartEdit();
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '10px 16px',
                                            backgroundColor: 'white',
                                            color: '#333',
                                            border: 'none',
                                            borderBottom: '1px solid #eee',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            textAlign: 'left',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    >
                                        Edit
                                    </button>
                                    {isInQueue && (
                                        <button
                                            onClick={() => {
                                                setShowMenu(false);
                                                actions.removeFromQueue({ id: participant.id });
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '10px 16px',
                                                backgroundColor: 'white',
                                                color: '#d32f2f',
                                                border: 'none',
                                                borderBottom: '1px solid #eee',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                textAlign: 'left',
                                                transition: 'background-color 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffebee'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                        >
                                            Remove from Queue
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setShowMenu(false);
                                            if (confirm('Permanently delete this participant?')) {
                                                actions.removeParticipant({ id: participant.id });
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '10px 16px',
                                            backgroundColor: 'white',
                                            color: '#d32f2f',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            textAlign: 'left',
                                            transition: 'background-color 0.2s ease',
                                            borderRadius: '0 0 4px 4px'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffebee'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
