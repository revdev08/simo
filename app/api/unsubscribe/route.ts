import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

/**
 * Marca al usuario como desuscrito en email_sequence.
 *
 * GET /api/unsubscribe?email=foo@bar.com  → also supports one-click unsubscribe
 *   (header List-Unsubscribe-Post compatible)
 * POST /api/unsubscribe  body { email }
 */
async function unsubscribe(email: string | null) {
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('email_sequence')
    .update({
      subscribed: false,
      status: 'unsubscribed',
    })
    .eq('email', email.toLowerCase())

  if (error) {
    // Si la tabla no existe todavía (Supabase migration pendiente), igual respondemos ok
    // para no asustar al usuario. El correo no se le mandará porque el cron también
    // se salta si no hay key/tabla.
    console.error('[Unsubscribe] update error:', error)
    return NextResponse.json({ ok: true, warning: 'table-missing-or-error' })
  }

  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get('email')
  return unsubscribe(email)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  return unsubscribe(body.email ?? null)
}
