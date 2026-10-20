/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GraphicSettings, TimeOfDay } from '../types/game';
import { Settings, X, Monitor, Keyboard, Sun, Moon, Sunset, Smartphone } from 'lucide-react';

interface SettingsModalProps {
  settings: GraphicSettings;
  setSettings: React.Dispatch<React.SetStateAction<GraphicSettings>>;
  timeOfDay: TimeOfDay;
  setTimeOfDay: (time: TimeOfDay) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  setSettings,
  timeOfDay,
  setTimeOfDay,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 md:p-7 max-w-lg w-full shadow-2xl text-right flex flex-col gap-5 max-h-[90vh] overflow-y-auto font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">الإعدادات وطريقة اللعب</h2>
              <p className="text-xs text-slate-400">الجرافيك، الوقت، وأزرار التحكم</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Time of Day Chooser */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-bold text-slate-300">أجواء وتوقيت الإسكندرية</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'day' as const, label: 'نهار مشرق', icon: <Sun className="w-4 h-4 text-amber-400" /> },
              { id: 'sunset' as const, label: 'غروب ذهبي', icon: <Sunset className="w-4 h-4 text-orange-400" /> },
              { id: 'night' as const, label: 'ليل الكورنيش', icon: <Moon className="w-4 h-4 text-indigo-400" /> }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTimeOfDay(t.id)}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  timeOfDay === t.id
                    ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.icon}
                <span className="text-xs font-bold">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Performance & Graphic Settings (Optimized for Android / Infinix Hot 60 Pro) */}
        <div className="flex flex-col gap-2.5 border-t border-slate-800 pt-3">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-300">أداء ورسومات اللعبة (الهاتف والكمبيوتر)</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-300">ظلال ناعمة وإضاءة واقعية</span>
              <button
                onClick={() => setSettings(s => ({ ...s, shadows: !s.shadows }))}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  settings.shadows ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.shadows ? 'مُفعّل' : 'مُعطّل (لتسريع الأداء)'}
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-300">كثافة حركة المرور</span>
              <div className="flex gap-1">
                {(['low', 'medium', 'high'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setSettings(s => ({ ...s, trafficDensity: d }))}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer ${
                      settings.trafficDensity === d
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {d === 'low' ? 'خفيف' : d === 'medium' ? 'متوسط' : 'مزدحم'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Controls Guide */}
        <div className="flex flex-col gap-2.5 border-t border-slate-800 pt-3">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-300">أزرار التحكم للكمبيوتر</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">W</kbd> أو <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">↑</kbd> : بنزين وتسارع</div>
            <div><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">S</kbd> أو <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">↓</kbd> : فرامل ورجوع للخلف</div>
            <div><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">A / D</kbd> أو <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">← / →</kbd> : توجيه وعجلات</div>
            <div><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">Space</kbd> : هاند بريك للتخميس</div>
            <div><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">H</kbd> : كلاكس التاكسي</div>
            <div><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">C</kbd> : تغيير زاوية الكاميرا</div>
          </div>
        </div>

        {/* Mobile touch notice */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-2xl border border-slate-800">
          <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>على شاشات اللمس والموبايل، تظهر أزرار القيادة والتوجيه والكلاكس أسفل الشاشة تلقائياً.</span>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold py-2.5 rounded-2xl text-xs transition-all cursor-pointer shadow-lg"
        >
          حفظ وإغلاق
        </button>
      </div>
    </div>
  );
};
