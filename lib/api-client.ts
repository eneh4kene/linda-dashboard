const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }

      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Residents
  async getResidents(facilityId?: string) {
    // Use provided facility ID, or get from localStorage, or fallback to brunnel-001
    const fid = facilityId || (typeof window !== 'undefined' && localStorage.getItem('selectedFacilityId')) || 'brunnel-001';
    return this.request<any[]>(`/api/residents?facilityId=${fid}`);
  }

  async getResident(id: string) {
    return this.request<any>(`/api/residents/${id}`);
  }

  async updateResident(id: string, data: any) {
    return this.request<any>(`/api/residents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Family Members
  async getFamilyMembers(residentId: string) {
    return this.request<any[]>(`/api/family-members/resident/${residentId}`);
  }

  async createFamilyMember(data: any) {
    return this.request<any>('/api/family-members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFamilyMember(id: string, data: any) {
    return this.request<any>(`/api/family-members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteFamilyMember(id: string) {
    return this.request<void>(`/api/family-members/${id}`, {
      method: 'DELETE',
    });
  }

  // Calls
  async getCalls(params?: { residentId?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/api/calls${query ? `?${query}` : ''}`);
  }

  async getCall(id: string) {
    return this.request<any>(`/api/calls/${id}`);
  }

  // Staff Dashboard
  async getConcerns(params?: { severity?: string; facilityId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any>(`/api/staff/concerns${query ? `?${query}` : ''}`);
  }

  async getCheckInsSummary(days: number = 7, facilityId?: string) {
    const params = new URLSearchParams({ days: days.toString() });
    if (facilityId) params.set('facilityId', facilityId);
    return this.request<any>(`/api/staff/check-ins/summary?${params.toString()}`);
  }

  async getRecentCheckIns(limit: number = 20, facilityId?: string) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (facilityId) params.set('facilityId', facilityId);
    return this.request<any>(`/api/staff/check-ins/recent?${params.toString()}`);
  }

  // Lifebooks
  async getLifebook(residentId: string) {
    return this.request<any>(`/api/books/${residentId}/create`, {
      method: 'POST',
    });
  }

  async getSegments(residentId: string) {
    return this.request<any[]>(`/api/segments?residentId=${residentId}`);
  }

  // Facilities
  async getFacilities() {
    return this.request<any[]>('/api/facilities');
  }

  async getFacility(id: string) {
    return this.request<any>(`/api/facilities/${id}`);
  }

  async createFacility(data: any) {
    return this.request<any>('/api/facilities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFacility(id: string, data: any) {
    return this.request<any>(`/api/facilities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteFacility(id: string) {
    return this.request<void>(`/api/facilities/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
