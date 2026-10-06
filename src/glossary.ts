/**
 * Combines the bundled glossary with the learner's imported entries.
 *
 * A custom entry can start colliding with the bundled list after an update adds
 * that same term. That must not break the app, and it must not be hidden either:
 * the duplicates are left out of the deck and counted, so the UI can say so.
 */

import type { Term } from './types';

export interface Glossary {
  readonly terms: readonly Term[];
  /** Imported entries hidden because the bundled glossary already covers them. */
  readonly shadowed: readonly Term[];
}

function keyOf(term: Term): string {
  return `${term.subject}:${term.en.toLowerCase()}`;
}

export function assembleGlossary(bundled: readonly Term[], custom: readonly Term[]): Glossary {
  const bundledKeys = new Set(bundled.map(keyOf));
  const seen = new Set(bundledKeys);
  const accepted: Term[] = [];
  const shadowed: Term[] = [];

  for (const term of custom) {
    const key = keyOf(term);
    if (seen.has(key)) {
      shadowed.push(term);
      continue;
    }
    seen.add(key);
    accepted.push(term);
  }

  return { terms: [...bundled, ...accepted], shadowed };
}
