import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { SEQUENCE, TOTAL_STEPS, findNextStep } from '@/lib/email-sequence'

// Vercel Hobby: 60s max. Cada email ~300ms vía Resend → batch de 100 cabe holgado.
export const maxDuration = 60

const DEFAULT_BATCH_SIZE = 100
const SEND_THROTTLE_MS = 120 // ~8 envíos/segundo, debajo del límite de Resend

interface SequenceRow {
  user_id: string
  email: string
  first_name: string | null
  signup_at: string
  last_step_sent: number
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function GET(req: Request) {
  // Auth Vercel Cron (mismo patrón que sync-subscriptions)
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Si Resend no está configurado, no procesamos nada — evita ruido en logs.
  if (!process.env.RESEND_API_KEY) {
    console.log('[CRON Email] Skipping run — RESEND_API_KEY not configured.')
    return NextResponse.json({ success: true, skipped: 'no-api-key', totalSent: 0 })
  }

  const url = new URL(req.url)
  const batchSize = Math.min(
    parseInt(url.searchParams.get('limit') ?? `${DEFAULT_BATCH_SIZE}`, 10),
    300,
  )

  const supabase = createAdminClient()
  const now = new Date()
  const stats: Record<string, number> = {}
  let totalSent = 0
  let totalFailed = 0

  // Recorremos cada step de la secuencia. Buscamos usuarios que estén en
  // last_step_sent = step - 1 y que ya cumplieron el dayOffset.
  for (const step of SEQUENCE) {
    const prevStep = step.step - 1
    const cutoff = new Date(now.getTime() - step.dayOffset * 86_400_000).toISOString()

    const { data, error } = await supabase
      .from('email_sequence')
      .select('user_id, email, first_name, signup_at, last_step_sent')
      .eq('status', 'active')
      .eq('subscribed', true)
      .is('converted_at', null)
      .eq('last_step_sent', prevStep)
      .lte('signup_at', cutoff)
      .order('signup_at', { ascending: true })
      .limit(batchSize)

    if (error) {
      console.error(`[CRON Email] Error fetching step ${step.step}:`, error)
      continue
    }

    const rows = (data ?? []) as SequenceRow[]
    if (rows.length === 0) continue

    console.log(`[CRON Email] Step ${step.step} (${step.label}): ${rows.length} pendientes`)

    let sentInStep = 0
    let failedInStep = 0

    for (const row of rows) {
      try {
        const result = await step.send({
          to: row.email,
          firstName: row.first_name ?? undefined,
        })

        if ('error' in result && result.error) {
          failedInStep++
          continue
        }

        const next = findNextStep(step.step)
        await supabase
          .from('email_sequence')
          .update({
            last_step_sent: step.step,
            last_sent_at: new Date().toISOString(),
            status: next ? 'active' : 'completed',
          })
          .eq('user_id', row.user_id)

        sentInStep++
      } catch (e) {
        console.error(`[CRON Email] Send exception (user ${row.user_id}):`, e)
        failedInStep++
      }

      await sleep(SEND_THROTTLE_MS)
    }

    stats[`step_${step.step}_${step.label}`] = sentInStep
    if (failedInStep > 0) stats[`step_${step.step}_failed`] = failedInStep

    totalSent += sentInStep
    totalFailed += failedInStep
  }

  console.log(`[CRON Email] Done. Sent: ${totalSent}, Failed: ${totalFailed}`)

  return NextResponse.json({
    success: true,
    totalSent,
    totalFailed,
    totalSteps: TOTAL_STEPS,
    batchSize,
    stats,
  })
}
