import { db } from '@/lib/db';
import { sandwiches, type Sandwich, type NewSandwich } from '@/lib/db/schema';
import type { Modifier } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

function ensureModifiers<T extends { modifiers: unknown }>(row: T): Omit<T, 'modifiers'> & { modifiers: Modifier[] } {
  return {
    ...row,
    modifiers: Array.isArray(row.modifiers) ? row.modifiers as Modifier[] : [],
  };
}

export class SandwichService {
  async getSandwiches(): Promise<{ success: true; data: Sandwich[] } | { success: false; error: string }> {
    try {
      const result = await db.select().from(sandwiches).orderBy(sandwiches.createdAt);
      return { success: true, data: result.map(ensureModifiers) };
    } catch (error) {
      console.error('Error fetching sandwiches:', error);
      return { success: false, error: 'Failed to fetch sandwiches' };
    }
  }

  async getSandwichById(id: string): Promise<{ success: true; data: Sandwich } | { success: false; error: string }> {
    try {
      const result = await db.select().from(sandwiches).where(eq(sandwiches.id, id)).limit(1);
      if (result.length === 0) {
        return { success: false, error: 'Sandwich not found' };
      }
      return { success: true, data: ensureModifiers(result[0]) };
    } catch (error) {
      console.error('Error fetching sandwich:', error);
      return { success: false, error: 'Failed to fetch sandwich' };
    }
  }

  async createSandwich(sandwichData: NewSandwich): Promise<{ success: true; data: Sandwich } | { success: false; error: string }> {
    try {
      const result = await db.insert(sandwiches).values({
        ...sandwichData,
        modifiers: sandwichData.modifiers ?? [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      if (result.length === 0) {
        return { success: false, error: 'Failed to create sandwich' };
      }
      return { success: true, data: ensureModifiers(result[0]) };
    } catch (error) {
      console.error('Error creating sandwich:', error);
      return { success: false, error: 'Failed to create sandwich' };
    }
  }

  async updateSandwich(id: string, updates: Partial<NewSandwich>): Promise<{ success: true; data: Sandwich } | { success: false; error: string }> {
    try {
      const result = await db
        .update(sandwiches)
        .set({ ...updates, modifiers: updates.modifiers ?? [], updatedAt: new Date() })
        .where(eq(sandwiches.id, id))
        .returning();
      if (result.length === 0) {
        return { success: false, error: 'Sandwich not found' };
      }
      return { success: true, data: ensureModifiers(result[0]) };
    } catch (error) {
      console.error('Error updating sandwich:', error);
      return { success: false, error: 'Failed to update sandwich' };
    }
  }

  async deleteSandwich(id: string): Promise<{ success: true } | { success: false; error: string }> {
    try {
      const result = await db.delete(sandwiches).where(eq(sandwiches.id, id)).returning();
      if (result.length === 0) {
        return { success: false, error: 'Sandwich not found' };
      }
      return { success: true };
    } catch (error) {
      console.error('Error deleting sandwich:', error);
      return { success: false, error: 'Failed to delete sandwich' };
    }
  }
}

export const sandwichService = new SandwichService();
