import React from 'react';
import { Layers, Utensils, GlassWater, AlertCircle, Clock } from 'lucide-react';
import { PlateCount, GlassCount, TableEquipmentItem } from '../types';

interface EquipmentSectionProps {
  plates: PlateCount;
  glasses: GlassCount;
  equipment: TableEquipmentItem[];
}

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({
  plates,
  glasses,
  equipment,
}) => {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold font-display text-stone-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            Dining Hall Equipment & Ware Status
          </h3>
          <p className="text-xs text-stone-500">
            Real-time tracking of plates, drinking glasses, and table dispensers across hall tables.
          </p>
        </div>
      </div>

      {/* Plates & Glasses Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Plates */}
        <div className="p-4 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-display uppercase tracking-wider text-stone-900">
                  Plate Tracking
                </h4>
                <span className="text-[10px] text-stone-400">Total: {plates.total}</span>
              </div>
            </div>
            <span className="text-[10px] text-stone-500 font-mono">
              Updated {plates.lastUpdated || 'Today'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-base font-bold font-mono text-emerald-700">{plates.available}</div>
              <div className="text-[10px] text-emerald-800 font-semibold uppercase">Available</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
              <div className="text-base font-bold font-mono text-amber-700">{plates.issued}</div>
              <div className="text-[10px] text-amber-800 font-semibold uppercase">In Serving</div>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
              <div className="text-base font-bold font-mono text-rose-700">{plates.missing}</div>
              <div className="text-[10px] text-rose-800 font-semibold uppercase">Missing</div>
            </div>
          </div>
        </div>

        {/* Glasses */}
        <div className="p-4 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center">
                <GlassWater className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-display uppercase tracking-wider text-stone-900">
                  Glass Tracking
                </h4>
                <span className="text-[10px] text-stone-400">Total: {glasses.total}</span>
              </div>
            </div>
            <span className="text-[10px] text-stone-500 font-mono">
              Updated {glasses.lastUpdated || 'Today'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-base font-bold font-mono text-emerald-700">{glasses.available}</div>
              <div className="text-[10px] text-emerald-800 font-semibold uppercase">Available</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
              <div className="text-base font-bold font-mono text-amber-700">{glasses.issued}</div>
              <div className="text-[10px] text-amber-800 font-semibold uppercase">In Serving</div>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
              <div className="text-base font-bold font-mono text-rose-700">{glasses.missing}</div>
              <div className="text-[10px] text-rose-800 font-semibold uppercase">Missing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Equipment Items */}
      {equipment.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
            Table & Dispenser Equipment Inventory:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {equipment.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <h5 className="font-bold text-stone-900">{item.name}</h5>
                  <p className="text-[11px] text-stone-500">{item.notes || `Status: ${item.status}`}</p>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <span className="text-emerald-700 font-bold">{item.availableQuantity}</span> /{' '}
                  <span className="text-stone-700">{item.totalQuantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
