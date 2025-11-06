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

        return new Promise<void>((resolve, reject) => {
          const checkGoogle = () => {
            if (typeof window === "undefined" || !(window as any).google) {
              setTimeout(checkGoogle, 100)
              return
            }

            const google = (window as any).google
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

            if (!clientId) {
              set({ status: "unauthenticated" })
              reject(new Error("Google Client ID no configurado"))
              return
            }

            google.accounts.oauth2.initTokenClient({
              client_id: clientId,
              scope: "email profile",
              callback: (tokenResponse: any) => {
                if (tokenResponse.error) {
                  set({ status: "unauthenticated" })
                  reject(new Error(tokenResponse.error))
                  return
                }

                fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`)
                  .then((res) => res.json())
                  .then((data) => {
                    const user: AuthUser = {
                      id: data.id || data.sub || `google-${Date.now()}`,
                      email: data.email,
                      provider: "google",
                    }
                    set({ user, status: "authenticated" })
                    resolve()
                  })
                  .catch((error) => {
                    set({ status: "unauthenticated" })
                    reject(error)
                  })
              },
            }).requestAccessToken()
          }

          checkGoogle()
        })
      },

      loginWithApple: async () => {
        set({ status: "authenticating" })

        return new Promise<void>((resolve, reject) => {
          const checkApple = () => {
            if (typeof window === "undefined" || !(window as any).AppleID) {
              setTimeout(checkApple, 100)
              return
            }

            const AppleID = (window as any).AppleID
            const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID

            if (!clientId) {
              set({ status: "unauthenticated" })
              reject(new Error("Apple Client ID no configurado"))
              return
            }

            AppleID.auth.init({
              clientId: clientId,
              scope: "name email",
              redirectURI: window.location.origin + "/auth/callback",
              usePopup: true,
            })

            AppleID.auth.signIn({
              requestedScopes: ["name", "email"],
            }).then((response: any) => {
              const user: AuthUser = {
                id: response.user || `apple-${Date.now()}`,
                email: response.email || undefined,
                provider: "apple",
              }
              set({ user, status: "authenticated" })
              resolve()
            }).catch((error: any) => {
              set({ status: "unauthenticated" })
              reject(error)
            })
          }

          checkApple()
        })
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
