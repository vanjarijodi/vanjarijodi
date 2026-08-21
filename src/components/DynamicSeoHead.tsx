import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateStructuredJsonLd } from '../utils/seoData';

interface DynamicSeoHeadProps {
  pageTitle?: string;
  pageDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  activeCommunity?: string;
  activeCity?: string;
}

export const DynamicSeoHead: React.FC<DynamicSeoHeadProps> = ({
  pageTitle,
  pageDescription,
  canonicalUrl,
  ogImage,
  activeCommunity,
  activeCity,
}) => {
  const { language, siteConfig, selectedProfileForModal } = useApp();

  useEffect(() => {
    // 1. Determine Dynamic Title & Description
    const isMr = language === 'mr';
    const siteDomain = siteConfig?.canonicalDomain || (typeof window !== 'undefined' ? window.location.origin : 'https://vanjarijodi.web.app');

    let dynamicTitle = isMr
      ? siteConfig?.metaTitleMr || siteConfig?.metaTitle || 'वंजारी जोडी | वंजारी वधू-वर सूचक केंद्र | Vanjari Jodi Matrimony Portal (vanjarijodi.web.app)'
      : siteConfig?.metaTitleEn || 'Vanjari Jodi Matrimony - Official Vanjari Community Vadhu Var Portal (vanjarijodi.web.app)';

    let dynamicDesc = isMr
      ? siteConfig?.metaDescriptionMr || siteConfig?.metaDescription || 'वंजारी जोडी (Vanjari Jodi) - महाराष्ट्र व जगभरातील १# अधिकृत वंजारी समाज वधू-वर सूचक केंद्र. हजारो पडताळणी झालेले वंजारी वधू-वर बायोडाटा, पत्रिका जुळवणी, मोफत नोंदणी व विवाह स्थळे (vanjarijodi.web.app).'
      : siteConfig?.metaDescriptionEn || 'Vanjari Jodi (vanjarijodi.web.app) is the official matrimonial portal for Vanjari community brides and grooms across Maharashtra and worldwide.';

    let targetUrl = canonicalUrl || siteDomain;
    let shareImg = ogImage || siteConfig?.logoUrl || `${siteDomain}/logo.png`;

    // Contextual Overrides
    if (selectedProfileForModal) {
      const p = selectedProfileForModal;
      const genderLabel = p.gender === 'bride' ? (isMr ? 'वधू (Bride)' : 'Bride') : (isMr ? 'वर (Groom)' : 'Groom');
      dynamicTitle = `${p.fullName} (${genderLabel}) - ${p.education} | वंजारी जोडी विवाह`;
      dynamicDesc = `${p.fullName} (${p.age} वर्षे, ${p.height}), शिक्षण: ${p.education}, व्यवसाय: ${p.occupation}, जिल्हा: ${p.district}. संपूर्ण बायोडाटा व संपर्क वंजारी जोडीवर पहा.`;
      targetUrl = `${siteDomain}/profile/${p.id}`;
      if (p.photos && p.photos.length > 0 && !siteConfig?.blurProfilePhotos) {
        shareImg = p.photos[0];
      }
    } else if (activeCommunity) {
      dynamicTitle = isMr
        ? `${activeCommunity} वधू-वर सूचक केंद्र | ${activeCommunity} विवाह स्थळे`
        : `${activeCommunity} Matrimony - Verified Brides & Grooms Profiles`;
      dynamicDesc = isMr
        ? `${activeCommunity} समाजातील इंजिनिअर्स, क्लास-१ अधिकारी, डॉक्टर व सुशिक्षित वधू-वर बायोडाटा. मोफत नोंदणी करा.`
        : `Find verified ${activeCommunity} brides and grooms. Complete family details & horoscope matching.`;
      targetUrl = `${siteDomain}/matrimony/${encodeURIComponent(activeCommunity.toLowerCase())}`;
    } else if (activeCity) {
      dynamicTitle = isMr
        ? `${activeCity} वधू-वर सूचक केंद्र | ${activeCity} विवाह स्थळे`
        : `${activeCity} Matrimony - Vadhu Var Profiles in ${activeCity}`;
      dynamicDesc = isMr
        ? `${activeCity} परिसरातील उच्चशिक्षित व प्रतिष्ठित कुटुंबातील वधू-वर स्थळे. थेट संपर्क व पत्रिका जुळवणी.`
        : `Search verified matrimony profiles residing in ${activeCity}, Maharashtra. Free registration.`;
      targetUrl = `${siteDomain}/matrimony/city/${encodeURIComponent(activeCity.toLowerCase())}`;
    } else if (pageTitle) {
      dynamicTitle = pageTitle;
      if (pageDescription) dynamicDesc = pageDescription;
    }

    // 2. Set Document Title
    document.title = dynamicTitle;

    // 3. Helper to update/create meta tags
    const updateOrCreateMeta = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta
    updateOrCreateMeta('name', 'description', dynamicDesc);
    updateOrCreateMeta(
      'name',
      'keywords',
      siteConfig?.metaKeywords || 'वंजारी जोडी, वंजारी विवाह, Vanjari Jodi, Vanjari Matrimony, Marathi Matrimony'
    );
    updateOrCreateMeta('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateOrCreateMeta('name', 'googlebot', 'index, follow');

    // Webmaster Verifications from Admin SiteConfig
    if (siteConfig?.googleSiteVerification) {
      updateOrCreateMeta('name', 'google-site-verification', siteConfig.googleSiteVerification);
    }
    if (siteConfig?.bingSiteVerification) {
      updateOrCreateMeta('name', 'msvalidate.01', siteConfig.bingSiteVerification.replace('msvalidate.01=', ''));
    }

    // Open Graph Tags
    updateOrCreateMeta('property', 'og:title', dynamicTitle);
    updateOrCreateMeta('property', 'og:description', dynamicDesc);
    updateOrCreateMeta('property', 'og:url', targetUrl);
    updateOrCreateMeta('property', 'og:image', shareImg);
    updateOrCreateMeta('property', 'og:type', 'website');
    updateOrCreateMeta('property', 'og:site_name', isMr ? 'वंजारी जोडी (VanjariJodi)' : 'Vanjari Jodi Matrimony');
    updateOrCreateMeta('property', 'og:locale', isMr ? 'mr_IN' : 'en_US');
    updateOrCreateMeta('property', 'og:locale:alternate', isMr ? 'en_US' : 'mr_IN');

    // Twitter Card Tags
    updateOrCreateMeta('name', 'twitter:card', 'summary_large_image');
    updateOrCreateMeta('name', 'twitter:title', dynamicTitle);
    updateOrCreateMeta('name', 'twitter:description', dynamicDesc);
    updateOrCreateMeta('name', 'twitter:image', shareImg);

    // Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', targetUrl);

    // 4. Inject Dynamic JSON-LD Structured Data
    const jsonLdData = generateStructuredJsonLd({
      siteUrl: siteDomain,
      siteNameMr: siteConfig?.logoTitle || 'वंजारी जोडी वधू-वर सूचक केंद्र',
      siteNameEn: 'Vanjari Jodi Matrimony',
      logoUrl: siteConfig?.logoUrl || `${siteDomain}/logo.png`,
      supportPhone: siteConfig?.contactPhone || '+91 9800000000',
      supportEmail: siteConfig?.contactEmail || 'support@vanjarijodi.org',
      address: siteConfig?.contactAddress || 'Maharashtra, India',
    });

    let scriptElement = document.getElementById('dynamic-jsonld-schema') as HTMLScriptElement | null;
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = 'dynamic-jsonld-schema';
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = JSON.stringify([
      jsonLdData.orgSchema,
      jsonLdData.webSiteSchema,
      jsonLdData.serviceSchema,
      jsonLdData.breadcrumbSchema,
    ]);

    // 5. Google Analytics (GA4) auto-injector if provided in settings
    if (siteConfig?.ga4MeasurementId && !document.getElementById('ga4-script')) {
      const gaId = siteConfig.ga4MeasurementId;
      const script = document.createElement('script');
      script.id = 'ga4-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      const inlineScript = document.createElement('script');
      inlineScript.id = 'ga4-inline-init';
      inlineScript.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.head.appendChild(inlineScript);
    }
  }, [
    language,
    siteConfig,
    selectedProfileForModal,
    pageTitle,
    pageDescription,
    canonicalUrl,
    ogImage,
    activeCommunity,
    activeCity,
  ]);

  return null;
};
