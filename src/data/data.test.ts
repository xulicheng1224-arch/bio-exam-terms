/**
 * Smoke test over the real bundled glossary.
 *
 * Importing ALL_TERMS runs parseTerms, so a malformed or duplicated entry fails
 * here rather than silently reaching the deck.
 */

import { describe, expect, it } from 'vitest';
import { ALL_TERMS } from './index';
import type { Subject } from '../types';

const SUBJECTS: readonly Subject[] = ['cell', 'molecular', 'biochem'];

describe('bundled glossary', () => {
  it('loads without validation errors', () => {
    expect(ALL_TERMS.length).toBeGreaterThan(0);
  });

  it('assigns every entry a unique id', () => {
    const ids = new Set(ALL_TERMS.map((term) => term.id));
    expect(ids.size).toBe(ALL_TERMS.length);
  });

  it('only uses known subjects', () => {
    for (const term of ALL_TERMS) {
      expect(SUBJECTS).toContain(term.subject);
    }
  });

  it('starts every id with its subject prefix', () => {
    const prefixes: Readonly<Record<Subject, string>> = {
      cell: 'cell-',
      molecular: 'mol-',
      biochem: 'biochem-',
    };
    for (const term of ALL_TERMS) {
      expect(term.id.startsWith(prefixes[term.subject])).toBe(true);
    }
  });

  it('gives every entry a definition long enough to answer an exam question', () => {
    for (const term of ALL_TERMS) {
      expect(term.defCn.length, `${term.id} has a short definition`).toBeGreaterThanOrEqual(20);
    }
  });

  it('gives every entry a non-empty topic', () => {
    for (const term of ALL_TERMS) {
      expect(term.topic.length, `${term.id} has no topic`).toBeGreaterThan(0);
    }
  });

  it('covers all three examined subjects at the expected depth', () => {
    // Floors, not exact counts: adding terms is expected, losing them is not.
    const floors: Readonly<Record<Subject, number>> = { cell: 74, molecular: 76, biochem: 54 };
    for (const subject of SUBJECTS) {
      const count = ALL_TERMS.filter((term) => term.subject === subject).length;
      expect(count, `${subject} entry count`).toBeGreaterThanOrEqual(floors[subject]);
    }
  });

  it('includes terms that actually appeared in the past papers', () => {
    const english = new Set(ALL_TERMS.map((term) => term.en.toLowerCase()));
    const expected = [
      // 661 cell biology
      'apoptosis',
      'fluid mosaic model',
      'gap junction',
      'heterochromatin',
      'telomerase',
      'induced pluripotent stem cell',
      'g protein-coupled receptor',
      // 885 molecular biology
      'nucleosome',
      'central dogma',
      'operon',
      'shine-dalgarno sequence',
      'okazaki fragments',
      'crispr',
      'risc',
      // 338 biochemistry
      'glycolysis',
      'tricarboxylic acid cycle',
      'oxidative phosphorylation',
      'michaelis constant',
      'bohr effect',
      'ketone bodies',
    ];
    for (const term of expected) {
      expect(english, `missing ${term}`).toContain(term);
    }
  });
});
