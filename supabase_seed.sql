-- Run this to populate initial data

-- 1. Insert Service Categories
INSERT INTO service_categories (name, name_hi, description, icon_url, base_price) VALUES
('Electrician', '?????????????', 'Electrical repairs, wiring, and appliance installation', 'Zap', 350.00),
('Plumber', '???????', 'Pipe repairs, leak fixing, and bathroom fittings', 'Droplet', 300.00),
('Carpenter', '????', 'Furniture assembly, wood repair, and door fixing', 'Hammer', 400.00),
('Painter', '?????', 'Interior and exterior house painting', 'Paintbrush', 500.00),
('Cleaner', '???? ????????', 'Deep home cleaning and sanitation', 'Sparkles', 250.00),
('Driver', '???????', 'On-demand personal driving services', 'Car', 300.00),
('Gardener', '????', 'Lawn care, planting, and garden maintenance', 'Leaf', 200.00),
('Technician', '????????', 'AC, Fridge, and Washing Machine repair', 'Wrench', 450.00),
('Caregiver', '?????? ???? ????', 'Elderly care and nursing assistance', 'Heart', 600.00),
('Domestic Helper', '????? ?????', 'Daily chores, cooking, and house help', 'Home', 250.00);

-- 2. Insert Cooperative Federation
INSERT INTO cooperative_federations (name, registration_number, address, contact_email, contact_phone, logo_url)
VALUES (
  'National Labour Cooperative Federation', 
  'NLCF-1001-HQ', 
  'New Delhi, India', 
  'admin@nlcf.coop', 
  '+91 11 2345 6789', 
  'https://ui-avatars.com/api/?name=NLCF&background=059669&color=fff'
);

-- 3. Insert Cooperative Societies
INSERT INTO cooperative_societies (federation_id, name, registration_number, district, state, address)
SELECT 
  id, 
  'Patna District Labour Society', 
  'PDLS-BR-01', 
  'Patna', 
  'Bihar', 
  'Gandhi Maidan, Patna'
FROM cooperative_federations LIMIT 1;

INSERT INTO cooperative_societies (federation_id, name, registration_number, district, state, address)
SELECT 
  id, 
  'Pune Gig Workers Cooperative', 
  'PGWC-MH-12', 
  'Pune', 
  'Maharashtra', 
  'Shivaji Nagar, Pune'
FROM cooperative_federations LIMIT 1;

