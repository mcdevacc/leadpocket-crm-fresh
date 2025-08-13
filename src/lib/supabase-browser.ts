'use client'
import { createBrowserClient } from '@supabase/ssr'

function must(v: string | undefined, name: string): string {
  if (!v) throw new Error(`MISSING_ENV:${name}`)
  return v
}

declare global {
  // helps detect accidental second client creation
  // eslint-disable-next-line no-var
  var __lp_sb__: ReturnType<typeof createBrowserClient> | undefined
}

export const supabase =
  globalThis.__lp_sb__ ??
  createBrowserClient(
    must(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
    must(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    { auth: { storageKey: 'leadpocket-auth' } } // unique key avoids collisions
  )

if (process.env.NODE_ENV !== 'production') globalThis.__lp_sb__ = supabase
