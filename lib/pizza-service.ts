import { db } from '@/lib/db';
import { pizzas, type Pizza, type NewPizza, type PizzaType } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface PizzaServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const pizzaService = {
  // Get all pizzas
  async getPizzas(): Promise<PizzaServiceResult<Pizza[]>> {
    try {
      const allPizzas = await db.select().from(pizzas);
      return { success: true, data: allPizzas };
    } catch (error) {
      console.error('Error fetching pizzas:', error);
      return { success: false, error: 'Failed to fetch pizzas' };
    }
  },

  // Get pizza by ID
  async getPizzaById(id: string): Promise<PizzaServiceResult<Pizza>> {
    try {
      const pizza = await db.select().from(pizzas).where(eq(pizzas.id, id)).limit(1);
      
      if (pizza.length === 0) {
        return { success: false, error: 'Pizza not found' };
      }

      return { success: true, data: pizza[0] };
    } catch (error) {
      console.error('Error fetching pizza by ID:', error);
      return { success: false, error: 'Failed to fetch pizza' };
    }
  },

  // Create new pizza
  async createPizza(pizzaData: NewPizza): Promise<PizzaServiceResult<Pizza>> {
    try {
      const newPizza = await db.insert(pizzas).values({
        ...pizzaData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return { success: true, data: newPizza[0] };
    } catch (error) {
      console.error('Error creating pizza:', error);
      return { success: false, error: 'Failed to create pizza' };
    }
  },

  // Update pizza
  async updatePizza(id: string, pizzaData: Partial<NewPizza>): Promise<PizzaServiceResult<Pizza>> {
    try {
      const updatedPizza = await db.update(pizzas)
        .set({
          ...pizzaData,
          updatedAt: new Date(),
        })
        .where(eq(pizzas.id, id))
        .returning();

      if (updatedPizza.length === 0) {
        return { success: false, error: 'Pizza not found' };
      }

      return { success: true, data: updatedPizza[0] };
    } catch (error) {
      console.error('Error updating pizza:', error);
      return { success: false, error: 'Failed to update pizza' };
    }
  },

  // Delete pizza
  async deletePizza(id: string): Promise<PizzaServiceResult<boolean>> {
    try {
      const deletedPizza = await db.delete(pizzas).where(eq(pizzas.id, id)).returning();

      if (deletedPizza.length === 0) {
        return { success: false, error: 'Pizza not found' };
      }

      return { success: true, data: true };
    } catch (error) {
      console.error('Error deleting pizza:', error);
      return { success: false, error: 'Failed to delete pizza' };
    }
  },

  // Get pizzas by type
  async getPizzasByType(type: PizzaType): Promise<PizzaServiceResult<Pizza[]>> {
    try {
      const pizzasByType = await db.select().from(pizzas).where(eq(pizzas.type, type));
      return { success: true, data: pizzasByType };
    } catch (error) {
      console.error('Error fetching pizzas by type:', error);
      return { success: false, error: 'Failed to fetch pizzas by type' };
    }
  },
};
