// app/checkout/exito/page.jsx
import Link from 'next/link'
import { getSettings } from '@/lib/settings'
import ClearCartOnMount from '@/components/ClearCartOnMount'

export const dynamic = 'force-dynamic'

export default async function ExitoPage({ searchParams }) {
  const params = await searchParams
  const orderNumber = params.order
  const settings = await getSettings()
  const bank = settings.bank || {}
  const hasBank = Boolean(bank.name || bank.holder || bank.alias || bank.cbu || bank.accountNumber)

  return (
    <main className="max-w-2xl mx-auto px-4 py-20">
      <ClearCartOnMount />

      <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
        <div className="text-6xl mb-4">🥖</div>
        <h1 className="font-serif text-4xl text-chocolate mb-3">
          ¡Pedido recibido!
        </h1>

        {orderNumber ? (
          <>
            <p className="text-caramel mb-2">Tu número de pedido es:</p>
            <p className="font-serif text-2xl text-gold mb-8 break-all">{orderNumber}</p>
          </>
        ) : (
          <p className="text-caramel mb-8">
            Si acabás de hacer un pedido, revisá el mensaje de confirmación.
          </p>
        )}

        {hasBank && (
          <div className="bg-beige rounded-xl p-6 text-left mb-6">
            <h2 className="font-serif text-lg text-chocolate mb-4">
              Datos para la transferencia
            </h2>
            <div className="text-sm text-caramel space-y-2">
              {bank.name && (
                <div className="flex justify-between border-b border-chocolate/10 pb-2">
                  <span>Banco</span>
                  <strong className="text-chocolate">{bank.name}</strong>
                </div>
              )}
              {bank.holder && (
                <div className="flex justify-between border-b border-chocolate/10 pb-2">
                  <span>Titular</span>
                  <strong className="text-chocolate text-right">{bank.holder}</strong>
                </div>
              )}
              {bank.accountNumber && (
                <div className="flex justify-between border-b border-chocolate/10 pb-2">
                  <span>Cuenta</span>
                  <strong className="text-chocolate">{bank.accountNumber}</strong>
                </div>
              )}
              {bank.cbu && (
                <div className="flex justify-between border-b border-chocolate/10 pb-2">
                  <span>CBU</span>
                  <strong className="text-chocolate font-mono text-xs break-all">{bank.cbu}</strong>
                </div>
              )}
              {bank.alias && (
                <div className="flex justify-between">
                  <span>Alias</span>
                  <strong className="text-chocolate">{bank.alias}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-gold/10 border border-gold/30 rounded-xl p-5 text-left mb-8">
          <h3 className="font-serif text-chocolate mb-2">💡 Antes de transferir</h3>
          <ul className="text-sm text-caramel space-y-1.5 list-disc pl-5">
            <li>
              En la <strong>referencia</strong> poné el número de pedido.
            </li>
            <li>
              Una vez transferido, <strong>envianos el comprobante por WhatsApp</strong>.
            </li>
            <li>Cuando confirmemos el pago, preparamos tu pedido y te avisamos.</li>
          </ul>
        </div>

        {settings.whatsapp && (
          <a
            href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}${
              orderNumber
                ? `?text=${encodeURIComponent(`Hola! Acabo de hacer el pedido ${orderNumber} y quiero enviar el comprobante.`)}`
                : ''
            }`}
            target="_blank"
            rel="noreferrer"
            className="block w-full mb-3 bg-[#25D366] text-white py-3 rounded-full font-semibold hover:bg-[#1eb356] transition"
          >
            Enviar comprobante por WhatsApp
          </a>
        )}

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