/**
 * English pronunciation through the platform speech synthesiser.
 *
 * This is an external-system connector, so it is the one place allowed to touch
 * browser APIs with side effects. It never falls back silently: if the device
 * has no speech synthesiser the UI is told so it can hide the button.
 */

export function isSpeechAvailable(): boolean {
  return typeof window.speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
}

/** Speaks an English term. Cancels any utterance already in flight. */
export function speakEnglish(text: string, onError: (reason: string) => void): void {
  if (!isSpeechAvailable()) {
    onError('speech synthesis is not available on this device');
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  utterance.onerror = (event: SpeechSynthesisErrorEvent): void => {
    onError(`speech synthesis failed: ${event.error}`);
  };
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
