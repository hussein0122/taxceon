/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { ActiveTrip, CameraViewMode, Passenger, TaxiStats, TimeOfDay, VehicleMode } from '../types/game';
import { ALEXANDRIA_LANDMARKS, ALEXANDRIA_ROADS, MICROBUS_ROUTE_STOP_IDS } from '../city/alexandriaData';
import {
  Camera,
  Compass,
  DollarSign,
  Fuel,
  Volume2,
  VolumeX,
  Wrench,
  Sun,
  Sunset,
  Moon,
  HelpCircle,
  Navigation
} from 'lucide-react';

interface GameHUDProps {
  vehicleMode: VehicleMode;
  stats: TaxiStats;
  activeTrip: ActiveTrip | null;
  availablePassenger: Passenger | null;
  playerPos: { x: number; y: number; z: number; speed: number; yaw: number };
  timeOfDay: TimeOfDay;
  cameraMode: CameraViewMode;
  isMuted: boolean;
  sayMessage: string | null;
  canRefuel: boolean;
  refuelCost: number;
  onAcceptPassenger: () => void;
  onCycleCamera: () => void;
  onCycleTimeOfDay: () => void;
  onToggleMute: () => void;
  onOpenGarage: () => void;
  onOpenSettings: () => void;
  onRefuel: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  vehicleMode,
  stats,
  activeTrip,
  availablePassenger,
  playerPos,
  timeOfDay,
  cameraMode,
  isMuted,
  sayMessage,
  canRefuel,
  refuelCost,
  onAcceptPassenger,
  onCycleCamera,
  onCycleTimeOfDay,
  onToggleMute,
  onOpenGarage,
  onOpenSettings,
  onRefuel
}) => {
  const miniMapRef = useRef<HTMLCanvasElement | null>(null);
  const speedKmh = Math.abs(Math.round(playerPos.speed * 3.6));
  const nextMicrobusStopX = activeTrip
    ? activeTrip.passenger.dropoffLocation.x
    : availablePassenger?.pickupLocation.x;
  const microbusDirection = nextMicrobusStopX === undefined
    ? (playerPos.x > 0 ? 'اتجاه بحري' : 'اتجاه المنتزه')
    : nextMicrobusStopX < playerPos.x ? 'اتجاه بحري' : 'اتجاه المنتزه';

  // Render Alexandria GPS Minimap
  useEffect(() => {
    const canvas = miniMapRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Map coordinate system:
    // Centered around player or entire coastline
    // Let's create an intuitive GPS camera that rotates and tracks player
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-playerPos.yaw);

    const scale = 0.28; // Map zoom scale

    // Draw Mediterranean Sea (North)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-800 * scale, (-300 - playerPos.z) * scale, 1600 * scale, 200 * scale);

    // Draw Roads Network
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ALEXANDRIA_ROADS.forEach(road => {
      ctx.beginPath();
      road.points.forEach((pt, idx) => {
        const mx = (pt.x - playerPos.x) * scale;
        const mz = (pt.z - playerPos.z) * scale;
        if (idx === 0) ctx.moveTo(mx, mz);
        else ctx.lineTo(mx, mz);
      });
      ctx.strokeStyle = road.id === 'corniche_main' ? '#f59e0b' : '#64748b';
      ctx.lineWidth = Math.max(3, (road.points[0].width || 18) * scale * 0.7);
      ctx.stroke();
    });

    // Draw Key Landmarks
    ALEXANDRIA_LANDMARKS.forEach(lm => {
      const lx = (lm.position.x - playerPos.x) * scale;
      const lz = (lm.position.z - playerPos.z) * scale;

      ctx.beginPath();
      ctx.arc(lx, lz, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = lm.type === 'gas' ? '#10b981' : vehicleMode === 'microbus' && (MICROBUS_ROUTE_STOP_IDS as readonly string[]).includes(lm.id) ? '#f97316' : '#38bdf8';
      ctx.fill();
    });

    // Draw Active Mission Target Beacons
    if (activeTrip) {
      const targetPos =
        activeTrip.state === 'to_pickup'
          ? activeTrip.passenger.pickupLocation
          : activeTrip.passenger.dropoffLocation;

      const tx = (targetPos.x - playerPos.x) * scale;
      const tz = (targetPos.z - playerPos.z) * scale;

      // Pulsing destination beacon ring
      ctx.beginPath();
      ctx.arc(tx, tz, 7, 0, Math.PI * 2);
      ctx.strokeStyle = activeTrip.state === 'to_pickup' ? '#22c55e' : '#eab308';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(tx, tz, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = activeTrip.state === 'to_pickup' ? '#22c55e' : '#eab308';
      ctx.fill();
    }

    ctx.restore();

    // Draw Player Taxi (Fixed in center of minimap, facing upwards)
    ctx.save();
    ctx.translate(w / 2, h / 2);

    // Player arrow
    ctx.fillStyle = vehicleMode === 'microbus' ? '#38bdf8' : '#facc15'; // Vehicle mode color
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, 7);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }, [playerPos, activeTrip, vehicleMode]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-5 select-none font-sans">
      {/* Top Bar: Taximeter + Status/Dialogue + Minimap */}
      <div className="flex justify-between items-start gap-3 w-full">
        {/* Alexandria Digital Taximeter */}
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-amber-500/40 rounded-2xl p-3 shadow-xl min-w-[155px] text-right">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>{vehicleMode === 'microbus' ? 'أجرة خط الميكروباص' : 'العداد السكندري'}</span>
            <span className="text-amber-400">ج.م</span>
          </div>
          <div className="font-kufi text-3xl font-black text-amber-400 tracking-tight">
            {activeTrip ? activeTrip.currentFare.toFixed(1) : '١٥٫٠'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300 mt-1 border-t border-slate-800 pt-1">
            <span>
              {activeTrip ? `${activeTrip.distanceCoveredKm.toFixed(2)} كم` : 'جاهز للطلب'}
            </span>
            <span>
              {activeTrip ? `انتظار ${Math.floor(activeTrip.waitTimeSeconds / 60)} د` : 'متاح'}
            </span>
          </div>
        </div>

        {/* Center: Passenger Speech & Status Banner */}
        <div className="flex-1 flex flex-col items-center gap-2 max-w-md mx-2">
          {sayMessage && (
            <div className="pointer-events-auto bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-2xl shadow-xl text-center text-sm md:text-base border border-amber-300 animate-in fade-in zoom-in duration-200">
              {sayMessage}
            </div>
          )}

          {vehicleMode === 'microbus' && (
            <div className="pointer-events-auto w-full rounded-2xl border border-sky-400/50 bg-slate-950/90 p-3 text-right shadow-xl backdrop-blur-md">
              <div className="mb-1 text-xs font-black text-sky-300">🚐 خط الكورنيش — {microbusDirection}</div>
              <div className="text-[10px] leading-5 text-slate-200">
                {MICROBUS_ROUTE_STOP_IDS.map((stopId, index) => {
                  const stop = ALEXANDRIA_LANDMARKS.find(landmark => landmark.id === stopId);
                  return stop ? (
                    <span key={stopId}>
                      {stop.nameAr}{index < MICROBUS_ROUTE_STOP_IDS.length - 1 ? ' ← ' : ''}
                    </span>
                  ) : null;
                })}
              </div>
              <div className="mt-1 text-[10px] text-sky-200/80">الخط داخل نسخة اللعبة التقريبية من المنتزه إلى بحري وقلعة قايتباي.</div>
            </div>
          )}

          {/* New Ride Request Card */}
          {availablePassenger && !activeTrip && (
            <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-emerald-500/50 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 w-full animate-bounce-short">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{availablePassenger.avatarIcon}</span>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">طلب توصيل جديد!</div>
                  <div className="text-sm font-semibold text-slate-100">{availablePassenger.nameAr}</div>
                  <div className="text-[11px] text-slate-400">
                    إلى: {availablePassenger.dropoffLocation.nameAr}
                  </div>
                </div>
              </div>
              <button
                onClick={onAcceptPassenger}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all whitespace-nowrap cursor-pointer"
              >
                قبول الطلب
              </button>
            </div>
          )}

          {/* Active Navigation Hint */}
          {activeTrip && (
            <div className="bg-slate-900/75 border border-slate-700/60 rounded-full px-4 py-1 text-xs text-slate-200 flex items-center gap-2 shadow-lg">
              <Navigation className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>
                {activeTrip.state === 'to_pickup'
                  ? `توجّه لموقع الزبون: ${activeTrip.passenger.pickupLocation.nameAr}`
                  : `الوجهة المطلوبة: ${activeTrip.passenger.dropoffLocation.nameAr}`}
              </span>
            </div>
          )}
        </div>

        {/* Top Right: Wallet, Minimap, Quick Toggles */}
        <div className="flex flex-col items-end gap-2.5">
          {/* Earnings & Rating */}
          <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-2xl px-3 py-1.5 shadow-lg flex items-center gap-4 text-xs font-bold text-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400">ج.م</span>
              <span className="font-kufi text-base text-amber-300 font-extrabold">{stats.money}</span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div className="flex items-center gap-1">
              <span className="text-amber-400">★</span>
              <span>{stats.ratingAverage.toFixed(1)}</span>
            </div>
          </div>

          {/* GPS Minimap */}
          <div className="pointer-events-auto relative rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl bg-slate-950/90">
            <canvas ref={miniMapRef} width={135} height={135} className="block" />
            <div className="absolute top-1 right-1 text-[9px] bg-slate-900/80 px-1 rounded text-slate-400 font-mono">
              GPS ALEX
            </div>
          </div>

          {/* Quick HUD Action Buttons */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm p-1 rounded-2xl border border-slate-800 shadow">
            <button
              onClick={onCycleCamera}
              title={`تغيير الكاميرا (${cameraMode})`}
              className="p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              onClick={onCycleTimeOfDay}
              title={`الوقت: ${timeOfDay}`}
              className="p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            >
              {timeOfDay === 'day' ? <Sun className="w-4 h-4 text-amber-400" /> : timeOfDay === 'sunset' ? <Sunset className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
            <button
              onClick={onToggleMute}
              title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
              className="p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onOpenGarage}
              title="جراج التعديل والترقية"
              className="p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSettings}
              title="الإعدادات والمساعدة"
              className="p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Gas Station Refueling Prompt */}
      {canRefuel && (
        <div className="self-center pointer-events-auto bg-emerald-950/90 border-2 border-emerald-500 rounded-2xl p-3 shadow-2xl flex items-center gap-3 animate-pulse">
          <Fuel className="w-6 h-6 text-emerald-400" />
          <div className="text-right">
            <div className="text-xs font-bold text-emerald-300">أنت في محطة وقود الكورنيش</div>
            <div className="text-xs text-slate-300">تموين الخزان بالكامل: {refuelCost} ج.م</div>
          </div>
          <button
            onClick={onRefuel}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-xl text-xs shadow-lg cursor-pointer active:scale-95"
          >
            فوّل التانك ⛽
          </button>
        </div>
      )}

      {/* Bottom Center: Speedometer & Fuel Gauge */}
      <div className="self-center flex flex-col items-center gap-1 mb-2 pointer-events-none">
        {/* Speedometer Digital Readout */}
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-2xl px-5 py-2 shadow-xl flex items-baseline gap-2">
          <span className="font-kufi text-4xl font-black text-amber-400 tracking-tight">
            {speedKmh}
          </span>
          <span className="text-xs font-bold text-slate-400">كم/س</span>
        </div>

        {/* Fuel Gauge Bar */}
        <div className="w-36 bg-slate-900/80 border border-slate-700/50 rounded-full h-3 p-0.5 overflow-hidden flex items-center shadow">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              stats.fuel < 20 ? 'bg-rose-500 animate-pulse' : stats.fuel < 45 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(4, (stats.fuel / stats.maxFuel) * 100)}%` }}
          />
        </div>
        <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
          <Fuel className="w-3 h-3 text-amber-400" />
          <span>بنزين ٩٢</span>
        </div>
      </div>
    </div>
  );
};
