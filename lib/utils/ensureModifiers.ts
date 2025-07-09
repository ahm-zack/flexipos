// Utility to ensure modifiers is always Modifier[]
import type { Modifier } from "@/lib/db/schema";

export function ensureModifiers<T extends { modifiers: unknown }>(row: T): Omit<T, 'modifiers'> & { modifiers: Modifier[] } {
  return {
    ...row,
    modifiers: Array.isArray(row.modifiers) ? row.modifiers as Modifier[] : [],
  };
}
