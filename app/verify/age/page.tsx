"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle2, Loader2, AlertCircle, Shield } from "lucide-react"
import { useKYCStore } from "@/lib/store"
import { generateCredentialHash, addLeafToMerkle, issueCredentialOnChain, verifyZKProof } from "@/lib/blockchain-utils"
import { useToast } from "@/hooks/use-toast"

export default function AgeVerificationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, addCredential, addAction } = useKYCStore()
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ageRange, setAgeRange] = useState<string>("")
  const [verificationMethod, setVerificationMethod] = useState<string>("")

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

  const handleNext = () => {
    if (step === 1 && !ageRange) {
      toast({
        title: "Selection Required",
        description: "Please select an age range to verify",
        variant: "destructive",
      })
      return
    }
    if (step === 2 && !verificationMethod) {
      toast({
        title: "Selection Required",
        description: "Please select a verification method",
        variant: "destructive",
      })
      return
    }
    setStep(step + 1)
  }

  const handleSubmit = async () => {
    setIsProcessing(true)

    try {
      // Simulate verification process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Verify ZK proof
      await verifyZKProof("mock-age-proof")

      // Generate credential data
      const credentialData = {
        type: "Age",
        holder: user.walletAddress,
        ageRange,
        method: verificationMethod,
      }

      const credentialHash = generateCredentialHash(credentialData)
      const merkleLeaf = addLeafToMerkle(credentialHash)
      const txHash = await issueCredentialOnChain(credentialData)

      // Create new credential
      const newCredential = {
        id: Date.now().toString(),
        type: "Age" as const,
        holder: user.walletAddress,
        issuer: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
        status: "Verified" as const,
        issueTime: new Date().toISOString(),
        expiryTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        txHash,
        credentialHash,
        merkleLeaf,
        zkProofSummary: `Age verification: ${ageRange}`,
        metadata: {
          overAge: ageRange === "over-18" || ageRange === "over-21",
        },
      }

      addCredential(newCredential)
      addAction({
        id: Date.now().toString(),
        type: "Age",
        action: "Issued",
        timestamp: new Date().toISOString(),
        txHash,
      })

      toast({
        title: "Verification Complete!",
        description: "Your age credential has been issued successfully",
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
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Age Verification</h1>
            <p className="text-muted-foreground">Step {step} of 3</p>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-2" />

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Select Age Range"}
              {step === 2 && "Verification Method"}
              {step === 3 && "Review & Submit"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Choose the age range you want to verify"}
              {step === 2 && "Select how you'd like to verify your age"}
              {step === 3 && "Review your information before submitting"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <RadioGroup value={ageRange} onValueChange={setAgeRange}>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="over-18" id="over-18" />
                    <Label htmlFor="over-18" className="flex-1 cursor-pointer">
                      <div className="font-medium">Over 18</div>
                      <div className="text-sm text-muted-foreground">Verify you are 18 years or older</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="over-21" id="over-21" />
                    <Label htmlFor="over-21" className="flex-1 cursor-pointer">
                      <div className="font-medium">Over 21</div>
                      <div className="text-sm text-muted-foreground">Verify you are 21 years or older</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="over-25" id="over-25" />
                    <Label htmlFor="over-25" className="flex-1 cursor-pointer">
                      <div className="font-medium">Over 25</div>
                      <div className="text-sm text-muted-foreground">Verify you are 25 years or older</div>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-2 text-sm">
                  <div className="font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Privacy Protected
                  </div>
                  <p className="text-muted-foreground">
                    Your exact date of birth is never revealed. We only prove you meet the age requirement using
                    zero-knowledge proofs.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <RadioGroup value={verificationMethod} onValueChange={setVerificationMethod}>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="government-id" id="government-id" />
                    <Label htmlFor="government-id" className="flex-1 cursor-pointer">
                      <div className="font-medium">Government ID</div>
                      <div className="text-sm text-muted-foreground">
                        Use your existing identity credential to verify age
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="credit-card" id="credit-card" />
                    <Label htmlFor="credit-card" className="flex-1 cursor-pointer">
                      <div className="font-medium">Credit Card</div>
                      <div className="text-sm text-muted-foreground">Verify age using credit card information</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="third-party" id="third-party" />
                    <Label htmlFor="third-party" className="flex-1 cursor-pointer">
                      <div className="font-medium">Third-Party Service</div>
                      <div className="text-sm text-muted-foreground">Use a trusted age verification service</div>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    How It Works
                  </div>
                  <p className="text-muted-foreground">
                    Your chosen verification method will be used to generate a zero-knowledge proof of your age. No
                    personal information is stored or shared.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Age Range</div>
                    <div className="font-medium capitalize">{ageRange.replace("-", " ")}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Verification Method</div>
                    <div className="font-medium capitalize">{verificationMethod.replace("-", " ")}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-success/5 border border-success/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium mb-1">Ready to Submit</div>
                    <p className="text-muted-foreground">
                      Your age verification credential will be issued on-chain. This proves you meet the age requirement
                      without revealing your exact date of birth.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={isProcessing}
              className="bg-transparent"
            >
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext} className="flex-1">
              Continue
            </Button>
          ) : (
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
