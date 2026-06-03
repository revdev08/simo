'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import {
  ArrowRight,
  Sparkles,
  Lightbulb,
  Scale,
  GraduationCap,
  Users,
  TrendingUp,
  Laptop,
  ShieldCheck,
  Briefcase,
  BookOpen,
  Rocket,
  LayoutDashboard,
  LogOut,
  Target,
  Zap,
  Compass,
  Map,
  Flag,
  Search,
  Brain,
  CalendarDays,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Hourglass,
  Crosshair,
  Layers,
  FileSearch,
  BarChart3,
  Timer,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'

type PhaseColor = 'blue' | 'purple' | 'rose' | 'emerald'

interface Phase {
  id: number
  label: string
  title: string
  blurb: string
  color: PhaseColor
  duration: string
  icon: React.ReactNode
  bullets: { title: string; body: string }[]
  realTalk: string
}

const phaseColors: Record<PhaseColor, {
  text: string
  bg: string
  bgSoft: string
  border: string
  ring: string
  gradient: string
}> = {
  blue:    { text: 'text-blue-500',    bg: 'bg-blue-500',    bgSoft: 'bg-blue-500/10',    border: 'border-blue-500/40',    ring: 'ring-blue-500/30',    gradient: 'from-blue-500 to-cyan-500' },
  purple:  { text: 'text-purple-500',  bg: 'bg-purple-500',  bgSoft: 'bg-purple-500/10',  border: 'border-purple-500/40',  ring: 'ring-purple-500/30',  gradient: 'from-purple-500 to-fuchsia-500' },
  rose:    { text: 'text-rose-500',    bg: 'bg-rose-500',    bgSoft: 'bg-rose-500/10',    border: 'border-rose-500/40',    ring: 'ring-rose-500/30',    gradient: 'from-rose-500 to-orange-500' },
  emerald: { text: 'text-emerald-500', bg: 'bg-emerald-500', bgSoft: 'bg-emerald-500/10', border: 'border-emerald-500/40', ring: 'ring-emerald-500/30', gradient: 'from-emerald-500 to-teal-500' },
}

