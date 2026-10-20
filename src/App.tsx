/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlexandriaGame } from './components/AlexandriaGame';
import { TaxiStats } from './types/game';
import { soundEngine } from './audio/soundEngine';
import { Play, Sparkles, Trophy, MapPin, Gauge } from 'lucide-react';

const STORAGE_KEY = 'alexandria_taxi_save_v1';

const DEFAULT_STATS: TaxiStats = {
  money: 50, // Starting seed money for gas
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
  const [stats, setStats] = useState<TaxiStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_STATS;
  });

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

  if (isPlaying) {
    return (
      <AlexandriaGame
        stats={stats}
        setStats={setStats}
        onSaveProgress={saveProgress}
      />
    );
  }

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 overflow-y-auto font-sans" dir="rtl">
      {/* Background Gradient & Subtle Grid */}
      <div className="absolute inset-0 bg-radial from-sky-950/40 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Main Hero Start Card */}
      <div className="relative z-10 max-w-xl w-full bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 md:p-9 shadow-2xl backdrop-blur-xl text-center flex flex-col items-center gap-6">
        {/* Alexandria Taxi Badge */}
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>محاكي قيادة واقعي ثلاثي الأبعاد 3D</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="font-kufi text-4xl md:text-5xl font-black text-amber-400 tracking-tight leading-tight">
            تاكسي الإسكندرية
          </h1>
          <p className="text-slate-300 text-sm md:text-base mt-2 leading-relaxed max-w-md mx-auto">
            عش أجواء عروس البحر الأبيض المتوسط! قُد تاكسي الإسكندرية الأصفر والأسود الشهير، استقبل الزبائن على الكورنيش، واكتشف كوبري ستانلي، قلعة قايتباي ومكتبة الإسكندرية بنظام عداد حقيقي وحركة مرور واقعية.
          </p>
        </div>

        {/* Key Features Pill Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 w-full text-right text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>معالم حقيقية</span>
            </div>
            <span className="text-[11px] text-slate-400">ستانلي وقايتباي والرمل</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Gauge className="w-3.5 h-3.5" />
              <span>فيزياء قيادة</span>
            </div>
            <span className="text-[11px] text-slate-400">تسارع وانعطاف وتخميس</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>مهام ركاب</span>
            </div>
            <span className="text-[11px] text-slate-400">عداد حقيقي وبقشيش</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>دورة ليل ونهار</span>
            </div>
            <span className="text-[11px] text-slate-400">غروب ساحلي وأضواء ليل</span>
          </div>
        </div>

        {/* Saved Career Preview */}
        {stats.tripsCompleted > 0 && (
          <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">التقدم المحفوظ:</span>
            <div className="flex items-center gap-3 font-bold text-slate-200">
              <span>{stats.tripsCompleted} مشوار منجز</span>
              <span className="text-amber-400 font-kufi text-sm">{stats.money} ج.م</span>
              <span>★ {stats.ratingAverage.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Start Game Action */}
        <button
          onClick={handleStartGame}
          className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 active:scale-98 text-slate-950 font-black py-4 px-6 rounded-2xl text-lg shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-slate-950" />
          <span>ابدأ الشغل والقيادة على الكورنيش</span>
        </button>

        {/* Controls Note */}
        <p className="text-[11px] text-slate-400 text-center">
          يدعم الكمبيوتر (الأسهم أو WASD · Space = هاندبريك · H = كلاكس · C = كاميرا) وأجهزة الموبايل عبر اللمس.
        </p>
      </div>
    </div>
  );
}
