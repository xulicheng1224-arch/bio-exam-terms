/**
 * Builds the day's study plan.
 *
 * Both quotas exist so a missed week cannot dump hundreds of terms at once:
 * the review ceiling deliberately leaves the rest for tomorrow, and the plan
 * reports how far behind the learner is so the backlog is visible rather than
 * silently growing.
 */

import { QUIZ_SEED_STRIDE } from './quiz';
import {
  DAY_MS,
  dayKey,
  dueTerms,
  findCardState,
  interleaveBySubject,
  isIntroduced,
  mistakeTerms,
  startOfDay,
  unintroducedTerms,
} from './srs';
import type { AppState, Session, SessionKind } from './app';
import type { DailyLog, DayCounters, ProgressStore, Settings, Subject, Term } from './types';

const EMPTY_COUNTERS: DayCounters = { introduced: 0, reviewed: 0 };

export interface DailyPlan {
  readonly subject: Subject | 'all';
  /** What has already been completed today. */
  readonly counters: DayCounters;
  /** Unseen terms to introduce today, already trimmed to the remaining quota. */
  readonly newTerms: readonly Term[];
  readonly newQuotaLeft: number;
  /** Due terms to review today, already trimmed to the remaining quota. */
  readonly reviewTerms: readonly Term[];
  readonly reviewQuotaLeft: number;
  /** Every term that is due right now, before the review ceiling is applied. */
  readonly dueNow: number;
  /** How many days late the oldest overdue term is. */
  readonly backlogDays: number;
  /** Terms graded "again" at least once and not yet mastered. */
  readonly mistakes: readonly Term[];
}

/** Days between the oldest overdue term's due date and today. */
function backlogDaysFor(due: readonly Term[], progress: ProgressStore, now: number): number {
  const oldest = due[0];
  if (oldest === undefined) {
    return 0;
  }
  const state = findCardState(progress, oldest.id);
  if (state === undefined) {
    return 0;
  }
  const late = Math.floor((startOfDay(now) - startOfDay(state.dueAt)) / DAY_MS);
  return Math.max(0, late);
}

export function countersFor(log: DailyLog, now: number): DayCounters {
  return log[dayKey(now)] ?? EMPTY_COUNTERS;
}

export function buildDailyPlan(
  terms: readonly Term[],
  progress: ProgressStore,
  log: DailyLog,
  settings: Settings,
  now: number,
): DailyPlan {
  const counters = countersFor(log, now);

  const newQuotaLeft = Math.max(0, settings.newPerDay - counters.introduced);
  const newTerms = interleaveBySubject(
    unintroducedTerms(terms, progress, settings.subject),
  ).slice(0, newQuotaLeft);

  const due = dueTerms(terms, progress, now, settings.subject);
  const reviewQuotaLeft = Math.max(0, settings.reviewPerDay - counters.reviewed);

  return {
    subject: settings.subject,
    counters,
    newTerms,
    newQuotaLeft,
    reviewTerms: due.slice(0, reviewQuotaLeft),
    reviewQuotaLeft,
    dueNow: due.length,
    backlogDays: backlogDaysFor(due, progress, now),
    mistakes: mistakeTerms(terms, progress, settings.subject),
  };
}

// ---------------------------------------------------------------------------
// Session queues
// ---------------------------------------------------------------------------

const QUIZ_FALLBACK_LIMIT = 30;
const QUIZ_MIN_TERMS = 4;

/**
 * Advances a session to the next card, or ends it when the queue is exhausted.
 *
 * The seed strides forward per card so the quiz's correct answer does not land
 * in the same slot twice in a row.
 */
export function advanceSession(state: AppState, session: Session): AppState {
  const nextCursor = session.cursor + 1;
  if (nextCursor < session.queue.length) {
    return {
      ...state,
      session: {
        ...session,
        cursor: nextCursor,
        revealed: false,
        chosenIndex: null,
        seed: session.seed + QUIZ_SEED_STRIDE,
      },
    };
  }
  return { ...state, session: null, route: 'home' };
}

/**
 * Quiz terms: today's reviews if there are enough, otherwise whatever has been
 * introduced, falling back to the new-term queue for a first-day learner.
 */
function quizQueue(state: AppState, plan: DailyPlan): readonly Term[] {
  if (plan.reviewTerms.length >= QUIZ_MIN_TERMS) {
    return plan.reviewTerms;
  }
  const introduced = state.glossary.terms.filter((term) => isIntroduced(state.progress, term.id));
  if (introduced.length >= QUIZ_MIN_TERMS) {
    return interleaveBySubject(introduced).slice(0, QUIZ_FALLBACK_LIMIT);
  }
  return plan.newTerms.slice(0, QUIZ_FALLBACK_LIMIT);
}

/** Picks the queue for a session kind out of the day's plan. */
export function buildSessionQueue(
  state: AppState,
  plan: DailyPlan,
  kind: SessionKind,
): readonly Term[] {
  if (kind === 'learn') {
    return plan.newTerms;
  }
  if (kind === 'review') {
    return plan.reviewTerms;
  }
  if (kind === 'mistakes') {
    return plan.mistakes;
  }
  return quizQueue(state, plan);
}

/** Records one newly introduced term against today's quota. */
export function withIntroduced(log: DailyLog, now: number): DailyLog {
  const today = dayKey(now);
  const counters = log[today] ?? EMPTY_COUNTERS;
  return {
    ...log,
    [today]: { introduced: counters.introduced + 1, reviewed: counters.reviewed },
  };
}

/** Records one graded review against today's quota. */
export function withReviewed(log: DailyLog, now: number): DailyLog {
  const today = dayKey(now);
  const counters = log[today] ?? EMPTY_COUNTERS;
  return {
    ...log,
    [today]: { introduced: counters.introduced, reviewed: counters.reviewed + 1 },
  };
}
