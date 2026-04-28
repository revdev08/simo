import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { isPremium } from '@/lib/premium'

interface DashboardProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardPage(props: DashboardProps) {
  const { userId, getToken } = await auth()

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
             await adminOptions.from('subscriptions').insert({
               user_id: userId,
               mp_preapproval_id: preapprovalId,
               status: mpData.status === 'authorized' ? 'active' : 'pending',
               plan_id: mpPlanId,
               current_period_end: nextPaymentDate
             })
           } catch(e) {
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
      .single()
      
    if (sub && sub.status === 'pending') {
      isPending = true
    } else {
      redirect('/#planes')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido de nuevo 👋</h1>
        <p className="text-gray-500 mb-8">
          Este es tu panel de control principal para tu preparación del examen SIMO.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
            <h2 className="text-sm font-semibold text-purple-600 uppercase tracking-wider mb-1">
              Perfil Activo
            </h2>
            <div className="text-lg font-medium text-gray-900 truncate">
              {profile?.email || 'Cargando email...'}
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2">Error cargando perfil: {error.message}</p>
            )}
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">
              Estado de Suscripción
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${isUserPremium ? 'bg-green-100 text-green-700' : isPending ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                {isUserPremium ? 'Plan Premium' : isPending ? 'Pago en Proceso' : 'Plan Gratuito'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {isPending ? 'Tu pago está siendo procesado por Mercado Pago. Esto puede tardar unos minutos.' : 'Temporalmente sin pagos habilitados.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
