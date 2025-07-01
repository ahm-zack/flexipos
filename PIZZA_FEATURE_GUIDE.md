# Pizza Feature Implementation Guide

This document provides a comprehensive overview of how we implemented the pizza feature in the POS dashboard system, from database schema to user interface components.

## Table of Contents

1. [Database Schema Design](#database-schema-design)
2. [Zod Validation Schemas](#zod-validation-schemas)
3. [Data Service Layer](#data-service-layer)
4. [React Query Hooks](#react-query-hooks)
5. [UI Components](#ui-components)
6. [Form Components](#form-components)
7. [Views and Pages](#views-and-pages)
8. [Image Upload Integration](#image-upload-integration)
9. [Cart Integration](#cart-integration)
10. [Skeleton Loading States](#skeleton-loading-states)

---

## 1. Database Schema Design

### Pizza Table Schema (`lib/db/schema.ts`)

We defined a comprehensive pizza table with the following structure:

```typescript
// Define pizza type enum
export const pizzaTypeEnum = pgEnum("pizza_type", [
  "Margherita",
  "Vegetable",
  "Pepperoni",
  "Mortadella",
  "Chicken",
]);

// Define pizza crust enum
export const pizzaCrustEnum = pgEnum("pizza_crust", ["original", "thin"]);

// Define pizza extras enum
export const pizzaExtrasEnum = pgEnum("pizza_extras", [
  "cheese",
  "vegetables",
  "Pepperoni",
  "Mortadella",
  "Chicken",
]);

// Pizza table schema
export const pizzas = pgTable("pizzas", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: pizzaTypeEnum("type").notNull(),
  nameAr: text("name_ar").notNull(), // Arabic name
  nameEn: text("name_en").notNull(), // English name
  crust: pizzaCrustEnum("crust"), // Optional crust type
  imageUrl: text("image_url").notNull(), // Image from Supabase storage
  extras: pizzaExtrasEnum("extras"), // Optional extras
  priceWithVat: decimal("price_with_vat", {
    precision: 10,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Type exports
export type Pizza = typeof pizzas.$inferSelect;
export type NewPizza = typeof pizzas.$inferInsert;
export type PizzaType = (typeof pizzaTypeEnum.enumValues)[number];
export type PizzaCrust = (typeof pizzaCrustEnum.enumValues)[number];
export type PizzaExtras = (typeof pizzaExtrasEnum.enumValues)[number];
```

### Key Design Decisions:

- **Bilingual Support**: Both Arabic (`nameAr`) and English (`nameEn`) names
- **Enums for Data Integrity**: Predefined values for type, crust, and extras
- **UUID Primary Key**: For better scalability and security
- **Decimal Precision**: 10,2 precision for accurate price handling
- **Timestamps**: Automatic creation and update tracking
- **Image URL**: Integration with Supabase storage

---

## 2. Zod Validation Schemas

### Form Validation Schema (`lib/schemas.ts`)

```typescript
import { z } from "zod";

export const createPizzaSchema = z.object({
  type: z.enum(
    ["Margherita", "Vegetable", "Pepperoni", "Mortadella", "Chicken"],
    {
      required_error: "Please select a pizza type",
    }
  ),
  nameAr: z.string().min(1, "Arabic name is required"),
  nameEn: z.string().min(1, "English name is required"),
  crust: z.enum(["original", "thin"]).optional(),
  extras: z
    .enum(["cheese", "vegetables", "Pepperoni", "Mortadella", "Chicken"])
    .optional(),
  priceWithVat: z
    .string()
    .min(1, "Price is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Price must be a valid positive number"
    ),
  image: z.instanceof(File).optional(),
});

export const editPizzaSchema = createPizzaSchema.extend({
  id: z.string().uuid("Invalid pizza ID"),
  imageUrl: z.string().optional(),
});

export type CreatePizzaFormData = z.infer<typeof createPizzaSchema>;
export type EditPizzaFormData = z.infer<typeof editPizzaSchema>;
```

### Validation Features:

- **Type-safe enums**: Match database enum values exactly
- **Required field validation**: Ensures essential data is provided
- **Price validation**: Checks for positive numeric values
- **File validation**: Optional image upload support
- **UUID validation**: For edit operations

---

## 3. Data Service Layer

### Pizza Service (`lib/pizza-service.ts`)

```typescript
import { db } from "@/lib/db";
import { pizzas, type Pizza, type NewPizza } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const pizzaService = {
  // Get all pizzas
  async getPizzas() {
    try {
      const data = await db.select().from(pizzas).orderBy(pizzas.createdAt);
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching pizzas:", error);
      return { success: false, error: "Failed to fetch pizzas" };
    }
  },

  // Create new pizza
  async createPizza(pizzaData: NewPizza) {
    try {
      const [newPizza] = await db.insert(pizzas).values(pizzaData).returning();
      return { success: true, data: newPizza };
    } catch (error) {
      console.error("Error creating pizza:", error);
      return { success: false, error: "Failed to create pizza" };
    }
  },

  // Update existing pizza
  async updatePizza(id: string, pizzaData: Partial<Pizza>) {
    try {
      const [updatedPizza] = await db
        .update(pizzas)
        .set({ ...pizzaData, updatedAt: new Date() })
        .where(eq(pizzas.id, id))
        .returning();
      return { success: true, data: updatedPizza };
    } catch (error) {
      console.error("Error updating pizza:", error);
      return { success: false, error: "Failed to update pizza" };
    }
  },

  // Delete pizza
  async deletePizza(id: string) {
    try {
      await db.delete(pizzas).where(eq(pizzas.id, id));
      return { success: true };
    } catch (error) {
      console.error("Error deleting pizza:", error);
      return { success: false, error: "Failed to delete pizza" };
    }
  },
};
```

---

## 4. React Query Hooks

### Custom Hooks (`modules/pizza-feature/hooks/use-pizzas.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pizzaService } from "@/lib/pizza-service";
import { toast } from "sonner";

// Fetch pizzas hook
export function usePizzas() {
  return useQuery({
    queryKey: ["pizzas", "list"],
    queryFn: async () => {
      const result = await pizzaService.getPizzas();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch pizzas");
      }
      return result.data;
    },
  });
}

// Create pizza hook
export function useCreatePizza() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pizzaService.createPizza,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pizzas"] });
      toast.success("Pizza created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create pizza");
    },
  });
}

// Update pizza hook
export function useUpdatePizza() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      pizzaService.updatePizza(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pizzas"] });
      toast.success("Pizza updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update pizza");
    },
  });
}

// Delete pizza hook
export function useDeletePizza() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pizzaService.deletePizza,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pizzas"] });
      toast.success("Pizza deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete pizza");
    },
  });
}
```

---

## 5. UI Components

### Pizza Card Component (`modules/pizza-feature/components/pizza-card.tsx`)

```typescript
interface PizzaCardProps {
  pizza: Pizza;
  onEdit?: (pizza: Pizza) => void;
  onDelete?: (pizza: Pizza) => void;
  showActions?: boolean;
  showCartActions?: boolean;
}

