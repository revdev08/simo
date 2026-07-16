import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

function isAuthorized(req: Request) {
  const authHeader = req.headers.get('authorization')
  return !!process.env.ADMIN_API_SECRET && authHeader === `Bearer ${process.env.ADMIN_API_SECRET}`
}

// GET /api/admin/subscriptions?email=alguien@ejemplo.com
// Busca el perfil y sus suscripciones por correo, para diagnosticar casos de cuentas
// mezcladas sin tener que correr SQL manual contra Supabase.
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const url = new URL(req.url)
  const email = url.searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Falta el parámetro email' }, { status: 400 })
  }

  const supabaseAdmin = createAdminClient()

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  if (!profile) {
    return NextResponse.json({ profile: null, subscriptions: [] })
  }

  const { data: subscriptions, error: subsError } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  if (subsError) {
    return NextResponse.json({ error: subsError.message }, { status: 500 })
  }

  return NextResponse.json({ profile, subscriptions })
}

// POST /api/admin/subscriptions  { subscription_id, new_user_id }
// Reasigna manualmente el dueño de una suscripción (ej. cuentas mezcladas por correo de pago distinto).
export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const subscriptionId = body?.subscription_id as string | undefined
  const newUserId = body?.new_user_id as string | undefined

  if (!subscriptionId || !newUserId) {
    return NextResponse.json({ error: 'Se requieren subscription_id y new_user_id' }, { status: 400 })
  }

  const supabaseAdmin = createAdminClient()

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('subscriptions')
    .select('id, user_id')
    .eq('id', subscriptionId)
    .maybeSingle()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 })
  }

  const { error: updateError } = await supabaseAdmin
    .from('subscriptions')
    .update({ user_id: newUserId })
    .eq('id', subscriptionId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  console.warn(`[Admin] Suscripción ${subscriptionId} reasignada de ${existing.user_id} a ${newUserId}`)

  return NextResponse.json({
    success: true,
    subscription_id: subscriptionId,
    previous_user_id: existing.user_id,
    new_user_id: newUserId,
  })
}
