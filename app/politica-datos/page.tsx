import { ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Política de Tratamiento de Datos Personales',
  description:
    'Política de tratamiento de datos personales de SIMO TEST conforme a la Ley 1581 de 2012 y Decreto 1377 de 2013.',
}

export default function PoliticaDatosPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Ley 1581 de 2012 · Decreto 1377 de 2013
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Política de Tratamiento de Datos Personales
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-10">
          Última actualización: 2 de junio de 2026
        </p>

        <div className="space-y-10 text-slate-700 dark:text-slate-300 leading-relaxed">
          <Section number={1} title="Responsable del tratamiento">
            <p>
              SIMO TEST es una plataforma de preparación autónoma e independiente para concursos de mérito de la Comisión Nacional del Servicio Civil (CNSC). Como responsable del tratamiento de tus datos personales, garantizamos su protección conforme a la normatividad colombiana vigente.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li><strong>Razón social:</strong> [Razón social pendiente de configurar]</li>
              <li><strong>NIT:</strong> [NIT pendiente]</li>
              <li><strong>Domicilio:</strong> Colombia</li>
              <li>
                <strong>Correo de contacto:</strong>{' '}
                <a href="mailto:hola@simotest.com" className="text-blue-600 dark:text-blue-400 font-semibold">
                  hola@simotest.com
                </a>
              </li>
            </ul>
          </Section>

          <Section number={2} title="Datos que recolectamos">
            <p>Para prestar el servicio, recopilamos únicamente la información necesaria:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-sm">
              <li>Nombre y apellido</li>
              <li>Correo electrónico</li>
              <li>Información de pago procesada por terceros (Mercado Pago) — no almacenamos datos de tarjetas en nuestros servidores</li>
              <li>Datos de uso de la plataforma (simulacros realizados, puntajes, tiempo de práctica) para mejorar tu experiencia y nuestros servicios</li>
              <li>Información técnica (dirección IP, navegador, dispositivo) por motivos de seguridad y analítica</li>
            </ul>
          </Section>

          <Section number={3} title="Finalidad del tratamiento">
            <p>Usamos tu información exclusivamente para:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-sm">
              <li>Prestarte el servicio de simulacros y retroalimentación con IA</li>
              <li>Procesar pagos y gestionar tu suscripción</li>
              <li>Enviarte comunicaciones relacionadas con el servicio: bienvenida, tips de preparación, novedades sobre convocatorias y ofertas de planes</li>
              <li>Mejorar continuamente el contenido y la plataforma</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
            <p className="mt-3 text-sm">
              <strong>No vendemos, alquilamos ni compartimos tu información</strong> con terceros con fines comerciales.
            </p>
          </Section>

          <Section number={4} title="Tus derechos como titular de datos">
            <p>Conforme al Artículo 8 de la Ley 1581 de 2012, tienes derecho a:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-sm">
              <li><strong>Conocer, actualizar y rectificar</strong> tus datos personales</li>
              <li><strong>Solicitar prueba</strong> de la autorización otorgada</li>
              <li><strong>Ser informado</strong> sobre el uso que se da a tus datos</li>
              <li><strong>Presentar quejas</strong> ante la Superintendencia de Industria y Comercio (SIC)</li>
              <li><strong>Revocar la autorización</strong> y/o solicitar la supresión del dato</li>
              <li><strong>Acceder gratuitamente</strong> a tus datos personales</li>
            </ul>
            <p className="mt-3 text-sm">
              Para ejercer cualquiera de estos derechos, envía un correo a{' '}
              <a href="mailto:hola@simotest.com" className="text-blue-600 dark:text-blue-400 font-semibold">
                hola@simotest.com
              </a>{' '}
              indicando tu nombre, correo registrado y la solicitud específica. Responderemos en un plazo máximo de 15 días hábiles.
            </p>
          </Section>

          <Section number={5} title="Cancelar suscripción a correos">
            <p>
              Puedes cancelar la suscripción a nuestros correos electrónicos en cualquier momento, sin necesidad de justificación. Tienes dos opciones:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-sm">
              <li>Hacer clic en el enlace &ldquo;Cancelar suscripción&rdquo; al final de cualquier correo que te enviemos</li>
              <li>
                Ir directamente a{' '}
                <Link href="/unsubscribe" className="text-blue-600 dark:text-blue-400 font-semibold underline">
                  simotest.com/unsubscribe
                </Link>
              </li>
            </ul>
            <p className="mt-3 text-sm">
              La cancelación es inmediata. No volverás a recibir correos de la secuencia de bienvenida ni de marketing.
            </p>
          </Section>

          <Section number={6} title="Conservación y seguridad">
            <p>
              Conservamos tu información mientras tengas una cuenta activa o mientras sea necesario para cumplir con obligaciones legales (contables, fiscales). Aplicamos medidas técnicas y administrativas razonables — cifrado en tránsito, control de acceso, backups encriptados — para proteger tu información.
            </p>
          </Section>

          <Section number={7} title="Encargados del tratamiento (terceros)">
            <p>
              Para operar la plataforma usamos servicios de terceros que actúan como encargados del tratamiento. Cada uno tiene su propia política de privacidad:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-sm">
              <li><strong>Clerk:</strong> autenticación de usuarios</li>
              <li><strong>Supabase:</strong> almacenamiento de datos</li>
              <li><strong>Mercado Pago:</strong> procesamiento de pagos</li>
              <li><strong>Resend:</strong> envío de correos electrónicos</li>
              <li><strong>Vercel:</strong> infraestructura de hosting</li>
              <li><strong>Google Analytics:</strong> analítica de uso (datos anonimizados)</li>
            </ul>
          </Section>

          <Section number={8} title="Vigencia y cambios">
            <p>
              Esta política puede actualizarse de tiempo en tiempo. Te notificaremos por correo si ocurren cambios sustanciales. Te recomendamos revisarla periódicamente.
            </p>
          </Section>
        </div>

        <div className="mt-12 p-6 rounded-2xl border border-blue-500/30 bg-blue-500/5">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong>¿Preguntas?</strong> Escríbenos a{' '}
            <a href="mailto:hola@simotest.com" className="text-blue-600 dark:text-blue-400 font-semibold">
              hola@simotest.com
            </a>
            . Si consideras que tus derechos fueron vulnerados, puedes presentar queja ante la Superintendencia de Industria y Comercio (SIC) en{' '}
            <a href="https://www.sic.gov.co" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 font-semibold">
              sic.gov.co
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-extrabold">
          {number}
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
      </div>
      <div className="pl-11 text-sm sm:text-base">{children}</div>
    </section>
  )
}
