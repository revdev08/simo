import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { isPremium } from '@/lib/premium'
import { getPracticeQuestions } from '@/lib/questions'
import StudyApp from '@/components/study/StudyApp'
import PurchaseTracker from '@/components/PurchaseTracker'
import DashboardShell from '@/components/dashboard/DashboardShell'

interface DashboardProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardPage(props: DashboardProps) {
  const { userId, getToken } = await auth()
  const user = await currentUser()

  if (!userId) {
    redirect('/')
  }

  // Si Mercado Pago nos redirigió de vuelta, enlazamos el preapproval_id al usuario
  let preapprovalId: string | undefined
  if (props.searchParams) {
    const sp = await props.searchParams
    preapprovalId = sp?.preapproval_id as string

    if (preapprovalId) {
      const { createAdminClient } = await import('@/lib/supabase')
      const adminOptions = createAdminClient()

      const { data: existingSub } = await adminOptions.from('subscriptions')
        .select('id, user_id')
        .eq('mp_preapproval_id', preapprovalId)
        .maybeSingle()

      if (!existingSub) {
        // Consultar directamente a MercadoPago API para obtener el preapproval
        const meliAccessToken = process.env.MELI_ACCESS_TOKEN
        if (meliAccessToken) {
          const { MercadoPagoConfig, PreApproval } = await import('mercadopago')
          const client = new MercadoPagoConfig({ accessToken: meliAccessToken })
          const preApproval = new PreApproval(client)
          try {
            const mpData = await preApproval.get({ id: preapprovalId })
            const mpPlanId = (mpData as any)?.preapproval_plan_id || mpData?.reason || 'unknown'
            const nextPaymentDate = (mpData as any)?.next_payment_date || null

            // `external_reference` es la fuente de verdad de a quién pertenece este preapproval,
            // no la sesión de Clerk que esté de visita en /dashboard en este momento (puede ser
            // otra persona con un link viejo, una sesión compartida, etc.)
            const ownerUserId = mpData.external_reference || userId

            if (mpData.external_reference && mpData.external_reference !== userId) {
              console.warn(
                `[Dashboard] external_reference (${mpData.external_reference}) no coincide con la sesión actual (${userId}) para preapproval ${preapprovalId}. Se enlaza al dueño real.`
              )
            }

            // Enlazar manualmente y de forma segura
            // Verificamos si el dueño real ya tiene un registro (creado por el checkout)
            const { data: ownerSub } = await adminOptions.from('subscriptions')
              .select('id')
              .eq('user_id', ownerUserId)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            const payload = {
              user_id: ownerUserId,
              mp_preapproval_id: preapprovalId,
              status: mpData.status === 'authorized' ? 'active' : 'pending',
              plan_id: mpPlanId,
              current_period_end: nextPaymentDate
            }

            if (ownerSub) {
              await adminOptions.from('subscriptions').update(payload).eq('id', ownerSub.id)
            } else {
              await adminOptions.from('subscriptions').insert(payload)
            }
          } catch (e) {
            console.error('Error fetching preapproval from MP in Dashboard:', e)
          }
        }
      } else if (existingSub.user_id !== userId) {
        // Esta suscripción ya está enlazada a otro usuario (el dueño real, según external_reference).
        // No se sobrescribe según quién esté de visita en esta URL.
        console.warn(
          `[Dashboard] Sesión actual (${userId}) visitó /dashboard con preapproval_id=${preapprovalId}, que pertenece a otro usuario (${existingSub.user_id}). No se modifica el enlace.`
        )
      }
    }
  }

  // Obtenemos el token nativo de Clerk
  const token = await getToken()

  if (!token) {
    redirect('/')
  }

  // Creamos el cliente de Supabase optimizado
  const supabase = createSupabaseClient(token)

  // Consultamos el perfil (RLS debe permitir select si id = auth.uid())
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  console.log('user profile', profile)

  // Verificamos estado premium
  const isUserPremium = await isPremium(userId)

  // Verificamos si tiene una suscripción pendiente para no redirigirlo bruscamente
  let isPending = false
  let planId: string | null = null
  {
    const { createAdminClient } = await import('@/lib/supabase')
    const adminOptions = createAdminClient()
    const { data: sub } = await adminOptions.from('subscriptions')
      .select('status, plan_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    planId = sub?.plan_id || null

    if (!isUserPremium) {
      if (sub && (sub.status === 'pending' || sub.status === 'active')) {
        isPending = true
      } else {
        redirect('/#planes')
      }
    }
  }

  const email = user?.emailAddresses?.[0]?.emailAddress || profile?.email || ''

  return (
    <DashboardShell email={email} name={user?.firstName} subscription={isUserPremium ? 'active' : 'pending'}>
      {isUserPremium && preapprovalId && <PurchaseTracker preapprovalId={preapprovalId} planId={planId} />}
      {isUserPremium ? (
        <StudyApp questions={getPracticeQuestions()} userName={user?.firstName} />
      ) : (
        <div className="max-w-xl mx-auto mt-6 sm:mt-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 text-center animate-enter">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/15 mb-5">
            <svg className="w-7 h-7 text-amber-600 dark:text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Estamos activando tu acceso</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Recibimos tu pago y Mercado Pago lo está confirmando. En unos momentos se activa tu plataforma de estudio. Si tarda mucho, recarga la página.
          </p>
        </div>
      )}
    </DashboardShell>
  )
}
