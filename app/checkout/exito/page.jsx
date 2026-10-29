// app/checkout/exito/page.jsx
import Link from 'next/link'
import ClearCartOnMount from '@/components/ClearCartOnMount'

export default async function ExitoPage({ searchParams }) {
  const params = await searchParams
  const orderNumber = params.order

  return (
    <main className="max-w-2xl mx-auto px-4 py-20">
      <ClearCartOnMount />

      <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
        <div className="text-6xl mb-4">🥖</div>
        <h1 className="font-serif text-4xl text-chocolate mb-3">
          ¡Pedido recibido!
        </h1>
        <p className="text-caramel mb-2">Tu número de pedido es:</p>
        <p className="font-serif text-2xl text-gold mb-8">{orderNumber}</p>

        <div className="bg-beige rounded-xl p-6 text-left mb-6">
          <h2 className="font-serif text-lg text-chocolate mb-4">
            Datos para la transferencia
          </h2>
          <div className="text-sm text-caramel space-y-2">
            <div className="flex justify-between border-b border-chocolate/10 pb-2">
              <span>Banco</span>
              <strong className="text-chocolate">Banco Ejemplo</strong>
            </div>
            <div className="flex justify-between border-b border-chocolate/10 pb-2">
              <span>Titular</span>
              <strong className="text-chocolate">Panadería ${SITE_CONFIG.businessName}</strong>
            </div>
            <div className="flex justify-between border-b border-chocolate/10 pb-2">
              <span>Cuenta</span>
              <strong className="text-chocolate">000-123456/7</strong>
            </div>
            <div className="flex justify-between border-b border-chocolate/10 pb-2">
              <span>CBU</span>
              <strong className="text-chocolate">0000003100000000000000</strong>
            </div>
            <div className="flex justify-between">
              <span>Alias</span>
              <strong className="text-chocolate">${SITE_CONFIG.bank.alias}</strong>
            </div>
          </div>
        </div>

        <div className="bg-gold/10 border border-gold/30 rounded-xl p-5 text-left mb-8">
          <h3 className="font-serif text-chocolate mb-2">
            💡 Antes de transferir
          </h3>
          <ul className="text-sm text-caramel space-y-1.5 list-disc pl-5">
            <li>
              En la <strong>referencia</strong> poné tu nombre o iniciales + últimos
              4 dígitos del DNI.
            </li>
            <li>
              Una vez transferido, <strong>envianos el comprobante por WhatsApp</strong>.
            </li>
            <li>
              Cuando confirmemos el pago, preparamos tu pedido y te avisamos.
            </li>
          </ul>
        </div>

        <Link
          href="/"
          className="inline-block bg-chocolate text-cream px-8 py-3 rounded-full hover:bg-caramel transition"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}