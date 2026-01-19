
import React, { useState } from 'react';
import { AshtakavargaData } from '../services/astrologyService';
import { Planet } from '../types';
import { 
  TableCellsIcon, 
  InformationCircleIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ChevronRightIcon,
  CheckBadgeIcon,
  BoltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import AshtakavargaChart from './AshtakavargaChart';

interface Props {
  data: AshtakavargaData;
}

const AshtakavargaView: React.FC<Props> = ({ data }) => {
  const [viewType, setViewMode] = useState<'SAV' | 'BAV'>('SAV');
  const [selectedPlanet, setSelectedPlanet] = useState<Planet>(Planet.Sun);

  const activePoints = viewType === 'SAV' ? data.sav : data.bav[selectedPlanet] || Array(12).fill(0);
  const title = viewType === 'SAV' ? 'Sarvashtakavarga (SAV)' : `${selectedPlanet} Bhinna (BAV)`;

  const mainPlanets = [Planet.Sun, Planet.Moon, Planet.Mars, Planet.Mercury, Planet.Jupiter, Planet.Venus, Planet.Saturn];

  const getPointsStatus = (points: number, isSAV: boolean) => {
    if (isSAV) {
      if (points >= 30) return { label: 'Exceptional', color: 'text-emerald-500', border: 'border-emerald-200', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
      if (points >= 25) return { label: 'Strong', color: 'text-indigo-500', border: 'border-indigo-100', bg: 'bg-indigo-50/50 dark:bg-indigo-900/10' };
      if (points >= 20) return { label: 'Average', color: 'text-slate-500', border: 'border-slate-100', bg: 'bg-slate-50/50 dark:bg-slate-900/20' };
      return { label: 'Weak', color: 'text-rose-500', border: 'border-rose-200', bg: 'bg-rose-50 dark:bg-rose-900/20' };
    } else {
      if (points >= 7) return { label: 'Peak', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
      if (points >= 4) return { label: 'Active', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' };
      return { label: 'Residual', color: 'text-slate-400', bg: 'transparent' };
    }
  };

  const getPlanetCode = (p: Planet) => {
    switch(p) {
      case Planet.Sun: return 'SU';
      case Planet.Moon: return 'MO';
      case Planet.Mars: return 'MA';
      case Planet.Mercury: return 'ME';
      case Planet.Jupiter: return 'JU';
      case Planet.Venus: return 'VE';
      case Planet.Saturn: return 'SA';
      default: return p.substring(0, 2).toUpperCase();
    }
  };

  const focusHouse = data.summary.strongestHouse;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32 transition-colors overflow-x-hidden">
      {/* 1. CONTROL CENTER */}
      <div className="bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-[48px] border border-orange-100 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-10 transition-colors">
        <div className="flex items-center gap-8">
           <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-[28px] bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center border border-orange-100 dark:border-orange-900/50 shadow-inner">
              <TableCellsIcon className="w-10 h-10 text-orange-500" />
           </div>
           <div className="space-y-1">
              <h2 className="text-3xl lg:text-4xl font-black text-[#2d2621] dark:text-white tracking-tighter leading-none uppercase">Varga Matrix</h2>
              <div className="flex items-center gap-3">
                 <span className="flex items-center gap-1.5 text-[10px] font-black text-orange-400 dark:text-orange-500 uppercase tracking-widest">
                   Numerical Potency Sync
                 </span>
                 <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                 <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Bala Active</span>
              </div>
           </div>
        </div>

        <div className="flex bg-[#fcf8f5] dark:bg-slate-950 p-2 rounded-3xl border border-orange-100 dark:border-slate-800 transition-colors">
           <button 
             onClick={() => setViewMode('SAV')}
             className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all ${viewType === 'SAV' ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-[#8c7e74] dark:text-slate-500 hover:text-orange-500 hover:bg-white dark:hover:bg-slate-900'}`}
           >
             Collective
           </button>
           <button 
             onClick={() => setViewMode('BAV')}
             className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all ${viewType === 'BAV' ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-[#8c7e74] dark:text-slate-500 hover:text-orange-500 hover:bg-white dark:hover:bg-slate-900'}`}
           >
             Planetary
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start px-4">
        {/* Left Column: Metrics */}
        <div className="lg:col-span-4 space-y-8">
           {viewType === 'BAV' && (
             <div className="p-8 bg-white dark:bg-slate-900 border border-orange-50 dark:border-slate-800 rounded-[44px] shadow-sm transition-colors animate-in slide-in-from-left-4">
                <h3 className="text-[10px] font-black text-[#8c7e74] dark:text-slate-600 uppercase tracking-[0.4em] mb-8 px-2">Bhinna Focal Points</h3>
                <div className="grid grid-cols-1 gap-3">
                   {mainPlanets.map(p => (
                     <button
                       key={p}
                       onClick={() => setSelectedPlanet(p)}
                       className={`w-full p-5 rounded-[28px] border-2 transition-all flex items-center justify-between group ${selectedPlanet === p ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800 shadow-md ring-4 ring-orange-500/5' : 'bg-white dark:bg-slate-900 border-transparent hover:border-orange-100 dark:hover:border-orange-900/50'}`}
                     >
                       <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-[11px] shadow-sm transition-colors ${selectedPlanet === p ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 border border-transparent dark:border-slate-800'}`}>
                             {p.substring(0, 2).toUpperCase()}
                          </div>
                          <span className={`text-base font-black transition-colors ${selectedPlanet === p ? 'text-orange-900 dark:text-orange-300' : 'text-slate-700 dark:text-slate-400'}`}>{p}</span>
                       </div>
                       <ChevronRightIcon className={`w-4 h-4 transition-transform ${selectedPlanet === p ? 'text-orange-500 translate-x-1' : 'text-slate-200'}`} />
                     </button>
                   ))}
                </div>
             </div>
           )}

           <div className="p-10 bg-[#2d2621] dark:bg-black text-white relative overflow-hidden rounded-[48px] shadow-2xl border border-transparent dark:border-slate-800 transition-colors">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-400/80 mb-10 relative z-10">House Potential Scan</h3>
              <div className="space-y-10 relative z-10">
                 <div className="flex items-center gap-6 group cursor-default">
                    <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-colors shadow-inner">
                       <ShieldCheckIcon className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Peak Resonance</p>
                       <p className="text-3xl font-black text-white tracking-tighter">House {data.summary.strongestHouse}</p>
                       <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter mt-1">{data.sav[data.summary.strongestHouse-1]} Energy Bindus</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-6 group cursor-default">
                    <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-rose-500/50 transition-colors shadow-inner">
                       <ExclamationTriangleIcon className="w-8 h-8 text-rose-400" />
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Shadow Sector</p>
                       <p className="text-3xl font-black text-white tracking-tighter">House {data.summary.weakestHouse}</p>
                       <p className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter mt-1">{data.sav[data.summary.weakestHouse-1]} Energy Bindus</p>
                    </div>
                 </div>
              </div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
           </div>
        </div>

        {/* Right Column: Chart & Interpretation */}
        <div className="lg:col-span-8 space-y-10">
           <div className="bg-white dark:bg-slate-900 p-2 rounded-[56px] border border-orange-100 dark:border-slate-800 shadow-lg relative overflow-hidden transition-colors">
              <div className="bg-[#fdfcfb] dark:bg-slate-950/40 rounded-[48px] p-8 lg:p-14 flex flex-col items-center justify-center relative min-h-[580px] pt-24 pb-28">
                 <div className="absolute top-10 left-10 flex items-center gap-5">
                    <div className="w-1 h-12 bg-orange-500 rounded-full" />
                    <div>
                       <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em] block mb-1.5">Celestial Matrix Synthesis</span>
                       <h4 className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">{title}</h4>
                    </div>
                 </div>
                 
                 <div className="w-full max-w-[480px] animate-in zoom-in-95 duration-700">
                    <AshtakavargaChart 
                      sav={activePoints} 
                      title="" 
                    />
                 </div>

                 <div className="absolute bottom-10 right-10 hidden sm:flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-orange-50 dark:border-slate-800 shadow-sm">
                    <CheckBadgeIcon className="w-5 h-5 text-emerald-400" />
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Precision Values Verified</span>
                 </div>
              </div>
           </div>

           {/* Dynamic Interpretation Card */}
           <div className="p-8 lg:p-12 bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 rounded-[56px] shadow-sm relative overflow-hidden transition-colors flex items-center min-h-[280px]">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 lg:gap-14 w-full">
                 <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-[36px] bg-[#fcf8f5] dark:bg-slate-950 border border-orange-100 dark:border-slate-800 flex flex-col items-center justify-center shadow-inner group transition-all shrink-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Top Focus</span>
                    <span className="text-5xl lg:text-6xl font-black text-orange-600 dark:text-orange-400 tracking-tighter transition-transform">H{focusHouse}</span>
                 </div>
                 <div className="flex-1 space-y-6 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
                       <h3 className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none">Matrix Potency</h3>
                       <div className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-transparent shadow-sm flex items-center gap-2 ${getPointsStatus(activePoints[focusHouse - 1], viewType === 'SAV').bg} ${getPointsStatus(activePoints[focusHouse - 1], viewType === 'SAV').color}`}>
                          <SparklesIcon className="w-3.5 h-3.5" />
                          {getPointsStatus(activePoints[focusHouse - 1], viewType === 'SAV').label} Strength
                       </div>
                    </div>
                    <p className="text-lg lg:text-xl font-bold text-slate-700 dark:text-slate-400 leading-relaxed italic border-slate-100 dark:border-slate-800 md:border-l-4 md:pl-8">
                       "{data.summary.houseInterpretations[focusHouse - 1]}"
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-3 pt-2 text-[10px] font-black uppercase tracking-widest">
                       <InformationCircleIcon className="w-5 h-5 text-orange-500" />
                       <span className="text-slate-400">Signification:</span>
                       <span className="text-orange-600 dark:text-orange-400 font-black">{data.summary.houseSignifications[focusHouse - 1]}</span>
                    </div>
                 </div>
              </div>
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none hidden lg:block">
                 <SparklesIcon className="w-80 h-80 text-orange-500" />
              </div>
           </div>
        </div>
      </div>

      {/* 4. MASTER NUMERICAL PRASTARA MATRIX (FULL 12 HOUSES) */}
      <div className="bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 rounded-[56px] p-8 lg:p-12 shadow-sm transition-colors mx-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 px-4 gap-6">
          <div className="space-y-1 text-center sm:text-left">
             <h3 className="text-3xl font-black text-[#2d2621] dark:text-white tracking-tight leading-none">Numerical Prastara Matrix</h3>
             <p className="text-[10px] font-black text-[#8c7e74] dark:text-slate-500 uppercase tracking-[0.4em]">Integrated House Analysis (H1 — H12)</p>
          </div>
          <div className="flex items-center gap-3 bg-[#fcf8f5] dark:bg-slate-800 px-5 py-2.5 rounded-2xl border border-orange-100 dark:border-slate-700 shadow-inner">
             <InformationCircleIcon className="w-5 h-5 text-indigo-500" />
             <span className="text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">Full Spectrum Matrix</span>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar border border-orange-50 dark:border-slate-800 rounded-[32px]">
          <table className="w-full text-center border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-[#fdfbf9] dark:bg-slate-950/80 border-b border-orange-100 dark:border-slate-800">
                <th className="px-8 py-8 border-r border-orange-100 dark:border-slate-800 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest bg-[#fdfbf9] dark:bg-black sticky left-0 z-20 w-64 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">Graha (Planet)</th>
                {Array.from({ length: 12 }, (_, i) => (
                  <th key={i} className="px-6 py-8 border-r border-orange-50 dark:border-slate-800 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                    H{i + 1}
                  </th>
                ))}
                <th className="px-8 py-8 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-[#fdfbf9] dark:bg-black sticky right-0 z-20 shadow-[-2px_0_10px_rgba(0,0,0,0.02)]">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50 dark:divide-slate-800/50">
              {mainPlanets.map((planet, pIdx) => {
                const points = data.bav[planet] || Array(12).fill(0);
                const planetTotal = points.reduce((a, b) => a + b, 0);
                return (
                  <tr key={pIdx} className="hover:bg-orange-50/20 dark:hover:bg-orange-950/10 transition-colors group">
                    <td className="px-8 py-6 border-r border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky left-0 z-10 transition-colors shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 dark:text-slate-500 border border-transparent dark:border-slate-700 shadow-sm shrink-0 group-hover:border-orange-200 transition-colors">
                           {getPlanetCode(planet)}
                        </div>
                        <span className="text-base font-black text-slate-700 dark:text-slate-200">{planet}</span>
                      </div>
                    </td>
                    {points.map((p, hIdx) => {
                      const status = getPointsStatus(p, false);
                      return (
                        <td key={hIdx} className={`px-6 py-6 border-r border-orange-50 dark:border-slate-800 text-lg font-black ${status.color}`}>
                          {p}
                        </td>
                      );
                    })}
                    <td className="px-8 py-6 bg-white dark:bg-slate-900 sticky right-0 z-10 border-l border-orange-100 dark:border-slate-800 font-black text-lg text-indigo-600 dark:text-indigo-400 shadow-[-10px_0_15px_rgba(0,0,0,0.02)]">
                      {planetTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border-t-2 border-orange-200 dark:border-slate-700">
                <td className="px-8 py-10 border-r border-orange-100 dark:border-slate-700 font-black text-xs uppercase tracking-[0.2em] sticky left-0 bg-slate-50 dark:bg-[#1a2234] z-20 shadow-[2px_0_15px_rgba(0,0,0,0.05)]">
                   SAV Aggregate
                </td>
                {data.sav.map((total, i) => {
                  const status = getPointsStatus(total, true);
                  return (
                    <td key={i} className={`px-6 py-10 border-r border-orange-50 dark:border-slate-700 text-2xl font-black transition-colors ${status.color}`}>
                      {total}
                    </td>
                  );
                })}
                <td className="px-8 py-10 sticky right-0 bg-slate-50 dark:bg-[#1a2234] z-20 font-black text-3xl text-indigo-600 dark:text-indigo-400 tracking-tighter border-l border-orange-100 dark:border-slate-700 shadow-[-10px_0_20px_rgba(0,0,0,0.05)]">
                   {data.totalPoints}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-10 pt-8 border-t border-orange-50 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
           <div className="flex flex-wrap items-center justify-center gap-10">
              <div className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prosperity Peak</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Karmic Attention Required</span>
              </div>
           </div>
           <p className="text-[10px] font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest flex items-center gap-2">
              <InformationCircleIcon className="w-5 h-5" /> Comprehensive Numerical Matrix Synthesis Complete
           </p>
        </div>
      </div>
    </div>
  );
};

export default AshtakavargaView;
