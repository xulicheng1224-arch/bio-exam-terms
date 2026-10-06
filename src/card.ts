/**
 * Decides what a flashcard shows on each side.
 *
 * Kept separate from the DOM code so the rule is testable and reusable by the
 * glossary browser.
 */

import type { RevealMode, Term } from './types';

/** The large prompt shown before the answer is revealed. */
export function promptFor(term: Term): string {
  return term.en;
}

/** The answer side of a card. An empty string means "not shown in this mode". */
export interface AnswerFace {
  readonly name: string;
  readonly definition: string;
}

/** Builds the answer side for the learner's reveal preference. */
export function answerFaceFor(term: Term, revealMode: RevealMode): AnswerFace {
  return {
    name: revealMode === 'definition' ? '' : term.cn,
    definition: revealMode === 'name' ? '' : term.defCn,
  };
}
