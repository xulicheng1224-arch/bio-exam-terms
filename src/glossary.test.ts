import { describe, expect, it } from 'vitest';
import { assembleGlossary } from './glossary';
import type { Subject, Term } from './types';

function term(id: string, subject: Subject, en: string, cn: string): Term {
  return { id, subject, en, cn, defCn: '释义内容。', topic: 't', note: '' };
}

const BUNDLED: readonly Term[] = [
  term('cell-1', 'cell', 'Apoptosis', '细胞凋亡'),
  term('mol-1', 'molecular', 'Operon', '操纵子'),
];

describe('assembleGlossary', () => {
  it('appends imported entries after the bundled ones', () => {
    const custom = [term('custom-cell-0001', 'cell', 'Aquaporin', '水通道蛋白')];
    const glossary = assembleGlossary(BUNDLED, custom);
    expect(glossary.terms.map((entry) => entry.id)).toEqual(['cell-1', 'mol-1', 'custom-cell-0001']);
    expect(glossary.shadowed).toEqual([]);
  });

  it('hides an imported entry that the bundled glossary has since gained', () => {
    const custom = [term('custom-cell-0001', 'cell', 'apoptosis', '细胞凋亡')];
    const glossary = assembleGlossary(BUNDLED, custom);
    expect(glossary.terms.map((entry) => entry.id)).toEqual(['cell-1', 'mol-1']);
    expect(glossary.shadowed.map((entry) => entry.id)).toEqual(['custom-cell-0001']);
  });

  it('compares the English term case-insensitively and per subject', () => {
    const custom = [
      term('custom-mol-0001', 'molecular', 'APOPTOSIS', '细胞凋亡'),
      term('custom-mol-0002', 'molecular', 'Operon', '操纵子'),
    ];
    const glossary = assembleGlossary(BUNDLED, custom);
    // Same English term in a different subject is a distinct entry, but the
    // exact collision within molecular biology is hidden.
    expect(glossary.terms.map((entry) => entry.id)).toEqual(['cell-1', 'mol-1', 'custom-mol-0001']);
    expect(glossary.shadowed.map((entry) => entry.id)).toEqual(['custom-mol-0002']);
  });

  it('drops duplicates that appear twice in the imported set', () => {
    const custom = [
      term('custom-cell-0001', 'cell', 'Aquaporin', '水通道蛋白'),
      term('custom-cell-0002', 'cell', 'Aquaporin', '水通道蛋白'),
    ];
    const glossary = assembleGlossary(BUNDLED, custom);
    expect(glossary.terms).toHaveLength(3);
    expect(glossary.shadowed).toHaveLength(1);
  });

  it('does not mutate its inputs', () => {
    const custom = [term('custom-cell-0001', 'cell', 'Aquaporin', '水通道蛋白')];
    assembleGlossary(BUNDLED, custom);
    expect(BUNDLED).toHaveLength(2);
    expect(custom).toHaveLength(1);
  });
});
