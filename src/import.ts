/**
 * Parses pasted glossary text into terms.
 *
 * The goal is that adding a term the learner met in a past paper takes seconds
 * and never needs a code change. Malformed lines are reported with their line
 * number and left out rather than aborting the whole paste.
 */

import type { Subject, Term } from './types';

/** Column order for a pasted line. */
export const IMPORT_COLUMNS = ['英文', '中文名', '中文释义', '主题', '备注'] as const;

export const IMPORT_TEMPLATE = [
  'endoplasmic reticulum | 内质网 | 由单层膜围成的管状和囊状结构组成的细胞器，是蛋白质与脂质合成的场所。 | 内膜系统 | 可选备注',
].join('\n');

const FIELD_SEPARATOR = /\s*\|\s*|\t+/;
const MIN_COLUMNS = 3;

export interface ImportProblem {
  /** 1-based line number in the pasted text. */
  readonly line: number;
  readonly text: string;
  readonly reason: string;
}

export interface ImportResult {
  readonly terms: readonly Term[];
  readonly problems: readonly ImportProblem[];
}

function keyFor(subject: Subject, english: string): string {
  return `${subject}:${english.toLowerCase()}`;
}

function fieldAt(fields: readonly string[], index: number): string {
  return fields[index]?.trim() ?? '';
}

/**
 * Parses one term per line.
 *
 * Duplicates are rejected against both the existing glossary and the paste
 * itself, because two cards with the same English term in one subject would
 * make the deck ambiguous to study.
 */
export function parseImport(
  text: string,
  subject: Subject,
  existing: readonly Term[],
  idPrefix: string,
): ImportResult {
  const takenKeys = new Set(existing.map((term) => keyFor(term.subject, term.en)));
  const takenIds = new Set(existing.map((term) => term.id));
  const terms: Term[] = [];
  const problems: ImportProblem[] = [];
  let counter = 0;

  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index] ?? '';
    const line = raw.trim();
    if (line.length === 0 || line.startsWith('#')) {
      continue;
    }

    const fields = line.split(FIELD_SEPARATOR);
    if (fields.length < MIN_COLUMNS) {
      problems.push({
        line: index + 1,
        text: line,
        reason: `需要至少 ${MIN_COLUMNS} 列，用 | 或 Tab 分隔：${IMPORT_COLUMNS.join(' | ')}`,
      });
      continue;
    }

    const en = fieldAt(fields, 0);
    const cn = fieldAt(fields, 1);
    const defCn = fieldAt(fields, 2);
    const topic = fieldAt(fields, 3).length > 0 ? fieldAt(fields, 3) : '自定义';
    const note = fieldAt(fields, 4);

    const missing = [
      en.length === 0 ? '英文' : '',
      cn.length === 0 ? '中文名' : '',
      defCn.length === 0 ? '中文释义' : '',
    ].filter((name) => name.length > 0);
    if (missing.length > 0) {
      problems.push({ line: index + 1, text: line, reason: `${missing.join('、')} 不能为空` });
      continue;
    }

    const key = keyFor(subject, en);
    if (takenKeys.has(key)) {
      problems.push({ line: index + 1, text: line, reason: `「${en}」在该科目下已存在` });
      continue;
    }

    counter += 1;
    let id = `${idPrefix}-${String(counter).padStart(4, '0')}`;
    while (takenIds.has(id)) {
      counter += 1;
      id = `${idPrefix}-${String(counter).padStart(4, '0')}`;
    }

    takenKeys.add(key);
    takenIds.add(id);
    terms.push({ id, subject, en, cn, defCn, topic, note });
  }

  return { terms, problems };
}
