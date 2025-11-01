"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Wallet, User } from "lucide-react"
import { useKYCStore } from "@/lib/store"
import { shortenAddress } from "@/lib/blockchain-utils"
import Image from "next/image"

export function Navbar() {
  const pathname = usePathname()
  const { user, connectWallet, disconnectWallet } = useKYCStore()

  const links = [
    { href: "/", label: "Home" },
    { href: "/credentials", label: "My Credentials" },
    { href: "/verify", label: "Verify" },
    { href: "/issuer", label: "Issuer" },
  ]

  const handleWalletClick = () => {
    if (user.walletAddress) {
      disconnectWallet()
    } else {
      // Mock wallet connection
      connectWallet("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")
    }
  }

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/keyd-logo.png" alt="Keyd" width={80} height={24} className="h-6 w-auto" priority />
          </Link>

          {/* Links in the middle */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={pathname === link.href ? "default" : "ghost"}
                  size="sm"
                  className={
                    pathname === link.href
                      ? "bg-[#15DACC] text-white hover:bg-[#0fafa4]"
                      : "text-gray-900 hover:text-gray-900 hover:bg-gray-100"
                  }
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          <Link href="/account">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-900 hover:text-gray-900 hover:bg-gray-100">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </Button>
          </Link>

          {/* Wallet button on right */}
          <Button
            onClick={handleWalletClick}
            variant={user.walletAddress ? "outline" : "default"}
            size="sm"
            className="ml-2"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {user.walletAddress ? shortenAddress(user.walletAddress) : "Connect Wallet"}
          </Button>
        </div>
      </div>
    </nav>
  )
}
