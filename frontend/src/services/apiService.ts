
import axios from 'axios';
import { UserAccount, UserProfile, BirthData, DivisionalChart, DashaNode } from '../types';
import { storageService } from './storageService';

// Base configuration for the API client
const apiClient = axios.create({
  baseURL: 'https://api.astrojyotish.io/v1', // Conceptual base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor for Auth
apiClient.interceptors.request.use((config) => {
  const account = storageService.getAccount();
  if (account) {
    // In a real app, you'd use a JWT token here
    config.headers.Authorization = `Bearer demo-token-for-${account.email}`;
  }
  return config;
});

export const apiService = {
  // Authentication
  async login(credentials: { email: string; username?: string; password?: string }): Promise<UserAccount> {
    // For this environment, we simulate a successful login
    // In production: const response = await apiClient.post<UserAccount>('/auth/login', credentials);
    // return response.data;
    
    await new Promise(resolve => setTimeout(resolve, 800));
    const account: UserAccount = {
      email: credentials.email,
      username: credentials.username || credentials.email.split('@')[0],
      joinedDate: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.username || 'Astro'}`
    };
    storageService.saveAccount(account);
    return account;
  },

  // Profile Management
  async getProfiles(): Promise<UserProfile[]> {
    // const response = await apiClient.get<UserProfile[]>('/profiles');
    // return response.data;
    
    // Simulate API delay and return local storage sync
    await new Promise(resolve => setTimeout(resolve, 400));
    return storageService.getProfiles();
  },

  async createProfile(birthData: BirthData): Promise<UserProfile> {
    // const response = await apiClient.post<UserProfile>('/profiles', birthData);
    // return response.data;
    
    await new Promise(resolve => setTimeout(resolve, 600));
    const userAccount = storageService.getAccount();
    if (!userAccount) throw new Error("Unauthorized");

    const newProfile: UserProfile = {
      id: `profile-${Date.now()}`,
      account: userAccount,
      birthData,
      preferences: { ayanamsa: 'Lahiri', chartStyle: 'North' },
      isVerified: true
    };
    
    const existing = storageService.getProfiles();
    storageService.saveProfiles([...existing, newProfile]);
    return newProfile;
  },

  // Hydration: Fetching all data for a specific profile
  async getProfileFullData(profileId: string) {
    // This endpoint would return a bundled object of chart, dashas, and strength
    // const response = await apiClient.get(`/profiles/${profileId}/sync`);
    // return response.data;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    // For now, we utilize the existing local calculator logic via this "API" wrapper
    return { success: true };
  },

  async setActiveProfileId(id: string): Promise<void> {
    storageService.setActiveProfileId(id);
  },

  async getActiveProfileId(): Promise<string | null> {
    return storageService.getActiveProfileId();
  },

  async getAccount(): Promise<UserAccount | null> {
    return storageService.getAccount();
  },

  async logout(): Promise<void> {
    storageService.clearAll();
  }
};
