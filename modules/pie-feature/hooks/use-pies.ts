import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Pie } from "@/lib/db/schema";
import type { UpdatePie } from "@/lib/schemas";

// Fetch pies hook
export function usePies() {
  return useQuery<Pie[]>({
    queryKey: ["pies", "list"],
    queryFn: async () => {
      const response = await fetch("/api/pies");
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch pies");
      }
      
      return result.data || [];
    },
  });
}

// Create pie hook
export function useCreatePie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pieData: {
      type: string;
      nameAr: string;
      nameEn: string;
      size: string;
      imageUrl?: string;
      priceWithVat: string | number;
    }): Promise<Pie> => {
      const response = await fetch("/api/pies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pieData),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create pie");
      }
      
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pies"] });
      toast.success("Pie created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create pie");
    },
  });
}

// Update pie hook
export function useUpdatePie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePie }): Promise<Pie> => {
      const response = await fetch(`/api/pies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update pie");
      }
      
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pies"] });
      toast.success("Pie updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update pie");
    },
  });
}

// Delete pie hook
export function useDeletePie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/pies/${id}`, {
        method: "DELETE",
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete pie");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pies"] });
      toast.success("Pie deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete pie");
    },
  });
}
