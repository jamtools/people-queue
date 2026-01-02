import React, { useState } from 'react';
import { Participant } from '../types';
import { SocialLinksEditor } from './SocialLinksEditor';
import type { Actions } from '../index';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical } from '@tabler/icons-react';

type QueueManagerProps = {
    participants: Participant[];
    currentPerformerId: string | null;
    actions: Pick<Actions, 'updateParticipant' | 'reorderParticipants' | 'removeParticipant' | 'setCurrentPerformer'>;
};

type SortableItemProps = {
    participant: Participant;
    index: number;
    currentPerformerId: string | null;
    editingId: string | null;
    editName: string;
    editDescription: string;
    editNotes: string;
    editLinks: any[];
    onSetEditName: (name: string) => void;
    onSetEditDescription: (desc: string) => void;
    onSetEditNotes: (notes: string) => void;
    onSetEditLinks: (links: any[]) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onStartEdit: (participant: Participant) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
    onDelete: (id: string) => void;
    onSetCurrentPerformer: (id: string | null) => void;
    participantsLength: number;
};

function SortableItem({
    participant,
    index,
    currentPerformerId,
    editingId,
    editName,
    editDescription,
    editNotes,
    editLinks,
    onSetEditName,
    onSetEditDescription,
    onSetEditNotes,
    onSetEditLinks,
    onSaveEdit,
    onCancelEdit,
    onStartEdit,
    onMoveUp,
    onMoveDown,
    onDelete,
    onSetCurrentPerformer,
    participantsLength,
}: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: participant.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            <div
                style={{
                    border: currentPerformerId === participant.id ? '2px solid #1976d2' : '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: currentPerformerId === participant.id ? '#e3f2fd' : 'white',
                    pointerEvents: isDragging ? 'none' : 'auto',
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
                                onChange={(e) => onSetEditName(e.target.value)}
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
                                onChange={(e) => onSetEditDescription(e.target.value)}
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
                                onChange={(e) => onSetEditNotes(e.target.value)}
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
                            <SocialLinksEditor links={editLinks} onChange={onSetEditLinks} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={onSaveEdit}
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
                                onClick={onCancelEdit}
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
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
                                <div style={{
                                    padding: '4px',
                                    cursor: 'grab',
                                    color: '#999',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <IconGripVertical size={20} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        marginBottom: '4px',
                                        wordWrap: 'break-word',
                                        overflowWrap: 'break-word'
                                    }}>
                                        {index + 1}. {participant.name}
                                    </div>
                                    {participant.description && (
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#999',
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
                                    {participant.notes && (
                                        <div
                                            style={{
                                                fontSize: '11px',
                                                color: '#cc8800',
                                                marginBottom: '4px',
                                                fontStyle: 'italic',
                                                wordWrap: 'break-word',
                                                overflowWrap: 'break-word',
                                                backgroundColor: '#fffbf0',
                                                padding: '4px 6px',
                                                borderRadius: '4px',
                                                border: '1px solid #ffe4a3'
                                            }}
                                        >
                                            Backstage note: {participant.notes}
                                        </div>
                                    )}
                                    {participant.socialLinks.length > 0 && (
                                        <div style={{ fontSize: '14px', color: '#666' }}>
                                            {participant.socialLinks.length} social link{participant.socialLinks.length !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMoveUp(participant.id);
                                    }}
                                    disabled={index === 0}
                                    style={{
                                        padding: '4px 8px',
                                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                                        opacity: index === 0 ? 0.5 : 1,
                                        backgroundColor: '#f5f5f5',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                    title="Move up (or drag to reorder)"
                                >
                                    ▲
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMoveDown(participant.id);
                                    }}
                                    disabled={index === participantsLength - 1}
                                    style={{
                                        padding: '4px 8px',
                                        cursor: index === participantsLength - 1 ? 'not-allowed' : 'pointer',
                                        opacity: index === participantsLength - 1 ? 0.5 : 1,
                                        backgroundColor: '#f5f5f5',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                    title="Move down (or drag to reorder)"
                                >
                                    ▼
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                            {currentPerformerId === participant.id ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('End the current performance?')) {
                                            onSetCurrentPerformer(null);
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
                            ) : (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSetCurrentPerformer(participant.id);
                                    }}
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
                                    Now Performing
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStartEdit(participant);
                                }}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#666',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#666'}
                            >
                                Edit
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(participant.id);
                                }}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#d32f2f',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c62828'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d32f2f'}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export function QueueManager({
    participants,
    currentPerformerId,
    actions
}: QueueManagerProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [editLinks, setEditLinks] = useState(participants.find(p => p.id === editingId)?.socialLinks || []);

    // Configure drag sensors to require minimum drag distance
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px of movement before drag starts
            },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = participants.findIndex(p => p.id === active.id);
        const newIndex = participants.findIndex(p => p.id === over.id);

        const newParticipants = arrayMove(participants, oldIndex, newIndex);
        actions.reorderParticipants({
            participants: newParticipants.map((p, i) => ({ ...p, order: i }))
        });
    };

    const handleMoveUp = (id: string) => {
        const index = participants.findIndex(p => p.id === id);
        if (index > 0) {
            const newParticipants = [...participants];
            [newParticipants[index - 1], newParticipants[index]] = [newParticipants[index], newParticipants[index - 1]];
            actions.reorderParticipants({ participants: newParticipants.map((p, i) => ({ ...p, order: i })) });
        }
    };

    const handleMoveDown = (id: string) => {
        const index = participants.findIndex(p => p.id === id);
        if (index < participants.length - 1) {
            const newParticipants = [...participants];
            [newParticipants[index], newParticipants[index + 1]] = [newParticipants[index + 1], newParticipants[index]];
            actions.reorderParticipants({ participants: newParticipants.map((p, i) => ({ ...p, order: i })) });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Remove this participant from the queue?')) {
            actions.removeParticipant({ id });
        }
    };

    const handleStartEdit = (participant: Participant) => {
        setEditingId(participant.id);
        setEditName(participant.name);
        setEditDescription(participant.description || '');
        setEditNotes(participant.notes || '');
        setEditLinks(participant.socialLinks);
    };

    const handleSaveEdit = () => {
        if (editingId) {
            actions.updateParticipant({
                id: editingId,
                name: editName,
                description: editDescription.trim() || undefined,
                notes: editNotes.trim() || undefined,
                socialLinks: editLinks,
            });
            setEditingId(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {participants.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                        No participants in queue yet
                    </div>
                ) : (
                    <SortableContext
                        items={participants.map(p => p.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {participants.map((participant, index) => (
                            <SortableItem
                                key={participant.id}
                                participant={participant}
                                index={index}
                                currentPerformerId={currentPerformerId}
                                editingId={editingId}
                                editName={editName}
                                editDescription={editDescription}
                                editNotes={editNotes}
                                editLinks={editLinks}
                                onSetEditName={setEditName}
                                onSetEditDescription={setEditDescription}
                                onSetEditNotes={setEditNotes}
                                onSetEditLinks={setEditLinks}
                                onSaveEdit={handleSaveEdit}
                                onCancelEdit={handleCancelEdit}
                                onStartEdit={handleStartEdit}
                                onMoveUp={handleMoveUp}
                                onMoveDown={handleMoveDown}
                                onDelete={handleDelete}
                                onSetCurrentPerformer={(id) => actions.setCurrentPerformer({ id })}
                                participantsLength={participants.length}
                            />
                        ))}
                    </SortableContext>
                )}
            </div>
        </DndContext>
    );
}
