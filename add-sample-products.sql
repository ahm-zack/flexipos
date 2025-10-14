-- Add more products to existing categories in FlexiPOS

-- Appetizers
INSERT INTO products (business_id, category_id, name, description, price, is_active) VALUES 
('b1234567-89ab-cdef-0123-456789abcdef', '4d3db305-83a9-4fa9-b70f-5af29b82a660', 'Hummus & Pita', 'Creamy hummus served with warm pita bread', 12.00, true),
('b1234567-89ab-cdef-0123-456789abcdef', '4d3db305-83a9-4fa9-b70f-5af29b82a660', 'Buffalo Wings', 'Spicy buffalo chicken wings with blue cheese dip', 18.50, true),
('b1234567-89ab-cdef-0123-456789abcdef', '4d3db305-83a9-4fa9-b70f-5af29b82a660', 'Mozzarella Sticks', 'Golden fried mozzarella with marinara sauce', 14.00, true),
('b1234567-89ab-cdef-0123-456789abcdef', '4d3db305-83a9-4fa9-b70f-5af29b82a660', 'Nachos Supreme', 'Crispy tortilla chips with cheese, jalapeños, and salsa', 16.50, true),
('b1234567-89ab-cdef-0123-456789abcdef', '4d3db305-83a9-4fa9-b70f-5af29b82a660', 'Onion Rings', 'Crispy beer-battered onion rings', 9.50, true);

-- More Beverages
INSERT INTO products (business_id, category_id, name, description, price, is_available, preparation_time, display_order) VALUES 
('b1234567-89ab-cdef-0123-456789abcdef', '6e84aa51-370d-4eaa-8dc8-1538fb638255', 'Fresh Lemon Mint Juice', 'Refreshing lemon and mint juice', 7.50, true, 3, 1),
('b1234567-89ab-cdef-0123-456789abcdef', '6e84aa51-370d-4eaa-8dc8-1538fb638255', 'Iced Tea', 'Cold brewed iced tea with lemon', 5.00, true, 2, 2),
('b1234567-89ab-cdef-0123-456789abcdef', '6e84aa51-370d-4eaa-8dc8-1538fb638255', 'Turkish Tea', 'Traditional Turkish black tea', 4.50, true, 5, 3),
('b1234567-89ab-cdef-0123-456789abcdef', '6e84aa51-370d-4eaa-8dc8-1538fb638255', 'Cappuccino', 'Rich espresso with steamed milk foam', 8.00, true, 4, 4),
('b1234567-89ab-cdef-0123-456789abcdef', '6e84aa51-370d-4eaa-8dc8-1538fb638255', 'Smoothie Bowl', 'Mixed berry smoothie with granola topping', 15.00, true, 6, 5);

-- More Burgers
INSERT INTO products (business_id, category_id, name, description, price, is_available, preparation_time, display_order) VALUES 
('b1234567-89ab-cdef-0123-456789abcdef', 'bcf62e58-0027-432f-9ee5-4a4aa7db3e05', 'BBQ Bacon Burger', 'Beef patty with bacon, BBQ sauce, and onion rings', 19.50, true, 18, 1),
('b1234567-89ab-cdef-0123-456789abcdef', 'bcf62e58-0027-432f-9ee5-4a4aa7db3e05', 'Mushroom Swiss Burger', 'Beef patty with sautéed mushrooms and Swiss cheese', 17.50, true, 15, 2),
('b1234567-89ab-cdef-0123-456789abcdef', 'bcf62e58-0027-432f-9ee5-4a4aa7db3e05', 'Veggie Burger', 'Plant-based patty with avocado and sprouts', 15.00, true, 12, 3),
('b1234567-89ab-cdef-0123-456789abcdef', 'bcf62e58-0027-432f-9ee5-4a4aa7db3e05', 'Double Cheese Burger', 'Two beef patties with double cheese', 22.00, true, 20, 4);

-- Desserts
INSERT INTO products (business_id, category_id, name, description, price, is_available, preparation_time, display_order) VALUES 
('b1234567-89ab-cdef-0123-456789abcdef', '8b0a54e3-07dd-441e-8f57-f8f2507612bd', 'Chocolate Brownie', 'Warm chocolate brownie with vanilla ice cream', 12.50, true, 5, 1),
('b1234567-89ab-cdef-0123-456789abcdef', '8b0a54e3-07dd-441e-8f57-f8f2507612bd', 'Cheesecake', 'New York style cheesecake with berry sauce', 14.00, true, 3, 2),
('b1234567-89ab-cdef-0123-456789abcdef', '8b0a54e3-07dd-441e-8f57-f8f2507612bd', 'Tiramisu', 'Classic Italian tiramisu', 13.50, true, 5, 3),
('b1234567-89ab-cdef-0123-456789abcdef', '8b0a54e3-07dd-441e-8f57-f8f2507612bd', 'Ice Cream Sundae', 'Three scoops with chocolate sauce and nuts', 11.00, true, 3, 4);

