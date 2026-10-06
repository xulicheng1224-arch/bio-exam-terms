/**
 * Small DOM helpers.
 *
 * Text always goes through `textContent`, never `innerHTML`, so glossary text
 * and user-imported terms can never be interpreted as markup.
 */

export function element(tag: string, className: string, text: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

export function withTestId<T extends HTMLElement>(node: T, id: string): T {
  node.dataset['testid'] = id;
  return node;
}

export function button(
  label: string,
  className: string,
  testId: string,
  onClick: () => void,
): HTMLButtonElement {
  const node = withTestId(document.createElement('button'), testId);
  node.className = className;
  node.textContent = label;
  node.setAttribute('type', 'button');
  node.addEventListener('click', onClick);
  return node;
}

export function chipButton(
  label: string,
  active: boolean,
  testId: string,
  onClick: () => void,
): HTMLButtonElement {
  const node = button(label, active ? 'chip chip--on' : 'chip', testId, onClick);
  node.setAttribute('aria-pressed', active ? 'true' : 'false');
  return node;
}

export function paragraph(className: string, text: string): HTMLParagraphElement {
  return element('p', className, text) as HTMLParagraphElement;
}

/** Replaces every child of a mount point in one step. */
export function replace(mount: HTMLElement, children: readonly Node[]): void {
  mount.replaceChildren(...children);
}
