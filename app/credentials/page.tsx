"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, User, Calendar, ExternalLink, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react"
import { useKYCStore } from "@/lib/store"
import { shortenAddress } from "@/lib/blockchain-utils"
import type { CredentialType } from "@/lib/types"
import { AuthGuard } from "@/components/auth-guard"

function CredentialsPageContent() {
  const { user, credentials } = useKYCStore()
  const [filter, setFilter] = useState<CredentialType | "All">("All")

  if (!user.walletAddress) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Wallet Not Connected
            </CardTitle>
            <CardDescription>Please connect your wallet to view your credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You need to connect your wallet to access your blockchain credentials.
            </p>
            <Button className="w-full" disabled>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredCredentials = filter === "All" ? credentials : credentials.filter((c) => c.type === filter)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Verified":
        return <CheckCircle2 className="w-4 h-4" />
      case "Pending":
        return <Clock className="w-4 h-4" />
      case "Expired":
      case "Revoked":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
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

  const getTypeIcon = (type: CredentialType) => {
    switch (type) {
      case "Identity":
        return <Shield className="w-5 h-5" />
      case "Human":
        return <User className="w-5 h-5" />
      case "Age":
        return <Calendar className="w-5 h-5" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Credentials</h1>
          <p className="text-muted-foreground">Manage and view your blockchain-based verification credentials</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          
          
          
        </div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as CredentialType | "All")} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="Identity">Identity</TabsTrigger>
            <TabsTrigger value="Human">Human</TabsTrigger>
            <TabsTrigger value="Age">Age</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            {filteredCredentials.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Credentials Found</h3>
                  <p className="text-muted-foreground mb-6">
                    {filter === "All"
                      ? "You don't have any credentials yet."
                      : `You don't have any ${filter} credentials yet.`}
                  </p>
                  <Link href="/verify">
                    <Button>Get Verified</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredCredentials.map((credential) => (
                  <Card key={credential.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">{getTypeIcon(credential.type)}</div>
                          <div>
                            <CardTitle className="text-xl">{credential.type} Verification</CardTitle>
                            <CardDescription className="mt-1">
                              Issued by {shortenAddress(credential.issuer)}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(credential.status)}>
                          <span className="flex items-center gap-1.5">
                            {getStatusIcon(credential.status)}
                            {credential.status}
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Metadata */}
                      {Object.keys(credential.metadata).length > 0 && (
                        <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
                          {credential.metadata.fullName && (
                            <div>
                              <div className="text-xs text-muted-foreground">Name</div>
                              <div className="text-sm font-medium">{credential.metadata.fullName}</div>
                            </div>
                          )}
                          {credential.metadata.country && (
                            <div>
                              <div className="text-xs text-muted-foreground">Country</div>
                              <div className="text-sm font-medium">{credential.metadata.country}</div>
                            </div>
                          )}
                          {credential.metadata.docType && (
                            <div>
                              <div className="text-xs text-muted-foreground">Document Type</div>
                              <div className="text-sm font-medium">{credential.metadata.docType}</div>
                            </div>
                          )}
                          {credential.metadata.overAge !== undefined && (
                            <div>
                              <div className="text-xs text-muted-foreground">Age Status</div>
                              <div className="text-sm font-medium">
                                {credential.metadata.overAge ? "Over 18" : "Under 18"}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ZK Proof Summary */}
                      {credential.zkProofSummary && (
                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">Zero-Knowledge Proof</div>
                          <div className="text-sm">{credential.zkProofSummary}</div>
                        </div>
                      )}

                      {/* Revocation Reason */}
                      {credential.revocationReason && (
                        <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">Revocation Reason</div>
                          <div className="text-sm text-destructive">{credential.revocationReason}</div>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Issued:</span>{" "}
                          <span className="font-medium">{formatDate(credential.issueTime)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expires:</span>{" "}
                          <span className="font-medium">{formatDate(credential.expiryTime)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Link href={`/credentials/${credential.id}`} className="flex-1">
                          <Button variant="outline" className="w-full bg-transparent">
                            View Details
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`https://polygonscan.com/tx/${credential.txHash}`, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Get More Credentials CTA */}
        {credentials.length > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Need More Credentials?</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete additional verifications to expand your digital identity
                  </p>
                </div>
                <Link href="/verify">
                  <Button>Start New Verification</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function CredentialsPage() {
  return (
    <AuthGuard>
      <CredentialsPageContent />
    </AuthGuard>
  )
}
