/**
 * The bundled glossary.
 *
 * `parseTerms` runs at load even though the `readonly Term[]` annotations
 * already prove each entry's shape: it is the only check that catches duplicate
 * ids and duplicate English terms within a subject, which a bad edit can
 * introduce silently. Imported entries are validated separately, then merged
 * with assembleGlossary.
 */

import { parseTerms } from '../terms';
import type { Term } from '../types';
import { BIOCHEM_TERMS } from './biochem';
import { CELL_TERMS } from './cell';
import { MOLECULAR_TERMS } from './molecular';

export const BUNDLED_TERMS: readonly Term[] = parseTerms(
  [...CELL_TERMS, ...MOLECULAR_TERMS, ...BIOCHEM_TERMS],
  'bundled glossary',
);
