import apiClient, { tokenManager } from './axiosConfig';
import { UserAccount, UserProfile, BirthData, LoginCredentials } from '../types';
import { storageService } from './storageService';

// Standardized API response format
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const apiService = {
  // ==================== AUTHENTICATION ====================
  
  async login(credentials: LoginCredentials): Promise<UserAccount> {
    try {
      // Use form data format for OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password || '');
      
      const response = await apiClient.post('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      const { access_token, refresh_token, user } = response.data;
      
      // Store tokens
      tokenManager.setAccessToken(access_token);
      tokenManager.setRefreshToken(refresh_token);
      
      // Create account object
      const account: UserAccount = {
        email: user.email,
        username: credentials.username || user.full_name || user.email.split('@')[0],
        joinedDate: new Date().toISOString(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
      };
      
      // Store in local storage for persistence
      storageService.saveAccount(account);
      
      return account;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },
  
  async register(email: string, password: string, fullName: string): Promise<UserAccount> {
    try {
      const response = await apiClient.post('/api/auth/register', null, {
        params: { email, password, full_name: fullName }
      });
      
      // After registration, login automatically
      return this.login({ email, password });
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  },
  
  async getCurrentUser(): Promise<UserAccount | null> {
    if (!tokenManager.hasValidToken()) {
      return null;
    }
    
    try {
      const response = await apiClient.get('/api/auth/me');
      const user = response.data;
      
      const account: UserAccount = {
        email: user.email,
        username: user.full_name || user.email.split('@')[0],
        joinedDate: new Date().toISOString(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
      };
      
      storageService.saveAccount(account);
      return account;
    } catch (error) {
      tokenManager.clearTokens();
      return null;
    }
  },
  
  async logout(): Promise<void> {
    tokenManager.clearTokens();
    storageService.clearAll();
  },
  
  // ==================== DEMO SETUP ====================
  
  async setupDemo(): Promise<{ email: string; password: string }> {
    try {
      const response = await apiClient.post('/api/demo/setup');
      return response.data.credentials;
    } catch (error: any) {
      console.error('Demo setup error:', error.response?.data || error.message);
      throw new Error('Failed to setup demo account');
    }
  },
  
  // ==================== PROFILES ====================
  
  async getProfiles(): Promise<UserProfile[]> {
    if (!tokenManager.hasValidToken()) {
      return storageService.getProfiles();
    }
    
    try {
      const response = await apiClient.get('/api/profiles');
      const profiles = response.data;
      
      // Transform backend profiles to frontend format
      const transformedProfiles: UserProfile[] = profiles.map((p: any) => ({
        id: String(p.id),
        account: storageService.getAccount()!,
        birthData: {
          name: p.name,
          dob: p.birth_date.split('T')[0],
          tob: p.birth_time || '12:00:00',
          lat: p.latitude,
          lng: p.longitude,
          tz: p.timezone || 'Asia/Kolkata'
        },
        preferences: {
          ayanamsa: p.ayanamsa || 'LAHIRI',
          chartStyle: p.chart_style || 'North'
        },
        isVerified: true
      }));
      
      // Cache locally
      storageService.saveProfiles(transformedProfiles);
      
      return transformedProfiles;
    } catch (error: any) {
      console.error('Get profiles error:', error.response?.data || error.message);
      return storageService.getProfiles();
    }
  },
  
  async createProfile(birthData: BirthData): Promise<UserProfile> {
    try {
      const response = await apiClient.post('/api/profiles', null, {
        params: {
          name: birthData.name,
          birth_date: birthData.dob,
          birth_time: birthData.tob + ':00',
          birth_place: birthData.name, // Using name as placeholder
          latitude: birthData.lat,
          longitude: birthData.lng,
          timezone: birthData.tz,
          ayanamsa: 'LAHIRI'
        }
      });
      
      const newProfile: UserProfile = {
        id: String(response.data.id),
        account: storageService.getAccount()!,
        birthData,
        preferences: { ayanamsa: 'LAHIRI', chartStyle: 'North' },
        isVerified: true
      };
      
      // Update local cache
      const existing = storageService.getProfiles();
      storageService.saveProfiles([...existing, newProfile]);
      
      return newProfile;
    } catch (error: any) {
      console.error('Create profile error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to create profile');
    }
  },
  
  async getProfile(profileId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/profiles/${profileId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get profile error:', error.response?.data || error.message);
      throw new Error('Failed to get profile');
    }
  },
  
  // ==================== CHARTS ====================
  
  async getChartBundle(profileId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/charts/${profileId}/bundle`);
      return response.data;
    } catch (error: any) {
      console.error('Get chart bundle error:', error.response?.data || error.message);
      return null;
    }
  },
  
  async getDivisionalCharts(profileId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/charts/${profileId}/divisional`);
      return response.data;
    } catch (error: any) {
      console.error('Get divisional charts error:', error.response?.data || error.message);
      return null;
    }
  },
  
  // ==================== DASHAS ====================
  
  async getDashas(profileId: string, depth: number = 3): Promise<any> {
    try {
      const response = await apiClient.get(`/api/dashas/${profileId}`, {
        params: { depth }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get dashas error:', error.response?.data || error.message);
      return null;
    }
  },
  
  async getCurrentDasha(profileId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/dashas/${profileId}/current`);
      return response.data;
    } catch (error: any) {
      console.error('Get current dasha error:', error.response?.data || error.message);
      return null;
    }
  },
  
  // ==================== PANCHANG ====================
  
  async getPanchang(profileId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/panchaang/${profileId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get panchang error:', error.response?.data || error.message);
      return null;
    }
  },
  
  async getPanchangForDate(profileId: string, date: string, time: string = '12:00:00'): Promise<any> {
    try {
      const response = await apiClient.get(`/api/panchaang/${profileId}/date`, {
        params: { date, time }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get panchang for date error:', error.response?.data || error.message);
      return null;
    }
  },
  
  async getPanchangForLocation(profileId: string, date: string, lat: number, lng: number): Promise<any> {
    try {
      const response = await apiClient.get(`/api/panchaang/${profileId}/location`, {
        params: { date, latitude: lat, longitude: lng }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get panchang for location error:', error.response?.data || error.message);
      return null;
    }
  },
  
  // ==================== ALIGN27 ====================
  
  async getAlign27Today(profileId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/align27/today`, {
        params: { profile_id: profileId }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get Align27 today error:', error.response?.data || error.message);
      return null;
    }
  },
  
  async getAlign27DayScore(profileId: string, date: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/align27/day`, {
        params: { profile_id: profileId, date }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get Align27 day score error:', error.response?.data || error.message);
      return null;
    }
  },
  
  async getAlign27Moments(profileId: string, date: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/align27/moments`, {
        params: { profile_id: profileId, date }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get Align27 moments error:', error.response?.data || error.message);
      return null;
    }
  },
  
  async getAlign27Rituals(profileId: string, date: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/align27/rituals`, {
        params: { profile_id: profileId, date }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get Align27 rituals error:', error.response?.data || error.message);
      return null;
    }
  },
  
  async getAlign27Planner(profileId: string, startDate: string, days: number = 30): Promise<any> {
    try {
      const response = await apiClient.get(`/api/align27/planner`, {
        params: { profile_id: profileId, start: startDate, days }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get Align27 planner error:', error.response?.data || error.message);
      return null;
    }
  },
  
  // ==================== TRANSITS ====================
  
  async getTransitsToday(profileId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/transits/today/${profileId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get transits today error:', error.response?.data || error.message);
      return null;
    }
  },
  
  // ==================== STRENGTH ====================
  
  async getShadbala(profileId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/strength/${profileId}/shadbala`);
      return response.data;
    } catch (error: any) {
      console.error('Get shadbala error:', error.response?.data || error.message);
      return null;
    }
  },
  
  // ==================== ASHTAKAVARGA ====================
  
  async getAshtakavarga(profileId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/ashtakavarga/${profileId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get ashtakavarga error:', error.response?.data || error.message);
      return null;
    }
  },
  
  // ==================== YOGAS ====================
  
  async getYogas(profileId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/yogas/${profileId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get yogas error:', error.response?.data || error.message);
      return null;
    }
  },
  
  // ==================== REMEDIES ====================
  
  async getRemedies(profileId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/remedies/${profileId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get remedies error:', error.response?.data || error.message);
      return null;
    }
  },
  
  // ==================== VARSHAPHALA ====================
  
  async getVarshaphala(profileId: string, year: number): Promise<any> {
    try {
      const response = await apiClient.get(`/api/varshaphala/${profileId}`, {
        params: { year }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get varshaphala error:', error.response?.data || error.message);
      return null;
    }
  },
  
  // ==================== COMPATIBILITY ====================
  
  async getCompatibility(profileId1: string, profileId2: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/compatibility/${profileId1}/${profileId2}`);
      return response.data;
    } catch (error: any) {
      console.error('Get compatibility error:', error.response?.data || error.message);
      return null;
    }
  },
  
  // ==================== DASHBOARD ====================
  
  async getDashboardWidgets(): Promise<any> {
    try {
      const response = await apiClient.get('/api/dashboard/widgets');
      return response.data;
    } catch (error: any) {
      console.error('Get dashboard widgets error:', error.response?.data || error.message);
      return null;
    }
  },
  
  async getDashboardInsight(profileId: string): Promise<any> {
    try {
      const response = await apiClient.get('/api/dashboard/insight', {
        params: { profile_id: profileId }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get dashboard insight error:', error.response?.data || error.message);
      return null;
    }
  },
  
  // ==================== PROFILE STATE MANAGEMENT ====================
  
  async setActiveProfileId(id: string): Promise<void> {
    storageService.setActiveProfileId(id);
  },
  
  async getActiveProfileId(): Promise<string | null> {
    return storageService.getActiveProfileId();
  },
  
  async getAccount(): Promise<UserAccount | null> {
    // First try to validate with backend
    const user = await this.getCurrentUser();
    if (user) return user;
    
    // Fallback to local storage
    return storageService.getAccount();
  },
  
  // Legacy method for compatibility
  async getProfileFullData(profileId: string): Promise<any> {
    // This method syncs all profile data from backend
    try {
      const [charts, dashas, transits] = await Promise.all([
        this.getChartBundle(profileId),
        this.getDashas(profileId),
        this.getTransitsToday(profileId)
      ]);
      
      return { charts, dashas, transits, success: true };
    } catch (error) {
      return { success: false };
    }
  }
};
