'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import { 
  BookOpen, 
  Brain, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  LogOut, 
  LayoutDashboard, 
  Star, 
  Sparkles, 
  ChevronDown, 
  HelpCircle, 
  ShieldCheck, 
  Flame,
  Check
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'

export default function LandingPage() {
  const { openSignIn, openSignUp, signOut } = useClerk()
  const { isSignedIn, user } = useUser()
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [selectedDemoOption, setSelectedDemoOption] = useState<string | null>(null)

  const handleSignIn = () => {
    openSignIn({ forceRedirectUrl: '/dashboard' })
  }

  const handleSignUp = () => {
    openSignUp({ forceRedirectUrl: '/dashboard' })
  }

  const handleSignOut = () => {
    signOut()
  }

  const faqs = [
    {
      q: "¿Cómo funciona la retroalimentación con Inteligencia Artificial?",
      a: "Nuestra IA analiza cada una de tus respuestas fallidas en tiempo real. No solo te indica cuál era la opción correcta, sino que te explica detalladamente el fundamento legal o lógico de la pregunta, adaptándose a tu nivel de comprensión."
    },
    {
      q: "¿El pago es 100% seguro? ¿Qué métodos aceptan?",
      a: "Sí, procesamos todos los pagos de forma segura a través de Mercado Pago. Puedes pagar con tarjeta de crédito, débito, PSE, efecty o saldo en tu cuenta de Mercado Pago."
    },
    {
      q: "¿Las preguntas están actualizadas con las últimas convocatorias de la CNSC?",
      a: "Totalmente. Nuestro equipo actualiza constantemente la base de datos de preguntas basándose en las guías de orientación y exámenes recientes de la CNSC para procesos del SIMO."
    },
    {
      q: "¿Puedo cancelar mi plan en cualquier momento?",
      a: "Claro que sí. El plan mensual es una suscripción recurrente que puedes pausar o cancelar con un solo clic directamente desde tu perfil o panel de Mercado Pago, sin compromisos a largo plazo."
    }
  ]

  const testimonials = [
    {
      name: "Carlos Mario G.",
      role: "Funcionario en la DIAN",
      rating: 5,
      comment: "Pasé mi examen SIMO a la primera. La retroalimentación de la IA es como tener un tutor personal disponible las 24 horas del día."
    },
    {
      name: "Andrea Restrepo",
      role: "Especialista de Apoyo Jurídico",
      rating: 5,
      comment: "Los simulacros son sumamente parecidos a la prueba real de la CNSC. Recomiendo mucho el plan mensual para estudiar a fondo."
    },
    {
      name: "Jorge Eliecer L.",
      role: "Administrador de Sistemas",
      rating: 5,
      comment: "Me encantó el seguimiento de progreso. Pude enfocarme exactamente en las competencias en las que estaba fallando y obtuve 88/100."
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans dark:bg-slate-950 dark:text-slate-50 selection:bg-blue-500 selection:text-white">
      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/logo.png" alt="SIMO TEST Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain transform hover:rotate-6 transition-transform" />
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200">
                SIMO TEST
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <button
                onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                Planes
              </button>
              <Link
                href="/guia"
                className="relative hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <span className="flex items-center gap-1.5">
                  Guía
                  <span className="text-[9px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-500 text-white px-1.5 py-0.5 rounded-full">
                    Free
                  </span>
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300" />
              </Link>
            </nav>

            <div className="flex items-center gap-2.5 sm:gap-5">
              <ThemeToggle />
              {!isSignedIn ? (
                <>
                  <button
                    onClick={handleSignIn}
                    className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span className="sm:hidden">Entrar</span>
                    <span className="hidden sm:inline">Iniciar sesión</span>
                  </button>
                  <button
                    onClick={handleSignUp}
                    className="text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg shadow-blue-600/20 transition-all hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer btn-shimmer whitespace-nowrap"
                  >
                    <span className="sm:hidden">Registrarse</span>
                    <span className="hidden sm:inline">Registrarse Gratis</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:inline-block bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
                    {user?.primaryEmailAddress?.emailAddress}
                  </span>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-blue-500 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <LayoutDashboard className="w-4 h-4 hidden sm:block" /> Panel
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-slate-400 hover:text-red-500 p-2 transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative overflow-hidden pt-12 pb-24 lg:pt-24 lg:pb-32">
          {/* Neon Glow Accents */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider animate-pulse-subtle">
              <Sparkles className="w-3.5 h-3.5" /> Convocatorias CNSC 2026
            </div>

            <div className="space-y-6 max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white">
                Asegura tu vacante en el Estado <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">con Inteligencia Artificial</span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Prepárate con simulacros actualizados basados en exámenes reales de la CNSC y obtén explicaciones inmediatas con nuestro tutor de IA experto en pruebas SIMO.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
              {!isSignedIn ? (
                <button
                  onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-full transition-all shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer btn-shimmer group"
                >
                  Comenzar ahora <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-full transition-all shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer group"
                >
                  Ir a mi Dashboard <LayoutDashboard className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>

            {/* Quick trust metrics */}
            <div className="pt-8 flex flex-wrap justify-center items-center gap-6 sm:gap-12 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Simulacros CNSC ilimitados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Explicaciones al instante con IA</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Multiples Modulos</span>
              </div>
            </div>

            {/* Interactive Simulator Demo Widget */}
            <div className="pt-8 max-w-5xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-35 transition duration-1000" />
              <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-3 md:p-4">
                
                {/* Browser bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-xl mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 hover:scale-105 transition-transform cursor-pointer" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500 hover:scale-105 transition-transform cursor-pointer" />
                    <span className="w-3 h-3 rounded-full bg-green-500 hover:scale-105 transition-transform cursor-pointer" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider">PROBADOR DE SIMULACRO EN VIVO</span>
                  <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded border border-emerald-500/20">Interactivo</span>
                </div>

                {/* App interface */}
                <div className="w-full bg-slate-950 rounded-xl p-5 sm:p-8 flex flex-col justify-between text-left text-white overflow-hidden border border-slate-900 shadow-inner">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3.5 py-1.5 rounded-lg uppercase tracking-wider">
                        Derecho Administrativo
                      </span>
                      <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-indigo-400 animate-spin-slow" /> Simulador SIMO IA
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-snug">
                      ¿Cuál de las siguientes acciones procede directamente contra un acto administrativo de carácter general expedido por un Ministerio?
                    </h3>
                  </div>

                  <div className="space-y-3 mt-6">
                    {/* Option A */}
                    <button
                      onClick={() => setSelectedDemoOption('A')}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                        selectedDemoOption === null
                          ? 'border-slate-800 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900 cursor-pointer'
                          : selectedDemoOption === 'A'
                          ? 'border-red-500 bg-red-500/10 text-red-200'
                          : 'border-slate-900 bg-slate-950 opacity-40'
                      }`}
                    >
                      <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        selectedDemoOption === 'A' ? 'bg-red-500 text-white' : 'border border-slate-700 text-slate-400'
                      }`}>A</span>
                      <span className="text-sm font-medium">Acción de Tutela de manera preferente.</span>
                    </button>

                    {/* Option B */}
                    <button
                      onClick={() => setSelectedDemoOption('B')}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                        selectedDemoOption === null
                          ? 'border-slate-800 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900 cursor-pointer'
                          : 'border-emerald-500 bg-emerald-500/10 text-emerald-250'
                      }`}
                    >
                      <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        selectedDemoOption !== null ? 'bg-emerald-500 text-white' : 'border border-slate-700 text-slate-400'
                      }`}>B</span>
                      <span className="text-sm font-medium">Acción de Nulidad Simple ante la Jurisdicción Contencioso Administrativa.</span>
                    </button>

                    {/* Option C */}
                    <button
                      onClick={() => setSelectedDemoOption('C')}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                        selectedDemoOption === null
                          ? 'border-slate-800 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900 cursor-pointer'
                          : selectedDemoOption === 'C'
                          ? 'border-red-500 bg-red-500/10 text-red-200'
                          : 'border-slate-900 bg-slate-950 opacity-40'
                      }`}
                    >
                      <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        selectedDemoOption === 'C' ? 'bg-red-500 text-white' : 'border border-slate-700 text-slate-400'
                      }`}>C</span>
                      <span className="text-sm font-medium">Acción de Reparación Directa en cualquier término.</span>
                    </button>
                  </div>

                  {/* AI Explanation Area with transition */}
                  {selectedDemoOption !== null && (
                    <div className="mt-6 p-4 rounded-xl bg-blue-950/40 border border-blue-900/40 text-xs sm:text-sm text-blue-300 flex items-start gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
                      <Brain className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-blue-200 mb-1">
                          {selectedDemoOption === 'B' ? '🎉 ¡Respuesta Correcta!' : '❌ Respuesta Incorrecta (Opción B es la correcta)'}
                        </strong>
                        De acuerdo con el CPACA, los actos administrativos de carácter general no requieren agotar vía gubernativa y su legalidad objetiva se debate mediante la acción de nulidad simple, al no pretenderse el restablecimiento de un derecho particular.
                      </div>
                    </div>
                  )}

                  {selectedDemoOption === null && (
                    <div className="mt-6 text-center text-xs text-slate-500 italic">
                      💡 Haz clic en una opción para probar el simulador interactivo
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Showcase de Entidades del Estado */}
        <section className="py-10 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200/40 dark:border-slate-800/30">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400 dark:text-slate-500 mb-6">
              NUESTROS ESTUDIANTES HAN OBTENIDO VACANTES EN ENTIDADES COMO:
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 opacity-65 grayscale dark:invert">
              <span className="text-lg font-black tracking-tight text-slate-800">DIAN</span>
              <span className="text-lg font-black tracking-tight text-slate-800">FISCALÍA</span>
              <span className="text-lg font-black tracking-tight text-slate-800">ALCALDÍA BOGOTÁ</span>
              <span className="text-lg font-black tracking-tight text-slate-800">ICBF</span>
              <span className="text-lg font-black tracking-tight text-slate-800">MINISTERIOS</span>
              <span className="text-lg font-black tracking-tight text-slate-800">GOBERNACIONES</span>
            </div>
          </div>
        </section>

        {/* Features / Beneficios */}
        <section className="bg-slate-100 dark:bg-slate-900/50 py-24 sm:py-32 relative border-b border-slate-200/50 dark:border-slate-800/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20 max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Metodología Inteligente que sí funciona
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Deja de estudiar memorizando de forma aburrida. Nuestra plataforma te guía dinámicamente hacia el puntaje que necesitas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/80 hover:shadow-xl hover:-translate-y-2 hover:border-blue-500/40 transition-all duration-300 group">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Simulacros Reales</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                  Evaluaciones diseñadas idénticas a las del examen real de la CNSC. Familiarízate con la estructura de las preguntas de juicio situacional.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/80 hover:shadow-xl hover:-translate-y-2 hover:border-indigo-500/40 transition-all duration-300 group">
                <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-8 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <Brain className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Explicaciones con IA</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                  ¿Cometiste un error? Nuestra IA te aclara al instante el sustento de la opción correcta, ahorrándote horas de búsqueda en leyes y decretos.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/80 hover:shadow-xl hover:-translate-y-2 hover:border-purple-500/40 transition-all duration-300 group">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-8 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Estadísticas de Éxito</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                  Identifica fácilmente tus competencias fuertes y tus puntos débiles. Ajusta tu enfoque de estudio con datos concretos de tu evolución.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing / Planes */}
        <section className="py-24 sm:py-32 bg-white dark:bg-slate-950 relative" id="planes">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Elige tu Plan de Preparación
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Invierte hoy en tu estabilidad laboral futura. Asegura tu plaza con la mejor herramienta del mercado.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch px-2">
              {/* Plan Semanal */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                <div>
                  <div className="mb-6 flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">Plan Semanal</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">Perfecto para repasos de último minuto.</p>
                    </div>
                  </div>
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">$19.900</span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">/ semana</span>
                  </div>
                  <ul className="space-y-4 mb-10">
                    <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                      <span className="text-sm font-medium">Simulacros ilimitados</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                      <span className="text-sm font-medium">Explicaciones de IA básicas</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                      <span className="text-sm font-medium">Acceso total por 7 días</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    const planId = '3fa86370a007428f93d188e30e426653'
                    if (!isSignedIn) openSignUp({ forceRedirectUrl: `/api/checkout?planId=${planId}` })
                    else window.location.href = `/api/checkout?planId=${planId}`
                  }}
                  className="w-full text-base font-bold bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 px-6 py-4 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer text-center"
                >
                  Elegir Plan Semanal
                </button>
              </div>

              {/* Plan Mensual (Popular) */}
              <div className="bg-slate-950 text-white p-8 sm:p-10 rounded-3xl flex flex-col justify-between relative transform md:-translate-y-4 border-2 border-blue-500 animate-border-glow shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-500 opacity-20 blur-xl pointer-events-none" />
                <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-white" /> Recomendado
                </div>
                
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-black">Plan Mensual</h3>
                    <p className="text-slate-400 text-sm mt-1.5">La preparación integral para asegurar tu puesto.</p>
                  </div>
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tight text-white">$39.900</span>
                    <span className="text-slate-400 font-medium text-sm">/ mes</span>
                  </div>
                  <ul className="space-y-4 mb-10">
                    <li className="flex items-center gap-3 text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                      <span className="text-sm font-medium">Simulacros reales de la CNSC</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                      <span className="text-sm font-medium">Retroalimentación con IA en tiempo real</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                      <span className="text-sm font-medium">Estadísticas y seguimiento detallado</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                      <span className="text-sm font-medium">Soporte prioritario 24/7</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    const planId = 'e9150a4759e7405b9290f1ace43b1fe6'
                    if (!isSignedIn) openSignUp({ forceRedirectUrl: `/api/checkout?planId=${planId}` })
                    else window.location.href = `/api/checkout?planId=${planId}`
                  }}
                  className="w-full text-base font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] cursor-pointer text-center btn-shimmer"
                >
                  Obtener Acceso Premium
                </button>
              </div>
            </div>

            {/* Security trust badge */}
            <div className="mt-12 flex justify-center items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Pago cifrado y procesado de forma segura por Mercado Pago</span>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 sm:py-32 bg-slate-100 dark:bg-slate-900/40 relative border-t border-slate-200/50 dark:border-slate-800/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Estudiantes que lograron su plaza
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-normal">
                Miles de funcionarios ya estudian con nuestras herramientas digitales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex gap-1 mb-4 text-amber-500">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4.5 h-4.5 fill-amber-500 stroke-none" />
                      ))}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 italic mb-6 text-sm leading-relaxed">
                      &ldquo;{t.comment}&rdquo;
                    </p>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                      Verificado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Accordion FAQ Section */}
        <section className="py-24 sm:py-32 bg-white dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" /> Preguntas Frecuentes
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Resolvemos tus Dudas
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx
                return (
                  <div 
                    key={idx}
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors bg-slate-50/50 dark:bg-slate-900/20"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full text-left p-6 font-bold flex justify-between items-center text-slate-900 dark:text-white focus:outline-none hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <span className="pr-4">{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                    </button>
                    <div 
                      className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-60 border-t border-slate-200/50 dark:border-slate-800/50' : 'max-h-0'}`}
                    >
                      <div className="p-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-900/10">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-white border-t border-slate-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_90%,#1e293b_0%,transparent_100%)] opacity-30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SIMO TEST Logo" className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-white text-base">SIMO TEST</span>
          </div>
          <p>© {new Date().getFullYear()} SIMO TEST. Todos los derechos reservados. Preparación autónoma e independiente.</p>
        </div>
      </footer>
    </div>
  )
}
