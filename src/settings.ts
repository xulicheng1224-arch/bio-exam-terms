/**
 * Study-preference defaults and their valid ranges.
 *
 * Kept in a dependency-free module so the storage layer (which persists them)
 * and the settings screen (which edits them) share one source of truth instead
 * of hardcoding the same bounds in two places.
 */

import type { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  revealMode: 'both',
  subject: 'all',
  newPerDay: 20,
  reviewPerDay: 60,
  examDate: '',
};

export const NEW_PER_DAY_RANGE = { min: 5, max: 100 } as const;
export const REVIEW_PER_DAY_RANGE = { min: 10, max: 500 } as const;
