import { registerRootComponent } from 'expo';
import { initSentry } from './src/services/sentry';
import App from './src/App';

// Crash/release monitoring — no-op unless EXPO_PUBLIC_SENTRY_DSN is set.
initSentry();

// Register the main component
registerRootComponent(App);
