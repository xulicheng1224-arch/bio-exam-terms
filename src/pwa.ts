/**
 * Registers the service worker that keeps the installed app usable offline.
 *
 * Failure here is deliberately logged rather than shown in the error banner:
 * the app is a single self-contained document and stays fully functional
 * without a service worker, so a permanent red banner would misrepresent the
 * state, and the learner has no action available. It is never swallowed - the
 * full cause goes to the console.
 */

const FILE_PROTOCOL_PREFIX = 'file:';

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  if (window.location.protocol === FILE_PROTOCOL_PREFIX) {
    // Service workers are not permitted on file://, and the single-file build
    // already runs offline there without one.
    return;
  }
  navigator.serviceWorker.register('./sw.js').catch((cause: unknown) => {
    console.error('service worker registration failed', {
      scriptUrl: './sw.js',
      scope: window.location.href,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
  });
}
