
import React, { useMemo } from 'react';
import { TransitContext, UserProfile, Planet, Sign, DivisionalChart } from '../types';
import { 
  MoonIcon, 
  ClockIcon, 
  SparklesIcon,
  FireIcon,
  BoltIcon,
  PlusIcon,
  ChevronRightIcon,
  BookmarkIcon,
  SunIcon,
  StarIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ShieldCheckIcon,
  UserIcon,
  CheckBadgeIcon,
  GlobeAltIcon,
  ChartBarIcon,
  MapPinIcon,
  PlusCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import MonthlyAstroCalendar from './MonthlyAstroCalendar';
import ZodiacIcon from './ZodiacIcon';
import { SIGN_NAMES } from '../constants';

interface Props {
  data: TransitContext | null;
  natalChart?: DivisionalChart;
  userName?: string;
  profiles?: UserProfile[];
  onSwitchProfile?: (id: string) => void;
  onAddProfile?: () => void;
}

const Align27Dashboard: React.FC<Props> = ({ data, natalChart, userName = "Seeker", profiles = [], onSwitchProfile, onAddProfile }) => {
  const score = 82;
  
  const timeOfDayGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning,";
    if (hour < 17) return "Good Afternoon,";
    return "Good Evening,";
  }, []);

  const lunarDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i);
    const tithiNum = (10 + i) % 30 || 30;
    return {
      date: d,
      tithi: tithiNum,
      phase: tithiNum <= 15 ? 'Waxing' : 'Waning',
      isToday: i === 3,
      label: tithiNum === 15 ? 'Purnima' : tithiNum === 30 ? 'Amavasya' : `Tithi ${tithiNum}`
    };
  });

  const MoonPhaseIcon = ({ tithi, active }: { tithi: number, active: boolean }) => {
    const isWaxing = tithi <= 15;
    const progress = isWaxing ? (tithi / 15) : (1 - (tithi - 15) / 15);
    return (
      <div className={`relative ${active ? 'w-8 h-8' : 'w-6 h-6'} shrink-0`}>
        <div className={`absolute inset-0 rounded-full ${active ? 'bg-indigo-950/10 dark:bg-white/10' : 'bg-slate-100 dark:bg-slate-800'} border border-slate-300/30`} />
        <div 
          className={`absolute inset-0 rounded-full ${active ? 'bg-orange-400 shadow-lg' : 'bg-indigo-700/80 dark:bg-indigo-500/80'}`}
          style={{ clipPath: isWaxing ? `inset(0 ${100 - (progress * 100)}% 0 0)` : `inset(0 0 0 ${100 - (progress * 100)}%)` }}
        />
      </div>
    );
  };

  const panchang = data?.panchang;
  const natalLagna = natalChart?.points.find(p => p.planet === Planet.Lagna);
  const natalMoon = natalChart?.points.find(p => p.planet === Planet.Moon);

  // Filter Gochar Transits from current ephemeris
  const currentGocharTransits = useMemo(() => {
    if (!data?.transits.points) return [];
    return data.transits.points
      .filter(p => [Planet.Sun, Planet.Moon, Planet.Jupiter, Planet.Saturn].includes(p.planet))
      .map(p => ({
        planet: p.planet,
        sign: p.sign,
        house: p.house,
        status: p.planet === Planet.Jupiter ? 'Benefic expansion' : p.planet === Planet.Saturn ? 'Karmic structure' : 'Temporal focus'
      }));
  }, [data]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[48px] border border-[#f1ebe6] dark:border-slate-800 p-10 lg:p-14 shadow-sm">
        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-8 text-center xl:text-left">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-[#fcf8f5] dark:bg-slate-800 rounded-full border border-orange-100 dark:border-orange-900/30">
               <SparklesIcon className="w-4 h-4 text-orange-500 animate-pulse" />
               <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.4em]">Temporal Flow: {score}% Optimal</span>
            </div>
            
            <div className="space-y-2">
               <h1 className="text-5xl lg:text-6xl font-black text-slate-800 dark:text-white tracking-tighter leading-tight">
                 {timeOfDayGreeting}<br/>
                 <span className="text-orange-500">{userName}</span>
               </h1>
               <p className="text-base lg:text-lg font-medium text-slate-500 dark:text-slate-400 max-w-xl mx-auto xl:mx-0 leading-relaxed italic">
                 The Moon is currently transiting through {panchang?.nakshatra} Nakshatra, influencing your mental matrix with {panchang?.yoga} energies.
               </p>
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center p-4 shrink-0">
             <div className="w-64 h-64 relative flex items-center justify-center">
                <svg viewBox="0 0 220 220" className="w-full h-full transform -rotate-90">
                   <circle cx="110" cy="110" r="90" stroke="#f1ebe6" className="dark:stroke-slate-800" strokeWidth="16" fill="transparent" strokeDasharray="4 8" />
                   <circle 
                     cx="110" cy="110" r="90" 
                     stroke="#f97316" strokeWidth="16" fill="transparent" 
                     strokeDasharray={2 * Math.PI * 90} 
                     strokeDashoffset={2 * Math.PI * 90 - (score / 100) * 2 * Math.PI * 90}
                     strokeLinecap="round"
                     className="transition-all duration-1000 ease-out" 
                   />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                   <span className="text-7xl font-black text-[#1e293b] dark:text-white tracking-tighter leading-none">{score}</span>
                   <span className="text-[10px] font-black text-[#94a3b8] dark:text-slate-500 uppercase tracking-[0.6em] mt-4 ml-2">Flow</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 2. RECENT PROFILES FEED */}
      <div className="space-y-6 px-4">
         <div className="flex items-center justify-between">
            <div className="space-y-1">
               <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                  <UserGroupIcon className="w-5 h-5 text-indigo-500" /> Linked Identities
               </h3>
               <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">Rapid Matrix Context Switch</p>
            </div>
         </div>

         <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
            {profiles.map((p) => {
              const isActive = p.birthData.name === userName;
              return (
                <button
                  key={p.id}
                  onClick={() => !isActive && onSwitchProfile?.(p.id)}
                  className={`flex flex-col items-center gap-3 group shrink-0 transition-all ${isActive ? 'cursor-default' : 'hover:scale-105 active:scale-95'}`}
                >
                   <div className={`w-20 h-20 rounded-[32px] border-2 flex items-center justify-center transition-all relative overflow-hidden ${
                     isActive 
                       ? 'bg-orange-500 border-orange-400 shadow-xl shadow-orange-500/20' 
                       : 'bg-white dark:bg-slate-900 border-[#f1ebe6] dark:border-slate-800 group-hover:border-indigo-400 dark:group-hover:border-indigo-600'
                   }`}>
                      <span className={`text-xl font-black ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500'}`}>
                         {p.birthData.name.substring(0, 2).toUpperCase()}
                      </span>
                      {isActive && (
                        <div className="absolute top-1 right-1">
                           <div className="w-2 h-2 rounded-full bg-white shadow-sm animate-pulse" />
                        </div>
                      )}
                      {!isActive && (
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                   </div>
                   <div className="text-center space-y-0.5">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-600'}`}>
                        {p.birthData.name.split(' ')[0]}
                      </p>
                      {isActive && <p className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter">Synchronized</p>}
                   </div>
                </button>
              );
            })}

            <button 
              onClick={onAddProfile}
              className="flex flex-col items-center gap-3 group shrink-0 transition-all hover:scale-105 active:scale-95"
            >
               <div className="w-20 h-20 rounded-[32px] border-2 border-dashed border-[#f1ebe6] dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 group-hover:border-indigo-400 group-hover:text-indigo-500 transition-all bg-transparent">
                  <PlusIcon className="w-10 h-10" />
               </div>
               <div className="text-center">
                  <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Add Node</p>
               </div>
            </button>
         </div>
      </div>

      {/* 3. RECENT NATAL & GOCHAR SNAPSHOTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 px-4">
         {/* Natal Snapshot Section */}
         <div className="bg-white dark:bg-slate-900 rounded-[56px] border border-[#f1ebe6] dark:border-slate-800 p-10 lg:p-14 shadow-sm relative overflow-hidden flex flex-col group transition-all">
            <div className="relative z-10 space-y-10">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[11px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.4em] mb-2">Natal Matrix Snapshot</h3>
                    <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">Your Root Coordinates</h2>
                  </div>
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner group-hover:rotate-12 transition-transform">
                     <ChartBarIcon className="w-7 h-7" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[36px] border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all flex items-center gap-5">
                     <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center">
                        <ZodiacIcon sign={natalLagna?.sign || Sign.Aries} className="w-7 h-7 text-indigo-500" />
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-600">Ascendant</p>
                        <p className="text-lg font-black text-slate-800 dark:text-slate-200">{SIGN_NAMES[natalLagna?.sign || Sign.Aries]}</p>
                     </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[36px] border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all flex items-center gap-5">
                     <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center text-indigo-500">
                        <MoonIcon className="w-7 h-7" />
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-600">Moon Rasi</p>
                        <p className="text-lg font-black text-slate-800 dark:text-slate-200">{SIGN_NAMES[natalMoon?.sign || Sign.Aries]}</p>
                     </div>
                  </div>
               </div>

               <div className="bg-[#fcf8f5] dark:bg-slate-800/40 p-6 rounded-[36px] border border-orange-100 dark:border-orange-900/30">
                  <div className="flex items-center gap-3 mb-2">
                     <SparklesIcon className="w-4 h-4 text-orange-500" />
                     <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Active Influence</p>
                  </div>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 italic">"The ruler of your Lagna is currently moving through your 10th house, highlighting career expansion and professional reputation."</p>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
         </div>

         {/* Gochar Matrix Section - NOW LIGHT THEME */}
         <div className="bg-white dark:bg-slate-900 rounded-[56px] border border-[#f1ebe6] dark:border-slate-800 p-10 lg:p-14 shadow-sm relative overflow-hidden flex flex-col group transition-all">
            <div className="relative z-10 space-y-10">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[11px] font-black text-orange-500 dark:text-orange-400 uppercase tracking-[0.4em] mb-2">Real-Time Transit Mapping</h3>
                    <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">Gochar Matrix</h2>
                  </div>
                  <div className="w-14 h-14 bg-orange-50 dark:bg-orange-950/30 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-100 dark:border-orange-900/40 group-hover:scale-110 transition-transform">
                     <GlobeAltIcon className="w-7 h-7" />
                  </div>
               </div>

               <div className="space-y-4">
                  {currentGocharTransits.map((gt, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-transparent hover:border-orange-100 dark:hover:border-orange-900/50 rounded-3xl group/row transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 font-black text-xs">
                              {gt.planet.substring(0, 2).toUpperCase()}
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-800 dark:text-slate-200">{gt.planet}</p>
                              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase">{gt.status}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="flex items-center gap-2 mb-0.5">
                              <ZodiacIcon sign={gt.sign} className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                              <p className="text-sm font-black text-slate-800 dark:text-slate-200">{SIGN_NAMES[gt.sign]}</p>
                           </div>
                           <p className="text-[9px] font-black text-orange-500 dark:text-orange-400 uppercase">Transit H{gt.house}</p>
                        </div>
                     </div>
                  ))}
               </div>

               <button className="w-full py-4 bg-orange-500 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                  Full Gochar Analysis <ChevronRightIcon className="w-4 h-4" />
               </button>
            </div>
            <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
         </div>
      </div>

      {/* 4. PANCHANG PULSE */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 px-4">
        {/* Left Card: Tithi Guide */}
        <div className="bg-white dark:bg-slate-900 rounded-[56px] border border-[#f1ebe6] dark:border-slate-800 p-10 lg:p-14 shadow-sm relative overflow-hidden flex flex-col justify-between group">
           <div className="relative z-10">
              <span className="inline-flex px-3 py-1 bg-orange-50 dark:bg-orange-950/20 text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest border border-orange-100 dark:border-orange-900/30 rounded-md mb-6">
                 Nithya Tithi Guide
              </span>
              <div className="flex justify-between items-start mb-8">
                 <div className="space-y-1">
                    <h2 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">{panchang?.tithi.split(' ')[1] || 'Trayodashi'}</h2>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase flex items-center gap-1.5">
                          <CheckBadgeIcon className="w-4 h-4" /> Jaya (Victory)
                       </span>
                       <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">• Ruling Day 13</span>
                    </div>
                 </div>
                 <div className="w-20 h-20 bg-[#fcf8f5] dark:bg-slate-800 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner group-hover:scale-105 transition-transform">
                    <MoonIcon className="w-10 h-10" />
                 </div>
              </div>

              <div className="bg-orange-50/40 dark:bg-orange-900/10 p-8 rounded-[40px] border border-orange-100/50 dark:border-orange-900/20 mb-10 relative group/quote">
                 <p className="text-base font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic pr-6">
                    "This lunar day resonates with the energy of fulfillment, social charisma, and luxury. It is excellent for strengthening relationships and initiating creative ventures."
                 </p>
                 <SparklesIcon className="absolute top-6 right-6 w-5 h-5 text-orange-300 dark:text-orange-700 animate-pulse" />
              </div>

              <div className="grid grid-cols-2 gap-10">
                 <div className="space-y-5">
                    <p className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <HandThumbUpIcon className="w-4 h-4" /> Peak Resonances
                    </p>
                    <ul className="space-y-3">
                       {['Social gatherings', 'New investments', 'Healing rituals', 'Creative launches'].map((item, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-600" />
                             <span className="text-sm font-black text-slate-700 dark:text-slate-300">{item}</span>
                          </li>
                       ))}
                    </ul>
                 </div>
                 <div className="space-y-5">
                    <p className="text-[10px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <HandThumbDownIcon className="w-4 h-4" /> Static Interferences
                    </p>
                    <ul className="space-y-3">
                       {['Argumentative speech', 'Isolation', 'Lending large sums'].map((item, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-600" />
                             <span className="text-sm font-black text-slate-700 dark:text-slate-300">{item}</span>
                          </li>
                       ))}
                    </ul>
                 </div>
              </div>
           </div>

           <div className="mt-14 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/20 rounded-xl flex items-center justify-center text-orange-500">
                       <AcademicCapIcon className="w-8 h-8" />
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase leading-none mb-1">Presiding Presence</p>
                       <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">Kamadeva (Deity of Desire)</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl flex items-center justify-center text-indigo-500">
                       <StarIcon className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase leading-none mb-1">Vara Lord Sync</p>
                       <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{panchang?.dayLord || 'Mars'}</p>
                    </div>
                 </div>
              </div>
              <button className="flex items-center gap-2 text-[9px] font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest hover:translate-x-1 transition-transform">
                 Analysis Protocol <ChevronRightIcon className="w-4 h-4" />
              </button>
           </div>
        </div>

        {/* Right Card: Panchang Matrix */}
        <div className="bg-[#eef2ff] dark:bg-indigo-950/20 rounded-[56px] p-10 lg:p-14 flex flex-col group border border-transparent dark:border-slate-800 transition-colors">
           <div className="flex justify-between items-start mb-12">
              <div className="space-y-1">
                 <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">Panchang</h2>
                 <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em]">The Five Limbs of Time</p>
              </div>
              <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-[24px] shadow-lg flex items-center justify-center text-orange-500 border border-transparent dark:border-slate-700">
                 <ClockIcon className="w-7 h-7" />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 mb-14">
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 backdrop-blur-sm border border-emerald-100 dark:border-emerald-900/30 rounded-[32px] p-6 lg:p-8 space-y-4">
                 <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Abhijit Muhurta</p>
                 <div className="space-y-1">
                    <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">11:58 – 12:54</p>
                    <p className="text-[8px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.2em]">Peak Productivity</p>
                 </div>
              </div>
              <div className="bg-rose-50/50 dark:bg-rose-950/10 backdrop-blur-sm border border-rose-100 dark:border-rose-900/30 rounded-[32px] p-6 lg:p-8 space-y-4">
                 <p className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Rahu Kaal</p>
                 <div className="space-y-1">
                    <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">03:59 – 05:41</p>
                    <p className="text-[8px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-[0.2em]">Shadow Activity</p>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              {[
                { label: 'Tithi', val: panchang?.tithi || 'Trayodashi', meta: 'Shukla Paksha', icon: MoonIcon },
                { label: 'Nakshatra', val: panchang?.nakshatra || 'Mula', meta: 'Ketu Ruling', icon: SparklesIcon },
                { label: 'Yoga', val: panchang?.yoga || 'Siddhi', meta: 'Achievement Focus', icon: BoltIcon },
                { label: 'Vara', val: panchang?.vara || 'Tuesday', meta: 'Mars Day (Mangala)', icon: FireIcon },
              ].map((limb, idx) => (
                 <div key={idx} className="flex items-center justify-between group/row">
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-transparent dark:border-slate-700 group-hover/row:scale-110 transition-transform">
                          <limb.icon className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-indigo-400 dark:text-indigo-500 uppercase tracking-widest mb-0.5">{limb.label}</p>
                          <p className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">{limb.val}</p>
                       </div>
                    </div>
                    <p className="text-[8px] font-black text-indigo-400 dark:text-indigo-600 uppercase tracking-widest opacity-60 group-hover/row:opacity-100 transition-opacity">
                       {limb.meta}
                    </p>
                 </div>
              ))}
           </div>
        </div>
      </div>

      <div className="space-y-6 px-4">
         <div className="flex items-center justify-between">
            <div className="space-y-1">
               <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                  <MoonIcon className="w-6 h-6 text-indigo-500" /> Chandra progression
               </h2>
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">Lunar Transit Mapping</p>
            </div>
         </div>

         <div className="relative group">
            <div className="flex gap-4 overflow-x-auto pt-8 pb-4 px-2 no-scrollbar snap-x items-start">
               {lunarDays.map((day, i) => (
                  <div 
                  key={i} 
                  className={`snap-center flex flex-col items-center min-w-[84px] p-4 rounded-[32px] border transition-all duration-500
                     ${day.isToday 
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 shadow-xl scale-105' 
                        : 'bg-white dark:bg-slate-900 border-[#f1ebe6] dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/50'}`}
                  >
                     <p className={`text-[9px] font-black uppercase mb-4 tracking-[0.2em] ${day.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}>
                     {day.date.toLocaleDateString('en-GB', { weekday: 'short' })}
                     </p>
                     <MoonPhaseIcon tithi={day.tithi} active={day.isToday} />
                     <p className={`text-sm font-black mt-3 ${day.isToday ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-800 dark:text-slate-300'}`}>
                     {day.tithi}
                     </p>
                     <p className={`text-[8px] font-bold uppercase tracking-widest ${day.isToday ? 'text-orange-500' : 'text-slate-300 dark:text-slate-600'}`}>
                     {day.label.split(' ')[0]}
                     </p>
                  </div>
               ))}
            </div>

            <div className="mt-4 px-2">
               <div className="h-4 w-full bg-[#e5d5cc] dark:bg-slate-800 rounded-full relative overflow-hidden shadow-inner border border-white/40 dark:border-slate-700">
                  <div 
                    className="absolute inset-y-0 left-0 bg-orange-500/40 rounded-full transition-all duration-1000"
                    style={{ width: `${(4 / 14) * 100}%` }} 
                  />
                  <div 
                    className="absolute inset-y-0 left-0 bg-white dark:bg-slate-400 shadow-sm rounded-full transition-all duration-1000 border border-orange-200 dark:border-orange-900/50"
                    style={{ left: `${(3 / 14) * 100}%`, width: `${(1 / 14) * 100}%` }}
                  />
               </div>
            </div>
         </div>
      </div>

      <MonthlyAstroCalendar />
    </div>
  );
};

export default Align27Dashboard;
