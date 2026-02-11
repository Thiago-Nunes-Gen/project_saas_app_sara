-- Add customization columns to saas_client_notes table
ALTER TABLE saas_client_notes 
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'font-sans',
ADD COLUMN IF NOT EXISTS font_size TEXT DEFAULT 'text-base';

-- Update existing notes to have defaults
UPDATE saas_client_notes 
SET font_family = 'font-sans', font_size = 'text-base' 
WHERE font_family IS NULL OR font_size IS NULL;