const phases: Phase[] = [
  {
    id: 1,
    label: 'Fase 01 · Reconocimiento',
    title: 'Antes de que abran la convocatoria',
    blurb: 'Los aspirantes que ganan empiezan a moverse meses antes de que se publique el acuerdo. Aquí no pierdes tiempo: lo inviertes.',
    color: 'blue',
    duration: '3–6 meses antes',
    icon: <Compass className="w-5 h-5" />,
    bullets: [
      { title: 'Mapea entidades', body: 'Identifica 3 o 4 entidades donde tu perfil encaje. Mira sus plantas de personal y los cargos que históricamente sacan a concurso.' },
      { title: 'Domina lo transversal', body: 'Constitución, Ley 909/2004, estructura del Estado y normas anticorrupción aparecen en casi todas las convocatorias. Empieza por ahí.' },
      { title: 'Ordena tus papeles', body: 'Digitaliza títulos, certificados laborales y diplomas en alta resolución. En SIMO no se aceptan documentos borrosos.' },
    ],
    realTalk: 'La convocatoria no avisa con un mes de anticipación: cuando sale, ya hay aspirantes que llevan medio año estudiando.',
  },
  {
    id: 2,
    label: 'Fase 02 · Posicionamiento',
    title: 'La inscripción que decide el juego',
    blurb: 'En SIMO solo eliges un empleo por convocatoria. Esa decisión, hecha en 10 minutos, define contra cuántas personas vas a competir.',
    color: 'purple',
    duration: '15–30 días',
    icon: <Crosshair className="w-5 h-5" />,
    bullets: [
      { title: 'Calcula tu OPEC', body: 'Revisa cuántas vacantes (OPEC) ofrece el cargo. No es lo mismo competir por 1 plaza que por 47, aunque el examen sea el mismo.' },
      { title: 'Lee el ratio inscritos/vacantes', body: 'SIMO publica el número de inscritos. Si ves 800 inscritos para 2 vacantes, tu probabilidad estructural cambia drásticamente.' },
      { title: 'Paga el PIN con tiempo', body: 'El PIN va entre $43.350 y $65.000 según el nivel. Págalo con días de margen — los servidores de SIMO colapsan al cierre.' },
    ],
    realTalk: 'Elegir el cargo "más fácil" suele ser una trampa: ese mismo razonamiento lo hicieron otros 1.200 aspirantes.',
  },
  {
    id: 3,
    label: 'Fase 03 · Evaluación',
    title: 'Donde se gana o se pierde la plaza',
    blurb: 'Verificación de requisitos, pruebas escritas y antecedentes. Aquí más del 70% de los inscritos sale del proceso.',
    color: 'rose',
    duration: '4–8 meses',
    icon: <Target className="w-5 h-5" />,
    bullets: [
      { title: 'Requisitos mínimos', body: 'Antes de poder presentar pruebas, la entidad valida tu perfil. Un certificado mal expedido te elimina sin examen.' },
      { title: 'Pruebas escritas (60–80% del puntaje)', body: 'Competencias funcionales del cargo + comportamentales. Es donde se define el orden de la lista.' },
      { title: 'Antecedentes (10–30%)', body: 'Solo en algunas convocatorias. Estudios superiores y experiencia adicional pueden sumarte hasta 10 puntos extra.' },
    ],
    realTalk: 'La fase escrita no premia al que más sabe, sino al que más eficientemente responde bajo presión y tiempo limitado.',
  },
  {
    id: 4,
    label: 'Fase 04 · Cierre',
    title: 'Lista de elegibles y nombramiento',
    blurb: 'Quedaste. Ahora viene la parte que casi nadie explica bien: cómo se traduce un puntaje en una plaza real.',
    color: 'emerald',
    duration: '2 años de vigencia',
    icon: <Flag className="w-5 h-5" />,
    bullets: [
      { title: 'Lista en estricto orden de mérito', body: 'El primero tiene prioridad. Si rechaza, baja al siguiente. Por eso la posición #4 con frecuencia termina nombrada.' },
      { title: 'Período de prueba: 6 meses', body: 'Te evalúan desempeño. Si lo apruebas, adquieres derechos de carrera. Si no, vuelves a la lista.' },
      { title: 'Vigencia 2 años (Ley 909/2004)', body: 'La lista no se vence el día siguiente. Tienes una ventana real para ser llamado por vacantes equivalentes.' },
    ],
    realTalk: 'Quedar de número 6 con lista de 2 vacantes no es el final. Es el comienzo de la espera estratégica.',
  },
]

const stats = [
  { value: '4', label: 'Fases del proceso CNSC', sub: 'desde inscripción hasta nombramiento' },
  { value: '909/2004', label: 'La ley que rige todo', sub: 'modificada por la 1960 de 2019' },
  { value: '2 años', label: 'Vigencia de la lista', sub: 'incluso si no fuiste nombrado de inmediato' },
  { value: '6 meses', label: 'Período de prueba', sub: 'al final adquieres derechos de carrera' },
]

const manualKeys = [
  { icon: <FileSearch className="w-5 h-5" />, key: 'Identificación del empleo', body: 'Denominación, código, grado y nivel jerárquico. Define el salario base y el tipo de prueba que vas a presentar.' },
  { icon: <Layers className="w-5 h-5" />,     key: 'Funciones esenciales',     body: 'Aquí viven las preguntas. El examen interroga sobre lo que dice este apartado, no sobre la teoría general del cargo.' },
  { icon: <ShieldCheck className="w-5 h-5" />, key: 'Requisitos mínimos',     body: 'Estudios y experiencia exigidos. Si un mes te falta para cumplir, no aplicas. La CNSC no acepta "equivalencias creativas".' },
  { icon: <Brain className="w-5 h-5" />,       key: 'Competencias comportamentales', body: 'Liderazgo, orientación al usuario, trabajo en equipo. Marcan el 20–40% del puntaje y la mayoría las subestima.' },
]

