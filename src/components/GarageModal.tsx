/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TaxiStats } from '../types/game';
import { Wrench, X, Zap, Shield, Fuel, Gauge, Palette } from 'lucide-react';

interface GarageModalProps {
  stats: TaxiStats;
  onUpgrade: (type: 'speed' | 'accel' | 'brake' | 'tank', cost: number) => void;
  onSelectPaint: (paint: TaxiStats['paintStyle']) => void;
  onClose: () => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  stats,
  onUpgrade,
  onSelectPaint,
  onClose
}) => {
  const getUpgradeCost = (level: number) => level * 120;

  const upgrades = [
    {
      id: 'speed' as const,
      nameAr: 'تسقيط موتور وسرعة قصوى',
      descAr: 'زيادة السرعة القصوى للتاكسي على الكورنيش',
      icon: <Gauge className="w-5 h-5 text-amber-400" />,
      level: stats.speedLevel,
      maxLevel: 5
    },
    {
      id: 'accel' as const,
      nameAr: 'العزم وتسارع الانطلاق',
      descAr: 'انطلاق صاروخي عند فتح الإشارات الخضراء',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      level: stats.accelLevel,
      maxLevel: 5
    },
    {
      id: 'brake' as const,
      nameAr: 'فرامل رياضية وإطارات ثبات',
      descAr: 'توقف سريع وتحكم فائق عند التخميس والمنعطفات',
      icon: <Shield className="w-5 h-5 text-amber-400" />,
      level: stats.brakeLevel,
      maxLevel: 5
    },
    {
      id: 'tank' as const,
      nameAr: 'توسيع تانك البنزين',
      descAr: 'سعة أكبر لخزان الوقود لرحلات أطول دون توقف',
      icon: <Fuel className="w-5 h-5 text-amber-400" />,
      level: stats.tankLevel,
      maxLevel: 5
    }
  ];

  const paintStyles: { id: TaxiStats['paintStyle']; nameAr: string; descAr: string; color: string }[] = [
    {
      id: 'classic',
      nameAr: 'التاكسي السكندري الأصيل',
      descAr: 'الأسود والأصفر الكلاسيكي الشهير بشوارع الإسكندرية',
      color: '#f5b800'
    },
    {
      id: 'golden',
      nameAr: 'الإصدار الذهبي الملكي',
      descAr: 'طلاء ميتاليك ذهبي فاخر مع تشطيبات كروم لامعة',
      color: '#eab308'
    },
    {
      id: 'racing',
      nameAr: 'سبورت كورنيش إكسبريس',
      descAr: 'أصفر فاقع ولمسات رياضية سوداء للمحترفين',
      color: '#fbbf24'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 md:p-7 max-w-lg w-full shadow-2xl text-right flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">جراج تاكسي الإسكندرية</h2>
              <p className="text-xs text-slate-400">تعديل المحرك والفرامل والدهانات</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Wallet Display */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold">رصيد الأجرة المتاح:</span>
          <div className="flex items-center gap-1.5 font-kufi text-xl font-black text-amber-400">
            <span>{stats.money}</span>
            <span className="text-xs font-sans text-amber-300">ج.م</span>
          </div>
        </div>

        {/* Upgrades List */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-300">ترقيات الأداء الميكانيكي</h3>
          {upgrades.map(up => {
            const isMax = up.level >= up.maxLevel;
            const cost = getUpgradeCost(up.level);
            const canAfford = stats.money >= cost;

            return (
              <div
                key={up.id}
                className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 rounded-xl">{up.icon}</div>
                  <div>
                    <div className="text-sm font-bold text-slate-200">{up.nameAr}</div>
                    <div className="text-[11px] text-slate-400">{up.descAr}</div>
                    {/* Level Dots */}
                    <div className="flex items-center gap-1 mt-1.5">
                      {Array.from({ length: up.maxLevel }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3.5 h-1.5 rounded-full ${
                            i < up.level ? 'bg-amber-400' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {isMax ? (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800">
                    أقصى ترقية
                  </span>
                ) : (
                  <button
                    disabled={!canAfford}
                    onClick={() => onUpgrade(up.id, cost)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    ترقية · {cost} ج.م
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Paint Customization */}
        <div className="flex flex-col gap-3 border-t border-slate-800 pt-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-300">ألوان وتصميم التاكسي السكندري</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {paintStyles.map(p => (
              <button
                key={p.id}
                onClick={() => onSelectPaint(p.id)}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                  stats.paintStyle === p.id
                    ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: p.color }}
                  />
                  {stats.paintStyle === p.id && (
                    <span className="text-[10px] text-amber-400 font-bold">مُفعل حالياً</span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">{p.nameAr}</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{p.descAr}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-bold py-2.5 rounded-2xl text-xs transition-all cursor-pointer"
        >
          العودة للقيادة
        </button>
      </div>
    </div>
  );
};
