
import React, { useState, useEffect, useRef } from 'react';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  ArrowPathIcon,
  GlobeAltIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { geminiService } from '../services/geminiService';

interface Props {
  onSelect: (data: { lat: number, lng: number, tz: string, fullAddress: string }) => void;
  placeholder?: string;
  className?: string;
  error?: string | null;
  initialValue?: string;
}

const LocationAutocomplete: React.FC<Props> = ({ onSelect, placeholder = "Search spatial coordinate...", className, error, initialValue = '' }) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (val: string) => {
    setQuery(val);
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);

    if (val.length >= 3) {
      setIsSearching(true);
      searchTimeout.current = window.setTimeout(async () => {
        try {
          const list = await geminiService.getLocationSuggestions(val);
          setSuggestions(list);
          setShowDropdown(list.length > 0);
        } catch (e) {
          console.error("Suggestion error:", e);
          setShowDropdown(false);
        } finally {
          setIsSearching(false);
        }
      }, 500);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = async (place: string) => {
    setQuery(place);
    setShowDropdown(false);
    setIsResolving(true);
    try {
      const resolved = await geminiService.resolveLocation(place);
      onSelect(resolved);
    } catch (e) {
      console.error("Resolution error:", e);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef} style={{ zIndex: 1000 }}>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
           {isResolving ? (
             <ArrowPathIcon className="w-5 h-5 text-indigo-500 animate-spin" />
           ) : isSearching ? (
             <div className="flex gap-0.5">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
             </div>
           ) : (
             <MagnifyingGlassIcon className="w-5 h-5 text-slate-300 dark:text-slate-700 group-focus-within:text-indigo-500 transition-colors" />
           )}
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          disabled={isResolving}
          autoComplete="off"
          className={`w-full pl-14 pr-12 py-5 bg-[#fcf8f5] dark:bg-slate-950 border-2 transition-all outline-none rounded-[28px] text-base font-bold text-slate-800 dark:text-slate-200 shadow-inner ${
            error ? 'border-rose-200 dark:border-rose-900/50' : 'border-transparent dark:border-slate-800 focus:border-indigo-200 dark:focus:border-indigo-900 focus:bg-white dark:focus:bg-slate-900'
          } ${isResolving ? 'opacity-70' : ''}`}
        />
        {query && !isResolving && (
          <button 
            type="button"
            onClick={() => { setQuery(''); setSuggestions([]); setShowDropdown(false); }}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 hover:text-rose-500 transition-colors"
          >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 border border-[#f1ebe6] dark:border-slate-800 rounded-[36px] shadow-2xl z-[1100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-xl transition-colors">
           <div className="p-3">
              <p className="px-5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800/50 mb-1">Celestial Directory Results</p>
              {suggestions.map((place, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSuggestion(place)}
                  className="w-full text-left px-5 py-5 rounded-[24px] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 group flex items-center gap-5 transition-all"
                >
                  <div className="w-11 h-11 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 dark:text-slate-700 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all shadow-sm border border-transparent dark:border-slate-800">
                     <MapPinIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                     <p className="text-sm font-black text-slate-700 dark:text-slate-200 group-hover:text-indigo-900 dark:group-hover:text-white transition-colors truncate">{place}</p>
                     <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-tighter">Verified Node Segment</p>
                  </div>
                  <CheckBadgeIcon className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
           </div>
        </div>
      )}

      {isSearching && !showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-3 p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[36px] shadow-2xl z-[1100] flex items-center justify-center gap-4 transition-colors">
           <GlobeAltIcon className="w-6 h-6 text-orange-400 animate-spin" />
           <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Querying Celestial Records...</span>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
