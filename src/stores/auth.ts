import {create} from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
  user: unknown;
  setUser: (user: unknown) => void;
}

export const useAuth = create<AuthState>()(
  persist<AuthState>(
    (set, get) => ({
      user: undefined,
      setUser: (user) => set({ user: user }),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => sessionStorage),
    },
  )
);

