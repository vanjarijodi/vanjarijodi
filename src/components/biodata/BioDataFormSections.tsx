import React from 'react';
import {
  User,
  Home,
  Sparkles,
  Phone,
  Camera,
  Upload,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { BIODATA_I18N, BiodataLanguage } from './BioDataTranslations';
import { BLESSING_PRESETS, BLESSING_PRESETS_EN, FIELD_PRESETS, FIELD_PRESETS_EN, PresetFieldOption } from './BioDataPresets';
import { BioDataCustomFieldItem } from './BioDataCardView';

export interface BioDataFormSectionData {
  headerBlessing: string;
  fullName: string;
  gender: 'bride' | 'groom';
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  height: string;
  complexion: string;
  bloodGroup: string;
  education: string;
  jobTitle: string;
  businessTitle: string;
  income: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  uncleName?: string;
  brothers: string;
  sisters: string;
  nativePlace: string;
  mamaName: string;
  relatives: string;
  rashi: string;
  nakshatra: string;
  gotra: string;
  devak: string;
  nadi: string;
  mangal: string;
  mobile: string;
  whatsapp?: string;
  password?: string;
  address: string;
  expectations: string;
  candidatePhotoUrl?: string;
  customFields: BioDataCustomFieldItem[];
}

interface BioDataFormSectionsProps {
  formData: BioDataFormSectionData;
  onChange: (key: keyof BioDataFormSectionData, val: any) => void;
  onAddCustomField: (section: 'personal' | 'astrology' | 'family' | 'contact', defaultLabel?: string, defaultValue?: string) => void;
  onUpdateCustomField: (id: string, key: 'label' | 'value', val: string) => void;
  onRemoveCustomField: (id: string) => void;
  language: BiodataLanguage;
  activeSection: 'personal' | 'family' | 'astrology' | 'contact' | 'header_photo' | 'all';
  setActiveSection: (sec: 'personal' | 'family' | 'astrology' | 'contact' | 'header_photo' | 'all') => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploadingPhoto: boolean;
  onGoToPreview: () => void;
}

export const BioDataFormSections: React.FC<BioDataFormSectionsProps> = ({
  formData,
  onChange,
  onAddCustomField,
  onUpdateCustomField,
  onRemoveCustomField,
  language,
  activeSection,
  setActiveSection,
  onPhotoUpload,
  isUploadingPhoto,
  onGoToPreview,
}) => {
  const t = BIODATA_I18N[language];
  const blessingPresets = language === 'en' ? BLESSING_PRESETS_EN : BLESSING_PRESETS;
  const fieldPresets = language === 'en' ? FIELD_PRESETS_EN : FIELD_PRESETS;

  const handleAddPreset = (preset: PresetFieldOption) => {
    onAddCustomField(preset.section, preset.label, '');
  };

  const sectionsList: Array<{ id: 'personal' | 'family' | 'astrology' | 'contact' | 'header_photo'; label: string; icon: any }> = [
    { id: 'personal', label: t.secPersonal, icon: User },
    { id: 'family', label: t.secFamily, icon: Home },
    { id: 'astrology', label: t.secAstrology, icon: Sparkles },
    { id: 'contact', label: t.secContact, icon: Phone },
    { id: 'header_photo', label: t.secBlessingPhoto, icon: Camera },
  ];

  const currentIdx = sectionsList.findIndex((s) => s.id === activeSection);

  const handleNextSection = () => {
    if (currentIdx >= 0 && currentIdx < sectionsList.length - 1) {
      setActiveSection(sectionsList[currentIdx + 1].id);
    } else {
      onGoToPreview();
    }
  };

  const handlePrevSection = () => {
    if (currentIdx > 0) {
      setActiveSection(sectionsList[currentIdx - 1].id);
    }
  };

  return (
    <div className="space-y-3">
      {/* Compact Section Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold shrink-0">
        {sectionsList.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id || activeSection === 'all';
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap text-[11px] ${
                activeSection === sec.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setActiveSection('all')}
          className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer text-[10px] font-bold shrink-0 ${
            activeSection === 'all'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          {t.secAll}
        </button>
      </div>

      {/* SECTION 1: Personal Details */}
      {(activeSection === 'personal' || activeSection === 'all') && (
        <div className="p-3.5 sm:p-4 bg-slate-900/95 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h3 className="font-black text-amber-400 text-xs flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-400" />
              <span>{t.secPersonal}</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">{formData.gender === 'bride' ? t.genderBride : t.genderGroom}</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="col-span-2 sm:col-span-1 space-y-1">
              <label className="text-slate-400 font-bold text-[11px]">{t.genderLabel}</label>
              <select
                value={formData.gender}
                onChange={(e) => onChange('gender', e.target.value as 'bride' | 'groom')}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs"
              >
                <option value="groom">{t.genderGroom}</option>
                <option value="bride">{t.genderBride}</option>
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1">
              <label className="text-slate-400 font-bold text-[11px]">{t.fullNameLabel}</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => onChange('fullName', e.target.value)}
                placeholder={t.fullNamePlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-amber-300 font-black text-xs outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.dobLabel}</label>
              <input
                type="text"
                value={formData.birthDate}
                onChange={(e) => onChange('birthDate', e.target.value)}
                placeholder={t.dobPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.birthTimeLabel}</label>
              <input
                type="text"
                value={formData.birthTime}
                onChange={(e) => onChange('birthTime', e.target.value)}
                placeholder={t.birthTimePlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.birthPlaceLabel}</label>
              <input
                type="text"
                value={formData.birthPlace}
                onChange={(e) => onChange('birthPlace', e.target.value)}
                placeholder={t.birthPlacePlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.heightLabel}</label>
              <input
                type="text"
                value={formData.height}
                onChange={(e) => onChange('height', e.target.value)}
                placeholder={t.heightPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.complexionLabel}</label>
              <input
                type="text"
                value={formData.complexion}
                onChange={(e) => onChange('complexion', e.target.value)}
                placeholder={t.complexionPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.bloodGroupLabel}</label>
              <input
                type="text"
                value={formData.bloodGroup}
                onChange={(e) => onChange('bloodGroup', e.target.value)}
                placeholder={t.bloodGroupPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-slate-400 font-bold text-[11px]">{t.educationLabel}</label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => onChange('education', e.target.value)}
                placeholder={t.educationPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.jobLabel}</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => onChange('jobTitle', e.target.value)}
                placeholder={t.jobPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.businessLabel}</label>
              <input
                type="text"
                value={formData.businessTitle}
                onChange={(e) => onChange('businessTitle', e.target.value)}
                placeholder={t.businessPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.incomeLabel}</label>
              <input
                type="text"
                value={formData.income}
                onChange={(e) => onChange('income', e.target.value)}
                placeholder={t.incomePlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          {/* Custom Fields in Personal */}
          {formData.customFields.filter((f) => f.section === 'personal').map((field) => (
            <div key={field.id} className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 relative group">
              <button
                type="button"
                onClick={() => onRemoveCustomField(field.id)}
                className="absolute -top-2 -right-2 p-1 bg-rose-700 hover:bg-rose-600 text-white rounded-full shadow cursor-pointer"
                title="Remove"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdateCustomField(field.id, 'label', e.target.value)}
                placeholder={t.fieldName}
                className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) => onUpdateCustomField(field.id, 'value', e.target.value)}
                placeholder={t.fieldValue}
                className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
              />
            </div>
          ))}

          {/* Quick Preset Buttons for Personal */}
          <div className="pt-1 flex flex-wrap items-center gap-1.5">
            {fieldPresets.filter((p) => p.section === 'personal').map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAddPreset(p)}
                className="px-2 py-0.5 bg-slate-950 hover:bg-amber-950/40 text-amber-300 border border-amber-500/20 rounded-lg text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>{p.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => onAddCustomField('personal')}
              className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-lg text-[10px] font-bold hover:bg-amber-500/30 flex items-center gap-0.5 cursor-pointer border border-amber-500/30"
            >
              <Plus className="w-3 h-3" />
              <span>{t.addNewField}</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: Family Details */}
      {(activeSection === 'family' || activeSection === 'all') && (
        <div className="p-3.5 sm:p-4 bg-slate-900/95 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h3 className="font-black text-amber-400 text-xs flex items-center gap-1.5">
              <Home className="w-4 h-4 text-amber-400" />
              <span>{t.secFamily}</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="col-span-2 sm:col-span-1 space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.fatherNameLabel}</label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => onChange('fatherName', e.target.value)}
                placeholder={t.fatherNamePlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.fatherOccupationLabel}</label>
              <input
                type="text"
                value={formData.fatherOccupation}
                onChange={(e) => onChange('fatherOccupation', e.target.value)}
                placeholder={t.fatherOccupationPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.motherNameLabel}</label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => onChange('motherName', e.target.value)}
                placeholder={t.motherNamePlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.uncleNameLabel}</label>
              <input
                type="text"
                value={formData.uncleName || ''}
                onChange={(e) => onChange('uncleName', e.target.value)}
                placeholder={t.uncleNamePlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.brothersLabel}</label>
              <input
                type="text"
                value={formData.brothers}
                onChange={(e) => onChange('brothers', e.target.value)}
                placeholder={t.brothersPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.sistersLabel}</label>
              <input
                type="text"
                value={formData.sisters}
                onChange={(e) => onChange('sisters', e.target.value)}
                placeholder={t.sistersPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.mamaNameLabel}</label>
              <input
                type="text"
                value={formData.mamaName}
                onChange={(e) => onChange('mamaName', e.target.value)}
                placeholder={t.mamaNamePlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.relativesLabel}</label>
              <input
                type="text"
                value={formData.relatives}
                onChange={(e) => onChange('relatives', e.target.value)}
                placeholder={t.relativesPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          {/* Custom Fields in Family */}
          {formData.customFields.filter((f) => f.section === 'family').map((field) => (
            <div key={field.id} className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 relative group">
              <button
                type="button"
                onClick={() => onRemoveCustomField(field.id)}
                className="absolute -top-2 -right-2 p-1 bg-rose-700 hover:bg-rose-600 text-white rounded-full shadow cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdateCustomField(field.id, 'label', e.target.value)}
                placeholder={t.fieldName}
                className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) => onUpdateCustomField(field.id, 'value', e.target.value)}
                placeholder={t.fieldValue}
                className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
              />
            </div>
          ))}

          {/* Presets for Family */}
          <div className="pt-1 flex flex-wrap items-center gap-1.5">
            {fieldPresets.filter((p) => p.section === 'family').map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAddPreset(p)}
                className="px-2 py-0.5 bg-slate-950 hover:bg-amber-950/40 text-amber-300 border border-amber-500/20 rounded-lg text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>{p.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => onAddCustomField('family')}
              className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-lg text-[10px] font-bold hover:bg-amber-500/30 flex items-center gap-0.5 cursor-pointer border border-amber-500/30"
            >
              <Plus className="w-3 h-3" />
              <span>{t.addNewField}</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: Kundali / Astrology */}
      {(activeSection === 'astrology' || activeSection === 'all') && (
        <div className="p-3.5 sm:p-4 bg-slate-900/95 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h3 className="font-black text-amber-400 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t.secAstrology}</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.rashiLabel}</label>
              <input
                type="text"
                value={formData.rashi}
                onChange={(e) => onChange('rashi', e.target.value)}
                placeholder={t.rashiPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.nakshatraLabel}</label>
              <input
                type="text"
                value={formData.nakshatra}
                onChange={(e) => onChange('nakshatra', e.target.value)}
                placeholder={t.nakshatraPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.gotraLabel}</label>
              <input
                type="text"
                value={formData.gotra}
                onChange={(e) => onChange('gotra', e.target.value)}
                placeholder={t.gotraPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.devakLabel}</label>
              <input
                type="text"
                value={formData.devak}
                onChange={(e) => onChange('devak', e.target.value)}
                placeholder={t.devakPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.nadiLabel}</label>
              <input
                type="text"
                value={formData.nadi}
                onChange={(e) => onChange('nadi', e.target.value)}
                placeholder={t.nadiPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.mangalLabel}</label>
              <input
                type="text"
                value={formData.mangal}
                onChange={(e) => onChange('mangal', e.target.value)}
                placeholder={t.mangalPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          {/* Custom Fields in Astrology */}
          {formData.customFields.filter((f) => f.section === 'astrology').map((field) => (
            <div key={field.id} className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 relative group">
              <button
                type="button"
                onClick={() => onRemoveCustomField(field.id)}
                className="absolute -top-2 -right-2 p-1 bg-rose-700 hover:bg-rose-600 text-white rounded-full shadow cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdateCustomField(field.id, 'label', e.target.value)}
                placeholder={t.fieldName}
                className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) => onUpdateCustomField(field.id, 'value', e.target.value)}
                placeholder={t.fieldValue}
                className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
              />
            </div>
          ))}

          {/* Presets for Astrology */}
          <div className="pt-1 flex flex-wrap items-center gap-1.5">
            {fieldPresets.filter((p) => p.section === 'astrology').map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAddPreset(p)}
                className="px-2 py-0.5 bg-slate-950 hover:bg-amber-950/40 text-amber-300 border border-amber-500/20 rounded-lg text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>{p.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => onAddCustomField('astrology')}
              className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-lg text-[10px] font-bold hover:bg-amber-500/30 flex items-center gap-0.5 cursor-pointer border border-amber-500/30"
            >
              <Plus className="w-3 h-3" />
              <span>{t.addNewField}</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 4: Contact Details */}
      {(activeSection === 'contact' || activeSection === 'all') && (
        <div className="p-3.5 sm:p-4 bg-slate-900/95 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h3 className="font-black text-amber-400 text-xs flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>{t.secContact}</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold text-[11px]">{t.mobileLabel}</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => onChange('mobile', e.target.value)}
                placeholder={t.mobilePlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-amber-300 font-bold text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.nativePlaceLabel}</label>
              <input
                type="text"
                value={formData.nativePlace}
                onChange={(e) => onChange('nativePlace', e.target.value)}
                placeholder={t.nativePlacePlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.addressLabel}</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => onChange('address', e.target.value)}
                placeholder={t.addressPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-slate-400 font-medium text-[11px]">{t.expectationsLabel}</label>
              <input
                type="text"
                value={formData.expectations}
                onChange={(e) => onChange('expectations', e.target.value)}
                placeholder={t.expectationsPlaceholder}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            {/* Account Password & Instant Live Profile Setup */}
            <div className="col-span-2 p-3 bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/40 border-2 border-amber-400/60 rounded-xl space-y-2 mt-1">
              <div className="flex items-center justify-between">
                <label className="text-amber-300 font-black text-xs flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>🔐 खात्याचा पासवर्ड सेट करा (Set Account Password):</span>
                </label>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>थेट प्रोफाईल Live होईल</span>
                </span>
              </div>
              <input
                type="text"
                value={formData.password || ''}
                onChange={(e) => onChange('password', e.target.value)}
                placeholder="पासवर्ड टाका (उदा. vanjari@123)"
                className="w-full p-2.5 bg-slate-950 border border-amber-400/60 rounded-lg text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
              />
              <p className="text-[10px] text-amber-200/80 leading-relaxed">
                हा पासवर्ड वापरून तुम्ही भविष्यात पुन्हा लॉगिन करू शकता. बायोडाटा सेव्ह होताच तुमची प्रोफाईल थेट लाईव्ह (Live) होईल आणि तुम्हाला सर्व सदस्यांचे फोटो आणि आडनाव लगेच दिसतील!
              </p>
            </div>
          </div>

          {/* Custom Fields in Contact */}
          {formData.customFields.filter((f) => f.section === 'contact').map((field) => (
            <div key={field.id} className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 relative group">
              <button
                type="button"
                onClick={() => onRemoveCustomField(field.id)}
                className="absolute -top-2 -right-2 p-1 bg-rose-700 hover:bg-rose-600 text-white rounded-full shadow cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdateCustomField(field.id, 'label', e.target.value)}
                placeholder={t.fieldName}
                className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) => onUpdateCustomField(field.id, 'value', e.target.value)}
                placeholder={t.fieldValue}
                className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
              />
            </div>
          ))}

          {/* Presets for Contact */}
          <div className="pt-1 flex flex-wrap items-center gap-1.5">
            {fieldPresets.filter((p) => p.section === 'contact').map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAddPreset(p)}
                className="px-2 py-0.5 bg-slate-950 hover:bg-amber-950/40 text-amber-300 border border-amber-500/20 rounded-lg text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>{p.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => onAddCustomField('contact')}
              className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-lg text-[10px] font-bold hover:bg-amber-500/30 flex items-center gap-0.5 cursor-pointer border border-amber-500/30"
            >
              <Plus className="w-3 h-3" />
              <span>{t.addNewField}</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 5: Header Blessing & Photo Upload */}
      {(activeSection === 'header_photo' || activeSection === 'all') && (
        <div className="p-3.5 sm:p-4 bg-slate-900/95 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h3 className="font-black text-amber-400 text-xs flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-amber-400" />
              <span>{t.secBlessingPhoto}</span>
            </h3>
          </div>

          {/* Candidate Photo */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <label className="font-bold text-amber-300 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.photoLabel}</span>
              </span>
              {formData.candidatePhotoUrl && (
                <span className="text-emerald-400 text-[10px] font-bold">{t.photoUploaded}</span>
              )}
            </label>

            {formData.candidatePhotoUrl ? (
              <div className="flex items-center justify-between p-2 bg-slate-900 rounded-xl border border-emerald-500/40">
                <div className="flex items-center gap-3">
                  <img
                    src={formData.candidatePhotoUrl}
                    alt="Candidate"
                    className="w-12 h-12 rounded-lg object-cover border border-amber-400"
                  />
                  <span className="text-emerald-400 font-bold text-xs">{t.photoUploaded}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onChange('candidatePhotoUrl', undefined)}
                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg border border-rose-500/40 font-bold text-[10px] cursor-pointer"
                >
                  {t.photoRemove}
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPhotoUpload}
                  disabled={isUploadingPhoto}
                  id="biodata-form-photo-upload"
                  className="hidden"
                />
                <label
                  htmlFor="biodata-form-photo-upload"
                  className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-850 text-amber-300 font-bold rounded-xl border border-dashed border-amber-500/40 cursor-pointer flex items-center justify-center gap-2 text-xs transition-colors"
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>{t.photoUploadBtn}</span>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Header Blessing */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 text-xs block">{t.blessingLabel}</label>
            <input
              type="text"
              value={formData.headerBlessing}
              onChange={(e) => onChange('headerBlessing', e.target.value)}
              placeholder={t.blessingPlaceholder}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-amber-200 font-bold text-xs outline-none focus:border-amber-500"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1 pt-1">
              {blessingPresets.map((blessing, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange('headerBlessing', blessing)}
                  className="px-2 py-0.5 bg-slate-950 hover:bg-amber-950/40 text-slate-300 hover:text-amber-300 border border-slate-800 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                >
                  {blessing.length > 30 ? blessing.substring(0, 30) + '...' : blessing}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Step Actions for Form */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
        <div>
          {currentIdx > 0 && activeSection !== 'all' && (
            <button
              type="button"
              onClick={handlePrevSection}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-bold cursor-pointer"
            >
              {t.backBtn}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeSection !== 'all' && currentIdx < sectionsList.length - 1 && (
            <button
              type="button"
              onClick={handleNextSection}
              className="px-3.5 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-black cursor-pointer shadow-sm"
            >
              {t.nextBtn}
            </button>
          )}
          <button
            type="button"
            onClick={onGoToPreview}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95 transition"
          >
            <span>{t.viewPreviewBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
