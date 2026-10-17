/**
 * Application shell: owns the state, wires the actions and renders whichever
 * screen is active.
 *
 * State transitions are pure. The side effects live here in DOM writes, plus
 * the storage and speech modules.
 */

import './style.css';
import { BUNDLED_TERMS } from './data';
import { assembleGlossary } from './glossary';
import { parseImport } from './import';
import {
  advanceSession,
  buildDailyPlan,
  buildSessionQueue,
  withIntroduced,
  withReviewed,
} from './plan';
import { registerServiceWorker } from './pwa';
import {
  applyGrade,
  createCardState,
  daysUntil,
  examIntervalCapDays,
  findCardState,
} from './srs';
import {
  clearAllSavedData,
  clearProgress as clearSavedProgress,
  loadCustomTerms,
  loadDailyLog,
  loadProgress,
  loadSettings,
  saveCustomTerms,
  saveDailyLog,
  saveProgress,
  saveSettings,
} from './storage';
import type { AppActions, AppState, Route, SessionKind } from './app';
import type { Grade, Settings, Subject } from './types';
import { button, element, withTestId } from './ui/dom';
import { libraryScreen, settingsScreen, statsScreen, todayScreen } from './ui/screens';
import { renderSession } from './ui/session';

const LIST_RENDER_LIMIT = 150;

const TAB_ROUTES: readonly Route[] = ['home', 'review', 'library', 'stats'];
const TAB_LABELS: Readonly<Record<string, string>> = {
  home: '今日',
  review: '复习',
  library: '词库',
  stats: '统计',
};

function isSessionRoute(route: Route): boolean {
  return route === 'learn' || route === 'review' || route === 'quiz' || route === 'mistakes';
}

/**
 * Which tab a route belongs under.
 *
 * Sessions started from the today screen keep "今日" lit, but a review session
 * IS the review tab, so it must not light both - which is what comparing the
 * route directly used to do.
 */
function owningTab(route: Route): Route {
  if (route === 'settings' || route === 'learn' || route === 'quiz' || route === 'mistakes') {
    return 'home';
  }
  return route;
}

// ---------------------------------------------------------------------------
// Mount points
// ---------------------------------------------------------------------------

const rootElement = document.getElementById('app');
if (rootElement === null) {
  throw new Error('#app root element is missing from index.html');
}
const root: HTMLElement = rootElement;

const errorBanner = withTestId(element('div', 'banner banner--error', ''), 'error-banner');
errorBanner.setAttribute('role', 'alert');
const errorText = element('span', 'banner__text', '');
const errorDismiss = button('✕', 'banner__dismiss', 'dismiss-error', () => {
  errorBanner.hidden = true;
});
errorBanner.append(errorText, errorDismiss);
errorBanner.hidden = true;
const screenMount = element('main', 'screen', '');
const tabBar = element('nav', 'tabbar', '');

root.append(errorBanner, screenMount, tabBar);

let stateRef: AppState | null = null;

function requireState(): AppState {
  if (stateRef === null) {
    throw new Error('application state was read before bootstrap completed');
  }
  return stateRef;
}

function showError(message: string): void {
  errorText.textContent = message;
  errorBanner.hidden = false;
}

/** Surfaces a failure in the banner instead of leaving the screen unresponsive. */
function run(action: () => void): void {
  try {
    action();
  } catch (error: unknown) {
    showError(error instanceof Error ? error.message : String(error));
  }
}

// ---------------------------------------------------------------------------
// Focus preservation
// ---------------------------------------------------------------------------

interface FocusSnapshot {
  readonly testId: string;
  readonly selectionStart: number | null;
}

/**
 * Re-rendering replaces the whole tree, which would otherwise drop the caret
 * out of the search box on every keystroke.
 */
function captureFocus(): FocusSnapshot | null {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) {
    return null;
  }
  const testId = active.dataset['testid'];
  if (testId === undefined) {
    return null;
  }
  const selectionStart =
    active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement
      ? active.selectionStart
      : null;
  return { testId, selectionStart };
}

