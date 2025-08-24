-- Insert sample pies if table is empty
-- This ensures we have test data to work with

INSERT INTO pies (type, name_ar, name_en, size, image_url, price_with_vat) 
VALUES 
  ('Akkawi Cheese', 'فطيرة جبنة العكاوي', 'Akkawi Cheese Pie', 'medium', 'https://via.placeholder.com/300x200/FFD700/000000?text=Akkawi+Cheese', 25.50),
  ('Halloumi Cheese', 'فطيرة جبنة الحلوم', 'Halloumi Cheese Pie', 'medium', 'https://via.placeholder.com/300x200/98FB98/000000?text=Halloumi+Cheese', 27.00),
  ('Cream Cheese', 'فطيرة الجبنة الكريمية', 'Cream Cheese Pie', 'large', 'https://via.placeholder.com/300x200/F0E68C/000000?text=Cream+Cheese', 29.75),
  ('Zaatar', 'فطيرة الزعتر', 'Zaatar Pie', 'medium', 'https://via.placeholder.com/300x200/8FBC8F/000000?text=Zaatar', 22.25),
  ('Labneh & Vegetables', 'فطيرة اللبنة والخضار', 'Labneh & Vegetables Pie', 'small', 'https://via.placeholder.com/300x200/90EE90/000000?text=Labneh+Vegetables', 24.50),
  ('Muhammara + Akkawi Cheese + Zaatar', 'فطيرة المحمرة مع العكاوي والزعتر', 'Muhammara + Akkawi Cheese + Zaatar Pie', 'large', 'https://via.placeholder.com/300x200/DC143C/FFFFFF?text=Muhammara+Mix', 35.00)
ON CONFLICT (id) DO NOTHING;
