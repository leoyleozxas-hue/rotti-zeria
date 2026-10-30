// components/admin/SettingsForm.jsx
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Phone, Share2, CreditCard, Loader2, Save, Check } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import Panel, { PanelHeader } from '@/components/ui/panel'
import Field, { fieldClass } from '@/components/ui/field'
import { Button } from '@/components/ui/button'

const TABS = [
  { id: 'contacto', label: 'Contacto', icon: Phone },
  { id: 'redes', label: 'Redes sociales', icon: Share2 },
  { id: 'banco', label: 'Datos bancarios', icon: CreditCard },
]

// A prueba de balas: si settings es undefined, no explota
function buildFormValues(settings) {
  const s = settings || {}
  return {
    address: s.address || '',
    phone: s.phone || '',
    whatsapp: s.whatsapp || '',
    email: s.email || '',
    instagram: s.instagram || '',
    facebook: s.facebook || '',
    x: s.x || '',
    hours_weekdays: s.hours?.weekdays || '',
    hours_sunday: s.hours?.sunday || '',
    bank_name: s.bank?.name || '',
    bank_holder: s.bank?.holder || '',
    bank_alias: s.bank?.alias || '',
    bank_cbu: s.bank?.cbu || '',
    bank_account_number: s.bank?.accountNumber || '',
  }
}

