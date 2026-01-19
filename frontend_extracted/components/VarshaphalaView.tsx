
import React, { useState, useMemo } from 'react';
import { VarshaphalaData, astrologyService } from '../services/astrologyService';
import VedicChart from './VedicChart';
import { 
  CalendarIcon, 
  SparklesIcon, 
  MapPinIcon, 
  ClockIcon, 
  TrophyIcon,
  AcademicCapIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  TableCellsIcon,
  BoltIcon,
  FireIcon,
  HeartIcon,
  CpuChipIcon,
  ArrowPathIcon,
  XMarkIcon,
  ShieldCheckIcon,
  SpeakerWaveIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';
import { Sign, ChartPoint, Planet } from '../types';
import ZodiacIcon from './ZodiacIcon';
import { geminiService } from '../services/geminiService';
import { SIGN_NAMES } from '../constants';

interface Props {
  data: VarshaphalaData;
  onYearChange: (year: number) => void;
  chartStyle?: 'North' | 'South';
}

const VarshaphalaView: React.FC<Props> = ({ data, onYearChange, chartStyle = 'North' }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<ChartPoint | null>(null);
  
  const years = [2023, 2024, 2025, 2026];

  const formatDegrees = (deg: number) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    return `${d.toString().padStart(2, '0')}°${m.toString().padStart(2, '0')}'`;
  };

  const getSignNum = (name: string): Sign => {
    const signs: Record<string, Sign> = {
      'Aries': Sign.Aries, 'Taurus': Sign.Taurus, 'Gemini': Sign.Gemini,
      'Cancer': Sign.Cancer, 'Leo': Sign.Leo, 'Virgo': Sign.Virgo,
      'Libra': Sign.Libra, 'Scorpio': Sign.Scorpio, 'Sagittarius': Sign.Sagittarius,
      'Capricorn': Sign.Capricorn, 'Aquarius': Sign.Aquarius, 'Pisces': Sign.Pisces
    };
    return signs[name] || Sign.Aries;
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const analysis = await geminiService.interpretVarshaphala(data);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const lagnaPoint = data.chart.points.find(p => p.planet === Planet.Lagna);

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

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24 relative transition-colors">
      {/* 1. PREMIUM HEADER BAR */}
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-[#f1ebe6] dark:border-slate-800 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-10 transition-colors">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 rounded-[28px] bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center border border-orange-100 dark:border-orange-900/50 shadow-inner">
            <CalendarIcon className="w-10 h-10 text-[#f97316] dark:text-orange-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-[#2d2621] dark:text-white tracking-tighter leading-none">Annual Return {data.year}</h2>
            <div className="flex items-center gap-4">
               <span className="flex items-center gap-2 text-[10px] font-black text-[#8c7e74] dark:text-slate-500 uppercase tracking-[0.3em]">
                  <SparklesIcon className="w-4 h-4 text-orange-400" /> Tajika Matrix Active
               </span>
               <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
               <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Protocol Sync</span>
            </div>
          </div>
        </div>

        <div className="flex bg-[#fcf8f5] dark:bg-slate-950 p-2 rounded-2xl border border-[#f1ebe6] dark:border-slate-800 transition-colors">
          {years.map(y => (
            <button
              key={y}
              onClick={() => { onYearChange(y); setAiAnalysis(null); }}
              className={`px-10 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${data.year === y ? 'bg-orange-500 text-white shadow-xl' : 'text-[#8c7e74] dark:text-slate-500 hover:text-[#2d2621] dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-900'}`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Metrics & Dashas */}
        <div className="lg:col-span-4 space-y-8">
          <div className="p-10 bg-[#2d2621] dark:bg-black text-white relative overflow-hidden rounded-[48px] shadow-2xl border border-transparent dark:border-slate-800 transition-colors">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-400/80 mb-8 relative z-10">Master Pillars</h3>
            <div className="space-y-8 relative z-10">
              {[
                { label: 'Varsheshwar (Year Lord)', val: data.yearLord, icon: TrophyIcon },
                { label: 'Muntha Sector', val: `${data.munthaSign} / H${data.munthaHouse}`, icon: MapPinIcon },
                { label: 'Annual Ascendant', val: data.ascendant, icon: ClockIcon }
              ].map((pill, idx) => (
                <div key={idx} className="flex items-center gap-5 group cursor-default">
                   <div className="w-14 h-14 rounded-[20px] bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-orange-500/50 transition-colors">
                      <pill.icon className="w-7 h-7 text-orange-500" />
                   </div>
                   <div>
                      <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-0.5">{pill.label}</p>
                      <p className="text-2xl font-black text-white tracking-tight">{pill.val}</p>
                   </div>
                </div>
              ))}
            </div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
          </div>

          <div className="p-8 bg-white dark:bg-slate-900 border border-[#f1ebe6] dark:border-slate-800 rounded-[44px] shadow-sm transition-colors">
            <h3 className="text-sm font-black text-[#2d2621] dark:text-white mb-8 flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                  <BoltIcon className="w-5 h-5 text-orange-500" /> 
                  Mudda Timeline
               </div>
               <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Dashas</span>
            </h3>
            <div className="space-y-3">
              {data.muddaDashas.map((d, i) => (
                <div key={i} className={`flex justify-between items-center p-5 rounded-[24px] border transition-all ${d.isActive ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900 shadow-md' : 'bg-[#fcf8f5] dark:bg-slate-950 border-transparent dark:border-slate-800 hover:border-orange-100 dark:hover:border-orange-900/50'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-[10px] font-black shadow-sm transition-transform ${d.isActive ? 'bg-[#f97316] text-white scale-110' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-700 border border-slate-100 dark:border-slate-800'}`}>
                      {d.planet.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className={`text-base font-black ${d.isActive ? 'text-orange-900 dark:text-orange-300' : 'text-[#2d2621] dark:text-slate-300'}`}>{d.planet}</p>
                      <p className="text-[10px] font-bold text-[#8c7e74] dark:text-slate-600 uppercase tracking-tighter">{d.start} – {d.end}</p>
                    </div>
                  </div>
                  {d.isActive && <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Chart & AI Analysis */}
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-slate-900 dark:bg-black rounded-[48px] p-10 lg:p-14 text-white shadow-2xl relative overflow-hidden group border border-transparent dark:border-slate-800 transition-colors">
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="space-y-4 flex-1">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                        <CpuChipIcon className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-400">Interpretive Protocol</span>
                   </div>
                   <h3 className="text-3xl font-black tracking-tighter leading-none">Synthesize Annual Narrative</h3>
                   <p className="text-base font-medium text-slate-400 dark:text-slate-500 leading-relaxed max-w-xl italic">
                     "Activate the Vedic Oracle to parse the Tajika Yogas and Muntha focal points into a comprehensive {data.year} life-strategy."
                   </p>
                </div>
                <button 
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="px-12 py-6 bg-[#f97316] hover:bg-orange-600 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center gap-4 disabled:opacity-50 shadow-xl shadow-orange-500/20 active:scale-95 shrink-0"
                >
                  {isGenerating ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <SparklesIcon className="w-6 h-6" />}
                  {isGenerating ? 'Decrypting Matrix...' : 'Interpret Blueprint'}
                </button>
             </div>
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
          </div>

          {aiAnalysis && (
            <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-[#f1ebe6] dark:border-slate-800 p-10 lg:p-14 shadow-sm animate-in zoom-in-95 duration-500 transition-colors">
               <div className="flex items-center gap-5 mb-10 pb-8 border-b border-slate-50 dark:border-slate-800/50">
                  <div className="w-14 h-14 bg-orange-50 dark:bg-orange-950/30 rounded-2xl flex items-center justify-center text-orange-500">
                     <AcademicCapIcon className="w-8 h-8" />
                  </div>
                  <div>
                     <h4 className="text-xl font-black text-slate-700 dark:text-white uppercase tracking-tight">Vedic Analysis Synthesis</h4>
                     <p className="text-[10px] font-black text-[#8c7e74] dark:text-slate-600 uppercase tracking-[0.3em]">Temporal Prediction Verified</p>
                  </div>
               </div>
               <div className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap italic">
                  {aiAnalysis}
               </div>
            </div>
          )}

          {/* REPLICATED NATAL MATRIX STYLE CHART */}
          <div className="max-w-5xl mx-auto w-full">
            <VedicChart 
              chart={data.chart} 
              selectedPlanet={selectedPoint}
              onSelectPlanet={setSelectedPoint}
              defaultStyle={chartStyle}
              title={`Annual Rasi (D1-A) — ${data.year}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Sahams Block */}
            <div className="p-10 bg-white dark:bg-slate-900 border border-[#f1ebe6] dark:border-slate-800 rounded-[56px] shadow-sm transition-colors">
              <h3 className="text-sm font-black text-[#2d2621] dark:text-white mb-10 flex items-center justify-between px-2">
                 <div className="flex items-center gap-3">
                   <TableCellsIcon className="w-6 h-6 text-indigo-500" /> 
                   Annual Sahams
                 </div>
                 <InformationCircleIcon className="w-5 h-5 text-slate-300 dark:text-slate-700 cursor-help" />
              </h3>
              <div className="space-y-4">
                {data.sahams.map((s, i) => (
                  <div key={i} className="flex justify-between items-center p-6 bg-[#fcf8f5] dark:bg-slate-950 rounded-[28px] border border-[#f1ebe6] dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 group cursor-default transition-all">
                    <div className="space-y-1">
                       <p className="text-base font-black text-[#2d2621] dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">{s.name}</p>
                       <p className="text-[10px] font-bold text-[#8c7e74] dark:text-slate-600 uppercase tracking-tighter">{s.meaning}</p>
                    </div>
                    <div className="text-right">
                       <div className="flex items-center justify-end gap-2 mb-1">
                          <ZodiacIcon sign={getSignNum(s.sign)} className="w-4.5 h-4.5 text-indigo-400" />
                          <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">{s.sign}</p>
                       </div>
                       <p className="text-[11px] font-mono font-black text-slate-400 dark:text-slate-700">{formatDegrees(s.degree)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tajika Yogas Block */}
            <div className="p-10 bg-white dark:bg-slate-900 border border-[#f1ebe6] dark:border-slate-800 rounded-[56px] shadow-sm transition-colors">
              <h3 className="text-sm font-black text-[#2d2621] dark:text-white mb-10 flex items-center gap-3 px-2">
                <FireIcon className="w-6 h-6 text-rose-500" /> Annual Tajika Yogas
              </h3>
              <div className="space-y-8">
                {data.yogas.map((y, i) => (
                  <div key={i} className="group relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 hover:border-rose-500 transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">{y.name}</p>
                      <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border shadow-sm ${
                        y.strength === 'Strong' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' : 
                        y.strength === 'Moderate' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800'
                      }`}>{y.strength}</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-tighter mb-2">Sync: {y.planets}</p>
                    <p className="text-sm font-medium text-[#8c7e74] dark:text-slate-500 leading-relaxed italic">
                       "{y.description}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PLANET DETAIL POPUP (Synced with Natal) */}
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
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedPoint(null)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-300 dark:text-slate-600 hover:text-rose-500 rounded-xl transition-all">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-5">
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 space-y-4">
               <div className="flex items-center gap-2">
                  <Square3Stack3DIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-[9px] font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-[0.2em]">Navamsha (D9) Root</h4>
               </div>
               <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-center flex flex-col justify-center">
                     <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">House</p>
                     <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">H{navamshaDetails?.d9House}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-center flex flex-col justify-center">
                     <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Status</p>
                     <span className={`text-[8px] font-black uppercase ${navamshaDetails?.isVargottama ? 'text-emerald-500' : 'text-slate-500'}`}>
                        {navamshaDetails?.isVargottama ? 'Vargo' : 'Stable'}
                     </span>
                  </div>
               </div>
            </div>
            <div className="p-4 bg-[#fcf8f5] dark:bg-slate-800/50 rounded-2xl border border-[#f1ebe6] dark:border-slate-800">
               <p className="text-[9px] font-black text-[#8c7e74] dark:text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <InformationCircleIcon className="w-3.5 h-3.5 text-orange-400" /> Annual Context
               </p>
               <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">
                 Focusing destiny through {SIGN_NAMES[selectedPoint.sign]}. Dignity: <span className="text-orange-600 dark:text-orange-400">{selectedPoint.dignity || 'Neutral'}</span>.
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VarshaphalaView;
