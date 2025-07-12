-- Add category_id column to hotels table
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS category_id INTEGER;

-- Add foreign key constraint if hotel_categories table exists
-- This will be ignored if the table doesn't exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotel_categories') THEN
        ALTER TABLE hotels ADD CONSTRAINT fk_hotels_category_id 
        FOREIGN KEY (category_id) REFERENCES hotel_categories(id);
    END IF;
END $$;