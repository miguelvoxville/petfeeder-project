// File: src/components/ScheduleSettings.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useMQTT } from '../assets/MQTTContext';
import { v4 as uuidv4 } from 'uuid';
import toast, { Toaster } from 'react-hot-toast';

export interface Schedule {
  id: string;
  hour: number;
  minute: number;
  grams: number;
}

export default function ScheduleSettings() {
  const { publish } = useMQTT();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [stepsPerGram, setStepsPerGram] = useState<number>(20);
  const [speed, setSpeed] = useState<number>(800);
  const [reverse, setReverse] = useState<boolean>(true);
  const [anticlogSteps, setAnticlogSteps] = useState<number>(0);
  const [anticlogRatio, setAnticlogRatio] = useState<number>(0);
  const [suspend, setSuspend] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const userId = user.id;

    // Load user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!settingsError && settings) {
      setStepsPerGram(settings.steps_per_gram || stepsPerGram);
      setSpeed(settings.speed ?? speed);
      setReverse(settings.reverse ?? reverse);
      setAnticlogSteps(settings.anticlog_steps ?? anticlogSteps);
      setAnticlogRatio(settings.anticlog_ratio ?? anticlogRatio);
      setSuspend(settings.suspend ?? suspend);
    }

    // Load schedules
    const { data: scheds, error: schedsError } = await supabase
      .from('user_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('hour', { ascending: true });

    if (!schedsError && scheds) {
      setSchedules(
        scheds.map(s => ({
          id: s.id,
          hour: s.hour,
          minute: s.minute,
          grams: Math.round(s.steps / (settings?.steps_per_gram || stepsPerGram)),
        }))
      );
    }

    setLoading(false);
  };

  const sendPayload = (payload: any) => {
    publish('petfeeder/command', JSON.stringify(payload));
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm('Tem a certeza que quer apagar este agendamento?')) return;
    const { error } = await supabase.from('user_schedules').delete().eq('id', id);
    if (error) {
      toast.error('❌ Erro ao apagar: ' + error.message);
    } else {
      setSchedules(prev => prev.filter(s => s.id !== id));
      toast.success('🗑️ Agendamento apagado');
    }
  };

  const saveSchedules = async () => {
    setSaving(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      toast.error('❌ Utilizador não autenticado');
      setSaving(false);
      return;
    }
    const userId = user.id;

    const toUpsert = schedules.map(s => ({
      id: s.id || uuidv4(),
      user_id: userId,
      hour: s.hour,
      minute: s.minute,
      steps: Math.round(s.grams * stepsPerGram),
      speed,
      reverse,
      anticlog_steps: anticlogSteps,
      anticlog_ratio: anticlogRatio,
    }));

    const { error: upsertError } = await supabase
      .from('user_schedules')
      .upsert(toUpsert, { onConflict: 'id' });

    if (upsertError) {
      toast.error('❌ Erro ao guardar agendamentos: ' + upsertError.message);
      setSaving(false);
      return;
    }

    await supabase.from('user_settings').update({ suspend }).eq('user_id', userId);
    sendPayload({ schedules: toUpsert });
    sendPayload({ suspend });
    toast.success('✅ Agendamentos guardados!');
    setSaving(false);
  };

  const updateSchedule = (index: number, changes: Partial<Schedule>) => {
    setSchedules(prev =>
      prev.map((item, idx) => (idx === index ? { ...item, ...changes } : item))
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <progress className="progress w-56"></progress>
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" />
      <h2 className="text-2xl font-semibold mb-4">📅 Agendar horários</h2>

      <table className="table w-full mb-4">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Quantidade (g)</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s, i) => (
            <tr key={s.id}>
              <td>
                <input
                  type="time"
                  value={`${String(s.hour).padStart(2, '0')}:${String(s.minute).padStart(2, '0')}`}
                  onChange={e => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    updateSchedule(i, { hour: h, minute: m });
                  }}
                  className="input input-bordered input-sm w-24"
                />
              </td>
              <td>
                <input
                  type="number"
                  min={1}
                  value={s.grams}
                  onChange={e => updateSchedule(i, { grams: +e.target.value })}
                  className="input input-bordered input-sm w-20"
                />
              </td>
              <td>
                <button
                  className="btn btn-error btn-xs"
                  onClick={() => deleteSchedule(s.id)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="btn btn-outline btn-sm mb-4"
        onClick={() =>
          setSchedules([
            ...schedules,
            { id: uuidv4(), hour: 12, minute: 0, grams: 5 },
          ])
        }
      >
        ➕ Novo Agendamento
      </button>

      <div className="form-control mb-4">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="toggle toggle-primary mr-2"
            checked={suspend}
            onChange={e => setSuspend(e.target.checked)}
          />
          <span>Suspender agendamentos</span>
        </label>
      </div>

      <button
        className={`btn btn-primary${saving ? ' btn-disabled loading' : ''}`}
        onClick={saveSchedules}
        disabled={saving}
      >
        💾 Guardar Agendamentos
      </button>
    </div>
  );
}
