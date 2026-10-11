// Imagen de vista previa (1200×630) de las páginas del concurso docente, para compartir en WhatsApp, Facebook y X
import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }

export function imagenDocente({ titulo, dato, detalle }: { titulo: string; dato: string; detalle: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #4f46e5 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>SIMO TEST</div>
          <div style={{ display: 'flex', fontSize: 26, padding: '8px 20px', borderRadius: 999, background: 'rgba(255,255,255,0.16)' }}>
            Concurso docente 2026 · CNSC
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: titulo.length > 34 ? 60 : 76, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2 }}>{titulo}</div>
          <div style={{ display: 'flex', marginTop: 28, fontSize: 44, fontWeight: 700, color: '#bfdbfe' }}>{dato}</div>
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#dbeafe' }}>{detalle}</div>
      </div>
    ),
    OG_SIZE,
  )
}
