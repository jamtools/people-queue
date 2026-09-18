import React, { CSSProperties, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Participant, SocialLink } from '../types';
import type { Actions } from '../index';
import { buildSocialUrl, generateSocialLinkId } from '../utils/socialLinks';
import { borderRadius, colors, fontFamilies, hexToRgba, spacing } from '../styles';

type SignupPageProps = {
    actions: Pick<Actions, 'addParticipant'>;
    onAddMyParticipantId: (id: string) => void;
    myParticipants: Participant[];
};

type ChoiceValue = '' | 'yes' | 'no';

const fieldStyle: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px 14px',
    fontSize: '16px',
    lineHeight: 1.35,
    border: `1px solid ${hexToRgba(colors.bridgeDrop, 0.2)}`,
    borderRadius: `${borderRadius.medium}px`,
    color: colors.bridgeDrop,
    backgroundColor: colors.whiteNoise,
    fontFamily: fontFamilies.poppins,
    outlineColor: colors.midnightCruise,
};

const labelStyle: CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    color: colors.bridgeDrop,
    fontSize: '15px',
    fontWeight: 800,
    fontFamily: fontFamilies.poppins,
};

const helperStyle: CSSProperties = {
    margin: '6px 0 0',
    color: hexToRgba(colors.bridgeDrop, 0.68),
    fontSize: '13px',
    lineHeight: 1.45,
    fontFamily: fontFamilies.poppins,
};

const sectionStyle: CSSProperties = {
    padding: `${spacing.md}px`,
    border: `1px solid ${hexToRgba(colors.midnightCruise, 0.12)}`,
    borderRadius: `${borderRadius.large}px`,
    backgroundColor: hexToRgba(colors.whiteNoise, 0.84),
};

const primaryButtonStyle: CSSProperties = {
    minHeight: '52px',
    padding: '14px 22px',
    border: 'none',
    borderRadius: `${borderRadius.medium}px`,
    backgroundColor: colors.midnightCruise,
    color: colors.whiteNoise,
    cursor: 'pointer',
    fontSize: '17px',
    fontWeight: 900,
    fontFamily: fontFamilies.poppins,
    boxShadow: '0 10px 22px rgba(45, 44, 128, 0.18)',
};

const secondaryButtonStyle: CSSProperties = {
    minHeight: '52px',
    padding: '14px 22px',
    border: `1px solid ${hexToRgba(colors.midnightCruise, 0.22)}`,
    borderRadius: `${borderRadius.medium}px`,
    backgroundColor: colors.whiteNoise,
    color: colors.midnightCruise,
    cursor: 'pointer',
    fontSize: '17px',
    fontWeight: 900,
    fontFamily: fontFamilies.poppins,
};

function makeSocialLink(type: SocialLink['type'], value: string, order: number): SocialLink | null {
    const trimmed = value.trim();
    if (!trimmed) return null;

    return {
        id: generateSocialLinkId(),
        type,
        url: type === 'custom' ? buildSocialUrl(trimmed, 'custom') || trimmed : trimmed,
        order,
    };
}

function requiredMarker() {
    return <span aria-hidden="true" style={{ color: '#b42318' }}> *</span>;
}

