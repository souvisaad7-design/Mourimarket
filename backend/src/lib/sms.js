// Phone verification codes by SMS (Twilio Verify). Twilio generates, sends and checks the codes,
// with its own anti-fraud limits. Needs, in Vercel → Settings → Environment Variables:
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID
// Without them, verification is off in production; in development a fake code is used.
import crypto from 'node:crypto';
import { config } from '../config.js';

const { TWILIO_ACCOUNT_SID: SID, TWILIO_AUTH_TOKEN: TOKEN, TWILIO_VERIFY_SERVICE_SID: SERVICE } = process.env;
export const smsProvider = SID && TOKEN && SERVICE ? 'twilio' : config.isProd ? null : 'dev';

async function twilio(path, params) {
  const res = await fetch(`https://verify.twilio.com/v2/Services/${SERVICE}/${path}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${SID}:${TOKEN}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`twilio ${res.status} ${data.code || ''}`);
    err.twilioCode = data.code; err.status = res.status;
    throw err;
  }
  return data;
}

// Development only: codes kept in memory and returned to the client (never in production).
const devCodes = new Map();

/** Send a code to +222XXXXXXXX. Returns { devCode? }. */
export async function sendCode(phone, lang = 'ar') {
  if (smsProvider === 'twilio') {
    await twilio('Verifications', { To: phone, Channel: 'sms', Locale: lang === 'fr' ? 'fr' : lang === 'en' ? 'en' : 'ar' });
    return {};
  }
  if (smsProvider === 'dev') {
    const code = String(crypto.randomInt(100000, 1000000));
    devCodes.set(phone, { code, until: Date.now() + 10 * 60 * 1000, tries: 0 });
    return { devCode: code };
  }
  throw new Error('no SMS provider');
}

/** true if the code is right (and not expired). */
export async function checkCode(phone, code) {
  if (smsProvider === 'twilio') {
    try {
      const r = await twilio('VerificationCheck', { To: phone, Code: code });
      return r.status === 'approved';
    } catch (err) {
      if (err.status === 404) return false; // expired or already used
      throw err;
    }
  }
  const d = devCodes.get(phone);
  if (!d || d.until < Date.now() || d.tries >= 5) return false;
  d.tries += 1;
  if (d.code !== code) return false;
  devCodes.delete(phone);
  return true;
}
