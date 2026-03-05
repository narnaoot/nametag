// Set environment variables before any modules load
process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.DATABASE_URL = 'postgresql://fake/testdb';

// Mock the pg Pool so db/index.js never attempts a real connection
jest.mock('../db', () => ({
  query: jest.fn(),
}));
