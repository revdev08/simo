import { Link, Section, Text } from '@react-email/components'
import EmailLayout, { PLANS_URL, styles } from './components/EmailLayout'

interface PriceObjectionEmailProps {
  firstName?: string
  recipientEmail?: string
}

export default function PriceObjectionEmail({ firstName, recipientEmail }: PriceObjectionEmailProps) {
  const name = firstName?.trim() || 'aspirante'

  return (
    <EmailLayout
      preview="$19.900 vs. 2 años perdidos. Hagamos el cálculo real."
      recipientEmail={recipientEmail}
    >
      <Text style={styles.subheading}>Día 8 · El costo real</Text>
      <Text style={styles.heading}>$19.900 vs. 2 años perdidos</Text>

      <Text style={styles.paragraph}>Hola {name},</Text>

      <Text style={styles.paragraph}>
        Hablemos de plata. Concretamente: <strong>¿cuánto cuesta no prepararte bien para el SIMO?</strong>
      </Text>

      <Text style={styles.paragraph}>
        Hice el cálculo con datos reales del proceso CNSC. Si presentas el examen sin una preparación seria, la cuenta es esta:
      </Text>

      <Section style={styles.callout}>
        <Text style={{ ...styles.calloutText, fontWeight: 700, marginBottom: '10px' }}>
          🧾 Costo de no prepararse:
        </Text>
        <Text style={styles.calloutText}>
          • PIN de inscripción: <strong>$43.350 – $65.000</strong>
        </Text>
        <Text style={styles.calloutText}>
          • Tiempo invertido (preparación dispersa, ~4 meses): <strong>incalculable</strong>
        </Text>
        <Text style={styles.calloutText}>
          • Esperar la próxima convocatoria del cargo: <strong>1 a 3 años</strong>
        </Text>
        <Text style={styles.calloutText}>
          • Salario público que dejas de percibir cada mes: <strong>$1.500.000 – $3.000.000+</strong>
        </Text>
        <Text style={{ ...styles.calloutText, marginTop: '12px', fontWeight: 700, color: '#dc2626' }}>
          Total real perdido en 1 año: $18M – $36M COP
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        Ahora la otra cuenta:
      </Text>

      <Section style={styles.calloutAmber}>
        <Text style={{ ...styles.calloutText, fontWeight: 700, marginBottom: '10px' }}>
          💡 Costo de prepararte con SIMO TEST:
        </Text>
        <Text style={styles.calloutText}>
          • Plan semanal: <strong>$19.900</strong> (acceso completo 7 días)
        </Text>
        <Text style={styles.calloutText}>
          • Plan mensual: <strong>$39.900</strong> (simulacros ilimitados + IA + estadísticas)
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        $19.900 es lo que cuesta una pizza familiar. $39.900 es lo que pagas por un mes de Netflix Premium en un par de cuentas. Y ese gasto único <strong>puede traducirse en un cargo público estable por 20+ años</strong>.
      </Text>

      <Text style={styles.paragraph}>
        No te estoy vendiendo &ldquo;esperanza&rdquo;. Te estoy mostrando los números. El examen lo presentas igual: la pregunta es <strong>con qué herramientas llegas</strong>.
      </Text>

      <Section style={styles.ctaSection}>
        <Link href={PLANS_URL} style={styles.ctaButton}>
          Ver planes y elegir el mío →
        </Link>
      </Section>

      <Text style={styles.paragraph}>
        En el próximo correo te voy a mostrar exactamente cómo se ve la retroalimentación de la IA cuando fallas una pregunta. Es lo que más le gustó a Carlos, y posiblemente lo que te haga decidir.
      </Text>

      <Text style={styles.paragraph}>
        Un abrazo,<br />
        <strong>Andrés</strong><br />
        <span style={styles.muted}>Equipo SIMO TEST</span>
      </Text>
    </EmailLayout>
  )
}
