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

// Modifier zod schema for use in item forms
export const ModifierSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['extra', 'without']),
  name: z.string().min(1, 'Modifier name is required'),
  price: z.number().min(0, 'Price must be 0 or positive'),
});
export type Modifier = z.infer<typeof ModifierSchema>;

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
  modifiers: z.array(ModifierSchema),
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
  modifiers: z.array(ModifierSchema),
});

export type CreatePizza = z.infer<typeof CreatePizzaSchema>;

// Update pizza schema
export const UpdatePizzaSchema = z.object({
  type: PizzaTypeEnum.optional(),
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  crust: PizzaCrustEnum.optional(),
  imageUrl: z.string().refine(
    (val) => val === '' || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL or empty' }
  ).optional(),
  extras: PizzaExtrasEnum.optional(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ).optional(),
  modifiers: z.array(ModifierSchema).optional(),
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
  modifiers: z.array(ModifierSchema),
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
  modifiers: z.array(ModifierSchema),
});

export type CreatePie = z.infer<typeof CreatePieSchema>;

// Update pie schema
export const UpdatePieSchema = z.object({
  type: PieTypeEnum.optional(),
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  size: PieSizeEnum.optional(),
  imageUrl: z.string().refine(
    (val) => val === '' || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL or empty' }
  ).optional(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ).optional(),
  modifiers: z.array(ModifierSchema).optional(),
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
  modifiers: z.array(ModifierSchema),
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
  modifiers: z.array(ModifierSchema),
});

export type CreateSandwich = z.infer<typeof CreateSandwichSchema>;

// Update sandwich schema
export const UpdateSandwichSchema = z.object({
  type: SandwichTypeEnum.optional(),
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  size: SandwichSizeEnum.optional(),
  imageUrl: z.string().refine(
    (val) => val === '' || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL or empty' }
  ).optional(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ).optional(),
  modifiers: z.array(ModifierSchema).optional(),
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
  modifiers: z.array(ModifierSchema),
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
  modifiers: z.array(ModifierSchema),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type MiniPie = z.infer<typeof MiniPieSchema>;


// Burger schema (type and size as string)
export const BurgerSchema = z.object({
  id: z.string().uuid(),
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  imageUrl: z.string().url('Valid image URL is required'),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ),
  modifiers: z.array(ModifierSchema),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type Burger = z.infer<typeof BurgerSchema>;

export const CreateBurgerSchema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
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
  modifiers: z.array(ModifierSchema),
});
export type CreateBurger = z.infer<typeof CreateBurgerSchema>;

export const UpdateBurgerSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  imageUrl: z.string().refine(
    (val) => val === '' || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL or empty' }
  ).optional(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ).optional(),
  modifiers: z.array(ModifierSchema).optional(),
});
export type UpdateBurger = z.infer<typeof UpdateBurgerSchema>;


// Beverage schema (type as string)
export const BeverageSchema = z.object({
  id: z.string().uuid(),
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  imageUrl: z.string().url('Valid image URL is required'),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ),
  modifiers: z.array(ModifierSchema),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type Beverage = z.infer<typeof BeverageSchema>;

export const CreateBeverageSchema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
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
  modifiers: z.array(ModifierSchema),
});
export type CreateBeverage = z.infer<typeof CreateBeverageSchema>;

export const UpdateBeverageSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  imageUrl: z.string().refine(
    (val) => val === '' || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL or empty' }
  ).optional(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ).optional(),
  modifiers: z.array(ModifierSchema).optional(),
});
export type UpdateBeverage = z.infer<typeof UpdateBeverageSchema>;


// Side Order schema (type as string)
export const SideOrderSchema = z.object({
  id: z.string().uuid(),
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  imageUrl: z.string().url('Valid image URL is required'),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ),
  modifiers: z.array(ModifierSchema),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type SideOrder = z.infer<typeof SideOrderSchema>;

export const CreateSideOrderSchema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
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
  modifiers: z.array(ModifierSchema),
});
export type CreateSideOrder = z.infer<typeof CreateSideOrderSchema>;

export const UpdateSideOrderSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  imageUrl: z.string().refine(
    (val) => val === '' || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL or empty' }
  ).optional(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ).optional(),
  modifiers: z.array(ModifierSchema).optional(),
});
export type UpdateSideOrder = z.infer<typeof UpdateSideOrderSchema>;


// Appetizer schema (type as string)
export const AppetizerSchema = z.object({
  id: z.string().uuid(),
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  imageUrl: z.string().url('Valid image URL is required'),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ),
  modifiers: z.array(ModifierSchema),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type Appetizer = z.infer<typeof AppetizerSchema>;

export const CreateAppetizerSchema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
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
  modifiers: z.array(ModifierSchema),
});
export type CreateAppetizer = z.infer<typeof CreateAppetizerSchema>;

export const UpdateAppetizerSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  imageUrl: z.string().refine(
    (val) => val === '' || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL or empty' }
  ).optional(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ).optional(),
  modifiers: z.array(ModifierSchema).optional(),
});
export type UpdateAppetizer = z.infer<typeof UpdateAppetizerSchema>;


// Shawarma schema (type and size as string)
export const ShawarmaSchema = z.object({
  id: z.string().uuid(),
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  imageUrl: z.string().url('Valid image URL is required'),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ),
  modifiers: z.array(ModifierSchema),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type Shawarma = z.infer<typeof ShawarmaSchema>;

export const CreateShawarmaSchema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
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
  modifiers: z.array(ModifierSchema),
});
export type CreateShawarma = z.infer<typeof CreateShawarmaSchema>;

export const UpdateShawarmaSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  imageUrl: z.string().refine(
    (val) => val === '' || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL or empty' }
  ).optional(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ).optional(),
  modifiers: z.array(ModifierSchema).optional(),
});
export type UpdateShawarma = z.infer<typeof UpdateShawarmaSchema>;

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
  modifiers: z.array(ModifierSchema),
});

