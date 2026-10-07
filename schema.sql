-- LUXORAL Store Schema for Neon PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sequence for human-readable order numbers (LX-1001, LX-1002, ...)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1001;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure missing columns exist if table was created in an older run
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer';
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Collections
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    price NUMERIC(10,2) NOT NULL,
    description TEXT,
    colors JSONB DEFAULT '[]'::jsonb,
    sizes JSONB DEFAULT '[]'::jsonb,
    stock_quantity INTEGER NOT NULL DEFAULT 50,
    images JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    delivery_address TEXT NOT NULL,
    state VARCHAR(100) NOT NULL,
    payment_method VARCHAR(100) DEFAULT 'Bank Transfer / On Delivery',
    total_amount NUMERIC(12,2) NOT NULL,
    order_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Payment Pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure missing order columns exist if created earlier
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(50) DEFAULT 'Pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'Payment Pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) DEFAULT 'Bank Transfer / On Delivery';

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    color VARCHAR(100),
    size VARCHAR(50),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Initial Collections
INSERT INTO collections (slug, name, description) VALUES
    ('tees', 'Signature Tees', 'Heavyweight luxury cotton essentials'),
    ('hoodies', 'Zip-Up Hoodies', 'Oversized fleece premium zip-ups'),
    ('tanks', 'Ribbed Tanks', 'Sculpted summer athletic silhouettes')
ON CONFLICT (slug) DO NOTHING;

-- Initial Products
INSERT INTO products (slug, name, collection_id, price, description, colors, sizes, stock_quantity, images)
SELECT 'signature-tee', 'Signature Heavyweight Tee', c.id, 45000.00,
    '300GSM custom-milled heavyweight cotton tee in custom LUXORAL relaxed fit.',
    '["Black","White","Cream","Pink","Blue","Purple"]'::jsonb,
    '["S","M","L","XL"]'::jsonb, 120,
    '["black.jpeg","white.jpeg","Cream.jpeg","pink.jpeg","Blue.jpeg","purple.jpeg"]'::jsonb
FROM collections c WHERE c.slug = 'tees'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (slug, name, collection_id, price, description, colors, sizes, stock_quantity, images)
SELECT 'luxury-zip-up', 'Luxury Zip-Up Hoodie', c.id, 85000.00,
    'Custom heavyweight French terry fleece zip-up with dual gunmetal hardware.',
    '["Black","Gray","White","Purple"]'::jsonb,
    '["S","M","L","XL"]'::jsonb, 80,
    '["zipblack.png","zipgray.png","zipwhite.png","zippurple.png"]'::jsonb
FROM collections c WHERE c.slug = 'hoodies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (slug, name, collection_id, price, description, colors, sizes, stock_quantity, images)
SELECT 'ribbed-tank', 'Ribbed Muscle Tank', c.id, 35000.00,
    'Seamless double-ribbed athletic cotton tank designed for an ergonomic fit.',
    '["Black","White","Blue","Orange"]'::jsonb,
    '["S","M","L","XL"]'::jsonb, 95,
    '["tankblack.jpg","tankwhite.jpg","tankblue.jpg","tankorange.jpg"]'::jsonb
FROM collections c WHERE c.slug = 'tanks'
ON CONFLICT (slug) DO NOTHING;

-- Seed / Update Default Admin Account: admin@luxoral.com / Admin1234!
-- SHA-256 of 'Admin1234!' = 5ce41ada64f1e8ffb0acfaafa622b141438f3a5777785e7f0b830fb73e40d3d6
INSERT INTO users (email, password_hash, full_name, phone, role)
VALUES (
    'admin@luxoral.com',
    '5ce41ada64f1e8ffb0acfaafa622b141438f3a5777785e7f0b830fb73e40d3d6',
    'Luxoral Store Admin',
    '+2348158121554',
    'admin'
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = 'admin',
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone;
