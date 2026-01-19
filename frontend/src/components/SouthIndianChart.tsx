
import React, { useState, useRef } from 'react';
import { DivisionalChart, Planet, Sign, ChartPoint } from '../types';
import { SIGN_NAMES } from '../constants';
import { 
  InformationCircleIcon,
  XMarkIcon,
  SparklesIcon,
  StarIcon,
  Square3Stack3DIcon,
  MapIcon,
  ArrowsPointingOutIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import ZodiacIcon from './ZodiacIcon';

interface Props {
  chart: DivisionalChart;
  selectedPlanet: ChartPoint | null;
  onSelectPlanet: (p: ChartPoint | null) => void;
  scale?: number;
  showLegend?: boolean;
}

export default function SouthIndianChart({ chart, selectedPlanet, onSelectPlanet, scale = 1, showLegend = true }: Props) {
  const [hoveredPlanet, setHoveredPlanet] = useState<ChartPoint | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showKey, setShowKey] = useState(false);
  const tooltipTimeout = useRef<number | null>(null);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const signToGrid: Record<number, { r: number; c: number }> = {
    12: { r: 0, c: 0 }, 1: { r: 0, c: 1 }, 2: { r: 0, c: 2 }, 3: { r: 0, c: 3 },
    11: { r: 1, c: 0 },                         4: { r: 1, c: 3 },
    10: { r: 2, c: 0 },                         5: { r: 2, c: 3 },
    9: { r: 3, c: 0 }, 8: { r: 3, c: 1 }, 7: { r: 3, c: 2 }, 6: { r: 3, c: 3 },
  };

  const lagnaPoint = chart.points.find(p => p.planet === Planet.Lagna);
  const lagnaSign = lagnaPoint ? lagnaPoint.sign : Sign.Aries;

  const getPlanetsInSign = (sign: number) => {
    return chart.points.filter(p => p.sign === sign);
  };

  const getPlanetCode = (p: Planet) => {
    switch(p) {
      case Planet.Sun: return 'SU';
      case Planet.Moon: return 'MO';
      case Planet.Mars: return 'MA';
      case Planet.Mercury: return 'ME';
      case Planet.Jupiter: return 'JU';
      case Planet.Venus: return 'VE';
      case Planet.Saturn: return 'SA';
      case Planet.Rahu: return 'RA';
      case Planet.Ketu: return 'KE';
      case Planet.Lagna: return 'ASC';
      default: return (p as string).substring(0, 2).toUpperCase();
    }
  };

  const calculateD9Sign = (pSign: number, pDegree: number): Sign => {
    const totalDegrees = (pSign - 1) * 30 + pDegree;
    return ((Math.floor(totalDegrees / (30 / 9)) % 12) + 1) as Sign;
  };

  const formatDegrees = (deg: number) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    return `${d.toString().padStart(2, '0')}°${m.toString().padStart(2, '0')}'`;
  };

  const handlePlanetEnter = (p: ChartPoint) => {
    if (tooltipTimeout.current) window.clearTimeout(tooltipTimeout.current);
    setHoveredPlanet(p);
  };

  const handlePlanetLeave = () => {
    tooltipTimeout.current = window.setTimeout(() => {
      setHoveredPlanet(null);
    }, 600);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const onMouseUp = () => setIsDragging(false);

  const cellSizeW = 150; 
  const cellSizeH = 120; 
  const gridWidth = cellSizeW * 4;
  const gridHeight = cellSizeH * 4;

  return (
    <div className="flex flex-col w-full items-center gap-6 relative overflow-hidden transition-colors" onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
      
      {hoveredPlanet && (
        <div className="fixed pointer-events-none z-[9999] transition-all duration-300 ease-out transform" style={{ left: mousePos.x + 20, top: mousePos.y + 20 }}>
          <div className="bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 shadow-2xl rounded-[32px] p-6 min-w-[340px] pointer-events-auto transition-colors">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-orange-500/20">
                {getPlanetCode(hoveredPlanet.planet)}
              </div>
              <div>
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] mb-0.5">Celestial Grid</p>
                <h4 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{hoveredPlanet.planet}</h4>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-transparent dark:border-slate-800">
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Sector</p>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                     <MapPinIcon className="w-4 h-4 text-indigo-500" /> H{hoveredPlanet.house}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-transparent dark:border-slate-800">
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Rasi</p>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                     <ZodiacIcon sign={hoveredPlanet.sign} className="w-4 h-4 text-indigo-500" /> {SIGN_NAMES[hoveredPlanet.sign]}
                  </p>
                </div>
              </div>

              <div className="p-5 bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-100 dark:border-indigo-900/40 rounded-[24px] space-y-3 shadow-inner">
                <div className="flex justify-between items-center pb-2 border-b border-indigo-200/50 dark:border-indigo-800/50">
                  <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <Square3Stack3DIcon className="w-5 h-5" /> Navamsha D9
                  </p>
                  <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 rounded text-[8px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">Roots</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center border border-indigo-200 dark:border-indigo-800 transition-transform">
                      <ZodiacIcon sign={calculateD9Sign(hoveredPlanet.sign, hoveredPlanet.degree)} className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-black text-slate-800 dark:text-slate-200 leading-none">
                      {SIGN_NAMES[calculateD9Sign(hoveredPlanet.sign, hoveredPlanet.degree)]}
                    </p>
                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-500 uppercase tracking-widest">
                      Spiritual Varga Sync
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-orange-50/40 dark:bg-orange-950/20 px-4 py-3 rounded-2xl border border-orange-100/50 dark:border-orange-900/30">
                <p className="text-[10px] font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest">Precision Long.</p>
                <p className="text-xs font-black text-orange-600 dark:text-orange-400 font-mono">
                   {formatDegrees(hoveredPlanet.degree)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full aspect-[5/3] bg-[#fffaf5] dark:bg-slate-950 rounded-[44px] border border-[#fde6d2] dark:border-slate-800 p-6 shadow-sm flex items-center justify-center select-none overflow-hidden transition-colors">
        <svg viewBox={`0 0 ${gridWidth} ${gridHeight}`} className="h-full overflow-visible touch-none">
          <g transform={`translate(${offset.x}, ${offset.y})`} style={{ transition: isDragging ? 'none' : 'transform 0.3s' }}>
            <g className="grid-structure">
              {[0, 1, 2, 3, 4].map(i => (
                <React.Fragment key={i}>
                  <line x1={i * cellSizeW} y1="0" x2={i * cellSizeW} y2={gridHeight} stroke="currentColor" className="text-orange-200 dark:text-orange-900/40" strokeWidth="1.5" />
                  <line x1="0" y1={i * cellSizeH} x2={gridWidth} y2={i * cellSizeH} stroke="currentColor" className="text-orange-200 dark:text-orange-900/40" strokeWidth="1.5" />
                </React.Fragment>
              ))}
            </g>

            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((signNum) => {
              const { r, c } = signToGrid[signNum];
              const planets = getPlanetsInSign(signNum);
              const isLagnaSign = signNum === lagnaSign;

              return (
                <g key={signNum} transform={`translate(${c * cellSizeW}, ${r * cellSizeH})`}>
                  {isLagnaSign && (
                    <path d={`M0 0 L${cellSizeW} ${cellSizeH}`} stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.3" />
                  )}
                  
                  <g transform={`translate(10, 10) scale(${scale})`} style={{ transformOrigin: 'top left' }}>
                    <rect width="40" height="40" fill="white" rx="10" className="dark:fill-slate-800 shadow-sm" fillOpacity={document.documentElement.classList.contains('dark') ? "0.9" : "0.6"} />
                    <text x="20" y="22" textAnchor="middle" alignmentBaseline="middle" fontSize="18" className="font-black fill-slate-700 dark:fill-slate-300">{signNum}</text>
                  </g>

                  <g transform={`translate(${cellSizeW - 35}, 10) scale(${scale})`} style={{ transformOrigin: 'top right' }}>
                    <foreignObject x="-25" y="0" width="25" height="25">
                       <ZodiacIcon sign={signNum} className="w-6 h-6 text-orange-300 dark:text-orange-900/40" />
                    </foreignObject>
                  </g>

                  <g transform={`translate(${cellSizeW / 2}, ${cellSizeH / 2}) scale(${scale})`}>
                    <g transform={`translate(0, -${(planets.length - 1) * 9})`}>
                      {planets.map((p, pIdx) => {
                        const isSelected = selectedPlanet?.planet === p.planet;
                        const isHovered = hoveredPlanet?.planet === p.planet;

                        return (
                          <g 
                            key={pIdx} transform={`translate(0, ${pIdx * 18})`}
                            onMouseEnter={() => handlePlanetEnter(p)} onMouseLeave={handlePlanetLeave}
                            onClick={(e) => { e.stopPropagation(); onSelectPlanet(p === selectedPlanet ? null : p); }}
                            className="cursor-pointer"
                          >
                            <circle r="16" fill="transparent" />
                            {isSelected && <circle r="14" fill="#f97316" fillOpacity="0.1" className="animate-pulse" />}
                            <text textAnchor="middle" fontSize="15" fill={p.planet === Planet.Lagna ? "#f97316" : (isSelected || isHovered) ? "#f97316" : p.isRetrograde ? "#f43f5e" : (document.documentElement.classList.contains('dark') ? "#f8fafc" : "#2d2621")} className={`font-black tracking-tighter transition-all duration-300 ${isHovered ? 'scale-125' : ''}`}>
                              {getPlanetCode(p.planet)}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {showLegend && (
          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-5 py-2.5 rounded-[24px] border border-white/50 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-4">
                <ZodiacIcon sign={lagnaSign} className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2d2621] dark:text-slate-200">Asc: {SIGN_NAMES[lagnaSign]}</span>
              </div>
              <button onClick={() => setShowKey(!showKey)} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">
                <InformationCircleIcon className="w-3.5 h-3.5" /> Chart Legend
              </button>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
               <ArrowsPointingOutIcon className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> Magnify Coordinates
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
