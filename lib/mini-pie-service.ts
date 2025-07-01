import { db } from "@/lib/db";
import { miniPies, type NewMiniPie } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { UpdateMiniPie } from "@/lib/schemas";

export const miniPieService = {
  // Get all mini pies
  async getMiniPies() {
    try {
      const data = await db.select().from(miniPies).orderBy(miniPies.createdAt);
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching mini pies:", error);
      return { success: false, error: "Failed to fetch mini pies" };
    }
  },

  // Get mini pie by ID
  async getMiniPieById(id: string) {
    try {
      const result = await db.select().from(miniPies).where(eq(miniPies.id, id)).limit(1);
      if (result.length === 0) {
        return { success: false, error: "Mini pie not found" };
      }
      return { success: true, data: result[0] };
    } catch (error) {
      console.error("Error fetching mini pie:", error);
      return { success: false, error: "Failed to fetch mini pie" };
    }
  },

  // Create new mini pie
  async createMiniPie(miniPieData: NewMiniPie) {
    try {
      const [newMiniPie] = await db.insert(miniPies).values(miniPieData).returning();
      return { success: true, data: newMiniPie };
    } catch (error) {
      console.error("Error creating mini pie:", error);
      return { success: false, error: "Failed to create mini pie" };
    }
  },

  // Update existing mini pie
  async updateMiniPie(id: string, miniPieData: UpdateMiniPie) {
    try {
      // Convert priceWithVat to string if it's a number
      const updatedData = {
        ...miniPieData,
        priceWithVat: miniPieData.priceWithVat !== undefined 
          ? String(miniPieData.priceWithVat) 
          : undefined,
        updatedAt: new Date()
      };

      const [updatedMiniPie] = await db
        .update(miniPies)
        .set(updatedData)
        .where(eq(miniPies.id, id))
        .returning();
      return { success: true, data: updatedMiniPie };
    } catch (error) {
      console.error("Error updating mini pie:", error);
      return { success: false, error: "Failed to update mini pie" };
    }
  },

  // Delete mini pie
  async deleteMiniPie(id: string) {
    try {
      await db.delete(miniPies).where(eq(miniPies.id, id));
      return { success: true };
    } catch (error) {
      console.error("Error deleting mini pie:", error);
      return { success: false, error: "Failed to delete mini pie" };
    }
  },
};
