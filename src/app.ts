/**
 * Application-level types shared by the state holder and the screen renderers.
 *
 * Type-only, with no runtime imports, so screens can depend on it without
 * creating a cycle back into main.ts.
 */

import type { Glossary } from './glossary';
import type { ImportResult } from './import';
import type { DailyLog, Grade, ProgressStore, Settings, Subject, Term } from './types';

export type Route =
  | 'home'
  | 'learn'
  | 'review'
  | 'quiz'
  | 'mistakes'
  | 'library'
  | 'stats'
  | 'settings';

/** Session kinds that present a queue of terms one at a time. */
export type SessionKind = 'learn' | 'review' | 'quiz' | 'mistakes';

export interface Session {
  readonly kind: SessionKind;
  /** Captured when the session starts, so the queue cannot shift mid-run. */
  readonly queue: readonly Term[];
  readonly cursor: number;
  readonly revealed: boolean;
  /** Index the learner picked in a quiz, or null before they pick. */
  readonly chosenIndex: number | null;
  /** Varies per card so the correct quiz answer is not always in one slot. */
  readonly seed: number;
}

export interface AppState {
  readonly settings: Settings;
  readonly progress: ProgressStore;
  readonly log: DailyLog;
  readonly customTerms: readonly Term[];
  readonly glossary: Glossary;
  readonly route: Route;
  readonly session: Session | null;
  readonly libraryQuery: string;
  readonly librarySubject: Subject | 'all';
  /** Outcome of the most recent import, so problems survive a re-render. */
  readonly lastImport: ImportResult | null;
}

export interface AppActions {
  readonly navigate: (route: Route) => void;
  readonly startSession: (kind: SessionKind) => void;
  readonly reveal: () => void;
  readonly grade: (grade: Grade) => void;
  readonly choose: (index: number) => void;
  readonly finishLearnCard: () => void;
  readonly updateSettings: (settings: Settings) => void;
  readonly importTerms: (text: string, subject: Subject) => void;
  readonly clearProgress: () => void;
  readonly clearCustomTerms: () => void;
  readonly setLibraryQuery: (query: string) => void;
  readonly setLibrarySubject: (subject: Subject | 'all') => void;
}
