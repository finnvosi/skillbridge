// Sentry crash/release monitoring (blueprint §12 stack). Enabled only when a
// DSN is configured via EXPO_PUBLIC_SENTRY_DSN; otherwise this module is a
// no-op so local/demo builds never send anything anywhere.
import * as Sentry from '@sentry/react-native';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initSentry(): void {
  if (!DSN) return;
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 0.1,
    // Scrub sensitive request bodies (blueprint: analytics must never include
    // uploaded documents, government identifiers, report narratives, or
    // Passport content).
    beforeSend: (event) => {
      if (event.request?.data) {
        event.request.data = undefined;
      }
      return event;
    },
  });
}
