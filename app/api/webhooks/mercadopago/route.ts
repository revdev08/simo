import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { syncMercadoPagoSubscription } from '@/lib/syncMercadoPagoSubscription'
import { createAdminClient } from '@/lib/supabase'
import { getMpPayment, parseExternalReference } from '@/lib/mercadopago'

type WebhookBody = {
  type?: string
  topic?: string
  data?: { id?: string | number }
  id?: string | number
}

function isValidSignature(req: Request, dataId: string) {
  const secret = process.env.MELI_WEBHOOK_SECRET?.trim()
  if (!secret) return false

  const signature = req.headers.get('x-signature') ?? ''
  const requestId = req.headers.get('x-request-id') ?? ''
  const parts = Object.fromEntries(signature.split(',').map((part) => {
    const [key, ...value] = part.trim().split('=')
    return [key, value.join('=')]
  }))
  if (!requestId || !parts.ts || !parts.v1) return false

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')
  const received = Buffer.from(parts.v1, 'utf8')
  const expectedBuffer = Buffer.from(expected, 'utf8')
  return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer)
}

export async function GET() {
  return new NextResponse('OK', { status: 200 })
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const body = (await req.json().catch(() => ({}))) as WebhookBody
    const dataId = String(
      url.searchParams.get('data.id') ?? url.searchParams.get('data_id') ??
      url.searchParams.get('id') ?? body.data?.id ?? body.id ?? ''
    )
    if (!dataId) return new NextResponse('Falta data.id', { status: 400 })
    if (!isValidSignature(req, dataId)) return new NextResponse('Firma inválida', { status: 401 })

    const type = url.searchParams.get('type') ?? url.searchParams.get('topic') ?? body.type ?? body.topic
    if (type === 'payment') {
      const payment = await getMpPayment(dataId)
      const reference = parseExternalReference(payment.external_reference)
      const payerEmail = payment.payer?.email?.toLowerCase() ?? null
      const supabase = createAdminClient()

      if (reference?.userId && payerEmail) {
        const query = supabase.from('subscriptions').update({
          mp_payer_email: payerEmail,
          updated_at: new Date().toISOString(),
        }).eq('user_id', reference.userId)
        if (reference.plan) query.eq('plan_id', reference.plan)
        const { error } = await query
        if (error) throw error
      }

      const paymentId = String(payment.id)
      const { data: existingOrder, error: orderFindError } = await supabase.from('orders')
        .select('payment_id').eq('payment_id', paymentId).maybeSingle()
      if (orderFindError) throw orderFindError

      const orderPayload = {
        user_id: reference?.userId ?? null,
        payment_id: paymentId,
        status: payment.status ?? 'unknown',
        amount: payment.transaction_amount ?? null,
      }
      const orderResult = existingOrder
        ? await supabase.from('orders').update(orderPayload).eq('payment_id', paymentId)
        : await supabase.from('orders').insert(orderPayload)
      if (orderResult.error) throw orderResult.error

      return NextResponse.json({ ok: true })
    }

    if (type !== 'subscription_preapproval' && type !== 'preapproval') {
      return NextResponse.json({ ok: true, ignored: true })
    }
    await syncMercadoPagoSubscription(dataId)
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error)
    console.error('[MercadoPago Webhook] Error', detail)
    // Mercado Pago reintentará los fallos; antes siempre respondíamos 200 y se perdían.
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 })
  }
}
