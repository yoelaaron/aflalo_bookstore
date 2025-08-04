-- Initialize the bookstore database with comprehensive test data
-- This script will be executed when the PostgreSQL container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to insert comprehensive sample data
CREATE OR REPLACE FUNCTION insert_sample_data() RETURNS void AS $
DECLARE
    user1_id UUID := uuid_generate_v4();
    user2_id UUID := uuid_generate_v4();
    store1_id UUID := uuid_generate_v4();
    store2_id UUID := uuid_generate_v4();
    book1_id UUID := uuid_generate_v4();
    book2_id UUID := uuid_generate_v4();
    book3_id UUID := uuid_generate_v4();
    book4_id UUID := uuid_generate_v4();
    book5_id UUID := uuid_generate_v4();
BEGIN
    -- Wait for tables to exist (TypeORM will create them)
    -- Insert sample users with hashed passwords (Test123!@#)
    INSERT INTO users (id, email, password, "isActive", "createdAt", "updatedAt")
    VALUES 
        (user1_id, 'john.doe@bookstore.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LJT9qF3Kyh8q3B6W.', true, NOW(), NOW()),
        (user2_id, 'jane.smith@bookstore.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LJT9qF3Kyh8q3B6W.', true, NOW(), NOW());

    -- Insert sample stores
    INSERT INTO stores (id, name, description, address, phone, "isActive", "userId", "createdAt", "updatedAt")
    VALUES 
        (store1_id, 'The Book Corner', 'A cozy neighborhood bookstore specializing in classics and contemporary fiction', '123 Main St, New York, NY 10001', '+1-555-0123', true, user1_id, NOW(), NOW()),
        (store2_id, 'Modern Literature Hub', 'Contemporary books, bestsellers, and indie publications', '456 Oak Ave, San Francisco, CA 94102', '+1-555-0456', true, user2_id, NOW(), NOW());

    -- Insert sample books with variety
    INSERT INTO books (id, title, author, description, isbn, price, stock, "imageUrl", "isActive", "userId", "storeId", "createdAt", "updatedAt")
    VALUES 
        (book1_id, 'The Great Gatsby', 'F. Scott Fitzgerald', 'A classic American novel about the Jazz Age and the American Dream', '978-0-7432-7356-5', 15.99, 50, 'https://example.com/gatsby.jpg', true, user1_id, store1_id, NOW(), NOW()),
        (book2_id, 'To Kill a Mockingbird', 'Harper Lee', 'A gripping tale of racial injustice and childhood innocence in the American South', '978-0-06-112008-4', 14.99, 30, 'https://example.com/mockingbird.jpg', true, user1_id, store1_id, NOW(), NOW()),
        (book3_id, '1984', 'George Orwell', 'A dystopian social science fiction novel and cautionary tale', '978-0-452-28423-4', 16.99, 25, 'https://example.com/1984.jpg', true, user2_id, store2_id, NOW(), NOW()),
        (book4_id, 'The Catcher in the Rye', 'J.D. Salinger', 'A coming-of-age story that has become a modern classic', '978-0-316-76948-0', 13.99, 40, 'https://example.com/catcher.jpg', true, user1_id, store1_id, NOW(), NOW()),
        (book5_id, 'Brave New World', 'Aldous Huxley', 'A prophetic dystopian novel about a technologically advanced future', '978-0-06-085052-4', 15.49, 35, 'https://example.com/brave-new-world.jpg', true, user2_id, store2_id, NOW(), NOW());

    RAISE NOTICE 'Comprehensive sample data inserted successfully!';
    RAISE NOTICE 'Test users created:';
    RAISE NOTICE '  - john.doe@bookstore.com (password: Test123!@#)';
    RAISE NOTICE '  - jane.smith@bookstore.com (password: Test123!@#)';
    RAISE NOTICE 'Stores: % with % books each', 2, 5;
END;
$ LANGUAGE plpgsql;

-- Note: The function will be called manually after the application starts
-- because TypeORM needs to create the tables first