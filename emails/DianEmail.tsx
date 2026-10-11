// Campaña para aspirantes a la DIAN 2676 (prueba escrita del 8 de noviembre de 2026).
// Solo la plantilla: no está conectada a ninguna secuencia ni envío automático.
import { Link, Section, Text } from '@react-email/components'
import EmailLayout, { SITE_URL, styles } from './components/EmailLayout'

const PLAN_URL = `${SITE_URL}/mi-convocatoria/dian-2676`
const SIMULACRO_URL = `${SITE_URL}/dashboard?convocatoria=dian-2676&perfil=tributos`

interface DianEmailProps {
  firstName?: string
  recipientEmail?: string
}

export default function DianEmail({ firstName, recipientEmail }: DianEmailProps) {
  const name = firstName?.trim() || 'aspirante'

  return (
    <EmailLayout
      preview="La prueba de la DIAN es el 8 de noviembre. Te armamos el plan y un simulacro con los temas del concurso."
      recipientEmail={recipientEmail}
    >
      <Text style={styles.subheading}>DIAN 2676 · Prueba escrita el 8 de noviembre</Text>
      <Text style={styles.heading}>Cuatro semanas para la DIAN: así puedes usarlas</Text>

      <Text style={styles.paragraph}>Hola {name},</Text>

      <Text style={styles.paragraph}>
        Si te inscribiste en el concurso DIAN 2676, la prueba escrita es el domingo 8 de noviembre. La de competencias funcionales pesa 65% y es eliminatoria: necesitas 70 puntos. Solo se evalúan normas expedidas antes del 19 de junio de 2026.
      </Text>

      <Section style={styles.tipBlock}>
        <Text style={styles.tipTitle}>Lo que ya tienes en SIMO TEST</Text>
        <Text style={styles.tipBody}>
          Casos de la DIAN sobre el Estatuto Tributario (renta, IVA, retención, régimen SIMPLE, factura electrónica, procedimiento, sanciones y cobro), el régimen aduanero y cambiario, y la carrera específica de la DIAN (Decreto Ley 927 de 2023). Cada pregunta explica por qué cada opción es correcta o no, con el artículo que la sustenta.
        </Text>
      </Section>

      <Section style={styles.tipBlock}>
        <Text style={styles.tipTitle}>Un simulacro con los pesos de tu perfil</Text>
        <Text style={styles.tipBody}>
          Elige tu perfil (tributos, aduanas, áreas de apoyo o facilitador) y el simulacro reparte las preguntas según lo que más pesa en ese empleo, con cronómetro y resultado por módulo.
        </Text>
      </Section>

      <Section style={styles.ctaSection}>
        <Link href={SIMULACRO_URL} style={styles.ctaButton}>
          Hacer el simulacro DIAN →
        </Link>
      </Section>

      <Text style={styles.paragraph}>
        ¿Prefieres organizarte primero? Aquí está el plan semana a semana, con lo que pesa cada tema y las fuentes oficiales del concurso:{' '}
        <Link href={PLAN_URL}>ver el plan DIAN</Link>.
      </Text>

      <Section style={styles.callout}>
        <Text style={styles.calloutText}>
          Consejo: la última semana no estudies temas nuevos. Haz dos simulacros completos en días distintos y repasa solo lo que fallaste.
        </Text>
      </Section>
    </EmailLayout>
  )
}
