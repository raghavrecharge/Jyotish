
import React, { useState, useMemo, useEffect } from 'react';
import { DashaNode, Planet } from '../types';
import { 
  Squares2X2Icon, 
  TableCellsIcon, 
  ArrowPathIcon,
  ChevronRightIcon,
  HomeIcon,
  BoltIcon,
  ClockIcon,
  SparklesIcon,
  LinkIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import DashaTree from './DashaTree';
import DashaTable from './DashaTable';

interface Props {
  nodes: DashaNode[];
}

const DashasView: React.FC<Props> = ({ nodes }) => {
  const [viewType, setViewType] = useState<'Timeline' | 'Table'>('Table');
  const [history, setHistory] = useState<DashaNode[][]>([nodes]);
  const [breadcrumbNodes, setBreadcrumbNodes] = useState<DashaNode[]>([]);
  const [hasAutoNavigated, setHasAutoNavigated] = useState(false);

  const currentNodes = history[history.length - 1];
  const currentDepth = history.length - 1;

  useEffect(() => {
    if (!hasAutoNavigated && nodes.length > 0) {
      goToActive();
      setHasAutoNavigated(true);
    }
  }, [nodes, hasAutoNavigated]);

  const drillDown = (node: DashaNode) => {
    if (node.children && node.children.length > 0) {
      setHistory([...history, node.children]);
      setBreadcrumbNodes([...breadcrumbNodes, node]);
    }
  };

  const goUp = (index: number) => {
    if (index === -1) {
      setHistory([nodes]);
      setBreadcrumbNodes([]);
    } else {
      setHistory(history.slice(0, index + 2));
      setBreadcrumbNodes(breadcrumbNodes.slice(0, index + 1));
    }
  };

  const resetToRoot = () => {
    setHistory([nodes]);
    setBreadcrumbNodes([]);
  };

  const goToActive = () => {
    const now = new Date();
    let currentLevelNodes = nodes;
    let newHistory = [nodes];
    let newBreadcrumbs: DashaNode[] = [];

    const findActive = (levelNodes: DashaNode[]) => {
      const active = levelNodes.find(n => new Date(n.start) <= now && new Date(n.end) >= now);
      if (active) {
        if (active.children && active.children.length > 0) {
          newHistory.push(active.children);
          newBreadcrumbs.push(active);
          findActive(active.children);
        }
      }
    };

    findActive(nodes);
    setHistory(newHistory);
    setBreadcrumbNodes(newBreadcrumbs);
  };

  const levelName = useMemo(() => {
    if (currentDepth === 0) return "Mahadasha";
    if (currentDepth === 1) return "Antardasha";
    if (currentDepth === 2) return "Pratyantardasha";
    if (currentDepth === 3) return "Sookshma Dasha";
    return `Level ${currentDepth + 1}`;
  }, [currentDepth]);

  const activePath = useMemo(() => {
    const now = new Date();
    const path: string[] = [];
    let searchLevel = nodes;
    
    while (searchLevel) {
      const active = searchLevel.find(n => new Date(n.start) <= now && new Date(n.end) >= now);
      if (active) {
        path.push(active.planet);
        searchLevel = active.children || [];
      } else {
        break;
      }
    }
    return path;
  }, [nodes]);

  const isViewingActivePath = useMemo(() => {
    const now = new Date();
    if (breadcrumbNodes.length === 0) return true;
    return breadcrumbNodes.every(node => {
      const start = new Date(node.start);
      const end = new Date(node.end);
      return now >= start && now <= end;
    });
  }, [breadcrumbNodes]);

  const pathPrefix = useMemo(() => {
    return breadcrumbNodes.map(n => n.planet).join(' - ');
  }, [breadcrumbNodes]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 transition-colors">
      
      {/* 1. ACTIVE PATH HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-[#f1ebe6] dark:border-slate-800 rounded-[48px] p-10 lg:p-14 shadow-sm relative overflow-hidden group transition-colors">
        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
          <div className="space-y-10 flex-1 w-full">
            <div className="flex items-center justify-between xl:justify-start gap-5">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[20px] bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 transition-all group-hover:scale-110 group-hover:rotate-6">
                     <BoltIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                     <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] block mb-1.5">Vimshottari Time-Sync</span>
                     <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active Matrix Locked</span>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 lg:gap-5">
              {activePath.map((planet, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center bg-[#fcf8f5] dark:bg-slate-950 border border-orange-100/40 dark:border-orange-900/30 pl-2 pr-8 py-2.5 rounded-[28px] transition-all hover:border-orange-300 dark:hover:border-orange-500 group/pill cursor-default shadow-sm">
                    <div className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 flex items-center justify-center text-orange-500 shadow-sm mr-5 group-hover/pill:rotate-12 transition-transform">
                       <span className="text-xs font-black">{planet.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-[0.4em] opacity-80 mb-0.5">
                        {i === 0 ? 'Maha' : i === 1 ? 'Antar' : i === 2 ? 'Pratyantar' : 'Sookshma'}
                      </span>
                      <span className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">
                        {planet}
                      </span>
                    </div>
                  </div>
                  {i < activePath.length - 1 && (
                    <div className="px-1 opacity-20 hidden md:block">
                       <ChevronRightIcon className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 w-full xl:w-auto">
             <button 
               onClick={goToActive}
               className="hidden xl:flex items-center gap-4 px-8 py-6 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white border border-orange-100 dark:border-orange-900/40 rounded-[28px] transition-all active:scale-90 group/btn shadow-sm"
             >
                <MapIcon className="w-6 h-6 group-hover/btn:animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Focus Now</span>
             </button>
             <button 
               onClick={() => setViewType(viewType === 'Timeline' ? 'Table' : 'Timeline')}
               className="flex-1 xl:flex-none px-12 py-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[28px] font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-5 active:scale-95 group/mode"
             >
                {viewType === 'Timeline' ? <TableCellsIcon className="w-6 h-6" /> : <Squares2X2Icon className="w-6 h-6" />}
                {viewType === 'Timeline' ? 'Grid Table' : 'Flow View'}
             </button>
          </div>
        </div>
      </div>

      {/* 2. BREADCRUMB NAVIGATION */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-3 px-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[32px] border border-slate-100 dark:border-slate-800 sticky top-[70px] z-30 shadow-md transition-colors">
         <button 
           onClick={resetToRoot}
           className={`flex items-center gap-2.5 px-7 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] transition-all border shrink-0 ${breadcrumbNodes.length === 0 ? 'bg-orange-500 text-white border-orange-500 shadow-xl' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700 hover:border-orange-300'}`}
         >
            <HomeIcon className="w-4.5 h-4.5" /> Root
         </button>
         
         {breadcrumbNodes.map((node, i) => (
           <React.Fragment key={node.id}>
             <ChevronRightIcon className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
             <button 
               onClick={() => goUp(i)}
               className={`flex items-center gap-2.5 px-7 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] transition-all border shrink-0 ${i === breadcrumbNodes.length - 1 ? 'bg-orange-500 text-white border-orange-500 shadow-xl' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700 hover:border-orange-300'}`}
             >
                {node.planet}
             </button>
           </React.Fragment>
         ))}

         {!isViewingActivePath && (
            <button 
              onClick={goToActive}
              className="flex items-center gap-2 px-6 py-4 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-orange-500 hover:text-white transition-all shadow-sm ml-4 shrink-0"
            >
               <MapIcon className="w-4 h-4" /> Re-Sync Present
            </button>
         )}

         <div className="ml-auto pr-6 hidden md:block">
            <span className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] border border-slate-100 dark:border-slate-800">
               Cycle Depth: <span className="text-slate-800 dark:text-slate-300">{levelName}</span>
            </span>
         </div>
      </div>

      <div className="w-full">
         {viewType === 'Timeline' ? (
           <div className="animate-in fade-in zoom-in-95 duration-700">
              <DashaTree nodes={currentNodes} onDrillDown={drillDown} onGoUp={goUp} />
           </div>
         ) : (
           <div className="animate-in fade-in slide-in-from-right-10 duration-700">
              <DashaTable 
                nodes={currentNodes} 
                onDrillDown={drillDown} 
                levelName={levelName}
                pathPrefix={pathPrefix}
              />
           </div>
         )}
      </div>

      {/* 4. FOOTER INSIGHT */}
      <div className="bg-white dark:bg-slate-900 rounded-[48px] p-12 border border-[#f1ebe6] dark:border-slate-800 shadow-sm relative overflow-hidden group transition-colors">
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-5 flex-1">
               <div className="flex items-center gap-3">
                  <SparklesIcon className="w-7 h-7 text-orange-400" />
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">Precision Temporal Narrative</p>
               </div>
               <p className="text-xl font-bold text-slate-700 dark:text-slate-400 italic leading-relaxed max-w-3xl">
                 "The current {activePath[0] || 'matrix'} Mahadasha represents the soul's dominant theme, while sub-periods define the practical manifestations in time."
               </p>
            </div>
            <div className="w-px h-28 bg-slate-100 dark:bg-slate-800 hidden md:block" />
            <div className="p-10 bg-[#fcf8f5] dark:bg-slate-950 border border-orange-100/30 dark:border-orange-900/20 rounded-[40px] shrink-0 text-center shadow-inner transition-colors">
               <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 mb-3 tracking-[0.4em]">Sync Fidelity</p>
               <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">99.9<span className="text-xl text-emerald-500">%</span></p>
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-700 uppercase mt-2">Verified Node</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DashasView;
