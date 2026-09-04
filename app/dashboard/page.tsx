import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { isPremium } from '@/lib/premium'
import questionsData from '@/questions.json'
import StudyApp, { type Question } from '@/components/study/StudyApp'
import ThemeToggle from '@/components/ThemeToggle'
import SignOutButton from '@/components/SignOutButton'
import PurchaseTracker from '@/components/PurchaseTracker'
import { syncMercadoPagoSubscription } from '@/lib/syncMercadoPagoSubscription'

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

  // Respaldo inmediato del webhook: cuando el cliente vuelve de MP, consultamos directamente
  // el preapproval que guardamos antes de redirigir. También corrige pending antiguos al recargar.
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans transition-colors duration-300">
      {isUserPremium && preapprovalId && (
        <PurchaseTracker preapprovalId={preapprovalId} planId={planId} />
      )}
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Profile & Status Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Bienvenido de nuevo 👋</h1>
            <p className="text-slate-500 dark:text-slate-400">
              {user?.emailAddresses?.[0]?.emailAddress || profile?.email || 'Cargando email...'}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 self-stretch md:self-auto justify-between md:justify-end">
            <ThemeToggle />
            <a
              href="https://www.mercadopago.com.co/subscriptions"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-2 sm:px-4 py-1 rounded-xl border transition-all duration-200 hover:shadow-sm ${
                isUserPremium
                  ? 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100/50 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:hover:bg-emerald-500/20'
                  : 'bg-amber-50 border-amber-100 hover:bg-amber-100/50 dark:bg-amber-500/10 dark:border-amber-500/20 dark:hover:bg-amber-500/20'
              } flex items-center gap-2 sm:gap-3`}
            >
              <div className={`w-3 h-3 rounded-full ${isUserPremium ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
              <div>
                <div className={`text-sm font-bold ${isUserPremium ? 'text-emerald-800 dark:text-emerald-400' : 'text-amber-800 dark:text-amber-400'}`}>
                  {isUserPremium ? 'Suscripción Activa' : 'Pago en Proceso'}
                </div>
                {isUserPremium ? (
                  <div className="text-[12px] text-slate-400 dark:text-slate-400">
                    administrar suscripción
                  </div>
                ) : (
                  <div className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                    Estamos validando tu pago con Mercado Pago.
                  </div>
                )}
              </div>
            </a>
            <SignOutButton />
          </div>
        </div>

        {/* Main Content Area */}
        {isUserPremium ? (
          <StudyApp questions={questionsData as Question[]} />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/20 mb-4">
              <svg className="w-8 h-8 text-amber-600 dark:text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Activando tu acceso...</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Tu pago ha sido recibido y está siendo procesado. En unos momentos tu plataforma de estudio se activará automáticamente.
              Si tarda demasiado, intenta recargar la página.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
