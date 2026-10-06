/** Domain types shared across the terminology trainer. */

/** The three examined subjects. The literal union is the single source of truth. */
export type Subject = 'cell' | 'molecular' | 'biochem';

/** A single glossary entry. Every field is required and validated at load time. */
export interface Term {
  /** Stable identifier, e.g. "cell-0012". Never reused. */
  readonly id: string;
  /** Owning subject. */
  readonly subject: Subject;
  /** The English term as it appears in the exam paper. */
  readonly en: string;
  /** The canonical Chinese name. */
  readonly cn: string;
  /** Chinese definition, taken from the textbook wording. */
  readonly defCn: string;
  /**
   * Topic the entry belongs to, matching a textbook chapter title, e.g.
   * "细胞骨架". Deliberately a name rather than a chapter number: chapter
   * numbering differs between editions and a wrong number is worse than none.
   */
  readonly topic: string;
  /** Confusable neighbours or exam hints. Empty string when there is nothing to add. */
  readonly note: string;
}

/** Self-reported recall quality after a card is flipped. */
export type Grade = 'again' | 'hard' | 'good';

/** How much of the answer is revealed when a card is flipped. */
export type RevealMode = 'name' | 'definition' | 'both';

/** Leitner box scheduling state for one term. */
export interface CardState {
  /** Leitner box index, 0..MAX_BOX. Higher means better retained. */
  readonly box: number;
  /** Epoch milliseconds at which the term becomes due again. */
  readonly dueAt: number;
  /** How many times the term was graded "again". */
  readonly lapses: number;
  /** Total number of reviews recorded. */
  readonly reviews: number;
}

/** Per-term scheduling state keyed by term id. */
export type ProgressStore = Readonly<Record<string, CardState>>;
