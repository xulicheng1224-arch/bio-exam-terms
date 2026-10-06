/**
 * Mastery summaries per subject.
 *
 * A term is "mastered" once its Leitner box has reached MASTERED_BOX, and
 * "untouched" until it has been introduced at all. Everything in between is
 * still being learned.
 */

import { MASTERED_BOX, findCardState } from './srs';
import type { ProgressStore, Subject, Term } from './types';

export interface SubjectStats {
  readonly subject: Subject;
  readonly total: number;
  readonly introduced: number;
  readonly mastered: number;
  readonly learning: number;
  readonly untouched: number;
}

export function summariseSubject(
  terms: readonly Term[],
  progress: ProgressStore,
  subject: Subject,
): SubjectStats {
  const scoped = terms.filter((term) => term.subject === subject);
  let mastered = 0;
  let introduced = 0;
  for (const term of scoped) {
    const state = findCardState(progress, term.id);
    if (state === undefined) {
      continue;
    }
    introduced += 1;
    if (state.box >= MASTERED_BOX) {
      mastered += 1;
    }
  }
  return {
    subject,
    total: scoped.length,
    introduced,
    mastered,
    learning: introduced - mastered,
    untouched: scoped.length - introduced,
  };
}

export function summariseAllSubjects(
  terms: readonly Term[],
  progress: ProgressStore,
): readonly SubjectStats[] {
  const subjects: readonly Subject[] = ['cell', 'molecular', 'biochem'];
  return subjects.map((subject) => summariseSubject(terms, progress, subject));
}

/** Total number of terms graded "again" at least once. */
export function countLapsed(terms: readonly Term[], progress: ProgressStore): number {
  let total = 0;
  for (const term of terms) {
    const state = findCardState(progress, term.id);
    if (state !== undefined && state.lapses > 0) {
      total += 1;
    }
  }
  return total;
}
