// SMS delivery for phone OTP (blueprint §12: phone OTP is the default worker
// sign-in path).
//
// The prototype ships a `mock` provider only: codes are logged server-side and
// returned as `demoCode` in the response so the app is fully testable without
// an SMS gateway. Production must implement a real provider (Twilio, Infobip,
// Vonage…) behind this same interface, gated by the SMS_PROVIDER env var.
const PROVIDER = process.env.SMS_PROVIDER || 'mock';

export interface SmsResult {
  provider: string;
  /** Present only in mock mode so the demo app can show the code. */
  demoCode?: string;
}

export async function sendOtpSms(phone: string, code: string): Promise<SmsResult> {
  switch (PROVIDER) {
    case 'mock':
      // eslint-disable-next-line no-console
      console.log(`[sms:mock] OTP for ${phone}: ${code}`);
      return { provider: 'mock', demoCode: code };
    default:
      // Honest failure — never silently drop a real SMS.
      throw new Error(
        `SMS_PROVIDER "${PROVIDER}" is not implemented yet. Use SMS_PROVIDER=mock for local development.`
      );
  }
}
