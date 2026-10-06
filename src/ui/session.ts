/**
 * Renders a run of cards: learning new terms, reviewing due terms, drilling
 * mistakes, or the multiple-choice quick mode.
 *
 * Learning deliberately shows the whole answer at once. That step is for
 * reading, not testing; the same term comes back in the review queue on the
 * same day because a new card starts in box 0.
 */

import { answerFaceFor, promptFor } from '../card';
import { buildChoices } from '../quiz';
import { isSpeechAvailable, speakEnglish } from '../speech';
import type { AppActions, AppState, Session, SessionKind } from '../app';
import type { Term } from '../types';
import { button, element, paragraph, withTestId } from './dom';
import { GRADES, GRADE_LABELS, subjectLabel } from './labels';

const SESSION_TITLES: Readonly<Record<SessionKind, string>> = {
  learn: '学新词',
  review: '复习',
  quiz: '选择题快刷',
  mistakes: '刷错词',
};

function speakButton(term: Term, onError: (message: string) => void): HTMLElement | null {
  if (!isSpeechAvailable()) {
    return null;
  }
  return button('🔊 发音', 'speak', 'speak', () => speakEnglish(term.en, onError));
}

function metaLines(term: Term): readonly HTMLElement[] {
  const nodes: HTMLElement[] = [paragraph('card__meta', `考点主题：${term.topic}`)];
  if (term.note.length > 0) {
    nodes.push(paragraph('card__note', `易混提示：${term.note}`));
  }
  return nodes;
}

function sessionHeader(session: Session, actions: AppActions): HTMLElement {
  const header = element('div', 'session__header', '');
  header.append(
    element('span', 'session__title', SESSION_TITLES[session.kind]),
    withTestId(
      element('span', 'session__progress', `${session.cursor + 1} / ${session.queue.length}`),
      'session-progress',
    ),
    button('退出', 'link', 'exit-session', () => actions.navigate('home')),
  );
  return header;
}

function finishedNotice(message: string, actions: AppActions): HTMLElement {
  const wrap = element('div', 'session__done', '');
  wrap.append(
    withTestId(paragraph('empty', message), 'session-done'),
    button('回到今日', 'primary', 'session-back-home', () => actions.navigate('home')),
  );
  return wrap;
}

// ---------------------------------------------------------------------------
// Learning a new term
// ---------------------------------------------------------------------------

function learnCard(term: Term, actions: AppActions, onError: (message: string) => void): readonly Node[] {
  const card = withTestId(element('article', 'card card--revealed', ''), 'card');
  card.append(
    element('span', 'card__subject', subjectLabel(term.subject)),
    withTestId(element('h2', 'card__prompt', promptFor(term)), 'card-prompt'),
  );
  const speak = speakButton(term, onError);
  if (speak !== null) {
    card.append(speak);
  }
  card.append(
    withTestId(paragraph('card__cn', term.cn), 'card-cn'),
    withTestId(paragraph('card__def', term.defCn), 'card-def'),
    ...metaLines(term),
  );

  const controls = element('div', 'controls', '');
  controls.append(button('学过了，下一个', 'primary', 'learn-next', () => actions.finishLearnCard()));
  return [card, controls];
}

// ---------------------------------------------------------------------------
// Reviewing a due term
// ---------------------------------------------------------------------------

