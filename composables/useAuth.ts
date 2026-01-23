import { useState } from '#app';
import { useRouter } from 'vue-router';

export interface MatchRecord {
  opponent: string;
  winner: string;
  myScore: number;
  opponentScore: number;
  date: Date;
  ratingChange: number;
}

export interface User {
  username: string;
  displayName?: string;
  isGuest: boolean;
  rating?: number;
  matchHistory?: MatchRecord[];
}

export const useAuth = () => {
  const user = useState<User | null>('user', () => null);
  const router = useRouter();

  const initUser = async () => {
    try {
      const data = await $fetch<User | null>('/api/auth/me');
      if (data) {
        user.value = data;
      }
    } catch (e) {
      user.value = null;
    }
  };

  const login = async (username: string, password?: string) => {
    try {
      const userData = await $fetch<User>('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      });
      user.value = userData;
      router.push('/');
    } catch (error: any) {
      alert(error.statusMessage || error.message || 'Login failed');
    }
  };

  const register = async (username: string, password?: string, displayName?: string) => {
    try {
      const userData = await $fetch<User>('/api/auth/register', {
        method: 'POST',
        body: {
          username,
          password,
          displayName: displayName || username
        }
      });
      user.value = userData;
      router.push('/');
    } catch (error: any) {
      alert(error.statusMessage || 'Registration failed');
    }
  };

  const updateRating = async (newRating: number, record: MatchRecord) => {
    if (!user.value || user.value.isGuest) return;

    // In a real app, you'd also call an API to update this in MongoDB
    user.value.rating = newRating;
    user.value.matchHistory = [record, ...(user.value.matchHistory || [])];

    try {
      await $fetch('/api/auth/update-stats', {
        method: 'POST',
        body: { rating: newRating, record }
      });
    } catch (e) {
      console.error('Failed to update stats in DB', e);
    }
  };

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' });
    user.value = null;
    router.push('/login');
  };

  const loginAsGuest = () => {
    user.value = {
      username: 'Guest',
      isGuest: true,
      rating: 1000,
      matchHistory: []
    };
    router.push('/');
  };

  return {
    user,
    initUser,
    login,
    register,
    logout,
    loginAsGuest,
    updateRating,
    isAuthenticated: () => !!user.value
  };
};
