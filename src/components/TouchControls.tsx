/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { ControlState } from '../types/game';

interface TouchControlsProps {
  controls: ControlState;
  setControls: React.Dispatch<React.SetStateAction<ControlState>>;
  onHornPress: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  controls,
  setControls,
  onHornPress
}) => {
  const handleButtonDown = useCallback(
    (key: keyof ControlState) => (e: React.PointerEvent) => {
      e.preventDefault();
      setControls(prev => ({ ...prev, [key]: true }));
      if (key === 'horn') {
        onHornPress();
      }
    },
    [setControls, onHornPress]
  );

  const handleButtonUp = useCallback(
    (key: keyof ControlState) => (e: React.PointerEvent) => {
      e.preventDefault();
      setControls(prev => ({ ...prev, [key]: false }));
    },
    [setControls]
  );

  const toggleReverse = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setControls(prev => ({ ...prev, reverse: !prev.reverse }));
  }, [setControls]);

  return (
    <div className="absolute inset-x-0 bottom-3 pointer-events-none flex justify-between items-end px-3 md:px-8 select-none z-20">
      {/* Left Touch: Steering Controls */}
      <div className="pointer-events-auto flex items-center gap-3">
        <button
          onPointerDown={handleButtonDown('left')}
          onPointerUp={handleButtonUp('left')}
          onPointerLeave={handleButtonUp('left')}
          onPointerCancel={handleButtonUp('left')}
          className={`w-18 h-18 md:w-20 md:h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-black shadow-2xl transition-transform active:scale-90 ${
            controls.left
              ? 'bg-amber-500 text-slate-950 border-amber-400 scale-95 shadow-amber-500/40'
              : 'bg-slate-900/80 text-slate-100 border-slate-700/60 backdrop-blur-md'
          }`}
          aria-label="انعطاف يسار"
        >
          ◀
        </button>

        <button
          onPointerDown={handleButtonDown('right')}
          onPointerUp={handleButtonUp('right')}
          onPointerLeave={handleButtonUp('right')}
          onPointerCancel={handleButtonUp('right')}
          className={`w-18 h-18 md:w-20 md:h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-black shadow-2xl transition-transform active:scale-90 ${
            controls.right
              ? 'bg-amber-500 text-slate-950 border-amber-400 scale-95 shadow-amber-500/40'
              : 'bg-slate-900/80 text-slate-100 border-slate-700/60 backdrop-blur-md'
          }`}
          aria-label="انعطاف يمين"
        >
          ▶
        </button>
      </div>

      {/* Right Touch: Pedals & Actions */}
      <div className="pointer-events-auto flex flex-col items-end gap-2.5">
        {/* Top Secondary Row: Horn + Reverse Gear + Handbrake */}
        <div className="flex items-center gap-2">
          <button
            onPointerDown={handleButtonDown('horn')}
            onPointerUp={handleButtonUp('horn')}
            onPointerLeave={handleButtonUp('horn')}
            className={`px-3 py-2.5 rounded-xl border font-bold text-xs shadow-lg backdrop-blur-md transition-all active:scale-95 ${
              controls.horn
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900/80 text-amber-400 border-slate-700'
            }`}
          >
            كلاكس 📯
          </button>

          <button
            onPointerDown={toggleReverse}
            className={`px-3 py-2.5 rounded-xl border font-black text-xs shadow-lg backdrop-blur-md transition-all active:scale-95 ${
              controls.reverse
                ? 'bg-rose-600 text-white border-rose-400'
                : 'bg-slate-900/80 text-slate-300 border-slate-700'
            }`}
          >
            {controls.reverse ? 'ريفيرس [R]' : 'درايف [D]'}
          </button>

          <button
            onPointerDown={handleButtonDown('handbrake')}
            onPointerUp={handleButtonUp('handbrake')}
            onPointerLeave={handleButtonUp('handbrake')}
            className={`px-3 py-2.5 rounded-xl border font-bold text-xs shadow-lg backdrop-blur-md transition-all active:scale-95 ${
              controls.handbrake
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900/80 text-slate-300 border-slate-700'
            }`}
          >
            هاند بريك
          </button>
        </div>

        {/* Bottom Primary Row: Brake & Gas Pedals */}
        <div className="flex items-center gap-3">
          {/* Brake Pedal */}
          <button
            onPointerDown={handleButtonDown('brake')}
            onPointerUp={handleButtonUp('brake')}
            onPointerLeave={handleButtonUp('brake')}
            onPointerCancel={handleButtonUp('brake')}
            className={`w-18 h-20 md:w-20 md:h-22 rounded-2xl border-2 flex flex-col items-center justify-center font-black shadow-2xl transition-transform active:scale-90 ${
              controls.brake
                ? 'bg-rose-600 text-white border-rose-400 scale-95 shadow-rose-600/40'
                : 'bg-slate-900/80 text-rose-400 border-slate-700/60 backdrop-blur-md'
            }`}
          >
            <span className="text-xl">🛑</span>
            <span className="text-xs mt-1">فرامل</span>
          </button>

          {/* Gas Pedal */}
          <button
            onPointerDown={handleButtonDown('gas')}
            onPointerUp={handleButtonUp('gas')}
            onPointerLeave={handleButtonUp('gas')}
            onPointerCancel={handleButtonUp('gas')}
            className={`w-22 h-24 md:w-24 md:h-26 rounded-2xl border-2 flex flex-col items-center justify-center font-black shadow-2xl transition-transform active:scale-90 ${
              controls.gas
                ? 'bg-amber-400 text-slate-950 border-amber-300 scale-95 shadow-amber-400/50'
                : 'bg-amber-500/25 text-amber-300 border-amber-500/60 backdrop-blur-md'
            }`}
          >
            <span className="text-2xl">⚡</span>
            <span className="text-sm mt-1">بنزين</span>
          </button>
        </div>
      </div>
    </div>
  );
};
