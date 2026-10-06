/**
 * Covers the runtime validation applied to glossary data, which is the same
 * path user-imported entries will take.
 */

import { describe, expect, it } from 'vitest';
import { DuplicateTermError, TermDataError, parseTerms } from './terms';

function entry(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    id: 'cell-0001',
    subject: 'cell',
    en: 'Apoptosis',
    cn: '细胞凋亡',
    defCn: '由基因控制的细胞自主的、有序的死亡过程。',
    topic: '细胞衰老与死亡',
    note: '',
    ...overrides,
  };
}

describe('parseTerms', () => {
  it('accepts a well-formed entry', () => {
    const parsed = parseTerms([entry({})], 'test');
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.cn).toBe('细胞凋亡');
  });

  it('trims surrounding whitespace', () => {
    const parsed = parseTerms([entry({ en: '  Apoptosis  ' })], 'test');
    expect(parsed[0]?.en).toBe('Apoptosis');
  });

  it('treats a missing note as an empty string', () => {
    const withoutNote = entry({});
    delete withoutNote['note'];
    const parsed = parseTerms([withoutNote], 'test');
    expect(parsed[0]?.note).toBe('');
  });

  it('rejects a non-array payload', () => {
    expect(() => parseTerms({}, 'test')).toThrow(TermDataError);
  });

  it('rejects an entry that is not an object', () => {
    expect(() => parseTerms(['Apoptosis'], 'test')).toThrow(TermDataError);
  });

  it('rejects an empty required field and names it', () => {
    try {
      parseTerms([entry({ defCn: '   ' })], 'test');
      expect.unreachable('expected parseTerms to throw');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(TermDataError);
      expect((error as TermDataError).field).toBe('defCn');
      expect((error as TermDataError).index).toBe(0);
    }
  });

  it('rejects an unknown subject and lists the accepted values', () => {
    expect(() => parseTerms([entry({ subject: 'physics' })], 'test')).toThrow(/unknown subject/);
  });

  it('rejects a duplicate id', () => {
    expect(() => parseTerms([entry({}), entry({ en: 'Necrosis' })], 'test')).toThrow(
      DuplicateTermError,
    );
  });

  it('rejects the same English term twice within one subject', () => {
    expect(() =>
      parseTerms([entry({}), entry({ id: 'cell-0002', cn: '程序性细胞死亡' })], 'test'),
    ).toThrow(DuplicateTermError);
  });

  it('allows the same English term in two different subjects', () => {
    const parsed = parseTerms(
      [entry({}), entry({ id: 'mol-0001', subject: 'molecular' })],
      'test',
    );
    expect(parsed).toHaveLength(2);
  });
});
