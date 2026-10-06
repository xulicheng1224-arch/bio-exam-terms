import { describe, expect, it } from 'vitest';
import { answerFaceFor, promptFor } from './card';
import type { Subject, Term } from './types';

const SUBJECTS: readonly Subject[] = ['cell', 'molecular', 'biochem'];

function term(subject: Subject): Term {
  return {
    id: 'x-0001',
    subject,
    en: 'peptide plane',
    cn: '肽平面',
    defCn: '由肽键及其两侧的α-碳原子构成的刚性平面结构。',
    topic: '蛋白质',
    note: '',
  };
}

describe('promptFor', () => {
  it('prompts every subject with the English term', () => {
    for (const subject of SUBJECTS) {
      expect(promptFor(term(subject))).toBe('peptide plane');
    }
  });
});

describe('answerFaceFor', () => {
  it('shows both name and definition in "both" mode', () => {
    const face = answerFaceFor(term('cell'), 'both');
    expect(face.name).toBe('肽平面');
    expect(face.definition).toContain('刚性平面');
  });

  it('hides the name when only the definition is being tested', () => {
    const face = answerFaceFor(term('cell'), 'definition');
    expect(face.name).toBe('');
    expect(face.definition).not.toBe('');
  });

  it('hides the definition when only the name is being tested', () => {
    const face = answerFaceFor(term('cell'), 'name');
    expect(face.name).toBe('肽平面');
    expect(face.definition).toBe('');
  });

  it('never leaves a card with nothing to show', () => {
    for (const subject of SUBJECTS) {
      for (const mode of ['name', 'definition', 'both'] as const) {
        const face = answerFaceFor(term(subject), mode);
        expect(face.name.length + face.definition.length).toBeGreaterThan(0);
      }
    }
  });
});
