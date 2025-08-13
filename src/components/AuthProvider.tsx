'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-browser'
import { authService } from '@/lib/auth'

type Profile = any // TODO: replace with your real profile type

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: Profile | null
  organization: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, orgName: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [organization, setOrganization] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // fetch profile/org for a given user id
  const loadProfile = async (authUserId: string | undefined | null) => {
    if (!authUserId) {
      setUserProfile(null)
      setOrganization(null)
      return
    }
    try {
      const profile = await authService.getUserProfile(authUserId)
      setUserProfile(profile)
      // NOTE: your getUserProfile returns "organizations (...)" — that alias is "organizations".
      // If you actually want a single organization, adjust here accordingly.
      setOrganization(profile?.organizations ?? null)
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setUserProfile(null)
      setOrganization(null)
    }
  }

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        setSession(data.session ?? null)
        setUser(data.session?.user ?? null)
        await loadProfile(data.session?.user?.id ?? null)
      } catch (err) {
        console.error('Error loading initial session:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s ?? null)
      setUser(s?.user ?? null)
      await loadProfile(s?.user?.id ?? null)
      // don’t set loading true here; treat auth changes as instantaneous from a UX perspective
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { user: _ignored } = await authService.signIn(email.trim(), password)
    // The onAuthStateChange handler will update session/user/profile
  }

  const signUp = async (email: string, password: string, fullName: string, orgName: string) => {
    // If you require email confirmation, the user won't be signed in immediately.
    await authService.signUp(email.trim(), password, fullName.trim(), orgName.trim())
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
    setSession(null)
    setUserProfile(null)
    setOrganization(null)
  }

  const value = useMemo<AuthContextType>(() => ({
    user,
    session,
    userProfile,
    organization,
    loading,
    signIn,
    signUp,
    signOut,
  }), [user, session, userProfile, organization, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
