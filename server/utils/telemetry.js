const Sentry = require('@sentry/node');
const { PostHog } = require('posthog-node');

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://dummy@o0.ingest.sentry.io/0",
  tracesSampleRate: 1.0,
});

// Initialize PostHog
const posthog = new PostHog(
  process.env.POSTHOG_KEY || 'phc_dummy_key',
  { host: process.env.POSTHOG_HOST || 'https://app.posthog.com' }
);

const trackEvent = (distinctId, eventName, properties) => {
  try {
    posthog.capture({
      distinctId,
      event: eventName,
      properties
    });
  } catch (e) {
    console.error('Failed to track backend event', e);
  }
};

const captureError = (error, context) => {
  try {
    Sentry.captureException(error, { extra: context });
  } catch (e) {
    console.error('Failed to capture backend error', e);
  }
};

module.exports = {
  Sentry,
  posthog,
  trackEvent,
  captureError
};
