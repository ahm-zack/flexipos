"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { CartItem } from "@/modules/cart/types/cart.types";

export interface ParkedOrder {
    id: string;
    timestamp: Date;
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    cartData: {
        items: CartItem[];
        total: number;
        itemCount: number;
    };
    paymentMethod: "cash" | "card" | "mixed" | "delivery";
    discountData?: {
        type: "percentage" | "amount";
        value: string;
        amount: number;
    };
    note?: string;
    parkedBy: string; // staff member ID or name
    duration?: number; // parking duration in minutes
}

const STORAGE_KEY = "parked_orders";
const MAX_PARKING_HOURS = 24; // Auto-cleanup after 24 hours
const MAX_PARKED_ORDERS = 50; // Maximum number of orders that can be parked

export function useParkedOrders() {
    const [parkedOrders, setParkedOrders] = useState<ParkedOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadParkedOrders = useCallback(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const orders: ParkedOrder[] = JSON.parse(stored).map((order: ParkedOrder & { timestamp: string }) => ({
                    ...order,
                    timestamp: new Date(order.timestamp),
                }));

                // Filter out expired orders (older than MAX_PARKING_HOURS)
                const validOrders = orders.filter(order => {
                    const hoursSinceParked = (Date.now() - order.timestamp.getTime()) / (1000 * 60 * 60);
                    return hoursSinceParked < MAX_PARKING_HOURS;
                });

                // Update storage if we removed expired orders
                if (validOrders.length !== orders.length) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(validOrders));
                    if (orders.length - validOrders.length > 0) {
                        toast.info(`Cleaned up ${orders.length - validOrders.length} expired parked orders`);
                    }
                }

                setParkedOrders(validOrders);
            }
        } catch (error) {
            console.error("Error loading parked orders:", error);
            toast.error("Failed to load parked orders");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load parked orders from localStorage on mount
    useEffect(() => {
        loadParkedOrders();
    }, [loadParkedOrders]);

    // Listen for storage changes from other tabs/components
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                loadParkedOrders();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadParkedOrders]);

    // Custom event for same-tab updates
    useEffect(() => {
        const handleParkedOrdersUpdate = () => {
            loadParkedOrders();
        };

        window.addEventListener('parkedOrdersUpdated', handleParkedOrdersUpdate);
        return () => window.removeEventListener('parkedOrdersUpdated', handleParkedOrdersUpdate);
    }, [loadParkedOrders]);

    const saveToStorage = useCallback((orders: ParkedOrder[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('parkedOrdersUpdated'));
        } catch (error) {
            console.error("Error saving parked orders:", error);
            toast.error("Failed to save parked orders");
        }
    }, []);

    const parkOrder = useCallback((orderData: Omit<ParkedOrder, "id" | "timestamp">) => {
        // Check if we've reached the maximum number of parked orders
        if (parkedOrders.length >= MAX_PARKED_ORDERS) {
            toast.error(`Cannot park more than ${MAX_PARKED_ORDERS} orders. Please clear some parked orders first.`);
            return null;
        }

        const newParkedOrder: ParkedOrder = {
            ...orderData,
            id: `parked_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
        };

        const updatedOrders = [...parkedOrders, newParkedOrder];
        setParkedOrders(updatedOrders);
        saveToStorage(updatedOrders);

        toast.success(`Order parked successfully${orderData.customerName ? ` for ${orderData.customerName}` : ''}`, {
            description: `The order has been saved and can be restored later. (${updatedOrders.length}/${MAX_PARKED_ORDERS} parked)`,
            duration: 4000,
        });

        return newParkedOrder.id;
    }, [parkedOrders, saveToStorage]);

    const restoreOrder = useCallback((orderId: string) => {
        const order = parkedOrders.find(o => o.id === orderId);
        if (!order) {
            toast.error("Parked order not found");
            return null;
        }

        return order;
    }, [parkedOrders]);

    const removeParkedOrder = useCallback((orderId: string) => {
        const order = parkedOrders.find(o => o.id === orderId);
        if (!order) {
            toast.error("Parked order not found");
            return;
        }

        const updatedOrders = parkedOrders.filter(o => o.id !== orderId);
        setParkedOrders(updatedOrders);
        saveToStorage(updatedOrders);

        toast.success(`Parked order removed${order.customerName ? ` for ${order.customerName}` : ''}`, {
            duration: 3000,
        });
    }, [parkedOrders, saveToStorage]);

    const getOrderDuration = useCallback((order: ParkedOrder) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - order.timestamp.getTime()) / (1000 * 60));

        if (diffInMinutes < 60) {
            return `${diffInMinutes}m`;
        } else {
            const hours = Math.floor(diffInMinutes / 60);
            const minutes = diffInMinutes % 60;
            return `${hours}h ${minutes}m`;
        }
    }, []);

    const searchParkedOrders = useCallback((query: string) => {
        if (!query.trim()) return parkedOrders;

        const lowerQuery = query.toLowerCase();
        return parkedOrders.filter(order =>
            order.customerName?.toLowerCase().includes(lowerQuery) ||
            order.customerPhone?.includes(query) ||
            order.note?.toLowerCase().includes(lowerQuery)
        );
    }, [parkedOrders]);

    const clearAllParkedOrders = useCallback(() => {
        setParkedOrders([]);
        localStorage.removeItem(STORAGE_KEY);
        toast.success("All parked orders cleared");
    }, []);

    return {
        parkedOrders,
        isLoading,
        parkOrder,
        restoreOrder,
        removeParkedOrder,
        getOrderDuration,
        searchParkedOrders,
        clearAllParkedOrders,
        refreshParkedOrders: loadParkedOrders,
    };
}
