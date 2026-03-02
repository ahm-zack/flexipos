// Utility to ensure modifiers is always Modifier[]
export interface Modifier {
  id: string;
  name: string;
  price: number;
  modifiers?: Modifier[];
  [key: string]: unknown;
}

export function ensureModifiers<T extends { modifiers: unknown }>(row: T): Omit<T, 'modifiers'> & { modifiers: Modifier[] } {
  return {
    ...row,
    modifiers: Array.isArray(row.modifiers) ? row.modifiers as Modifier[] : [],
  };
}
