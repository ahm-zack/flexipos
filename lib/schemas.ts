import { z } from 'zod';

// Simple role enum
export const AppRoleEnum = z.enum(['superadmin', 'admin', 'manager', 'cashier', 'kitchen']);
export type AppRole = z.infer<typeof AppRoleEnum>;

// Simple User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: AppRoleEnum,
  created_at: z.string(),
  updated_at: z.string(),
});

export type User = z.infer<typeof UserSchema>;

// Create user schema
export const CreateUserSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email(),
  name: z.string().min(1, 'Name is required'),
  role: AppRoleEnum,
});

export type CreateUser = z.infer<typeof CreateUserSchema>;

// Update user schema
export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  role: AppRoleEnum.optional(),
});

export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// Pizza enums
export const PizzaTypeEnum = z.enum(['Margherita', 'Vegetable', 'Pepperoni', 'Mortadella', 'Chicken']);
export const PizzaCrustEnum = z.enum(['original', 'thin']);
export const PizzaExtrasEnum = z.enum(['cheese', 'vegetables', 'Pepperoni', 'Mortadella', 'Chicken']);

export type PizzaType = z.infer<typeof PizzaTypeEnum>;
export type PizzaCrust = z.infer<typeof PizzaCrustEnum>;
export type PizzaExtras = z.infer<typeof PizzaExtrasEnum>;

