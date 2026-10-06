/**
 * Builds the day's study plan.
 *
 * Both quotas exist so a missed week cannot dump hundreds of terms at once:
 * the review ceiling deliberately leaves the rest for tomorrow, and the plan
 * reports how far behind the learner is so the backlog is visible rather than
 * silently growing.
 */

import { DAY_MS, dayKey, dueTerms, findCardState, mistakeTerms, startOfDay, unintroducedTerms } from './srs';
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
  const newTerms = unintroducedTerms(terms, progress, settings.subject).slice(0, newQuotaLeft);

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
