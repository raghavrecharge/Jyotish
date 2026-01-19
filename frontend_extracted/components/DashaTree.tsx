
import React from 'react';
import { DashaNode, Planet } from '../types';
import { 
  ChevronRightIcon, 
  MagnifyingGlassPlusIcon, 
  ClockIcon,
  CalendarIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface Props {
  nodes: DashaNode[];
  onDrillDown: (node: DashaNode) => void;
  onGoUp: (index: number) => void;
}

const DashaTree: React.FC<Props> = ({ nodes, onDrillDown, onGoUp }) => {
  const currentNodes = nodes;

  const getPlanetColor = (planet: string) => {
    const colors: Record<string, string> = {
      Sun: 'bg-orange-500',
      Moon: 'bg-blue-400',
      Mars: 'bg-rose-500',
      Rahu: 'bg-slate-700',
      Jupiter: 'bg-amber-500',
      Saturn: 'bg-indigo-700',
      Mercury: 'bg-emerald-500',
      Ketu: 'bg-amber-900',
      Venus: 'bg-pink-400',
    };
    return colors[planet] || 'bg-slate-400';
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 transition-colors">
      {/* 1. VISUAL TIMELINE STRIP */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="bg-slate-50 dark:bg-slate-950 rounded-[40px] p-8 lg:p-12 relative overflow-hidden transition-colors">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
               <CalendarIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
               Temporal Horizon
            </h3>
            <span className="px-5 py-2 bg-white dark:bg-slate-900 rounded-full text-[10px] font-black text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800 tracking-widest uppercase">
               {new Date(currentNodes[0]?.start).getFullYear()} — {new Date(currentNodes[currentNodes.length - 1]?.end).getFullYear()} Cycle
            </span>
          </div>

          <div className="relative h-24 w-full bg-white dark:bg-slate-900 rounded-[28px] overflow-hidden flex shadow-inner group border border-transparent dark:border-slate-800">
            {currentNodes.map((node) => {
              const start = new Date(node.start).getTime();
              const end = new Date(node.end).getTime();
              const totalSpan = new Date(currentNodes[currentNodes.length-1].end).getTime() - new Date(currentNodes[0].start).getTime();
              const width = ((end - start) / (totalSpan || 1)) * 100;
              const isActive = new Date() >= new Date(node.start) && new Date() <= new Date(node.end);
              const hasChildren = node.children && node.children.length > 0;

              return (
                <div
                  key={node.id}
                  style={{ width: `${width}%` }}
                  onClick={() => hasChildren && onDrillDown(node)}
                  className={`relative h-full border-r border-white/20 dark:border-black/20 transition-all duration-300 group/bar ${hasChildren ? 'cursor-pointer hover:brightness-110 active:scale-[0.98]' : ''} ${getPlanetColor(node.planet)}`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-white/30 dark:bg-white/10 animate-pulse flex items-center justify-center">
                       <div className="w-1 h-full bg-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-1">
                    <span className={`text-[10px] font-black text-white ${width < 8 ? 'hidden' : 'block'} uppercase tracking-widest`}>{node.planet.substring(0, 3)}</span>
                  </div>
                  
                  {/* Tooltip Overlay */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 z-50 pointer-events-none w-56 scale-90 group-hover/bar:scale-100 origin-bottom">
                     <div className="bg-slate-900 dark:bg-black text-white p-6 rounded-[24px] text-[10px] shadow-2xl border border-slate-700/50 backdrop-blur-xl">
                        <p className="font-black text-indigo-400 dark:text-indigo-300 mb-3 uppercase tracking-[0.2em]">{node.planet}</p>
                        <div className="space-y-2 opacity-80 font-bold">
                           <p className="flex justify-between"><span>Initiated:</span> <span>{new Date(node.start).toLocaleDateString('en-GB')}</span></p>
                           <p className="flex justify-between"><span>Concluded:</span> <span>{new Date(node.end).toLocaleDateString('en-GB')}</span></p>
                        </div>
                        {hasChildren && <p className="mt-5 text-emerald-400 font-black flex items-center gap-2 uppercase tracking-tighter animate-pulse"><MagnifyingGlassPlusIcon className="w-4 h-4" /> Analyze Component</p>}
                     </div>
                     <div className="w-4 h-4 bg-slate-900 dark:bg-black rotate-45 absolute -bottom-2 left-1/2 -translate-x-1/2 border-r border-b border-slate-700/50" />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-10 flex flex-wrap gap-6 items-center justify-between">
             <div className="flex flex-wrap gap-4">
                {currentNodes.slice(0, 9).map((node, i) => (
                   <div key={i} className="flex items-center gap-2.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className={`w-2.5 h-2.5 rounded-full ${getPlanetColor(node.planet)} shadow-sm`} />
                      <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{node.planet}</span>
                   </div>
                ))}
             </div>
             <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 px-5 py-2.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 transition-colors">
                <BoltIcon className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Temporal Fidelity Verified</span>
             </div>
          </div>
        </div>
      </div>

      {/* 2. GRID CARDS VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 lg:px-0">
        {currentNodes.map((node) => {
          const now = new Date();
          const isActive = now >= new Date(node.start) && now <= new Date(node.end);
          const hasChildren = node.children && node.children.length > 0;
          
          return (
            <div
              key={node.id}
              onClick={() => hasChildren && onDrillDown(node)}
              className={`group p-10 rounded-[44px] border-2 transition-all duration-500 flex flex-col cursor-pointer relative overflow-hidden h-full ${
                isActive ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 shadow-2xl -translate-y-2' : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className={`w-16 h-16 rounded-[24px] ${getPlanetColor(node.planet)} flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <span className="text-xl font-black uppercase">{node.planet.substring(0, 2)}</span>
                </div>
                {isActive && (
                   <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest animate-in zoom-in-50">
                      <BoltIcon className="w-3.5 h-3.5" /> Synchronized
                   </div>
                )}
                {!isActive && hasChildren && (
                   <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-300 dark:text-slate-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all border border-transparent dark:border-slate-800">
                      <ChevronRightIcon className="w-5 h-5" />
                   </div>
                )}
              </div>

              <div className="space-y-2 relative z-10">
                <h4 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter flex items-center gap-3">
                   {node.planet}
                   {isActive && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />}
                </h4>
                <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                   <CalendarIcon className="w-4 h-4 text-indigo-400/60" />
                   <p className="text-[10px] font-bold uppercase tracking-widest">
                    {new Date(node.start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} 
                    <span className="mx-2 opacity-30">—</span> 
                    {new Date(node.end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                   </p>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100/50 dark:border-slate-800/50 flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                       Timeline Span: {((new Date(node.end).getTime() - new Date(node.start).getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(2)} Yrs
                    </span>
                 </div>
                 {hasChildren && (
                    <button className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                       Drill Down <ChevronRightIcon className="w-3 h-3" />
                    </button>
                 )}
              </div>
              
              <div className="absolute -bottom-10 -right-10 p-12 opacity-[0.02] dark:opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
                 <ClockIcon className="w-56 h-56" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashaTree;
