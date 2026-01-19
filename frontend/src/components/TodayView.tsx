
import React, { useMemo } from 'react';
import { TransitContext, Planet, Sign } from '../types';
import { SIGN_NAMES } from '../constants';
import { 
  SunIcon, 
  MoonIcon, 
  BoltIcon, 
  GlobeAltIcon, 
  ClockIcon, 
  SparklesIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ArrowPathRoundedSquareIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import ZodiacIcon from './ZodiacIcon';

interface Props {
  data: TransitContext;
}

const TodayView: React.FC<Props> = ({ data }) => {
  const { panchang, transits, horaLord, isAuspicious } = data;

  const getPlanetIcon = (planet: Planet) => {
    switch(planet) {
      case Planet.Sun: return <SunIcon className="w-5 h-5 text-orange-500" />;
      case Planet.Moon: return <MoonIcon className="w-5 h-5 text-indigo-400" />;
      case Planet.Mars: return <BoltIcon className="w-5 h-5 text-rose-500" />;
      case Planet.Jupiter: return <SparklesIcon className="w-5 h-5 text-amber-500" />;
      case Planet.Saturn: return <ArrowPathRoundedSquareIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
      case Planet.Venus: return <SparklesIcon className="w-5 h-5 text-pink-400" />;
      case Planet.Mercury: return <GlobeAltIcon className="w-5 h-5 text-emerald-500" />;
      default: return <SparklesIcon className="w-5 h-5 text-amber-500" />;
    }
  };

  const getTransitInsight = (planet: Planet, house: number) => {
    const insights: Record<string, Record<number, string>> = {
      [Planet.Sun]: {
        1: "Personal vitality peaks; good for starting new projects.",
        10: "Career recognition incoming; professional efforts pay off.",
        7: "Focus on partnerships; avoid ego clashes with others."
      },
      [Planet.Moon]: {
        4: "Emotional focus on home and family comfort.",
        8: "Deep intuitive insights; stay away from financial risks.",
        12: "Need for solitude and rest; spiritual detachment."
      },
      [Planet.Saturn]: {
        8: "A time of transformation and discipline in research.",
        1: "Maturity phase; heavy responsibilities on the self.",
        10: "Diligent work leads to long-term professional stability."
      }
    };
    return insights[planet]?.[house] || "Dynamic cosmic energy moving through your matrix.";
  };

  const sortedTransits = useMemo(() => {
    return [...transits.points]
      .filter(p => p.planet !== Planet.Lagna)
      .sort((a, b) => {
        const order = [Planet.Sun, Planet.Moon, Planet.Mars, Planet.Mercury, Planet.Jupiter, Planet.Venus, Planet.Saturn, Planet.Rahu, Planet.Ketu];
        return order.indexOf(a.planet) - order.indexOf(b.planet);
      });
  }, [transits]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24 px-1 lg:px-4">
      
      {/* 1. HERO GOCHAR HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-[#f1ebe6] dark:border-slate-800 rounded-[48px] p-8 lg:p-12 relative overflow-hidden shadow-sm transition-colors">
        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-10">
          <div className="flex-1 space-y-5 text-center xl:text-left">
            <div className="inline-flex items-center gap-3">
              <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.4em] border shadow-sm ${isAuspicious ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/50'}`}>
                {isAuspicious ? 'Protocol: Favorable' : 'Protocol: Moderate'}
              </span>
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] bg-slate-50 dark:bg-slate-950 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
                <ClockIcon className="w-3.5 h-3.5" /> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-800 dark:text-white leading-tight">
                Live <span className="text-orange-500">Gochar</span> Matrix
              </h2>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">Planetary transits relative to your Natal Lagna</p>
            </div>
          </div>

          <div className="flex items-center gap-8 bg-[#fcf8f5] dark:bg-slate-950 p-6 rounded-[32px] border border-[#f1ebe6] dark:border-slate-800 shadow-inner transition-colors">
             <div className="text-center space-y-2">
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600">Vara Lord</p>
                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-orange-500 shadow-sm mx-auto border border-transparent dark:border-slate-800">
                   <SunIcon className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{panchang.dayLord}</p>
             </div>
             <div className="w-px h-12 bg-slate-200 dark:bg-slate-800" />
             <div className="text-center space-y-2">
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600">Active Hora</p>
                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm mx-auto border border-transparent dark:border-slate-800">
                   <ClockIcon className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{horaLord}</p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* 2. TRANSIT FEED CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTransits.map((p, i) => {
          const progress = (p.degree / 30) * 100;
          return (
            <div key={i} className="group bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-[#f1ebe6] dark:border-slate-800 hover:border-orange-100 dark:hover:border-orange-900/50 hover:shadow-2xl transition-all duration-500 flex flex-col gap-6 relative overflow-hidden h-full">
              
              {/* Card Header */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#fcf8f5] dark:bg-slate-950 flex items-center justify-center shadow-inner border border-transparent dark:border-slate-800 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    {getPlanetIcon(p.planet)}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{p.planet}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                       <div className="bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-2">
                          <ZodiacIcon sign={p.sign} className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em]">{SIGN_NAMES[p.sign]}</span>
                       </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <div className="bg-orange-500 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-orange-500/20">
                      <p className="text-[8px] font-black uppercase opacity-80 leading-none mb-1">House</p>
                      <p className="text-xl font-black leading-none">H{p.house}</p>
                   </div>
                </div>
              </div>

              {/* Insight Block */}
              <div className="bg-[#fcf8f5] dark:bg-slate-950 p-5 rounded-3xl border border-orange-100/30 dark:border-orange-900/20 relative z-10 flex-1">
                <div className="flex items-center gap-2 mb-3">
                   <InformationCircleIcon className="w-4 h-4 text-orange-400" />
                   <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Gochar Insight</span>
                </div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  "{getTransitInsight(p.planet, p.house)}"
                </p>
              </div>

              {/* Progress Section */}
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
                   <div className="flex flex-col">
                      <span className="opacity-60 text-[8px] mb-0.5">Journey through</span>
                      <span className="text-slate-500 dark:text-slate-300">{SIGN_NAMES[p.sign]}</span>
                   </div>
                   <div className="text-right">
                      <span className="text-slate-800 dark:text-white text-xs">{progress.toFixed(0)}%</span>
                      <span className="opacity-60 text-[8px] block mt-0.5">Complete</span>
                   </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                   <div 
                     className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(249,115,22,0.3)]" 
                     style={{ width: `${progress}%` }}
                   />
                </div>
              </div>

              {/* Footer Stats */}
              <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 relative z-10">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    {p.nakshatra}
                 </div>
                 <div className="flex items-center gap-3">
                    <span className="bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800">Pada {p.pada}</span>
                    <ArrowTrendingUpIcon className="w-4 h-4 text-orange-400" />
                 </div>
              </div>

              {/* Subtle Background Pattern */}
              <div className="absolute -bottom-6 -right-6 opacity-[0.02] dark:opacity-[0.05] group-hover:opacity-[0.05] dark:group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
                 <ZodiacIcon sign={p.sign} className="w-40 h-40" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodayView;
