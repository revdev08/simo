import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { isPremium } from '@/lib/premium'
import questionsData from '@/questions.json'
import StudyApp from '@/components/study/StudyApp'
import ThemeToggle from '@/components/ThemeToggle'
import SignOutButton from '@/components/SignOutButton'

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
  if (props.searchParams) {
    const sp = await props.searchParams
    const preapprovalId = sp?.preapproval_id as string

    if (preapprovalId) {
      const { createAdminClient } = await import('@/lib/supabase')
      const adminOptions = createAdminClient()

      const { data: existingSub } = await adminOptions.from('subscriptions')
        .select('id, user_id')
        .eq('mp_preapproval_id', preapprovalId)
        .single()

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

            // Enlazar manualmente y de forma segura
            // Verificamos si el usuario ya tiene un registro (creado por el checkout)
            const { data: userSub } = await adminOptions.from('subscriptions').select('id').eq('user_id', userId).maybeSingle()

            const payload = {
              user_id: userId,
              mp_preapproval_id: preapprovalId,
              status: mpData.status === 'authorized' ? 'active' : 'pending',
              plan_id: mpPlanId,
              current_period_end: nextPaymentDate
            }

            if (userSub) {
              await adminOptions.from('subscriptions').update(payload).eq('id', userSub.id)
            } else {
              await adminOptions.from('subscriptions').insert(payload)
            }
          } catch (e) {
            console.error('Error fetching preapproval from MP in Dashboard:', e)
          }
        }
      } else if (existingSub.user_id !== userId) {

        // Si por alguna razón se enlazó mal, se corrige
        await adminOptions.from('subscriptions')
          .update({ user_id: userId })
          .eq('mp_preapproval_id', preapprovalId)
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
  if (!isUserPremium) {
    const { createAdminClient } = await import('@/lib/supabase')
    const adminOptions = createAdminClient()
    const { data: sub } = await adminOptions.from('subscriptions')
      .select('status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (sub && (sub.status === 'pending' || sub.status === 'active')) {
      isPending = true
    } else {
      redirect('/#planes')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans transition-colors duration-300">
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
          <StudyApp questions={questionsData as any} />
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
