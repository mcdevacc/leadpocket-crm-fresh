'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-browser'
import { authService } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: any | null
  organization: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, orgName: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [organization, setOrganization] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        try {
          const profile = await authService.getUserProfile(session.user.id)
          if (mounted) {
            setUserProfile(profile)
            setOrganization(profile.organizations)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      }

      setLoading(false)
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          try {
            const profile = await authService.getUserProfile(session.user.id)
            if (mounted) {
              setUserProfile(profile)
              setOrganization(profile.organizations)
            }
          } catch (error) {
            console.error('Error fetching user profile:', error)
          }
        } else {
          setUserProfile(null)
          setOrganization(null)
        }

        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password)
  }

  const signUp = async (email: string, password: string, fullName: string, orgName: string) => {
    await authService.signUp(email, password, fullName, orgName)
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
    setSession(null)
    setUserProfile(null)
    setOrganization(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        organization,
        loading,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
