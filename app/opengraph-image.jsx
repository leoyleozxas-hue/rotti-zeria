// app/opengraph-image.jsx
import { ImageResponse } from 'next/og'
import { SITE_CONFIG } from '@/lib/config'

export const alt = `${SITE_CONFIG.businessName} · ${SITE_CONFIG.businessTagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2B0F0B 0%, #3A130D 60%, #1a0806 100%)',
          color: '#F5EDE3',
          padding: '80px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#E0C89A',
            marginBottom: 30,
          }}
        >
          Desde {SITE_CONFIG.since}
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 600,
            fontFamily: 'serif',
            lineHeight: 1.05,
            marginBottom: 20,
          }}
        >
          {SITE_CONFIG.businessName}
        </div>
        <div style={{ fontSize: 36, color: '#E0C89A', marginBottom: 40 }}>
          {SITE_CONFIG.businessTagline}
        </div>
        <div
          style={{
            fontSize: 24,
            color: 'rgba(245,237,227,0.7)',
            maxWidth: 800,
          }}
        >
          {SITE_CONFIG.businessShortDescription}
        </div>
      </div>
    ),
    { ...size }
  )
}