const examAnatomy = [
  { label: 'Competencias funcionales',     pct: 60, color: 'bg-blue-500',    desc: 'Conocimiento técnico del cargo. Normatividad, procedimientos, casos prácticos.' },
  { label: 'Competencias comportamentales', pct: 30, color: 'bg-purple-500',  desc: 'Cómo actúas ante situaciones reales del servicio público. Sin respuestas "obvias".' },
  { label: 'Análisis y aplicación',         pct: 10, color: 'bg-emerald-500', desc: 'Razonamiento, comprensión lectora y resolución de problemas integrados.' },
]

const timeline = [
  { range: '90 días antes', icon: <Map className="w-5 h-5" />,        action: 'Cubrir bases',     body: 'Constitución, Ley 909, estructura del Estado. La base que sirve para cualquier cargo.' },
  { range: '60 días antes', icon: <Search className="w-5 h-5" />,     action: 'Estudiar el cargo', body: 'Manual de funciones, normas sectoriales, decretos reglamentarios del área específica.' },
  { range: '30 días antes', icon: <BarChart3 className="w-5 h-5" />, action: 'Medir avance',     body: 'Simulacros cronometrados. Detecta qué tipo de preguntas te frenan y corrige el sesgo.' },
  { range: '7 días antes',  icon: <Timer className="w-5 h-5" />,     action: 'Calibrar ritmo',   body: 'Repaso de errores frecuentes, descanso, logística del día del examen. No memorices más.' },
]

const myths = [
  { false: 'Necesitas estudiar 10 horas diarias.',           true: 'Necesitas estudiar los temas correctos. 3 horas enfocadas superan 10 dispersas.' },
  { false: 'Sin experiencia laboral no puedes aspirar.',     true: 'Hay cargos del nivel asistencial y técnico que exigen "0 meses". Solo título.' },
  { false: 'Si quedas en la lista te nombran sí o sí.',      true: 'Te nombran si estás en el orden de vacantes disponibles. Por eso la Ley 1960 importa.' },
  { false: 'La prueba mide cuánto sabes de memoria.',        true: 'Mide cómo aplicas lo que sabes a un caso real, en 90 segundos por pregunta.' },
]

const lawBenefits = [
  { title: 'Uso obligatorio de listas vigentes',  body: 'Las entidades no pueden ignorar una lista de elegibles vigente para llenar vacantes equivalentes. Es ley, no recomendación.' },
  { title: 'Cargos equivalentes',                 body: 'Si surge una vacante con funciones similares al cargo que concursaste, deben recurrir a la lista existente antes de abrir nueva convocatoria.' },
  { title: 'Derecho a verificación',              body: 'Puedes pedir formalmente que la entidad revise si una vacante específica te corresponde. Tienen 15 días hábiles para responder.' },
  { title: 'Concepto técnico de la CNSC',         body: 'En caso de duda, la entidad consulta a la CNSC sobre la compatibilidad. Ese concepto es vinculante.' },
]

type ProfileTab = 'universitarios' | 'experimentados' | 'ascenso'

