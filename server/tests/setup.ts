// Test setup file
import { beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
  // Setup test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/portfolio_test';
});

afterAll(async () => {
  // Cleanup
});
