/**
 * Application shell.
 *
 * State transitions are pure functions over an immutable AppState. The only
 * side effects are DOM writes in `render`, plus the storage and speech modules.
 */

import './style.css';
import { answerFaceFor, promptFor } from './card';
import { ALL_TERMS } from './data';
import { registerServiceWorker } from './pwa';
import { applyGrade, buildQueue, readCardState, summariseDue } from './srs';
import { isSpeechAvailable, speakEnglish } from './speech';
import {
  clearAllSavedData,
  clearProgress,
  loadProgress,
  loadSettings,
  saveProgress,
  saveSettings,
} from './storage';
import type { Settings } from './storage';
import type { Grade, ProgressStore, RevealMode, Subject, Term } from './types';

const SESSION_LIMIT = 500;

const SUBJECT_LABELS: Readonly<Record<Subject | 'all', string>> = {
  all: '全部',
  cell: '细胞生物学',
  molecular: '分子生物学',
  biochem: '生物化学',
};

const REVEAL_LABELS: Readonly<Record<RevealMode, string>> = {
  name: '只考中文名',
  definition: '只考释义',
  both: '名字＋释义',
};

const GRADES: readonly Grade[] = ['again', 'hard', 'good'];

const GRADE_LABELS: Readonly<Record<Grade, string>> = {
  again: '不认识',
  hard: '模糊',
  good: '认识',
};

const SUBJECT_SCOPES: readonly (Subject | 'all')[] = ['all', 'cell', 'molecular', 'biochem'];
const REVEAL_MODES: readonly RevealMode[] = ['name', 'definition', 'both'];

interface AppState {
  readonly settings: Settings;
  readonly progress: ProgressStore;
  readonly queue: readonly Term[];
  readonly cursor: number;
  readonly revealed: boolean;
}

function buildQueueFor(settings: Settings, progress: ProgressStore, now: number): readonly Term[] {
  return buildQueue(ALL_TERMS, progress, now, {
    subject: settings.subject,
    dueOnly: false,
    limit: SESSION_LIMIT,
  });
}

/** Starts a session: new cards first, then reviews in the order they came due. */
function initialState(settings: Settings, progress: ProgressStore, now: number): AppState {
  return {
    settings,
    progress,
    queue: buildQueueFor(settings, progress, now),
    cursor: 0,
    revealed: false,
  };
}

/** Records a grade and moves to the next card, wrapping into a fresh session. */
function withGrade(state: AppState, grade: Grade, now: number): AppState {
  const term = state.queue[state.cursor];
  if (term === undefined) {
    throw new Error(
      `cannot grade: no card at cursor ${state.cursor} in a queue of ${state.queue.length}`,
    );
  }
  const current = readCardState(state.progress, term.id, now);
  const progress: ProgressStore = { ...state.progress, [term.id]: applyGrade(current, grade, now) };
  const nextCursor = state.cursor + 1;
  if (nextCursor < state.queue.length) {
    return { ...state, progress, cursor: nextCursor, revealed: false };
  }
  return {
    ...state,
    progress,
    queue: buildQueueFor(state.settings, progress, now),
    cursor: 0,
    revealed: false,
  };
}

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

