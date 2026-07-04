import posthog from 'posthog-js';
import * as Sentry from '@sentry/react';

// Initialize Sentry
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN || "https://dummy@o0.ingest.sentry.io/0", // Replace with real DSN
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0, 
  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0, 
});

// Initialize PostHog
posthog.init(process.env.REACT_APP_POSTHOG_KEY || 'phc_dummy_key', {
  api_host: process.env.REACT_APP_POSTHOG_HOST || 'https://app.posthog.com',
  autocapture: true,
  capture_pageview: true
});

export const trackEvent = (eventName, properties) => {
  try {
    posthog.capture(eventName, properties);
  } catch(e) {
    console.error('Failed to track event', e);
  }
};

export const captureError = (error, context) => {
  try {
    Sentry.captureException(error, { extra: context });
  } catch(e) {
    console.error('Failed to capture error', e);
  }
};

export { posthog, Sentry };
