import React, { useState, useEffect } from 'react';
import { AlexandriaGame } from './components/AlexandriaGame';
import { TaxiStats, VehicleMode } from './types/game';
import { soundEngine } from './audio/soundEngine';
import { Play, Sparkles, Trophy, MapPin, Gauge, Download, Rocket } from 'lucide-react';

const STORAGE_KEY = 'alexandria_taxi_save_v1';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string; }>;
}

const DEFAULT_STATS: TaxiStats = {
  money: 50,
  tripsCompleted: 0,
  ratingAverage: 5.0,
  fuel: 100,
  maxFuel: 100,
  speedLevel: 1,
  accelLevel: 1,
  brakeLevel: 1,
  tankLevel: 1,
  paintStyle: 'classic'
};

export default function App() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [vehicleMode, setVehicleMode] = useState<VehicleMode>('taxi');
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState<boolean>(false);
  const [stats, setStats] = useState<TaxiStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_STATS;
  });

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    };
  }, []);

  const saveProgress = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    saveProgress();
  }, [stats]);

  const handleStartGame = () => {
    soundEngine.init();
    soundEngine.resume();
    setIsPlaying(true);
  };

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShowInstallButton(false);
    }
    setInstallPrompt(null);
  };

  if (isPlaying) {
    return (
      <AlexandriaGame
        vehicleMode={vehicleMode}
        stats={stats}
        setStats={setStats}
        onSaveProgress={saveProgress}
      />
    );
  }

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-slate-950 text-slate-100" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.2),_transparent_32%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.2),_transparent_30%),linear-gradient(180deg,_#020817_0%,_#0f172a_100%)]" />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl rounded-[32px] border border-amber-400/30 bg-slate-900/80 p-6 shadow-[0_0_48px_rgba(251,191,36,0.18)] backdrop-blur-xl md:p-9">
          <div className="mb-6 flex items-center justify-between gap-3 text-xs font-bold text-amber-300">
            <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>محاكي قيادة واقعي 3D</span>
            </div>
            <div className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-sky-300">
              Alexandria Taxi Pro
            </div>
          </div>

          <div className="text-center">
            <h1 className="font-kufi text-4xl font-black tracking-tight text-amber-400 md:text-6xl">
              {vehicleMode === 'microbus' ? 'ميكروباص الإسكندرية' : 'تاكسي الإسكندرية'}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
              اختَر مركبتك وابدأ القيادة على كورنيش الإسكندرية، من المنتزه شرقًا حتى بحري وقلعة قايتباي غربًا، مع شوارع ومعالم ومهام قيادة.
            </p>
          </div>

          <div className="mt-7 grid gap-2.5 text-right sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-3">
              <div className="mb-1 flex items-center gap-2 text-amber-300">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-bold">معالم حقيقية</span>
              </div>
              <p className="text-[11px] text-slate-400">ستانلي · قايتباي · الرمل</p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-3">
              <div className="mb-1 flex items-center gap-2 text-amber-300">
                <Gauge className="h-4 w-4" />
                <span className="text-sm font-bold">فيزياء قيادة</span>
              </div>
              <p className="text-[11px] text-slate-400">تسارع · انزلاق · هاندبريك</p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-3">
              <div className="mb-1 flex items-center gap-2 text-amber-300">
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-bold">مهام ركاب</span>
              </div>
              <p className="text-[11px] text-slate-400">عدّاد حقيقي + بقشيش + تقييم</p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-3">
              <div className="mb-1 flex items-center gap-2 text-amber-300">
                <Rocket className="h-4 w-4" />
                <span className="text-sm font-bold">أداء عالي</span>
              </div>
              <p className="text-[11px] text-slate-400">تجربة سلسة للكمبيوتر والموبايل</p>
            </div>
          </div>

          {stats.tripsCompleted > 0 && (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-200">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-slate-400">التقدم المحفوظ:</span>
                <div className="flex flex-wrap items-center gap-3 font-bold">
                  <span>{stats.tripsCompleted} مشوار مكتمل</span>
                  <span className="text-amber-400">{stats.money} ج.م</span>
                  <span>★ {stats.ratingAverage.toFixed(1)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-7 grid grid-cols-2 gap-3" aria-label="اختيار المركبة">
            <button
              type="button"
              aria-pressed={vehicleMode === 'taxi'}
              onClick={() => setVehicleMode('taxi')}
              className={`rounded-2xl border-2 p-4 text-right transition active:scale-[0.99] ${
                vehicleMode === 'taxi'
                  ? 'border-amber-400 bg-amber-400/15 shadow-lg shadow-amber-500/10'
                  : 'border-slate-700 bg-slate-950/60 hover:border-slate-500'
              }`}
            >
              <div className="mb-1 text-2xl" aria-hidden="true">🚕</div>
              <div className="font-black text-amber-300">وضع التاكسي</div>
              <p className="mt-1 text-[11px] leading-5 text-slate-400">رحلات خاصة وعداد أجرة وترقيات</p>
            </button>
            <button
              type="button"
              aria-pressed={vehicleMode === 'microbus'}
              onClick={() => setVehicleMode('microbus')}
              className={`rounded-2xl border-2 p-4 text-right transition active:scale-[0.99] ${
                vehicleMode === 'microbus'
                  ? 'border-sky-400 bg-sky-400/15 shadow-lg shadow-sky-500/10'
                  : 'border-slate-700 bg-slate-950/60 hover:border-slate-500'
              }`}
            >
              <div className="mb-1 text-2xl" aria-hidden="true">🚐</div>
              <div className="font-black text-sky-300">وضع الميكروباص</div>
              <p className="mt-1 text-[11px] leading-5 text-slate-400">خط الكورنيش من المنتزه إلى بحري</p>
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleStartGame}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-4 text-lg font-black text-slate-950 shadow-[0_15px_35px_rgba(251,191,36,0.38)] transition hover:scale-[1.01] active:scale-[0.99]"
            >
              <Play className="h-6 w-6 fill-slate-950" />
              <span>{vehicleMode === 'microbus' ? 'ابدأ قيادة الميكروباص' : 'ابدأ اللعبة'}</span>
            </button>

            {showInstallButton && (
              <button
                onClick={handleInstallApp}
                className="flex items-center justify-center gap-2 rounded-2xl border border-sky-400/40 bg-sky-500/10 px-5 py-4 text-base font-bold text-sky-200 transition hover:bg-sky-500/20"
              >
                <Download className="h-5 w-5" />
                تثبيت التطبيق
              </button>
            )}
          </div>

          <p className="mt-5 text-center text-[11px] text-slate-400">
            يدعم الكمبيوتر (الأسهم أو WASD · Space = هاندبريك · H = كلاكس · C = كاميرا) وأجهزة الموبايل عبر اللمس.
          </p>
        </div>
      </div>
    </div>
  );
}
