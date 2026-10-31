import React from 'react';
import { UserCheck, ShieldCheck, Mail, Phone, Info } from 'lucide-react';
import { DiningHallInfo } from '../types';

interface InchargeSectionProps {
  info: DiningHallInfo;
}

export const InchargeSection: React.FC<InchargeSectionProps> = ({ info }) => {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
        <div>
          <h3 className="text-lg font-bold font-display text-stone-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            Dining Hall Administration
          </h3>
          <p className="text-xs text-stone-500">
            Official incharge officers ensuring culinary hygiene, food safety, and student feedback.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DINING HALL INCHARGE CARD */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 overflow-hidden">
                {info.incharge.photo ? (
                  <img
                    src={info.incharge.photo}
                    alt={info.incharge.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                  DINING HALL INCHARGE
                </span>
                <h4 className="text-base font-bold font-display text-stone-900 mt-0.5">
                  {info.incharge.name}
                </h4>
                <p className="text-xs text-stone-500 font-medium">{info.incharge.position}</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed mb-3">
              {info.incharge.description || 'Oversees quality standards, nutrition, and dining administration.'}
            </p>
          </div>

          {info.incharge.contact && (
            <div className="pt-3 border-t border-stone-100 text-xs text-stone-500 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="truncate">{info.incharge.contact}</span>
            </div>
          )}
        </div>

        {/* DINING HALL ASSISTANT CARD */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center shrink-0 overflow-hidden">
                {info.assistant.photo ? (
                  <img
                    src={info.assistant.photo}
                    alt={info.assistant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCheck className="w-6 h-6" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                  DINING HALL ASSISTANT
                </span>
                <h4 className="text-base font-bold font-display text-stone-900 mt-0.5">
                  {info.assistant.name}
                </h4>
                <p className="text-xs text-stone-500 font-medium">{info.assistant.position}</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed mb-3">
              {info.assistant.description || 'Manages day-to-day pantry supply, serving schedules, and kitchen team operations.'}
            </p>
          </div>

          {info.assistant.contact && (
            <div className="pt-3 border-t border-stone-100 text-xs text-stone-500 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="truncate">{info.assistant.contact}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
