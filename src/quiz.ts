/**
 * Multiple-choice option building.
 *
 * The shuffle is seeded rather than random so the same seed always yields the
 * same options. That keeps the function pure and testable, while the caller
 * varies the seed per card so the correct answer is not always in the same slot.
 */

import type { Term } from './types';

export interface Choice {
  readonly text: string;
  readonly correct: boolean;
}

const MULTIPLIER = 1_664_525;
const INCREMENT = 1_013_904_223;
const MODULUS = 4_294_967_296;

function nextRandom(state: number): number {
  return (state * MULTIPLIER + INCREMENT) % MODULUS;
}

/** Fisher-Yates driven by the seeded generator. Returns a new array. */
function shuffled<T>(items: readonly T[], seed: number): readonly T[] {
  const result = [...items];
  let state = seed % MODULUS;
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = nextRandom(state);
    const swapWith = state % (index + 1);
    const current = result[index];
    const other = result[swapWith];
    if (current === undefined || other === undefined) {
      continue;
    }
    result[index] = other;
    result[swapWith] = current;
  }
  return result;
}

/**
 * Builds a question: the correct Chinese name plus distractors drawn from the
 * same subject, so the options are plausible rather than obviously wrong.
 *
 * Falls back to whatever the pool can supply when it is very small; the result
 * always contains exactly one correct option.
 */
export function buildChoices(
  term: Term,
  pool: readonly Term[],
  optionCount: number,
  seed: number,
): readonly Choice[] {
  const distractors = shuffled(
    pool.filter((candidate) => candidate.subject === term.subject && candidate.cn !== term.cn),
    seed,
  );
  const picked: Term[] = [];
  for (const candidate of distractors) {
    if (picked.length >= optionCount - 1) {
      break;
    }
    if (!picked.some((chosen) => chosen.cn === candidate.cn)) {
      picked.push(candidate);
    }
  }

  const options: Choice[] = [
    { text: term.cn, correct: true },
    ...picked.map((candidate) => ({ text: candidate.cn, correct: false })),
  ];
  return shuffled(options, nextRandom(seed));
}
