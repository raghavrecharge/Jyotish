/**
 * API Client for AstroOS Frontend
 * Handles all HTTP communication with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

export class APIClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.accessToken = localStorage.getItem('accessToken');
  }

  setTokens(access: string) {
    this.accessToken = access;
    localStorage.setItem('accessToken', access);
  }

  clearTokens() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  async register(email: string, password: string, fullName?: string) {
    return this.request('POST', '/auth/register', { email, password, full_name: fullName });
  }

  async login(email: string, password: string) {
    const data = await this.request('POST', '/auth/login', { username: email, password });
    if (data.access_token) {
      this.setTokens(data.access_token);
    }
    return data;
  }

  async getCurrentUser() {
    return this.request('GET', '/auth/me');
  }

  async listProfiles() {
    return this.request('GET', '/profiles');
  }

  async createProfile(profileData: any) {
    return this.request('POST', '/profiles', profileData);
  }

  async getProfile(profileId: number) {
    return this.request('GET', `/profiles/${profileId}`);
  }

  async calculateNatalChart(birthData: any) {
    return this.request('POST', '/charts/natal', birthData);
  }

  async calculateVarga(chartData: any, vargaNumber: number) {
    return this.request('POST', `/charts/varga/${vargaNumber}`, chartData);
  }

  async getVimshottariDashas(birthData: any, years: number = 5) {
    return this.request('POST', '/dashas/vimshottari', { ...birthData, years });
  }

  async detectYogas(chartData: any) {
    return this.request('POST', '/yogas', chartData);
  }

  async calculateAshtakavarga(chartData: any) {
    return this.request('POST', '/ashtakavarga', chartData);
  }

  async getTodayData(birthData: any) {
    return this.request('POST', '/transits/today', birthData);
  }

  async calculateCompatibility(birth1: any, birth2: any) {
    return this.request('POST', '/compatibility', { birth_data_1: birth1, birth_data_2: birth2 });
  }

  async calculateVarshaphala(birthData: any, year: number) {
    return this.request('POST', '/varshaphala', { ...birthData, year });
  }

  async calculateShadbala(birthData: any) {
    return this.request('POST', '/strength/shadbala', birthData);
  }

  async generateRemedies(chartData: any, shadbalaData: any) {
    return this.request('POST', '/remedies', { chart: chartData, shadbala: shadbalaData });
  }

  async getKnowledgeBase(query?: string) {
    const endpoint = query ? `/kb?query=${encodeURIComponent(query)}` : '/kb';
    return this.request('GET', endpoint);
  }

  async sendChatMessage(messages: any, context?: any) {
    return this.request('POST', '/chat', { messages, context });
  }

  async getAlign27Data(birthData: any) {
    return this.request('POST', '/align27', birthData);
  }

  async exportToPDF(profileId: number, reportType: string) {
    return this.request('GET', `/export/pdf/${profileId}?type=${reportType}`);
  }

  async healthCheck() {
    return this.request('GET', '/health');
  }
}

export const apiClient = new APIClient();
