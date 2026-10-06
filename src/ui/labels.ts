/** Display names shared across screens. */

import type { Grade, RevealMode, Subject } from '../types';

export const SUBJECT_LABELS: Readonly<Record<Subject | 'all', string>> = {
  all: '全部',
  cell: '细胞生物学',
  molecular: '分子生物学',
  biochem: '生物化学',
};

export const REVEAL_LABELS: Readonly<Record<RevealMode, string>> = {
  name: '只考中文名',
  definition: '只考释义',
  both: '名字＋释义',
};

export const GRADE_LABELS: Readonly<Record<Grade, string>> = {
  again: '不认识',
  hard: '模糊',
  good: '认识',
};

export const GRADES: readonly Grade[] = ['again', 'hard', 'good'];

export const SUBJECT_SCOPES: readonly (Subject | 'all')[] = ['all', 'cell', 'molecular', 'biochem'];

export const REVEAL_MODES: readonly RevealMode[] = ['name', 'definition', 'both'];

export function subjectLabel(subject: Subject | 'all'): string {
  return SUBJECT_LABELS[subject];
}
