import { db } from '@/lib/db';
import { menuItemModifiers, orderItemModifiers } from '@/lib/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import type { NewMenuItemModifier, OrderItemModifier, NewOrderItemModifier } from '@/lib/db/schema';

// Service result type
export interface ModifiersServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// API types for frontend
export interface ApiModifier {
  id: string;
  menuItemId: string;
  menuItemType: string;
  name: string;
  type: 'extra' | 'without';
  price: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModifierRequest {
  menuItemId: string;
  menuItemType: 'pizza' | 'pie' | 'sandwich' | 'mini_pie';
  name: string;
  type: 'extra' | 'without';
  price: number;
  displayOrder?: number;
}

export interface UpdateModifierRequest {
  name?: string;
  type?: 'extra' | 'without';
  price?: number;
  displayOrder?: number;
  isActive?: boolean;
}

export interface ReorderModifiersRequest {
  modifiers: { id: string; displayOrder: number }[];
}

/**
 * Get all modifiers for a specific menu item
 */
export async function getModifiersByMenuItem(
  menuItemId: string,
  menuItemType: string
): Promise<ModifiersServiceResult<ApiModifier[]>> {
  try {
    const modifiers = await db
      .select()
      .from(menuItemModifiers)
      .where(
        and(
          eq(menuItemModifiers.menuItemId, menuItemId),
          eq(menuItemModifiers.menuItemType, menuItemType),
          eq(menuItemModifiers.isActive, 'true')
        )
      )
      .orderBy(asc(menuItemModifiers.displayOrder), asc(menuItemModifiers.createdAt));

    const apiModifiers: ApiModifier[] = modifiers.map(modifier => ({
      id: modifier.id,
      menuItemId: modifier.menuItemId,
      menuItemType: modifier.menuItemType,
      name: modifier.name,
      type: modifier.type,
      price: parseFloat(modifier.price),
      displayOrder: modifier.displayOrder,
      isActive: modifier.isActive === 'true',
      createdAt: modifier.createdAt.toISOString(),
      updatedAt: modifier.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: apiModifiers,
    };
  } catch (error) {
    console.error('Error fetching modifiers:', error);
    return {
      success: false,
      error: 'Failed to fetch modifiers',
    };
  }
}

/**
 * Create a new modifier for a menu item
 */
export async function createModifier(
  request: CreateModifierRequest
): Promise<ModifiersServiceResult<ApiModifier>> {
  try {
    // Get the next display order if not provided
    let displayOrder = request.displayOrder ?? 0;
    if (displayOrder === 0) {
      const lastModifier = await db
        .select({ displayOrder: menuItemModifiers.displayOrder })
        .from(menuItemModifiers)
        .where(
          and(
            eq(menuItemModifiers.menuItemId, request.menuItemId),
            eq(menuItemModifiers.menuItemType, request.menuItemType)
          )
        )
        .orderBy(desc(menuItemModifiers.displayOrder))
        .limit(1);

      displayOrder = (lastModifier[0]?.displayOrder ?? 0) + 1;
    }

    const newModifier: NewMenuItemModifier = {
      menuItemId: request.menuItemId,
      menuItemType: request.menuItemType,
      name: request.name.trim(),
      type: request.type,
      price: request.price.toString(),
      displayOrder,
      isActive: 'true',
    };

    const [createdModifier] = await db
      .insert(menuItemModifiers)
      .values(newModifier)
      .returning();

    const apiModifier: ApiModifier = {
      id: createdModifier.id,
      menuItemId: createdModifier.menuItemId,
      menuItemType: createdModifier.menuItemType,
      name: createdModifier.name,
      type: createdModifier.type,
      price: parseFloat(createdModifier.price),
      displayOrder: createdModifier.displayOrder,
      isActive: createdModifier.isActive === 'true',
      createdAt: createdModifier.createdAt.toISOString(),
      updatedAt: createdModifier.updatedAt.toISOString(),
    };

    return {
      success: true,
      data: apiModifier,
    };
  } catch (error) {
    console.error('Error creating modifier:', error);
    return {
      success: false,
      error: 'Failed to create modifier',
    };
  }
}

/**
 * Update an existing modifier
 */
export async function updateModifier(
  modifierId: string,
  request: UpdateModifierRequest
): Promise<ModifiersServiceResult<ApiModifier>> {
  try {
    const updateData: Partial<NewMenuItemModifier> = {};

    if (request.name !== undefined) updateData.name = request.name.trim();
    if (request.type !== undefined) updateData.type = request.type;
    if (request.price !== undefined) updateData.price = request.price.toString();
    if (request.displayOrder !== undefined) updateData.displayOrder = request.displayOrder;
    if (request.isActive !== undefined) updateData.isActive = request.isActive ? 'true' : 'false';

    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date();

    const [updatedModifier] = await db
      .update(menuItemModifiers)
      .set(updateData)
      .where(eq(menuItemModifiers.id, modifierId))
      .returning();

    if (!updatedModifier) {
      return {
        success: false,
        error: 'Modifier not found',
      };
    }

    const apiModifier: ApiModifier = {
      id: updatedModifier.id,
      menuItemId: updatedModifier.menuItemId,
      menuItemType: updatedModifier.menuItemType,
      name: updatedModifier.name,
      type: updatedModifier.type,
      price: parseFloat(updatedModifier.price),
      displayOrder: updatedModifier.displayOrder,
      isActive: updatedModifier.isActive === 'true',
      createdAt: updatedModifier.createdAt.toISOString(),
      updatedAt: updatedModifier.updatedAt.toISOString(),
    };

    return {
      success: true,
      data: apiModifier,
    };
  } catch (error) {
    console.error('Error updating modifier:', error);
    return {
      success: false,
      error: 'Failed to update modifier',
    };
  }
}

/**
 * Delete a modifier (soft delete by setting isActive to false)
 */
export async function deleteModifier(
  modifierId: string
): Promise<ModifiersServiceResult<{ success: boolean }>> {
  try {
    const [deletedModifier] = await db
      .update(menuItemModifiers)
      .set({ 
        isActive: 'false',
        updatedAt: new Date(),
      })
      .where(eq(menuItemModifiers.id, modifierId))
      .returning();

    if (!deletedModifier) {
      return {
        success: false,
        error: 'Modifier not found',
      };
    }

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error('Error deleting modifier:', error);
    return {
      success: false,
      error: 'Failed to delete modifier',
    };
  }
}

/**
 * Reorder modifiers for a menu item
 */
export async function reorderModifiers(
  request: ReorderModifiersRequest
): Promise<ModifiersServiceResult<{ success: boolean }>> {
  try {
    // Update each modifier's display order
    const updatePromises = request.modifiers.map(({ id, displayOrder }) =>
      db
        .update(menuItemModifiers)
        .set({ 
          displayOrder,
          updatedAt: new Date(),
        })
        .where(eq(menuItemModifiers.id, id))
    );

    await Promise.all(updatePromises);

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error('Error reordering modifiers:', error);
    return {
      success: false,
      error: 'Failed to reorder modifiers',
    };
  }
}

/**
 * Save selected modifiers for an order item
 */
export async function saveOrderModifiers(
  orderId: string,
  menuItemId: string,
  menuItemType: string,
  selectedModifierIds: string[]
): Promise<ModifiersServiceResult<{ success: boolean }>> {
  try {
    if (selectedModifierIds.length === 0) {
      return {
        success: true,
        data: { success: true },
      };
    }

    // Get the modifier details with current prices
    const modifiers = await db
      .select()
      .from(menuItemModifiers)
      .where(
        and(
          eq(menuItemModifiers.menuItemId, menuItemId),
          eq(menuItemModifiers.menuItemType, menuItemType)
        )
      );

    const modifierMap = new Map(modifiers.map(m => [m.id, m]));

    // Create order modifier records
    const orderModifiers: NewOrderItemModifier[] = selectedModifierIds
      .map(modifierId => {
        const modifier = modifierMap.get(modifierId);
        if (!modifier) return null;

        return {
          orderId,
          menuItemId,
          menuItemType,
          modifierId,
          modifierName: modifier.name,
          modifierType: modifier.type,
          priceAtTime: modifier.price,
        };
      })
      .filter(Boolean) as NewOrderItemModifier[];

    if (orderModifiers.length > 0) {
      await db.insert(orderItemModifiers).values(orderModifiers);
    }

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error('Error saving order modifiers:', error);
    return {
      success: false,
      error: 'Failed to save order modifiers',
    };
  }
}

/**
 * Get modifiers for a specific order item
 */
export async function getOrderModifiers(
  orderId: string,
  menuItemId: string
): Promise<ModifiersServiceResult<OrderItemModifier[]>> {
  try {
    const modifiers = await db
      .select()
      .from(orderItemModifiers)
      .where(
        and(
          eq(orderItemModifiers.orderId, orderId),
          eq(orderItemModifiers.menuItemId, menuItemId)
        )
      );

    return {
      success: true,
      data: modifiers,
    };
  } catch (error) {
    console.error('Error fetching order modifiers:', error);
    return {
      success: false,
      error: 'Failed to fetch order modifiers',
    };
  }
}
