/**
 * The four tab screens: today's plan, the glossary browser, statistics and
 * settings.
 */

import { IMPORT_TEMPLATE } from '../import';
import { BOX_INTERVALS_DAYS, MASTERED_BOX, daysUntil } from '../srs';
import { summariseAllSubjects } from '../stats';
import type { DailyPlan } from '../plan';
import type { AppActions, AppState } from '../app';
import type { Subject, Term } from '../types';
import { button, chipButton, element, paragraph, withTestId } from './dom';
import {
  REVEAL_LABELS,
  REVEAL_MODES,
  SUBJECT_SCOPES,
  subjectLabel,
} from './labels';

// ---------------------------------------------------------------------------
// Today
// ---------------------------------------------------------------------------

function countdownLine(state: AppState, now: number): HTMLElement {
  const examDate = state.settings.examDate;
  if (examDate.length === 0) {
    return withTestId(paragraph('countdown countdown--unset', '还没设置考试日期'), 'countdown');
  }
  let remaining: number;
  try {
    remaining = daysUntil(examDate, now);
  } catch (error: unknown) {
    return withTestId(
      paragraph('countdown countdown--bad', `考试日期无法识别：${error instanceof Error ? error.message : String(error)}`),
      'countdown',
    );
  }
  if (remaining < 0) {
    return withTestId(paragraph('countdown', `考试日期 ${examDate} 已过 ${-remaining} 天`), 'countdown');
  }
  return withTestId(
    paragraph('countdown', `距 ${examDate} 考试还有 ${remaining} 天`),
    'countdown',
  );
}

function quotaRow(label: string, done: number, quota: number, testId: string): HTMLElement {
  const row = element('div', 'quota', '');
  row.append(
    element('span', 'quota__label', label),
    withTestId(element('span', 'quota__value', `${done} / ${quota}`), testId),
  );
  return row;
}

export function todayScreen(state: AppState, plan: DailyPlan, actions: AppActions): readonly Node[] {
  const nodes: Node[] = [];

  const header = element('div', 'screen__header', '');
  header.append(
    element('h1', 'screen__title', '今日'),
    button('⚙', 'icon-button', 'open-settings', () => actions.navigate('settings')),
  );
  nodes.push(header, countdownLine(state, Date.now()));

  const scopes = element('div', 'chips', '');
  for (const scope of SUBJECT_SCOPES) {
    scopes.append(
      chipButton(subjectLabel(scope), state.settings.subject === scope, `filter-${scope}`, () =>
        actions.updateSettings({ ...state.settings, subject: scope }),
      ),
    );
  }
  nodes.push(scopes);

  const planCard = element('section', 'panel', '');
  planCard.append(
    element('h2', 'panel__title', '今日任务'),
    quotaRow('学新词', plan.counters.introduced, state.settings.newPerDay, 'quota-new'),
    quotaRow('做复习', plan.counters.reviewed, state.settings.reviewPerDay, 'quota-review'),
  );
  if (plan.backlogDays > 0) {
    planCard.append(
      withTestId(
        paragraph('warn', `有 ${plan.dueNow} 个词已到期，最久的拖了 ${plan.backlogDays} 天。今天先做 ${state.settings.reviewPerDay} 个，剩下的会顺延。`),
        'backlog-warning',
      ),
    );
  }
  nodes.push(planCard);

  const actionsRow = element('div', 'stack', '');
  actionsRow.append(
    button(
      plan.newTerms.length > 0 ? `学新词（还有 ${plan.newTerms.length} 个）` : '今日新词已完成',
      'primary',
      'start-learn',
      () => actions.startSession('learn'),
    ),
  );
  actionsRow.append(
    button(
      plan.reviewTerms.length > 0 ? `开始复习（${plan.reviewTerms.length} 个）` : '今天没有到期的词',
      plan.reviewTerms.length > 0 ? 'primary' : 'secondary',
      'start-review',
      () => actions.startSession('review'),
    ),
  );
  actionsRow.append(
    button('选择题快刷', 'secondary', 'start-quiz', () => actions.startSession('quiz')),
  );
  if (plan.mistakes.length > 0) {
    actionsRow.append(
      button(`刷错词（${plan.mistakes.length} 个）`, 'secondary', 'start-mistakes', () =>
        actions.startSession('mistakes'),
      ),
    );
  }
  nodes.push(actionsRow);

  return nodes;
}

// ---------------------------------------------------------------------------
// Library
// ---------------------------------------------------------------------------

/** Shows where a term sits in the schedule, in terms of its next interval. */
function masteryBadge(state: AppState, term: Term): HTMLElement {
  const cardState = state.progress[term.id];
  if (cardState === undefined) {
    return element('span', 'badge badge--new', '未学');
  }
  if (cardState.lapses > 0 && cardState.box < MASTERED_BOX) {
    return element('span', 'badge badge--bad', '错词');
  }
  if (cardState.box >= MASTERED_BOX) {
    return element('span', 'badge badge--good', '掌握');
  }
  if (cardState.box === 0) {
    return element('span', 'badge', '刚学');
  }
  const interval = BOX_INTERVALS_DAYS[cardState.box];
  return element('span', 'badge', interval === undefined ? '复习中' : `${interval} 天`);
}

