'use client'
import { createBrowserClient } from '@supabase/ssr'

function must(v: string | undefined, name: string): string {
  if (!v) throw new Error(`MISSING_ENV:${name}`)
  return v
}

export const supabase =
  (globalThis as any).__sb ??
  createBrowserClient(
    must(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
    must(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    { auth: { storageKey: 'leadpocket-auth' } } // custom key avoids collisions
  )

if (process.env.NODE_ENV !== 'production') (globalThis as any).__sb = supabase
