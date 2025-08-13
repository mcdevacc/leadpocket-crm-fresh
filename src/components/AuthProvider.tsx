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

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

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
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        try {
          const profile = await authService.getUserProfile(session.user.id)
          setUserProfile(profile)
          setOrganization(profile.organizations)
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      }

      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          try {
            const profile = await authService.getUserProfile(session.user.id)
            setUserProfile(profile)
            setOrganization(profile.organizations)
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

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { user } = await authService.signIn(email, password)
    // Profile will be loaded by the auth state change listener
  }

  const signUp = async (email: string, password: string, fullName: string, orgName: string) => {
    await authService.signUp(email, password, fullName, orgName)
    // User will need to verify email before signing in
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
    setSession(null)
    setUserProfile(null)
    setOrganization(null)
  }

  const value = {
    user,
    session,
    userProfile,
    organization,
    loading,
    signIn,
    signUp,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
