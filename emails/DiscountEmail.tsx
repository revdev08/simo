import { Link, Section, Text } from '@react-email/components'
import EmailLayout, { PLANS_URL, styles } from './components/EmailLayout'

interface DiscountEmailProps {
  firstName?: string
  recipientEmail?: string
  couponCode?: string
}

export default function DiscountEmail({
  firstName,
  recipientEmail,
  couponCode = 'SIMO30',
}: DiscountEmailProps) {
  const name = firstName?.trim() || 'aspirante'
  const checkoutUrl = `${PLANS_URL}?coupon=${encodeURIComponent(couponCode)}`

  return (
    <EmailLayout
      preview="48 horas: 30% off tu primer mes. Después, vuelve al precio normal."
      recipientEmail={recipientEmail}
    >
      <Text style={{ ...styles.subheading, color: '#dc2626' }}>Día 14 · Última oportunidad</Text>
      <Text style={styles.heading}>30% off tu primer mes — solo 48 horas</Text>

      <Text style={styles.paragraph}>Hola {name},</Text>

      <Text style={styles.paragraph}>
        Llevamos casi dos semanas hablando. Te conté el sistema CNSC, los temas que caen, una historia real, los números crudos y cómo se ve la IA en acción.
      </Text>

      <Text style={styles.paragraph}>
        Si todavía estás aquí, hay una de dos: o sigues evaluando, o el precio te frenó. Para los dos casos, te dejo algo especial — y es la única vez que lo voy a ofrecer.
      </Text>

      {/* Bloque del descuento */}
      <Section style={discountBox}>
        <Text style={discountLabel}>OFERTA EXCLUSIVA · 48 HORAS</Text>
        <Text style={discountPercent}>30% OFF</Text>
        <Text style={discountSubtext}>tu primer mes del plan mensual</Text>

        {/* Caja oscura del cupón (dark by design — no se rompe en modo oscuro) */}
        <table cellPadding={0} cellSpacing={0} border={0} style={couponTable}>
          <tbody>
            <tr>
              <td style={couponCell}>
                <Text style={couponLabel}>TU CUPÓN</Text>
                <Text style={couponValue}>{couponCode}</Text>
                <Text style={couponHint}>Cópialo y úsalo al pagar</Text>
              </td>
            </tr>
          </tbody>
        </table>

        <Text style={discountTinyText}>
          Aplica solo en el plan mensual. Válido por 48 horas desde el envío de este correo. No acumulable con otras promociones.
        </Text>
      </Section>

      <Section style={styles.ctaSection}>
        <Link href={checkoutUrl} style={styles.ctaButtonAmber}>
          Activar mi descuento →
        </Link>
      </Section>

      <Text style={styles.paragraph}>
        ¿Por qué 48 horas? Porque las ofertas eternas no son ofertas. Y porque ya tomaste tiempo para decidirte: o lo haces ahora, o sigues como vienes.
      </Text>

      <Text style={styles.paragraph}>
        Si no aplica para ti — sin problema. Voy a seguir mandándote tips sobre CNSC cada cierto tiempo, sin venta. Si en algún momento se abre una convocatoria que te interese, sabrás dónde estoy.
      </Text>

      <Section style={styles.postscript}>
        <Text style={styles.postscriptText}>
          <strong>P.D.</strong> El cupón vence en 48 horas en serio. No es una táctica. Si lo intentas el lunes y no funciona, no podré reactivarlo.
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

// Estilos solo de este email
const discountBox: React.CSSProperties = {
  margin: '24px 0',
  padding: '28px 24px',
  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  borderRadius: '16px',
  border: '2px solid #d97706',
  textAlign: 'center' as const,
}

const discountLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 800,
  color: '#78350f',
  letterSpacing: '0.12em',
  margin: '0 0 8px 0',
}

const discountPercent: React.CSSProperties = {
  fontSize: '56px',
  fontWeight: 900,
  color: '#92400e',
  lineHeight: '60px',
  margin: 0,
  letterSpacing: '-0.03em',
}

const discountSubtext: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#78350f',
  margin: '4px 0 18px 0',
}

const couponTable: React.CSSProperties = {
  margin: '8px auto 12px auto',
  borderCollapse: 'collapse' as const,
}

const couponCell: React.CSSProperties = {
  padding: '18px 36px',
  backgroundColor: '#000000',
  borderRadius: '14px',
  textAlign: 'center' as const,
  border: '3px solid #f59e0b',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
}

const couponLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 900,
  color: '#fcd34d',
  letterSpacing: '0.22em',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
}

const couponValue: React.CSSProperties = {
  fontSize: '34px',
  fontWeight: 900,
  color: '#ffffff',
  letterSpacing: '0.18em',
  margin: 0,
  lineHeight: '36px',
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  textShadow: '0 1px 0 rgba(255,255,255,0.15)',
}

const couponHint: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#fcd34d',
  margin: '10px 0 0 0',
  letterSpacing: '0.06em',
}

const discountTinyText: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#78350f',
  margin: '14px 0 0 0',
  lineHeight: '17px',
}