export type CreateMiniPie = z.infer<typeof CreateMiniPieSchema>;

// Update mini pie schema
export const UpdateMiniPieSchema = z.object({
  type: MiniPieTypeEnum.optional(),
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  size: MiniPieSizeEnum.optional(),
  imageUrl: z.string().refine(
    (val) => val === '' || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL or empty' }
  ).optional(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ).optional(),
  modifiers: z.array(ModifierSchema).optional(),
});

export type UpdateMiniPie = z.infer<typeof UpdateMiniPieSchema>;

// EOD Report Schemas

// Payment method enum
export const PaymentMethodEnum = z.enum(['cash', 'card', 'mixed']);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

// Order status enum for reporting
export const OrderStatusEnum = z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']);
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

// Best selling item schema
export const BestSellingItemSchema = z.object({
  itemName: z.string(),
  itemType: z.enum(['pizza', 'pie', 'sandwich', 'mini-pie', 'beverage', 'appetizer', 'burger', 'shawerma', 'side-order']),
  quantity: z.number().int().min(0),
  totalRevenue: z.number().min(0),
  averagePrice: z.number().min(0),
});

export type BestSellingItem = z.infer<typeof BestSellingItemSchema>;

// Payment method breakdown schema
export const PaymentBreakdownSchema = z.object({
  method: PaymentMethodEnum,
  orderCount: z.number().int().min(0),
  totalAmount: z.number().min(0),
  percentage: z.number().min(0).max(100),
});

export type PaymentBreakdown = z.infer<typeof PaymentBreakdownSchema>;

// Hourly sales data schema
export const HourlySalesSchema = z.object({
  hour: z.number().int().min(0).max(23),
  orderCount: z.number().int().min(0),
  revenue: z.number().min(0),
});

export type HourlySales = z.infer<typeof HourlySalesSchema>;

// Main EOD Report Data schema
export const EODReportDataSchema = z.object({
  // Time period
  startDateTime: z.date(),
  endDateTime: z.date(),
  reportGeneratedAt: z.date(),

  // Core metrics (your requirements)
  totalCashOrders: z.number().min(0),
  totalCardOrders: z.number().min(0),
  totalWithVat: z.number().min(0),
  totalWithoutVat: z.number().min(0),
  totalCancelledOrders: z.number().int().min(0),
  totalOrders: z.number().int().min(0),

  // Additional order statistics
  completedOrders: z.number().int().min(0),
  pendingOrders: z.number().int().min(0),

  // Financial breakdown
  vatAmount: z.number().min(0),
  averageOrderValue: z.number().min(0),

  // Payment method breakdown
  paymentBreakdown: z.array(PaymentBreakdownSchema),

  // Performance metrics
  bestSellingItems: z.array(BestSellingItemSchema),
  peakHour: z.string().optional(),
  hourlySales: z.array(HourlySalesSchema),

  // Operational metrics
  orderCompletionRate: z.number().min(0).max(100),
  orderCancellationRate: z.number().min(0).max(100),

  // Comparison with previous period (optional)
  previousPeriodComparison: z.object({
    revenueChange: z.number().optional(),
    orderCountChange: z.number().optional(),
    averageOrderValueChange: z.number().optional(),
  }).optional(),
});

export type EODReportData = z.infer<typeof EODReportDataSchema>;

// EOD Report Request schema (for API)
export const EODReportRequestSchema = z.object({
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime(),
  saveToDatabase: z.boolean().default(false),
  includePreviousPeriodComparison: z.boolean().default(false),
});

export type EODReportRequest = z.infer<typeof EODReportRequestSchema>;

// Saved EOD Report schema (for database storage)
export const SavedEODReportSchema = z.object({
  id: z.string().uuid(),
  reportNumber: z.string().optional(), // EOD-0001, EOD-0002, etc.
  reportDate: z.date(),
  startDateTime: z.date(),
  endDateTime: z.date(),

  // All the metrics
  totalOrders: z.number().int().min(0),
  completedOrders: z.number().int().min(0),
  cancelledOrders: z.number().int().min(0),
  pendingOrders: z.number().int().min(0),

  totalRevenue: z.number().min(0),
  totalWithVat: z.number().min(0),
  totalWithoutVat: z.number().min(0),
  vatAmount: z.number().min(0),

  totalCashOrders: z.number().min(0),
  totalCardOrders: z.number().min(0),

  averageOrderValue: z.number().min(0),
  peakHour: z.string().optional(),
  orderCompletionRate: z.number().min(0).max(100),
  orderCancellationRate: z.number().min(0).max(100),

  // JSON fields for complex data
  paymentBreakdown: z.string(), // JSON string
  bestSellingItems: z.string(), // JSON string
  hourlySales: z.string(), // JSON string

  // Metadata
  generatedBy: z.string().uuid(),
  generatedAt: z.date(),
  reportType: z.enum(['daily', 'custom', 'weekly', 'monthly']).default('daily'),

  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SavedEODReport = z.infer<typeof SavedEODReportSchema>;

// EOD Report History Request schema
export const EODReportHistoryRequestSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  reportType: z.enum(['daily', 'custom', 'weekly', 'monthly']).optional(),
});

export type EODReportHistoryRequest = z.infer<typeof EODReportHistoryRequestSchema>;

// Quick preset periods schema
export const ReportPresetSchema = z.object({
  label: z.string(),
  value: z.enum(['today', 'yesterday', 'last-7-days', 'last-30-days', 'this-week', 'this-month', 'custom']),
  startDateTime: z.date(),
  endDateTime: z.date(),
});

export type ReportPreset = z.infer<typeof ReportPresetSchema>;
