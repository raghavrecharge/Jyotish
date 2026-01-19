
import React, { useState, useRef } from 'react';
import { DivisionalChart, Planet, Sign, ChartPoint } from '../types';
import { SIGN_NAMES } from '../constants';
import { 
  SparklesIcon, 
  InformationCircleIcon, 
  XMarkIcon, 
  ArrowsPointingOutIcon,
  Square3Stack3DIcon,
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

export default function NorthIndianChart({ chart, selectedPlanet, onSelectPlanet, scale = 1, showLegend = true }: Props) {
  const [hoveredPlanet, setHoveredPlanet] = useState<ChartPoint | null>(null);
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const tooltipTimeout = useRef<number | null>(null);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const width = 600;
  const height = 450;
  const cx = width / 2;
  const cy = height / 2;
  const borderRadius = 32;

  const lagnaPoint = chart.points.find(p => p.planet === Planet.Lagna);
  const lagnaSign = lagnaPoint ? lagnaPoint.sign : Sign.Aries;

  const getSignForHouse = (houseNum: number): Sign => {
    return ((lagnaSign + houseNum - 2) % 12 + 1) as Sign;
  };

  const getPlanetsInHouse = (houseNum: number) => {
    return chart.points.filter(p => p.house === houseNum && p.planet !== Planet.Lagna);
  };

  const getPlanetCode = (p: Planet) => {
    switch(p) {
      case Planet.Sun: return 'Su';
      case Planet.Moon: return 'Mo';
      case Planet.Mars: return 'Ma';
      case Planet.Mercury: return 'Me';
      case Planet.Jupiter: return 'Ju';
      case Planet.Venus: return 'Ve';
      case Planet.Saturn: return 'Sa';
      case Planet.Rahu: return 'Ra';
      case Planet.Ketu: return 'Ke';
      default: return (p as string).substring(0, 2);
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

  const getHousePath = (h: number) => {
    switch(h) {
      case 1: return `M${cx} 0 L${cx * 1.5} ${cy / 2} L${cx} ${cy} L${cx / 2} ${cy / 2} Z`;
      case 4: return `M0 ${cy} L${cx / 2} ${cy / 2} L${cx} ${cy} L${cx / 2} ${cy * 1.5} Z`;
      case 7: return `M${cx} ${height} L${cx * 1.5} ${cy * 1.5} L${cx} ${cy} L${cx / 2} ${cy * 1.5} Z`;
      case 10: return `M${width} ${cy} L${cx * 1.5} ${cy / 2} L${cx} ${cy} L${cx * 1.5} ${cy * 1.5} Z`;
      case 2: return `M0 0 L${cx} 0 L${cx / 2} ${cy / 2} Z`;
      case 3: return `M0 0 L0 ${cy} L${cx / 2} ${cy / 2} Z`;
      case 5: return `M0 ${cy} L0 ${height} L${cx / 2} ${cy * 1.5} Z`;
      case 6: return `M0 ${height} L${cx} ${height} L${cx / 2} ${cy * 1.5} Z`;
      case 8: return `M${cx} ${height} L${width} ${height} L${cx * 1.5} ${cy * 1.5} Z`;
      case 9: return `M${width} ${height} L${width} ${cy} L${cx * 1.5} ${cy * 1.5} Z`;
      case 11: return `M${width} ${cy} L${width} 0 L${cx * 1.5} ${cy / 2} Z`;
      case 12: return `M${width} 0 L${cx} 0 L${cx * 1.5} ${cy / 2} Z`;
      default: return "";
    }
  };

  const houseCentroids = [
    { x: cx, y: cy / 2 },          // H1
    { x: cx / 2, y: cy / 6 },      // H2
    { x: cx / 6, y: cy / 2 },      // H3
    { x: cx / 2, y: cy },          // H4
    { x: cx / 6, y: cy * 1.5 },    // H5
    { x: cx / 2, y: cy * 1.83 },   // H6
    { x: cx, y: cy * 1.5 },        // H7
    { x: cx * 1.5, y: cy * 1.83 }, // H8
    { x: cx * 1.83, y: cy * 1.5 }, // H9
    { x: cx * 1.5, y: cy },        // H10
    { x: cx * 1.83, y: cy / 2 },   // H11
    { x: cx * 1.5, y: cy / 6 },    // H12
  ];

  const signPositions = [
    { x: cx, y: cy / 4.2 },         // H1
    { x: cx / 3.2, y: cy / 6 },      // H2
    { x: cx / 6, y: cy / 3.2 },      // H3
    { x: cx / 4.2, y: cy },         // H4
    { x: cx / 6, y: cy * 1.68 },   // H5
    { x: cx / 3.2, y: cy * 1.84 },     // H6
    { x: cx, y: cy * 1.76 },        // H7
    { x: cx * 1.68, y: cy * 1.84 },  // H8
    { x: cx * 1.84, y: cy * 1.68 },  // H9
    { x: cx * 1.76, y: cy },        // H10
    { x: cx * 1.84, y: cy / 3.2 },     // H11
    { x: cx * 1.68, y: cy / 6 },   // H12
  ];

  const getPlanetPos = (index: number, total: number) => {
    const cols = total > 4 ? 3 : 2;
    const col = index % cols;
    const row = Math.floor(index / cols);
    const spacing = 32;
    const offsetX = (col - (Math.min(total - row * cols, cols) - 1) / 2) * spacing;
    const offsetY = (row - (Math.ceil(total / cols) - 1) / 2) * spacing;
    return { x: offsetX, y: offsetY };
  };

  const handlePlanetEnter = (p: ChartPoint) => {
    if (tooltipTimeout.current) window.clearTimeout(tooltipTimeout.current);
    setHoveredPlanet(p);
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

  return (
    <div className="flex flex-col w-full items-center gap-4 relative overflow-hidden transition-colors" onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
      {hoveredPlanet && (
        <div className="fixed pointer-events-none z-[9999] transition-all duration-300 ease-out transform" style={{ left: mousePos.x + 20, top: mousePos.y + 20 }}>
          <div className="bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 shadow-2xl rounded-[32px] p-6 min-w-[340px] pointer-events-auto transition-colors">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black text-xl shadow-xl">
                {getPlanetCode(hoveredPlanet.planet)}
              </div>
              <div>
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] mb-0.5">Celestial Matrix</p>
                <h4 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{hoveredPlanet.planet}</h4>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-transparent dark:border-slate-800">
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">House</p>
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
                  <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 rounded text-[8px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">Soul Root</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                      <ZodiacIcon sign={calculateD9Sign(hoveredPlanet.sign, hoveredPlanet.degree)} className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-black text-slate-800 dark:text-slate-200 leading-none">
                      {SIGN_NAMES[calculateD9Sign(hoveredPlanet.sign, hoveredPlanet.degree)]}
                    </p>
                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-50 uppercase tracking-widest">
                      D9 Spiritual Varga
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

      <div className="relative w-full aspect-[4/3] bg-white dark:bg-slate-950 rounded-[44px] border border-orange-200 dark:border-orange-900/40 shadow-sm select-none p-4 transition-colors overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible touch-none">
          <defs>
            <clipPath id="chart-rounded-clip-ni">
              <rect x="0" y="0" width={width} height={height} rx={borderRadius} />
            </clipPath>
          </defs>

          <g transform={`translate(${offset.x}, ${offset.y})`} style={{ transition: isDragging ? 'none' : 'transform 0.3s' }}>
            <g className="chart-background" clipPath="url(#chart-rounded-clip-ni)">
              {houseCentroids.map((_, i) => {
                const houseNum = i + 1;
                const isActive = hoveredHouse === houseNum || hoveredPlanet?.house === houseNum || selectedPlanet?.house === houseNum;
                return (
                  <path 
                    key={`bg-${houseNum}`}
                    d={getHousePath(houseNum)} 
                    fill={isActive ? (document.documentElement.classList.contains('dark') ? "rgba(249, 115, 22, 0.04)" : "rgba(249, 115, 22, 0.035)") : "transparent"} 
                    className="transition-all duration-300" 
                  />
                );
              })}
              
              <line x1="0" y1="0" x2={width} y2={height} stroke="currentColor" className="text-orange-200 dark:text-orange-900/60" strokeWidth="2.5" />
              <line x1={width} y1="0" x2="0" y2={height} stroke="currentColor" className="text-orange-200 dark:text-orange-900/60" strokeWidth="2.5" />
              <path d={`M${cx} 0 L${width} ${cy} L${cx} ${height} L0 ${cy} Z`} fill="none" stroke="currentColor" className="text-orange-200 dark:text-orange-900/60" strokeWidth="3" />
            </g>

            <rect x="0" y="0" width={width} height={height} fill="none" stroke="currentColor" className="text-orange-200 dark:text-orange-900/60" strokeWidth="4" rx={borderRadius} pointerEvents="none" />

            {houseCentroids.map((center, i) => {
              const houseNum = i + 1;
              const signNum = getSignForHouse(houseNum);
              const planets = getPlanetsInHouse(houseNum);
              const numPos = signPositions[i];
              const isHouseActive = hoveredHouse === houseNum || hoveredPlanet?.house === houseNum || selectedPlanet?.house === houseNum;

              return (
                <g key={i} onMouseEnter={() => setHoveredHouse(houseNum)} onMouseLeave={() => setHoveredHouse(null)}>
                  <path d={getHousePath(houseNum)} fill="transparent" className="cursor-pointer" />
                  
                  <g transform={`translate(${numPos.x}, ${numPos.y})`}>
                    <text textAnchor="middle" alignmentBaseline="middle" fontSize="18" fill={isHouseActive ? "#f97316" : (document.documentElement.classList.contains('dark') ? "#c2410c" : "#fdba74")} className="font-black transition-all duration-300 pointer-events-none">
                      {signNum}
                    </text>
                  </g>

                  <g transform={`translate(${center.x}, ${center.y}) scale(${scale})`}>
                     {planets.map((p, pIdx) => {
                        const isSelected = selectedPlanet?.planet === p.planet;
                        const isHovered = hoveredPlanet?.planet === p.planet;
                        const pos = getPlanetPos(pIdx, planets.length);

                        return (
                          <g 
                            key={pIdx} transform={`translate(${pos.x}, ${pos.y})`}
                            onClick={(e) => { e.stopPropagation(); onSelectPlanet(p === selectedPlanet ? null : p); }}
                            onMouseEnter={() => handlePlanetEnter(p)} onMouseLeave={() => setHoveredPlanet(null)}
                            className="cursor-pointer transition-all"
                          >
                            <circle r="14" fill={isSelected ? "#f97316" : isHovered ? "rgba(249, 115, 22, 0.2)" : "transparent"} className="transition-all" />
                            <text textAnchor="middle" fontSize="14" fill={isSelected ? "white" : isHovered ? "#f97316" : p.isRetrograde ? "#f43f5e" : (document.documentElement.classList.contains('dark') ? "#f1f5f9" : "#334155")} className="font-black transition-all" style={{ dominantBaseline: 'middle' }}>
                              {getPlanetCode(p.planet)}
                            </text>
                          </g>
                        );
                     })}
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
        
        {showLegend && (
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-6 py-3 rounded-[24px] border border-orange-100 dark:border-slate-800 shadow-lg transition-colors">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Asc: {SIGN_NAMES[lagnaSign]}</span>
            <div className="flex items-center gap-3">
              <ArrowsPointingOutIcon className="w-4 h-4 text-orange-400 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Precision Matrix Sync</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
