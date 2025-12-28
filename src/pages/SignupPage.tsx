import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Participant, SocialLink } from '../types';
import { SocialLinksEditor } from '../components/SocialLinksEditor';
import type { Actions } from '../index';

type SignupPageProps = {
    actions: Pick<Actions, 'addParticipant' | 'updateParticipant'>;
    onAddMyParticipantId: (id: string) => void;
    myParticipants: Participant[];
};

export function SignupPage({ actions, onAddMyParticipantId, myParticipants }: SignupPageProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            alert('Please enter your name');
            return;
        }

        const result = await actions.addParticipant({
            name: name.trim(),
            description: description.trim() || undefined,
            socialLinks,
        });

        onAddMyParticipantId(result.id);
        setName('');
        setDescription('');
        setSocialLinks([]);
        alert('Successfully added to the queue!');
    };

    const handleUpdateLinks = async (participantId: string, newLinks: SocialLink[]) => {
        const participant = myParticipants.find(p => p.id === participantId);
        if (participant) {
            await actions.updateParticipant({
                id: participantId,
                name: participant.name,
                description: participant.description,
                socialLinks: newLinks,
            });
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h1>Open Mic Signup</h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>
                Enter your name and social media handles. When you perform, we'll display a QR code
                that leads to your social links!
            </p>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Your Name *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What will you be performing? (optional)"
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Social Media Links
                    </label>
                    <SocialLinksEditor links={socialLinks} onChange={setSocialLinks} />
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        type="submit"
                        style={{
                            padding: '12px 24px',
                            fontSize: '16px',
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
                        Add to Queue
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/backstage')}
                        style={{
                            padding: '12px 24px',
                            fontSize: '16px',
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
                        Backstage
                    </button>
                </div>
            </form>

            {myParticipants.length > 0 && (
                <div style={{ marginTop: '48px' }}>
                    <h2>My Artists in Queue</h2>
                    <p style={{ color: '#666', marginBottom: '16px' }}>
                        Artists you've added from this device
                    </p>
                    {myParticipants.map((participant) => (
                        <div
                            key={participant.id}
                            style={{
                                padding: '16px',
                                marginBottom: '16px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                backgroundColor: '#f9f9f9'
                            }}
                        >
                            <h3 style={{ marginTop: 0, marginBottom: '8px' }}>{participant.name}</h3>
                            {participant.description && (
                                <p style={{ color: '#666', marginTop: 0, marginBottom: '12px', fontStyle: 'italic' }}>
                                    {participant.description}
                                </p>
                            )}
                            <div style={{ marginBottom: '8px' }}>
                                <strong>Social Links:</strong>
                            </div>
                            {editingId === participant.id ? (
                                <div>
                                    <SocialLinksEditor
                                        links={participant.socialLinks}
                                        onChange={(newLinks) => handleUpdateLinks(participant.id, newLinks)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setEditingId(null)}
                                        style={{
                                            marginTop: '12px',
                                            padding: '8px 16px',
                                            fontSize: '14px',
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
                                        Done Editing
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    {participant.socialLinks.length === 0 ? (
                                        <p style={{ color: '#999', fontStyle: 'italic' }}>No social links added</p>
                                    ) : (
                                        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                            {participant.socialLinks.map((link) => (
                                                <li key={link.id}>
                                                    {link.type}: {link.url}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setEditingId(participant.id)}
                                        style={{
                                            marginTop: '8px',
                                            padding: '8px 16px',
                                            fontSize: '14px',
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
                                        Edit Links
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