const tipsByProfile: Record<ProfileTab, { icon: React.ReactNode; title: string; body: string }[]> = {
  universitarios: [
    { icon: <GraduationCap className="w-5 h-5" />, title: 'Cargos "0 meses"',            body: 'Filtra empleos que no exijan experiencia. Son tu puerta natural de entrada al sector público.' },
    { icon: <BookOpen className="w-5 h-5" />,      title: 'Empieza por lo transversal', body: 'Constitución, Ley 909, ética pública. Sirven para 90% de los cargos que aplicarás en tu vida.' },
    { icon: <Brain className="w-5 h-5" />,         title: 'Practica casos, no teoría',  body: 'En la universidad memorizas. En SIMO te miden razonamiento aplicado. Es otra disciplina.' },
    { icon: <Users className="w-5 h-5" />,         title: 'Pasantías como experiencia', body: 'Algunas prácticas profesionales en entidades públicas certifican como meses de experiencia laboral.' },
    { icon: <Laptop className="w-5 h-5" />,        title: 'Entrena con simulacros',     body: 'En SIMO TEST cada error viene con explicación instantánea de la IA. Aprendes el porqué, no solo la respuesta correcta.' },
    { icon: <Target className="w-5 h-5" />,        title: 'No apuntes al cargo perfecto', body: 'Tu primer concurso es para aprender el sistema. Apunta a entrar; ya escalarás por ascenso.' },
  ],
  experimentados: [
    { icon: <Briefcase className="w-5 h-5" />,    title: 'Certifica TODO',                  body: 'Cada año laboral debidamente certificado pesa en la fase de antecedentes. Recupera certificados viejos.' },
    { icon: <TrendingUp className="w-5 h-5" />,   title: 'Apunta a nivel profesional',     body: 'Los cargos profesional/asesor exigen experiencia que ya tienes. Ahí compites con menos gente.' },
    { icon: <ShieldCheck className="w-5 h-5" />,  title: 'Tus comportamentales pesan',     body: 'En cargos de gestión, las preguntas comportamentales son la mitad del juego. Tu trayectoria ayuda.' },
    { icon: <Lightbulb className="w-5 h-5" />,    title: 'Diplomados estratégicos',        body: 'Un diplomado en área afín puede sumar entre 2 y 10 puntos en antecedentes. Calcula el ROI.' },
    { icon: <Hourglass className="w-5 h-5" />,    title: 'Tiempo limitado, foco quirúrgico', body: 'No tienes 8 horas al día. Concentra el estudio en los temas con mayor peso porcentual del examen.' },
    { icon: <Zap className="w-5 h-5" />,          title: 'Ritmo de examen',                body: 'Llevas años sin presentar pruebas escritas. Necesitas reentrenar el ritmo bajo cronómetro.' },
  ],
  ascenso: [
    { icon: <TrendingUp className="w-5 h-5" />,   title: 'Solo carrera vs todos',         body: 'En convocatorias de ascenso compites solo contra funcionarios de carrera. Universo más pequeño, ventaja real.' },
    { icon: <Briefcase className="w-5 h-5" />,    title: 'Tu evaluación cuenta',          body: 'Mantén tu evaluación de desempeño en sobresaliente. Es requisito y muchos lo descuidan.' },
    { icon: <BookOpen className="w-5 h-5" />,     title: 'Conoce tu entidad a fondo',    body: 'Estatuto orgánico, manual interno, procesos. El examen interroga eso, y tú ya lo vives.' },
    { icon: <Layers className="w-5 h-5" />,       title: 'Apunta un nivel arriba',        body: 'Asistencial → técnico, técnico → profesional. Saltos de un nivel son los más alcanzables.' },
    { icon: <Crosshair className="w-5 h-5" />,    title: 'Salto salarial real',           body: 'Un ascenso bien planeado puede significar 40–60% más de salario. La inversión en preparación se justifica sola.' },
    { icon: <BarChart3 className="w-5 h-5" />,    title: 'Trata el examen como nuevo',    body: 'El error clásico del ascenso: subestimar. Estudia con la disciplina del primer concurso.' },
  ],
}

