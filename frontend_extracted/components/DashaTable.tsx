
import React, { useMemo } from 'react';
import { DashaNode, Planet } from '../types';
import { 
  ChevronRightIcon, 
  ClockIcon, 
  BoltIcon,
  CalendarIcon,
  ArrowRightIcon,
  SparklesIcon,
  LinkIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface Props {
  nodes: DashaNode[];
  onDrillDown: (node: DashaNode) => void;
  levelName: string;
  pathPrefix?: string;
}

const DashaTable: React.FC<Props> = ({ nodes, onDrillDown, levelName, pathPrefix }) => {
  const now = new Date();

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

  const getPeriodStatus = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (now >= startDate && now <= endDate) return 'Active';
    if (now > endDate) return 'Past';
    return 'Future';
  };

  const calculateProgress = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const n = now.getTime();
    if (n < s) return 0;
    if (n > e) return 100;
    return ((n - s) / (e - s)) * 100;
  };

  const formatDuration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const years = diff / (1000 * 60 * 60 * 24 * 365.25);
    if (years >= 1) return `${years.toFixed(1)} Years`;
    const months = years * 12;
    if (months >= 1) return `${months.toFixed(1)} Months`;
    return `${Math.round(months * 30)} Days`;
  };

  const activeNode = useMemo(() => {
    return nodes.find(n => {
      const s = new Date(n.start);
      const e = new Date(n.end);
      return now >= s && now <= e;
    });
  }, [nodes, now]);

  return (
    <div className="space-y-6 transition-colors">
      {/* 1. ACTIVE PERIOD SPOTLIGHT */}
      {activeNode && (
        <div className="bg-white dark:bg-slate-900 border-2 border-orange-50 dark:border-orange-950/30 rounded-[32px] p-6 lg:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-[24px] ${getPlanetColor(activeNode.planet)} flex items-center justify-center text-white shadow-xl shadow-current/20 ring-8 ring-orange-50/50 dark:ring-orange-950/20`}>
                 <BoltIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-orange-500 dark:text-orange-400 uppercase tracking-[0.4em] leading-none mb-1.5">Vibrating Now</p>
                 <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                    {pathPrefix ? `${pathPrefix} - ${activeNode.planet}` : activeNode.planet}
                 </h4>
                 <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                    <CalendarIcon className="w-4 h-4 text-indigo-400" />
                    <p className="text-xs font-bold uppercase tracking-widest">
                       {new Date(activeNode.start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} — {new Date(activeNode.end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-8 pr-4">
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase mb-1">Time Elapsed</p>
                 <p className="text-lg font-black text-slate-800 dark:text-slate-200">{calculateProgress(activeNode.start, activeNode.end).toFixed(1)}%</p>
              </div>
              <div className="w-px h-12 bg-slate-100 dark:bg-slate-800 hidden md:block" />
              <button 
                onClick={() => onDrillDown(activeNode)}
                className="px-8 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center gap-3"
              >
                 Analyze Sub-Level <ChevronRightIcon className="w-4 h-4" />
              </button>
           </div>
        </div>
      )}

      {/* 2. TABULAR SEQUENCE */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in transition-colors">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#fcf8f5] dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] w-1/3">Cosmic Regent Sequence</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] w-1/3">Timeline</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Duration</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {nodes.map((node) => {
                const status = getPeriodStatus(node.start, node.end);
                const progress = calculateProgress(node.start, node.end);
                const hasChildren = node.children && node.children.length > 0;
                const isActive = status === 'Active';

                return (
                  <tr 
                    key={node.id} 
                    onClick={() => hasChildren && onDrillDown(node)}
                    className={`group transition-all duration-300 ${hasChildren ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40' : ''} ${isActive ? 'bg-orange-50/30 dark:bg-orange-950/10' : ''}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg ${getPlanetColor(node.planet)} group-hover:scale-110 transition-transform relative shrink-0`}>
                          {node.planet.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          {/* Restoration: Use pathPrefix for the full name like Jupiter - Venus */}
                          <p className={`text-base font-black tracking-tight truncate ${isActive ? 'text-orange-900 dark:text-orange-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {pathPrefix ? `${pathPrefix} - ${node.planet}` : node.planet}
                          </p>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400 dark:text-slate-600'}`}>
                            {status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`flex items-center gap-3 text-xs font-black ${isActive ? 'text-orange-800 dark:text-orange-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        <span className="font-mono">{new Date(node.start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-slate-300 dark:text-slate-700">thru</span>
                        <span className="font-mono">{new Date(node.end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-slate-700 dark:text-slate-400">{formatDuration(node.start, node.end)}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {hasChildren && (
                        <button className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-orange-500 text-white shadow-xl' : 'bg-slate-50 dark:bg-slate-800 text-indigo-400 dark:text-indigo-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50'}`}>
                          Analysis <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashaTable;
