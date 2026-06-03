import { Link, Section, Text } from '@react-email/components'
import EmailLayout, { FREE_QUIZ_URL, styles } from './components/EmailLayout'

interface TopicsEmailProps {
  firstName?: string
  recipientEmail?: string
}

export default function TopicsEmail({ firstName, recipientEmail }: TopicsEmailProps) {
  const name = firstName?.trim() || 'aspirante'

  return (
    <EmailLayout
      preview="Estos 5 temas aparecen en casi toda convocatoria CNSC. Empieza por aquí."
      recipientEmail={recipientEmail}
    >
      <Text style={styles.subheading}>Día 2 · Qué estudiar primero</Text>
      <Text style={styles.heading}>Los 5 temas que SIEMPRE caen</Text>

      <Text style={styles.paragraph}>Hola {name},</Text>

      <Text style={styles.paragraph}>
        Si tuviera que empezar otra vez a prepararme para el CNSC, no perdería ni un día estudiando &ldquo;de todo&rdquo;. Empezaría por estos 5 temas <strong>porque caen en prácticamente cualquier convocatoria</strong>, sin importar la entidad ni el cargo.
      </Text>

      <Section style={styles.tipBlock}>
        <Text style={styles.tipTitle}>1. Constitución Política (Arts. 1, 2, 6, 13, 29, 83, 125, 209)</Text>
        <Text style={styles.tipBody}>
          Principios del Estado social de derecho, función pública, debido proceso. Aparecen en preguntas de juicio situacional con &ldquo;disfraz&rdquo;.
        </Text>
      </Section>

      <Section style={styles.tipBlock}>
        <Text style={styles.tipTitle}>2. Ley 909 de 2004 (carrera administrativa)</Text>
        <Text style={styles.tipBody}>
          Es la ley madre. Provisión de empleos, encargo, comisión, evaluación de desempeño, retiro del servicio. Domínala completa.
        </Text>
      </Section>

      <Section style={styles.tipBlock}>
        <Text style={styles.tipTitle}>3. Ley 1960 de 2019</Text>
        <Text style={styles.tipBody}>
          Modificó las reglas del juego para listas de elegibles. Casi nadie la estudia, pero las preguntas sobre vacantes equivalentes y uso obligatorio de listas vigentes son frecuentes.
        </Text>
      </Section>

      <Section style={styles.tipBlock}>
        <Text style={styles.tipTitle}>4. Código Disciplinario (Ley 1952 de 2019)</Text>
        <Text style={styles.tipBody}>
          Faltas gravísimas, graves, leves. Sanciones. Procedimiento. Especialmente importante en cargos de control interno y gestión.
        </Text>
      </Section>

      <Section style={styles.tipBlock}>
        <Text style={styles.tipTitle}>5. Estructura del Estado y descentralización</Text>
        <Text style={styles.tipBody}>
          Ramas del poder, organismos autónomos, niveles territoriales. Si confundes la Procuraduría con la Contraloría, vas a perder puntos fáciles.
        </Text>
      </Section>

      <Section style={styles.callout}>
        <Text style={styles.calloutText}>
          💡 <strong>El truco:</strong> no los estudies leyendo. Estúdialos resolviendo preguntas. Tu cerebro recuerda mejor lo que practica que lo que repite.
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        Te dejo el panel para que pruebes simulacros gratuitos sobre estos temas. La IA te explica cada pregunta que falles:
      </Text>

      <Section style={styles.ctaSection}>
        <Link href={FREE_QUIZ_URL} style={styles.ctaButton}>
          Hacer simulacro gratis (10 preguntas) →
        </Link>
      </Section>

      <Text style={styles.paragraph}>
        En el próximo correo te cuento la historia de alguien que pasó el SIMO a la primera. Spoiler: no estudió 10 horas diarias.
      </Text>

      <Text style={styles.paragraph}>
        Un abrazo,<br />
        <strong>Andrés</strong><br />
        <span style={styles.muted}>Equipo SIMO TEST</span>
      </Text>
    </EmailLayout>
  )
}
