
import React, { useState, useMemo } from 'react';
import { 
  ChartBarIcon, 
  ArrowPathIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  CloudArrowDownIcon,
  SparklesIcon,
  ShieldCheckIcon,
  XMarkIcon,
  AcademicCapIcon,
  SpeakerWaveIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';
import { DivisionalChart, Planet, Sign, BirthData, ChartPoint } from '../types';
import { SIGN_NAMES } from '../constants';
import { astrologyService } from '../services/astrologyService';
import VedicChart from './VedicChart';
import PlanetDetailsTable from './PlanetDetailsTable';
import ZodiacIcon from './ZodiacIcon';

interface Props {
  natalChart: DivisionalChart;
  birthData: BirthData;
}

const VARGA_LIST = [
  { value: 1, label: 'D1 Lagna - Physical Blueprint' },
  { value: 9, label: 'D9 Navamsha - Soul & Destiny' },
  { value: 10, label: 'D10 Dashamsha - Career Path' },
  { value: 2, label: 'D2 Hora - Wealth Potential' },
  { value: 3, label: 'D3 Drekkana - Siblings & Courage' },
  { value: 7, label: 'D7 Saptamsha - Progeny & Children' },
  { value: 60, label: 'D60 Shashtiamsha - Past Karma' },
];

const NatalChartView: React.FC<Props> = ({ natalChart, birthData }) => {
  const [selectedVarga, setSelectedVarga] = useState(1);
  const [selectedPoint, setSelectedPoint] = useState<ChartPoint | null>(null);

  const activeChart = useMemo(() => {
    if (selectedVarga === 1) return natalChart;
    return astrologyService.calculateVarga(natalChart, selectedVarga);
  }, [natalChart, selectedVarga]);

  const handleReset = () => {
    setSelectedVarga(1);
    setSelectedPoint(null);
  };

  const formatDegrees = (deg: number) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    return `${d.toString().padStart(2, '0')}°${m.toString().padStart(2, '0')}'`;
  };

  const lagnaPoint = activeChart.points.find(p => p.planet === Planet.Lagna);

  const navamshaDetails = useMemo(() => {
    if (!selectedPoint || !lagnaPoint) return null;
    const calculateD9Sign = (pSign: number, pDegree: number) => {
      const totalDegrees = (pSign - 1) * 30 + pDegree;
      return (Math.floor(totalDegrees * 9 / 30) % 12) + 1;
    };
    const d9Sign = calculateD9Sign(selectedPoint.sign, selectedPoint.degree) as Sign;
    const d9LagnaSign = calculateD9Sign(lagnaPoint.sign, lagnaPoint.degree);
    const d9House = ((d9Sign - d9LagnaSign + 12) % 12) + 1;
    const isVargottama = d9Sign === selectedPoint.sign;
    return { d9Sign, d9House, isVargottama };
  }, [selectedPoint, lagnaPoint]);

  const activeVargaLabel = VARGA_LIST.find(v => v.value === selectedVarga)?.label;

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-1000 relative">
      {/* 1. CELESTIAL TOOLBOX */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-[#f1ebe6] dark:border-slate-800 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-10 transition-colors">
         <div className="flex items-center gap-8 w-full lg:w-auto">
            <div className="w-20 h-20 bg-orange-50 dark:bg-orange-950/30 rounded-[28px] flex items-center justify-center shadow-inner group border border-transparent dark:border-slate-800">
              <ChartBarIcon className="w-10 h-10 text-orange-500 group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter leading-tight">Natal Matrix</h2>
              <div className="flex items-center gap-3 mt-1">
                 <span className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                    <ShieldCheckIcon className="w-4 h-4" /> Ephemeris Sync
                 </span>
                 <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">Ayanamsa: Lahiri</span>
              </div>
            </div>
         </div>

         <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full md:w-[380px]">
               <select 
                 value={selectedVarga} 
                 onChange={(e) => { setSelectedVarga(parseInt(e.target.value)); setSelectedPoint(null); }} 
                 className="w-full bg-[#fcf8f5] dark:bg-slate-950 border border-[#f1ebe6] dark:border-slate-800 rounded-[24px] px-8 py-5 text-sm font-black text-slate-800 dark:text-slate-200 appearance-none cursor-pointer hover:bg-white dark:hover:bg-slate-900 transition-all outline-none shadow-inner"
               >
                  {VARGA_LIST.map(v => (<option key={v.value} value={v.value}>{v.label}</option>))}
               </select>
               <ChevronDownIcon className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 pointer-events-none" />
            </div>

            <button 
              onClick={handleReset} 
              className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[24px] shadow-2xl active:scale-95 transition-all text-[10px] font-black uppercase tracking-[0.3em]"
            >
              <ArrowPathIcon className="w-5 h-5" /> Reset Matrix
            </button>
         </div>
      </div>

      {/* 2. MAIN CHART DISPLAY */}
      <div className="max-w-5xl mx-auto w-full">
         <VedicChart 
           chart={activeChart}
           selectedPlanet={selectedPoint}
           onSelectPlanet={setSelectedPoint}
           title={activeVargaLabel}
         />
      </div>

      {/* 3. PLANETARY SPECIFICATIONS */}
      <div className="w-full">
         <div className="flex items-center justify-between mb-10 px-6">
            <div className="space-y-1">
               <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Mathematical Coordinates</h3>
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">Precision Ephemeris Data</p>
            </div>
            <button className="flex items-center gap-3 px-8 py-3 bg-white dark:bg-slate-900 border border-[#f1ebe6] dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-900 transition-all shadow-sm">
               <CloudArrowDownIcon className="w-5 h-5" /> Export Data
            </button>
         </div>
         <PlanetDetailsTable chart={activeChart} />
      </div>

      {/* 4. PLANET DETAIL POPUP */}
      {selectedPoint && (
        <div className="fixed inset-x-0 bottom-0 md:inset-auto md:right-8 md:bottom-8 z-[9999] bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-6 lg:p-7 rounded-t-[32px] md:rounded-[32px] animate-in slide-in-from-bottom-10 duration-400 w-full md:max-w-[380px] max-h-[80vh] overflow-y-auto custom-scrollbar transition-colors">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-black text-xl border border-orange-100 dark:border-orange-900 shadow-inner">
                {selectedPoint.planet.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white text-xl tracking-tight leading-none mb-1.5">{selectedPoint.planet}</h3>
                <div className="flex flex-wrap gap-1.5">
                   <span className="text-[8px] font-black text-orange-500 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded uppercase border border-orange-100 dark:border-orange-900/50">House {selectedPoint.house}</span>
                   {selectedPoint.isRetrograde && <span className="text-[8px] font-black text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded uppercase border border-rose-100 dark:border-rose-900/50">Rx</span>}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setSelectedPoint(null)} 
              className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-300 dark:text-slate-600 hover:text-rose-500 rounded-xl transition-all active:scale-90"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-5">
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 space-y-4">
               <div className="flex items-center gap-2">
                  <Square3Stack3DIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-[9px] font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-[0.2em]">Navamsha (D9)</h4>
               </div>
               <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-center">
                     <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Sign</p>
                     <div className="flex flex-col items-center">
                        <ZodiacIcon sign={navamshaDetails?.d9Sign || Sign.Aries} className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-0.5" />
                        <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 uppercase truncate w-full">{SIGN_NAMES[navamshaDetails?.d9Sign || Sign.Aries]}</span>
                     </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-center flex flex-col justify-center">
                     <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">House</p>
                     <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">H{navamshaDetails?.d9House}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-center flex flex-col justify-center">
                     <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Status</p>
                     <span className={`text-[8px] font-black uppercase ${navamshaDetails?.isVargottama ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-500'}`}>
                        {navamshaDetails?.isVargottama ? 'Vargo' : 'Stable'}
                     </span>
                  </div>
               </div>
            </div>

            <div className="space-y-3">
               <div className="p-4 bg-[#fcf8f5] dark:bg-slate-800/50 rounded-2xl border border-[#f1ebe6] dark:border-slate-800 transition-colors">
                  <p className="text-[9px] font-black text-[#8c7e74] dark:text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                     <InformationCircleIcon className="w-3.5 h-3.5 text-orange-400" /> Essence
                  </p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    Manifesting through {SIGN_NAMES[selectedPoint.sign]}. Dignity: <span className="text-orange-600 dark:text-orange-400">{selectedPoint.dignity || 'Neutral'}</span>.
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm text-center transition-colors">
                    <p className="text-[8px] font-black text-[#8c7e74] dark:text-slate-500 uppercase tracking-widest mb-1">Nakshatra</p>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 truncate">{selectedPoint.nakshatra}</p>
                    <p className="text-[8px] font-bold text-indigo-500 dark:text-indigo-400 uppercase">Pada {selectedPoint.pada}</p>
                  </div>
                  <div className="p-3.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm text-center transition-colors">
                    <p className="text-[8px] font-black text-[#8c7e74] dark:text-slate-500 uppercase tracking-widest mb-1">Long.</p>
                    <div className="flex items-center justify-center gap-1">
                       <ZodiacIcon sign={selectedPoint.sign} className="w-3.5 h-3.5 text-indigo-400" />
                       <p className="text-xs font-black text-slate-800 dark:text-slate-200 font-mono">{formatDegrees(selectedPoint.degree)}</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NatalChartView;
