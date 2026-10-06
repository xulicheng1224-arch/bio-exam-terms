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
import { buildDailyPlan, withIntroduced, withReviewed } from './plan';
import { registerServiceWorker } from './pwa';
import {
  applyGrade,
  createCardState,
  daysUntil,
  examIntervalCapDays,
  findCardState,
  isIntroduced,
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
import type { AppActions, AppState, Route, Session, SessionKind } from './app';
import type { DailyPlan } from './plan';
import type { Grade, Settings, Subject, Term } from './types';
import { button, element, withTestId } from './ui/dom';
import { libraryScreen, settingsScreen, statsScreen, todayScreen } from './ui/screens';
import { renderSession } from './ui/session';

const QUIZ_FALLBACK_LIMIT = 30;
const QUIZ_MIN_TERMS = 4;
const LIST_RENDER_LIMIT = 150;
const SEED_STRIDE = 7919;

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
  errorBanner.textContent = message;
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
// Session helpers
// ---------------------------------------------------------------------------

function advanceSession(state: AppState, session: Session): AppState {
  const nextCursor = session.cursor + 1;
  if (nextCursor < session.queue.length) {
    return {
      ...state,
      session: {
        ...session,
        cursor: nextCursor,
        revealed: false,
        chosenIndex: null,
        seed: session.seed + SEED_STRIDE,
      },
    };
  }
  return { ...state, session: null, route: 'home' };
}

function quizQueue(state: AppState, plan: DailyPlan): readonly Term[] {
  if (plan.reviewTerms.length >= QUIZ_MIN_TERMS) {
    return plan.reviewTerms;
  }
  const introduced = state.glossary.terms.filter((term) => isIntroduced(state.progress, term.id));
  if (introduced.length >= QUIZ_MIN_TERMS) {
    return introduced.slice(0, QUIZ_FALLBACK_LIMIT);
  }
  return plan.newTerms.slice(0, QUIZ_FALLBACK_LIMIT);
}

function buildSessionQueue(state: AppState, plan: DailyPlan, kind: SessionKind): readonly Term[] {
  if (kind === 'learn') {
    return plan.newTerms;
  }
  if (kind === 'review') {
    return plan.reviewTerms;
  }
  if (kind === 'mistakes') {
    return plan.mistakes;
  }
  return quizQueue(state, plan);
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

function renderTabs(state: AppState): void {
  const nodes = TAB_ROUTES.map((route) => {
    const active = owningTab(state.route) === route;
    const label = TAB_LABELS[route] ?? route;
    return button(label, active ? 'tab tab--on' : 'tab', `tab-${route}`, () => {
      if (route === 'review') {
        actions.startSession('review');
      } else {
        actions.navigate(route);
      }
    });
  });
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
  return todayScreen(state, plan, actions);
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
