
import React, { useState, useEffect } from 'react';
import { UserAccount, LoginCredentials } from '../types';
import { storageService } from '../services/storageService';
import { 
  SparklesIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ClockIcon,
  FingerPrintIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface Props {
  onLogin: (creds: LoginCredentials) => void;
}

const LoginView: React.FC<Props> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [recentAccounts, setRecentAccounts] = useState<UserAccount[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  useEffect(() => {
    setRecentAccounts(storageService.getRecentAccounts());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      email: formData.email,
      password: formData.password,
      username: formData.username || formData.email.split('@')[0]
    });
  };

  const handleDemoLogin = () => {
    onLogin({
      email: 'demo@astroos.com',
      password: 'demo123',
      username: 'Demo User'
    });
  };

  const selectRecent = (acc: UserAccount) => {
    setFormData({
      ...formData,
      email: acc.email,
      username: acc.username
    });
    setIsLoginMode(true);
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center p-4 lg:p-10">
      <div className="max-w-[1100px] w-full bg-white rounded-[56px] shadow-2xl overflow-hidden border border-[#f1ebe6] flex flex-col lg:flex-row h-auto lg:h-[760px] animate-in fade-in zoom-in-95 duration-1000">
        
        {/* LEFT PANE: BRANDING & COSMIC ATMOSPHERE */}
        <div className="lg:w-[45%] bg-[#1e1b4b] relative p-12 lg:p-16 flex flex-col justify-between overflow-hidden">
           <div className="relative z-10">
              <div className="flex items-center gap-4 mb-12">
                 <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/30 pulse-effect">
                    <SparklesIcon className="w-8 h-8 text-white" />
                 </div>
                 <div>
                    <h1 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                      Astro<span className="text-orange-500"> Jyotish</span>
                    </h1>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Temporal Intelligence Suite</p>
                 </div>
              </div>
              <h2 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tighter mb-8">
                Your Life <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Decoded.</span>
              </h2>
              <p className="text-indigo-200 text-lg font-medium leading-relaxed max-w-sm opacity-90 italic">
                "Harness the ancient algorithms of Vedic astrology through a high-precision digital interface."
              </p>
           </div>

           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-5 p-5 bg-white/5 rounded-3xl border border-white/10 group transition-all hover:bg-white/10 cursor-default">
                 <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                    <CpuChipIcon className="w-7 h-7" />
                 </div>
                 <div>
                    <p className="text-white font-black text-sm uppercase tracking-widest">RAG Intelligence</p>
                    <p className="text-indigo-300 text-[10px] font-bold uppercase mt-0.5 tracking-tighter">Verified classical synthesis</p>
                 </div>
              </div>
              <div className="flex items-center gap-5 p-5 bg-white/5 rounded-3xl border border-white/10 group transition-all hover:bg-white/10 cursor-default">
                 <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <FingerPrintIcon className="w-7 h-7" />
                 </div>
                 <div>
                    <p className="text-white font-black text-sm uppercase tracking-widest">Private Engine</p>
                    <p className="text-indigo-300 text-[10px] font-bold uppercase mt-0.5 tracking-tighter">Encrypted birth-data vault</p>
                 </div>
              </div>
           </div>

           {/* DECORATIVE ELEMENTS */}
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        </div>

        {/* RIGHT PANE: FORM */}
        <div className="lg:w-[55%] p-10 lg:p-20 flex flex-col justify-center bg-white relative overflow-y-auto custom-scrollbar">
           <div className="mb-12">
              <h3 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">
                 {isLoginMode ? 'Reconnect' : 'Initiate'}
              </h3>
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] mt-3 flex items-center gap-2">
                 <div className="w-4 h-0.5 bg-orange-500 rounded-full" />
                 {isLoginMode ? 'Access your celestial vault' : 'Start your journey with the stars'}
              </p>
           </div>

           {/* RECENT ACCOUNTS SELECTOR */}
           {isLoginMode && recentAccounts.length > 0 && (
             <div className="mb-12">
               <div className="flex items-center justify-between mb-5">
                 <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-orange-400" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Sessions</p>
                 </div>
               </div>
               <div className="flex flex-wrap gap-4">
                 {recentAccounts.map((acc, i) => (
                   <button 
                    key={i}
                    onClick={() => selectRecent(acc)}
                    className="flex items-center gap-3 p-2.5 pr-5 bg-slate-50 border border-slate-100 rounded-[20px] hover:border-orange-200 hover:bg-orange-50 transition-all group active:scale-95"
                   >
                     <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ring-2 ring-slate-100 group-hover:ring-orange-100 transition-all">
                       <img src={acc.avatar} className="w-full h-full object-cover" alt={acc.username} />
                     </div>
                     <div className="text-left">
                        <span className="text-[11px] font-black text-slate-800 block leading-none mb-1">{acc.username}</span>
                        <span className="text-[9px] font-bold text-slate-400 truncate w-32 block">{acc.email}</span>
                     </div>
                   </button>
                 ))}
               </div>
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-6">
              {!isLoginMode && (
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Display Name</label>
                   <div className="relative group">
                      <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                      <input 
                        type="text" 
                        required
                        placeholder="Raghav Sanoriya"
                        className="w-full pl-14 pr-6 py-5 bg-[#fcf8f5] border-2 border-transparent focus:border-orange-200 focus:bg-white rounded-3xl outline-none text-base font-bold text-slate-700 transition-all shadow-inner"
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                      />
                   </div>
                </div>
              )}

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Identity</label>
                 <div className="relative group">
                    <EnvelopeIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      type="email" 
                      required
                      placeholder="raghav@emergent.sh"
                      className="w-full pl-14 pr-6 py-5 bg-[#fcf8f5] border-2 border-transparent focus:border-orange-200 focus:bg-white rounded-3xl outline-none text-base font-bold text-slate-700 transition-all shadow-inner"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Access Key</label>
                 <div className="relative group">
                    <LockClosedIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      className="w-full pl-14 pr-6 py-5 bg-[#fcf8f5] border-2 border-transparent focus:border-orange-200 focus:bg-white rounded-3xl outline-none text-base font-bold text-slate-700 transition-all shadow-inner"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                 </div>
              </div>

              <div className="pt-4 space-y-4">
                 <button 
                  type="submit"
                  className="w-full py-6 bg-[#2d2621] text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-slate-900/20 hover:bg-[#f97316] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 group"
                 >
                   {isLoginMode ? 'Analyze Destiny' : 'Begin Initiation'}
                   <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                 </button>
                 
                 <button 
                  type="button"
                  onClick={handleDemoLogin}
                  className="w-full py-5 bg-[#fffaf5] border-2 border-orange-100 text-[#f97316] rounded-[32px] font-black text-[11px] uppercase tracking-widest hover:bg-white hover:border-orange-500 transition-all flex items-center justify-center gap-3 active:scale-95"
                 >
                   <SparklesIcon className="w-5 h-5" />
                   Guest Access Mode
                 </button>
              </div>
           </form>

           <div className="mt-12 text-center">
              <p className="text-sm font-bold text-slate-400">
                 {isLoginMode ? "First time here?" : "Returning Seeker?"}{' '}
                 <button 
                   onClick={() => setIsLoginMode(!isLoginMode)}
                   className="text-orange-500 hover:text-orange-600 transition-colors font-black underline underline-offset-4 ml-1"
                 >
                    {isLoginMode ? 'Create Profile' : 'Enter Vault'}
                 </button>
              </p>
           </div>

           <div className="mt-10 lg:absolute lg:bottom-10 lg:left-0 lg:right-0 px-12 text-center opacity-40">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                 <ShieldCheckIcon className="w-4 h-4" /> End-to-End Encrypted Node 
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