export default function GuiaPage() {
  const { openSignIn, openSignUp, signOut } = useClerk()
  const { isSignedIn, user } = useUser()
  const [activeTab, setActiveTab] = useState<ProfileTab>('universitarios')
  const [activePhase, setActivePhase] = useState<number>(1)

  const handleSignIn = () => openSignIn({ forceRedirectUrl: '/dashboard' })
  const handleSignUp = () => openSignUp({ forceRedirectUrl: '/dashboard' })
  const handleSignOut = () => signOut()

  const currentPhase = phases.find((p) => p.id === activePhase) ?? phases[0]
  const c = phaseColors[currentPhase.color]

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans dark:bg-slate-950 dark:text-slate-50 selection:bg-blue-500 selection:text-white">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <img src="/logo.png" alt="SIMO TEST Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain transform hover:rotate-6 transition-transform" />
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200">
                SIMO TEST
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Inicio</Link>
              <Link href="/#planes" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Planes</Link>
              <Link href="/guia" className="text-blue-600 dark:text-blue-400 font-bold">Guía</Link>
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

      <main className="flex-grow">
        {/* HERO */}
        <section className="relative overflow-hidden pt-16 pb-12 lg:pt-24">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-rose-500/10 blur-[140px] rounded-full pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider animate-pulse-subtle">
              <Compass className="w-3.5 h-3.5" /> El playbook del aspirante · Gratis
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.02] text-slate-900 dark:text-white">
              Del aspirante{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600">al funcionario</span>
              <br />
              <span className="text-slate-500 dark:text-slate-400 font-bold">la ruta sin atajos.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              Una hoja de ruta directa, sin jerga legal, escrita para quien quiere entender cómo funciona <strong className="text-slate-700 dark:text-slate-200">de verdad</strong> el concurso de mérito en Colombia.
            </p>

            {/* Quick anchor pills */}
            <div className="pt-2 flex flex-wrap justify-center gap-2 text-xs font-semibold">
              {[
                { href: '#fases', label: '4 fases' },
                { href: '#manual', label: 'Decodificar el manual' },
                { href: '#examen', label: 'Anatomía del examen' },
                { href: '#calendario', label: 'Calendario' },
                { href: '#mitos', label: 'Mitos' },
                { href: '#ley1960', label: 'Ley 1960' },
                { href: '#perfiles', label: 'Por perfil' },
              ].map((a) => (
                <a
                  key={a.href}
                  href={a.href}
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {a.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* STATS STRIP */}
        <section className="py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur p-5 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
                >
                  <div className="text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                    {s.value}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-1.5">
                    {s.label}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FASES — interactive switcher */}
        <section id="fases" className="relative py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                <Map className="w-3.5 h-3.5" /> El recorrido completo
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                4 fases que decidirán tu plaza
              </h2>
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-normal max-w-2xl mx-auto">
                No son trámites burocráticos. Cada fase tiene reglas no escritas que separan a los que ganan de los que se quedan.
              </p>
            </div>

            {/* Phase tabs (top strip) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
              {phases.map((p) => {
                const pc = phaseColors[p.color]
                const active = activePhase === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePhase(p.id)}
                    className={`group relative text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      active
                        ? `${pc.border} bg-white dark:bg-slate-900 shadow-lg`
                        : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {active && (
                      <span className={`absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r ${pc.gradient} rounded-full`} />
                    )}
                    <div className={`flex items-center gap-2 mb-2 ${active ? pc.text : 'text-slate-400'}`}>
                      {p.icon}
                      <span className="text-[10px] font-extrabold uppercase tracking-widest">
                        Fase 0{p.id}
                      </span>
                    </div>
                    <div className={`text-sm font-bold leading-tight ${active ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {p.title}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Active phase panel */}
            <div
              key={currentPhase.id}
              className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.gradient}`} />

              <div className="grid lg:grid-cols-[1fr_1.4fr] gap-0">
                {/* Left: identity */}
                <div className={`p-7 sm:p-10 ${c.bgSoft} border-b lg:border-b-0 lg:border-r ${c.border}`}>
                  <div className={`inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest ${c.text} mb-4`}>
                    <span className="px-2 py-1 rounded-md bg-white/70 dark:bg-slate-950/40 ring-1 ring-current/30">
                      {currentPhase.label}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                    {currentPhase.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    {currentPhase.blurb}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Hourglass className="w-3.5 h-3.5" />
                    Duración típica
                    <span className={`${c.text} font-extrabold`}>· {currentPhase.duration}</span>
                  </div>

                  <div className="mt-8 p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Real talk
                    </div>
                    <p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed">
                      &ldquo;{currentPhase.realTalk}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Right: action items */}
                <div className="p-7 sm:p-10 space-y-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                    Acciones concretas
                  </div>
                  {currentPhase.bullets.map((b, i) => (
                    <div
                      key={i}
                      className="group flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className={`shrink-0 w-8 h-8 rounded-lg ${c.bgSoft} ${c.text} flex items-center justify-center text-xs font-extrabold ring-1 ${c.ring}`}>
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
                          {b.title}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                          {b.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DECODE THE MANUAL */}
        <section id="manual" className="py-16 sm:py-24 bg-slate-100 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-16 items-start">
              <div className="lg:sticky lg:top-28 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                  <FileSearch className="w-3.5 h-3.5" /> Decodifica el manual
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  El manual de funciones no es un PDF. Es el mapa del examen.
                </h2>
                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  El 80% de los aspirantes lo lee como si fuera un contrato laboral. El 20% restante lo lee como un cazador de preguntas. Aquí están las 4 capas que importan.
                </p>
                <div className="pt-2 p-4 rounded-xl border border-purple-500/30 bg-purple-500/5">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      <strong className="text-purple-700 dark:text-purple-400">Tip:</strong> imprime tu manual y resáltalo por capas. Es el primer ejercicio que separa a quien estudia con foco de quien estudia &ldquo;de todo un poco&rdquo;.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {manualKeys.map((k, i) => (
                  <div
                    key={i}
                    className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:rotate-6 transition-transform">
                        {k.icon}
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Capa 0{i + 1}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">
                      {k.key}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {k.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* EXAM ANATOMY */}
        <section id="examen" className="py-16 sm:py-24 bg-white dark:bg-slate-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400">
                <BarChart3 className="w-3.5 h-3.5" /> Anatomía del examen
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                ¿De qué se compone tu puntaje?
              </h2>
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-normal max-w-2xl mx-auto">
                Los porcentajes varían por convocatoria, pero el esqueleto del examen sigue este patrón. Saberlo cambia cómo distribuyes tus horas de estudio.
              </p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl">
              <div className="space-y-7">
                {examAnatomy.map((e, i) => (
                  <div key={i}>
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {e.label}
                      </h3>
                      <span className="text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
                        {e.pct}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2">
                      <div
                        className={`h-full ${e.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${e.pct}%` }}
                      />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {e.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white">Conclusión práctica:</strong> si dedicas el 100% de tus horas a competencias funcionales, estás ignorando un tercio del examen. Las comportamentales se entrenan diferente — con simulacros, no con apuntes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STRATEGIC CALENDAR */}
        <section id="calendario" className="py-16 sm:py-24 bg-slate-100 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                <CalendarDays className="w-3.5 h-3.5" /> Calendario estratégico
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                La cuenta regresiva del aspirante
              </h2>
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-normal max-w-2xl mx-auto">
                Qué hacer y qué evitar en cada bloque de tiempo. No es un cronograma rígido — es una secuencia probada.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {timeline.map((t, i) => (
                <div
                  key={i}
                  className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                        {t.icon}
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        T-{4 - i}
                      </span>
                    </div>
                    <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                      {t.range}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                      {t.action}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MYTHS vs REALITY */}
        <section id="mitos" className="py-16 sm:py-24 bg-white dark:bg-slate-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" /> Mitos del concurso
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Lo que repiten en foros y casi siempre es falso
              </h2>
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-normal max-w-2xl mx-auto">
                Cuatro creencias que circulan en grupos de WhatsApp y que cuestan plazas reales cada año.
              </p>
            </div>

            <div className="space-y-4">
              {myths.map((m, i) => (
                <div
                  key={i}
                  className="group grid sm:grid-cols-2 gap-px rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors bg-slate-200 dark:bg-slate-800"
                >
                  <div className="bg-rose-500/5 dark:bg-rose-500/10 p-5 sm:p-6 flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-1">
                        Mito #{i + 1}
                      </div>
                      <p className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 line-through decoration-rose-500/40 decoration-2">
                        {m.false}
                      </p>
                    </div>
                  </div>
                  <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-5 sm:p-6 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
                        Lo que sí
                      </div>
                      <p className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200">
                        {m.true}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LAW 1960 */}
        <section id="ley1960" className="py-16 sm:py-24 bg-slate-100 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-blue-500/5 border border-purple-500/30 p-6 sm:p-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative grid lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12 items-start">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                    <Scale className="w-3.5 h-3.5" /> Ley 1960 de 2019
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    Quedaste en la lista pero no te llamaron. ¿Y ahora?
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    Esta ley cambió las reglas para los miles de aspirantes que cada año pasan el examen pero no alcanzan plaza inmediata. Son cuatro herramientas legales que casi nadie usa.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {lawBenefits.map((b, i) => (
                    <div
                      key={i}
                      className="group rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 hover:border-purple-500/40 hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-extrabold group-hover:bg-purple-500 group-hover:text-white transition-colors">
                          {i + 1}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {b.title}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-8">
                        {b.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROFILE TIPS */}
        <section id="perfiles" className="py-16 sm:py-24 bg-white dark:bg-slate-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                <Target className="w-3.5 h-3.5" /> Estrategia por perfil
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Tu punto de partida cambia tu estrategia
              </h2>
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-normal max-w-2xl mx-auto">
                Recién graduado, profesional con trayectoria o funcionario buscando ascender. Cada perfil tiene ventajas y trampas distintas.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {([
                { id: 'universitarios',  label: 'Recién graduados',   icon: <GraduationCap className="w-4 h-4" /> },
                { id: 'experimentados',  label: 'Con experiencia',    icon: <Briefcase className="w-4 h-4" /> },
                { id: 'ascenso',         label: 'Funcionario · Ascenso', icon: <TrendingUp className="w-4 h-4" /> },
              ] as { id: ProfileTab; label: string; icon: React.ReactNode }[]).map((t) => {
                const active = activeTab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                )
              })}
            </div>

            <div
              key={activeTab}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 animate-in fade-in slide-in-from-bottom-3 duration-500"
            >
              {tipsByProfile[activeTab].map((tip, i) => (
                <div
                  key={i}
                  className="group rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-5 sm:p-6 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      {tip.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">
                        {tip.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {tip.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20 sm:py-28 bg-slate-100 dark:bg-slate-900/40 border-t border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-rose-500/10 blur-[140px] rounded-full pointer-events-none" />

          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-rose-500 text-white mb-6 animate-float shadow-2xl shadow-purple-500/30">
              <Rocket className="w-8 h-8" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              Ya entiendes el sistema.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600">
                Ahora prepárate como quien va a ganar.
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mb-10 font-normal">
              Entrena con simulacros reales del CNSC y aprovecha la retroalimentación de la IA en cada pregunta. Estudia con la disciplina de quien ya sabe cómo funciona el sistema.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {!isSignedIn ? (
                <button
                  onClick={handleSignUp}
                  className="w-full sm:w-auto text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600 hover:opacity-95 text-white px-8 py-4 rounded-full transition-all shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer btn-shimmer group"
                >
                  Empezar simulacros gratis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600 hover:opacity-95 text-white px-8 py-4 rounded-full transition-all shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer group"
                >
                  Ir a mi panel
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <Link
                href="/#planes"
                className="w-full sm:w-auto text-base font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 px-6 py-4 transition-colors flex items-center justify-center gap-1"
              >
                <Sparkles className="w-4 h-4" />
                Ver planes
              </Link>
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
