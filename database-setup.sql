-- Sawi's Delight Cakes - Database Schema
-- Run this in Supabase SQL Editor

-- Business Information Table
CREATE TABLE IF NOT EXISTS business_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Sawi''s Delight Cakes',
    phone TEXT NOT NULL DEFAULT '+254797486557',
    location TEXT NOT NULL DEFAULT 'Futro Area, Alego Usonga, Siaya County, Kenya',
    flavors TEXT NOT NULL DEFAULT 'Vanilla • Chocolate • Marble • Lemon • Red Velvet • Black Forest',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cakes Table
CREATE TABLE IF NOT EXISTS cakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cake_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    starting_price TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cake Images Table
CREATE TABLE IF NOT EXISTS cake_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cake_id UUID REFERENCES cakes(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cake Details/Pricing Table
CREATE TABLE IF NOT EXISTS cake_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cake_id UUID REFERENCES cakes(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Features Table
CREATE TABLE IF NOT EXISTS features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ordering Steps Table
CREATE TABLE IF NOT EXISTS ordering_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stars INTEGER NOT NULL DEFAULT 5,
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    event TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- About Content Table
CREATE TABLE IF NOT EXISTS about_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paragraph_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE business_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE cakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cake_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE cake_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordering_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read access for all users" ON business_info FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON cakes FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON cake_images FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON cake_details FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON features FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON ordering_steps FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON about_content FOR SELECT USING (true);

-- Create policies for authenticated updates (admin only)
CREATE POLICY "Enable update for authenticated users only" ON business_info FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users only" ON cakes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON cakes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON cakes FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON cake_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON cake_details FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON features FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON ordering_steps FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON about_content FOR ALL USING (auth.role() = 'authenticated');

-- Insert initial business info
INSERT INTO business_info (name, phone, location, flavors) 
VALUES (
    'Sawi''s Delight Cakes',
    '+254797486557',
    'Futro Area, Alego Usonga, Siaya County, Kenya',
    'Vanilla • Chocolate • Marble • Lemon • Red Velvet • Black Forest'
) ON CONFLICT DO NOTHING;

-- Insert initial cakes data
INSERT INTO cakes (cake_id, title, description, starting_price, sort_order) VALUES
('birthday', 'Birthday Cakes', 'Classic celebration cakes with buttercream frosting, custom designs, and personalized messages for your special day.', NULL, 1),
('kids', 'Kids Character Cakes', 'Spiderman, Frozen, Cars, Barbie, Minnie Mouse, CoComelon and more! Bring your child''s favorite characters to life.', 'Starting from KSh 2,500', 2),
('graduation', 'Graduation Cakes', 'Celebrate academic achievements with elegant cap designs, book cakes, and university logo decorations.', NULL, 3),
('wedding', 'Wedding Cakes', 'Stunning tiered cakes with elegant fondant, gold accents, fresh flowers, and custom couple toppers for your big day.', NULL, 4),
('traditional', 'Ruracio & Dowry Ceremony Cakes', 'Elegant white, gold and floral designs perfect for engagement ceremonies and church blessings.', 'Starting from KSh 7,000', 5),
('church', 'Church & Anniversary Cakes', 'Beautiful cakes for church events, anniversaries, and milestone celebrations with custom messages and Bible verses.', 'Starting from KSh 4,500', 6)
ON CONFLICT (cake_id) DO NOTHING;

-- Insert cake details (pricing) for birthday cakes
DO $$
DECLARE
    birthday_id UUID;
BEGIN
    SELECT id INTO birthday_id FROM cakes WHERE cake_id = 'birthday';
    
    INSERT INTO cake_details (cake_id, label, value, sort_order) VALUES
    (birthday_id, '1kg (8-12 servings)', 'KSh 1,800 - 2,200', 1),
    (birthday_id, '2kg (15-20 servings)', 'KSh 2,800 - 3,500', 2),
    (birthday_id, '3kg (25-30 servings)', 'KSh 3,800 - 4,800', 3);
END $$;

-- Insert initial features
INSERT INTO features (icon, title, description, sort_order) VALUES
('✍️', 'Custom Names & Messages', 'Add personal messages, names, and special wishes', 1),
('🎂', 'Age Numbers', 'Beautiful number toppers for any age', 2),
('🏫', 'School Logos', 'Graduation cakes with university crests', 3),
('📖', 'Bible Verses', 'Meaningful scripture for church events', 4),
('📸', 'Edible Photos', 'Print any photo directly on your cake', 5),
('🎨', 'Theme Colors', 'Match your event colors perfectly', 6)
ON CONFLICT DO NOTHING;

-- Insert ordering steps
INSERT INTO ordering_steps (step_number, title, description) VALUES
(1, 'Choose Your Cake', 'Browse our designs and select your favorite'),
(2, 'Send Screenshot', 'Share the design on WhatsApp with your customization ideas'),
(3, 'Confirm Details', 'We''ll confirm the date, size, and delivery/pickup location'),
(4, 'Pay Deposit', 'Secure your order with an M-Pesa deposit'),
(5, 'Get Your Cake', 'Fresh baked and ready for your celebration!')
ON CONFLICT DO NOTHING;

-- Insert initial testimonials
INSERT INTO testimonials (stars, text, author, event, sort_order) VALUES
(5, 'The wedding cake was absolutely stunning! Every guest was asking who made it. Beautiful design, delicious taste, and the perfect centerpiece for our special day. Highly recommend Sawi''s Delight Cakes!', 'Mary & John K.', 'Wedding, January 2025', 1),
(5, 'My daughter''s Frozen-themed birthday cake was a dream come true! She couldn''t stop smiling. The attention to detail was incredible and it tasted even better than it looked. Thank you Sawi''s Delight Cakes!', 'Grace M.', 'Birthday Party, December 2024', 2),
(5, 'We ordered a cake for our church anniversary celebration. It was elegant, fresh, and fed everyone perfectly. The Bible verse decoration was beautifully done. Will definitely order again!', 'Pastor David O.', 'Church Anniversary, November 2024', 3)
ON CONFLICT DO NOTHING;

-- Insert about content
INSERT INTO about_content (paragraph_number, content) VALUES
(1, 'Sawi''s Delight Cakes is a home bakery in Siaya County specializing in fresh, handcrafted celebration cakes. We believe every special moment deserves a cake made with love, quality ingredients, and personalized attention to detail.'),
(2, 'From intimate birthday gatherings to grand wedding celebrations, we bring your cake dreams to life with creative designs, delicious flavors, and a commitment to making your day extra special.'),
(3, 'Every cake is baked fresh to order in our home kitchen, ensuring the highest quality and that personal touch that makes all the difference.')
ON CONFLICT DO NOTHING;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_business_info_updated_at BEFORE UPDATE ON business_info 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cakes_updated_at BEFORE UPDATE ON cakes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_content_updated_at BEFORE UPDATE ON about_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
