// components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-wood text-cream mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-serif text-2xl mb-3">Biarritz</h3>
          <p className="text-sm text-cream/70">
            Panadería artesanal. Elaborado a mano, todos los días.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-3">Contacto</h4>
          <p className="text-sm text-cream/70">Av. Siempre Viva 123</p>
          <p className="text-sm text-cream/70">WhatsApp: 11 1234-5678</p>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-3">Horarios</h4>
          <p className="text-sm text-cream/70">Lun a Sáb: 7:00 - 20:00</p>
          <p className="text-sm text-cream/70">Dom: 8:00 - 13:00</p>
        </div>
      </div>
      <div className="border-t border-cream/10 py-4 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} Biarritz. Todos los derechos reservados.
      </div>
    </footer>
  )
}