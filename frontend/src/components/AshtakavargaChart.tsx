
import React from 'react';

interface Props {
  sav: number[];
  title: string;
  onHouseHover?: (house: number | null) => void;
}

const AshtakavargaChart: React.FC<Props> = ({ sav, title }) => {
  // SVG Canvas Constants
  const size = 400;
  const cx = 200;
  const cy = 200;
  
  // Use a wide viewBox padding (-60 to 460) to ensure markers on edges never crop
  const viewBox = "-60 -60 520 520";

  // Geometric sectors (North Indian Style)
  const housePaths = [
    `M200 200 L100 100 L200 0 L300 100 Z`,     // H1
    `M100 100 L0 0 L200 0 Z`,                  // H2
    `M100 100 L0 0 L0 200 Z`,                  // H3
    `M200 200 L100 100 L0 200 L100 300 Z`,     // H4
    `M100 300 L0 200 L0 400 Z`,                // H5
    `M100 300 L0 400 L200 400 Z`,              // H6
    `M200 200 L100 300 L200 400 L300 300 Z`,   // H7
    `M300 300 L200 400 L400 400 Z`,            // H8
    `M300 300 L400 400 L400 200 Z`,            // H9
    `M200 200 L300 300 L400 200 L300 100 Z`,   // H10
    `M300 100 L400 200 L400 0 Z`,              // H11
    `M300 100 L400 0 L200 0 Z`,                // H12
  ];

  // Precise centroids for static markers - adjusted for visual balance within triangles/diamonds
  const markers = [
    { x: 200, y: 100 }, // H1
    { x: 100, y: 35 },  // H2
    { x: 35, y: 100 },  // H3
    { x: 100, y: 200 }, // H4
    { x: 35, y: 300 },  // H5
    { x: 100, y: 365 }, // H6
    { x: 200, y: 300 }, // H7
    { x: 300, y: 365 }, // H8
    { x: 365, y: 300 }, // H9
    { x: 300, y: 200 }, // H10
    { x: 365, y: 100 }, // H11
    { x: 300, y: 35 },  // H12
  ];

  const getHouseColor = (points: number) => {
    if (points >= 32) return 'fill-emerald-500';
    if (points >= 28) return 'fill-emerald-400';
    if (points >= 25) return 'fill-indigo-500';
    if (points >= 20) return 'fill-amber-500';
    return 'fill-rose-500';
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full aspect-square max-w-[500px] flex items-center justify-center p-4">
        <svg 
          viewBox={viewBox} 
          className="w-full h-full overflow-visible select-none transition-colors duration-500"
        >
          <defs>
            <filter id="static-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.1" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Branding */}
          <text x={cx} y={cy} textAnchor="middle" alignmentBaseline="middle" className="fill-orange-500/[0.04] dark:fill-orange-400/[0.06] font-black text-[96px] pointer-events-none tracking-tight uppercase">
            ENERGY
          </text>

          {/* Grid Framework */}
          <g className="grid-lines">
            <rect x="0" y="0" width={size} height={size} fill="none" stroke="currentColor" className="text-orange-200 dark:text-orange-900/40" strokeWidth="4" rx="2" />
            <line x1="0" y1="0" x2={size} y2={size} stroke="currentColor" className="text-orange-200 dark:text-orange-900/30" strokeWidth="2.5" />
            <line x1={size} y1="0" x2="0" y2={size} stroke="currentColor" className="text-orange-200 dark:text-orange-900/30" strokeWidth="2.5" />
            <path d={`M200 0 L400 200 L200 400 L0 200 Z`} fill="none" stroke="currentColor" className="text-orange-200 dark:text-orange-900/40" strokeWidth="3" />
          </g>

          {/* Static House Information */}
          {housePaths.map((path, i) => {
            const val = sav[i] || 0;
            const color = getHouseColor(val);
            const pos = markers[i];

            return (
              <g key={i}>
                {/* Visual context fill */}
                <path 
                  d={path} 
                  className={`${color} opacity-[0.05] dark:opacity-[0.1]`}
                />
                
                {/* Score Pill */}
                <g transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle 
                    r="28" 
                    className="fill-white dark:fill-slate-900 stroke-orange-100 dark:stroke-orange-900/30" 
                    strokeWidth="1.5"
                    filter="url(#static-shadow)"
                  />
                  
                  {/* House Identifier - Always visible inside pill */}
                  <text 
                    y="-13"
                    textAnchor="middle" 
                    className="font-black text-[9px] fill-orange-400 dark:fill-orange-600 uppercase tracking-widest"
                  >
                    H{i + 1}
                  </text>

                  {/* Score Value */}
                  <text 
                    y="6"
                    textAnchor="middle" 
                    alignmentBaseline="middle"
                    className="font-black text-[20px] fill-slate-800 dark:fill-white tracking-tighter"
                  >
                    {val}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Static Responsive Legend */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-[500px] px-4">
         {[
           { label: 'Exalted (>32)', color: 'bg-emerald-500' },
           { label: 'Strong (28-31)', color: 'bg-emerald-400' },
           { label: 'Moderate (25-27)', color: 'bg-indigo-500' },
           { label: 'Warning (<25)', color: 'bg-rose-500' }
         ].map((item, idx) => (
           <div key={idx} className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/40 p-2.5 rounded-2xl border border-orange-50 dark:border-slate-800 shadow-sm transition-colors">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-sm shrink-0`} />
              <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">{item.label}</span>
           </div>
         ))}
      </div>
    </div>
  );
};

export default AshtakavargaChart;
