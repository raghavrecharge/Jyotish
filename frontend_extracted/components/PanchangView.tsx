
import React, { useState } from 'react';
import { PanchangData, Planet } from '../types';
import { 
  SunIcon, 
  MoonIcon, 
  ClockIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  ExclamationCircleIcon,
  FingerPrintIcon,
  AcademicCapIcon,
  LifebuoyIcon,
  BoltIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  FireIcon,
  StarIcon,
  MapPinIcon,
  ArrowsRightLeftIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';
import LocationAutocomplete from './LocationAutocomplete';

interface Props {
  data: PanchangData;
  currentCity?: string;
  onCityChange?: (data: { lat: number, lng: number, tz: string, fullAddress: string }) => void;
}

const PanchangView: React.FC<Props> = ({ data, currentCity = "Current Node", onCityChange }) => {
  const [showCityPicker, setShowCityPicker] = useState(false);

  const limbDetails = [
    { 
      label: 'Tithi', 
      val: data.tithi, 
      sub: data.moonPhase, 
      icon: MoonIcon, 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-50 dark:bg-indigo-900/20', 
      lord: Planet.Venus,
      nature: 'Jaya (Victory)',
      desc: 'Governs the emotional and mental state of the day.' 
    },
    { 
      label: 'Vara', 
      val: data.vara, 
      sub: 'Solar Day', 
      icon: SunIcon, 
      color: 'text-orange-500', 
      bg: 'bg-orange-50 dark:bg-orange-950/20', 
      lord: data.dayLord,
      nature: 'Stable',
      desc: 'The physical energy and life force ruler of today.' 
    },
    { 
      label: 'Nakshatra', 
      val: data.nakshatra, 
      sub: 'Moon Mansion', 
      icon: SparklesIcon, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50 dark:bg-amber-900/20', 
      lord: Planet.Saturn,
      nature: 'Dhruva (Fixed)',
      desc: 'The star cluster coloring the subconsious experience.' 
    },
    { 
      label: 'Yoga', 
      val: data.yoga, 
      sub: 'Union', 
      icon: LifebuoyIcon, 
      color: 'text-rose-500', 
      bg: 'bg-rose-50 dark:bg-rose-900/20', 
      lord: Planet.Jupiter,
      nature: 'Siddhi (Success)',
      desc: 'The subtle energetic alignment between Sun and Moon.' 
    },
    { 
      label: 'Karana', 
      val: data.karana, 
      sub: 'Half-Tithi', 
      icon: FingerPrintIcon, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
      lord: Planet.Mars,
      nature: 'Bava',
      desc: 'Governs productivity and the success of actions.' 
    },
  ];

  const choghadiya = [
    { name: 'Amrit', status: 'Best', time: '06:12 - 07:44', color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
    { name: 'Kaal', status: 'Bad', time: '07:44 - 09:16', color: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' },
    { name: 'Shubh', status: 'Good', time: '09:16 - 10:48', color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
    { name: 'Rog', status: 'Avoid', time: '10:48 - 12:20', color: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' },
    { name: 'Udveg', status: 'Caution', time: '12:20 - 13:52', color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
    { name: 'Chara', status: 'Neutral', time: '13:52 - 15:24', color: 'text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-500' },
    { name: 'Labh', status: 'Gain', time: '15:24 - 16:56', color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  ];

  const handleCitySelection = (locData: any) => {
    onCityChange?.(locData);
    setShowCityPicker(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 transition-colors">
      
      {/* 1. HERO ALMANAC HEADER + CITY SELECTOR */}
      <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-[#f1ebe6] dark:border-slate-800 shadow-sm relative flex flex-col xl:flex-row items-center justify-between gap-12 z-40 transition-colors">
        <div className="relative z-10 flex-1 space-y-6">
           <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="inline-flex px-4 py-1.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/30 rounded-full text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.3em]">
                 The Five Limbs of Time
              </span>
              
              {/* CITY CONTEXT SELECTOR */}
              <div className="relative group min-w-[200px]">
                 {!showCityPicker ? (
                   <button 
                    onClick={() => setShowCityPicker(true)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-slate-200 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-900/50 rounded-2xl transition-all group/btn shadow-sm active:scale-95"
                   >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <MapPinIcon className="w-4 h-4 text-orange-500 shrink-0" />
                        <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest truncate">{currentCity}</span>
                      </div>
                      <ChevronDownIcon className="w-4 h-4 text-slate-400 group-hover/btn:text-orange-500 transition-colors" />
                   </button>
                 ) : (
                   <div className="absolute top-0 left-0 w-[320px] z-[100] animate-in zoom-in-95 duration-200">
                      <div className="bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] rounded-3xl p-4 flex flex-col gap-4">
                         <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em]">Select Temporal Hub</span>
                            <button 
                              onClick={() => setShowCityPicker(false)}
                              className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-300 dark:text-slate-600 hover:text-rose-500 rounded-lg transition-colors"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                         </div>
                         <LocationAutocomplete 
                           onSelect={handleCitySelection}
                           placeholder="Search City..."
                           className="w-full"
                         />
                      </div>
                   </div>
                 )}
              </div>
           </div>
           
           <div className="space-y-3">
              <h2 className="text-5xl lg:text-7xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-[#8c7e74] dark:text-slate-500">
                 <div className="flex items-center gap-2"><GlobeAltIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Regional Sync Active</div>
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                 <div className="flex items-center gap-2"><ClockIcon className="w-4 h-4 text-orange-500 dark:text-orange-400" /> Solar Calibration: Precise</div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-[#fcf8f5] dark:bg-slate-950 p-8 rounded-[40px] border border-[#f1ebe6] dark:border-slate-800 shadow-inner relative group shrink-0 transition-colors">
           <div className="text-center group-hover:scale-105 transition-transform">
              <p className="text-[10px] font-black uppercase text-[#8c7e74] dark:text-slate-500 tracking-widest mb-3">Sunrise</p>
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center text-orange-500 shadow-md mx-auto mb-3 border border-transparent dark:border-slate-800">
                 <SunIcon className="w-9 h-9" />
              </div>
              <p className="text-lg font-black text-slate-800 dark:text-slate-200 leading-none">{data.sunrise}</p>
           </div>
           <div className="w-px h-20 bg-slate-200 dark:bg-slate-800" />
           <div className="text-center group-hover:scale-105 transition-transform">
              <p className="text-[10px] font-black uppercase text-[#8c7e74] dark:text-slate-500 tracking-widest mb-3">Sunset</p>
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center text-indigo-500 shadow-md mx-auto mb-3 border border-transparent dark:border-slate-800">
                 <MoonIcon className="w-9 h-9" />
              </div>
              <p className="text-lg font-black text-slate-800 dark:text-slate-200 leading-none">{data.sunset}</p>
           </div>
        </div>
        
        {/* Decorative background wrapped in a clip container to keep main header unclipped */}
        <div className="absolute inset-0 rounded-[48px] overflow-hidden pointer-events-none">
           <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        </div>
      </div>

      {/* 2. THE FIVE LIMBS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 px-4">
         {limbDetails.map((l, i) => (
           <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-[#f1ebe6] dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group overflow-hidden relative">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-10">
                   <div className={`w-14 h-14 rounded-2xl ${l.bg} ${l.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                      <l.icon className="w-7 h-7" />
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                      <p className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Limb {i+1}</p>
                   </div>
                </div>

                <div className="space-y-1 mb-8">
                   <h4 className="text-[10px] font-black text-[#8c7e74] dark:text-slate-500 uppercase tracking-widest">{l.label}</h4>
                   <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">{l.val}</h3>
                   <span className={`text-[10px] font-black uppercase ${l.color}`}>{l.nature}</span>
                </div>

                <div className="mt-auto space-y-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600">
                         <StarIcon className="w-4 h-4" />
                      </div>
                      <div>
                         <p className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase leading-none mb-1">Ruling Lord</p>
                         <p className="text-xs font-black text-slate-800 dark:text-slate-300">{l.lord}</p>
                      </div>
                   </div>
                   <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-relaxed italic line-clamp-2">
                     "{l.desc}"
                   </p>
                </div>
              </div>
              <div className={`absolute -bottom-10 -right-10 w-24 h-24 ${l.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
           </div>
         ))}
      </div>

      {/* 3. MUHURTA & CHOGHADIYA MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
         
         <div className="lg:col-span-8 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-[#f1ebe6] dark:border-slate-800 shadow-sm transition-colors">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-4">
                        <ShieldCheckIcon className="w-10 h-10 text-emerald-500" /> Muhurta Watch
                     </h3>
                     <p className="text-sm font-medium text-[#8c7e74] dark:text-slate-500">Propitious windows calculated for <span className="text-indigo-600 dark:text-indigo-400 font-bold">{currentCity}</span>.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: 'Abhijit Muhurta', timeStart: '11:58 AM', timeEnd: '12:44 PM', desc: 'The "unconquerable" window.', color: 'emerald', icon: BoltIcon },
                    { name: 'Amrit Kaal', timeStart: '02:15 PM', timeEnd: '03:32 PM', desc: 'Divine nectar window.', color: 'amber', icon: SparklesIcon },
                    { name: 'Brahma Muhurta', timeStart: '04:36 AM', timeEnd: '05:24 AM', desc: 'The pre-dawn hour of creators.', color: 'indigo', icon: AcademicCapIcon },
                    { name: 'Vijaya Muhurta', timeStart: '02:30 PM', timeEnd: '03:18 PM', desc: 'The window of victory.', color: 'emerald', icon: ShieldCheckIcon }
                  ].map((m, i) => (
                    <div key={i} className="group p-8 bg-[#fcf8f5] dark:bg-slate-950 rounded-[48px] border border-transparent dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl transition-all duration-500">
                       <div className="flex justify-between items-start mb-6">
                          <p className={`text-[10px] font-black uppercase tracking-[0.5em] ${m.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : m.color === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{m.name}</p>
                          <m.icon className={`w-8 h-8 ${m.color === 'emerald' ? 'text-emerald-500' : m.color === 'amber' ? 'text-amber-500' : 'text-indigo-500'} group-hover:scale-110 transition-transform`} />
                       </div>
                       <div className="space-y-1 mb-6">
                          <p className="text-4xl font-black text-slate-800 dark:text-slate-200 leading-tight">{m.timeStart} -</p>
                          <p className="text-4xl font-black text-slate-800 dark:text-slate-200 leading-tight">{m.timeEnd}</p>
                       </div>
                       <p className="text-xs font-bold text-slate-400 dark:text-slate-600 leading-relaxed italic">{m.desc}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-[#f1ebe6] dark:border-slate-800 shadow-sm transition-colors">
               <div className="mb-12 space-y-2">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                     <ExclamationCircleIcon className="w-8 h-8 text-rose-500" /> Caution Periods
                  </h3>
                  <p className="text-sm font-medium text-[#8c7e74] dark:text-slate-500">Time segments dominated by malefic energies.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: 'Rahu Kaal', timeStart: '03:59', timeEnd: '05:41 PM', icon: NoSymbolIcon },
                    { name: 'Yamaganda', timeStart: '09:20', timeEnd: '11:02 AM', icon: ExclamationCircleIcon },
                    { name: 'Gulika Kaal', timeStart: '12:44', timeEnd: '02:26 PM', icon: ArrowPathIcon }
                  ].map((c, i) => (
                    <div key={i} className="p-8 bg-rose-50/10 dark:bg-rose-950/20 border border-[#f1ebe6] dark:border-slate-800 rounded-[48px] text-left hover:border-rose-200 dark:hover:border-rose-900/50 hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-all group">
                       <div className="flex justify-between items-start mb-6">
                          <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.5em]">{c.name}</p>
                          <c.icon className="w-8 h-8 text-rose-500 group-hover:scale-110 transition-transform" />
                       </div>
                       <div className="space-y-1 mb-6">
                          <p className="text-3xl font-black text-slate-800 dark:text-slate-200 leading-tight">{c.timeStart} -</p>
                          <p className="text-3xl font-black text-slate-800 dark:text-slate-200 leading-tight">{c.timeEnd}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[56px] p-10 border border-[#f1ebe6] dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col h-full transition-colors">
               <div className="flex items-center justify-between mb-12">
                  <div className="space-y-1">
                     <h3 className="text-xl font-black text-slate-800 dark:text-white">Day Choghadiya</h3>
                     <p className="text-[10px] font-black text-[#8c7e74] dark:text-slate-500 uppercase tracking-widest">Temporal Qualities</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-sm">
                     <InformationCircleIcon className="w-6 h-6" />
                  </div>
               </div>
               
               <div className="space-y-2 relative z-10">
                  {choghadiya.map((ch, i) => (
                    <div key={i} className="flex justify-between items-center group cursor-default p-5 rounded-[32px] hover:bg-slate-50 dark:hover:bg-slate-950/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all">
                       <div className="flex items-center gap-5">
                          <div className={`w-3.5 h-3.5 rounded-full ${ch.dot} shadow-sm ring-4 ring-white dark:ring-slate-800 group-hover:scale-150 transition-transform`} />
                          <div>
                             <p className="text-lg font-black text-slate-800 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{ch.name}</p>
                             <p className={`text-[10px] font-black uppercase tracking-widest ${ch.color}`}>{ch.status}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-mono font-bold text-slate-400 dark:text-slate-600">{ch.time}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="mt-auto pt-10">
                  <div className="p-8 bg-indigo-950 dark:bg-indigo-900/40 rounded-[40px] text-white relative overflow-hidden group">
                     <div className="relative z-10 space-y-4">
                        <p className="text-[10px] font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-[0.3em]">Sage Advice</p>
                        <p className="text-sm font-bold leading-relaxed italic opacity-90">
                          "With {data.nakshatra} active in {currentCity}, the Vara Lord being {data.dayLord}, focus on activities that require high focus and strategic patience."
                        </p>
                     </div>
                     <SparklesIcon className="absolute -bottom-6 -right-6 w-24 h-24 text-white/5 group-hover:rotate-12 transition-transform" />
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default PanchangView;