export function PizzaCard({
  pizza,
  onEdit,
  onDelete,
  showActions = true,
  showCartActions = true,
}: PizzaCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    const cartItem = {
      id: pizza.id,
      name: `${pizza.type} Pizza - ${pizza.nameAr} بيتزا`,
      price: parseFloat(pizza.priceWithVat),
      category: "Pizza",
      description: `${pizza.type} Pizza`,
    };

    try {
      addItem(cartItem);
      setTimeout(() => setIsAdding(false), 500);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-200">
      {/* Pizza Image */}
      <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 flex items-center justify-center relative">
        {pizza.imageUrl && !imageError ? (
          <Image
            src={pizza.imageUrl}
            alt={pizza.nameEn}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-6xl">🍕</div>
        )}
      </div>

      {/* Pizza Details */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Bilingual Title */}
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {pizza.type} Pizza
            </h3>
            <p className="text-lg text-muted-foreground mt-1">
              {pizza.nameAr} بيتزا
            </p>
          </div>

          {/* Price Display */}
          <div className="text-2xl font-bold">
            <PriceDisplay
              price={parseFloat(pizza.priceWithVat)}
              symbolSize={18}
              variant="primary"
              className="text-2xl font-bold"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {showActions && (
              <>
                {onEdit && (
                  <Button
                    onClick={() => onEdit(pizza)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    onClick={() => onDelete(pizza)}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
              </>
            )}

            {showCartActions && (
              <Button onClick={handleAddToCart} disabled={isAdding}>
                <Plus className="h-4 w-4" />
                {isAdding ? "Adding..." : "Add to Cart"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Key Features:

- **Bilingual Display**: Shows both English and Arabic names
- **Image Handling**: Fallback to emoji if image fails to load
- **Action Flexibility**: Configurable edit/delete/cart actions
- **Cart Integration**: Adds items with bilingual names
- **Loading States**: Visual feedback during cart operations

---

## 6. Form Components

### Create Pizza Form (`modules/pizza-feature/components/create-pizza-form.tsx`)

```typescript
export function CreatePizzaForm({ onSuccess }: CreatePizzaFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CreatePizzaFormData>({
    resolver: zodResolver(createPizzaSchema),
    defaultValues: {
      type: undefined,
      nameAr: "",
      nameEn: "",
      crust: undefined,
      extras: undefined,
      priceWithVat: "",
    },
  });

  const createPizzaMutation = useCreatePizza();

  const onSubmit = async (values: CreatePizzaFormData) => {
    let imageUrl = "";

    // Handle image upload
    if (imageFile) {
      setIsUploading(true);
      try {
        const uploadResult = await uploadImage(imageFile, "pizzas");
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url;
        } else {
          toast.error("Failed to upload image");
          setIsUploading(false);
          return;
        }
      } catch (error) {
        toast.error("Error uploading image");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    // Create pizza data
    const pizzaData = {
      type: values.type,
      nameAr: values.nameAr,
      nameEn: values.nameEn,
      crust: values.crust || null,
      extras: values.extras || null,
      priceWithVat: values.priceWithVat,
      imageUrl,
    };

    createPizzaMutation.mutate(pizzaData, {
      onSuccess: () => {
        form.reset();
        setImageFile(null);
        setImagePreview(null);
        onSuccess?.();
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Image Upload Section */}
        <div className="space-y-4">
          <Label>Pizza Image</Label>
          <div className="flex flex-col space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground"
            />
            {imagePreview && (
              <div className="relative w-32 h-32 rounded-md overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pizza Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pizza type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Margherita">Margherita</SelectItem>
                  <SelectItem value="Vegetable">Vegetable</SelectItem>
                  <SelectItem value="Pepperoni">Pepperoni</SelectItem>
                  <SelectItem value="Mortadella">Mortadella</SelectItem>
                  <SelectItem value="Chicken">Chicken</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bilingual Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>English Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter English name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nameAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arabic Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ادخل الاسم بالعربية"
                    {...field}
                    dir="rtl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="crust"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Crust Type (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crust type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="original">Original</SelectItem>
                    <SelectItem value="thin">Thin</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="extras"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Extras (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select extras" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cheese">Extra Cheese</SelectItem>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="Pepperoni">Pepperoni</SelectItem>
                    <SelectItem value="Mortadella">Mortadella</SelectItem>
                    <SelectItem value="Chicken">Chicken</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Price Field */}
        <FormField
          control={form.control}
          name="priceWithVat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (with VAT)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={createPizzaMutation.isPending || isUploading}
        >
          {isUploading
            ? "Uploading Image..."
            : createPizzaMutation.isPending
            ? "Creating Pizza..."
            : "Create Pizza"}
        </Button>
      </form>
    </Form>
  );
}
```

---

## 7. Views and Pages

### Cashier View (`modules/pizza-feature/components/pizza-cashier-view.tsx`)

```typescript
export function PizzaCashierView() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: pizzas, isLoading, error } = usePizzas();

  // Filter pizzas based on search term
  const filteredPizzas =
    pizzas?.filter(
      (pizza) =>
        pizza.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pizza.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pizza.type.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-center">🍕 Pizza Menu</h1>
          <p className="text-muted-foreground text-center mb-6">
            Discover our delicious pizza selection
          </p>

          {/* Search Bar */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pizzas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Pizza Grid with Skeleton Loading */}
        {isLoading ? (
          <PizzaGridSkeleton count={6} />
        ) : (
          <PizzaGrid
            pizzas={filteredPizzas}
            showActions={false}
            showCartActions={true}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
```

### Management View (`modules/pizza-feature/components/pizza-management-view.tsx`)

```typescript
export function PizzaManagementView() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPizza, setEditingPizza] = useState<Pizza | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: pizzas, isLoading, error } = usePizzas();
  const deletePizzaMutation = useDeletePizza();

  const handleEdit = (pizza: Pizza) => {
    setEditingPizza(pizza);
  };

  const handleDelete = (pizza: Pizza) => {
    if (confirm(`Are you sure you want to delete ${pizza.type} Pizza?`)) {
      deletePizzaMutation.mutate(pizza.id);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">🍕 Pizza Management</h1>
            <p className="text-muted-foreground">
              Manage your pizza menu items
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Pizza
          </Button>
        </div>

        {/* Search and Grid */}
        <div className="mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pizzas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Pizza Grid */}
        <PizzaGrid
          pizzas={filteredPizzas}
          showActions={true}
          showCartActions={false}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Pizza</DialogTitle>
            </DialogHeader>
            <CreatePizzaForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog
          open={!!editingPizza}
          onOpenChange={() => setEditingPizza(null)}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Pizza</DialogTitle>
            </DialogHeader>
            {editingPizza && (
              <EditPizzaForm
                pizza={editingPizza}
                onSuccess={() => setEditingPizza(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
```

---

## 8. Image Upload Integration

### Image Upload Utility (`lib/image-upload.ts`)

```typescript
import { createClient } from "@/utils/supabase/client";

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadImage(
  file: File,
  folder: string = "menu-items"
): Promise<UploadResult> {
  try {
    const supabase = createClient();

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("menu-items-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("menu-items-images").getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: "Failed to upload image",
    };
  }
}
```

### Supabase Storage Configuration

Storage bucket setup with RLS policies:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-items-images', 'menu-items-images', true);

-- Allow public read access
CREATE POLICY "Public read access for menu images" ON storage.objects
FOR SELECT USING (bucket_id = 'menu-items-images');

-- Allow authenticated uploads
CREATE POLICY "Authenticated users can upload menu images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'menu-items-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated updates
CREATE POLICY "Authenticated users can update menu images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'menu-items-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated deletes
CREATE POLICY "Authenticated users can delete menu images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'menu-items-images'
  AND auth.role() = 'authenticated'
);
```

---

## 9. Cart Integration

### Cart Integration in Pizza Card

```typescript
const handleAddToCart = async () => {
  setIsAdding(true);

  const cartItem: Omit<CartItem, "quantity"> = {
    id: pizza.id,
    name: `${pizza.type} Pizza - ${pizza.nameAr} بيتزا`, // Bilingual name
    price: parseFloat(pizza.priceWithVat),
    category: "Pizza",
    description: `${pizza.type} Pizza`,
  };

  try {
    addItem(cartItem);
    setTimeout(() => setIsAdding(false), 500);
  } catch (error) {
    console.error("Error adding to cart:", error);
    setIsAdding(false);
  }
};
```

### Key Features:

- **Bilingual Cart Items**: Shows both English and Arabic names
- **Price Conversion**: Converts decimal string to number
- **Loading States**: Visual feedback during add operations
- **Error Handling**: Graceful error handling

---

## 10. Skeleton Loading States

### Pizza Skeleton Components (`components/ui/pizza-skeleton.tsx`)

```typescript
export function PizzaCardSkeleton() {
  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content skeleton */}
      <div className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <Skeleton className="h-8 w-1/3" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PizzaGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PizzaCardSkeleton key={index} />
      ))}
    </div>
  );
}
```

---

## Architecture Summary

### File Structure

```
modules/pizza-feature/
├── components/
│   ├── pizza-card.tsx
│   ├── pizza-grid.tsx
│   ├── pizza-cashier-view.tsx
│   ├── pizza-management-view.tsx
│   ├── create-pizza-form.tsx
│   └── edit-pizza-form.tsx
├── hooks/
│   └── use-pizzas.ts
└── index.ts

lib/
├── db/
│   └── schema.ts
├── pizza-service.ts
├── image-upload.ts
└── schemas.ts

components/ui/
└── pizza-skeleton.tsx

app/admin/menu/pizza/
└── page.tsx
```

### Key Technologies Used

- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas
- **State Management**: React Query (TanStack Query)
- **UI Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui
- **Image Storage**: Supabase Storage
- **Form Handling**: React Hook Form

### Features Implemented

- ✅ Bilingual support (English/Arabic)
- ✅ Image upload with Supabase Storage
- ✅ Real-time data with React Query
- ✅ Form validation with Zod
- ✅ Responsive design
- ✅ Search functionality
- ✅ Cart integration
- ✅ Role-based views (Cashier vs Management)
- ✅ Loading states with skeletons
- ✅ Error handling
- ✅ CRUD operations

This comprehensive implementation provides a robust, scalable pizza management system with modern web development practices.
