"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { User, CheckCircle2, Loader2, AlertCircle, Camera, Scan } from "lucide-react"
import { useKYCStore } from "@/lib/store"
import { generateCredentialHash, addLeafToMerkle, issueCredentialOnChain, verifyZKProof } from "@/lib/blockchain-utils"
import { useToast } from "@/hooks/use-toast"

export default function HumanVerificationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, addCredential, addAction } = useKYCStore()
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [livenessComplete, setLivenessComplete] = useState(false)
  const [zkProofGenerated, setZkProofGenerated] = useState(false)

  if (!user.walletAddress) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Wallet Not Connected</CardTitle>
            <CardDescription>Please connect your wallet to continue</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const handleLivenessCheck = async () => {
    setIsProcessing(true)
    try {
      // Simulate liveness detection
      await new Promise((resolve) => setTimeout(resolve, 3000))
      setLivenessComplete(true)
      toast({
        title: "Liveness Check Passed",
        description: "You have been verified as a real human",
      })
      setStep(2)
    } catch (error) {
      toast({
        title: "Liveness Check Failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleZKProofGeneration = async () => {
    setIsProcessing(true)
    try {
      // Simulate ZK proof generation
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const proofValid = await verifyZKProof("mock-proof")
      if (proofValid) {
        setZkProofGenerated(true)
        toast({
          title: "ZK Proof Generated",
          description: "Your privacy-preserving proof has been created",
        })
        setStep(3)
      }
    } catch (error) {
      toast({
        title: "Proof Generation Failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async () => {
    setIsProcessing(true)

    try {
      // Generate credential data
      const credentialData = {
        type: "Human",
        holder: user.walletAddress,
        livenessCheck: true,
      }

      const credentialHash = generateCredentialHash(credentialData)
      const merkleLeaf = addLeafToMerkle(credentialHash)
      const txHash = await issueCredentialOnChain(credentialData)

      // Create new credential
      const newCredential = {
        id: Date.now().toString(),
        type: "Human" as const,
        holder: user.walletAddress,
        issuer: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
        status: "Verified" as const,
        issueTime: new Date().toISOString(),
        expiryTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        txHash,
        credentialHash,
        merkleLeaf,
        zkProofSummary: "Liveness check passed with ZK proof",
        metadata: {},
      }

      addCredential(newCredential)
      addAction({
        id: Date.now().toString(),
        type: "Human",
        action: "Issued",
        timestamp: new Date().toISOString(),
        txHash,
      })

      toast({
        title: "Verification Complete!",
        description: "Your human credential has been issued successfully",
      })

      setTimeout(() => {
        router.push("/credentials")
      }, 1500)
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "There was an error processing your verification. Please try again.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  const progress = (step / 3) * 100

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Human Verification</h1>
            <p className="text-muted-foreground">Step {step} of 3</p>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-2" />

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Liveness Detection"}
              {step === 2 && "Generate ZK Proof"}
              {step === 3 && "Review & Submit"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Perform a liveness check to prove you're a real human"}
              {step === 2 && "Generate a zero-knowledge proof for privacy"}
              {step === 3 && "Review and submit your human verification"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Liveness Check</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Click the button below to start the liveness detection process
                  </p>
                  <Button onClick={handleLivenessCheck} disabled={isProcessing || livenessComplete} size="lg">
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : livenessComplete ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Check Complete
                      </>
                    ) : (
                      "Start Liveness Check"
                    )}
                  </Button>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    What to Expect
                  </div>
                  <ul className="space-y-1 text-muted-foreground ml-6 list-disc">
                    <li>You'll be asked to look at your camera</li>
                    <li>Follow the on-screen instructions</li>
                    <li>The process takes about 30 seconds</li>
                    <li>Ensure good lighting and remove glasses</li>
                  </ul>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                  <Scan className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Zero-Knowledge Proof</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Generate a privacy-preserving proof of your humanity
                  </p>
                  <Button onClick={handleZKProofGeneration} disabled={isProcessing || zkProofGenerated} size="lg">
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : zkProofGenerated ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Proof Generated
                      </>
                    ) : (
                      "Generate ZK Proof"
                    )}
                  </Button>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-2 text-sm">
                  <div className="font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Privacy First
                  </div>
                  <p className="text-muted-foreground">
                    Zero-knowledge proofs allow you to prove you're human without revealing any personal information.
                    Your privacy is protected at all times.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <div className="font-medium">Liveness Check Complete</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <div className="font-medium">ZK Proof Generated</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <User className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium mb-1">Ready to Submit</div>
                    <p className="text-muted-foreground">
                      Your human verification credential will be issued on-chain. This proves you're a real person
                      without revealing any personal information.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          {step > 1 && step < 3 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={isProcessing}
              className="bg-transparent"
            >
              Back
            </Button>
          )}
          {step === 3 && (
            <Button onClick={handleSubmit} disabled={isProcessing} className="flex-1">
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Verification"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