function restoreFocus(snapshot: FocusSnapshot | null): void {
  if (snapshot === null) {
    return;
  }
  const restored = root.querySelector<HTMLElement>(`[data-testid="${snapshot.testId}"]`);
  if (restored === null) {
    return;
  }
  restored.focus();
  if (
    snapshot.selectionStart !== null &&
    (restored instanceof HTMLInputElement || restored instanceof HTMLTextAreaElement)
  ) {
    restored.setSelectionRange(snapshot.selectionStart, snapshot.selectionStart);
  }
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

const actions: AppActions = {
  navigate: (route: Route): void =>
    run(() => {
      render({ ...requireState(), route, session: null });
    }),

  startSession: (kind: SessionKind): void =>
    run(() => {
      const state = requireState();
      const now = Date.now();
      const plan = buildDailyPlan(
        state.glossary.terms,
        state.progress,
        state.log,
        state.settings,
        now,
      );
      render({
        ...state,
        route: kind,
        session: {
          kind,
          queue: buildSessionQueue(state, plan, kind),
          cursor: 0,
          revealed: false,
          chosenIndex: null,
          seed: now % 1_000_000,
        },
      });
    }),

  reveal: (): void =>
    run(() => {
      const state = requireState();
      if (state.session === null || state.session.revealed) {
        return;
      }
      render({ ...state, session: { ...state.session, revealed: true } });
    }),

  choose: (index: number): void =>
    run(() => {
      const state = requireState();
      const session = state.session;
      if (session === null || session.chosenIndex !== null) {
        return;
      }
      render({ ...state, session: { ...session, chosenIndex: index } });
    }),

  grade: (grade: Grade): void =>
    run(() => {
      const state = requireState();
      const session = state.session;
      if (session === null) {
        return;
      }
      const term = session.queue[session.cursor];
      if (term === undefined) {
        return;
      }
      const now = Date.now();
      const cap = examIntervalCapDays(state.settings.examDate, now);
      const current = findCardState(state.progress, term.id) ?? createCardState(now);
      const progress = { ...state.progress, [term.id]: applyGrade(current, grade, now, cap) };
      const log = withReviewed(state.log, now);
      saveProgress(progress);
      saveDailyLog(log);
      render(advanceSession({ ...state, progress, log }, session));
    }),

  finishLearnCard: (): void =>
    run(() => {
      const state = requireState();
      const session = state.session;
      if (session === null) {
        return;
      }
      const term = session.queue[session.cursor];
      if (term === undefined) {
        return;
      }
      const now = Date.now();
      const progress = { ...state.progress, [term.id]: createCardState(now) };
      const log = withIntroduced(state.log, now);
      saveProgress(progress);
      saveDailyLog(log);
      render(advanceSession({ ...state, progress, log }, session));
    }),

  updateSettings: (settings: Settings): void =>
    run(() => {
      // Reject an unusable date rather than persisting it and failing later.
      if (settings.examDate.length > 0) {
        daysUntil(settings.examDate, Date.now());
      }
      saveSettings(settings);
      const state = requireState();
      const subjectChanged = state.settings.subject !== settings.subject;
      render({
        ...state,
        settings,
        session: subjectChanged ? null : state.session,
        route: subjectChanged ? 'home' : state.route,
      });
    }),

  importTerms: (text: string, subject: Subject): void =>
    run(() => {
      const state = requireState();
      const result = parseImport(text, subject, state.glossary.terms, `custom-${subject}`);
      const customTerms = [...state.customTerms, ...result.terms];
      if (result.terms.length > 0) {
        saveCustomTerms(customTerms);
      }
      render({
        ...state,
        customTerms,
        glossary: assembleGlossary(BUNDLED_TERMS, customTerms),
        lastImport: result,
      });
    }),

  clearProgress: (): void =>
    run(() => {
      clearSavedProgress();
      const state = requireState();
      render({ ...state, progress: {}, log: {}, session: null, route: 'home' });
    }),

  clearCustomTerms: (): void =>
    run(() => {
      saveCustomTerms([]);
      const state = requireState();
      render({
        ...state,
        customTerms: [],
        glossary: assembleGlossary(BUNDLED_TERMS, []),
        lastImport: null,
      });
    }),

  setLibraryQuery: (query: string): void =>
    run(() => {
      render({ ...requireState(), libraryQuery: query });
    }),

  setLibrarySubject: (subject: Subject | 'all'): void =>
    run(() => {
      render({ ...requireState(), librarySubject: subject });
    }),
};

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/** Static stroke icons, one per tab. Inner markup is a constant, never user data. */
const TAB_ICONS: Readonly<Record<string, string>> = {
  home: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10.5h18"/>',
  review: '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>',
  library:
    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2.5H6.5A2.5 2.5 0 0 0 4 5z"/><path d="M8 7h8"/>',
  stats: '<path d="M4 20h16"/><path d="M7 20v-6M12 20V6M17 20v-9"/>',
};

function svgIcon(inner: string): HTMLElement {
  const wrap = element('span', 'tab__icon', '');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = inner;
  wrap.append(svg);
  return wrap;
}

function tabButton(route: Route, active: boolean): HTMLButtonElement {
  const node = withTestId(document.createElement('button'), `tab-${route}`);
  node.className = active ? 'tab tab--on' : 'tab';
  node.setAttribute('type', 'button');
  if (active) {
    node.setAttribute('aria-current', 'page');
  }
  node.append(svgIcon(TAB_ICONS[route] ?? ''), element('span', 'tab__label', TAB_LABELS[route] ?? route));
  node.addEventListener('click', () => {
    if (route === 'review') {
      actions.startSession('review');
    } else {
      actions.navigate(route);
    }
  });
  return node;
}

function renderTabs(state: AppState): void {
  const nodes = TAB_ROUTES.map((route) => tabButton(route, owningTab(state.route) === route));
  tabBar.replaceChildren(...nodes);
}

function activeScreen(state: AppState, now: number): readonly Node[] {
  if (isSessionRoute(state.route)) {
    return renderSession(state, actions, showError);
  }
  if (state.route === 'library') {
    return libraryScreen(state, actions, LIST_RENDER_LIMIT);
  }
  if (state.route === 'stats') {
    return statsScreen(state, actions);
  }
  if (state.route === 'settings') {
    return settingsScreen(state, actions);
  }
  const plan = buildDailyPlan(state.glossary.terms, state.progress, state.log, state.settings, now);
  return todayScreen(state, plan, actions, now);
}

function render(next: AppState): void {
  const focus = captureFocus();
  stateRef = next;
  screenMount.replaceChildren(...activeScreen(next, Date.now()));
  renderTabs(next);
  restoreFocus(focus);
}

/**
 * Shows why startup failed plus a way out.
 *
 * Saved data that cannot be parsed would otherwise leave a permanently blank
 * app with no way to recover on a phone, where there are no developer tools.
 */
function renderRecovery(message: string): void {
  showError(`启动失败：${message}`);
  const panel = element('div', 'screen__done', '');
  panel.append(
    element('h1', 'screen__title', '考研名词解释'),
    element(
      'p',
      'empty',
      '保存在本机的数据无法读取。清空后就能照常使用，内置词库不受影响，只是复习进度和自定义词条需要重来。',
    ),
    button('清空本机数据并重新开始', 'primary', 'recover', () => {
      clearAllSavedData();
      window.location.reload();
    }),
  );
  screenMount.replaceChildren(panel);
  tabBar.replaceChildren();
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

function bootstrap(): void {
  try {
    const customTerms = loadCustomTerms();
    render({
      settings: loadSettings(),
      progress: loadProgress(),
      log: loadDailyLog(),
      customTerms,
      glossary: assembleGlossary(BUNDLED_TERMS, customTerms),
      route: 'home',
      session: null,
      libraryQuery: '',
      librarySubject: 'all',
      lastImport: null,
    });
  } catch (error: unknown) {
    renderRecovery(error instanceof Error ? error.message : String(error));
  }
}

bootstrap();
registerServiceWorker();