// Pizza schema
export const PizzaSchema = z.object({
  id: z.string().uuid(),
  type: PizzaTypeEnum,
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  crust: PizzaCrustEnum.nullable(),
  imageUrl: z.string().url('Valid image URL is required'),
  extras: PizzaExtrasEnum.nullable(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type Pizza = z.infer<typeof PizzaSchema>;

// Create pizza schema
export const CreatePizzaSchema = z.object({
  type: PizzaTypeEnum,
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  crust: PizzaCrustEnum.optional(),
  imageUrl: z.string().refine(
    (val) => val === '' || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL or empty' }
  ),
  extras: PizzaExtrasEnum.optional(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ),
});

export type CreatePizza = z.infer<typeof CreatePizzaSchema>;

// Update pizza schema
export const UpdatePizzaSchema = z.object({
  type: PizzaTypeEnum.optional(),
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  crust: PizzaCrustEnum.optional(),
  imageUrl: z.string().url().optional(),
  extras: PizzaExtrasEnum.optional(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ).optional(),
});

export type UpdatePizza = z.infer<typeof UpdatePizzaSchema>;

// Pie enums
export const PieTypeEnum = z.enum([
  'Akkawi Cheese',
  'Halloumi Cheese', 
  'Cream Cheese',
  'Zaatar',
  'Labneh & Vegetables',
  'Muhammara + Akkawi Cheese + Zaatar',
  'Akkawi Cheese + Zaatar',
  'Labneh + Zaatar',
  'Halloumi Cheese + Zaatar',
  'Sweet Cheese + Akkawi + Mozzarella'
]);
export const PieSizeEnum = z.enum(['small', 'medium', 'large']);

export type PieType = z.infer<typeof PieTypeEnum>;
export type PieSize = z.infer<typeof PieSizeEnum>;

// Pie schema
export const PieSchema = z.object({
  id: z.string().uuid(),
  type: PieTypeEnum,
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  size: PieSizeEnum,
  imageUrl: z.string().url('Valid image URL is required'),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type Pie = z.infer<typeof PieSchema>;

// Create pie schema
export const CreatePieSchema = z.object({
  type: PieTypeEnum,
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  size: PieSizeEnum,
  imageUrl: z.string().refine(
    (val) => val === '' || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL or empty' }
  ),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ),
});

export type CreatePie = z.infer<typeof CreatePieSchema>;

// Update pie schema
export const UpdatePieSchema = z.object({
  type: PieTypeEnum.optional(),
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  size: PieSizeEnum.optional(),
  imageUrl: z.string().url().optional(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ).optional(),
});

export type UpdatePie = z.infer<typeof UpdatePieSchema>;

// Form validation schemas for pie forms
export const createPieFormSchema = z.object({
  type: z.enum([
    'Akkawi Cheese',
    'Halloumi Cheese', 
    'Cream Cheese',
    'Zaatar',
    'Labneh & Vegetables',
    'Muhammara + Akkawi Cheese + Zaatar',
    'Akkawi Cheese + Zaatar',
    'Labneh + Zaatar',
    'Halloumi Cheese + Zaatar',
    'Sweet Cheese + Akkawi + Mozzarella'
  ], {
    required_error: "Please select a pie type",
  }),
  nameAr: z.string().min(1, "Arabic name is required"),
  nameEn: z.string().min(1, "English name is required"),
  size: z.enum(['small', 'medium', 'large'], {
    required_error: "Please select a pie size",
  }),
  priceWithVat: z.string().min(1, "Price is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Price must be a valid positive number"
  ),
  image: z.instanceof(File).optional(),
});

export const editPieFormSchema = createPieFormSchema.extend({
  id: z.string().uuid("Invalid pie ID"),
  imageUrl: z.string().optional(),
});

export type CreatePieFormData = z.infer<typeof createPieFormSchema>;
export type EditPieFormData = z.infer<typeof editPieFormSchema>;

// Sandwich enums
export const SandwichTypeEnum = z.enum([
  'Beef Sandwich with Cheese',
  'Chicken Sandwich with Cheese', 
  'Muhammara Sandwich with Cheese'
]);
export const SandwichSizeEnum = z.enum(['small', 'medium', 'large']);

export type SandwichType = z.infer<typeof SandwichTypeEnum>;
export type SandwichSize = z.infer<typeof SandwichSizeEnum>;

// Sandwich schema
export const SandwichSchema = z.object({
  id: z.string().uuid(),
  type: SandwichTypeEnum,
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  size: SandwichSizeEnum,
  imageUrl: z.string().url('Valid image URL is required'),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type Sandwich = z.infer<typeof SandwichSchema>;

// Create sandwich schema
export const CreateSandwichSchema = z.object({
  type: SandwichTypeEnum,
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  size: SandwichSizeEnum,
  imageUrl: z.string().refine(
    (val) => val === '' || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL or empty' }
  ),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ),
});

export type CreateSandwich = z.infer<typeof CreateSandwichSchema>;

// Update sandwich schema
export const UpdateSandwichSchema = z.object({
  type: SandwichTypeEnum.optional(),
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  size: SandwichSizeEnum.optional(),
  imageUrl: z.string().url().optional(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ).optional(),
});

export type UpdateSandwich = z.infer<typeof UpdateSandwichSchema>;

// Form validation schemas for sandwich forms
export const createSandwichFormSchema = z.object({
  type: z.enum([
    'Beef Sandwich with Cheese',
    'Chicken Sandwich with Cheese', 
    'Muhammara Sandwich with Cheese'
  ], {
    required_error: "Please select a sandwich type",
  }),
  nameAr: z.string().min(1, "Arabic name is required"),
  nameEn: z.string().min(1, "English name is required"),
  size: z.enum(['small', 'medium', 'large'], {
    required_error: "Please select a sandwich size",
  }),
  priceWithVat: z.string().min(1, "Price is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Price must be a valid positive number"
  ),
  image: z.instanceof(File).optional(),
});

export const editSandwichFormSchema = createSandwichFormSchema.extend({
  id: z.string().uuid("Invalid sandwich ID"),
  imageUrl: z.string().optional(),
});

export type CreateSandwichFormData = z.infer<typeof createSandwichFormSchema>;
export type EditSandwichFormData = z.infer<typeof editSandwichFormSchema>;

// Mini Pie enums
export const MiniPieTypeEnum = z.enum([
  'Mini Zaatar Pie',
  'Mini Cheese Pie',
  'Mini Spinach Pie',
  'Mini Meat Pie (Ba\'lakiya style)',
  'Mini Halloumi Cheese Pie', 
  'Mini Hot Dog Pie',
  'Mini Pizza Pie'
]);
export const MiniPieSizeEnum = z.enum(['small', 'medium', 'large']);

export type MiniPieType = z.infer<typeof MiniPieTypeEnum>;
export type MiniPieSize = z.infer<typeof MiniPieSizeEnum>;

// Mini Pie schema
export const MiniPieSchema = z.object({
  id: z.string().uuid(),
  type: MiniPieTypeEnum,
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  size: MiniPieSizeEnum,
  imageUrl: z.string().url('Valid image URL is required'),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type MiniPie = z.infer<typeof MiniPieSchema>;

// Create mini pie schema
export const CreateMiniPieSchema = z.object({
  type: MiniPieTypeEnum,
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  size: MiniPieSizeEnum,
  imageUrl: z.string().refine(
    (val) => val === '' || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL or empty' }
  ),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ),
});

export type CreateMiniPie = z.infer<typeof CreateMiniPieSchema>;

// Update mini pie schema
export const UpdateMiniPieSchema = z.object({
  type: MiniPieTypeEnum.optional(),
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  size: MiniPieSizeEnum.optional(),
  imageUrl: z.string().url().optional(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ).optional(),
});

export type UpdateMiniPie = z.infer<typeof UpdateMiniPieSchema>;

// Form validation schemas for mini pie forms
export const createMiniPieFormSchema = z.object({
  type: z.enum([
    'Mini Zaatar Pie',
    'Mini Cheese Pie',
    'Mini Spinach Pie',
    'Mini Meat Pie (Ba\'lakiya style)',
    'Mini Halloumi Cheese Pie', 
    'Mini Hot Dog Pie',
    'Mini Pizza Pie'
  ], {
    required_error: "Please select a mini pie type",
  }),
  nameAr: z.string().min(1, "Arabic name is required"),
  nameEn: z.string().min(1, "English name is required"),
  size: z.enum(['small', 'medium', 'large'], {
    required_error: "Please select a mini pie size",
  }),
  priceWithVat: z.string().min(1, "Price is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Price must be a valid positive number"
  ),
  imageUrl: z.string().refine(
    (val) => val === '' || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL or empty' }
  ),
});

export const editMiniPieFormSchema = createMiniPieFormSchema.extend({
  id: z.string().uuid("Invalid mini pie ID"),
});

export type CreateMiniPieFormData = z.infer<typeof createMiniPieFormSchema>;
export type EditMiniPieFormData = z.infer<typeof editMiniPieFormSchema>;
