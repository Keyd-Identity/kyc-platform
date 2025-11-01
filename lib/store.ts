"use client"

import { create } from "zustand"
import type { Credential, User, Issuer, VerificationAction } from "./types"

interface KYCStore {
  user: User
  credentials: Credential[]
  issuers: Issuer[]
  actions: VerificationAction[]

  // User actions
  connectWallet: (address: string) => void
  disconnectWallet: () => void

  // Credential actions
  addCredential: (credential: Credential) => void
  updateCredential: (id: string, updates: Partial<Credential>) => void
  revokeCredential: (id: string, reason: string) => void

  // Action history
  addAction: (action: VerificationAction) => void
}

// Mock data
const mockIssuers: Issuer[] = [
  { id: "1", name: "KYC Platform", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" },
  { id: "2", name: "Identity Verifier", address: "0x8ba1f109551bD432803012645Ac136ddd64DBA72" },
  { id: "3", name: "Age Verification Service", address: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed" },
]

const mockCredentials: Credential[] = [
  {
    id: "1",
    type: "Identity",
    holder: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    issuer: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    status: "Verified",
    issueTime: "2024-01-15T10:30:00Z",
    expiryTime: "2025-01-15T10:30:00Z",
    txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    credentialHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    merkleLeaf: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
    metadata: {
      country: "United States",
      docType: "Passport",
      fullName: "John Doe",
    },
  },
  {
    id: "2",
    type: "Human",
    holder: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    issuer: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    status: "Verified",
    issueTime: "2024-02-20T14:15:00Z",
    expiryTime: "2025-02-20T14:15:00Z",
    txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    credentialHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    merkleLeaf: "0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
    zkProofSummary: "Liveness check passed",
    metadata: {},
  },
  {
    id: "3",
    type: "Age",
    holder: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    issuer: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    status: "Expired",
    issueTime: "2023-03-10T09:00:00Z",
    expiryTime: "2024-03-10T09:00:00Z",
    txHash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
    credentialHash: "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
    merkleLeaf: "0x3210fedcba9876543210fedcba9876543210fedcba9876543210fedcba987654",
    zkProofSummary: "Age verification: Over 18",
    metadata: {
      overAge: true,
    },
  },
]

export const useKYCStore = create<KYCStore>((set) => ({
  user: {
    walletAddress: null,
    network: "polygon",
    kyc: {
      identity: "None",
      human: "None",
      age: "None",
    },
  },
  credentials: [],
  issuers: mockIssuers,
  actions: [],

  connectWallet: (address: string) =>
    set((state) => {
      // Update KYC status based on existing credentials
      const identityCred = state.credentials.find((c) => c.type === "Identity" && c.holder === address)
      const humanCred = state.credentials.find((c) => c.type === "Human" && c.holder === address)
      const ageCred = state.credentials.find((c) => c.type === "Age" && c.holder === address)

      return {
        user: {
          ...state.user,
          walletAddress: address,
          kyc: {
            identity: identityCred?.status || "None",
            human: humanCred?.status || "None",
            age: ageCred?.status || "None",
          },
        },
        credentials: mockCredentials,
      }
    }),

  disconnectWallet: () =>
    set({
      user: {
        walletAddress: null,
        network: "polygon",
        kyc: {
          identity: "None",
          human: "None",
          age: "None",
        },
      },
      credentials: [],
    }),

  addCredential: (credential: Credential) =>
    set((state) => {
      const newCredentials = [...state.credentials, credential]
      const kycUpdate = { ...state.user.kyc }

      if (credential.type === "Identity") kycUpdate.identity = credential.status
      if (credential.type === "Human") kycUpdate.human = credential.status
      if (credential.type === "Age") kycUpdate.age = credential.status

      return {
        credentials: newCredentials,
        user: {
          ...state.user,
          kyc: kycUpdate,
        },
      }
    }),

  updateCredential: (id: string, updates: Partial<Credential>) =>
    set((state) => ({
      credentials: state.credentials.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  revokeCredential: (id: string, reason: string) =>
    set((state) => ({
      credentials: state.credentials.map((c) =>
        c.id === id ? { ...c, status: "Revoked" as const, revocationReason: reason } : c,
      ),
    })),

  addAction: (action: VerificationAction) =>
    set((state) => ({
      actions: [action, ...state.actions],
    })),
}))
