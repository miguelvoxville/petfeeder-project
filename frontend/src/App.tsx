// File: src/App.tsx
import { useEffect, useState, useContext } from 'react'
import { supabase } from './lib/supabase'
import { MQTTContext } from './assets/MQTTContext'
import Login from './assets/Login'
import SettingsTab from './SettingsTab'
import ScheduleSettings from './components/ScheduleSettings'
import { Navbar } from './components/Navbar'
import { DockNav } from './components/DockNav'
import './index.css'

// importe a sua splash image
import SplashImg from './assets/splash.png'

export default function App() {
  const { publish } = useContext(MQTTContext)

  // sessão: undefined = verificando, null = não está logado, object = logado
  const [session, setSession] = useState<any | null | undefined>(undefined)

  // controla exibição do splash
  const [showSplash, setShowSplash] = useState(false)

  // aba atual
  const [tab, setTab] = useState<'painel' | 'agendamentos' | 'definicoes'>('painel')

  // slider de gramas
  const [grams, setGrams] = useState(5)

  // definições vindas da BD
  const [stepsPerGram, setStepsPerGram] = useState<number | null>(null)
  const [speed, setSpeed] = useState<number>(800)
  const [reverse, setReverse] = useState<boolean>(false)
  const [anticlogSteps, setAnticlogSteps] = useState<number>(0)
  const [anticlogRatio, setAnticlogRatio] = useState<number>(0)

  // 1) Inicializa sessão
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: sub } = supabase.auth.onAuthStateChange((_, sess) => setSession(sess))
    return () => sub.subscription.unsubscribe()
  }, [])

  // 2) Quando entra em sessão válida, dispara o splash
  useEffect(() => {
    if (session) {
      setShowSplash(true)
      const timer = setTimeout(() => setShowSplash(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [session])

  // 3) Carrega definições do user
  useEffect(() => {
    if (!session) return
    const userId = session.user?.id
    if (!userId) return

    supabase
      .from('user_settings')
      .select('steps_per_gram, speed, reverse, anticlog_steps, anticlog_ratio')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setStepsPerGram(data.steps_per_gram)
          setSpeed(data.speed)
          setReverse(data.reverse)
          setAnticlogSteps(data.anticlog_steps)
          setAnticlogRatio(data.anticlog_ratio)
        }
      })
  }, [session])

  // enquanto verifica sessão...
  if (session === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        🔄 A verificar sessão...
      </div>
    )
  }

  // se não estiver logado
  if (session === null) {
    return <Login />
  }

  // se estiver logado mas ainda dentro do splash
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-base-200 flex items-center justify-center">
        <img src={SplashImg} className="object-cover w-full h-full" alt="Splash" />
      </div>
    )
  }

  // helper para enviar MQTT
  const sendPayload = (payload: any) => {
    publish('petfeeder/command', JSON.stringify(payload))
  }

  // ação de alimentar agora
  const alimentarAgora = () => {
    if (stepsPerGram === null) {
      alert('❌ Atualiza as definições antes de alimentar.')
      return
    }
    const steps = Math.round(grams * stepsPerGram)
    sendPayload({
      command: 'feed',
      steps,
      speed,
      reverse,
      anticlog_steps: anticlogSteps,
      anticlog_ratio: anticlogRatio,
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <Navbar />

      <div className="flex-1 p-4 pb-20">
        {tab === 'painel' && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium">▶️ Alimentação manual</h2>

            <div className="w-full max-w-xs">
              <div className="mb-2 text-center font-semibold">{grams} g</div>
              <input
                type="range"
                min={0}
                max={500}
                step={1}
                value={grams}
                onChange={(e) => setGrams(+e.target.value)}
                className="range range-primary"
              />
              <div className="flex justify-between px-2.5 mt-2 text-xs">
                <span>0</span>
                <span>125</span>
                <span>250</span>
                <span>375</span>
                <span>500</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-soft btn-primary btn-block"
              onClick={alimentarAgora}
            >
              🍽️ Alimentar
            </button>
          </div>
        )}

        {tab === 'agendamentos' && <ScheduleSettings />}
        {tab === 'definicoes' && <SettingsTab />}
      </div>

      <DockNav tab={tab} setTab={setTab} />
    </div>
  )
}
