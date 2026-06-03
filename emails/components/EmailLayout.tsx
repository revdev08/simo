import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { ReactNode } from 'react'

export const SITE_URL = 'https://www.simotest.com'
export const GUIDE_URL = `${SITE_URL}/guia`
export const PLANS_URL = `${SITE_URL}/#planes`
export const DASHBOARD_URL = `${SITE_URL}/dashboard`
export const FREE_QUIZ_URL = `${SITE_URL}/simulacro-gratis`

interface EmailLayoutProps {
  preview: string
  recipientEmail?: string
  children: ReactNode
}

export default function EmailLayout({ preview, recipientEmail, children }: EmailLayoutProps) {
  const unsubscribeUrl = recipientEmail
    ? `${SITE_URL}/unsubscribe?email=${encodeURIComponent(recipientEmail)}`
    : `${SITE_URL}/unsubscribe`

  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header con logo bicolor */}
          <Section style={logoSection}>
            <table cellPadding={0} cellSpacing={0} border={0} style={logoTable}>
              <tbody>
                <tr>
                  <td style={logoCell}>
                    <Img
                      src={`${SITE_URL}/logo.png`}
                      width="36"
                      height="36"
                      alt="SIMO TEST"
                      style={logoImg}
                    />
                  </td>
                  <td style={logoTextCell}>
                    <span style={logoBrandSimo}>SIMO</span>
                    <span style={logoBrandTest}>TEST</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Contenido */}
          <Section style={contentSection}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Recibes este correo porque te registraste en{' '}
              <Link href={SITE_URL} style={footerLink}>simotest.com</Link>.
            </Text>
            <Text style={footerText}>
              <strong>SIMO TEST</strong> · Preparación autónoma e independiente para concursos CNSC.
            </Text>
            <Text style={footerSmall}>
              <Link href={`${SITE_URL}/politica-datos`} style={footerLink}>
                Política de tratamiento de datos
              </Link>
              {' · '}
              <Link href={unsubscribeUrl} style={footerLink}>
                Cancelar suscripción
              </Link>
            </Text>
            <Text style={footerSmall}>
              © {new Date().getFullYear()} SIMO TEST. Todos los derechos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ============== Estilos compartidos ==============

const body: React.CSSProperties = {
  backgroundColor: '#f1f5f9',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
  padding: '32px 0',
  margin: 0,
}

const container: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
}

const logoSection: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '24px 32px 22px 32px',
  textAlign: 'center',
  borderBottom: '3px solid transparent',
  borderImage: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 50%, #f59e0b 100%) 1',
}

const logoTable: React.CSSProperties = { margin: '0 auto', borderCollapse: 'collapse' }
const logoCell: React.CSSProperties = { verticalAlign: 'middle', paddingRight: '12px' }
const logoTextCell: React.CSSProperties = {
  verticalAlign: 'middle',
  fontSize: '26px',
  fontWeight: 900,
  letterSpacing: '-0.025em',
  lineHeight: '40px',
}
const logoImg: React.CSSProperties = { display: 'block' }
const logoBrandSimo: React.CSSProperties = { color: '#0f172a', marginRight: '7px' }
const logoBrandTest: React.CSSProperties = { color: '#2563eb' }

const contentSection: React.CSSProperties = { padding: '32px 32px 16px 32px' }

const hr: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #e2e8f0',
  margin: '0 32px',
}

const footer: React.CSSProperties = { padding: '24px 32px 32px 32px', textAlign: 'center' as const }
const footerText: React.CSSProperties = {
  fontSize: '12px',
  lineHeight: '18px',
  color: '#64748b',
  margin: '0 0 6px 0',
}
const footerSmall: React.CSSProperties = {
  fontSize: '11px',
  lineHeight: '16px',
  color: '#94a3b8',
  margin: '0 0 4px 0',
}
const footerLink: React.CSSProperties = { color: '#2563eb', textDecoration: 'underline' }

// ============== Estilos exportados para los emails ==============

export const styles = {
  paragraph: {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#1e293b',
    margin: '0 0 18px 0',
  } as React.CSSProperties,

  heading: {
    fontSize: '22px',
    lineHeight: '30px',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 14px 0',
    letterSpacing: '-0.01em',
  } as React.CSSProperties,

  subheading: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#2563eb',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    margin: '0 0 8px 0',
  } as React.CSSProperties,

  tipBlock: {
    borderLeft: '3px solid #2563eb',
    paddingLeft: '14px',
    margin: '0 0 16px 0',
  } as React.CSSProperties,

  tipTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 4px 0',
  } as React.CSSProperties,

  tipBody: {
    fontSize: '14px',
    lineHeight: '22px',
    color: '#475569',
    margin: 0,
  } as React.CSSProperties,

  ctaSection: {
    textAlign: 'center' as const,
    margin: '24px 0 28px 0',
  } as React.CSSProperties,

  ctaButton: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '999px',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '15px',
    display: 'inline-block',
  } as React.CSSProperties,

  ctaButtonAmber: {
    backgroundColor: '#f59e0b',
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '999px',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '15px',
    display: 'inline-block',
  } as React.CSSProperties,

  muted: { color: '#64748b', fontSize: '14px' } as React.CSSProperties,

  postscript: {
    marginTop: '24px',
    padding: '14px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  } as React.CSSProperties,

  postscriptText: {
    fontSize: '14px',
    lineHeight: '22px',
    color: '#334155',
    margin: 0,
    fontStyle: 'italic' as const,
  } as React.CSSProperties,

  callout: {
    margin: '20px 0',
    padding: '18px 20px',
    backgroundColor: '#eff6ff',
    borderRadius: '12px',
    border: '1px solid #bfdbfe',
  } as React.CSSProperties,

  calloutAmber: {
    margin: '20px 0',
    padding: '18px 20px',
    backgroundColor: '#fffbeb',
    borderRadius: '12px',
    border: '1px solid #fde68a',
  } as React.CSSProperties,

  calloutText: {
    fontSize: '15px',
    lineHeight: '24px',
    color: '#1e293b',
    margin: 0,
  } as React.CSSProperties,

  bigNumber: {
    fontSize: '40px',
    fontWeight: 900,
    color: '#2563eb',
    margin: 0,
    lineHeight: '44px',
  } as React.CSSProperties,
}
