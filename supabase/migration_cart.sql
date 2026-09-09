-- Run this snippet in your Supabase SQL Editor to update your existing database.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS total_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS cart_items jsonb;
