"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, User, Calendar, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react"
import { useKYCStore } from "@/lib/store"
import { AuthGuard } from "@/components/auth-guard"

function VerifyPageContent() {
  const { user } = useKYCStore()

  if (!user.walletAddress) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Wallet Not Connected
            </CardTitle>
            <CardDescription>Please connect your wallet to start verification</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You need to connect your wallet to begin the verification process.
            </p>
            <Button className="w-full" disabled>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const verificationTypes = [
    {
      type: "Identity",
      icon: Shield,
      title: "Identity Verification",
      description: "Verify your identity with a government-issued ID document",
      status: user.kyc.identity,
      href: "/verify/identity",
      features: ["Government ID scan", "Facial recognition", "Document authenticity check", "Blockchain storage"],
      estimatedTime: "5-10 minutes",
    },
    {
      type: "Human",
      icon: User,
      title: "Human Verification",
      description: "Prove you're a real human with liveness detection",
      status: user.kyc.human,
      href: "/verify/human",
      features: ["Liveness detection", "Anti-bot verification", "Zero-knowledge proof", "Privacy-preserving"],
      estimatedTime: "2-3 minutes",
    },
    {
      type: "Age",
      icon: Calendar,
      title: "Age Verification",
      description: "Verify your age without revealing your date of birth",
      status: user.kyc.age,
      href: "/verify/age",
      features: ["Age range proof", "Privacy-first", "No DOB disclosure", "ZK-proof technology"],
      estimatedTime: "3-5 minutes",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )
      case "Pending":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>
      case "Expired":
      case "Revoked":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Expired</Badge>
      default:
        return <Badge variant="outline">Not Verified</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold">Get Verified</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the type of verification you need. Each credential is stored securely on the blockchain and gives you
            control over your digital identity.
          </p>
        </div>

        {/* Verification Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {verificationTypes.map((verification) => (
            <Card
              key={verification.type}
              className="flex flex-col hover:border-primary/50 transition-colors relative overflow-hidden"
            >
              {verification.status === "Verified" && (
                <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 bg-success/10 rounded-full" />
              )}

              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <verification.icon className="w-6 h-6 text-primary" />
                  </div>
                  {getStatusBadge(verification.status)}
                </div>
                <CardTitle className="text-xl">{verification.title}</CardTitle>
                <CardDescription className="text-base">{verification.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="text-muted-foreground mb-2">What's included:</div>
                    <ul className="space-y-1.5">
                      {verification.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">Estimated time:</span>{" "}
                    <span className="font-medium">{verification.estimatedTime}</span>
                  </div>
                </div>

                <Link href={verification.href} className="w-full">
                  <Button className="w-full" variant={verification.status === "Verified" ? "outline" : "default"}>
                    {verification.status === "Verified" ? "Renew Verification" : "Start Verification"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <Card className="bg-muted/50">
          <CardContent className="py-6">
            <h3 className="font-semibold mb-3">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                  1
                </div>
                <h4 className="font-medium">Submit Information</h4>
                <p className="text-muted-foreground">
                  Provide the required documents or complete the verification steps
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                  2
                </div>
                <h4 className="font-medium">Verification Process</h4>
                <p className="text-muted-foreground">
                  Our system verifies your information and generates a cryptographic proof
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                  3
                </div>
                <h4 className="font-medium">Receive Credential</h4>
                <p className="text-muted-foreground">
                  Your verified credential is issued on-chain and added to your wallet
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <AuthGuard>
      <VerifyPageContent />
    </AuthGuard>
  )
}
