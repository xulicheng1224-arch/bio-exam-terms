/**
 * Assembled glossary.
 *
 * The `readonly Term[]` annotation makes the compiler verify each entry's shape,
 * while parseTerms re-checks at runtime what the compiler cannot: duplicate ids
 * and duplicate English terms within a subject.
 */

import { parseTerms } from '../terms';
import type { Term } from '../types';
import { BIOCHEM_TERMS } from './biochem';
import { CELL_TERMS } from './cell';
import { MOLECULAR_TERMS } from './molecular';

export const ALL_TERMS: readonly Term[] = parseTerms(
  [...CELL_TERMS, ...MOLECULAR_TERMS, ...BIOCHEM_TERMS],
  'bundled glossary',
);
