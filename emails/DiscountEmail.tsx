import { Link, Section, Text } from '@react-email/components'
import EmailLayout, { PLANS_URL, styles } from './components/EmailLayout'

interface ActionEmailProps {
  firstName?: string
  recipientEmail?: string
}

export default function DiscountEmail({
  firstName,
  recipientEmail,
}: ActionEmailProps) {
  const name = firstName?.trim() || 'aspirante'

  return (
    <EmailLayout
      preview="¿Estás estudiando para pasar, o solo para ver qué pasa?"
      recipientEmail={recipientEmail}
    >
      <Text style={{ ...styles.subheading, color: '#dc2626' }}>Día 14 · El momento de decidir</Text>
      <Text style={styles.heading}>Tu futuro como servidor público no es cuestión de suerte</Text>

      <Text style={styles.paragraph}>Hola {name},</Text>

      <Text style={styles.paragraph}>
        Llevamos casi dos semanas hablando. Ya te conté cómo funciona el sistema CNSC, los temas reales que caen en las pruebas, y cómo se ve nuestra plataforma de IA en acción.
      </Text>

      <Text style={styles.paragraph}>
        Hoy quiero hacerte una pregunta directa: <strong>¿Estás estudiando para ganar tu plaza, o solo vas a presentar la prueba para "ver qué pasa"?</strong>
      </Text>

      {/* Bloque de realidad */}
      <Section style={realityBox}>
        <Text style={realityLabel}>LA REALIDAD DEL CONCURSO</Text>
        
        <table cellPadding={0} cellSpacing={0} border={0} style={statsTable}>
          <tbody>
            <tr>
              <td style={statCell}>
                <Text style={statNumber}>90%</Text>
                <Text style={statText}>De los aspirantes solo leen PDFs y teoría interminable.</Text>
              </td>
            </tr>
            <tr>
              <td style={{ ...statCell, borderTop: '1px solid #e5e7eb' }}>
                <Text style={statNumberHighlight}>10%</Text>
                <Text style={statTextHighlight}>Practica, simula y se enfrenta a preguntas reales antes del gran día.</Text>
              </td>
            </tr>
          </tbody>
        </table>

        <Text style={realitySubtext}>
          En SIMO TEST te damos las herramientas para ser parte de ese 10%.
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        Competir por una vacante en el Estado requiere más que motivación. Requiere medirte, fallar en un entorno seguro y corregir tus errores antes de la prueba escrita.
      </Text>

      <Section style={styles.ctaSection}>
        <Link href={PLANS_URL} style={styles.ctaButtonAmber}>
          Iniciar mi preparación hoy →
        </Link>
      </Section>

      <Text style={styles.paragraph}>
        Si decides que este es tu momento, aquí te esperamos. Si no, seguiré enviándote tips de valor cada cierto tiempo. Tú decides cuándo dar el siguiente paso.
      </Text>

      <Section style={styles.postscript}>
        <Text style={styles.postscriptText}>
          <strong>P.D.</strong> El tiempo sigue corriendo y la convocatoria no te va a esperar. Cada día que pasa sin practicar es un día de ventaja que le das a tus competidores.
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        Un abrazo,<br />
        <strong>Andrés</strong><br />
        <span style={styles.muted}>Equipo SIMO TEST</span>
      </Text>
    </EmailLayout>
  )
}

// Estilos
const realityBox: React.CSSProperties = {
  margin: '24px 0',
  padding: '28px 24px',
  backgroundColor: '#f8fafc',
  borderRadius: '16px',
  border: '2px solid #e2e8f0',
  textAlign: 'center' as const,
}

const realityLabel: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 800,
  color: '#475569',
  letterSpacing: '0.12em',
  margin: '0 0 16px 0',
}

const statsTable: React.CSSProperties = {
  width: '100%',
  margin: '0 auto',
  borderCollapse: 'collapse' as const,
}

const statCell: React.CSSProperties = {
  padding: '16px 0',
  textAlign: 'left' as const,
}

const statNumber: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 900,
  color: '#94a3b8',
  margin: '0 0 4px 0',
  lineHeight: '1',
}

const statText: React.CSSProperties = {
  fontSize: '14px',
  color: '#64748b',
  margin: 0,
  lineHeight: '1.5',
}

const statNumberHighlight: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 900,
  color: '#d97706',
  margin: '0 0 4px 0',
  lineHeight: '1',
}

const statTextHighlight: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: '#92400e',
  margin: 0,
  lineHeight: '1.5',
}

const realitySubtext: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#1e293b',
  margin: '20px 0 0 0',
  padding: '12px',
  backgroundColor: '#f1f5f9',
  borderRadius: '8px',
}
