import { Link, Section, Text } from '@react-email/components'
import EmailLayout, { GUIDE_URL, styles } from './components/EmailLayout'

interface WelcomeEmailProps {
  firstName?: string
  recipientEmail?: string
}

export default function WelcomeEmail({ firstName, recipientEmail }: WelcomeEmailProps) {
  const name = firstName?.trim() || 'aspirante'

  return (
    <EmailLayout
      preview="El examen no premia al que más sabe. Te explico por qué."
      recipientEmail={recipientEmail}
    >
      <Text style={styles.paragraph}>Hola {name},</Text>

      <Text style={styles.paragraph}>
        Gracias por registrarte en <strong>SIMO TEST</strong>. Antes de que toques un solo simulacro, quiero contarte algo que ojalá alguien me hubiera dicho a mí cuando empecé.
      </Text>

      <Text style={styles.paragraph}>
        El examen del CNSC <strong>no mide cuánto sabes de memoria</strong>. Mide cómo aplicas lo que sabes bajo presión, en 90 segundos por pregunta. Y la mayoría de aspirantes — incluso los que estudian 6 meses — caen en estos 3 errores:
      </Text>

      <Section style={styles.tipBlock}>
        <Text style={styles.tipTitle}>1. Estudian &ldquo;de todo un poco&rdquo;.</Text>
        <Text style={styles.tipBody}>
          Se aprenden la Constitución completa, pero ignoran el manual de funciones del cargo que eligieron. Resultado: saben mucho de lo que no les preguntan.
        </Text>
      </Section>

      <Section style={styles.tipBlock}>
        <Text style={styles.tipTitle}>2. Subestiman las pruebas comportamentales.</Text>
        <Text style={styles.tipBody}>
          Pesan entre el 20% y el 40% del puntaje. No son &ldquo;preguntas obvias&rdquo;: están diseñadas para que confundas la respuesta correcta con la respuesta más cómoda.
        </Text>
      </Section>

      <Section style={styles.tipBlock}>
        <Text style={styles.tipTitle}>3. Memorizan en vez de practicar.</Text>
        <Text style={styles.tipBody}>
          En el examen real no hay tiempo para recordar el artículo exacto. Necesitas razonar el caso. Y eso solo se entrena con simulacros, no con apuntes.
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        Te dejo la guía completa donde explico el sistema CNSC paso a paso, las 4 fases del proceso y la estrategia por perfil (recién graduado, con experiencia o ascenso):
      </Text>

      <Section style={styles.ctaSection}>
        <Link href={GUIDE_URL} style={styles.ctaButton}>
          Leer la guía gratuita →
        </Link>
      </Section>

      <Text style={styles.paragraph}>
        En los próximos días te voy a mandar los temas que más caen en convocatorias reales y un par de casos de personas que ya consiguieron su plaza. Nada de spam, lo prometo.
      </Text>

      <Text style={styles.paragraph}>
        Un abrazo,<br />
        <strong>Andrés</strong><br />
        <span style={styles.muted}>Equipo SIMO TEST</span>
      </Text>

      <Section style={styles.postscript}>
        <Text style={styles.postscriptText}>
          <strong>P.D.</strong> Si tienes una convocatoria abierta y no sabes por dónde empezar, responde este correo con el nombre del cargo. Lo leo personalmente.
        </Text>
      </Section>
    </EmailLayout>
  )
}
