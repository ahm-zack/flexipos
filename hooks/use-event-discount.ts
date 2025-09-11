import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EventDiscountState {
    // Event discount settings
    isActive: boolean;
    discountPercentage: number;
    eventName: string;
    activatedBy: string | null;
    activatedAt: string | null;

    // Actions
    activateEventDiscount: (percentage: number, eventName: string, activatedBy: string) => void;
    deactivateEventDiscount: () => void;
    updateDiscountPercentage: (percentage: number) => void;

    // Convenience methods
    activate: () => void;
    deactivate: () => void;
    updateDiscount: (percentage: number, eventName: string) => void;
}

export const useEventDiscountStore = create<EventDiscountState>()(
    persist(
        (set, get) => ({
            // Initial state
            isActive: false,
            discountPercentage: 0,
            eventName: '',
            activatedBy: null,
            activatedAt: null,

            // Activate event discount
            activateEventDiscount: (percentage: number, eventName: string, activatedBy: string) => {
                set({
                    isActive: true,
                    discountPercentage: Math.max(0, Math.min(100, percentage)), // Clamp between 0-100
                    eventName: eventName.trim() || 'Special Event',
                    activatedBy,
                    activatedAt: new Date().toISOString(),
                });
            },

            // Deactivate event discount
            deactivateEventDiscount: () => {
                set({
                    isActive: false,
                    discountPercentage: 0,
                    eventName: '',
                    activatedBy: null,
                    activatedAt: null,
                });
            },

            // Update discount percentage while active
            updateDiscountPercentage: (percentage: number) => {
                const state = get();
                if (state.isActive) {
                    set({
                        discountPercentage: Math.max(0, Math.min(100, percentage)), // Clamp between 0-100
                    });
                }
            },

            // Convenience methods for admin interface
            activate: () => {
                const state = get();
                if (state.eventName && state.discountPercentage > 0) {
                    set({
                        isActive: true,
                        activatedBy: 'admin',
                        activatedAt: new Date().toISOString(),
                    });
                }
            },

            deactivate: () => {
                set({
                    isActive: false,
                    activatedBy: null,
                    activatedAt: null,
                });
            },

            updateDiscount: (percentage: number, eventName: string) => {
                set({
                    discountPercentage: Math.max(0, Math.min(100, percentage)),
                    eventName: eventName.trim() || 'Special Event',
                });
            },
        }),
        {
            name: 'event-discount-store', // LocalStorage key
            // Only persist when discount is active to avoid stale data
            partialize: (state) => state.isActive ? state : {
                isActive: false,
                discountPercentage: 0,
                eventName: '',
                activatedBy: null,
                activatedAt: null
            },
        }
    )
);
