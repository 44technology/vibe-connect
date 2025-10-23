/*
  # Price Comparison App Schema

  ## Overview
  This migration creates the complete database schema for a price comparison mobile app
  that allows users to scan receipts, track product prices across stores, and receive
  AI-powered shopping recommendations.

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `preferred_language` (text) - 'en' or 'es'
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `stores`
  - `id` (uuid, primary key) - Store identifier
  - `name` (text) - Store name
  - `location` (text) - Store location/address
  - `created_at` (timestamptz) - Record creation timestamp

  ### `products`
  - `id` (uuid, primary key) - Product identifier
  - `name` (text) - Product name
  - `category` (text) - Product category
  - `image_url` (text) - Product image URL
  - `created_at` (timestamptz) - Record creation timestamp

  ### `receipts`
  - `id` (uuid, primary key) - Receipt identifier
  - `user_id` (uuid, foreign key) - References profiles
  - `store_id` (uuid, foreign key) - References stores
  - `image_url` (text) - Receipt image URL
  - `total_amount` (decimal) - Total receipt amount
  - `purchase_date` (timestamptz) - Date of purchase
  - `created_at` (timestamptz) - Record creation timestamp

  ### `receipt_items`
  - `id` (uuid, primary key) - Item identifier
  - `receipt_id` (uuid, foreign key) - References receipts
  - `product_id` (uuid, foreign key) - References products
  - `price` (decimal) - Product price at purchase
  - `quantity` (decimal) - Quantity purchased
  - `created_at` (timestamptz) - Record creation timestamp

  ### `price_history`
  - `id` (uuid, primary key) - History record identifier
  - `product_id` (uuid, foreign key) - References products
  - `store_id` (uuid, foreign key) - References stores
  - `price` (decimal) - Price at this store
  - `recorded_at` (timestamptz) - When price was recorded
  - `created_at` (timestamptz) - Record creation timestamp

  ### `shopping_patterns`
  - `id` (uuid, primary key) - Pattern identifier
  - `user_id` (uuid, foreign key) - References profiles
  - `product_id` (uuid, foreign key) - References products
  - `frequency` (integer) - How often user buys this product
  - `last_purchased` (timestamptz) - Last purchase date
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Store and product data is readable by all authenticated users
  - Price history is readable by all authenticated users for comparison
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  preferred_language text DEFAULT 'en' CHECK (preferred_language IN ('en', 'es')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view stores"
  ON stores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create stores"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  image_url text DEFAULT '',
  total_amount decimal(10, 2) DEFAULT 0,
  purchase_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own receipts"
  ON receipts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own receipts"
  ON receipts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own receipts"
  ON receipts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own receipts"
  ON receipts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create receipt_items table
CREATE TABLE IF NOT EXISTS receipt_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price decimal(10, 2) NOT NULL,
  quantity decimal(10, 2) DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own receipt items"
  ON receipt_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE receipts.id = receipt_items.receipt_id
      AND receipts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own receipt items"
  ON receipt_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE receipts.id = receipt_items.receipt_id
      AND receipts.user_id = auth.uid()
    )
  );

-- Create price_history table
CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  price decimal(10, 2) NOT NULL,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view price history"
  ON price_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create price history"
  ON price_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create shopping_patterns table
CREATE TABLE IF NOT EXISTS shopping_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  frequency integer DEFAULT 0,
  last_purchased timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shopping_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shopping patterns"
  ON shopping_patterns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shopping patterns"
  ON shopping_patterns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping patterns"
  ON shopping_patterns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id ON receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_store_id ON price_history(store_id);
CREATE INDEX IF NOT EXISTS idx_shopping_patterns_user_id ON shopping_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_patterns_product_id ON shopping_patterns(product_id);