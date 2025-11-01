"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Shield,
  User,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Copy,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { useKYCStore } from "@/lib/store"
import { shortenAddress } from "@/lib/blockchain-utils"
import { useToast } from "@/hooks/use-toast"

export default function CredentialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { credentials, issuers } = useKYCStore()

  const credential = credentials.find((c) => c.id === id)
  const issuer = issuers.find((i) => i.address === credential?.issuer)

  if (!credential) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Credential Not Found
            </CardTitle>
            <CardDescription>The credential you're looking for doesn't exist</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/credentials">
              <Button className="w-full">Back to Credentials</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Identity":
        return <Shield className="w-6 h-6" />
      case "Human":
        return <User className="w-6 h-6" />
      case "Age":
        return <Calendar className="w-6 h-6" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Verified":
        return <CheckCircle2 className="w-5 h-5" />
      case "Pending":
        return <Clock className="w-5 h-5" />
      case "Expired":
      case "Revoked":
        return <XCircle className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified":
        return "bg-success/10 text-success border-success/20"
      case "Pending":
        return "bg-warning/10 text-warning border-warning/20"
      case "Expired":
      case "Revoked":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">{getTypeIcon(credential.type)}</div>
                <div>
                  <CardTitle className="text-2xl">{credential.type} Verification</CardTitle>
                  <CardDescription className="mt-1">Credential ID: {credential.id}</CardDescription>
                </div>
              </div>
              <Badge className={`${getStatusColor(credential.status)} text-base px-3 py-1`}>
                <span className="flex items-center gap-2">
                  {getStatusIcon(credential.status)}
                  {credential.status}
                </span>
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Credential Details */}
        <Card>
          <CardHeader>
            <CardTitle>Credential Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Holder Address</div>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">{shortenAddress(credential.holder, 8)}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyToClipboard(credential.holder, "Holder address")}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Issuer</div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">{issuer?.name || "Unknown Issuer"}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyToClipboard(credential.issuer, "Issuer address")}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <code className="text-xs text-muted-foreground">{shortenAddress(credential.issuer, 6)}</code>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Issue Date</div>
                <div className="text-sm font-medium">{formatDate(credential.issueTime)}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Expiry Date</div>
                <div className="text-sm font-medium">{formatDate(credential.expiryTime)}</div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-sm text-muted-foreground mb-2">Transaction Hash</div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto">{credential.txHash}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => copyToClipboard(credential.txHash, "Transaction hash")}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => window.open(`https://polygonscan.com/tx/${credential.txHash}`, "_blank")}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Credential Hash</div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto">
                  {credential.credentialHash}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => copyToClipboard(credential.credentialHash, "Credential hash")}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Merkle Leaf</div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto">
                  {credential.merkleLeaf}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => copyToClipboard(credential.merkleLeaf, "Merkle leaf")}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        {Object.keys(credential.metadata).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
              <CardDescription>Additional information stored with this credential</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {credential.metadata.fullName && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Full Name</div>
                    <div className="font-medium">{credential.metadata.fullName}</div>
                  </div>
                )}
                {credential.metadata.country && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Country</div>
                    <div className="font-medium">{credential.metadata.country}</div>
                  </div>
                )}
                {credential.metadata.docType && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Document Type</div>
                    <div className="font-medium">{credential.metadata.docType}</div>
                  </div>
                )}
                {credential.metadata.overAge !== undefined && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Age Status</div>
                    <div className="font-medium">{credential.metadata.overAge ? "Over 18" : "Under 18"}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ZK Proof */}
        {credential.zkProofSummary && (
          <Card>
            <CardHeader>
              <CardTitle>Zero-Knowledge Proof</CardTitle>
              <CardDescription>Privacy-preserving verification details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm">{credential.zkProofSummary}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revocation */}
        {credential.revocationReason && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Revocation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <p className="text-sm">{credential.revocationReason}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => window.open(`https://polygonscan.com/tx/${credential.txHash}`, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Explorer
          </Button>
          <Link href="/verify" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Get Another Credential
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