export function SignupPage({ actions, onAddMyParticipantId, myParticipants }: SignupPageProps) {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [email, setEmail] = useState('');
    const [equipmentNeeds, setEquipmentNeeds] = useState('');
    const [instagramHandle, setInstagramHandle] = useState('');
    const [tiktokHandle, setTiktokHandle] = useState('');
    const [otherHandle, setOtherHandle] = useState('');
    const [privateVideo, setPrivateVideo] = useState<ChoiceValue>('');
    const [photoConsent, setPhotoConsent] = useState(false);
    const [recapConsent, setRecapConsent] = useState(false);
    const [songDriveUpdates, setSongDriveUpdates] = useState<ChoiceValue>('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedName, setSubmittedName] = useState<string | null>(null);

    const socialLinks = useMemo(() => {
        const links = [
            makeSocialLink('instagram', instagramHandle, 0),
            makeSocialLink('tiktok', tiktokHandle, 1),
            makeSocialLink('custom', otherHandle, 2),
        ].filter((link): link is SocialLink => link !== null);

        return links.map((link, order) => ({ ...link, order }));
    }, [instagramHandle, otherHandle, tiktokHandle]);

    const resetForm = () => {
        setName('');
        setBio('');
        setEmail('');
        setEquipmentNeeds('');
        setInstagramHandle('');
        setTiktokHandle('');
        setOtherHandle('');
        setPrivateVideo('');
        setPhotoConsent(false);
        setRecapConsent(false);
        setSongDriveUpdates('');
    };

    const handleSignUpAnotherPlayer = () => {
        setSubmittedName(null);
        setError(null);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError('Please enter your name or stage name.');
            return;
        }

        if (!bio.trim()) {
            setError('Please tell us a little about yourself.');
            return;
        }

        if (!privateVideo) {
            setError('Please choose whether you want a private performance video.');
            return;
        }

        if (!photoConsent || !recapConsent) {
            setError('Please acknowledge the photo and recap reel notices.');
            return;
        }

        if (!songDriveUpdates) {
            setError('Please choose whether you want SongDrive app updates.');
            return;
        }

        setIsSubmitting(true);
        try {
            const notes = [
                email.trim() ? `Email: ${email.trim()}` : 'Email: not provided',
                equipmentNeeds.trim() ? `Equipment needs: ${equipmentNeeds.trim()}` : 'Equipment needs: none provided',
                `Private performance video: ${privateVideo === 'yes' ? 'Yes' : 'No'}`,
                'Event photography: acknowledged promotional use',
                'Event recap reels: acknowledged short promotional clips',
                `SongDrive updates: ${songDriveUpdates === 'yes' ? 'Yes' : 'No'}`,
            ].join('\n');

            const result = await actions.addParticipant({
                name: name.trim(),
                description: bio.trim(),
                socialLinks,
                notes,
                source: 'signup',
                addToQueue: true,
            });

            onAddMyParticipantId(result.id);
            setSubmittedName(name.trim());
            resetForm();
        } catch (submitError) {
            console.error('Open Stage signup failed:', submitError);
            setError('Something went wrong while adding you to the lineup. Please try again or ask the host for help.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main
            style={{
                minHeight: '100vh',
                backgroundColor: colors.bridgeDrop,
                backgroundImage: 'url(/assets/background.svg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                padding: '32px 16px 56px',
                boxSizing: 'border-box',
                fontFamily: fontFamilies.poppins,
            }}
        >
            <div style={{ maxWidth: '920px', margin: '0 auto' }}>
                <header
                    style={{
                        color: colors.whiteNoise,
                        marginBottom: `${spacing.md}px`,
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr)',
                        gap: `${spacing.sm}px`,
                    }}
                >
                    <button
                        type="button"
                        onClick={() => navigate('/queue')}
                        style={{
                            justifySelf: 'start',
                            minHeight: '44px',
                            padding: '10px 14px',
                            color: colors.whiteNoise,
                            backgroundColor: hexToRgba(colors.whiteNoise, 0.14),
                            border: `1px solid ${hexToRgba(colors.whiteNoise, 0.36)}`,
                            borderRadius: `${borderRadius.medium}px`,
                            cursor: 'pointer',
                            fontWeight: 700,
                        }}
                    >
                        View lineup
                    </button>
                    <div>
                        <h1
                            style={{
                                margin: '0 0 12px',
                                fontFamily: fontFamilies.fredoka,
                                fontSize: 'clamp(42px, 9vw, 82px)',
                                lineHeight: 0.95,
                                letterSpacing: '-0.03em',
                            }}
                        >
                            Open Stage Night
                        </h1>
                    </div>
                </header>

                {submittedName ? (
                    <section
                        aria-label="Signup complete"
                        style={{
                            ...sectionStyle,
                            padding: 'clamp(28px, 6vw, 56px)',
                            textAlign: 'center',
                        }}
                    >
                        <div
                            aria-hidden="true"
                            style={{
                                width: '72px',
                                height: '72px',
                                margin: '0 auto 18px',
                                borderRadius: '999px',
                                display: 'grid',
                                placeItems: 'center',
                                backgroundColor: '#ecfdf3',
                                color: '#05603a',
                                border: '1px solid #abefc6',
                                fontSize: '36px',
                                fontWeight: 900,
                            }}
                        >
                            ✓
                        </div>
                        <h2
                            style={{
                                margin: '0 0 10px',
                                color: colors.bridgeDrop,
                                fontFamily: fontFamilies.fredoka,
                                fontSize: 'clamp(36px, 8vw, 62px)',
                                lineHeight: 1,
                            }}
                        >
                            Thanks for signing up!
                        </h2>
                        <p
                            style={{
                                margin: '0 auto 8px',
                                maxWidth: '620px',
                                color: colors.bridgeDrop,
                                fontSize: '20px',
                                lineHeight: 1.45,
                                fontWeight: 800,
                            }}
                        >
                            {submittedName} is in the lineup.
                        </p>
                        <p
                            style={{
                                margin: '0 auto 28px',
                                maxWidth: '620px',
                                color: hexToRgba(colors.bridgeDrop, 0.72),
                                fontSize: '16px',
                                lineHeight: 1.55,
                            }}
                        >
                            You can add another performer from this device or check the current queue.
                        </p>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: `${spacing.sm}px`,
                                maxWidth: '520px',
                                margin: '0 auto',
                            }}
                        >
                            <button
                                type="button"
                                onClick={handleSignUpAnotherPlayer}
                                style={secondaryButtonStyle}
                            >
                                Sign up another player
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/queue')}
                                style={primaryButtonStyle}
                            >
                                View queue
                            </button>
                        </div>
                    </section>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        style={{
                            ...sectionStyle,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: `${spacing.md}px`,
                        }}
                    >
                        {error && (
                            <div
                                role="alert"
                                style={{
                                    padding: '14px 16px',
                                    borderRadius: `${borderRadius.medium}px`,
                                    backgroundColor: '#fef3f2',
                                    color: '#b42318',
                                    border: '1px solid #fecdca',
                                    fontWeight: 700,
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="signup-name" style={labelStyle}>
                                Name (or stage name){requiredMarker()}
                            </label>
                            <input
                                id="signup-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={fieldStyle}
                                autoComplete="name"
                                required
                            />
                        </div>

                    <div>
                        <label htmlFor="signup-bio" style={labelStyle}>
                            Tell us about yourself{requiredMarker()}
                        </label>
                        <textarea
                            id="signup-bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={5}
                            style={{ ...fieldStyle, resize: 'vertical' }}
                            placeholder="Who are you, what do you make, and what inspires your sound?"
                            required
                        />
                        <p style={helperStyle}>Write as much or as little as you’d like.</p>
                    </div>

                    <div>
                        <label htmlFor="signup-email" style={labelStyle}>Email</label>
                        <input
                            id="signup-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={fieldStyle}
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label htmlFor="signup-equipment" style={labelStyle}>Equipment needs</label>
                        <textarea
                            id="signup-equipment"
                            value={equipmentNeeds}
                            onChange={(e) => setEquipmentNeeds(e.target.value)}
                            rows={3}
                            style={{ ...fieldStyle, resize: 'vertical' }}
                            placeholder="List instruments, mics, DI, tracks, or other setup notes."
                        />
                    </div>

                    <fieldset style={{ margin: 0, padding: 0, border: 0 }}>
                        <legend style={labelStyle}>Promotion</legend>
                        <p style={{ ...helperStyle, marginBottom: `${spacing.sm}px` }}>
                            Share up to three handles. SongDrive may show selected platforms through a QR code during your performance.
                        </p>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                                gap: `${spacing.sm}px`,
                            }}
                        >
                            <div>
                                <label htmlFor="signup-instagram" style={labelStyle}>Instagram Handle</label>
                                <input
                                    id="signup-instagram"
                                    type="text"
                                    value={instagramHandle}
                                    onChange={(e) => setInstagramHandle(e.target.value)}
                                    style={fieldStyle}
                                    placeholder="@yourhandle"
                                />
                            </div>
                            <div>
                                <label htmlFor="signup-tiktok" style={labelStyle}>TikTok Handle</label>
                                <input
                                    id="signup-tiktok"
                                    type="text"
                                    value={tiktokHandle}
                                    onChange={(e) => setTiktokHandle(e.target.value)}
                                    style={fieldStyle}
                                    placeholder="@yourhandle"
                                />
                            </div>
                            <div>
                                <label htmlFor="signup-other" style={labelStyle}>Other Handle</label>
                                <input
                                    id="signup-other"
                                    type="text"
                                    value={otherHandle}
                                    onChange={(e) => setOtherHandle(e.target.value)}
                                    style={fieldStyle}
                                    placeholder="Bandcamp, website, or other URL"
                                />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset style={{ margin: 0, padding: 0, border: 0 }}>
                        <legend style={labelStyle}>
                            Private Performance Video (Optional){requiredMarker()}
                        </legend>
                        <p style={{ ...helperStyle, marginBottom: `${spacing.sm}px` }}>
                            SongDrive will not repost or publicly share this full performance video.
                        </p>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            <label style={{ display: 'flex', gap: '10px', alignItems: 'center', minHeight: '44px', color: colors.bridgeDrop }}>
                                <input
                                    type="radio"
                                    name="private-video"
                                    checked={privateVideo === 'yes'}
                                    onChange={() => setPrivateVideo('yes')}
                                />
                                Yes, send me my private performance video
                            </label>
                            <label style={{ display: 'flex', gap: '10px', alignItems: 'center', minHeight: '44px', color: colors.bridgeDrop }}>
                                <input
                                    type="radio"
                                    name="private-video"
                                    checked={privateVideo === 'no'}
                                    onChange={() => setPrivateVideo('no')}
                                />
                                No thanks
                            </label>
                        </div>
                    </fieldset>

                    <fieldset style={{ margin: 0, padding: 0, border: 0 }}>
                        <legend style={labelStyle}>Event media acknowledgements{requiredMarker()}</legend>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', minHeight: '44px', color: colors.bridgeDrop }}>
                                <input
                                    type="checkbox"
                                    checked={photoConsent}
                                    onChange={(e) => setPhotoConsent(e.target.checked)}
                                    style={{ marginTop: '3px' }}
                                />
                                I understand SongDrive may use event photos for promotion.
                            </label>
                            <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', minHeight: '44px', color: colors.bridgeDrop }}>
                                <input
                                    type="checkbox"
                                    checked={recapConsent}
                                    onChange={(e) => setRecapConsent(e.target.checked)}
                                    style={{ marginTop: '3px' }}
                                />
                                I understand SongDrive may use short recap clips.
                            </label>
                        </div>
                    </fieldset>

                    <fieldset style={{ margin: 0, padding: 0, border: 0 }}>
                        <legend style={labelStyle}>
                            SongDrive Updates{requiredMarker()}
                        </legend>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            <label style={{ display: 'flex', gap: '10px', alignItems: 'center', minHeight: '44px', color: colors.bridgeDrop }}>
                                <input
                                    type="radio"
                                    name="songdrive-updates"
                                    checked={songDriveUpdates === 'yes'}
                                    onChange={() => setSongDriveUpdates('yes')}
                                />
                                Yes, send me SongDrive updates
                            </label>
                            <label style={{ display: 'flex', gap: '10px', alignItems: 'center', minHeight: '44px', color: colors.bridgeDrop }}>
                                <input
                                    type="radio"
                                    name="songdrive-updates"
                                    checked={songDriveUpdates === 'no'}
                                    onChange={() => setSongDriveUpdates('no')}
                                />
                                No thanks
                            </label>
                        </div>
                    </fieldset>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                ...primaryButtonStyle,
                                backgroundColor: isSubmitting ? hexToRgba(colors.midnightCruise, 0.58) : colors.midnightCruise,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {isSubmitting ? 'Adding you…' : 'Join the lineup'}
                        </button>
                    </form>
                )}

                {myParticipants.length > 0 && (
                    <section
                        aria-label="Your submissions"
                        style={{
                            ...sectionStyle,
                            marginTop: `${spacing.md}px`,
                        }}
                    >
                        <h2 style={{ margin: '0 0 8px', color: colors.bridgeDrop, fontSize: '22px' }}>Your submissions</h2>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {myParticipants.map((participant) => (
                                <div
                                    key={participant.id}
                                    style={{
                                        padding: '12px 14px',
                                        borderRadius: `${borderRadius.medium}px`,
                                        backgroundColor: colors.whiteNoise,
                                        border: `1px solid ${hexToRgba(colors.bridgeDrop, 0.12)}`,
                                        color: colors.bridgeDrop,
                                    }}
                                >
                                    <strong>{participant.name}</strong>
                                    <div style={{ fontSize: '13px', color: hexToRgba(colors.bridgeDrop, 0.7), marginTop: '4px' }}>
                                        Added to the lineup from this device.
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
