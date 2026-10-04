import type { Participant } from '../types';

export type DiscordSignupSource = 'signup' | 'manual';

export type DiscordSignupNotice = {
    participant: Pick<Participant, 'name'>;
    eventName: string;
    queuePosition: number | null;
    includePerformerName: boolean;
    source: DiscordSignupSource;
};

type DiscordWebhookPayload = {
    content: string;
    allowed_mentions: {
        parse: [];
        roles?: string[];
    };
};

type SendDiscordSignupNotificationArgs = {
    notice: DiscordSignupNotice;
    webhookUrl?: string;
    roleId?: string;
    fetchImpl?: typeof fetch;
    sleep?: (milliseconds: number) => Promise<void>;
};

const MAX_RETRY_DELAY_MS = 2000;

function cleanRoleId(roleId: string | undefined): string | undefined {
    const trimmed = roleId?.trim();
    if (!trimmed) return undefined;
    return /^\d{17,20}$/.test(trimmed) ? trimmed : undefined;
}

function getRetryDelayMilliseconds(response: Response, responseText: string): number {
    const retryAfter = Number(response.headers.get('retry-after'));
    if (Number.isFinite(retryAfter) && retryAfter > 0) {
        return Math.min(Math.ceil(retryAfter * 1000), MAX_RETRY_DELAY_MS);
    }

    try {
        const body = JSON.parse(responseText) as { retry_after?: unknown };
        if (typeof body.retry_after === 'number' && Number.isFinite(body.retry_after) && body.retry_after > 0) {
            return Math.min(Math.ceil(body.retry_after * 1000), MAX_RETRY_DELAY_MS);
        }
    } catch {
        // Discord may return an empty body for non-429 errors.
    }

    return 500;
}

export function buildDiscordSignupPayload(notice: DiscordSignupNotice, roleId?: string): DiscordWebhookPayload {
    const cleanEventName = notice.eventName.trim() || 'Open Stage Night';
    const position = notice.queuePosition === null ? 'not queued yet' : `queue position #${notice.queuePosition}`;
    const source = notice.source === 'manual' ? 'Backstage walk-in' : 'New signup';
    const name = notice.includePerformerName ? `: ${notice.participant.name.trim() || 'Unnamed performer'}` : '';
    const cleanRole = cleanRoleId(roleId);
    const roleMention = cleanRole ? `<@&${cleanRole}> ` : '';

    return {
        content: `${roleMention}${source}${name} for ${cleanEventName}; ${position}.`,
        allowed_mentions: {
            parse: [],
            ...(cleanRole ? { roles: [cleanRole] } : {}),
        },
    };
}

export async function sendDiscordSignupNotification({
    notice,
    webhookUrl = process.env.DISCORD_SIGNUP_WEBHOOK_URL,
    roleId = process.env.DISCORD_SIGNUP_WEBHOOK_ROLE_ID,
    fetchImpl = fetch,
    sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
}: SendDiscordSignupNotificationArgs): Promise<void> {
    const trimmedWebhookUrl = webhookUrl?.trim();
    if (!trimmedWebhookUrl) return;

    const payload = buildDiscordSignupPayload(notice, roleId);
    let retryDelayMilliseconds = 0;

    // ken: one in-process retry; add a durable queue when webhook delivery must be guaranteed.
    for (let attempt = 0; attempt < 2; attempt++) {
        if (retryDelayMilliseconds > 0) {
            await sleep(retryDelayMilliseconds);
        }

        try {
            const response = await fetchImpl(trimmedWebhookUrl, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok || response.status === 204) return;

            const responseText = await response.text();
            if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
                retryDelayMilliseconds = getRetryDelayMilliseconds(response, responseText);
                continue;
            }

            console.warn(`Discord signup webhook failed with HTTP ${response.status}: ${responseText.slice(0, 200)}`);
            return;
        } catch (error) {
            if (attempt === 0) {
                retryDelayMilliseconds = 500;
                continue;
            }

            console.warn('Discord signup webhook failed:', error);
            return;
        }
    }
}
