import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { isPremium } from '@/lib/premium'

export default async function DashboardPage() {
  const { userId, getToken } = await auth()

  if (!userId) {
    redirect('/')
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

  if (!isUserPremium) {
    redirect('/api/checkout')
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
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${isUserPremium ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {isUserPremium ? 'Plan Premium' : 'Plan Gratuito'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Temporalmente sin pagos habilitados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
