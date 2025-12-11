import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { SocialLink, Participant } from '../types';
import { SocialLinksEditor } from '../components/SocialLinksEditor';
import { generateParticipantId } from '../utils/socialLinks';

type SignupPageProps = {
    onAddParticipant: (participant: Participant) => void;
};

export function SignupPage({ onAddParticipant }: SignupPageProps) {
    const [name, setName] = useState('');
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            alert('Please enter your name');
            return;
        }

        const participant: Participant = {
            id: generateParticipantId(),
            name: name.trim(),
            socialLinks,
            order: 0,
        };

        onAddParticipant(participant);
        setName('');
        setSocialLinks([]);
        alert('Successfully added to the queue!');
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
                        Social Media Links
                    </label>
                    <SocialLinksEditor links={socialLinks} onChange={setSocialLinks} />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        type="submit"
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
                        Join Queue
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
                            cursor: 'pointer'
                        }}
                    >
                        Backstage
                    </button>
                </div>
            </form>
        </div>
    );
}
