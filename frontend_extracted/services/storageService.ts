
import { UserAccount, UserProfile } from '../types';

const KEYS = {
  ACCOUNT: 'astro_jyotish_account',
  RECENT_ACCOUNTS: 'astro_jyotish_recent_accounts',
  PROFILES: 'astro_jyotish_profiles',
  ACTIVE_PROFILE_ID: 'astro_jyotish_active_id'
};

export const storageService = {
  saveAccount(account: UserAccount): void {
    localStorage.setItem(KEYS.ACCOUNT, JSON.stringify(account));
    this.addRecentAccount(account);
  },

  getAccount(): UserAccount | null {
    const data = localStorage.getItem(KEYS.ACCOUNT);
    return data ? JSON.parse(data) : null;
  },

  addRecentAccount(account: UserAccount): void {
    const recent = this.getRecentAccounts();
    const exists = recent.find(a => a.email === account.email);
    if (!exists) {
      const updated = [account, ...recent].slice(0, 5);
      localStorage.setItem(KEYS.RECENT_ACCOUNTS, JSON.stringify(updated));
    }
  },

  getRecentAccounts(): UserAccount[] {
    const data = localStorage.getItem(KEYS.RECENT_ACCOUNTS);
    return data ? JSON.parse(data) : [];
  },

  saveProfiles(profiles: UserProfile[]): void {
    localStorage.setItem(KEYS.PROFILES, JSON.stringify(profiles));
  },

  getProfiles(): UserProfile[] {
    const data = localStorage.getItem(KEYS.PROFILES);
    return data ? JSON.parse(data) : [];
  },

  setActiveProfileId(id: string | null): void {
    if (id) localStorage.setItem(KEYS.ACTIVE_PROFILE_ID, id);
    else localStorage.removeItem(KEYS.ACTIVE_PROFILE_ID);
  },

  getActiveProfileId(): string | null {
    return localStorage.getItem(KEYS.ACTIVE_PROFILE_ID);
  },

  clearAll(): void {
    localStorage.removeItem(KEYS.ACCOUNT);
    localStorage.removeItem(KEYS.PROFILES);
    localStorage.removeItem(KEYS.ACTIVE_PROFILE_ID);
  },

  hasSession(): boolean {
    return !!localStorage.getItem(KEYS.ACCOUNT);
  }
};
