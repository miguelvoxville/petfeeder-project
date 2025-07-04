// File: src/components/Definicoes.tsx
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useMQTT } from './assets/MQTTContext'
import toast, { Toaster } from 'react-hot-toast'

export default function Definicoes() {
  const { publish } = useMQTT()

  // Estados de formulário como strings para permitir campo em branco e sem valores hardcoded
  const [inputGrams, setInputGrams] = useState<string>('')
  const [inputSteps, setInputSteps] = useState<string>('')
  const [speed, setSpeed] = useState<number>(800)
  const [reverse, setReverse] = useState<boolean>(true)
  const [anticlogSteps, setAnticlogSteps] = useState<number>(0)
  const [anticlogRatio, setAnticlogRatio] = useState<number>(0.1)
  const [otaUpdate, setOtaUpdate] = useState<{ version: string; url: string } | null>(null)

  const sendPayload = (payload: any) =>
    publish('petfeeder/command', JSON.stringify(payload))

  const saveSettings = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) return toast.error('❌ Utilizador não autenticado')

    // Converte string para número na hora de guardar
    const grams = parseInt(inputGrams, 10) || 0
    const steps = parseInt(inputSteps, 10) || 0
    if (grams <= 0) { toast.error('Gramas devem ser maiores que 0'); return }
    if (steps <= 0) { toast.error('Passos devem ser maiores que 0'); return }

    const stepsPerGram = steps / grams

    const { error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: user.id,
          steps_per_gram: stepsPerGram,
          x_grams: grams,
          speed,
          reverse,
          anticlog_steps: anticlogSteps,
          anticlog_ratio: anticlogRatio
        },
        { onConflict: ['user_id'] }
      )

    if (error) toast.error('❌ Erro ao guardar: ' + error.message)
    else toast.success('✅ Guardado com sucesso!')
  }

  const loadSettings = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) return

    // Carrega definições do usuário
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settings) {
      const xg = settings.x_grams ?? 0
      const spg = settings.steps_per_gram ?? 0
      setInputGrams(xg.toString())
      setInputSteps(Math.round(spg * xg).toString())
      setSpeed(settings.speed ?? 800)
      setReverse(settings.reverse ?? true)
      setAnticlogSteps(settings.anticlog_steps ?? 0)
      setAnticlogRatio(settings.anticlog_ratio ?? 0.1)
    }

    // Carrega atualização OTA disponível
    const { data: ota } = await supabase
      .from('ota')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .single()

    if (ota) setOtaUpdate({ version: ota.version, url: ota.url })
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return (
    <div className="p-4 space-y-6">
      <Toaster position="top-right" />

      <h2 className="text-2xl font-semibold">⚙️ Definições do Pet Feeder</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* calibração */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Calibração</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Gramas de referência</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={inputGrams}
                onChange={e => setInputGrams(e.target.value)}
                placeholder="–"
                min={1}
              />
            </div>
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Passos de referência</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={inputSteps}
                onChange={e => setInputSteps(e.target.value)}
                placeholder="–"
                min={1}
              />
            </div>
          </div>
        </div>

        {/* motor */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Motor</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Velocidade</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={speed}
                onChange={e => setSpeed(+e.target.value)}
                min={100}
              />
            </div>
            <div className="form-control mt-2">
              <label className="label cursor-pointer">
                <span className="label-text">Reverse</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={reverse}
                  onChange={e => setReverse(e.target.checked)}
                />
              </label>
            </div>
          </div>
        </div>

        {/* anti-clog */}
        <div className="card bg-base-100 shadow col-span-full md:col-span-2">
          <div className="card-body">
            <h3 className="card-title">Anti-clog</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Passos</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={anticlogSteps}
                onChange={e => setAnticlogSteps(+e.target.value)}
                min={0}
              />
            </div>
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Ratio ({anticlogRatio.toFixed(2)})</span>
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                className="range range-primary"
                value={anticlogRatio}
                onChange={e => setAnticlogRatio(+e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botão de salvar */}
      <button
        className="btn btn-soft btn-primary btn-block max-w-xs mx-auto"
        onClick={saveSettings}
      >
        💾 Guardar Definições
      </button>

      {/* OTA update */}
      {otaUpdate && (
        <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-lg font-medium">
            🔄 Atualização disponível: v{otaUpdate.version}
          </div>
          <div className="collapse-content">
            <button
              className="btn btn-primary"
              onClick={() => sendPayload({ ota_url: otaUpdate.url })}
            >
              ⚙️ Iniciar OTA
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
