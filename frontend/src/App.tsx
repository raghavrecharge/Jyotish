
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChartBarIcon, 
  CalendarDaysIcon, 
  ChatBubbleBottomCenterTextIcon, 
  SparklesIcon, 
  UserCircleIcon, 
  Squares2X2Icon, 
  ClockIcon, 
  TableCellsIcon, 
  ScaleIcon, 
  HeartIcon, 
  BookOpenIcon, 
  CheckBadgeIcon, 
  InformationCircleIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  BoltIcon,
  SunIcon,
  MoonIcon,
  ExclamationCircleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  HomeIcon,
  XMarkIcon,
  PlusCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowsRightLeftIcon,
  Bars3Icon,
  MapPinIcon
} from '@heroicons/react/24/outline';

import { BirthData, DivisionalChart, DashaNode, UserProfile, YogaMatch, ChatMessage, Sign, Planet, TransitContext, PlannerData, ShadbalaData, CompatibilityData, Remedy, KBChunk, ServiceStatus, UserAccount, LoginCredentials, DashaPeriod } from './types';
import { astrologyService, VarshaphalaData, AshtakavargaData } from './services/astrologyService';
import { geminiService } from './services/geminiService';
import { apiService } from './services/apiService';
import DashasView from './components/DashasView';
import Align27Dashboard from './components/Align27Dashboard';
import TodayView from './components/TodayView';
import PlannerView from './components/PlannerView';
import StrengthView from './components/StrengthView';
import CompatibilityView from './components/CompatibilityView';
import RemediesView from './components/RemediesView';
import KnowledgeView from './components/KnowledgeView';
import AshtakavargaView from './components/AshtakavargaView';
import VarshaphalaView from './components/VarshaphalaView';
import ChatView from './components/ChatView';
import PanchangView from './components/PanchangView';
import BirthDataForm from './components/BirthDataForm';
import LoginView from './components/LoginView';
import ProfileView from './components/ProfileView';
import NatalChartView from './components/NatalChartView';
import { SIGN_NAMES } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('astro_theme') as 'light' | 'dark') || 'light';
  });
  
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('astro_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const [panchangLocation, setPanchangLocation] = useState<BirthData | null>(null);
  
  const profile = useMemo(() => 
    profiles.find(p => p.id === activeProfileId) || profiles[0] || null
  , [profiles, activeProfileId]);

  const [chart, setChart] = useState<DivisionalChart | null>(null);
  const [dashas, setDashas] = useState<DashaNode[]>([]);
  const [yogas, setYogas] = useState<YogaMatch[]>([]);
  const [avData, setAvData] = useState<AshtakavargaData | null>(null);
  const [todayData, setTodayData] = useState<TransitContext | null>(null);
  const [plannerData, setPlannerData] = useState<PlannerData | null>(null);
  const [shadbalaData, setShadbalaData] = useState<ShadbalaData[]>([]);
  const [compatibilityData, setCompatibilityData] = useState<CompatibilityData | null>(null);
  const [remediesData, setRemediesData] = useState<Remedy[]>([]);
  const [kbData, setKbData] = useState<KBChunk[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showInputForm, setShowInputForm] = useState(false);

  const [varshaYear, setVarshaYear] = useState<number>(new Date().getFullYear());
  const [varshaData, setVarshaData] = useState<VarshaphalaData | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // BOOT SEQUENCE
  useEffect(() => {
    const boot = async () => {
      try {
        const acc = await apiService.getAccount();
        if (acc) {
          setUserAccount(acc);
          setIsLoggedIn(true);
          const savedProfiles = await apiService.getProfiles();
          const activeId = await apiService.getActiveProfileId();
          setProfiles(savedProfiles);
          if (activeId) setActiveProfileId(activeId);
          else if (savedProfiles.length > 0) setActiveProfileId(savedProfiles[0].id);
        }
      } finally {
        setTimeout(() => setIsInitializing(false), 400);
      }
    };
    boot();
  }, []);

  // HYDRATION ON PROFILE CHANGE - Fetch data from backend APIs
  useEffect(() => {
    if (profile) {
      const hydrateProfileData = async () => {
        setIsSyncing(true);
        try {
          // Fetch all data from backend APIs in parallel
          const [chartBundle, dashasData, transitsData, align27Data, panchangData, shadbalaData, yogasData] = await Promise.all([
            apiService.getChartBundle(profile.id),
            apiService.getDashas(profile.id, 3),
            apiService.getTransitsToday(profile.id),
            apiService.getAlign27Today(profile.id),
            apiService.getPanchang(profile.id),
            apiService.getShadbala(profile.id),
            apiService.getYogas(profile.id)
          ]);
          
          // Transform backend chart data to frontend format
          if (chartBundle && chartBundle.d1) {
            const d1Chart = transformBackendChart(chartBundle.d1, 'D1');
            setChart(d1Chart);
            
            // Set ashtakavarga if available
            if (chartBundle.ashtakavarga) {
              setAvData(chartBundle.ashtakavarga);
            } else {
              setAvData(astrologyService.calculateAshtakavarga(d1Chart));
            }
          } else {
            // Fallback to local calculation if backend fails
            const d1 = astrologyService.calculateNatalChart(profile.birthData);
            setChart(d1);
            setAvData(astrologyService.calculateAshtakavarga(d1));
          }
          
          // Set dashas from backend or fallback
          if (dashasData && dashasData.tree) {
            setDashas(transformBackendDashas(dashasData.tree));
          } else {
            setDashas(astrologyService.getVimshottariDashas(profile.birthData, 3));
          }
          
          // Set today data from align27 or fallback
          const effectiveDailyLocation = panchangLocation || profile.birthData;
          if (align27Data) {
            setTodayData({
              panchang: panchangData || astrologyService.getTodayData(effectiveDailyLocation).panchang,
              score: align27Data.overall_score || 75,
              moments: align27Data.moments || [],
              rituals: align27Data.rituals || [],
              transits: transitsData || []
            });
          } else {
            setTodayData(astrologyService.getTodayData(effectiveDailyLocation));
          }
          
          setPlannerData(astrologyService.getPlannerData(effectiveDailyLocation));
          
          // Set shadbala and remedies
          if (shadbalaData) {
            setShadbalaData(shadbalaData);
            const remedies = await apiService.getRemedies(profile.id);
            setRemediesData(remedies || astrologyService.generateRemedies(shadbalaData, chart));
          } else {
            const sbData = astrologyService.calculateShadbala(profile.birthData);
            setShadbalaData(sbData);
            setRemediesData(astrologyService.generateRemedies(sbData, chart));
          }
          
          setKbData(astrologyService.getKnowledgeBase());
          
          // Set yogas from backend or fallback
          if (yogasData && yogasData.length > 0) {
            setYogas(yogasData);
          } else if (chart) {
            setYogas(astrologyService.detectYogas(chart));
          }
          
          // Varshaphala
          const varshaResponse = await apiService.getVarshaphala(profile.id, varshaYear);
          if (varshaResponse) {
            setVarshaData(varshaResponse);
          } else {
            setVarshaData(astrologyService.calculateVarshaphala(profile.birthData, varshaYear));
          }
          
        } catch (error) {
          console.error('Error hydrating profile data:', error);
          // Fallback to local calculations on error
          const d1 = astrologyService.calculateNatalChart(profile.birthData);
          setChart(d1);
          setDashas(astrologyService.getVimshottariDashas(profile.birthData, 3));
          setAvData(astrologyService.calculateAshtakavarga(d1));
          const effectiveDailyLocation = panchangLocation || profile.birthData;
          setTodayData(astrologyService.getTodayData(effectiveDailyLocation));
          setPlannerData(astrologyService.getPlannerData(effectiveDailyLocation));
          const sbData = astrologyService.calculateShadbala(profile.birthData);
          setShadbalaData(sbData);
          setRemediesData(astrologyService.generateRemedies(sbData, d1));
          setKbData(astrologyService.getKnowledgeBase());
          setYogas(astrologyService.detectYogas(d1));
          setVarshaData(astrologyService.calculateVarshaphala(profile.birthData, varshaYear));
        } finally {
          setIsSyncing(false);
        }
      };
      
      hydrateProfileData();
    }
  }, [profile, varshaYear, panchangLocation]);
  
  // Helper function to transform backend chart to frontend format
  const transformBackendChart = (backendChart: any, chartType: string): DivisionalChart => {
    return {
      type: chartType,
      name: chartType === 'D1' ? 'Rasi' : chartType,
      points: (backendChart.planets || []).map((p: any) => ({
        planet: p.name || p.planet,
        longitude: p.longitude || 0,
        sign: p.sign || 0,
        house: p.house || 1,
        retrograde: p.retrograde || false,
        nakshatra: p.nakshatra || ''
      })),
      houses: backendChart.houses || [],
      aspects: backendChart.aspects || []
    };
  };
  
  // Helper function to transform backend dashas
  const transformBackendDashas = (dashaTree: any[]): DashaPeriod[] => {
    return (dashaTree || []).map((d: any) => ({
      planet: d.lord || d.planet,
      start: new Date(d.start),
      end: new Date(d.end),
      level: d.level || 1,
      subPeriods: d.children ? transformBackendDashas(d.children) : []
    }));
  };

  const handleLogin = async (creds: LoginCredentials) => {
    setIsSyncing(true);
    try {
      const user = await apiService.login(creds);
      setUserAccount(user);
      setIsLoggedIn(true);
      const savedProfiles = await apiService.getProfiles();
      setProfiles(savedProfiles);
      if (savedProfiles.length > 0) {
        setActiveProfileId(savedProfiles[0].id);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    await apiService.logout();
    setIsLoggedIn(false);
    setUserAccount(null);
    setProfiles([]);
    setActiveProfileId(null);
    setChart(null);
    setPanchangLocation(null);
  };

  const handleSwitchProfile = async (id: string) => {
    setIsSyncing(true);
    await apiService.setActiveProfileId(id);
    setActiveProfileId(id);
    setShowProfileDropdown(false);
    setCompatibilityData(null); 
    setPanchangLocation(null); 
    setTimeout(() => setIsSyncing(false), 600);
  };

  const handleAddProfile = async (birthData: BirthData) => {
    if (!userAccount) return;
    setIsSyncing(true);
    try {
      const newProfile = await apiService.createProfile(birthData);
      setProfiles(prev => [...prev, newProfile]);
      setActiveProfileId(newProfile.id);
      await apiService.setActiveProfileId(newProfile.id);
      setShowInputForm(false);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdatePanchangLocation = (loc: { lat: number, lng: number, tz: string, fullAddress: string }) => {
    setIsSyncing(true);
    setPanchangLocation({
       name: loc.fullAddress,
       dob: new Date().toISOString().split('T')[0], 
       tob: '12:00', 
       lat: loc.lat,
       lng: loc.lng,
       tz: loc.tz
    });
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleCalculateCompatibility = async (partnerData: BirthData) => {
    if (!profile) return;
    setIsSyncing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const result = astrologyService.calculateCompatibility(profile.birthData, partnerData);
      setCompatibilityData(result);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!chart || !profile) return;
    const userMsg: ChatMessage = { role: 'user', content };
    setChatHistory(prev => [...prev, userMsg]);
    setIsChatLoading(true);
    try {
      const lagna = chart.points.find(p => p.planet === Planet.Lagna);
      const ctx = {
        lagna: lagna ? `${SIGN_NAMES[lagna.sign]}` : 'Unknown',
        planets: chart.points.map(p => ({ p: p.planet, s: SIGN_NAMES[p.sign], h: p.house })),
        activeDasha: dashas[0]?.planet || 'Unknown',
        yogas: yogas.slice(0, 2)
      };
      const response = await geminiService.chat([...chatHistory, userMsg], ctx);
      setChatHistory(prev => [...prev, response]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const navModules = [
    { section: 'CORE', items: [
      { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
      { id: 'panchang', label: 'Panchang', icon: SunIcon },
      { id: 'today', label: 'Gochar Transit', icon: ClockIcon },
      { id: 'planner', label: 'Daily Planner', icon: CalendarDaysIcon }
    ]},
    { section: 'ASTROLOGY', items: [
      { id: 'charts', label: 'Natal Matrix', icon: ChartBarIcon },
      { id: 'dashas', label: 'Vimshottari Dashas', icon: CalendarDaysIcon },
      { id: 'ashtakavarga', label: 'Ashtakavarga', icon: TableCellsIcon }
    ]},
    { section: 'ANALYSIS', items: [
      { id: 'strength', label: 'Planetary Strength', icon: ScaleIcon },
      { id: 'varshaphala', label: 'Annual Varshaphala', icon: SparklesIcon },
      { id: 'compatibility', label: 'Compatibility Matrix', icon: HeartIcon },
      { id: 'remedies', label: 'Karmic Remedies', icon: SparklesIcon }
    ]},
    { section: 'INTELLIGENCE', items: [
      { id: 'knowledge', label: 'Knowledge Hub', icon: BookOpenIcon },
      { id: 'chat', label: 'Vedic Oracle', icon: ChatBubbleBottomCenterTextIcon }
    ]},
    { section: 'ACCOUNT', items: [
      { id: 'profile', label: 'Identity Settings', icon: UserCircleIcon }
    ]}
  ];

  const getPageTitle = () => {
    for (const section of navModules) {
      const item = section.items.find(i => i.id === activeTab);
      if (item) return item.label;
    }
    return activeTab;
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-[#fdfcfb] dark:bg-slate-950 flex flex-col items-center justify-center space-y-6">
        <div className="relative">
           <div className="w-16 h-16 border-4 border-orange-100 dark:border-slate-800 border-t-orange-500 rounded-full animate-spin" />
           <SparklesIcon className="w-6 h-6 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Synchronizing Matrix</p>
      </div>
    );
  }

  if (!isLoggedIn) return <LoginView onLogin={handleLogin} />;

  return (
    <div className={`flex flex-col lg:flex-row h-screen bg-[#fdfcfb] dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition-colors duration-300`}>
      {isSyncing && (
        <div className="fixed inset-0 z-[9999] bg-white/60 dark:bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#f97316]/20 border-t-[#f97316] rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.3em]">Recalculating Ephemeris...</p>
        </div>
      )}

      {showInputForm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 lg:p-10 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500">
           <div className="relative w-full max-w-[1100px] animate-in zoom-in-95 duration-500">
              <button 
                onClick={() => setShowInputForm(false)} 
                className="absolute -top-12 right-0 p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all active:scale-90"
              >
                <XMarkIcon className="w-8 h-8" />
              </button>
              <BirthDataForm onCalculate={handleAddProfile} />
           </div>
        </div>
      )}

      <aside className={`hidden lg:flex ${isSidebarCollapsed ? 'w-[100px]' : 'w-[300px]'} bg-white dark:bg-slate-900 border-r border-[#f1ebe6] dark:border-slate-800 flex-col overflow-hidden transition-all duration-500 ease-in-out relative group`}>
        <div className={`p-6 flex items-center justify-between border-b border-[#f1ebe6] dark:border-slate-800 h-20`}>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
               <SparklesIcon className="w-6 h-6 text-white" />
             </div>
             <h1 className={`text-lg font-black text-slate-800 dark:text-white tracking-tight whitespace-nowrap overflow-hidden transition-all duration-500 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
               Astro<span className="text-orange-500"> Jyotish</span>
             </h1>
          </div>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-orange-500 rounded-xl transition-all active:scale-90"
          >
             {isSidebarCollapsed ? <ChevronDoubleRightIcon className="w-5 h-5" /> : <ChevronDoubleLeftIcon className="w-5 h-5" />}
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-10 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {navModules.map((group) => (
            <div key={group.section} className="space-y-2">
              <p className={`text-[9px] font-black text-slate-300 dark:text-slate-600 mb-3 px-4 tracking-[0.4em] uppercase transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                {group.section}
              </p>
              {group.items.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveTab(item.id)} 
                  className={`w-full flex items-center transition-all duration-300 rounded-[20px] interactive-element group/btn ${activeTab === item.id ? 'sidebar-active text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-[#fcf8f5] dark:hover:bg-slate-800 hover:text-orange-500'} ${isSidebarCollapsed ? 'justify-center py-4 px-0' : 'px-5 py-4'}`}
                  title={isSidebarCollapsed ? item.label : ''}
                >
                  <item.icon className={`w-5 h-5 shrink-0 group-hover/btn:scale-110 transition-transform ${activeTab === item.id ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  {!isSidebarCollapsed && <span className="text-sm font-black ml-4 tracking-tight">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-[#f1ebe6] dark:border-slate-800">
           <button onClick={handleLogout} className={`w-full flex items-center transition-all duration-300 rounded-[20px] ${isSidebarCollapsed ? 'justify-center py-4 px-0' : 'px-5 py-4'} text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-black`}>
              <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span className="text-sm ml-4 tracking-tight">Logout Matrix</span>}
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden pb-20 lg:pb-0 bg-[#fdfcfb] dark:bg-slate-950 transition-colors duration-300">
        <header className="h-16 lg:h-20 bg-white dark:bg-slate-900 border-b border-[#f1ebe6] dark:border-slate-800 px-4 lg:px-10 flex items-center justify-between sticky top-0 z-40 transition-colors">
          <div className="flex items-center gap-4">
             <div className="lg:hidden w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg"><SparklesIcon className="w-6 h-6" /></div>
             <div className="space-y-0.5">
                <h2 className="text-sm lg:text-base font-black text-slate-800 dark:text-white capitalize tracking-tight leading-none">
                   {getPageTitle()}
                </h2>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:block">Protocol Node: 00427-B</p>
             </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <button 
              onClick={toggleTheme}
              className="p-3 bg-[#fcf8f5] dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-orange-500 border border-[#f1ebe6] dark:border-slate-700 rounded-2xl transition-all active:scale-90"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
            
            {/* MULTI-PROFILE DROPDOWN WRAPPER */}
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)} 
                className="flex items-center gap-4 bg-white dark:bg-slate-800 border border-[#f1ebe6] dark:border-slate-700 rounded-2xl px-2 lg:px-5 py-2 interactive-element cursor-pointer group shadow-sm hover:shadow-md transition-all"
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-[14px] bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 overflow-hidden shadow-inner">
                    <img src={userAccount?.avatar} className="w-full h-full object-cover" />
                  </div>
                  {profile?.isVerified && <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-1 border-2 border-white dark:border-slate-800 shadow-sm"><CheckBadgeIcon className="w-3 h-3" /></div>}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase leading-none">{profile?.birthData.name || 'Anonymous'}</p>
                  <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5">Active Link</p>
                </div>
                <ChevronDownIcon className={`w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 transition-all ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </div>

              {showProfileDropdown && (
                <div className="absolute top-full right-0 mt-3 w-[320px] bg-white dark:bg-slate-900 border border-orange-50 dark:border-slate-800 rounded-[32px] shadow-2xl z-[100] animate-in zoom-in-95 duration-200 overflow-hidden">
                   <div className="p-3">
                      <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800 mb-2">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Linked Identities</span>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1">
                        {profiles.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleSwitchProfile(p.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group/item ${p.id === profile?.id ? 'bg-orange-50 dark:bg-orange-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                          >
                            <div className="flex items-center gap-4">
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-inner ${p.id === profile?.id ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                  {p.birthData.name.substring(0, 2).toUpperCase()}
                               </div>
                               <div className="text-left">
                                  <p className={`text-sm font-black ${p.id === profile?.id ? 'text-orange-900 dark:text-orange-300' : 'text-slate-700 dark:text-slate-200'}`}>{p.birthData.name}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(p.birthData.dob).getFullYear()}</p>
                               </div>
                            </div>
                            {p.id === profile?.id && <div className="w-2 h-2 rounded-full bg-orange-500 shadow-lg animate-pulse" />}
                          </button>
                        ))}
                      </div>
                      <div className="p-2 border-t border-slate-50 dark:border-slate-800 mt-2 space-y-1">
                        <button 
                          onClick={() => { setShowInputForm(true); setShowProfileDropdown(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest"
                        >
                          <PlusCircleIcon className="w-5 h-5" /> Add New Identity
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest"
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout Matrix
                        </button>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-12 custom-scrollbar">
          <div className="max-w-[1500px] mx-auto">
            {!profile && !showInputForm && (
              <div className="h-[65vh] flex flex-col items-center justify-center text-center space-y-8 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[64px] animate-in fade-in duration-1000">
                <div className="w-24 h-24 bg-orange-50 dark:bg-orange-950/20 rounded-[40px] flex items-center justify-center text-orange-500 shadow-inner"><SparklesIcon className="w-12 h-12" /></div>
                <div className="space-y-2">
                   <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">Identity Not Established</h2>
                   <p className="text-slate-400 dark:text-slate-500 font-bold max-w-sm">Synchronize your spatial-temporal coordinates to unlock the Vedic matrix.</p>
                </div>
                <button onClick={() => setShowInputForm(true)} className="px-12 py-5 bg-orange-500 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-orange-500/20 active:scale-95 transition-all">Initialize Matrix</button>
              </div>
            )}

            {profile && (
              <div className="space-y-12">
                {activeTab === 'dashboard' && (
                  <Align27Dashboard 
                    data={todayData} 
                    natalChart={chart || undefined}
                    userName={profile?.birthData.name} 
                    profiles={profiles}
                    onSwitchProfile={handleSwitchProfile}
                    onAddProfile={() => setShowInputForm(true)}
                  />
                )}
                {activeTab === 'panchang' && todayData && (
                  <PanchangView 
                    data={todayData.panchang} 
                    currentCity={panchangLocation?.name || profile.birthData.name}
                    onCityChange={handleUpdatePanchangLocation}
                  />
                )}
                {activeTab === 'today' && todayData && <TodayView data={todayData} />}
                {activeTab === 'planner' && plannerData && <PlannerView data={plannerData} />}
                {activeTab === 'charts' && chart && <NatalChartView natalChart={chart} birthData={profile.birthData} />}
                {activeTab === 'dashas' && <DashasView nodes={dashas} />}
                {activeTab === 'varshaphala' && varshaData && <VarshaphalaView data={varshaData} onYearChange={setVarshaYear} />}
                {activeTab === 'ashtakavarga' && avData && <AshtakavargaView data={avData} />}
                {activeTab === 'strength' && shadbalaData.length > 0 && <StrengthView data={shadbalaData} />}
                {activeTab === 'compatibility' && <CompatibilityView data={compatibilityData} onReset={() => setCompatibilityData(null)} onCalculate={handleCalculateCompatibility} />}
                {activeTab === 'remedies' && remediesData.length > 0 && <RemediesView data={remediesData} />}
                {activeTab === 'knowledge' && kbData.length > 0 && <KnowledgeView data={kbData} />}
                {activeTab === 'chat' && <ChatView messages={chatHistory} onSendMessage={handleSendMessage} isLoading={isChatLoading} />}
                {activeTab === 'profile' && (
                  <ProfileView 
                    profile={profile} 
                    profiles={profiles}
                    onSwitch={handleSwitchProfile}
                    onLogout={handleLogout} 
                    onAddProfile={() => setShowInputForm(true)}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around z-50 px-4 transition-colors">
           <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-orange-500 scale-110' : 'text-slate-400 dark:text-slate-500'} transition-all`}><HomeIcon className="w-6 h-6" /><span className="text-[8px] font-black uppercase tracking-widest">Home</span></button>
           <button onClick={() => setActiveTab('charts')} className={`flex flex-col items-center gap-1 ${activeTab === 'charts' ? 'text-orange-500 scale-110' : 'text-slate-400 dark:text-slate-500'} transition-all`}><GlobeAltIcon className="w-6 h-6" /><span className="text-[8px] font-black uppercase tracking-widest">Matrix</span></button>
           <button onClick={() => setIsMobileMoreOpen(true)} className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500"><Bars3Icon className="w-6 h-6" /><span className="text-[8px] font-black uppercase tracking-widest">Menu</span></button>
        </nav>
      </main>
    </div>
  );
};

export default App;
