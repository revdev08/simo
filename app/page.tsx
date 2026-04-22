'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import { BookOpen, Brain, TrendingUp, ArrowRight, CheckCircle2, LogOut, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const { openSignIn, openSignUp, signOut } = useClerk()
  const { isSignedIn, user } = useUser()

  const handleSignIn = () => {
    openSignIn({ forceRedirectUrl: '/dashboard' })
  }

  const handleSignUp = () => {
    openSignUp({ forceRedirectUrl: '/dashboard' })
  }

  const handleSignOut = () => {
    signOut()
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">SIMO Prep</span>
            </div>
            
            <div className="flex items-center gap-4">
              {!isSignedIn ? (
                <>
                  <button 
                    onClick={handleSignIn}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Iniciar sesión
                  </button>
                  <button 
                    onClick={handleSignUp}
                    className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                  >
                    Regístrate gratis
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 hidden sm:inline">{user?.primaryEmailAddress?.emailAddress}</span>
                  <button 
                    onClick={handleSignOut}
                    className="text-gray-500 hover:text-red-600 p-2 transition-colors cursor-pointer"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
            <div className="space-y-6 max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
                Aprueba el examen SIMO <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">más rápido</span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-gray-500 leading-relaxed">
                Prepárate con simulacros reales, obtén retroalimentación potenciada por IA y asegura tu puesto en el sector público con nuestra metodología comprobada.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {!isSignedIn ? (
                <button 
                  onClick={handleSignUp}
                  className="w-full sm:w-auto text-lg font-medium bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Empezar ahora <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <Link 
                  href="/dashboard"
                  className="w-full sm:w-auto text-lg font-medium bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Ir al Dashboard <LayoutDashboard className="w-5 h-5" />
                </Link>
              )}
            </div>


            <div className="pt-8 flex justify-center items-center gap-6 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500"/> Sin tarjeta requerida</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500"/> Acceso inmediato</div>
            </div>
          </div>
        </section>

        {/* Features / Beneficios */}
        <section className="bg-gray-50 py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">¿Por qué elegir nuestra plataforma?</h2>
              <p className="mt-4 text-lg text-gray-500">Todo lo que necesitas para dominar la prueba de Estado en un solo lugar.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Simulacros reales</h3>
                <p className="text-gray-500 leading-relaxed">
                  Basados en las últimas convocatorias de la CNSC. Practica con preguntas que realmente evaluarás en tu examen.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Explicaciones con IA</h3>
                <p className="text-gray-500 leading-relaxed">
                  No solo te decimos qué está mal, te explicamos el porqué. Nuestra IA funciona como tu tutor personal 24/7.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Seguimiento de progreso</h3>
                <p className="text-gray-500 leading-relaxed">
                  Visualiza tu crecimiento, identifica tus áreas débiles y optimiza tu tiempo de estudio con datos reales.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} SIMO Prep. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
