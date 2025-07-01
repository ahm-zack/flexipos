import { db } from '@/lib/db';
import { sandwiches, type Sandwich, type NewSandwich } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export class SandwichService {
  async getSandwiches(): Promise<{ success: true; data: Sandwich[] } | { success: false; error: string }> {
    try {
      const result = await db.select().from(sandwiches).orderBy(sandwiches.createdAt);
      return { success: true, data: result };
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
      return { success: true, data: result[0] };
    } catch (error) {
      console.error('Error fetching sandwich:', error);
      return { success: false, error: 'Failed to fetch sandwich' };
    }
  }

  async createSandwich(sandwichData: NewSandwich): Promise<{ success: true; data: Sandwich } | { success: false; error: string }> {
    try {
      const result = await db.insert(sandwiches).values(sandwichData).returning();
      if (result.length === 0) {
        return { success: false, error: 'Failed to create sandwich' };
      }
      return { success: true, data: result[0] };
    } catch (error) {
      console.error('Error creating sandwich:', error);
      return { success: false, error: 'Failed to create sandwich' };
    }
  }

  async updateSandwich(id: string, updates: Partial<NewSandwich>): Promise<{ success: true; data: Sandwich } | { success: false; error: string }> {
    try {
      const result = await db
        .update(sandwiches)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(sandwiches.id, id))
        .returning();
      
      if (result.length === 0) {
        return { success: false, error: 'Sandwich not found' };
      }
      return { success: true, data: result[0] };
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
