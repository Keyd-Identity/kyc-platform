"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type AuthProvider = "google" | "apple" | "wallet"
export type AuthStatus = "unauthenticated" | "authenticating" | "authenticated"

export interface AuthUser {
  id: string
  email?: string
  provider: AuthProvider
  walletAddress?: string
}

interface AuthStore {
  user: AuthUser | null
  status: AuthStatus

  // Actions
  loginWithGoogle: () => Promise<void>
  loginWithApple: () => Promise<void>
  connectWallet: () => Promise<void>
  logout: () => void

  // Internal
  setUser: (user: AuthUser) => void
  setStatus: (status: AuthStatus) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      status: "unauthenticated",

      loginWithGoogle: async () => {
        set({ status: "authenticating" })

        // Mock OAuth flow
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const mockUser: AuthUser = {
          id: `google-${Date.now()}`,
          email: "user@example.com",
          provider: "google",
        }

        set({ user: mockUser, status: "authenticated" })
      },

      loginWithApple: async () => {
        set({ status: "authenticating" })

        // Mock OAuth flow
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const mockUser: AuthUser = {
          id: `apple-${Date.now()}`,
          email: "user@icloud.com",
          provider: "apple",
        }

        set({ user: mockUser, status: "authenticated" })
      },

      connectWallet: async () => {
        set({ status: "authenticating" })

        // Mock wallet connection with EIP-191 sign-in
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const mockWalletAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"

        const mockUser: AuthUser = {
          id: `wallet-${Date.now()}`,
          provider: "wallet",
          walletAddress: mockWalletAddress,
        }

        set({ user: mockUser, status: "authenticated" })
      },

      logout: () => {
        set({ user: null, status: "unauthenticated" })
      },

      setUser: (user: AuthUser) => set({ user }),
      setStatus: (status: AuthStatus) => set({ status }),
    }),
    {
      name: "kyc-auth-storage",
      partialize: (state) => ({ user: state.user, status: state.status }),
    },
  ),
)