export default function SettingsForm({ initialSettings }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('contacto')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: buildFormValues(initialSettings),
  })

  // Si initialSettings cambia (por el router.refresh después de guardar),
  // reseteamos el form → isDirty vuelve a false
  useEffect(() => {
    reset(buildFormValues(initialSettings))
  }, [initialSettings, reset])

  async function onSubmit(data) {
    setLoading(true)

    try {
      const supabase = createClient()
      const payload = {
        address: data.address,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        instagram: data.instagram,
        facebook_url: data.facebook,
        x_url: data.x,
        hours_weekdays: data.hours_weekdays,
        hours_sunday: data.hours_sunday,
        bank_name: data.bank_name,
        bank_holder: data.bank_holder,
        bank_alias: data.bank_alias,
        bank_cbu: data.bank_cbu,
        bank_account_number: data.bank_account_number,
      }

      const { error } = await supabase
        .from('settings')
        .upsert({ id: 1, ...payload }, { onConflict: 'id' })

      if (error) throw error

      toast.success('Configuración guardada')
      // Tomamos los datos recién guardados como nuevo "default" → isDirty = false
      reset(data)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('No se pudo guardar', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 pb-4 border-b border-white/10">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-field border transition ${
                active
                  ? 'bg-gradient-to-r from-gold-soft/30 to-gold-soft/10 text-white font-semibold border-gold/50 shadow-[inset_0_1px_0_rgba(255,255,255,.15)]'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={15} aria-hidden className={active ? 'text-gold-soft' : ''} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Contenido */}
      <div className="mx-auto w-full max-w-2xl">
        {activeTab === 'contacto' && (
          <Panel tone="glass" padded={false}>
            <PanelHeader title="Información de contacto" />
            <div className="space-y-4 p-5 md:p-6">
              <Field label="Dirección" htmlFor="address">
                {({ hasError }) => (
                  <input
                    id="address"
                    {...register('address')}
                    className={fieldClass(hasError)}
                    placeholder="Av. Principal 123"
                  />
                )}
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Teléfono" htmlFor="phone" hint="Ej: +598 2900 0000">
                  {({ hasError }) => (
                    <input
                      id="phone"
                      {...register('phone')}
                      className={fieldClass(hasError)}
                      placeholder="+598 2900 0000"
                    />
                  )}
                </Field>

                <Field label="Email" htmlFor="email">
                  {({ hasError }) => (
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      className={fieldClass(hasError)}
                      placeholder="hola@tupanaderia.com"
                    />
                  )}
                </Field>
              </div>

              <Field
                label="WhatsApp"
                htmlFor="whatsapp"
                hint="Solo números con código de país. Ej: 59891234567"
              >
                {({ hasError }) => (
                  <input
                    id="whatsapp"
                    {...register('whatsapp')}
                    className={fieldClass(hasError)}
                    placeholder="59891234567"
                  />
                )}
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Horario días de semana" htmlFor="hours_weekdays">
                  {({ hasError }) => (
                    <input
                      id="hours_weekdays"
                      {...register('hours_weekdays')}
                      className={fieldClass(hasError)}
                      placeholder="Lun a Sáb · 7:00 a 20:00"
                    />
                  )}
                </Field>

                <Field label="Horario domingos" htmlFor="hours_sunday">
                  {({ hasError }) => (
                    <input
                      id="hours_sunday"
                      {...register('hours_sunday')}
                      className={fieldClass(hasError)}
                      placeholder="Dom · 8:00 a 13:00"
                    />
                  )}
                </Field>
              </div>
            </div>
          </Panel>
        )}

        {activeTab === 'redes' && (
          <Panel tone="glass" padded={false}>
            <PanelHeader title="Redes sociales" />
            <div className="space-y-4 p-5 md:p-6">
              <Field label="Instagram" htmlFor="instagram" hint="URL completa, con https://">
                {({ hasError }) => (
                  <input
                    id="instagram"
                    {...register('instagram')}
                    className={fieldClass(hasError)}
                    placeholder="https://instagram.com/tupanaderia"
                  />
                )}
              </Field>

              <Field label="Facebook" htmlFor="facebook" hint="Dejalo vacío si no tienen">
                {({ hasError }) => (
                  <input
                    id="facebook"
                    {...register('facebook')}
                    className={fieldClass(hasError)}
                    placeholder="https://facebook.com/tupanaderia"
                  />
                )}
              </Field>

              <Field label="X (Twitter)" htmlFor="x" hint="Dejalo vacío si no tienen">
                {({ hasError }) => (
                  <input
                    id="x"
                    {...register('x')}
                    className={fieldClass(hasError)}
                    placeholder="https://x.com/tupanaderia"
                  />
                )}
              </Field>

              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-white/50">
                Las redes que dejes vacías no se van a mostrar en el footer.
              </div>
            </div>
          </Panel>
        )}

        {activeTab === 'banco' && (
          <Panel tone="glass" padded={false}>
            <PanelHeader title="Datos para transferencias" />
            <div className="space-y-4 p-5 md:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Banco" htmlFor="bank_name">
                  {({ hasError }) => (
                    <input
                      id="bank_name"
                      {...register('bank_name')}
                      className={fieldClass(hasError)}
                      placeholder="Banco Ejemplo"
                    />
                  )}
                </Field>

                <Field label="Titular de la cuenta" htmlFor="bank_holder">
                  {({ hasError }) => (
                    <input
                      id="bank_holder"
                      {...register('bank_holder')}
                      className={fieldClass(hasError)}
                      placeholder="Tu Panadería S.A."
                    />
                  )}
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Alias" htmlFor="bank_alias">
                  {({ hasError }) => (
                    <input
                      id="bank_alias"
                      {...register('bank_alias')}
                      className={fieldClass(hasError)}
                      placeholder="LA.PANADERIA"
                    />
                  )}
                </Field>

                <Field label="CBU" htmlFor="bank_cbu">
                  {({ hasError }) => (
                    <input
                      id="bank_cbu"
                      {...register('bank_cbu')}
                      className={`font-mono ${fieldClass(hasError)}`}
                      placeholder="0000003100000000000000"
                    />
                  )}
                </Field>
              </div>

              <Field label="Número de cuenta" htmlFor="bank_account_number" hint="Opcional">
                {({ hasError }) => (
                  <input
                    id="bank_account_number"
                    {...register('bank_account_number')}
                    className={`font-mono ${fieldClass(hasError)}`}
                    placeholder="000-123456/7"
                  />
                )}
              </Field>
            </div>
          </Panel>
        )}
      </div>

      {/* Footer con botón alineado a la derecha */}
      <div className="mx-auto w-full max-w-2xl border-t border-white/10 pt-4">
        <div
          className={`flex flex-col-reverse gap-3 sm:flex-row sm:items-center ${
            isDirty ? 'sm:justify-between' : 'sm:justify-end'
          }`}
        >
          {isDirty && (
            <p className="text-xs text-gold-soft/70">Tenés cambios sin guardar</p>
          )}
          {!isDirty && !loading && (
            <p className="hidden text-xs text-emerald-400/70 sm:flex sm:items-center sm:gap-1">
              <Check size={12} /> Todo guardado
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading || !isDirty}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 size={16} aria-hidden className="animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <Save size={16} aria-hidden />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}