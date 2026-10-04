import assert from 'node:assert/strict';
import { buildDiscordSignupPayload, sendDiscordSignupNotification } from '../src/services/discordWebhook.ts';

const baseNotice = {
    participant: { name: 'Ada @everyone' },
    eventName: 'Open Stage Night',
    queuePosition: 7,
    includePerformerName: false,
    source: 'signup' as const,
};

{
    const payload = buildDiscordSignupPayload(baseNotice);
    assert.equal(payload.content, 'New signup for Open Stage Night; queue position #7.');
    assert.deepEqual(payload.allowed_mentions, { parse: [] });
}

{
    const payload = buildDiscordSignupPayload({ ...baseNotice, includePerformerName: true }, '123456789012345678');
    assert.equal(payload.content, '<@&123456789012345678> New signup: Ada @everyone for Open Stage Night; queue position #7.');
    assert.deepEqual(payload.allowed_mentions, { parse: [], roles: ['123456789012345678'] });
}

{
    const payload = buildDiscordSignupPayload({ ...baseNotice, source: 'manual', queuePosition: null }, 'bad-role');
    assert.equal(payload.content, 'Backstage walk-in for Open Stage Night; not queued yet.');
    assert.deepEqual(payload.allowed_mentions, { parse: [] });
}

{
    const calls: string[] = [];
    await sendDiscordSignupNotification({
        notice: baseNotice,
        webhookUrl: 'https://discord.test/webhook',
        fetchImpl: async (_url, init) => {
            calls.push(String(init?.body));
            return new Response(calls.length === 1 ? 'down' : null, { status: calls.length === 1 ? 500 : 204 });
        },
        sleep: async () => undefined,
    });
    assert.equal(calls.length, 2);
}

{
    let calls = 0;
    await sendDiscordSignupNotification({
        notice: baseNotice,
        webhookUrl: '',
        fetchImpl: async () => {
            calls++;
            return new Response('', { status: 204 });
        },
    });
    assert.equal(calls, 0);
}
