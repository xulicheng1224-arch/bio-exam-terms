import { describe, expect, it } from 'vitest';
import { buildChoices } from './quiz';
import type { Subject, Term } from './types';

function term(id: string, subject: Subject, cn: string): Term {
  return { id, subject, en: id, cn, defCn: `${cn}的释义。`, topic: 't', note: '' };
}

const POOL: readonly Term[] = [
  term('cell-1', 'cell', '细胞凋亡'),
  term('cell-2', 'cell', '细胞坏死'),
  term('cell-3', 'cell', '细胞自噬'),
  term('cell-4', 'cell', '细胞衰老'),
  term('cell-5', 'cell', '细胞分化'),
  term('mol-1', 'molecular', '中心法则'),
  term('mol-2', 'molecular', '操纵子'),
];

describe('buildChoices', () => {
  it('returns the requested number of options with exactly one correct', () => {
    const choices = buildChoices(POOL[0] as Term, POOL, 4, 12345);
    expect(choices).toHaveLength(4);
    expect(choices.filter((choice) => choice.correct)).toHaveLength(1);
    expect(choices.find((choice) => choice.correct)?.text).toBe('细胞凋亡');
  });

  it('draws distractors from the same subject', () => {
    const choices = buildChoices(POOL[0] as Term, POOL, 4, 999);
    const sameSubject = new Set(['细胞凋亡', '细胞坏死', '细胞自噬', '细胞衰老', '细胞分化']);
    for (const choice of choices) {
      expect(sameSubject.has(choice.text)).toBe(true);
    }
  });

  it('never offers the correct answer twice', () => {
    const choices = buildChoices(POOL[0] as Term, POOL, 4, 7);
    const texts = choices.map((choice) => choice.text);
    expect(new Set(texts).size).toBe(texts.length);
  });

  it('is deterministic for a given seed', () => {
    const first = buildChoices(POOL[0] as Term, POOL, 4, 4242);
    const second = buildChoices(POOL[0] as Term, POOL, 4, 4242);
    expect(first.map((choice) => choice.text)).toEqual(second.map((choice) => choice.text));
  });

  it('moves the correct answer around as the seed changes', () => {
    const positions = new Set(
      [1, 2, 3, 4, 5, 6, 7, 8].map((seed) =>
        buildChoices(POOL[0] as Term, POOL, 4, seed).findIndex((choice) => choice.correct),
      ),
    );
    expect(positions.size).toBeGreaterThan(1);
  });

  it('degrades to fewer options when the pool is tiny, still one correct', () => {
    const tiny: readonly Term[] = [term('cell-1', 'cell', '甲'), term('cell-2', 'cell', '乙')];
    const choices = buildChoices(tiny[0] as Term, tiny, 4, 1);
    expect(choices).toHaveLength(2);
    expect(choices.filter((choice) => choice.correct)).toHaveLength(1);
  });
});
