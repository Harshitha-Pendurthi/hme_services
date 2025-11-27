-- Seed data for Home Services Booking Application

USE home_services_db;

-- Insert predefined service categories
INSERT INTO service_categories (name, description, icon) VALUES
('Plumbing', 'Professional plumbing services for homes and businesses', 'plumbing'),
('Electrical', 'Licensed electrical work and repairs', 'electrical'),
('Cleaning', 'House and office cleaning services', 'cleaning'),
('Carpentry', 'Wood work and furniture repair services', 'carpentry'),
('Painting', 'Interior and exterior painting services', 'painting'),
('HVAC', 'Heating, ventilation, and air conditioning services', 'hvac'),
('Landscaping', 'Garden and lawn maintenance services', 'landscaping'),
('Appliance Repair', 'Home appliance repair and maintenance', 'appliance');

-- Insert admin user
INSERT INTO users (username, email, password, first_name, last_name, role) VALUES
('admin', 'admin@homeservices.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9P2.nRuvO2mAXSO', 'System', 'Administrator', 'ADMIN');

-- Insert sample customers
INSERT INTO users (username, email, password, first_name, last_name, phone, address, role) VALUES
('john_doe', 'john@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9P2.nRuvO2mAXSO', 'John', 'Doe', '555-0101', '123 Main St, City, State', 'CUSTOMER'),
('jane_smith', 'jane@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9P2.nRuvO2mAXSO', 'Jane', 'Smith', '555-0102', '456 Oak Ave, City, State', 'CUSTOMER');

-- Insert sample service providers
INSERT INTO users (username, email, password, first_name, last_name, phone, address, role) VALUES
('mike_plumber', 'mike@plumbing.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9P2.nRuvO2mAXSO', 'Mike', 'Johnson', '555-0201', '789 Service Rd, City, State', 'PROVIDER'),
('sarah_electrician', 'sarah@electric.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9P2.nRuvO2mAXSO', 'Sarah', 'Wilson', '555-0202', '321 Trade St, City, State', 'PROVIDER'),
('clean_team', 'team@cleanpro.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9P2.nRuvO2mAXSO', 'Clean', 'Team', '555-0203', '654 Business Blvd, City, State', 'PROVIDER');

-- Insert sample services
INSERT INTO services (provider_id, category_id, name, description, price, duration_minutes) VALUES
(3, 1, 'Pipe Repair', 'Professional pipe repair and replacement services', 150.00, 120),
(3, 1, 'Drain Cleaning', 'Complete drain cleaning and unclogging service', 100.00, 90),
(4, 2, 'Electrical Wiring', 'New electrical wiring installation and repair', 200.00, 180),
(4, 2, 'Light Fixture Installation', 'Professional light fixture installation', 80.00, 60),
(5, 3, 'House Cleaning', 'Complete house cleaning service', 120.00, 180),
(5, 3, 'Office Cleaning', 'Professional office cleaning service', 150.00, 240);

-- Insert sample provider availability
INSERT INTO provider_availability (provider_id, day_of_week, start_time, end_time) VALUES
(3, 'MONDAY', '08:00:00', '17:00:00'),
(3, 'TUESDAY', '08:00:00', '17:00:00'),
(3, 'WEDNESDAY', '08:00:00', '17:00:00'),
(3, 'THURSDAY', '08:00:00', '17:00:00'),
(3, 'FRIDAY', '08:00:00', '17:00:00'),
(4, 'MONDAY', '09:00:00', '18:00:00'),
(4, 'TUESDAY', '09:00:00', '18:00:00'),
(4, 'WEDNESDAY', '09:00:00', '18:00:00'),
(4, 'THURSDAY', '09:00:00', '18:00:00'),
(4, 'FRIDAY', '09:00:00', '18:00:00'),
(4, 'SATURDAY', '10:00:00', '16:00:00'),
(5, 'MONDAY', '07:00:00', '19:00:00'),
(5, 'TUESDAY', '07:00:00', '19:00:00'),
(5, 'WEDNESDAY', '07:00:00', '19:00:00'),
(5, 'THURSDAY', '07:00:00', '19:00:00'),
(5, 'FRIDAY', '07:00:00', '19:00:00'),
(5, 'SATURDAY', '08:00:00', '18:00:00'),
(5, 'SUNDAY', '10:00:00', '16:00:00');