function element(tag: string, className: string, text: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

function withTestId(node: HTMLElement, id: string): HTMLElement {
  node.dataset['testid'] = id;
  return node;
}

function chip(label: string, active: boolean, testIdValue: string, onPick: () => void): HTMLElement {
  const node = withTestId(element('button', active ? 'chip chip--on' : 'chip', label), testIdValue);
  node.setAttribute('type', 'button');
  node.setAttribute('aria-pressed', active ? 'true' : 'false');
  node.addEventListener('click', onPick);
  return node;
}

// ---------------------------------------------------------------------------
// Mount points
// ---------------------------------------------------------------------------

const root = document.getElementById('app');
if (root === null) {
  throw new Error('#app root element is missing from index.html');
}

const errorBanner = element('div', 'banner banner--error', '');
errorBanner.hidden = true;
errorBanner.dataset['testid'] = 'error-banner';

const header = element('header', 'header', '');
const cardRegion = element('main', 'card-region', '');
const controls = element('div', 'controls', '');
const settingsRegion = element('section', 'settings', '');

root.append(errorBanner, header, cardRegion, controls, settingsRegion);

let stateRef: AppState | null = null;

function showError(message: string): void {
  errorBanner.textContent = message;
  errorBanner.hidden = false;
}

function requireState(): AppState {
  if (stateRef === null) {
    throw new Error('application state was read before bootstrap completed');
  }
  return stateRef;
}

// ---------------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------------

function renderHeader(state: AppState, now: number): void {
  header.replaceChildren();

  const due = summariseDue(ALL_TERMS, state.progress, now);
  header.append(element('h1', 'header__title', '考研名词解释'));
  header.append(
    element(
      'div',
      'header__counters',
      `本轮 ${state.cursor + 1}／${state.queue.length}　待复习 ${due.total}　词库 ${ALL_TERMS.length}`,
    ),
  );

  const filters = element('div', 'chips', '');
  for (const scope of SUBJECT_SCOPES) {
    filters.append(
      chip(SUBJECT_LABELS[scope], state.settings.subject === scope, `filter-${scope}`, () => {
        applySettings({ ...requireState().settings, subject: scope });
      }),
    );
  }
  header.append(filters);
}

function renderCard(state: AppState): void {
  cardRegion.replaceChildren();

  const term = state.queue[state.cursor];
  if (term === undefined) {
    cardRegion.append(element('p', 'empty', '当前筛选下没有词条。'));
    return;
  }

  const card = withTestId(element('article', 'card', ''), 'card');
  if (state.revealed) {
    card.classList.add('card--revealed');
  }

  const face = answerFaceFor(term, state.settings.revealMode);

  card.append(element('span', 'card__subject', SUBJECT_LABELS[term.subject]));
  card.append(withTestId(element('h2', 'card__prompt', promptFor(term)), 'card-prompt'));

  if (isSpeechAvailable()) {
    const speak = withTestId(element('button', 'speak', '🔊 发音'), 'speak');
    speak.setAttribute('type', 'button');
    speak.addEventListener('click', (event: MouseEvent): void => {
      event.stopPropagation();
      speakEnglish(term.en, showError);
    });
    card.append(speak);
  }

  if (state.revealed) {
    if (face.name.length > 0) {
      card.append(withTestId(element('p', 'card__cn', face.name), 'card-cn'));
    }
    if (face.definition.length > 0) {
      card.append(withTestId(element('p', 'card__def', face.definition), 'card-def'));
    }
    card.append(element('p', 'card__meta', `考点主题：${term.topic}`));
    if (term.note.length > 0) {
      card.append(element('p', 'card__note', `易混提示：${term.note}`));
    }
  } else {
    card.append(element('p', 'card__hint', '先回想中文名和释义，再点「显示答案」'));
    card.addEventListener('click', () => {
      render({ ...requireState(), revealed: true });
    });
  }

  cardRegion.append(card);
}

function renderControls(state: AppState): void {
  controls.replaceChildren();

  if (!state.revealed) {
    const reveal = withTestId(element('button', 'primary', '显示答案'), 'reveal');
    reveal.setAttribute('type', 'button');
    reveal.addEventListener('click', () => render({ ...requireState(), revealed: true }));
    controls.append(reveal);
    return;
  }

  for (const grade of GRADES) {
    const button = withTestId(
      element('button', `grade grade--${grade}`, GRADE_LABELS[grade]),
      `grade-${grade}`,
    );
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      const next = withGrade(requireState(), grade, Date.now());
      saveProgress(next.progress);
      render(next);
    });
    controls.append(button);
  }
}

function renderSettings(state: AppState): void {
  settingsRegion.replaceChildren();
  settingsRegion.append(element('p', 'settings__label', '翻面显示'));

  const chips = element('div', 'chips', '');
  for (const mode of REVEAL_MODES) {
    chips.append(
      chip(REVEAL_LABELS[mode], state.settings.revealMode === mode, `reveal-${mode}`, () => {
        applySettings({ ...requireState().settings, revealMode: mode });
      }),
    );
  }
  settingsRegion.append(chips);

  settingsRegion.append(
    element('p', 'settings__label', `已记录 ${Object.keys(state.progress).length} 个词条的复习进度`),
  );

  const reset = withTestId(element('button', 'danger', '清空复习进度'), 'reset-progress');
  reset.setAttribute('type', 'button');
  reset.addEventListener('click', () => {
    if (!window.confirm('确定清空全部复习进度吗？此操作不可撤销。')) {
      return;
    }
    clearProgress();
    render(initialState(requireState().settings, {}, Date.now()));
  });
  settingsRegion.append(reset);
}

// ---------------------------------------------------------------------------
// Single render entry point
// ---------------------------------------------------------------------------

function render(next: AppState): void {
  stateRef = next;
  const now = Date.now();
  renderHeader(next, now);
  renderCard(next);
  renderControls(next);
  renderSettings(next);
}

/** Persists a settings change and starts a fresh session under the new scope. */
function applySettings(settings: Settings): void {
  saveSettings(settings);
  render(initialState(settings, requireState().progress, Date.now()));
}

/**
 * Shows the reason startup failed plus a way out.
 *
 * Saved data that cannot be parsed would otherwise leave a permanently blank
 * app with no way to recover on a phone, where there are no developer tools.
 * Clearing is offered explicitly rather than performed silently.
 */
function renderRecovery(message: string): void {
  showError(`启动失败：${message}`);
  header.replaceChildren(element('h1', 'header__title', '考研名词解释'));
  cardRegion.replaceChildren(
    element(
      'p',
      'empty',
      '保存在本机的数据无法读取。清空后就能照常使用，词库本身不受影响，只是复习进度需要重来。',
    ),
  );
  controls.replaceChildren();
  settingsRegion.replaceChildren();

  const recover = withTestId(element('button', 'primary', '清空本机数据并重新开始'), 'recover');
  recover.setAttribute('type', 'button');
  recover.addEventListener('click', () => {
    clearAllSavedData();
    window.location.reload();
  });
  settingsRegion.append(recover);
}

function bootstrap(): void {
  try {
    const settings = loadSettings();
    const progress = loadProgress();
    render(initialState(settings, progress, Date.now()));
  } catch (error: unknown) {
    renderRecovery(error instanceof Error ? error.message : String(error));
  }
}

bootstrap();
registerServiceWorker();
