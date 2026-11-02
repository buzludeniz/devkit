/**
 * Sends Sir a status email.
 *
 * One job: an agent calls this as its last action of a session, so he has a record
 * outside the conversation. That is the whole thing.
 *
 * This replaced a heartbeat-and-poll watchdog, which was the wrong shape for the
 * actual use case: Sir runs several sessions at once, and a model that watches for
 * silence cannot tell one session's quiet from another's. A session that knows it is
 * finishing can simply say so, which is both simpler and more accurate.
 *
 * USAGE
 *
 *   node scripts/agent-notify.mjs "Subject" "Body"
 *   node scripts/agent-notify.mjs "Subject" --stdin   < message.txt
 *   node scripts/agent-notify.mjs "Subject" "Body" --dry-run
 *
 * CONFIGURATION — all from the user environment, never from this repository
 *
 *   RESEND_API_KEY   from resend.com/api-keys
 *   MAIL_FROM        a sender Resend has verified
 *   ALERT_TO         where the mail goes; defaults to MAIL_FROM
 *
 * gmail.com cannot be used as MAIL_FROM: Resend will not send from a domain nobody
 * can prove they own. `onboarding@resend.dev` is the free sender, and it delivers
 * only to the account's own verified address.
 *
 * NEVER FAILS THE CALLER. A status update that breaks the session it is reporting on
 * is worse than no status update, so a failure prints to stderr and exits 0. A
 * non-zero exit would make an agent believe its work had failed.
 */

import { appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** Appended to on every attempt, so a silent failure is still diagnosable. */
const LOG = join(process.cwd(), '.agent-notify.log');

const readEnv = (name) => {
    const value = process.env[name];
    return value === undefined || value === '' ? null : value;
};

const parseArgs = () => {
    const args = process.argv.slice(2);
    const flags = new Set(args.filter((a) => a.startsWith('--')));
    const positional = args.filter((a) => !a.startsWith('--'));

    return {
        flags,
        subject: positional[0] ?? 'Agent status',
        body: positional[1] ?? null,
        stdin: flags.has('--stdin')
    };
};

const readStdin = async () => {
    if (process.stdin.isTTY) return '';

    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
};

/** A one-line stamp so several sessions' emails can be told apart. */
const stamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

const log = (line) => {
    // Best effort. If even this fails there is nothing more to try.
    try {
        appendFileSync(LOG, `${stamp()}  ${line}\n`);
    } catch {
        /* nothing useful to do */
    }
};

const send = async ({ subject, body }) => {
    const key = readEnv('RESEND_API_KEY');
    const from = readEnv('MAIL_FROM');
    const to = readEnv('ALERT_TO') ?? from;

    if (!key || !from) {
        return {
            sent: false,
            reason: 'RESEND_API_KEY and MAIL_FROM must be set in the user environment'
        };
    }

    const text = `${body.trim()}\n\n---\nsent ${stamp()}`;

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, subject, text })
    });

    if (response.ok) return { sent: true, status: response.status };

    // The body is the only useful part of a refusal. Reporting "not sent" with no
    // reason is indistinguishable from having no way to send at all.
    const detail = await response.text().catch(() => '');
    return {
        sent: false,
        status: response.status,
        reason: `resend ${response.status}: ${detail.slice(0, 300) || 'no body'}`
    };
};

const main = async () => {
    const { flags, subject, body, stdin } = parseArgs();

    const content = stdin ? await readStdin() : (body ?? '');

    if (!content.trim()) {
        log('skipped: empty body');
        console.error('[notify] nothing to send: no message given');
        return;
    }

    if (flags.has('--dry-run')) {
        console.log(`[notify] DRY RUN\n  to:      ${readEnv('ALERT_TO') ?? readEnv('MAIL_FROM') ?? '(unset)'}`);
        console.log(`  from:    ${readEnv('MAIL_FROM') ?? '(unset)'}`);
        console.log(`  subject: ${subject}`);
        console.log(`  body:\n${content}`);
        return;
    }

    let result;

    try {
        result = await send({ subject, body: content });
    } catch (error) {
        // Never rethrow. A notification must not fail the work it is reporting on.
        log(`failed: ${error.message}`);
        console.error(`[notify] could not send: ${error.message}`);
        return;
    }

    log(result.sent ? 'sent' : `not sent: ${result.reason ?? 'unknown'}`);

    if (result.sent) {
        console.log(`[notify] sent to ${readEnv('ALERT_TO') ?? readEnv('MAIL_FROM')}`);
    } else {
        console.error(`[notify] not sent: ${result.reason}`);
        if (existsSync(LOG)) console.error(`[notify] see ${LOG}`);
    }
};

main().catch((error) => {
    console.error(`[notify] failed: ${error.message}`);
    // Exit 0 on purpose: see the header.
    process.exitCode = 0;
});
