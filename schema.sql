-- LUXORAL schema for Neon PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    color VARCHAR(100),
    size VARCHAR(50),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (cart_id, product_id, color, size)
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_email VARCHAR(255) NOT NULL,
    shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_amount NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'paid',
    order_status VARCHAR(50) DEFAULT 'processing',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    color VARCHAR(100),
    size VARCHAR(50),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL
);

INSERT INTO collections (slug, name, description) VALUES
    ('tees', 'Signature Tees', 'Heavyweight luxury cotton essentials'),
    ('hoodies', 'Zip-Up Hoodies', 'Oversized fleece premium zip-ups'),
    ('tanks', 'Ribbed Tanks', 'Sculpted summer athletic silhouettes')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (slug, name, collection_id, price, description, colors, sizes, stock_quantity, images)
SELECT 'signature-tee', 'Signature Heavyweight Tee', c.id, 45.00,
    '300GSM custom-milled heavyweight cotton tee in custom LUXORAL relaxed fit.',
    '["Black","White","Cream","Pink","Blue","Purple"]'::jsonb,
    '["S","M","L","XL"]'::jsonb, 120,
    '["black.jpeg","white.jpeg","Cream.jpeg","pink.jpeg","Blue.jpeg","purple.jpeg"]'::jsonb
FROM collections c WHERE c.slug = 'tees'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (slug, name, collection_id, price, description, colors, sizes, stock_quantity, images)
SELECT 'luxury-zip-up', 'Luxury Zip-Up Hoodie', c.id, 85.00,
    'Custom heavyweight French terry fleece zip-up with dual gunmetal hardware.',
    '["Black","Gray","White","Purple"]'::jsonb,
    '["S","M","L","XL"]'::jsonb, 80,
    '["zipblack.png","zipgray.png","zipwhite.png","zippurple.png"]'::jsonb
FROM collections c WHERE c.slug = 'hoodies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (slug, name, collection_id, price, description, colors, sizes, stock_quantity, images)
SELECT 'ribbed-tank', 'Ribbed Muscle Tank', c.id, 35.00,
    'Seamless double-ribbed athletic cotton tank designed for an ergonomic fit.',
    '["Black","White","Blue","Orange"]'::jsonb,
    '["S","M","L","XL"]'::jsonb, 95,
    '["tankblack.jpg","tankwhite.jpg","tankblue.jpg","tankorange.jpg"]'::jsonb
FROM collections c WHERE c.slug = 'tanks'
ON CONFLICT (slug) DO NOTHING;
