import React, { useState, useEffect } from 'react';
import { SingleKundliInput } from '../types';
import { MAHARASHTRA_CITIES, findCityCoordinates } from '../data/maharashtraCities';
import { User, Calendar, Clock, MapPin, Search, Sparkles, Navigation, AlertCircle } from 'lucide-react';

interface SingleKundliFormProps {
  onSubmit: (input: SingleKundliInput) => void;
  isLoading: boolean;
  initialValues?: Partial<SingleKundliInput>;
}

export const SingleKundliForm: React.FC<SingleKundliFormProps> = ({
  onSubmit,
  isLoading,
  initialValues,
}) => {
  const [fullName, setFullName] = useState(initialValues?.fullName || '');
  const [gender, setGender] = useState<'male' | 'female'>(initialValues?.gender || 'male');
  const [dob, setDob] = useState(initialValues?.dob || '1996-06-15');
  const [time, setTime] = useState(initialValues?.time || '08:30');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('24h');
  const [amPm, setAmPm] = useState<'AM' | 'PM'>('AM');
  const [isUnknownTime, setIsUnknownTime] = useState(false);

  // City & Location State
  const [citySearch, setCitySearch] = useState(initialValues?.city || 'छत्रपती संभाजीनगर');
  const [selectedCityName, setSelectedCityName] = useState(initialValues?.city || 'छत्रपती संभाजीनगर');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [latitude, setLatitude] = useState<number>(initialValues?.latitude || 19.8762);
  const [longitude, setLongitude] = useState<number>(initialValues?.longitude || 75.3433);
  const [timezone, setTimezone] = useState<number>(initialValues?.timezone || 5.5);
  const [showAdvancedCoords, setShowAdvancedCoords] = useState(false);

  // Validation Error State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter cities dynamically
  const filteredCities = MAHARASHTRA_CITIES.filter((c) =>
    c.nameMr.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.nameEn.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.districtMr.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Automatically update lat/lng when city changes
  const handleSelectCity = (cityObj: typeof MAHARASHTRA_CITIES[0]) => {
    setCitySearch(cityObj.nameMr);
    setSelectedCityName(cityObj.nameMr);
    setLatitude(cityObj.latitude);
    setLongitude(cityObj.longitude);
    setShowCityDropdown(false);
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCitySearch(val);
    setShowCityDropdown(true);

    const coords = findCityCoordinates(val);
    setLatitude(coords.latitude);
    setLongitude(coords.longitude);
    setSelectedCityName(coords.nameMr);
  };

  // Convert 12h time to 24h format string (HH:mm)
  const get24HourTime = (): string => {
    if (isUnknownTime) return '12:00';
    if (!time) return '12:00';

    if (timeFormat === '24h') {
      return time;
    }

    // 12h format
    const parts = time.split(':');
    let hours = parseInt(parts[0], 10) || 12;
    const minutes = parts[1] || '00';

    if (amPm === 'PM' && hours < 12) hours += 12;
    if (amPm === 'AM' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${minutes}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation 1: Required Full Name
    if (!fullName.trim()) {
      setErrorMsg('कृपया संपूर्ण नाव प्रविष्ट करा.');
      return;
    }

    // Validation 2: Required DOB
    if (!dob) {
      setErrorMsg('कृपया जन्मतारीख निवडा.');
      return;
    }

    // Validation 3: Check Future Date
    const selectedDate = new Date(dob);
    const today = new Date();
    if (selectedDate > today) {
      setErrorMsg('जन्मतारीख भविष्यातील असू शकत नाही. कृपया वैध जन्मतारीख प्रविष्ट करा.');
      return;
    }

    // Validation 4: Time check
    const formattedTime = get24HourTime();
    if (!isUnknownTime && !formattedTime) {
      setErrorMsg('कृपया अचूक जन्म वेळ प्रविष्ट करा.');
      return;
    }

    // Validation 5: City check
    if (!citySearch.trim()) {
      setErrorMsg('कृपया जन्म ठिकाण किंवा शहर प्रविष्ट करा.');
      return;
    }

    onSubmit({
      fullName: fullName.trim(),
      gender,
      dob,
      time: formattedTime,
      birthPlace: selectedCityName || citySearch,
      city: selectedCityName || citySearch,
      latitude,
      longitude,
      timezone,
    });
  };

  const maxDobDate = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 rounded-2xl p-4 md:p-6 border border-amber-200/80 shadow-md space-y-5">
      {/* Header */}
      <div className="text-center pb-3 border-b border-amber-200/60">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 text-[#800C1E] text-xs font-black mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>वैदिक जन्मपत्रिका फॉर्म (Kundli Birth Form)</span>
        </div>
        <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
          आपले जन्म तपशील प्रविष्ट करा
        </h3>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          अचूक जन्म वेळ व ठिकाण निवडून तुमची सविस्तर राशी, नक्षत्र व जन्मपत्रिका पहा
        </p>
      </div>

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="bg-rose-50 border-2 border-rose-300 text-rose-800 p-3.5 rounded-xl flex items-center gap-3 text-sm font-black animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input Group 1: Full Name & Gender */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Full Name */}
        <div className="md:col-span-2">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-[#800C1E]" />
            <span>संपूर्ण नाव (Full Name) *</span>
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="उदा. विजय ज्ञानेश्वर गीते"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#800C1E] focus:ring-2 focus:ring-[#800C1E]/20 text-slate-800 text-sm font-bold bg-white transition-all outline-none"
          />
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
            लिंग (Gender) *
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 ${
                gender === 'male'
                  ? 'bg-[#800C1E] text-white border-[#800C1E] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>👨</span>
              <span>पुरुष (Male)</span>
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 ${
                gender === 'female'
                  ? 'bg-[#800C1E] text-white border-[#800C1E] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>👩</span>
              <span>स्त्री (Female)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Input Group 2: DOB & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DOB */}
        <div>
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#800C1E]" />
            <span>जन्म तारीख (Date of Birth) *</span>
          </label>
          <input
            type="date"
            required
            max={maxDobDate}
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#800C1E] focus:ring-2 focus:ring-[#800C1E]/20 text-slate-800 text-sm font-bold bg-white transition-all outline-none"
          />
        </div>

        {/* Time of Birth */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#800C1E]" />
              <span>जन्म वेळ (Time of Birth) *</span>
            </label>
            <label className="text-xs text-amber-800 font-bold flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isUnknownTime}
                onChange={(e) => setIsUnknownTime(e.target.checked)}
                className="rounded text-[#800C1E] focus:ring-[#800C1E]"
              />
              <span>वेळ माहीत नाही</span>
            </label>
          </div>

          {!isUnknownTime ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#800C1E] focus:ring-2 focus:ring-[#800C1E]/20 text-slate-800 text-sm font-bold bg-white transition-all outline-none"
                />
                {timeFormat === '12h' && (
                  <select
                    value={amPm}
                    onChange={(e) => setAmPm(e.target.value as 'AM' | 'PM')}
                    className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  >
                    <option value="AM">AM (सकाळी/पहाटे)</option>
                    <option value="PM">PM (दुपारी/रात्री)</option>
                  </select>
                )}
              </div>
            </div>
          ) : (
            <div className="px-4 py-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs font-bold text-amber-800">
              मानक वेळ दोपहर १२:०० (12:00 PM) गृहीत धरली जाईल.
            </div>
          )}
        </div>
      </div>

      {/* Input Group 3: Birth City Autocomplete Search */}
      <div className="relative">
        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#800C1E]" />
          <span>जन्म ठिकाण / शहर (Birth Place / City) *</span>
        </label>

        <div className="relative">
          <input
            type="text"
            required
            value={citySearch}
            onChange={handleCityInputChange}
            onFocus={() => setShowCityDropdown(true)}
            placeholder="शहर किंवा जिल्हा शोधा (उदा. बीड, पुणे, नाशिक, संभाजीनगर)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#800C1E] focus:ring-2 focus:ring-[#800C1E]/20 text-slate-800 text-sm font-bold bg-white transition-all outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        {/* Autocomplete Dropdown List */}
        {showCityDropdown && filteredCities.length > 0 && (
          <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-amber-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
            {filteredCities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => handleSelectCity(city)}
                className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-amber-50 text-slate-800 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#800C1E]" />
                  <span>{city.nameMr} ({city.nameEn})</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {city.latitude}°N, {city.longitude}°E
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Lat/Lng/Timezone Toggle Drawer */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdvancedCoords(!showAdvancedCoords)}
          className="text-xs font-bold text-[#800C1E] hover:underline flex items-center gap-1"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>
            {showAdvancedCoords
              ? 'स्थान अक्षांश/रेखांश तपशील लपवा'
              : 'अद्ययावत स्थान / अक्षांश व रेखांश (Advanced Coordinates)'}
          </span>
        </button>

        {showAdvancedCoords && (
          <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">अक्षांश (Latitude)</label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 19.8762)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">रेखांश (Longitude)</label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 75.3433)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">टाइमझोन (GMT)</label>
              <input
                type="number"
                step="0.5"
                value={timezone}
                onChange={(e) => setTimezone(parseFloat(e.target.value) || 5.5)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-amber-200 hover:text-white font-black text-sm md:text-base shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>वैदिक जन्मपत्रिका तयार होत आहे...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            <span>वैदिक जन्मपत्रिका तयार करा (Generate Kundli Report)</span>
          </>
        )}
      </button>
    </form>
  );
};