function matchesQuery(term: Term, query: string): boolean {
  if (query.length === 0) {
    return true;
  }
  const needle = query.toLowerCase();
  return (
    term.en.toLowerCase().includes(needle) ||
    term.cn.includes(query) ||
    term.defCn.includes(query) ||
    term.topic.includes(query)
  );
}

function importPanel(state: AppState, actions: AppActions): HTMLElement {
  const panel = element('details', 'panel panel--fold', '');
  const summary = withTestId(element('summary', 'panel__title', '导入自定义词条'), 'import-toggle');
  panel.append(summary);

  const subjectSelect = withTestId(document.createElement('select'), 'import-subject');
  subjectSelect.className = 'select';
  for (const scope of SUBJECT_SCOPES) {
    if (scope === 'all') {
      continue;
    }
    const option = document.createElement('option');
    option.value = scope;
    option.textContent = subjectLabel(scope);
    subjectSelect.append(option);
  }

  const area = withTestId(document.createElement('textarea'), 'import-text');
  area.className = 'textarea';
  area.rows = 6;
  area.placeholder = `每行一条，用 | 或 Tab 分隔：\n英文 | 中文名 | 中文释义 | 主题 | 备注\n\n例如：\n${IMPORT_TEMPLATE}`;

  const submit = button('导入', 'primary', 'import-submit', () => {
    actions.importTerms(area.value, subjectSelect.value as Subject);
  });

  panel.append(
    paragraph('hint', '英文 | 中文名 | 中文释义 | 主题 | 备注（后两列可省略，空行和 # 开头的行会跳过）'),
    subjectSelect,
    area,
    submit,
  );

  const outcome = state.lastImport;
  if (outcome !== null) {
    const mount = withTestId(element('div', 'import-outcome', ''), 'import-outcome');
    mount.append(
      withTestId(
        paragraph('hint', `本次导入 ${outcome.terms.length} 条，失败 ${outcome.problems.length} 条`),
        'import-summary',
      ),
    );
    for (const problem of outcome.problems) {
      mount.append(paragraph('problem', `第 ${problem.line} 行：${problem.reason} —— ${problem.text}`));
    }
    panel.append(mount);
  }
  return panel;
}

