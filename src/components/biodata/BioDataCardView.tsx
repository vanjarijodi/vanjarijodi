import React from 'react';
import { SiteConfig } from '../../types';
import { BioDataThemeConfig } from './biodataThemes';
import { BioDataFloralCorners } from './BioDataFloralCorners';
import { BioDataWatermark } from './BioDataWatermark';
import { VanjariJodiLogo } from '../VanjariJodiLogo';
import { BIODATA_I18N, BiodataLanguage } from './BioDataTranslations';

export interface BioDataCustomFieldItem {
  id: string;
  label: string;
  value: string;
  section: 'personal' | 'astrology' | 'family' | 'contact';
}

export interface BioDataCardViewData {
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
  address: string;
  expectations: string;
  candidatePhotoUrl?: string;
  customFields: BioDataCustomFieldItem[];
}

interface BioDataCardViewProps {
  formData: BioDataCardViewData;
  activeTheme: BioDataThemeConfig;
  siteConfig?: SiteConfig;
  language: BiodataLanguage;
  isExport?: boolean;
}

export const BioDataCardView = React.forwardRef<HTMLDivElement, BioDataCardViewProps>(
  ({ formData, activeTheme, siteConfig, language, isExport = false }, ref) => {
    const t = BIODATA_I18N[language];
    const portalUrl = siteConfig?.canonicalDomain || 'https://vanjarijodi.com';
    const displayDomain = portalUrl.replace(/^https?:\/\//, '');

    const basePadding = isExport ? '42px 48px' : '20px 18px';
    const minHeight = isExport ? '1120px' : '620px';
    const cardWidth = isExport ? '800px' : '100%';
    const blessingFontSize = isExport ? '18px' : '13px';
    const brandTitleFontSize = isExport ? '30px' : '20px';
    const brandSubFontSize = isExport ? '12px' : '10px';
    const nameFontSize = isExport ? '25px' : '18px';
    const textFontSize = isExport ? '13px' : '11px';
    const headerPillFontSize = isExport ? '12.5px' : '10.5px';
    const photoWidth = isExport ? '120px' : '82px';
    const photoHeight = isExport ? '150px' : '102px';

    return (
      <div
        ref={ref}
        style={{
          width: cardWidth,
          minHeight,
          padding: basePadding,
          backgroundColor: activeTheme.bgColor,
          border: activeTheme.outerBorderDouble,
          fontFamily: "'Noto Sans Devanagari', 'Baloo 2', 'Mukta', sans-serif",
          color: activeTheme.textColor,
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          WebkitFontSmoothing: 'antialiased',
          borderRadius: isExport ? '0px' : '16px',
        }}
        className={isExport ? 'space-y-4' : 'rounded-2xl shadow-xl space-y-3.5 select-none'}
      >
        {/* Floral Ornaments if active theme has them */}
        {activeTheme.floralAccent && (
          <BioDataFloralCorners
            variant="floral"
            primaryColor={activeTheme.primaryColor}
            accentColor={activeTheme.accentColor}
          />
        )}

        {/* Watermark in Background - 25% Opacity */}
        <BioDataWatermark siteConfig={siteConfig} opacity={0.25} showText={true} />

        <div style={{ position: 'relative', zIndex: 10 }} className={isExport ? 'space-y-4' : 'space-y-3'}>
          {/* Header Blessing & Branding */}
          <div
            style={{
              textAlign: 'center',
              borderBottom: `1.5px solid ${activeTheme.lightBorderColor}`,
              paddingBottom: isExport ? '14px' : '8px',
            }}
          >
            <p
              style={{
                color: activeTheme.accentColor,
                fontSize: blessingFontSize,
                fontWeight: 'bold',
                fontFamily: "'Rozha One', 'Tiro Devanagari Marathi', 'Noto Sans Devanagari', sans-serif",
                margin: 0,
                letterSpacing: '0.3px',
              }}
            >
              {formData.headerBlessing ||
                (language === 'en'
                  ? '|| Shree Ganeshay Namah ||  || Shri Sant Bhagwan Baba Prasanna ||'
                  : '॥ श्री गणेशाय नमः ॥  ॥ श्री संत भगवान बाबा प्रसन्न ॥')}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isExport ? '14px' : '10px',
                marginTop: isExport ? '10px' : '6px',
              }}
            >
              <VanjariJodiLogo variant="emblem" size={isExport ? 50 : 38} />
              <div style={{ textAlign: 'left' }}>
                <h1
                  style={{
                    fontSize: brandTitleFontSize,
                    color: activeTheme.primaryColor,
                    fontWeight: 900,
                    lineHeight: '1.2',
                    margin: 0,
                    fontFamily: "'Rozha One', 'Tiro Devanagari Marathi', 'Noto Sans Devanagari', sans-serif",
                  }}
                >
                  {siteConfig?.logoTitle || (language === 'mr' ? 'वंजारी जोडी' : 'Vanjari Jodi')} {t.previewDocTitle}
                </h1>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '2px',
                  }}
                >
                  {/* Google Play Store Badge Icon */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC',
                      padding: isExport ? '2px 8px' : '1.5px 6px',
                      borderRadius: '6px',
                      fontSize: brandSubFontSize,
                      fontWeight: 800,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    }}
                  >
                    <svg viewBox="0 0 24 24" width={isExport ? "12" : "10"} height={isExport ? "12" : "10"} fill="none">
                      <path d="M4 3.5v17l14-8.5L4 3.5z" fill="#00E676" />
                      <path d="M4 3.5l10.5 10.5-3.5 2.1L4 3.5z" fill="#00B0FF" />
                      <path d="M4 20.5l10.5-10.5-3.5-2.1L4 20.5z" fill="#FF3D00" />
                      <path d="M14.5 14L18 12l-3.5-2 2.5 1-2.5 3z" fill="#FFD600" />
                    </svg>
                    <span>Google Play</span>
                  </div>
                  <p
                    style={{
                      fontSize: brandSubFontSize,
                      color: activeTheme.accentColor,
                      fontWeight: 'bold',
                      margin: 0,
                    }}
                  >
                    {language === 'mr' ? 'आपले ॲप प्ले स्टोअर वरून डाऊनलोड करा — Vanjari Jodi' : 'Download App from Play Store — Vanjari Jodi'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Identity Profile Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isExport ? '18px' : '12px',
              marginTop: isExport ? '12px' : '6px',
            }}
          >
            {/* Left: Candidate Summary */}
            <div
              style={{
                flex: 1,
                padding: isExport ? '12px 18px' : '10px 14px',
                borderRadius: '12px',
                backgroundColor: activeTheme.badgeBg,
                border: `1px solid ${activeTheme.lightBorderColor}`,
              }}
            >
              <h2
                style={{
                  fontSize: nameFontSize,
                  color: activeTheme.secondaryColor,
                  fontWeight: 900,
                  margin: '0 0 4px 0',
                  fontFamily: "'Rozha One', 'Tiro Devanagari Marathi', 'Noto Sans Devanagari', sans-serif",
                }}
              >
                {formData.fullName || t.previewCandidateNameDefault}
              </h2>
              <p style={{ fontSize: textFontSize, fontWeight: 'bold', color: '#334155', margin: '2px 0' }}>
                🎓 {t.previewEduPrefix} <span style={{ color: activeTheme.primaryColor }}>{formData.education || '---'}</span>
              </p>
              {(formData.jobTitle || formData.businessTitle) && (
                <p style={{ fontSize: textFontSize, fontWeight: 'bold', color: '#334155', margin: '2px 0' }}>
                  💼 {t.previewJobPrefix}{' '}
                  <span style={{ color: activeTheme.primaryColor }}>
                    {[formData.jobTitle, formData.businessTitle].filter(Boolean).join(' | ')}
                  </span>
                </p>
              )}
            </div>

            {/* Right: Photo (if attached) */}
            {formData.candidatePhotoUrl && (
              <div style={{ flexShrink: 0, textAlign: 'center' }}>
                <div
                  style={{
                    width: photoWidth,
                    height: photoHeight,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: `2px solid ${activeTheme.accentColor}`,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    backgroundColor: '#fff',
                    padding: '2px',
                  }}
                >
                  <img
                    src={formData.candidatePhotoUrl}
                    alt="Candidate"
                    crossOrigin="anonymous"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '7px' }}
                  />
                </div>
                <span
                  style={{
                    fontSize: isExport ? '9px' : '8px',
                    fontWeight: 'bold',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde047',
                    padding: '1px 8px',
                    borderRadius: '99px',
                    display: 'inline-block',
                    marginTop: '3px',
                  }}
                >
                  {formData.gender === 'bride' ? t.previewBridePhoto : t.previewGroomPhoto}
                </span>
              </div>
            )}
          </div>

          {/* Section 1: Personal Details */}
          <div>
            <div
              style={{
                background: activeTheme.pillHeaderGradient,
                color: activeTheme.tableHeaderTextColor,
                padding: isExport ? '5px 14px' : '3px 10px',
                borderRadius: '999px',
                fontSize: headerPillFontSize,
                fontWeight: 900,
                display: 'inline-block',
                marginBottom: isExport ? '6px' : '4px',
              }}
            >
              {language === 'mr' ? '१. वैयक्तिक माहिती (Personal Details)' : '1. Personal Details'}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: textFontSize }}>
              <tbody>
                <tr>
                  <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewDob}
                  </td>
                  <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.birthDate || '---'}
                  </td>
                  <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewBirthTime}
                  </td>
                  <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.birthTime || '---'}
                  </td>
                </tr>
                <tr>
                  <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewBirthPlace}
                  </td>
                  <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.birthPlace || '---'}
                  </td>
                  <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewHeight}
                  </td>
                  <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.height || '---'}
                  </td>
                </tr>
                <tr>
                  <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewComplexion}
                  </td>
                  <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.complexion || '---'}
                  </td>
                  <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewBloodGroup}
                  </td>
                  <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.bloodGroup || '---'}
                  </td>
                </tr>
                {formData.income && (
                  <tr>
                    <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                      {t.previewIncome}
                    </td>
                    <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                      {formData.income}
                    </td>
                  </tr>
                )}
                {formData.customFields
                  .filter((f) => f.section === 'personal')
                  .map((field) => (
                    <tr key={field.id}>
                      <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                        {field.label} :-
                      </td>
                      <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                        {field.value}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Family Details */}
          <div>
            <div
              style={{
                background: activeTheme.pillHeaderGradient,
                color: activeTheme.tableHeaderTextColor,
                padding: isExport ? '5px 14px' : '3px 10px',
                borderRadius: '999px',
                fontSize: headerPillFontSize,
                fontWeight: 900,
                display: 'inline-block',
                marginBottom: isExport ? '6px' : '4px',
              }}
            >
              {language === 'mr' ? '२. कौटुंबिक पार्श्वभूमी (Family Details)' : '2. Family Details'}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: textFontSize }}>
              <tbody>
                <tr>
                  <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewFatherName}
                  </td>
                  <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.fatherName || '---'}{' '}
                    {formData.fatherOccupation ? `(${formData.fatherOccupation})` : ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewMotherName}
                  </td>
                  <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.motherName || '---'}
                  </td>
                </tr>
                {formData.uncleName && (
                  <tr>
                    <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                      {t.previewUncleName}
                    </td>
                    <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                      {formData.uncleName}
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewBrothers}
                  </td>
                  <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.brothers || '---'}
                  </td>
                  <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewSisters}
                  </td>
                  <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.sisters || '---'}
                  </td>
                </tr>
                {formData.mamaName && (
                  <tr>
                    <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                      {t.previewMamaName}
                    </td>
                    <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                      {formData.mamaName}
                    </td>
                  </tr>
                )}
                {formData.relatives && (
                  <tr>
                    <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                      {t.previewRelatives}
                    </td>
                    <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                      {formData.relatives}
                    </td>
                  </tr>
                )}
                {formData.customFields
                  .filter((f) => f.section === 'family')
                  .map((field) => (
                    <tr key={field.id}>
                      <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                        {field.label} :-
                      </td>
                      <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                        {field.value}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Kundali Details */}
          <div>
            <div
              style={{
                background: activeTheme.pillHeaderGradient,
                color: activeTheme.tableHeaderTextColor,
                padding: isExport ? '5px 14px' : '3px 10px',
                borderRadius: '999px',
                fontSize: headerPillFontSize,
                fontWeight: 900,
                display: 'inline-block',
                marginBottom: isExport ? '6px' : '4px',
              }}
            >
              {language === 'mr' ? '३. कुंडली व पत्रिका माहिती (Kundali Details)' : '3. Horoscope & Kundali'}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: textFontSize }}>
              <tbody>
                <tr>
                  <td style={{ width: '20%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewRashi}
                  </td>
                  <td style={{ width: '30%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.rashi || '---'}
                  </td>
                  <td style={{ width: '20%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewNakshatra}
                  </td>
                  <td style={{ width: '30%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.nakshatra || '---'}
                  </td>
                </tr>
                <tr>
                  <td style={{ width: '20%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewGotra}
                  </td>
                  <td style={{ width: '30%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.gotra || '---'}
                  </td>
                  <td style={{ width: '20%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewDevak}
                  </td>
                  <td style={{ width: '30%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.devak || '---'}
                  </td>
                </tr>
                <tr>
                  <td style={{ width: '20%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewNadi}
                  </td>
                  <td style={{ width: '30%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.nadi || '---'}
                  </td>
                  <td style={{ width: '20%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewMangal}
                  </td>
                  <td style={{ width: '30%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.mangal || '---'}
                  </td>
                </tr>
                {formData.customFields
                  .filter((f) => f.section === 'astrology')
                  .map((field) => (
                    <tr key={field.id}>
                      <td style={{ width: '20%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                        {field.label} :-
                      </td>
                      <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                        {field.value}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Contact & Expectations */}
          <div>
            <div
              style={{
                background: activeTheme.pillHeaderGradient,
                color: activeTheme.tableHeaderTextColor,
                padding: isExport ? '5px 14px' : '3px 10px',
                borderRadius: '999px',
                fontSize: headerPillFontSize,
                fontWeight: 900,
                display: 'inline-block',
                marginBottom: isExport ? '6px' : '4px',
              }}
            >
              {language === 'mr' ? '४. संपर्क व अपेक्षा (Contact Details)' : '4. Contact Details'}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: textFontSize }}>
              <tbody>
                <tr>
                  <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewMobile}
                  </td>
                  <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.mobile || '---'}
                  </td>
                  <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                    {t.previewNativePlace}
                  </td>
                  <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {formData.nativePlace || '---'}
                  </td>
                </tr>
                {formData.address && (
                  <tr>
                    <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                      {t.previewAddress}
                    </td>
                    <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                      {formData.address}
                    </td>
                  </tr>
                )}
                {formData.expectations && (
                  <tr>
                    <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                      {t.previewExpectations}
                    </td>
                    <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                      {formData.expectations}
                    </td>
                  </tr>
                )}
                {formData.customFields
                  .filter((f) => f.section === 'contact')
                  .map((field) => (
                    <tr key={field.id}>
                      <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>
                        {field.label} :-
                      </td>
                      <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                        {field.value}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Google Play Store App Download Branding Footer with QR */}
          <div
            style={{
              marginTop: isExport ? '16px' : '10px',
              padding: isExport ? '10px 16px' : '6px 10px',
              borderRadius: '10px',
              border: `1.5px solid ${activeTheme.accentColor}`,
              backgroundColor: '#FFFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Play Store Vector Badge */}
              <div
                style={{
                  width: isExport ? '32px' : '26px',
                  height: isExport ? '32px' : '26px',
                  borderRadius: '6px',
                  backgroundColor: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                }}
              >
                <svg viewBox="0 0 24 24" width={isExport ? "18" : "14"} height={isExport ? "18" : "14"} fill="none">
                  <path d="M4 3.5v17l14-8.5L4 3.5z" fill="#00E676" />
                  <path d="M4 3.5l10.5 10.5-3.5 2.1L4 3.5z" fill="#00B0FF" />
                  <path d="M4 20.5l10.5-10.5-3.5-2.1L4 20.5z" fill="#FF3D00" />
                  <path d="M14.5 14L18 12l-3.5-2 2.5 1-2.5 3z" fill="#FFD600" />
                </svg>
              </div>

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: isExport ? '11px' : '9.5px',
                    fontWeight: 900,
                    color: '#800C1E',
                  }}
                >
                  {t.previewFooterTitle}
                </p>
                <p
                  style={{
                    margin: '2px 0 0 0',
                    fontSize: isExport ? '9.5px' : '8px',
                    fontWeight: 'bold',
                    color: '#334155',
                  }}
                >
                  {t.previewFooterSubtitle}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent('https://play.google.com/store/apps/details?id=com.vanjarijodi.matrimony')}`}
                alt="Play Store QR"
                style={{
                  width: isExport ? '40px' : '32px',
                  height: isExport ? '40px' : '32px',
                  border: `1px solid ${activeTheme.accentColor}`,
                  padding: '1.5px',
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                }}
              />
              <span
                style={{
                  fontSize: isExport ? '7.5px' : '6.5px',
                  fontWeight: 900,
                  color: '#00875A',
                  marginTop: '1px',
                }}
              >
                Google Play
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

BioDataCardView.displayName = 'BioDataCardView';
