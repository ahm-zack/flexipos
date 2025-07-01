import { db } from "@/lib/db";
import { pies, type NewPie } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { UpdatePie } from "@/lib/schemas";

export const pieService = {
  // Get all pies
  async getPies() {
    try {
      const data = await db.select().from(pies).orderBy(pies.createdAt);
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching pies:", error);
      return { success: false, error: "Failed to fetch pies" };
    }
  },

  // Create new pie
  async createPie(pieData: NewPie) {
    try {
      const [newPie] = await db.insert(pies).values(pieData).returning();
      return { success: true, data: newPie };
    } catch (error) {
      console.error("Error creating pie:", error);
      return { success: false, error: "Failed to create pie" };
    }
  },

  // Update existing pie
  async updatePie(id: string, pieData: UpdatePie) {
    try {
      // Convert priceWithVat to string if it's a number
      const updatedData = {
        ...pieData,
        priceWithVat: pieData.priceWithVat !== undefined 
          ? String(pieData.priceWithVat) 
          : undefined,
        updatedAt: new Date()
      };

      const [updatedPie] = await db
        .update(pies)
        .set(updatedData)
        .where(eq(pies.id, id))
        .returning();
      return { success: true, data: updatedPie };
    } catch (error) {
      console.error("Error updating pie:", error);
      return { success: false, error: "Failed to update pie" };
    }
  },

  // Delete pie
  async deletePie(id: string) {
    try {
      await db.delete(pies).where(eq(pies.id, id));
      return { success: true };
    } catch (error) {
      console.error("Error deleting pie:", error);
      return { success: false, error: "Failed to delete pie" };
    }
  },
};
