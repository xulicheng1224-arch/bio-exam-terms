/**
 * Runtime validation for glossary data.
 *
 * Term data is external input: it is hand-authored, later imported from user
 * files, and bundled as plain JSON. It must therefore be validated at runtime
 * rather than trusted through a type assertion.
 */

import type { Subject, Term } from './types';

const SUBJECTS: readonly Subject[] = ['cell', 'molecular', 'biochem'];

/** Raised when a glossary entry fails validation. Carries the exact position. */
export class TermDataError extends Error {
  readonly sourceLabel: string;
  readonly index: number;
  readonly field: string;

  constructor(sourceLabel: string, index: number, field: string, reason: string) {
    super(`[${sourceLabel}] entry #${index}: field "${field}" is invalid - ${reason}`);
    this.name = 'TermDataError';
    this.sourceLabel = sourceLabel;
    this.index = index;
    this.field = field;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(
  raw: Record<string, unknown>,
  field: string,
  sourceLabel: string,
  index: number,
): string {
  const value = raw[field];
  if (typeof value !== 'string') {
    throw new TermDataError(sourceLabel, index, field, `expected a string, received ${typeof value}`);
  }
  if (value.trim().length === 0) {
    throw new TermDataError(sourceLabel, index, field, 'must not be empty');
  }
  return value.trim();
}

function readSubject(
  raw: Record<string, unknown>,
  sourceLabel: string,
  index: number,
): Subject {
  const value = raw['subject'];
  if (typeof value !== 'string') {
    throw new TermDataError(sourceLabel, index, 'subject', `expected a string, received ${typeof value}`);
  }
  const matched = SUBJECTS.find((candidate: Subject): boolean => candidate === value);
  if (matched === undefined) {
    throw new TermDataError(
      sourceLabel,
      index,
      'subject',
      `unknown subject "${value}", expected one of ${SUBJECTS.join(' | ')}`,
    );
  }
  return matched;
}

/** Validates one raw entry. Throws {@link TermDataError} on the first problem found. */
export function parseTerm(raw: unknown, index: number, sourceLabel: string): Term {
  if (!isRecord(raw)) {
    throw new TermDataError(sourceLabel, index, '<entry>', `expected an object, received ${typeof raw}`);
  }
  return {
    id: readString(raw, 'id', sourceLabel, index),
    subject: readSubject(raw, sourceLabel, index),
    en: readString(raw, 'en', sourceLabel, index),
    cn: readString(raw, 'cn', sourceLabel, index),
    defCn: readString(raw, 'defCn', sourceLabel, index),
    topic: readString(raw, 'topic', sourceLabel, index),
    // note is the only field allowed to be empty; it falls back to "" when absent.
    note: typeof raw['note'] === 'string' ? raw['note'].trim() : '',
  };
}

/** Raised when two entries collide on a key that must be unique. */
export class DuplicateTermError extends Error {
  readonly sourceLabel: string;
  readonly key: string;
  readonly value: string;
  readonly firstIndex: number;
  readonly secondIndex: number;

  constructor(
    sourceLabel: string,
    key: string,
    value: string,
    firstIndex: number,
    secondIndex: number,
  ) {
    super(
      `[${sourceLabel}] duplicate ${key} "${value}" at entries #${firstIndex} and #${secondIndex}`,
    );
    this.name = 'DuplicateTermError';
    this.sourceLabel = sourceLabel;
    this.key = key;
    this.value = value;
    this.firstIndex = firstIndex;
    this.secondIndex = secondIndex;
  }
}

function assertUnique(
  seen: Map<string, number>,
  key: string,
  value: string,
  index: number,
  sourceLabel: string,
): void {
  const firstIndex = seen.get(value);
  if (firstIndex !== undefined) {
    throw new DuplicateTermError(sourceLabel, key, value, firstIndex, index);
  }
  seen.set(value, index);
}

/**
 * Validates a whole glossary payload.
 *
 * Rejects: non-array payloads, malformed entries, duplicate ids, and duplicate
 * English terms *within one subject*. The same English term legitimately appears
 * in two subjects - "Nucleosome" is examined in both 661 and 885 - so uniqueness
 * is scoped per subject rather than globally.
 */
export function parseTerms(raw: unknown, sourceLabel: string): readonly Term[] {
  if (!Array.isArray(raw)) {
    throw new TermDataError(sourceLabel, -1, '<payload>', `expected an array, received ${typeof raw}`);
  }
  const ids = new Map<string, number>();
  const englishTerms = new Map<string, number>();
  const parsed: Term[] = [];
  for (let index = 0; index < raw.length; index += 1) {
    const term = parseTerm(raw[index], index, sourceLabel);
    assertUnique(ids, 'id', term.id, index, sourceLabel);
    assertUnique(englishTerms, 'en', `${term.subject}:${term.en.toLowerCase()}`, index, sourceLabel);
    parsed.push(term);
  }
  return parsed;
}
