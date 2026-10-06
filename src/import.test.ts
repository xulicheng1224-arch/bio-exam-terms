import { describe, expect, it } from 'vitest';
import { parseImport } from './import';
import type { Term } from './types';

function existing(id: string, en: string): Term {
  return { id, subject: 'cell', en, cn: '占位', defCn: '占位释义内容。', topic: 't', note: '' };
}

describe('parseImport', () => {
  it('parses a minimal three-column line', () => {
    const result = parseImport('Aquaporin | 水通道蛋白 | 介导水分子跨膜运输的通道蛋白。', 'cell', [], 'custom-cell');
    expect(result.problems).toEqual([]);
    expect(result.terms).toHaveLength(1);
    expect(result.terms[0]?.en).toBe('Aquaporin');
    expect(result.terms[0]?.subject).toBe('cell');
    expect(result.terms[0]?.topic).toBe('自定义');
    expect(result.terms[0]?.note).toBe('');
  });

  it('accepts tab separators and the two optional trailing columns', () => {
    const result = parseImport(
      'Aquaporin\t水通道蛋白\t介导水分子跨膜运输。\t细胞膜\t常考',
      'cell',
      [],
      'custom-cell',
    );
    expect(result.problems).toEqual([]);
    expect(result.terms[0]?.topic).toBe('细胞膜');
    expect(result.terms[0]?.note).toBe('常考');
  });

  it('skips blank lines and comments', () => {
    const text = ['# 细胞生物学补充', '', 'Aquaporin | 水通道蛋白 | 介导水分子跨膜运输。', '   '].join('\n');
    const result = parseImport(text, 'cell', [], 'custom-cell');
    expect(result.terms).toHaveLength(1);
    expect(result.problems).toEqual([]);
  });

  it('reports the line number of a malformed row and keeps the good ones', () => {
    const text = ['Aquaporin | 水通道蛋白 | 介导水分子跨膜运输。', '只有一列', 'Aquaporin2 | 另一条 | 释义内容。'].join('\n');
    const result = parseImport(text, 'cell', [], 'custom-cell');
    expect(result.terms).toHaveLength(2);
    expect(result.problems).toHaveLength(1);
    expect(result.problems[0]?.line).toBe(2);
    expect(result.problems[0]?.reason).toContain('至少 3 列');
  });

  it('rejects a row with an empty required column', () => {
    const result = parseImport('Aquaporin |  | 介导水分子跨膜运输。', 'cell', [], 'custom-cell');
    expect(result.terms).toEqual([]);
    expect(result.problems[0]?.reason).toContain('中文名');
  });

  it('rejects a term the glossary already covers in that subject', () => {
    const result = parseImport('aquaporin | 水通道蛋白 | 释义。', 'cell', [existing('cell-1', 'Aquaporin')], 'custom-cell');
    expect(result.terms).toEqual([]);
    expect(result.problems[0]?.reason).toContain('已存在');
  });

  it('allows the same English term in a different subject', () => {
    const result = parseImport('Aquaporin | 水通道蛋白 | 释义。', 'molecular', [existing('cell-1', 'Aquaporin')], 'custom-molecular');
    expect(result.terms).toHaveLength(1);
    expect(result.problems).toEqual([]);
  });

  it('rejects duplicates inside one paste', () => {
    const text = ['Aquaporin | 水通道蛋白 | 释义。', 'Aquaporin | 水通道蛋白 | 又一条。'].join('\n');
    const result = parseImport(text, 'cell', [], 'custom-cell');
    expect(result.terms).toHaveLength(1);
    expect(result.problems[0]?.line).toBe(2);
  });

  it('generates ids that do not collide with existing ones', () => {
    const taken = [existing('custom-cell-0001', 'Something else')];
    const result = parseImport('Aquaporin | 水通道蛋白 | 释义。', 'cell', taken, 'custom-cell');
    expect(result.terms[0]?.id).not.toBe('custom-cell-0001');
  });

  it('trims surrounding whitespace from every column', () => {
    const result = parseImport('  Aquaporin  |  水通道蛋白  |  释义。  ', 'cell', [], 'custom-cell');
    expect(result.terms[0]?.en).toBe('Aquaporin');
    expect(result.terms[0]?.cn).toBe('水通道蛋白');
    expect(result.terms[0]?.defCn).toBe('释义。');
  });
});
