export type CredentialType = "Identity" | "Human" | "Age"

export type CredentialStatus = "Verified" | "Pending" | "Revoked" | "Expired"

export interface Credential {
  id: string
  type: CredentialType
  holder: string
  issuer: string
  status: CredentialStatus
  issueTime: string
  expiryTime: string
  txHash: string
  credentialHash: string
  merkleLeaf: string
  zkProofSummary?: string
  metadata: {
    country?: string
    docType?: string
    overAge?: boolean
    fullName?: string
  }
  revocationReason?: string
}

export interface User {
  walletAddress: string | null
  network: string
  kyc: {
    identity: CredentialStatus | "None"
    human: CredentialStatus | "None"
    age: CredentialStatus | "None"
  }
}

export interface Issuer {
  id: string
  name: string
  address: string
}

export interface VerificationAction {
  id: string
  type: CredentialType
  action: "Issued" | "Revoked" | "Verified"
  timestamp: string
  txHash: string
}
