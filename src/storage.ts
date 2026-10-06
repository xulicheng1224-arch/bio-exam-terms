/**
 * Persistence boundary.
 *
 * localStorage is an external system, so this module is allowed to have side
 * effects and must treat everything it reads back as untrusted input. Nothing
 * is swallowed: an unavailable or corrupt store raises a typed error.
 */

import { parseTerms } from './terms';
import type {
  CardState,
  DailyLog,
  ProgressStore,
  RevealMode,
  Settings,
  Subject,
  Term,
} from './types';

const PROGRESS_KEY = 'bio-exam-terms/progress/v1';
const SETTINGS_KEY = 'bio-exam-terms/settings/v2';
const DAILY_LOG_KEY = 'bio-exam-terms/daily-log/v1';
const CUSTOM_TERMS_KEY = 'bio-exam-terms/custom-terms/v1';

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

function removeRaw(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch (cause) {
    throw new StorageUnavailableError(key, 'remove', cause);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function decodeJson(raw: string, key: string): unknown {
  try {
    return JSON.parse(raw);
  } catch (cause) {
    throw new StoredDataCorruptError(key, `not valid JSON (${String(cause)})`);
  }
}

// ---------------------------------------------------------------------------
// Review progress
// ---------------------------------------------------------------------------

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

/** Loads saved scheduling state. Returns an empty store on first run. */
export function loadProgress(): ProgressStore {
  const raw = readRaw(PROGRESS_KEY);
  if (raw === null) {
    return {};
  }
  const decoded = decodeJson(raw, PROGRESS_KEY);
  if (!isRecord(decoded)) {
    throw new StoredDataCorruptError(PROGRESS_KEY, 'expected a JSON object');
  }
  const store: Record<string, CardState> = {};
  for (const [termId, entry] of Object.entries(decoded)) {
    store[termId] = parseCardState(entry, PROGRESS_KEY, termId);
  }
  return store;
}

export function saveProgress(store: ProgressStore): void {
  writeRaw(PROGRESS_KEY, JSON.stringify(store));
}

export function clearProgress(): void {
  removeRaw(PROGRESS_KEY);
}

// ---------------------------------------------------------------------------
// Daily log
// ---------------------------------------------------------------------------

function parseDayCounters(raw: unknown, key: string, day: string): { introduced: number; reviewed: number } {
  if (!isRecord(raw)) {
    throw new StoredDataCorruptError(key, `day "${day}" is not an object`);
  }
  const { introduced, reviewed } = raw;
  if (typeof introduced !== 'number' || typeof reviewed !== 'number') {
    throw new StoredDataCorruptError(key, `day "${day}" is missing numeric counters`);
  }
  return { introduced, reviewed };
}

export function loadDailyLog(): DailyLog {
  const raw = readRaw(DAILY_LOG_KEY);
  if (raw === null) {
    return {};
  }
  const decoded = decodeJson(raw, DAILY_LOG_KEY);
  if (!isRecord(decoded)) {
    throw new StoredDataCorruptError(DAILY_LOG_KEY, 'expected a JSON object');
  }
  const log: Record<string, { introduced: number; reviewed: number }> = {};
  for (const [day, counters] of Object.entries(decoded)) {
    log[day] = parseDayCounters(counters, DAILY_LOG_KEY, day);
  }
  return log;
}

export function saveDailyLog(log: DailyLog): void {
  writeRaw(DAILY_LOG_KEY, JSON.stringify(log));
}

// ---------------------------------------------------------------------------
// Custom glossary entries
// ---------------------------------------------------------------------------

/** Loads user-imported entries. Integrity problems raise rather than degrade. */
export function loadCustomTerms(): readonly Term[] {
  const raw = readRaw(CUSTOM_TERMS_KEY);
  if (raw === null) {
    return [];
  }
  return parseTerms(decodeJson(raw, CUSTOM_TERMS_KEY), CUSTOM_TERMS_KEY);
}

export function saveCustomTerms(terms: readonly Term[]): void {
  writeRaw(CUSTOM_TERMS_KEY, JSON.stringify(terms));
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const DEFAULT_SETTINGS: Settings = {
  revealMode: 'both',
  subject: 'all',
  newPerDay: 20,
  reviewPerDay: 60,
  examDate: '',
};

const REVEAL_MODES: readonly RevealMode[] = ['name', 'definition', 'both'];
const SUBJECT_SCOPES: readonly (Subject | 'all')[] = ['all', 'cell', 'molecular', 'biochem'];

export const NEW_PER_DAY_RANGE = { min: 5, max: 100 } as const;
export const REVIEW_PER_DAY_RANGE = { min: 10, max: 500 } as const;

function readBoundedInt(
  decoded: Record<string, unknown>,
  field: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const value = decoded[field];
  if (value === undefined) {
    return fallback;
  }
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw new StoredDataCorruptError(SETTINGS_KEY, `"${field}" must be an integer in ${min}..${max}, got ${String(value)}`);
  }
  return value;
}

export function loadSettings(): Settings {
  const raw = readRaw(SETTINGS_KEY);
  if (raw === null) {
    return DEFAULT_SETTINGS;
  }
  const decoded = decodeJson(raw, SETTINGS_KEY);
  if (!isRecord(decoded)) {
    throw new StoredDataCorruptError(SETTINGS_KEY, 'expected a JSON object');
  }
  const revealMode = REVEAL_MODES.find((mode) => mode === decoded['revealMode']);
  const subject = SUBJECT_SCOPES.find((scope) => scope === decoded['subject']);
  const examDate = decoded['examDate'];
  if (revealMode === undefined) {
    throw new StoredDataCorruptError(SETTINGS_KEY, `unknown revealMode "${String(decoded['revealMode'])}"`);
  }
  if (subject === undefined) {
    throw new StoredDataCorruptError(SETTINGS_KEY, `unknown subject "${String(decoded['subject'])}"`);
  }
  if (typeof examDate !== 'string') {
    throw new StoredDataCorruptError(SETTINGS_KEY, `"examDate" must be a string`);
  }
  return {
    revealMode,
    subject,
    newPerDay: readBoundedInt(decoded, 'newPerDay', DEFAULT_SETTINGS.newPerDay, NEW_PER_DAY_RANGE.min, NEW_PER_DAY_RANGE.max),
    reviewPerDay: readBoundedInt(decoded, 'reviewPerDay', DEFAULT_SETTINGS.reviewPerDay, REVIEW_PER_DAY_RANGE.min, REVIEW_PER_DAY_RANGE.max),
    examDate,
  };
}

export function saveSettings(settings: Settings): void {
  writeRaw(SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * Removes every key this app owns.
 *
 * Used only as an explicit, user-triggered recovery when saved data cannot be
 * parsed. The bundled glossary is unaffected, so only progress and imported
 * entries are lost.
 */
export function clearAllSavedData(): void {
  removeRaw(PROGRESS_KEY);
  removeRaw(SETTINGS_KEY);
  removeRaw(DAILY_LOG_KEY);
  removeRaw(CUSTOM_TERMS_KEY);
}