-- Mini Pies
INSERT INTO products (business_id, category_id, name, description, price, is_available, preparation_time, display_order) VALUES 
('b1234567-89ab-cdef-0123-456789abcdef', '0682f659-f64c-4466-995a-74ba9abaabe3', 'Mini Cheese Pie', 'Small cheese-filled pastry', 3.50, true, 8, 1),
('b1234567-89ab-cdef-0123-456789abcdef', '0682f659-f64c-4466-995a-74ba9abaabe3', 'Mini Spinach Pie', 'Spinach and feta in flaky pastry', 4.00, true, 8, 2),
('b1234567-89ab-cdef-0123-456789abcdef', '0682f659-f64c-4466-995a-74ba9abaabe3', 'Mini Meat Pie', 'Seasoned ground meat pie', 4.50, true, 10, 3),
('b1234567-89ab-cdef-0123-456789abcdef', '0682f659-f64c-4466-995a-74ba9abaabe3', 'Mini Zaatar Pie', 'Traditional zaatar and olive oil pie', 3.00, true, 6, 4);

-- Regular Pies
INSERT INTO products (business_id, category_id, name, description, price, is_available, preparation_time, display_order) VALUES 
('b1234567-89ab-cdef-0123-456789abcdef', 'b15f2840-c22c-4dac-8015-cd271a2489a2', 'Cheese Pie', 'Large cheese-filled pastry', 8.50, true, 12, 1),
('b1234567-89ab-cdef-0123-456789abcdef', 'b15f2840-c22c-4dac-8015-cd271a2489a2', 'Spinach & Feta Pie', 'Fresh spinach with feta cheese', 9.00, true, 12, 2),
('b1234567-89ab-cdef-0123-456789abcdef', 'b15f2840-c22c-4dac-8015-cd271a2489a2', 'Meat Pie', 'Spiced ground meat pie', 10.50, true, 15, 3),
('b1234567-89ab-cdef-0123-456789abcdef', 'b15f2840-c22c-4dac-8015-cd271a2489a2', 'Mixed Cheese Pie', 'Three cheese blend pie', 9.50, true, 12, 4);

-- More Pizzas
INSERT INTO products (business_id, category_id, name, description, price, is_available, preparation_time, display_order) VALUES 
('b1234567-89ab-cdef-0123-456789abcdef', '1abe7291-0ad5-42b8-95c2-64b70d313fc8', 'Hawaiian Pizza', 'Ham, pineapple, and cheese', 20.50, true, 15, 1),
('b1234567-89ab-cdef-0123-456789abcdef', '1abe7291-0ad5-42b8-95c2-64b70d313fc8', 'Vegetarian Pizza', 'Mixed vegetables and cheese', 19.00, true, 15, 2),
('b1234567-89ab-cdef-0123-456789abcdef', '1abe7291-0ad5-42b8-95c2-64b70d313fc8', 'Meat Lovers Pizza', 'Pepperoni, sausage, ham, and bacon', 25.00, true, 18, 3),
('b1234567-89ab-cdef-0123-456789abcdef', '1abe7291-0ad5-42b8-95c2-64b70d313fc8', 'BBQ Chicken Pizza', 'BBQ sauce, chicken, and onions', 23.50, true, 16, 4);

-- Sandwiches
INSERT INTO products (business_id, category_id, name, description, price, is_available, preparation_time, display_order) VALUES 
('b1234567-89ab-cdef-0123-456789abcdef', 'f9447001-05d9-4283-97d8-53f1ec046743', 'Club Sandwich', 'Turkey, bacon, lettuce, tomato on toasted bread', 13.50, true, 10, 1),
('b1234567-89ab-cdef-0123-456789abcdef', 'f9447001-05d9-4283-97d8-53f1ec046743', 'Grilled Chicken Sandwich', 'Grilled chicken breast with mayo and veggies', 12.00, true, 12, 2),
('b1234567-89ab-cdef-0123-456789abcdef', 'f9447001-05d9-4283-97d8-53f1ec046743', 'Tuna Melt', 'Tuna salad with melted cheese', 11.50, true, 8, 3),
('b1234567-89ab-cdef-0123-456789abcdef', 'f9447001-05d9-4283-97d8-53f1ec046743', 'Philly Cheesesteak', 'Sliced beef with peppers and cheese', 15.50, true, 12, 4);

-- Sides
INSERT INTO products (business_id, category_id, name, description, price, is_available, preparation_time, display_order) VALUES 
('b1234567-89ab-cdef-0123-456789abcdef', '60dc9829-7b45-4f4a-8dff-c74bbca333be', 'French Fries', 'Crispy golden french fries', 6.50, true, 6, 1),
('b1234567-89ab-cdef-0123-456789abcdef', '60dc9829-7b45-4f4a-8dff-c74bbca333be', 'Sweet Potato Fries', 'Baked sweet potato fries', 7.50, true, 8, 2),
('b1234567-89ab-cdef-0123-456789abcdef', '60dc9829-7b45-4f4a-8dff-c74bbca333be', 'Coleslaw', 'Fresh cabbage and carrot slaw', 4.50, true, 2, 3),
('b1234567-89ab-cdef-0123-456789abcdef', '60dc9829-7b45-4f4a-8dff-c74bbca333be', 'Garden Salad', 'Mixed greens with tomatoes and cucumber', 8.00, true, 5, 4),
('b1234567-89ab-cdef-0123-456789abcdef', '60dc9829-7b45-4f4a-8dff-c74bbca333be', 'Garlic Bread', 'Toasted bread with garlic butter', 5.50, true, 5, 5);