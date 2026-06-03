import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const maxDuration = 60

/**
 * Backfill: mete los usuarios existentes en `profiles` a `email_sequence`.
 *
 * Estrategia: cada perfil que NO tenga registro en email_sequence se inserta con
 *   - last_step_sent = 0  (no han recibido nada)
 *   - signup_at      = NOW() escalonado por lotes (ver `stagger`)
 *
 * Así el cron diario los va captando gradualmente y no se les manda todo en un día.
 *
 * Uso (manual):
 *   GET /api/cron/email-backfill?limit=100
 *
 * También se puede agendar como Vercel Cron (ver vercel.json) para que corra
 * todos los días hasta que se acaben los pendientes — luego dejará de hacer nada.
 *
 * Parámetros:
 *   ?limit=100          → cuántos perfiles meter en esta corrida (default 100, max 500)
 *   ?stagger=true       → si true, distribuye signup_at en las últimas 24h
 *                         (útil si no quieres que el cron del día siguiente los
 *                          dispare a todos a la misma hora)
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // No tiene sentido hacer backfill si después no se van a poder enviar correos.
  if (!process.env.RESEND_API_KEY) {
    console.log('[Backfill] Skipping run — RESEND_API_KEY not configured.')
    return NextResponse.json({ success: true, skipped: 'no-api-key', inserted: 0 })
  }

  const url = new URL(req.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '100', 10), 500)
  const stagger = url.searchParams.get('stagger') === 'true'

  const supabase = createAdminClient()

  // Buscamos profiles que aún no estén en email_sequence.
  // Importante: ajusta el nombre de la columna si tu tabla profiles tiene "email" en otro campo.
  const { data: pending, error: pendingErr } = await supabase
    .rpc('profiles_not_in_sequence', { p_limit: limit })
    .select()

  // Fallback si la RPC no existe: hacemos el LEFT JOIN manual.
  let candidates: { id: string; email: string }[] = []

  if (pendingErr || !pending) {
    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('id, email')
      .not('email', 'is', null)
      .limit(limit * 3)

    if (profErr) {
      console.error('[Backfill] profiles fetch error:', profErr)
      return NextResponse.json({ error: 'profiles fetch failed' }, { status: 500 })
    }

    const ids = (profiles ?? []).map((p) => p.id)
    const { data: existing, error: existErr } = await supabase
      .from('email_sequence')
      .select('user_id')
      .in('user_id', ids)

    if (existErr) {
      console.error('[Backfill] sequence check error:', existErr)
      return NextResponse.json({ error: 'sequence check failed' }, { status: 500 })
    }

    const existingSet = new Set((existing ?? []).map((e) => e.user_id))
    candidates = (profiles ?? [])
      .filter((p) => p.email && !existingSet.has(p.id))
      .slice(0, limit)
  } else {
    candidates = pending as { id: string; email: string }[]
  }

  if (candidates.length === 0) {
    return NextResponse.json({ success: true, inserted: 0, message: 'Nothing to backfill.' })
  }

  // Distribuye signup_at en las últimas N horas si stagger=true.
  // Esto evita que el cron diario los procese todos al mismo tiempo y respeta el ritmo
  // de warm-up del dominio.
  const now = Date.now()
  const spreadMs = stagger ? 24 * 60 * 60 * 1000 : 0

  const rows = candidates.map((c, i) => ({
    user_id: c.id,
    email: c.email,
    first_name: null,
    signup_at: new Date(
      now - (stagger ? Math.floor((i / candidates.length) * spreadMs) : 0),
    ).toISOString(),
    last_step_sent: 0,
    status: 'active',
  }))

  const { error: insertErr } = await supabase
    .from('email_sequence')
    .upsert(rows, { onConflict: 'user_id', ignoreDuplicates: true })

  if (insertErr) {
    console.error('[Backfill] insert error:', insertErr)
    return NextResponse.json({ error: 'insert failed', details: insertErr }, { status: 500 })
  }

  console.log(`[Backfill] Inserted ${rows.length} profiles into email_sequence`)

  return NextResponse.json({
    success: true,
    inserted: rows.length,
    stagger,
  })
}
