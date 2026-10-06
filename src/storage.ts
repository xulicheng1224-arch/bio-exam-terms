/**
 * Persistence boundary.
 *
 * localStorage is an external system, so this module is allowed to have side
 * effects and must treat everything it reads back as untrusted input. Nothing
 * is swallowed: an unavailable or corrupt store raises a typed error.
 */

import type { CardState, ProgressStore, RevealMode, Subject } from './types';

const PROGRESS_KEY = 'bio-exam-terms/progress/v1';
const SETTINGS_KEY = 'bio-exam-terms/settings/v1';

/** Raised when the browser storage cannot be read or written. */
export class StorageUnavailableError extends Error {
  readonly key: string;
  readonly operation: string;

  constructor(key: string, operation: string, cause: unknown) {
    super(`localStorage ${operation} failed for key "${key}"`, { cause });
    this.name = 'StorageUnavailableError';
    this.key = key;
    this.operation = operation;
  }
}

/** Raised when stored JSON does not match the expected shape. */
export class StoredDataCorruptError extends Error {
  readonly key: string;
  readonly detail: string;

  constructor(key: string, detail: string) {
    super(`stored value for key "${key}" is corrupt: ${detail}`);
    this.name = 'StoredDataCorruptError';
    this.key = key;
    this.detail = detail;
  }
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (cause) {
    throw new StorageUnavailableError(key, 'read', cause);
  }
}

function writeRaw(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch (cause) {
    throw new StorageUnavailableError(key, 'write', cause);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseCardState(raw: unknown, key: string, termId: string): CardState {
  if (!isRecord(raw)) {
    throw new StoredDataCorruptError(key, `entry "${termId}" is not an object`);
  }
  const { box, dueAt, lapses, reviews } = raw;
  if (typeof box !== 'number' || typeof dueAt !== 'number') {
    throw new StoredDataCorruptError(key, `entry "${termId}" is missing numeric box/dueAt`);
  }
  if (typeof lapses !== 'number' || typeof reviews !== 'number') {
    throw new StoredDataCorruptError(key, `entry "${termId}" is missing numeric lapses/reviews`);
  }
  return { box, dueAt, lapses, reviews };
}

function parseProgressStore(raw: string, key: string): ProgressStore {
  let decoded: unknown;
  try {
    decoded = JSON.parse(raw);
  } catch (cause) {
    throw new StoredDataCorruptError(key, `not valid JSON (${String(cause)})`);
  }
  if (!isRecord(decoded)) {
    throw new StoredDataCorruptError(key, 'expected a JSON object');
  }
  const store: Record<string, CardState> = {};
  for (const [termId, entry] of Object.entries(decoded)) {
    store[termId] = parseCardState(entry, key, termId);
  }
  return store;
}

/** Loads saved scheduling state. Returns an empty store on first run. */
export function loadProgress(): ProgressStore {
  const raw = readRaw(PROGRESS_KEY);
  if (raw === null) {
    return {};
  }
  return parseProgressStore(raw, PROGRESS_KEY);
}

export function saveProgress(store: ProgressStore): void {
  writeRaw(PROGRESS_KEY, JSON.stringify(store));
}

export function clearProgress(): void {
  try {
    window.localStorage.removeItem(PROGRESS_KEY);
  } catch (cause) {
    throw new StorageUnavailableError(PROGRESS_KEY, 'remove', cause);
  }
}

/**
 * Removes every key this app owns.
 *
 * Used only as an explicit, user-triggered recovery when saved data cannot be
 * parsed. The bundled glossary is unaffected, so nothing is lost but progress.
 */
export function clearAllSavedData(): void {
  try {
    window.localStorage.removeItem(PROGRESS_KEY);
    window.localStorage.removeItem(SETTINGS_KEY);
  } catch (cause) {
    throw new StorageUnavailableError(SETTINGS_KEY, 'remove', cause);
  }
}

/** Study preferences. */
export interface Settings {
  readonly revealMode: RevealMode;
  readonly subject: Subject | 'all';
}

export const DEFAULT_SETTINGS: Settings = {
  revealMode: 'both',
  subject: 'all',
};

const REVEAL_MODES: readonly RevealMode[] = ['name', 'definition', 'both'];
const SUBJECT_SCOPES: readonly (Subject | 'all')[] = ['all', 'cell', 'molecular', 'biochem'];

export function loadSettings(): Settings {
  const raw = readRaw(SETTINGS_KEY);
  if (raw === null) {
    return DEFAULT_SETTINGS;
  }
  let decoded: unknown;
  try {
    decoded = JSON.parse(raw);
  } catch (cause) {
    throw new StoredDataCorruptError(SETTINGS_KEY, `not valid JSON (${String(cause)})`);
  }
  if (!isRecord(decoded)) {
    throw new StoredDataCorruptError(SETTINGS_KEY, 'expected a JSON object');
  }
  const revealMode = REVEAL_MODES.find((mode) => mode === decoded['revealMode']);
  const subject = SUBJECT_SCOPES.find((scope) => scope === decoded['subject']);
  if (revealMode === undefined) {
    throw new StoredDataCorruptError(
      SETTINGS_KEY,
      `unknown revealMode "${String(decoded['revealMode'])}"`,
    );
  }
  if (subject === undefined) {
    throw new StoredDataCorruptError(SETTINGS_KEY, `unknown subject "${String(decoded['subject'])}"`);
  }
  return { revealMode, subject };
}

export function saveSettings(settings: Settings): void {
  writeRaw(SETTINGS_KEY, JSON.stringify(settings));
}
