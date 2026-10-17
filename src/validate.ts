/**
 * Shared runtime-shape guards.
 *
 * Both the persistence boundary and the glossary validator treat external data
 * as untrusted; this is the one home for the small predicates they share.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
