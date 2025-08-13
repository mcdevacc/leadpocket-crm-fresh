'use client'

import { createBrowserClient } from '@supabase/ssr'

export const supabase =
  (globalThis as any).__sb ??
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { storageKey: 'leadpocket-auth' } } // optional custom key
  )

if (process.env.NODE_ENV !== 'production') (globalThis as any).__sb = supabase
