import React from 'react';
import { ChefHat, Users } from 'lucide-react';
import { TeamMember } from '../types';

interface TeamSectionProps {
  team: TeamMember[];
}

export const TeamSection: React.FC<TeamSectionProps> = ({ team }) => {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between pb-3 mb-6 border-b border-stone-200">
        <div>
          <h3 className="text-xl font-bold font-display text-stone-900 tracking-tight flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-amber-600" />
            Our Kitchen Team & Chefs
          </h3>
          <p className="text-xs text-stone-500">
            Dedicated culinary team preparing fresh, homestyle, hygienic meals five times a day for DHKC.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-mono tabular-nums">
          {team.length} Members
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {team.map((member) => (
          <div
            key={member.id}
            className="group bg-white rounded-3xl p-5 border border-stone-200/90 hover:border-amber-400/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Photo & Role Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-stone-200 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
                      <ChefHat className="w-7 h-7 text-amber-600/70" />
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-base font-bold font-display text-stone-900 group-hover:text-amber-700 transition-colors">
                    {member.name}
                  </h4>
                  <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 inline-block px-2 py-0.5 rounded-md mt-1">
                    {member.position}
                  </p>
                </div>
              </div>

              {/* Description */}
              {member.description && (
                <p className="text-xs text-stone-600 leading-relaxed">
                  {member.description}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
              <span>DHKC Culinary Department</span>
              <span className="text-emerald-700 font-medium">Verified Staff</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
