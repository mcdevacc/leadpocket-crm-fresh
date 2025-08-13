import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  full_name?: string
  organization_id?: string
  role?: string
}

export interface Organization {
  id: string
  name: string
  domain?: string
  subscription_plan: string
}

export const authService = {
  // Sign up new user and organization
  async signUp(email: string, password: string, fullName: string, organizationName: string) {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Create organization
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: organizationName,
            subscription_plan: 'starter'
          })
          .select()
          .single()

        if (orgError) throw orgError

        // 3. Create user profile
        const { error: userError } = await supabase
          .from('users')
          .insert({
            email,
            full_name: fullName,
            organization_id: orgData.id,
            auth_user_id: authData.user.id,
            role: 'admin'
          })

        if (userError) throw userError

        return { user: authData.user, organization: orgData }
      }
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  },

  // Sign in existing user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // Get user profile with organization
  async getUserProfile(authUserId: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        organizations (
          id,
          name,
          domain,
          subscription_plan
        )
      `)
      .eq('auth_user_id', authUserId)
      .single()

    if (error) throw error
    return data
  }
}
