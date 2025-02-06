import { create } from 'zustand';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  initialize: async () => {
    try {
      // Set up the auth state listener
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          console.log('Auth state changed:', user?.email);
          console.log('User:', user);
          set({ user, isLoading: false, error: null });
        },
        (error) => {
          console.error('Auth error:', error);
          set({ error, isLoading: false });
        }
      );

      // Clean up the listener when the app is unmounted
      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ error: error as Error, isLoading: false });
    }
  },
}));

export const useVideosStore = create<VideoState>((set) => ({
  videos: [],
  isLoading: true,
  error: null
}));
