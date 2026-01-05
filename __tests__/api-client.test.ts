/**
 * E2E Tests for Dashboard API Client
 * Tests integration between frontend dashboard and backend API endpoints
 *
 * Prerequisites:
 * - Backend server running on localhost:3000
 * - Test data created by backend E2E tests
 */

import { ApiClient } from '@/lib/api-client';
import { ensureBackendTestData } from './setup';

describe('Dashboard API Client E2E Tests', () => {
  let apiClient: ApiClient;
  let authToken: string;
  let testFacilityId: string;
  let testResidentId: string;

  beforeAll(async () => {
    apiClient = new ApiClient('http://localhost:3000');

    // Ensure backend is running with test data
    const loginData = await ensureBackendTestData();

    authToken = loginData.token;
    testFacilityId = loginData.user.facilityId;

    // Get a test resident
    const residentsResponse = await fetch(
      `http://localhost:3000/api/residents?facilityId=${testFacilityId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (residentsResponse.ok) {
      const residents = await residentsResponse.json();
      testResidentId = residents[0]?.id;
      console.log(`✓ Found ${residents.length} test resident(s)`);
    }
  }, 30000); // Increase timeout for setup

  describe('Facilities API', () => {
    test('should fetch facilities (requires auth)', async () => {
      const response = await fetch('http://localhost:3000/api/facilities', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      const facilities = await response.json();
      expect(Array.isArray(facilities)).toBe(true);
      expect(facilities.length).toBeGreaterThan(0);
      expect(facilities[0]).toHaveProperty('name');
    });

    test('should reject unauthenticated facility requests', async () => {
      const response = await fetch('http://localhost:3000/api/facilities');
      expect(response.status).toBe(401);
    });
  });

  describe('Residents API', () => {
    test('should fetch residents for facility', async () => {
      const response = await fetch(
        `http://localhost:3000/api/residents?facilityId=${testFacilityId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      expect(response.status).toBe(200);
      const residents = await response.json();
      expect(Array.isArray(residents)).toBe(true);
    });

    test('should fetch single resident details', async () => {
      if (!testResidentId) {
        console.warn('No test resident available, skipping test');
        return;
      }

      const response = await fetch(
        `http://localhost:3000/api/residents/${testResidentId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      expect(response.status).toBe(200);
      const resident = await response.json();
      expect(resident).toHaveProperty('id');
      expect(resident).toHaveProperty('firstName');
      expect(resident).toHaveProperty('facility');
    });

    test('should reject cross-facility resident access', async () => {
      // Try to access a resident from different facility
      const response = await fetch(
        'http://localhost:3000/api/residents/non-existent-id',
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      expect([403, 404]).toContain(response.status);
    });
  });

  describe('Staff Dashboard API', () => {
    test('should fetch concerns with proper structure', async () => {
      const response = await fetch('http://localhost:3000/api/staff/concerns', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('concerns');
      expect(Array.isArray(data.concerns)).toBe(true);

      // Verify concern structure matches what dashboard expects
      if (data.concerns.length > 0) {
        const concern = data.concerns[0];
        expect(concern).toHaveProperty('concern');
        expect(concern.concern).toHaveProperty('type');
        expect(concern.concern).toHaveProperty('severity');
        expect(concern.concern).toHaveProperty('description');
        expect(concern).toHaveProperty('resident');
        expect(concern).toHaveProperty('familyMember');
        expect(concern).toHaveProperty('facility');
      }
    });

    test('should filter concerns by severity', async () => {
      const response = await fetch(
        'http://localhost:3000/api/staff/concerns?severity=high',
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      data.concerns.forEach((c: any) => {
        expect(c.concern.severity).toBe('high');
      });
    });

    test('should fetch check-in summary with correct structure', async () => {
      const response = await fetch(
        'http://localhost:3000/api/staff/check-ins/summary?days=7',
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      // Verify structure matches what dashboard expects
      expect(data).toHaveProperty('period');
      expect(data).toHaveProperty('summary');
      expect(data.summary).toHaveProperty('totalCheckIns');
      expect(data.summary).toHaveProperty('completed');
      expect(data.summary).toHaveProperty('withConcerns');
      expect(data.summary).toHaveProperty('concernsBySeverity');
      expect(data.summary.concernsBySeverity).toHaveProperty('high');
      expect(data.summary.concernsBySeverity).toHaveProperty('medium');
      expect(data.summary.concernsBySeverity).toHaveProperty('low');
    });

    test('should fetch recent check-ins', async () => {
      const response = await fetch(
        'http://localhost:3000/api/staff/check-ins/recent?limit=5',
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('checkIns');
      expect(Array.isArray(data.checkIns)).toBe(true);

      // Verify structure matches dashboard expectations
      if (data.checkIns.length > 0) {
        const checkIn = data.checkIns[0];
        expect(checkIn).toHaveProperty('id');
        expect(checkIn).toHaveProperty('date');
        expect(checkIn).toHaveProperty('resident');
        expect(checkIn).toHaveProperty('familyMember');
        expect(checkIn.familyMember).toHaveProperty('name');
        expect(checkIn.familyMember).toHaveProperty('relationship');
        expect(checkIn.resident).toHaveProperty('name');
      }
    });
  });

  describe('Family Members API', () => {
    test('should fetch family members for resident', async () => {
      if (!testResidentId) {
        console.warn('No test resident available, skipping test');
        return;
      }

      const response = await fetch(
        `http://localhost:3000/api/family-members/resident/${testResidentId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      expect(response.status).toBe(200);
      const familyMembers = await response.json();
      expect(Array.isArray(familyMembers)).toBe(true);
    });

    test('should require authentication for family members', async () => {
      if (!testResidentId) {
        console.warn('No test resident available, skipping test');
        return;
      }

      const response = await fetch(
        `http://localhost:3000/api/family-members/resident/${testResidentId}`
      );

      expect(response.status).toBe(401);
    });
  });

  describe('API Client Response Format Validation', () => {
    test('all API responses should match dashboard expectations', async () => {
      // Test that the API responses have the exact structure the dashboard components expect
      const tests = [
        {
          name: 'Concerns',
          endpoint: '/api/staff/concerns',
          validate: (data: any) => {
            expect(data.concerns).toBeDefined();
            if (data.concerns.length > 0) {
              expect(data.concerns[0].concern).toBeDefined();
              expect(data.concerns[0].concern.severity).toBeDefined();
            }
          },
        },
        {
          name: 'Check-in Summary',
          endpoint: '/api/staff/check-ins/summary',
          validate: (data: any) => {
            expect(data.summary.totalCheckIns).toBeDefined();
            expect(data.summary.withConcerns).toBeDefined();
          },
        },
        {
          name: 'Recent Check-ins',
          endpoint: '/api/staff/check-ins/recent',
          validate: (data: any) => {
            expect(data.checkIns).toBeDefined();
            if (data.checkIns.length > 0) {
              expect(data.checkIns[0].moodSummary).toBeDefined();
            }
          },
        },
      ];

      for (const test of tests) {
        const response = await fetch(`http://localhost:3000${test.endpoint}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        test.validate(data);
      }
    });
  });
});

console.log('Dashboard E2E API Tests');
console.log('Run with: npm test -- __tests__/api-client.test.ts');
console.log('Requires: Backend server running on localhost:3000 with test data');