export function libraryScreen(
  state: AppState,
  actions: AppActions,
  renderLimit: number,
): readonly Node[] {
  const nodes: Node[] = [];

  const header = element('div', 'screen__header', '');
  header.append(element('h1', 'screen__title', '词库'));
  nodes.push(header);

  const search = withTestId(document.createElement('input'), 'library-search');
  search.className = 'input';
  search.type = 'search';
  search.placeholder = '搜英文、中文名、释义或主题';
  search.value = state.libraryQuery;
  search.addEventListener('input', () => actions.setLibraryQuery(search.value));
  nodes.push(search);

  const scopes = element('div', 'chips', '');
  for (const scope of SUBJECT_SCOPES) {
    scopes.append(
      chipButton(subjectLabel(scope), state.librarySubject === scope, `library-filter-${scope}`, () =>
        actions.setLibrarySubject(scope),
      ),
    );
  }
  nodes.push(scopes);

  if (state.glossary.shadowed.length > 0) {
    nodes.push(
      withTestId(
        paragraph('warn', `有 ${state.glossary.shadowed.length} 条自定义词条与内置词库重复，已隐藏（内置词条优先）。`),
        'shadowed-notice',
      ),
    );
  }

  nodes.push(importPanel(state, actions));

  const visible = state.glossary.terms
    .filter((term) => state.librarySubject === 'all' || term.subject === state.librarySubject)
    .filter((term) => matchesQuery(term, state.libraryQuery));

  nodes.push(
    withTestId(paragraph('hint', `匹配 ${visible.length} 条 / 全库 ${state.glossary.terms.length} 条`), 'library-count'),
  );

  // Capped so a very large import cannot make typing in the search box janky.
  const shown = visible.slice(0, renderLimit);
  const list = element('div', 'term-list', '');
  for (const term of shown) {
    const row = element('div', 'term-row', '');
    row.append(
      element('span', 'term-row__en', term.en),
      element('span', 'term-row__cn', term.cn),
      element('span', 'term-row__topic', term.topic),
      masteryBadge(state, term),
    );
    list.append(row);
  }
  nodes.push(list);

  if (visible.length > shown.length) {
    nodes.push(paragraph('hint', `只列出前 ${shown.length} 条，用搜索缩小范围。`));
  }
  return nodes;
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

function progressBar(ratio: number): HTMLElement {
  const bar = element('div', 'bar', '');
  const fill = element('div', 'bar__fill', '');
  fill.style.width = `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%`;
  bar.append(fill);
  return bar;
}

export function statsScreen(state: AppState, actions: AppActions): readonly Node[] {
  const nodes: Node[] = [];
  const header = element('div', 'screen__header', '');
  header.append(element('h1', 'screen__title', '统计'));
  nodes.push(header);

  const stats = summariseAllSubjects(state.glossary.terms, state.progress);
  const list = element('div', 'panel', '');

  for (const entry of stats) {
    const block = element('div', 'stat-block', '');
    block.append(
      element('h3', 'stat-block__title', subjectLabel(entry.subject)),
      withTestId(
        paragraph(
          'stat-block__line',
          `掌握 ${entry.mastered}　学习中 ${entry.learning}　未学 ${entry.untouched}　共 ${entry.total}`,
        ),
        `stat-${entry.subject}`,
      ),
      progressBar(entry.total === 0 ? 0 : (entry.mastered + entry.learning * 0.5) / entry.total),
    );
    list.append(block);
  }

  const overall = stats.reduce(
    (accumulator, entry) => ({
      total: accumulator.total + entry.total,
      mastered: accumulator.mastered + entry.mastered,
      introduced: accumulator.introduced + entry.introduced,
    }),
    { total: 0, mastered: 0, introduced: 0 },
  );

  list.append(
    withTestId(
      paragraph('stat-block__line', `总体：已学 ${overall.introduced} / ${overall.total}，其中掌握 ${overall.mastered}`),
      'stat-overall',
    ),
  );
  nodes.push(list);

  nodes.push(
    button('回今日刷错词', 'secondary', 'stats-goto-mistakes', () => actions.startSession('mistakes')),
  );
  return nodes;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

function numberField(
  label: string,
  value: number,
  min: number,
  max: number,
  testId: string,
  onCommit: (next: number) => void,
): HTMLElement {
  const wrap = element('label', 'field', '');
  const input = withTestId(document.createElement('input'), testId);
  input.className = 'input input--number';
  input.type = 'number';
  input.min = String(min);
  input.max = String(max);
  input.value = String(value);
  input.addEventListener('change', () => {
    const parsed = Number(input.value);
    if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
      input.value = String(value);
      return;
    }
    onCommit(parsed);
  });
  wrap.append(element('span', 'field__label', label), input);
  return wrap;
}

export function settingsScreen(state: AppState, actions: AppActions): readonly Node[] {
  const nodes: Node[] = [];

  const header = element('div', 'screen__header', '');
  header.append(
    element('h1', 'screen__title', '设置'),
    button('返回', 'link', 'settings-back', () => actions.navigate('home')),
  );
  nodes.push(header);

  const daily = element('section', 'panel', '');
  daily.append(element('h2', 'panel__title', '每日任务量'));
  daily.append(
    numberField('每日新词', state.settings.newPerDay, 5, 100, 'setting-new-per-day', (next) =>
      actions.updateSettings({ ...state.settings, newPerDay: next }),
    ),
    numberField('每日复习上限', state.settings.reviewPerDay, 10, 500, 'setting-review-per-day', (next) =>
      actions.updateSettings({ ...state.settings, reviewPerDay: next }),
    ),
    paragraph('hint', '复习到上限就停，剩下的顺延到明天，避免断签后一次堆几百个。'),
  );
  nodes.push(daily);

  const exam = element('section', 'panel', '');
  exam.append(element('h2', 'panel__title', '考试日期'));
  const dateInput = withTestId(document.createElement('input'), 'setting-exam-date');
  dateInput.className = 'input';
  dateInput.type = 'date';
  dateInput.value = state.settings.examDate;
  dateInput.addEventListener('change', () =>
    actions.updateSettings({ ...state.settings, examDate: dateInput.value }),
  );
  exam.append(dateInput, paragraph('hint', '设置后，剩余天数不足 70 天时会自动压缩复习间隔，保证考前每个词至少再过 5 遍。'));
  nodes.push(exam);

  const reveal = element('section', 'panel', '');
  reveal.append(element('h2', 'panel__title', '翻面显示'));
  const revealChips = element('div', 'chips', '');
  for (const mode of REVEAL_MODES) {
    revealChips.append(
      chipButton(REVEAL_LABELS[mode], state.settings.revealMode === mode, `reveal-${mode}`, () =>
        actions.updateSettings({ ...state.settings, revealMode: mode }),
      ),
    );
  }
  reveal.append(revealChips);
  nodes.push(reveal);

  const danger = element('section', 'panel', '');
  danger.append(
    element('h2', 'panel__title', '数据'),
    paragraph('hint', `已记录 ${Object.keys(state.progress).length} 个词条的进度，自定义词条 ${state.customTerms.length} 条。进度只存在这台手机上。`),
    button('清空复习进度', 'danger', 'reset-progress', () => {
      if (window.confirm('清空全部复习进度？词库和自定义词条不受影响，此操作不可撤销。')) {
        actions.clearProgress();
      }
    }),
    button('删除全部自定义词条', 'danger', 'reset-custom', () => {
      if (window.confirm('删除全部自定义词条？此操作不可撤销。')) {
        actions.clearCustomTerms();
      }
    }),
  );
  nodes.push(danger);

  return nodes;
}
