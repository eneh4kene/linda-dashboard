/**
 * Test setup utilities for dashboard E2E tests
 * Ensures backend test data exists before running dashboard tests
 */

export async function ensureBackendTestData() {
  try {
    // Check if backend is running
    const healthCheck = await fetch('http://localhost:3000/api/facilities', {
      method: 'HEAD',
    });

    if (!healthCheck.ok && healthCheck.status !== 401) {
      throw new Error('Backend server is not responding');
    }

    console.log('✓ Backend server is running on localhost:3000');

    // Try to login - this will fail if test data doesn't exist
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'manager@sunnymeadows.com',
        password: 'TestPassword123!',
      }),
    });

    if (!loginResponse.ok) {
      console.log('✗ Test user not found - running backend test setup...');
      console.log('  Run: cd ../linda_backend && npm run test:e2e');
      throw new Error(
        'Test data not found. Please run backend E2E tests first to create test data.'
      );
    }

    console.log('✓ Test data exists and is valid');
    return await loginResponse.json();
  } catch (error: any) {
    console.error('\n❌ Pre-flight check failed:', error.message);
    console.error('\nTo fix this:');
    console.error('  1. Make sure backend is running: cd ../linda_backend && npm run dev');
    console.error('  2. Run backend E2E tests to create test data: npm run test:e2e');
    console.error('  3. Then run dashboard tests again\n');
    throw error;
  }
}
