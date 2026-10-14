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
import { useEffect, useRef, useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import MobileMenu from '@/components/MobileMenu'
import { fbTrack, PLAN_PRICES } from '@/lib/metaPixel'

export interface AvisoPortada {
  href: string
  texto: string
}

// Pregunta de muestra del simulador: TC-909-004 del banco (Ley 909, art. 6), verificada en la resolución a ciegas.
// Sirve a cualquier aspirante de la CNSC y muestra lo que hace el simulador: explicar cada opción.
const PREGUNTA_DEMO = {
  modulo: 'Empleo público · Ley 909 de 2004',
  enunciado:
    'Una gobernación modifica su planta y declara de libre nombramiento y remoción el empleo de profesional especializado que ocupa Laura, empleada inscrita en carrera administrativa. En la planta no existe ninguna vacante de carrera con funciones afines a las de su empleo. ¿Qué consecuencia tiene esa decisión para Laura?',
  correcta: 'C',
  regla:
    'Si el empleo de un servidor de carrera se declara de libre nombramiento y remoción, se le traslada a un empleo de carrera afín si hay vacante; si no la hay, sigue en su cargo con sus derechos de carrera (art. 6 de la Ley 909 de 2004).',
  opciones: [
    {
      id: 'A',
      texto: 'Debe ser retirada del servicio con indemnización, porque su empleo dejó de pertenecer a la carrera.',
      explicacion:
        'Confunde el cambio de naturaleza del empleo con la supresión del cargo. El art. 6 no prevé el retiro: ordena el traslado o, si no hay vacante, la permanencia en el cargo.',
    },
    {
      id: 'B',
      texto: 'Pasa a ser empleada de libre nombramiento y remoción y pierde sus derechos de carrera desde ese momento.',
      explicacion: 'El art. 6 dice lo contrario: si no hay vacante para trasladarla, conserva los derechos de carrera mientras permanezca en el cargo.',
    },
    {
      id: 'C',
      texto: 'Continúa desempeñando el mismo cargo y conserva sus derechos de carrera mientras permanezca en él.',
      explicacion:
        'Como no existe vacante de carrera con funciones afines, se aplica la segunda parte del art. 6: continúa en el mismo cargo y conserva los derechos de carrera mientras permanezca en él.',
    },
    {
      id: 'D',
      texto: 'Debe ser encargada en otro empleo, de cualquier nivel, hasta que se abra una vacante de carrera afín.',
      explicacion: 'El art. 6 no ordena un encargo. Sin vacante afín, la consecuencia es que siga en su mismo cargo con sus derechos de carrera.',
    },
  ],
}

export default function LandingPage({ avisos = [] }: { avisos?: AvisoPortada[] }) {
  const { openSignIn, openSignUp, signOut } = useClerk()
  const { isSignedIn, user } = useUser()
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [selectedDemoOption, setSelectedDemoOption] = useState<string | null>(null)
  const demoElegida = PREGUNTA_DEMO.opciones.find((o) => o.id === selectedDemoOption) ?? null
  const demoCorrecta = PREGUNTA_DEMO.opciones.find((o) => o.id === PREGUNTA_DEMO.correcta)!
  const planesViewedRef = useRef(false)

  useEffect(() => {
    const el = document.getElementById('planes')
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !planesViewedRef.current) {
          planesViewedRef.current = true
          fbTrack('ViewContent', {
            content_name: 'Planes de Precios',
            content_ids: ['semanal', 'anual'],
            currency: 'COP',
          })
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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
      q: "¿Puedo cancelar o pausar mi plan en cualquier momento?",
      a: "Sí, sin compromisos a largo plazo. Tu suscripción se administra directamente desde Mercado Pago: entra a tu Panel y haz clic en 'administrar suscripción', o ingresa a mercadopago.com.co/subscriptions con la cuenta de Mercado Pago que usaste para pagar; ahí puedes pausar o cancelar con un clic, cuando quieras. Te recomendamos usar una cuenta de Mercado Pago asociada al mismo correo con el que te registraste en SIMO Test (o al menos tener alguna cuenta de Mercado Pago activa), para que siempre tengas a la mano desde dónde gestionar tu pago. Y si tienes cualquier inconveniente, con gusto te ayudamos escribiendo a revolutiondev08@gmail.com."
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
      comment: "Los simulacros son sumamente parecidos a la prueba real de la CNSC. Recomiendo el plan anual para prepararse con tiempo y estudiar a fondo."
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

            <nav className="hidden lg:flex items-center gap-6 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-300">
              <button
                onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                Planes
              </button>
              <Link
                href="/simulacro-gratis"
                className="relative hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <span className="flex items-center gap-1.5">
                  Simulacro
                  <span className="text-[9px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-1.5 py-0.5 rounded-full">
                    Free
                  </span>
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/mi-convocatoria"
                className="relative hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                Mi convocatoria
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/concurso-docente"
                className="relative hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                Concurso docente
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/guia"
                className="relative hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                Guía
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300" />
              </Link>
            </nav>

            <div className="flex items-center gap-2 sm:gap-5">
              <ThemeToggle />
              {!isSignedIn ? (
                <>
                  <button
                    onClick={handleSignUp}
                    className="hidden sm:inline-flex text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg shadow-blue-600/20 transition-all hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer btn-shimmer whitespace-nowrap"
                  >
                    Registrarse Gratis
                  </button>
                  <MobileMenu current="home" />
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
                    className="hidden sm:inline-flex text-slate-400 hover:text-red-500 p-2 transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 items-center"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                  <MobileMenu current="home" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        {/* Avisos de convocatorias (los decide app/page.tsx según la fecha) */}
        {avisos.length > 0 && (
          <div className="border-b border-blue-200/70 dark:border-blue-900/60 bg-blue-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-1 text-center text-sm font-semibold">
              {avisos.map((a) => (
                <Link key={a.href} href={a.href} className="group inline-flex items-center gap-2 py-0.5 hover:underline">
                  <span>{a.texto}</span>
                  <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              ))}
            </div>
          </div>
        )}
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
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3.5 py-1.5 rounded-lg uppercase tracking-wider">
                        {PREGUNTA_DEMO.modulo}
                      </span>
                      <span className="text-xs font-bold text-indigo-400 flex items-center gap-1 shrink-0">
                        <Sparkles className="w-4 h-4 text-indigo-400 animate-spin-slow" /> Simulador SIMO IA
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold leading-snug">
                      {PREGUNTA_DEMO.enunciado}
                    </h3>
                  </div>

                  <div className="space-y-3 mt-6">
                    {PREGUNTA_DEMO.opciones.map((o) => {
                      const esCorrecta = o.id === PREGUNTA_DEMO.correcta
                      const esElegida = o.id === selectedDemoOption
                      const estilo = !demoElegida
                        ? 'border-slate-800 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900 cursor-pointer'
                        : esCorrecta
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-100'
                          : esElegida
                            ? 'border-red-500 bg-red-500/10 text-red-200'
                            : 'border-slate-900 bg-slate-950 opacity-40'
                      const circulo = demoElegida && esCorrecta ? 'bg-emerald-500 text-white' : esElegida ? 'bg-red-500 text-white' : 'border border-slate-700 text-slate-400'
                      return (
                        <button
                          key={o.id}
                          type="button"
                          disabled={!!demoElegida}
                          onClick={() => setSelectedDemoOption(o.id)}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${estilo}`}
                        >
                          <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${circulo}`}>{o.id}</span>
                          <span className="text-sm font-medium">{o.texto}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Explicación de la opción elegida y de la correcta */}
                  {demoElegida && (
                    <div className="mt-6 p-4 rounded-xl bg-blue-950/40 border border-blue-900/40 text-xs sm:text-sm text-blue-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
                      <Brain className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <strong className="block text-white">
                          {demoElegida.id === demoCorrecta.id ? '🎉 ¡Respuesta correcta!' : `❌ La ${demoElegida.id} no es correcta: la respuesta es la ${demoCorrecta.id}`}
                        </strong>
                        {demoElegida.id !== demoCorrecta.id && (
                          <p>
                            <span className="font-semibold text-red-300">Por qué la {demoElegida.id} no:</span> {demoElegida.explicacion}
                          </p>
                        )}
                        <p>
                          <span className="font-semibold text-emerald-300">Por qué la {demoCorrecta.id}:</span> {demoCorrecta.explicacion}
                        </p>
                        <p className="text-blue-300">
                          <span className="font-semibold">Regla:</span> {PREGUNTA_DEMO.regla}
                        </p>
                        <button type="button" onClick={() => setSelectedDemoOption(null)} className="font-semibold text-blue-300 hover:text-white hover:underline underline-offset-2">
                          Intentar otra vez
                        </button>
                      </div>
                    </div>
                  )}

                  {!demoElegida && (
                    <div className="mt-6 text-center text-xs text-slate-500 italic">
                      💡 Elige una opción: en el simulador cada pregunta explica por qué cada opción es correcta o no
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
                    <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">$19900</span>
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
                    const planId = 'semanal'
                    fbTrack('InitiateCheckout', {
                      content_name: 'Plan Semanal',
                      content_ids: [planId],
                      value: PLAN_PRICES[planId],
                      currency: 'COP',
                    })
                    if (!isSignedIn) openSignUp({ forceRedirectUrl: `/api/checkout?plan=${planId}` })
                    else window.location.href = `/api/checkout?plan=${planId}`
                  }}
                  className="w-full text-base font-bold bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 px-6 py-4 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer text-center"
                >
                  Elegir Plan Semanal
                </button>
              </div>

              {/* Plan Anual (Popular) */}
              <div className="bg-slate-950 text-white p-8 sm:p-10 rounded-3xl flex flex-col justify-between relative transform md:-translate-y-4 border-2 border-blue-500 animate-border-glow shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-500 opacity-20 blur-xl pointer-events-none" />
                <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-white" /> Recomendado
                </div>
                
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-black">Plan Anual</h3>
                    <p className="text-slate-400 text-sm mt-1.5">Prepárate sin afanes para todas tus convocatorias.</p>
                  </div>
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tight text-white">$119000</span>
                    <span className="text-slate-400 font-medium text-sm">/ año</span>
                  </div>
                  <p className="-mt-5 mb-8 text-sm font-semibold text-emerald-400">
                    Ahorras $359.800 frente a pagar 12 meses por separado.
                  </p>
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
                    const planId = 'anual'
                    fbTrack('InitiateCheckout', {
                      content_name: 'Plan Anual',
                      content_ids: [planId],
                      value: PLAN_PRICES[planId],
                      currency: 'COP',
                    })
                    if (!isSignedIn) openSignUp({ forceRedirectUrl: `/api/checkout?plan=${planId}` })
                    else window.location.href = `/api/checkout?plan=${planId}`
                  }}
                  className="w-full text-base font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] cursor-pointer text-center btn-shimmer"
                >
                  Obtener Plan Anual
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
