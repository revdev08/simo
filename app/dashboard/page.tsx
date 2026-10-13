import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { isPremium } from '@/lib/premium'
import { getPracticeQuestions } from '@/lib/questions'
import StudyApp from '@/components/study/StudyApp'
import PurchaseTracker from '@/components/PurchaseTracker'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { syncMercadoPagoSubscription } from '@/lib/syncMercadoPagoSubscription'

// El panel es privado: los buscadores no deben indexarlo
export const metadata = { title: 'Panel', robots: { index: false, follow: false } }

interface DashboardProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardPage(props: DashboardProps) {
  const { userId, getToken } = await auth()
  const user = await currentUser()

  if (!userId) {
    redirect('/')
  }

  const searchParams = props.searchParams ? await props.searchParams : undefined
  let preapprovalId = typeof searchParams?.preapproval_id === 'string' ? searchParams.preapproval_id : undefined

  // Respaldo del webhook: reconciliamos directamente el preapproval que el checkout
  // guardó antes de redirigir a Mercado Pago. Una recarga también recupera pagos demorados.
  const { createAdminClient } = await import('@/lib/supabase')
  const initialAdmin = createAdminClient()
  const { data: pendingSubscription } = await initialAdmin.from('subscriptions')
    .select('mp_preapproval_id')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const pendingPreapprovalId = pendingSubscription?.mp_preapproval_id
  if (pendingPreapprovalId) {
    preapprovalId = pendingPreapprovalId
    await syncMercadoPagoSubscription(pendingPreapprovalId).catch((error: unknown) => {
      console.error('[Dashboard] No se pudo reconciliar el pago pendiente', error)
    })
  }

  // Obtenemos el token nativo de Clerk
  const token = await getToken()

  if (!token) {
    redirect('/')
  }

  // Creamos el cliente de Supabase optimizado
  const supabase = createSupabaseClient(token)

  // Consultamos el perfil (RLS debe permitir select si id = auth.uid())
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError) console.error('[Dashboard] Error consultando el perfil', profileError)

  // Verificamos estado premium
  const isUserPremium = await isPremium(userId)

  // Verificamos si tiene una suscripción pendiente para no redirigirlo bruscamente
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
      if (!sub || (sub.status !== 'pending' && sub.status !== 'active')) {
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
