"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface User {
  id: string
  email: string
  name: string
  role: "student" | "educator" | "employer" | "institution"
  profileImage?: string
  country?: string
  joinedDate: string
  azrBalance: number
  verifiedCredentials: number
  savePath?: string[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, role: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate checking stored auth state
    const storedUser = localStorage.getItem("azora_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name: email.split("@")[0],
        role: "student",
        country: "US",
        joinedDate: new Date().toISOString(),
        azrBalance: 0,
        verifiedCredentials: 0,
        savePath: [],
      }

      setUser(newUser)
      localStorage.setItem("azora_user", JSON.stringify(newUser))
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string, role: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        role: role as User["role"],
        country: "US",
        joinedDate: new Date().toISOString(),
        azrBalance: 100, // Welcome bonus
        verifiedCredentials: 0,
        savePath: [],
      }

      setUser(newUser)
      localStorage.setItem("azora_user", JSON.stringify(newUser))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("azora_user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
