// lib/config.js

export const SITE_CONFIG = {
    // ── Identidad del negocio ──
    businessName: 'La Panadería',
    businessTagline: 'Panadería artesanal',
    businessShortDescription: 'Panadería artesanal. Elaborado a mano, todos los días.',
    since: 2024,
    
    // ── Contacto ──
    address: 'Av. Principal 123',
    phone: '+598 00 000 000',
    phoneDisplay: '+598 00 000 000',
    whatsapp: '59891234567', // Solo números, con código de país. Se usa para wa.me/...
    email: 'hola@tupanaderia.com',
    instagram: 'https://instagram.com/tupanaderia',
    
    // ── Horarios ──
    hours: {
      weekdays: 'Lun a Sáb · 7:00 a 20:00',
      sunday: 'Dom · 8:00 a 13:00',
    },
    
    // ── Datos bancarios ──
    bank: {
      name: 'Banco Ejemplo',
      holder: 'Tu Panadería S.A.',
      alias: '${SITE_CONFIG.businessName}', // Este es el alias completo, sin composición
      cbu: '0000003100000000000000',
      accountNumber: '000-123456/7',
    },
    
    // ── URLs ──
    siteUrl: '${SITE_CONFIG.siteUrl}',
  }

  console.log('✅ lib/config.js cargado:', SITE_CONFIG.businessName)