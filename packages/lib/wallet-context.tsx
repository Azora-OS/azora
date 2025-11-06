/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'

interface WalletContextType {
  account: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isConnected: boolean
  isConnecting: boolean
  error: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed')
      return
    }

    try {
      setIsConnecting(true)
      setError(null)

      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])
      const account = accounts[0]

      setAccount(account)
      localStorage.setItem('walletConnected', 'true')
    } catch (err) {
      setError('Failed to connect wallet')
      console.error(err)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    localStorage.removeItem('walletConnected')
  }

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && localStorage.getItem('walletConnected')) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await provider.listAccounts()
          if (accounts.length > 0) {
            setAccount(accounts[0].address)
          }
        } catch (err) {
          console.error('Failed to check wallet connection:', err)
        }
      }
    }

    checkConnection()

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
        } else {
          disconnectWallet()
        }
      })

      window.ethereum.on('disconnect', () => {
        disconnectWallet()
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {})
        window.ethereum.removeListener('disconnect', () => {})
      }
    }
  }, [])

  const value = {
    account,
    connectWallet,
    disconnectWallet,
    isConnected: !!account,
    isConnecting,
    error
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Add TypeScript declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
