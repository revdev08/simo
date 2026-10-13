import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { cancelMpSubscription, createMpSubscription, getMpToken, isCheckoutPlan, resolveMpPlan } from '@/lib/mercadopago'
import { isPremium } from '@/lib/premium'
import { syncMercadoPagoSubscription } from '@/lib/syncMercadoPagoSubscription'
import { emailEsAdmin } from '@/lib/admin/acceso'

export async function GET(req: Request) {
  let createdPreapprovalId: string | null = null

  try {
    const { userId } = await auth()
    const user = await currentUser()
    if (!userId || !user) return NextResponse.redirect(new URL('/', req.url))
    if (!getMpToken()) return new NextResponse('Mercado Pago no está configurado', { status: 500 })

    let email = (user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress)?.toLowerCase()
    if (!email) return new NextResponse('Tu cuenta necesita un correo electrónico', { status: 400 })

    const url = new URL(req.url)
    const plan = resolveMpPlan(url.searchParams.get('plan') ?? url.searchParams.get('planId') ?? 'anual')
    if (!plan || !isCheckoutPlan(plan)) {
      return new NextResponse('Plan inválido. Usa "semanal" o "anual".', { status: 400 })
    }

    // El plan técnico no se anuncia y se protege siempre en el servidor.
    if (plan === 'desarrollador') {
      const adminAddress = user.emailAddresses.find((address) =>
        address.verification?.status === 'verified' && emailEsAdmin(address.emailAddress)
      )
      if (!adminAddress) return new NextResponse('No encontrado', { status: 404 })
      email = adminAddress.emailAddress.toLowerCase()
    }
    if (await isPremium(userId)) {
      if (plan === 'desarrollador') {
        return NextResponse.json(
          { error: 'Usa una cuenta administrativa de prueba que todavía no tenga una suscripción activa.' },
          { status: 409 }
        )
      }
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    const supabase = createAdminClient()
    const { data: existing, error: findError } = await supabase
      .from('subscriptions')
      .select('id, status, mp_preapproval_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (findError) throw findError

    // Antes de reemplazar un pending, consultamos MP: podría estar pagado y el webhook retrasado.
    if (existing?.status === 'pending' && existing.mp_preapproval_id) {
      const synchronized = await syncMercadoPagoSubscription(existing.mp_preapproval_id).catch(() => null)
      if (synchronized?.status === 'active') return NextResponse.redirect(new URL('/dashboard', req.url))
      if (!synchronized || synchronized.status === 'pending') {
        await cancelMpSubscription(existing.mp_preapproval_id).catch((error: unknown) => {
          console.warn('[Checkout] No se pudo cancelar el intento pending anterior', error)
        })
      }
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? url.origin).replace(/\/$/, '')
    const mpSubscription = await createMpSubscription({ planKey: plan, userId, email, appUrl })
    createdPreapprovalId = mpSubscription.id

    const payload = {
      user_id: userId,
      status: 'pending',
      plan_id: plan,
      mp_preapproval_id: mpSubscription.id,
      current_period_end: null,
      checkout_email: email,
      mp_payer_email: mpSubscription.payer_email?.toLowerCase() ?? email,
      updated_at: new Date().toISOString(),
    }
    const result = existing
      ? await supabase.from('subscriptions').update(payload).eq('id', existing.id)
      : await supabase.from('subscriptions').insert(payload)
    if (result.error) throw result.error

    console.log('[Checkout] Preapproval guardada antes de redirigir', {
      userId, email, plan, mpPreapprovalId: mpSubscription.id,
    })
    return NextResponse.redirect(mpSubscription.init_point!)
  } catch (error: unknown) {
    if (createdPreapprovalId) {
      await cancelMpSubscription(createdPreapprovalId).catch((cancelError: unknown) => {
        console.error('[Checkout] No se pudo cancelar la preapproval huérfana', cancelError)
      })
    }
    const detail = error instanceof Error ? error.message : String(error)
    console.error('[Checkout] Error', detail)
    return NextResponse.json({ error: 'No pudimos iniciar el pago', detail }, { status: 500 })
  }
}
