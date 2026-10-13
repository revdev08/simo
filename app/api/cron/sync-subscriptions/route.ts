import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { syncMercadoPagoSubscription } from '@/lib/syncMercadoPagoSubscription'

export const maxDuration = 60

export async function GET(req: Request) {
  const configuredSecret = process.env.CRON_SECRET
  if (!configuredSecret || req.headers.get('authorization') !== `Bearer ${configuredSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const now = new Date().toISOString()
    const [pendingResult, expiredResult] = await Promise.all([
      supabase.from('subscriptions').select('mp_preapproval_id')
        .eq('status', 'pending').not('mp_preapproval_id', 'is', null).limit(50),
      supabase.from('subscriptions').select('mp_preapproval_id')
        .eq('status', 'active').lt('current_period_end', now).not('mp_preapproval_id', 'is', null).limit(50),
    ])
    if (pendingResult.error) throw pendingResult.error
    if (expiredResult.error) throw expiredResult.error

    const ids = [...new Set([
      ...(pendingResult.data ?? []).map((item) => item.mp_preapproval_id),
      ...(expiredResult.data ?? []).map((item) => item.mp_preapproval_id),
    ].filter((id): id is string => Boolean(id)))]

    // En lotes de 5: hasta 100 consultas a la vez a Mercado Pago pueden pasar su límite de peticiones
    const results: PromiseSettledResult<unknown>[] = []
    for (let i = 0; i < ids.length; i += 5) {
      results.push(...(await Promise.allSettled(ids.slice(i, i + 5).map((id) => syncMercadoPagoSubscription(id)))))
    }
    const failed = results.filter((result) => result.status === 'rejected').length
    console.log('[CRON Sync] Finalizado', { total: ids.length, synchronized: ids.length - failed, failed })

    return NextResponse.json({ success: failed === 0, total: ids.length, synchronized: ids.length - failed, failed })
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error)
    console.error('[CRON Sync] Error', detail)
    return NextResponse.json({ error: 'No se pudieron sincronizar las suscripciones' }, { status: 500 })
  }
}
