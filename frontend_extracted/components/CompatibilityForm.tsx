
import React, { useState } from 'react';
import { BirthData } from '../types';
import { 
  HeartIcon, 
  CalendarDaysIcon, 
  ClockIcon, 
  SparklesIcon,
  UserIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import LocationAutocomplete from './LocationAutocomplete';

interface Props {
  onCalculate: (data: BirthData) => Promise<void>;
  partnerName?: string;
}

const CompatibilityForm: React.FC<Props> = ({ onCalculate }) => {
  const [formData, setFormData] = useState<BirthData>({
    name: '',
    dob: '',
    tob: '',
    lat: 28.6139,
    lng: 77.2090,
    tz: 'Asia/Kolkata'
  });
  
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationSelect = (data: { lat: number, lng: number, tz: string, fullAddress: string }) => {
    setFormData(prev => ({
      ...prev,
      lat: data.lat,
      lng: data.lng,
      tz: data.tz
    }));
    setResolvedAddress(data.fullAddress);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedAddress) {
      setError("Please search and select partner's birth location.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onCalculate(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[56px] border border-[#f1ebe6] dark:border-slate-800 p-10 lg:p-20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto transition-colors">
      <div className="text-center space-y-8 mb-16">
        <div className="w-24 h-24 bg-rose-50 dark:bg-rose-950/20 rounded-[36px] flex items-center justify-center text-rose-500 mx-auto shadow-inner border border-rose-100 dark:border-rose-900/30 group-hover:scale-105 transition-transform">
           <HeartIcon className="w-12 h-12" />
        </div>
        <div className="space-y-2">
           <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">Identity Sync Matrix</h2>
           <p className="text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">Initialize Partner Coordinates for Synastry Analysis</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {error && (
          <div className="md:col-span-2 p-5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-3xl text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <div className="md:col-span-2 space-y-3">
           <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Partner Entity Name</label>
           <div className="relative group">
              <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 dark:text-slate-700 group-focus-within:text-rose-500 transition-colors" />
              <input 
                type="text" 
                required
                className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-rose-200 dark:focus:border-rose-900/50 focus:bg-white dark:focus:bg-slate-900 rounded-[28px] outline-none text-base font-bold text-slate-800 dark:text-slate-200 transition-all shadow-inner"
                placeholder="Raghav S."
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
           </div>
        </div>

        <div className="space-y-3">
           <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Temporal Node: Date</label>
           <div className="relative group">
              <CalendarDaysIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 dark:text-slate-700 group-focus-within:text-rose-500 transition-colors" />
              <input 
                type="date" 
                required
                className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-rose-200 dark:focus:border-rose-900/50 focus:bg-white dark:focus:bg-slate-900 rounded-[28px] outline-none text-base font-bold text-slate-800 dark:text-slate-200 transition-all shadow-inner"
                value={formData.dob}
                onChange={e => setFormData({...formData, dob: e.target.value})}
              />
           </div>
        </div>

        <div className="space-y-3">
           <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Temporal Node: Time</label>
           <div className="relative group">
              <ClockIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 dark:text-slate-700 group-focus-within:text-rose-500 transition-colors" />
              <input 
                type="time" 
                required
                className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-rose-200 dark:focus:border-rose-900/50 focus:bg-white dark:focus:bg-slate-900 rounded-[28px] outline-none text-base font-bold text-slate-800 dark:text-slate-200 transition-all shadow-inner"
                value={formData.tob}
                onChange={e => setFormData({...formData, tob: e.target.value})}
              />
           </div>
        </div>

        <div className="md:col-span-2 space-y-3">
           <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Spatial Coordinate: Birth Hub</label>
           
           <LocationAutocomplete 
             onSelect={handleLocationSelect}
             placeholder="Search spatial-temporal hub..."
             className="w-full"
           />
           
           {resolvedAddress && (
              <div className="flex items-center justify-between px-6 py-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-3xl animate-in slide-in-from-top-1 mt-4">
                 <div className="flex items-center gap-4 overflow-hidden">
                    <ShieldCheckIcon className="w-5 h-5 text-rose-500 shrink-0" />
                    <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest truncate">{resolvedAddress}</span>
                 </div>
                 <span className="text-[10px] font-mono text-rose-400 dark:text-rose-500 font-black shrink-0 px-3 py-1 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-transparent dark:border-slate-800">
                    {formData.lat.toFixed(4)}° {formData.lng.toFixed(4)}°
                 </span>
              </div>
           )}
        </div>

        <div className="md:col-span-2 pt-10">
           <button 
             type="submit"
             disabled={isSubmitting || !resolvedAddress}
             className="w-full py-6 bg-rose-500 hover:bg-rose-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-rose-500/20 transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 group"
           >
              {isSubmitting ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <SparklesIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
              {isSubmitting ? 'Calibrating Soul Sync...' : 'Initiate Deep Synastry Analysis'}
           </button>
           <p className="text-center text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] mt-8">
             Classical Ashta Koota Multi-Layered Resonance Engine
           </p>
        </div>
      </form>
    </div>
  );
};

export default CompatibilityForm;
