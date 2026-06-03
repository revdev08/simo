import { Link, Section, Text } from '@react-email/components'
import EmailLayout, { FREE_QUIZ_URL, styles } from './components/EmailLayout'

interface ProductDemoEmailProps {
  firstName?: string
  recipientEmail?: string
}

export default function ProductDemoEmail({ firstName, recipientEmail }: ProductDemoEmailProps) {
  const name = firstName?.trim() || 'aspirante'

  return (
    <EmailLayout
      preview="Esto pasa exactamente cuando fallas una pregunta en SIMO TEST."
      recipientEmail={recipientEmail}
    >
      <Text style={styles.subheading}>Día 11 · El producto en acción</Text>
      <Text style={styles.heading}>Cuando fallas una pregunta, pasa esto</Text>

      <Text style={styles.paragraph}>Hola {name},</Text>

      <Text style={styles.paragraph}>
        En vez de seguir describiendo lo que hacemos, déjame mostrarte cómo se ve <strong>una sesión real</strong> en SIMO TEST. Esta es la parte que más cambia el método de estudio para la mayoría:
      </Text>

      {/* Mockup visual de pregunta */}
      <Section style={mockQuestion}>
        <Text style={mockBadge}>DERECHO ADMINISTRATIVO</Text>
        <Text style={mockQuestionText}>
          ¿Cuál de las siguientes acciones procede directamente contra un acto administrativo de carácter general expedido por un Ministerio?
        </Text>

        <Section style={mockOptionWrong}>
          <Text style={mockOptionText}>
            <strong style={{ color: '#fca5a5' }}>A.</strong> Acción de Tutela de manera preferente.
          </Text>
        </Section>
        <Section style={mockOptionRight}>
          <Text style={mockOptionText}>
            <strong style={{ color: '#86efac' }}>B.</strong> Acción de Nulidad Simple ante la Jurisdicción Contencioso Administrativa.
          </Text>
        </Section>
        <Section style={mockOptionDim}>
          <Text style={mockOptionText}>
            <strong style={{ color: '#94a3b8' }}>C.</strong> Acción de Reparación Directa en cualquier término.
          </Text>
        </Section>

        <Section style={mockAiExplanation}>
          <Text style={mockAiBadge}>🧠 EXPLICACIÓN IA</Text>
          <Text style={mockAiText}>
            <strong>La opción correcta es B.</strong> De acuerdo con el CPACA, los actos administrativos de carácter general no requieren agotar vía gubernativa y su legalidad objetiva se debate mediante la acción de nulidad simple, al no pretenderse el restablecimiento de un derecho particular.
          </Text>
        </Section>
      </Section>

      <Text style={styles.paragraph}>
        Esto pasa después de cada error. No es un &ldquo;la respuesta correcta es B&rdquo; y ya. La IA te explica el <strong>fundamento legal</strong> de por qué B es correcta y por qué A y C no lo son.
      </Text>

      <Text style={styles.paragraph}>
        Multiplica eso por 200 preguntas a la semana. Tu cerebro deja de memorizar y empieza a razonar como el examen quiere que razones.
      </Text>

      <Section style={styles.callout}>
        <Text style={styles.calloutText}>
          📈 <strong>Lo que se acumula:</strong> después de 3 semanas, ves tus estadísticas por competencia. Sabes exactamente en qué tema fallas más y dónde concentrar las próximas horas.
        </Text>
      </Section>

      <Section style={styles.ctaSection}>
        <Link href={FREE_QUIZ_URL} style={styles.ctaButton}>
          Probar simulacro gratis ahora →
        </Link>
      </Section>

      <Text style={styles.paragraph}>
        Solo me queda un correo más en esta serie. Y va a tener algo que no he mencionado en ninguno de los anteriores. Atento mañana.
      </Text>

      <Text style={styles.paragraph}>
        Un abrazo,<br />
        <strong>Andrés</strong><br />
        <span style={styles.muted}>Equipo SIMO TEST</span>
      </Text>
    </EmailLayout>
  )
}

// Mockup styles (only used in this email)
const mockQuestion: React.CSSProperties = {
  margin: '20px 0',
  padding: '20px',
  backgroundColor: '#0f172a',
  borderRadius: '14px',
  border: '1px solid #1e293b',
}

const mockBadge: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '10px',
  fontWeight: 800,
  color: '#93c5fd',
  backgroundColor: 'rgba(59,130,246,0.15)',
  padding: '4px 10px',
  borderRadius: '6px',
  letterSpacing: '0.08em',
  margin: '0 0 12px 0',
}

const mockQuestionText: React.CSSProperties = {
  color: '#f1f5f9',
  fontSize: '15px',
  fontWeight: 700,
  lineHeight: '22px',
  margin: '0 0 16px 0',
}

const mockOptionWrong: React.CSSProperties = {
  padding: '11px 14px',
  borderRadius: '10px',
  backgroundColor: 'rgba(239,68,68,0.1)',
  border: '1px solid rgba(239,68,68,0.3)',
  margin: '0 0 8px 0',
}

const mockOptionRight: React.CSSProperties = {
  padding: '11px 14px',
  borderRadius: '10px',
  backgroundColor: 'rgba(34,197,94,0.12)',
  border: '1px solid rgba(34,197,94,0.4)',
  margin: '0 0 8px 0',
}

const mockOptionDim: React.CSSProperties = {
  padding: '11px 14px',
  borderRadius: '10px',
  backgroundColor: 'rgba(30,41,59,0.5)',
  border: '1px solid #1e293b',
  margin: '0 0 8px 0',
  opacity: 0.5,
}

const mockOptionText: React.CSSProperties = {
  color: '#e2e8f0',
  fontSize: '13px',
  margin: 0,
  lineHeight: '18px',
}

const mockAiExplanation: React.CSSProperties = {
  marginTop: '14px',
  padding: '14px',
  borderRadius: '10px',
  backgroundColor: 'rgba(99,102,241,0.12)',
  border: '1px solid rgba(99,102,241,0.3)',
}

const mockAiBadge: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '10px',
  fontWeight: 800,
  color: '#a5b4fc',
  letterSpacing: '0.08em',
  margin: '0 0 6px 0',
}

const mockAiText: React.CSSProperties = {
  color: '#c7d2fe',
  fontSize: '13px',
  lineHeight: '20px',
  margin: 0,
}
