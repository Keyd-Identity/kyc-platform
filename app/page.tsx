"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, User, Calendar, ArrowRight } from "lucide-react"
import { useKYCStore } from "@/lib/store"
import { AuthGuard } from "@/components/auth-guard"
import Image from "next/image"

function HomePageContent() {
  const { user } = useKYCStore()

  const availableCredentials = [
    {
      type: "Identity",
      icon: Shield,
      title: "Identity Verification",
      description: "Verify your identity with government-issued documents",
      route: "/verify/identity",
      status: user.kyc.identity,
      animationClass: "animate-float-1",
    },
    {
      type: "Human",
      icon: User,
      title: "Human Verification",
      description: "Prove you're human with liveness detection",
      route: "/verify/human",
      status: user.kyc.human,
      animationClass: "animate-float-2",
    },
    {
      type: "Age",
      icon: Calendar,
      title: "Age Verification",
      description: "Verify your age without revealing your date of birth",
      route: "/verify/age",
      status: user.kyc.age,
      animationClass: "animate-float-3",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0E2A] to-[#1a1840]">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        <div className="text-center mb-10 md:mb-14">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#E6E7EF]">Available Credentials</h1>
          <p className="text-[#A5A7BF] text-base md:text-lg">Select a credential to claim and verify your identity</p>
        </div>

        <div className="space-y-6">
          {availableCredentials.map((credential) => {
            const Icon = credential.icon
            const isVerified = credential.status === "Verified"
            const isPending = credential.status === "Pending"

            return (
              <Card
                key={credential.type}
                className={`bg-white/5 backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:shadow-[0_8px_32px_0_rgba(21,218,204,0.15)] transition-all duration-300 ${credential.animationClass}`}
              >
                <CardContent className="p-6 md:p-8">
                  <div className="mb-6 flex justify-center">
                    <div className="relative w-full max-w-md aspect-[16/9] rounded-2xl overflow-hidden">
                      <Image
                        src="/images/design-mode/Group%201000002858%20%281%29.png"
                        alt="Credential illustration"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Icon and Title Section */}
                  <div className="flex flex-col items-center text-center mb-6">
                    {/* Neomorphic Icon Container */}
                    <div className="relative mb-4"></div>

                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-[#E6E7EF] mb-2">{credential.title}</h3>

                    {/* Description */}
                    <p className="text-sm md:text-base text-[#A5A7BF] max-w-sm">{credential.description}</p>
                  </div>

                  {/* Status or Action Button */}
                  {isVerified ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-[#15DACC] font-medium">
                        <span className="text-lg">✓</span>
                        <span>Verified</span>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="w-full bg-white/5 border-[#15DACC]/30 text-[#E6E7EF] hover:bg-[#15DACC]/10 hover:border-[#15DACC]/50"
                      >
                        <Link href="/credentials">View Credential</Link>
                      </Button>
                    </div>
                  ) : isPending ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-[#F3C969] font-medium">
                        <span className="text-lg">⏳</span>
                        <span>Pending Verification</span>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="w-full bg-white/5 border-[#F3C969]/30 text-[#E6E7EF] hover:bg-[#F3C969]/10 hover:border-[#F3C969]/50"
                      >
                        <Link href={credential.route}>Continue</Link>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-[#15DACC] to-[#6255CB] hover:opacity-90 text-white font-semibold shadow-lg shadow-[#15DACC]/20"
                      size="lg"
                    >
                      <Link href={credential.route}>
                        Claim Credential
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-[#A5A7BF]">All credentials are stored securely on the blockchain</p>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <AuthGuard>
      <HomePageContent />
    </AuthGuard>
  )
}
