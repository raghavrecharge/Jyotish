
import React from 'react';
import { CompatibilityData, BirthData } from '../types';
import { 
  HeartIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  UserGroupIcon, 
  ScaleIcon, 
  FireIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import CompatibilityForm from './CompatibilityForm';

interface Props {
  data: CompatibilityData | null;
  onReset: () => void;
  onCalculate: (partnerData: BirthData) => Promise<void>;
}

const CompatibilityView: React.FC<Props> = ({ data, onReset, onCalculate }) => {
  if (!data) {
    return <CompatibilityForm onCalculate={onCalculate} />;
  }

  const getScoreColor = (score: number) => {
    if (score >= 25) return 'text-emerald-500';
    if (score >= 18) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getProgressColor = (score: number) => {
    if (score >= 25) return '#10b981'; 
    if (score >= 18) return '#f59e0b'; 
    return '#f43f5e'; 
  };

  const displayScore = data.totalScore % 1 === 0 ? data.totalScore.toString() : data.totalScore.toFixed(1);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24 transition-colors">
      {/* 1. HERO COMPATIBILITY CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-[#f1ebe6] dark:border-slate-800 p-10 lg:p-14 shadow-sm relative overflow-hidden flex flex-col xl:flex-row items-center justify-between gap-12">
        <div className="relative z-10 flex-1 space-y-8">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-3 px-5 py-2 bg-rose-50 dark:bg-rose-950/30 rounded-full border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400">
               <HeartIcon className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Soul Resonance Matrix</span>
             </div>
             <h2 className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">
                {data.partner1} <span className="text-slate-300 dark:text-slate-700 mx-2">&</span> {data.partner2}
             </h2>
          </div>
          
          <p className="text-base lg:text-lg font-medium text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed italic">
            "Vedic compatibility measures the alignment of two souls. A score above 18/36 is considered foundational for a harmonious partnership."
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
             <div className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] border-2 flex items-center gap-3 shadow-sm ${
               data.totalScore >= 18 ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400'
             }`}>
               {data.totalScore >= 18 ? <CheckBadgeIcon className="w-5 h-5" /> : <ExclamationTriangleIcon className="w-5 h-5" />}
               {data.summary}
             </div>
             <button 
              onClick={onReset}
              className="px-8 py-4 bg-white dark:bg-slate-800 border border-[#f1ebe6] dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-900/50 transition-all flex items-center gap-3 active:scale-95 shadow-sm"
             >
               <ArrowPathIcon className="w-4 h-4" /> New Alignment
             </button>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-full transition-colors">
           <div className="relative w-64 h-64 flex items-center justify-center">
              <svg viewBox="0 0 220 220" className="w-full h-full transform -rotate-90">
                 <circle cx="110" cy="110" r="90" stroke="#f1ebe6" className="dark:stroke-slate-800" strokeWidth="20" fill="transparent" />
                 <circle 
                   cx="110" cy="110" r="90" 
                   stroke={getProgressColor(data.totalScore)} 
                   strokeWidth="20" 
                   fill="transparent" 
                   strokeDasharray={2 * Math.PI * 90} 
                   strokeDashoffset={2 * Math.PI * 90 - (data.totalScore / 36) * 2 * Math.PI * 90}
                   strokeLinecap="round"
                   className="transition-all duration-1000 ease-out"
                 />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                 <span className={`text-7xl font-black tracking-tighter leading-none ${getScoreColor(data.totalScore)}`}>
                    {displayScore}
                 </span>
                 <span className="text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.5em] mt-3 ml-2">
                    OUT OF 36
                 </span>
              </div>
           </div>
        </div>
      </div>

      {/* 2. DETAILED BREAKDOWN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        {/* Manglik Section */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-slate-900 dark:bg-black rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl transition-colors">
              <div className="relative z-10 space-y-8">
                <div className="space-y-1">
                   <h3 className="text-xl font-black text-rose-400 tracking-tight flex items-center gap-3">
                      <FireIcon className="w-6 h-6" /> Kuja (Manglik) Check
                   </h3>
                   <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">Energy Integrity Protocol</p>
                </div>

                <div className="space-y-6">
                   <div className="flex justify-between items-center p-5 bg-white/5 rounded-3xl border border-white/10 group">
                      <div>
                         <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{data.partner1}</p>
                         <p className={`text-lg font-black ${data.manglikStatus.partner1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {data.manglikStatus.partner1 ? 'High Intensity' : 'Neutral Presence'}
                         </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${data.manglikStatus.partner1 ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]' : 'bg-emerald-500'}`} />
                   </div>
                   <div className="flex justify-between items-center p-5 bg-white/5 rounded-3xl border border-white/10 group">
                      <div>
                         <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{data.partner2}</p>
                         <p className={`text-lg font-black ${data.manglikStatus.partner2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {data.manglikStatus.partner2 ? 'High Intensity' : 'Neutral Presence'}
                         </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${data.manglikStatus.partner2 ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]' : 'bg-emerald-500'}`} />
                   </div>
                </div>

                {data.manglikStatus.cancellation && (
                    <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl">
                       <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                          <ShieldCheckIcon className="w-4 h-4" /> Cancellation Found
                       </p>
                       <p className="text-sm font-bold text-slate-300 leading-relaxed italic">{data.manglikStatus.cancellation}</p>
                    </div>
                )}
              </div>
           </div>
        </div>

        {/* Koota Details */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-[#f1ebe6] dark:border-slate-800 p-10 lg:p-12 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                   <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-4">
                      <ScaleIcon className="w-8 h-8 text-orange-500" /> The 8-Point Guna Matrix
                   </h3>
                   <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">Multidimensional Sync Analysis</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {data.kootas.map((k, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-end mb-3">
                       <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter">{k.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">{k.description}</span>
                       </div>
                       <span className="text-sm font-black text-slate-800 dark:text-slate-300">{k.score} <span className="text-slate-300 dark:text-slate-700 font-medium">/ {k.max}</span></span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-1000 ease-out rounded-full ${k.score / k.max > 0.7 ? 'bg-emerald-500' : k.score / k.max > 0.4 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                         style={{ width: `${(k.score / k.max) * 100}%` }} 
                       />
                    </div>
                    <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-500 leading-relaxed group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors italic">"{k.interpretation}"</p>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityView;
