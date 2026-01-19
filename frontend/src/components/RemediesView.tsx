
import React, { useState } from 'react';
import { Remedy, Planet } from '../types';
import { 
  SparklesIcon, 
  SpeakerWaveIcon, 
  HandRaisedIcon, 
  LifebuoyIcon, 
  BeakerIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  FireIcon,
  BoltIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface Props {
  data: Remedy[];
}

const RemediesView: React.FC<Props> = ({ data }) => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Gemstone' | 'Mantra' | 'Charity'>('All');

  const filtered = activeCategory === 'All' ? data : data.filter(r => r.type === activeCategory);

  const getIcon = (type: string, className: string) => {
    switch (type) {
      case 'Gemstone': return <BeakerIcon className={className} />;
      case 'Mantra': return <SpeakerWaveIcon className={className} />;
      case 'Charity': return <HandRaisedIcon className={className} />;
      case 'Fasting': return <FireIcon className={className} />;
      default: return <SparklesIcon className={className} />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 transition-colors">
      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 lg:p-14 border border-[#f1ebe6] dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 transition-colors">
        <div className="relative z-10 flex-1 space-y-8">
           <div className="space-y-2">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-amber-50 dark:bg-amber-950/30 rounded-full border border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-400">
                 <FireIcon className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Karma Correction Protocols</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-[#2d2621] dark:text-white tracking-tight">Vedic Upaya Suite</h2>
           </div>
           
           <p className="text-[#8c7e74] dark:text-slate-400 font-medium max-w-2xl leading-relaxed text-lg italic">
             "Remedies are the lens that help focus celestial light, neutralizing malefic drag and amplifying resonance."
           </p>
           
           <div className="flex flex-wrap gap-3">
              {['All', 'Gemstone', 'Mantra', 'Charity'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as any)}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeCategory === cat 
                      ? 'bg-[#f97316] text-white shadow-xl shadow-orange-500/20' 
                      : 'bg-[#fcf8f5] dark:bg-slate-950 text-[#8c7e74] dark:text-slate-600 border border-transparent dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-900/50 hover:text-[#f97316]'
                  }`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>

        <div className="w-full lg:w-96">
           <div className="p-8 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-[40px] relative overflow-hidden group">
              <h3 className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2 tracking-widest">
                 <InformationCircleIcon className="w-5 h-5" /> Fundamental Principle
              </h3>
              <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200 leading-relaxed relative z-10">
                "Gemstones act as physical filters for cosmic radiation, while Mantras use sonic vibrations to re-code the subconscious neural matrix."
              </p>
           </div>
        </div>
      </div>

      {/* Remedies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {filtered.map((r, i) => (
          <div key={i} className="group bg-white dark:bg-slate-900 rounded-[40px] border-2 border-slate-50 dark:border-slate-800 hover:border-orange-100 dark:hover:border-orange-900/50 hover:shadow-2xl transition-all duration-500 flex flex-col relative overflow-hidden">
            <div className="p-10 flex-1 flex flex-col relative z-10">
               <div className="flex justify-between items-start mb-10">
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-xl shadow-current/10 group-hover:scale-110 transition-all duration-500`} style={{ backgroundColor: `${r.color}15`, color: r.color }}>
                     {getIcon(r.type, "w-8 h-8")}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black px-3 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg uppercase text-[#8c7e74] dark:text-slate-500 tracking-widest">{r.planet}</span>
                  </div>
               </div>

               <div className="space-y-2 mb-8">
                  <h3 className="text-2xl font-black text-[#2d2621] dark:text-white tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{r.title}</h3>
                  <p className="text-xs font-bold text-[#8c7e74] dark:text-slate-400 leading-relaxed italic">
                    "{r.description}"
                  </p>
               </div>

               <div className="space-y-4 mt-auto">
                  <div className="p-5 bg-[#fcf8f5] dark:bg-slate-950/50 rounded-3xl border border-dashed border-orange-200 dark:border-orange-900/30">
                     <p className="text-[9px] font-black text-[#f97316] dark:text-orange-400 uppercase mb-2 flex items-center gap-2">
                        <ShieldCheckIcon className="w-4 h-4" /> Biological Resonance
                     </p>
                     <p className="text-sm font-black text-[#2d2621] dark:text-slate-200">{r.benefit}</p>
                  </div>

                  {r.type === 'Mantra' && (
                    <div className="space-y-4">
                       <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-3xl relative overflow-hidden">
                          <p className="text-sm font-black text-indigo-950 dark:text-indigo-100 leading-relaxed font-mono italic">
                             "{r.mantraText}"
                          </p>
                       </div>
                    </div>
                  )}
               </div>

               <div className="mt-10 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: r.color }} />
                     <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Prescribed: {r.day}s</span>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RemediesView;