function reviewCard(
  state: AppState,
  session: Session,
  term: Term,
  actions: AppActions,
  onError: (message: string) => void,
): readonly Node[] {
  const revealed = session.revealed;
  const card = withTestId(
    element('article', revealed ? 'card card--revealed' : 'card', ''),
    'card',
  );
  card.append(
    element('span', 'card__subject', subjectLabel(term.subject)),
    withTestId(element('h2', 'card__prompt', promptFor(term)), 'card-prompt'),
  );
  const speak = speakButton(term, onError);
  if (speak !== null) {
    card.append(speak);
  }

  if (revealed) {
    const face = answerFaceFor(term, state.settings.revealMode);
    if (face.name.length > 0) {
      card.append(withTestId(paragraph('card__cn', face.name), 'card-cn'));
    }
    if (face.definition.length > 0) {
      card.append(withTestId(paragraph('card__def', face.definition), 'card-def'));
    }
    card.append(...metaLines(term));
  } else {
    card.append(paragraph('card__hint', '先回想中文名和释义，再点「显示答案」'));
    card.addEventListener('click', () => actions.reveal());
  }

  const controls = element('div', 'controls', '');
  if (revealed) {
    for (const grade of GRADES) {
      controls.append(
        button(GRADE_LABELS[grade], `grade grade--${grade}`, `grade-${grade}`, () =>
          actions.grade(grade),
        ),
      );
    }
  } else {
    controls.append(button('显示答案', 'primary', 'reveal', () => actions.reveal()));
  }
  return [card, controls];
}

// ---------------------------------------------------------------------------
// Multiple choice
// ---------------------------------------------------------------------------

function quizCard(
  state: AppState,
  session: Session,
  term: Term,
  actions: AppActions,
  onError: (message: string) => void,
): readonly Node[] {
  // Varying the seed per card keeps the correct answer from landing in the
  // same slot on every question.
  const choices = buildChoices(term, state.glossary.terms, 4, session.seed + session.cursor * 7919);
  const answered = session.chosenIndex !== null;

  const card = withTestId(element('article', 'card', ''), 'card');
  card.append(
    element('span', 'card__subject', subjectLabel(term.subject)),
    withTestId(element('h2', 'card__prompt', promptFor(term)), 'card-prompt'),
    paragraph('card__hint', '选出正确的中文名'),
  );
  const speak = speakButton(term, onError);
  if (speak !== null) {
    card.append(speak);
  }

  const list = element('div', 'choices', '');
  choices.forEach((choice, index) => {
    const isChosen = session.chosenIndex === index;
    let className = 'choice';
    if (answered && choice.correct) {
      className += ' choice--correct';
    } else if (answered && isChosen) {
      className += ' choice--wrong';
    }
    const node = withTestId(
      element('button', className, choice.text) as HTMLButtonElement,
      `choice-${index}`,
    );
    node.setAttribute('type', 'button');
    node.disabled = answered;
    node.addEventListener('click', () => actions.choose(index));
    list.append(node);
  });
  card.append(list);

  const nodes: Node[] = [card];
  if (answered) {
    const chosenWasCorrect = choices[session.chosenIndex ?? -1]?.correct === true;
    const detail = element('article', 'card card--revealed', '');
    detail.append(
      withTestId(
        paragraph('card__verdict', chosenWasCorrect ? '✓ 选对了' : '✗ 选错了'),
        'quiz-verdict',
      ),
      withTestId(paragraph('card__cn', term.cn), 'card-cn'),
      withTestId(paragraph('card__def', term.defCn), 'card-def'),
      ...metaLines(term),
    );
    const controls = element('div', 'controls', '');
    controls.append(
      button('下一个', 'primary', 'quiz-next', () =>
        actions.grade(chosenWasCorrect ? 'good' : 'again'),
      ),
    );
    nodes.push(detail, controls);
  }
  return nodes;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function renderSession(
  state: AppState,
  actions: AppActions,
  onError: (message: string) => void,
): readonly Node[] {
  const session = state.session;
  if (session === null) {
    return [finishedNotice('没有进行中的学习。', actions)];
  }
  const term = session.queue[session.cursor];
  if (term === undefined) {
    return [finishedNotice('这一轮已经完成了。', actions)];
  }

  const body =
    session.kind === 'learn'
      ? learnCard(term, actions, onError)
      : session.kind === 'quiz'
        ? quizCard(state, session, term, actions, onError)
        : reviewCard(state, session, term, actions, onError);

  return [sessionHeader(session, actions), ...body];
}
