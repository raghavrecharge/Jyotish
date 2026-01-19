
import React, { useState } from 'react';
import { BirthData } from '../types';
import { 
  SparklesIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { astrologyService } from '../services/astrologyService';
import LocationAutocomplete from './LocationAutocomplete';

interface Props {
  onCalculate: (data: BirthData) => Promise<void>;
  initialData?: BirthData | null;
}

const BirthDataForm: React.FC<Props> = ({ onCalculate, initialData }) => {
  const [formData, setFormData] = useState<BirthData>(initialData || {
    name: '',
    dob: '',
    tob: '',
    lat: 28.6139, 
    lng: 77.2090,
    tz: 'Asia/Kolkata'
  });
  
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(
    (formData.lat === 28.6139 && formData.lng === 77.2090) ? "New Delhi, Delhi, India" : null
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationSelect = (data: { lat: number, lng: number, tz: string, fullAddress: string }) => {
    setFormData(prev => ({
      ...prev,
      lat: data.lat,
      lng: data.lng,
      tz: data.tz
    }));
    setResolvedAddress(data.fullAddress);
    setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resolvedAddress) {
       setErrors(["Please select a birth location from the suggestion dropdown."]);
       return;
    }

    const validation = astrologyService.validateBirthData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setErrors([]);
    setIsSubmitting(true);
    try {
      await onCalculate({ ...formData, isVerified: true });
    } catch (err) {
      setErrors(["Cosmic synchronization failed. Please check your network."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-[#f1ebe6] dark:border-slate-800 p-8 lg:p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-700 max-w-4xl mx-auto overflow-hidden relative transition-colors">
      <div className="relative z-10">
        <div className="text-center space-y-4 mb-10">
          <div className="w-12 h-12 bg-[#fff7ed] dark:bg-orange-950/20 rounded-2xl flex items-center justify-center text-[#f97316] mx-auto border border-[#ffedd5] dark:border-orange-900/30">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-[#1e293b] dark:text-white tracking-tight leading-none">Initialize Your Matrix</h2>
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Enter precise birth coordinates for analysis</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {errors.length > 0 && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-rose-500 shrink-0" />
              <div className="space-y-1">
                <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Protocol Restriction</p>
                <ul className="text-[11px] font-bold text-rose-500 dark:text-rose-400 list-disc list-inside opacity-90">
                  {errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ROW 1: NAME, DATE, TIME */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Seeker Name</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Raghav S."
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-[#f8fafc] dark:bg-slate-950 border border-[#f1f5f9] dark:border-slate-800 focus:border-[#f97316] dark:focus:border-[#f97316] focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none text-sm font-bold text-slate-700 dark:text-slate-200 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Date of Birth</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <input 
                  type="date" 
                  required
                  value={formData.dob}
                  onChange={e => setFormData({...formData, dob: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-[#f8fafc] dark:bg-slate-950 border border-[#f1f5f9] dark:border-slate-800 focus:border-[#f97316] dark:focus:border-[#f97316] focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none text-sm font-bold text-slate-700 dark:text-slate-200 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Time of Birth</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <input 
                  type="time" 
                  required
                  value={formData.tob}
                  onChange={e => setFormData({...formData, tob: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-[#f8fafc] dark:bg-slate-950 border border-[#f1f5f9] dark:border-slate-800 focus:border-[#f97316] dark:focus:border-[#f97316] focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none text-sm font-bold text-slate-700 dark:text-slate-200 transition-all"
                />
              </div>
            </div>

            {/* ROW 2: SEARCH BIRTH LOCATION (PROMINENT) */}
            <div className="md:col-span-3 space-y-2 mt-4">
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Search Birth Location</label>
              <LocationAutocomplete 
                onSelect={handleLocationSelect}
                initialValue={resolvedAddress || ''}
                placeholder="Enter city to fetch precise coordinates..."
              />
            </div>

            {/* ROW 3: READ-ONLY COORDINATES (SMALLER) */}
            <div className="md:col-span-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Latitude</label>
                  <input 
                    type="text" 
                    readOnly
                    value={formData.lat.toFixed(4)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl text-[11px] font-black text-slate-500 dark:text-slate-600 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Longitude</label>
                  <input 
                    type="text" 
                    readOnly
                    value={formData.lng.toFixed(4)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl text-[11px] font-black text-slate-500 dark:text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col items-center gap-6">
            <button 
              type="submit"
              disabled={isSubmitting || !resolvedAddress}
              className="w-full py-5 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Calibrating...
                </>
              ) : (
                <>
                  Generate Blueprint <BoltIcon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                </>
              )}
            </button>
            
            <p className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] opacity-80">
              Siderial Zodiac • Lahiri Ayanamsa
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BirthDataForm;
