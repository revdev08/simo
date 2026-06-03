import { Link, Section, Text } from '@react-email/components'
import EmailLayout, { PLANS_URL, styles } from './components/EmailLayout'

interface SocialProofEmailProps {
  firstName?: string
  recipientEmail?: string
}

export default function SocialProofEmail({ firstName, recipientEmail }: SocialProofEmailProps) {
  const name = firstName?.trim() || 'aspirante'

  return (
    <EmailLayout
      preview="Carlos pasó SIMO a la primera. Esto fue lo que hizo distinto."
      recipientEmail={recipientEmail}
    >
      <Text style={styles.subheading}>Día 5 · Historia real</Text>
      <Text style={styles.heading}>Cómo Carlos pasó SIMO a la primera</Text>

      <Text style={styles.paragraph}>Hola {name},</Text>

      <Text style={styles.paragraph}>
        Carlos Mario es funcionario en la DIAN hoy. Hace año y medio era un aspirante igual que tú. Su historia me la contó por mensaje, y creo que vale la pena que la conozcas.
      </Text>

      <Section style={styles.callout}>
        <Text style={styles.calloutText}>
          <em>&ldquo;Pasé mi examen SIMO a la primera. La retroalimentación de la IA es como tener un tutor personal disponible las 24 horas del día.&rdquo;</em>
        </Text>
        <Text style={{ ...styles.calloutText, fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
          — Carlos Mario G., DIAN
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        Lo que casi nadie sabe de Carlos es <strong>cómo</strong> estudió. No estudió más que los demás. Estudió diferente.
      </Text>

      <Section style={styles.tipBlock}>
        <Text style={styles.tipTitle}>1. No empezó por libros, empezó por simulacros</Text>
        <Text style={styles.tipBody}>
          La primera semana solo resolvió preguntas. Sin saber teoría. Su objetivo era identificar dónde estaban sus huecos reales, no los imaginarios.
        </Text>
      </Section>

      <Section style={styles.tipBlock}>
        <Text style={styles.tipTitle}>2. Cada error lo convirtió en una explicación</Text>
        <Text style={styles.tipBody}>
          La IA le explicaba el fundamento legal cada vez que fallaba. Después de 3 semanas, ya no necesitaba la explicación — su cerebro había hecho el patrón.
        </Text>
      </Section>

      <Section style={styles.tipBlock}>
        <Text style={styles.tipTitle}>3. 3 horas diarias, no 8</Text>
        <Text style={styles.tipBody}>
          Estudió enfocado. Cronometrado. Sin distracciones. Carlos dice: &ldquo;lo importante no era cuánto tiempo le metía, era que cuando me sentaba, sí estaba presente&rdquo;.
        </Text>
      </Section>

      <Section style={styles.tipBlock}>
        <Text style={styles.tipTitle}>4. Sabía a qué cargo apuntaba</Text>
        <Text style={styles.tipBody}>
          No se inscribió al cargo con más vacantes. Se inscribió al cargo donde su perfil (administrador financiero) tenía mayor probabilidad estructural.
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        Hoy, ese trabajo le significó estabilidad para los próximos 20 años de su vida. La diferencia entre la versión de Carlos que estudió así y una versión que hubiera estudiado &ldquo;de todo&rdquo; son dos cosas: <strong>el método y la constancia</strong>.
      </Text>

      <Text style={styles.paragraph}>
        Si quieres seguir el mismo método de Carlos, los planes incluyen simulacros ilimitados + retroalimentación IA + estadísticas de tu progreso.
      </Text>

      <Section style={styles.ctaSection}>
        <Link href={PLANS_URL} style={styles.ctaButton}>
          Ver planes →
        </Link>
      </Section>

      <Text style={styles.paragraph}>
        Mañana o pasado te mando un análisis de algo más incómodo: <strong>cuánto cuesta NO prepararte</strong> bien. Spoiler: no es lo que crees.
      </Text>

      <Text style={styles.paragraph}>
        Un abrazo,<br />
        <strong>Andrés</strong><br />
        <span style={styles.muted}>Equipo SIMO TEST</span>
      </Text>
    </EmailLayout>
  )
}
