
import React from 'react';
import { UserProfile } from '../types';
import { 
  UserCircleIcon, 
  IdentificationIcon, 
  CalendarDaysIcon, 
  MapPinIcon, 
  CheckBadgeIcon, 
  SparklesIcon, 
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  ClockIcon,
  PlusCircleIcon,
  ArrowsRightLeftIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { SIGN_NAMES } from '../constants';

interface Props {
  profile: UserProfile;
  profiles: UserProfile[];
  onSwitch: (id: string) => void;
  onLogout: () => void;
  onAddProfile: () => void;
}

const ProfileView: React.FC<Props> = ({ profile, profiles, onSwitch, onLogout, onAddProfile }) => {
  const account = profile.account;
  const birth = profile.birthData;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24 transition-colors">
      
      {/* 1. PROFILE HEADER CARD */}
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-[#f1ebe6] dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 transition-colors">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
           <div className="relative group">
              <div className="w-32 h-32 rounded-[40px] border-4 border-[#fcf8f5] dark:border-slate-800 shadow-xl overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                 <img src={account.avatar} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Avatar" />
              </div>
              {profile.isVerified && (
                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full p-2 border-4 border-white dark:border-slate-900 shadow-lg">
                   <CheckBadgeIcon className="w-5 h-5" />
                </div>
              )}
           </div>
           <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                 <h2 className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">{account.username}</h2>
                 <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-full text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Master ID Active</span>
              </div>
              <p className="text-slate-400 dark:text-slate-500 font-bold text-lg">{account.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-4 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-4">
                 <span className="flex items-center gap-2"><ClockIcon className="w-4 h-4 text-orange-400" /> Member since {new Date(account.joinedDate).getFullYear()}</span>
                 <span className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                 <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500"><ShieldCheckIcon className="w-4 h-4" /> Account Verified</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <button onClick={onLogout} className="px-8 py-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center gap-3 active:scale-95">
              <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
           </button>
        </div>
      </div>

      {/* 2. MULTI-PROFILE IDENTITIES */}
      <div className="space-y-6">
         <div className="flex items-center justify-between px-6">
            <div className="space-y-1">
               <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Cosmic Identities</h3>
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">Manage multiple chart profiles</p>
            </div>
            <button 
              onClick={onAddProfile}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
            >
               <PlusCircleIcon className="w-4 h-4" /> Add Profile
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {profiles.map((p) => (
              <div 
                key={p.id} 
                onClick={() => p.id !== profile.id && onSwitch(p.id)}
                className={`group p-8 rounded-[40px] border-2 transition-all duration-500 cursor-pointer relative overflow-hidden h-full ${
                  p.id === profile.id 
                    ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 shadow-xl' 
                    : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 hover:border-orange-100 dark:hover:border-orange-900/50 hover:shadow-lg'
                }`}
              >
                 <div className="flex justify-between items-start mb-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner transition-transform group-hover:scale-110 ${p.id === profile.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-600'}`}>
                       {p.birthData.name.substring(0, 2).toUpperCase()}
                    </div>
                    {p.id === profile.id && (
                       <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">Primary Active</span>
                    )}
                 </div>

                 <div className="space-y-1 relative z-10">
                    <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight truncate">{p.birthData.name}</h4>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                       {new Date(p.birthData.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                 </div>

                 <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-slate-400 dark:text-slate-600 flex items-center gap-2"><MapPinIcon className="w-4 h-4" /> {p.birthData.lat.toFixed(1)}°, {p.birthData.lng.toFixed(1)}°</span>
                    <span className={p.id === profile.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-700 group-hover:text-orange-500'}>
                       {p.id === profile.id ? 'Synchronized' : 'Tap to Switch'}
                    </span>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* 3. ACTIVE COORDINATES BENTO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        <div className="lg:col-span-7 space-y-8">
           <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-[#f1ebe6] dark:border-slate-800 shadow-sm relative overflow-hidden group transition-colors">
              <div className="flex items-center justify-between mb-12">
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Mapping Matrix</h3>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">Coordinates for active chart</p>
                 </div>
                 <div className="w-14 h-14 bg-orange-50 dark:bg-orange-950/40 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
                    <GlobeAltIcon className="w-8 h-8" />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <div className="flex items-center gap-6 group/item">
                       <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600">
                          <CalendarDaysIcon className="w-7 h-7" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-widest">Birth Date</p>
                          <p className="text-xl font-black text-slate-800 dark:text-slate-200">{new Date(birth.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-8">
                    <div className="flex items-center gap-6 group/item">
                       <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600">
                          <MapPinIcon className="w-7 h-7" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-widest">Longitude</p>
                          <p className="text-xl font-black text-slate-800 dark:text-slate-200">{birth.lng.toFixed(4)}° E</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
           <div className="bg-[#1e1b4b] dark:bg-black p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden h-full flex flex-col transition-colors border border-transparent dark:border-slate-800">
              <div className="flex items-center justify-between mb-12 relative z-10">
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black">Protocols</h3>
                    <p className="text-indigo-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Engine Configuration</p>
                 </div>
                 <Cog6ToothIcon className="w-10 h-10 text-orange-400" />
              </div>

              <div className="space-y-6 relative z-10 flex-1">
                 <div className="flex justify-between items-center p-6 bg-white/5 dark:bg-slate-900/50 border border-white/10 dark:border-slate-800 rounded-3xl group cursor-pointer hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                       <SparklesIcon className="w-6 h-6 text-orange-400" />
                       <div>
                          <p className="text-sm font-black">Ayanamsa Model</p>
                          <p className="text-[10px] text-indigo-300 dark:text-slate-500 font-bold uppercase tracking-widest">{profile.preferences.ayanamsa}</p>
                       </div>
                    </div>
                    <ArrowPathIcon className="w-5 h-5 text-white/40 group-hover:rotate-180 transition-transform duration-500" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
