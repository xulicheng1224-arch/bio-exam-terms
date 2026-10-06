/**
 * Leitner-box spaced repetition and the date arithmetic around it.
 *
 * Every function here is pure: it returns new values and never mutates its
 * arguments or any global state. Anything that reads the clock takes `now` as
 * an explicit argument so the rules stay testable.
 */

import type { CardState, Grade, ProgressStore, Term } from './types';

export const DAY_MS: number = 86_400_000;

/** Review intervals in days, indexed by box. Box 0 means "show again today". */
export const BOX_INTERVALS_DAYS: readonly number[] = [0, 1, 2, 4, 7, 15, 30];

export const MAX_BOX: number = BOX_INTERVALS_DAYS.length - 1;

/** At or above this box a term counts as mastered in the statistics. */
export const MASTERED_BOX: number = 5;

/** Raised when a stored box index falls outside the interval table. */
export class BoxIndexError extends Error {
  readonly box: number;
  readonly maxBox: number;

  constructor(box: number, maxBox: number) {
    super(`box index ${box} is outside the valid range 0..${maxBox}`);
    this.name = 'BoxIndexError';
    this.box = box;
    this.maxBox = maxBox;
  }
}

/** Raised when a date string cannot be interpreted. */
export class InvalidDateError extends Error {
  readonly value: string;

  constructor(value: string, reason: string) {
    super(`"${value}" is not a usable date: ${reason}`);
    this.name = 'InvalidDateError';
    this.value = value;
  }
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

/** Local calendar day of an instant, as "YYYY-MM-DD". */
export function dayKey(epochMs: number): string {
  const date = new Date(epochMs);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Midnight local time of the day containing `epochMs`. */
export function startOfDay(epochMs: number): number {
  const date = new Date(epochMs);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Whole days from `fromMs` to the date `examDate` ("YYYY-MM-DD"),
 * counted in calendar days rather than milliseconds.
 */
export function daysUntil(examDate: string, fromMs: number): number {
  const parts = examDate.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (parts.length !== 3 || !Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new InvalidDateError(examDate, 'expected YYYY-MM-DD');
  }
  const target = new Date(year, month - 1, day);
  if (target.getFullYear() !== year || target.getMonth() !== month - 1 || target.getDate() !== day) {
    throw new InvalidDateError(examDate, 'that day does not exist in the calendar');
  }
  return Math.round((startOfDay(target.getTime()) - startOfDay(fromMs)) / DAY_MS);
}

// ---------------------------------------------------------------------------
// Scheduling
// ---------------------------------------------------------------------------

/** A term the learner has never been shown. */
export function createCardState(now: number): CardState {
  return { box: 0, dueAt: now, lapses: 0, reviews: 0 };
}

export function isIntroduced(store: ProgressStore, termId: string): boolean {
  return store[termId] !== undefined;
}

/** Scheduling state of a term, or undefined when it has not been introduced. */
export function findCardState(store: ProgressStore, termId: string): CardState | undefined {
  return store[termId];
}

export function isDue(state: CardState, now: number): boolean {
  return state.dueAt <= now;
}

function intervalDaysForBox(box: number): number {
  const interval = BOX_INTERVALS_DAYS[box];
  if (interval === undefined) {
    throw new BoxIndexError(box, MAX_BOX);
  }
  return interval;
}

function nextBox(currentBox: number, grade: Grade): number {
  if (grade === 'again') {
    return 0;
  }
  if (grade === 'hard') {
    return Math.max(0, currentBox - 1);
  }
  return Math.min(MAX_BOX, currentBox + 1);
}

/**
 * Caps an interval so every term still comes round several more times before
 * the exam. Returns null when the exam is far away or unset, meaning "no cap".
 *
 * With the cap at daysLeft/5, a term is scheduled at most five more times
 * before the exam date, which keeps the last few days from being swamped.
 */
export function examIntervalCapDays(examDate: string, now: number): number | null {
  if (examDate.length === 0) {
    return null;
  }
  const remaining = daysUntil(examDate, now);
  if (remaining <= 0) {
    return 1;
  }
  if (remaining > 70) {
    return null;
  }
  return Math.max(1, Math.floor(remaining / 5));
}

/**
 * Folds one self-reported grade into a card's schedule.
 *
 * The incoming box is validated rather than clamped: a box outside the interval
 * table means the stored state is corrupt, and silently repairing it would hide
 * the corruption instead of surfacing it.
 */
export function applyGrade(
  state: CardState,
  grade: Grade,
  now: number,
  intervalCapDays: number | null,
): CardState {
  if (!Number.isInteger(state.box) || state.box < 0 || state.box > MAX_BOX) {
    throw new BoxIndexError(state.box, MAX_BOX);
  }
  const box = nextBox(state.box, grade);
  const baseInterval = intervalDaysForBox(box);
  const interval =
    intervalCapDays === null ? baseInterval : Math.min(baseInterval, intervalCapDays);
  return {
    box,
    dueAt: now + interval * DAY_MS,
    lapses: grade === 'again' ? state.lapses + 1 : state.lapses,
    reviews: state.reviews + 1,
  };
}

// ---------------------------------------------------------------------------
// Deck selection
// ---------------------------------------------------------------------------

function matchesSubject(term: Term, subject: Term['subject'] | 'all'): boolean {
  return subject === 'all' || term.subject === subject;
}

/** Terms never shown yet, in glossary order. */
export function unintroducedTerms(
  terms: readonly Term[],
  store: ProgressStore,
  subject: Term['subject'] | 'all',
): readonly Term[] {
  return terms.filter(
    (term) => matchesSubject(term, subject) && !isIntroduced(store, term.id),
  );
}

/** Introduced terms whose due time has passed, most overdue first. */
export function dueTerms(
  terms: readonly Term[],
  store: ProgressStore,
  now: number,
  subject: Term['subject'] | 'all',
): readonly Term[] {
  return terms
    .filter((term) => matchesSubject(term, subject))
    .map((term) => ({ term, state: findCardState(store, term.id) }))
    .filter(
      (entry): entry is { term: Term; state: CardState } =>
        entry.state !== undefined && isDue(entry.state, now),
    )
    .sort((left, right) => left.state.dueAt - right.state.dueAt)
    .map((entry) => entry.term);
}

/** Terms the learner has graded "again" at least once and not yet mastered. */
export function mistakeTerms(
  terms: readonly Term[],
  store: ProgressStore,
  subject: Term['subject'] | 'all',
): readonly Term[] {
  return terms
    .filter((term) => matchesSubject(term, subject))
    .filter((term) => {
      const state = findCardState(store, term.id);
      return state !== undefined && state.lapses > 0 && state.box < MASTERED_BOX;
    })
    .sort((left, right) => {
      const leftLapses = findCardState(store, left.id)?.lapses ?? 0;
      const rightLapses = findCardState(store, right.id)?.lapses ?? 0;
      return rightLapses - leftLapses;
    });
}
