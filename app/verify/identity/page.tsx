"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Shield, Upload, CheckCircle2, Loader2, AlertCircle, User } from "lucide-react"
import { useKYCStore } from "@/lib/store"
import { generateCredentialHash, addLeafToMerkle, issueCredentialOnChain } from "@/lib/blockchain-utils"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth-guard"

function IdentityVerificationPageContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, addCredential, addAction } = useKYCStore()
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    country: "",
    docType: "",
    docNumber: "",
    docFile: null as File | null,
    selfieFile: null as File | null,
  })

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

  const handleFileChange = (field: "docFile" | "selfieFile", file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.country || !formData.docType || !formData.docNumber) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }
    } else if (step === 2) {
      if (!formData.docFile) {
        toast({
          title: "Document Required",
          description: "Please upload your identity document",
          variant: "destructive",
        })
        return
      }
    } else if (step === 3) {
      if (!formData.selfieFile) {
        toast({
          title: "Selfie Required",
          description: "Please upload a selfie for verification",
          variant: "destructive",
        })
        return
      }
    }
    setStep(step + 1)
  }

  const handleSubmit = async () => {
    setIsProcessing(true)

    try {
      // Simulate verification process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate credential data
      const credentialData = {
        type: "Identity",
        holder: user.walletAddress,
        fullName: formData.fullName,
        country: formData.country,
        docType: formData.docType,
      }

      const credentialHash = generateCredentialHash(credentialData)
      const merkleLeaf = addLeafToMerkle(credentialHash)
      const txHash = await issueCredentialOnChain(credentialData)

      // Create new credential
      const newCredential = {
        id: Date.now().toString(),
        type: "Identity" as const,
        holder: user.walletAddress,
        issuer: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        status: "Verified" as const,
        issueTime: new Date().toISOString(),
        expiryTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        txHash,
        credentialHash,
        merkleLeaf,
        metadata: {
          fullName: formData.fullName,
          country: formData.country,
          docType: formData.docType,
        },
      }

      addCredential(newCredential)
      addAction({
        id: Date.now().toString(),
        type: "Identity",
        action: "Issued",
        timestamp: new Date().toISOString(),
        txHash,
      })

      toast({
        title: "Verification Complete!",
        description: "Your identity credential has been issued successfully",
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

  const progress = (step / 4) * 100

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Identity Verification</h1>
            <p className="text-muted-foreground">Step {step} of 4</p>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-2" />

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Personal Information"}
              {step === 2 && "Upload Document"}
              {step === 3 && "Selfie Verification"}
              {step === 4 && "Review & Submit"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Enter your personal details as they appear on your ID"}
              {step === 2 && "Upload a clear photo of your government-issued ID"}
              {step === 3 && "Take a selfie to verify your identity"}
              {step === 4 && "Review your information before submitting"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({ ...formData, country: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docType">Document Type *</Label>
                  <Select
                    value={formData.docType}
                    onValueChange={(value) => setFormData({ ...formData, docType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="Driver's License">Driver's License</SelectItem>
                      <SelectItem value="National ID">National ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docNumber">Document Number *</Label>
                  <Input
                    id="docNumber"
                    placeholder="Enter document number"
                    value={formData.docNumber}
                    onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="docFile" className="cursor-pointer">
                      <div className="text-sm font-medium mb-1">Upload Document</div>
                      <div className="text-xs text-muted-foreground">PNG, JPG or PDF (max 10MB)</div>
                    </Label>
                    <Input
                      id="docFile"
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange("docFile", e.target.files?.[0] || null)}
                    />
                    {formData.docFile && (
                      <div className="flex items-center justify-center gap-2 text-sm text-success mt-3">
                        <CheckCircle2 className="w-4 h-4" />
                        {formData.docFile.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Document Requirements
                  </div>
                  <ul className="space-y-1 text-muted-foreground ml-6 list-disc">
                    <li>Document must be valid and not expired</li>
                    <li>All text must be clearly visible</li>
                    <li>No glare or shadows on the document</li>
                    <li>Full document must be in frame</li>
                  </ul>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="selfieFile" className="cursor-pointer">
                      <div className="text-sm font-medium mb-1">Upload Selfie</div>
                      <div className="text-xs text-muted-foreground">PNG or JPG (max 10MB)</div>
                    </Label>
                    <Input
                      id="selfieFile"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange("selfieFile", e.target.files?.[0] || null)}
                    />
                    {formData.selfieFile && (
                      <div className="flex items-center justify-center gap-2 text-sm text-success mt-3">
                        <CheckCircle2 className="w-4 h-4" />
                        {formData.selfieFile.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Selfie Requirements
                  </div>
                  <ul className="space-y-1 text-muted-foreground ml-6 list-disc">
                    <li>Face must be clearly visible</li>
                    <li>Look directly at the camera</li>
                    <li>Remove glasses and hats</li>
                    <li>Ensure good lighting</li>
                  </ul>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Full Name</div>
                    <div className="font-medium">{formData.fullName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Country</div>
                    <div className="font-medium">{formData.country}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Document Type</div>
                    <div className="font-medium">{formData.docType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Document Number</div>
                    <div className="font-medium">{formData.docNumber}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium mb-1">Privacy Notice</div>
                    <p className="text-muted-foreground">
                      Your personal information will be encrypted and stored securely on the blockchain. Only you
                      control who can access your credentials.
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
          {step < 4 ? (
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

export default function IdentityVerificationPage() {
  return (
    <AuthGuard>
      <IdentityVerificationPageContent />
    </AuthGuard>
  )
}
