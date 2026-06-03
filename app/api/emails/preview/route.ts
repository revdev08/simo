import { NextRequest, NextResponse } from 'next/server'
import { sendStep } from '@/lib/resend'

/**
 * DEV-ONLY endpoint para previsualizar cualquier correo de la secuencia enviándolo de verdad.
 *
 * Uso:
 *   GET /api/emails/preview?to=tu@correo.com&step=1&firstName=Andres
 *
 * step puede ser 1..6 (1=welcome, 2=topics, 3=social-proof, 4=price, 5=demo, 6=discount).
 *
 * Bloqueado automáticamente en producción.
 */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 })
  }

  const url = new URL(req.url)
  const to = url.searchParams.get('to')
  const firstName = url.searchParams.get('firstName') ?? undefined
  const stepParam = url.searchParams.get('step') ?? '1'
  const step = parseInt(stepParam, 10)

  if (!to) {
    return NextResponse.json({ error: 'Missing ?to= query param' }, { status: 400 })
  }
  if (!Number.isInteger(step) || step < 1 || step > 6) {
    return NextResponse.json({ error: 'step must be an integer 1..6' }, { status: 400 })
  }

  const result = await sendStep(step, { to, firstName })

  if ('error' in result && result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, step, ...result })
}
