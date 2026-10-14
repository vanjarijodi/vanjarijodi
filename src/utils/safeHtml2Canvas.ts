import html2canvas from 'html2canvas-pro';

// Use the options type from html2canvas-pro or define as a compatible structure
type Options = any;

/**
 * Helper to clamp numbers between min and max
 */
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Converts OKLAB color to RGB
 */
function oklabToRgb(L: number, a_val: number, b_val: number): { r: number; g: number; b: number } {
  // 1. Convert OKLAB to LMS
  const l_ = L + 0.3963377774 * a_val + 0.2158037573 * b_val;
  const m_ = L - 0.1055613458 * a_val - 0.0638541728 * b_val;
  const s_ = L - 0.0894841775 * a_val - 1.2914855480 * b_val;

  // 2. Cube LMS values
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // 3. Convert LMS to linear RGB
  const r_lin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g_lin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b_lin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  // 4. Gamma correction
  const f = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

  const r = Math.round(clamp(f(r_lin) * 255, 0, 255));
  const g = Math.round(clamp(f(g_lin) * 255, 0, 255));
  const b = Math.round(clamp(f(b_lin) * 255, 0, 255));

  return { r, g, b };
}

/**
 * Converts OKLCH color to RGB
 */
function oklchToRgb(L: number, C: number, H: number): { r: number; g: number; b: number } {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  return oklabToRgb(L, a, b);
}

/**
 * Helper to parse percentages or float string representation
 */
function parsePercentOrFloat(val: string): number {
  if (val.endsWith('%')) {
    return parseFloat(val.slice(0, -1)) / 100;
  }
  return parseFloat(val);
}

/**
 * Translates modern CSS color strings containing oklch, oklab or color-mix back to standard rgb/rgba
 */
export function translateColor(colorStr: string): string {
  if (!colorStr) return colorStr;

  // 1. Translate oklch(...) including balanced nested parentheses (e.g., var(--tw-bg-opacity))
  const oklchBalancedRegex = /oklch\s*\(([^)]*(?:\([^)]*\)[^)]*)*)\)/gi;
  let translated = colorStr.replace(oklchBalancedRegex, (match, inner) => {
    try {
      const parts = inner.split('/');
      const colorPart = parts[0].trim();
      const alphaPart = parts[1] ? parts[1].trim() : null;

      const comps = colorPart.split(/[\s,]+/);
      if (comps.length < 3) return match;

      const L = parsePercentOrFloat(comps[0]);
      const C = parseFloat(comps[1]);
      const H = parseFloat(comps[2]);

      let alpha = 1;
      if (alphaPart) {
        if (alphaPart.includes('var(') || alphaPart.includes('calc(')) {
          alpha = 1;
        } else {
          alpha = parsePercentOrFloat(alphaPart);
          if (isNaN(alpha)) alpha = 1;
        }
      }

      const { r, g, b } = oklchToRgb(L, C, H);
      return alpha === 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`;
    } catch {
      return 'rgba(0,0,0,0)';
    }
  });

  // 2. Translate oklab(...) including balanced nested parentheses
  const oklabBalancedRegex = /oklab\s*\(([^)]*(?:\([^)]*\)[^)]*)*)\)/gi;
  translated = translated.replace(oklabBalancedRegex, (match, inner) => {
    try {
      const parts = inner.split('/');
      const colorPart = parts[0].trim();
      const alphaPart = parts[1] ? parts[1].trim() : null;

      const comps = colorPart.split(/[\s,]+/);
      if (comps.length < 3) return match;

      const L = parsePercentOrFloat(comps[0]);
      const a = parseFloat(comps[1]);
      const b = parseFloat(comps[2]);

      let alpha = 1;
      if (alphaPart) {
        if (alphaPart.includes('var(') || alphaPart.includes('calc(')) {
          alpha = 1;
        } else {
          alpha = parsePercentOrFloat(alphaPart);
          if (isNaN(alpha)) alpha = 1;
        }
      }

      const { r, g, b: blue } = oklabToRgb(L, a, b);
      return alpha === 1 ? `rgb(${r},${g},${blue})` : `rgba(${r},${g},${blue},${alpha})`;
    } catch {
      return 'rgba(0,0,0,0)';
    }
  });

  // 3. Fallback for color-mix(...) with modern color spaces or nested oklch/oklab
  const colorMixRegex = /color-mix\s*\(([^)]*(?:\([^)]*\)[^)]*)*)\)/gi;
  translated = translated.replace(colorMixRegex, (match) => {
    const lower = match.toLowerCase();
    if (lower.includes('a71930') || lower.includes('brand')) {
      return 'rgb(167, 25, 48)'; // Brand Red
    }
    if (lower.includes('amber')) {
      return 'rgb(245, 158, 11)'; // Amber
    }
    return 'rgba(0,0,0,0)';
  });

  return translated;
}

/**
 * Cleans up and sanitizes all active stylesheets in the current document to replace OKLCH with RGB,
 * preventing html2canvas internal CSS parser crashes.
 */
async function sanitizeDocumentStylesheets() {
  // 1. Sanitize <style> tags
  const styleTags = Array.from(document.querySelectorAll('style:not([data-sanitized="true"])')) as HTMLStyleElement[];
  styleTags.forEach((styleTag) => {
    try {
      if (styleTag.textContent && (styleTag.textContent.includes('oklch') || styleTag.textContent.includes('oklab') || styleTag.textContent.includes('color-mix'))) {
        styleTag.textContent = translateColor(styleTag.textContent);
        styleTag.setAttribute('data-sanitized', 'true');
      }
    } catch (e) {
      console.warn('Failed to sanitize inline style tag:', e);
    }
  });

  // 2. Sanitize <link> stylesheets
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
  for (const link of links) {
    if (link.dataset.sanitized === 'true') continue;
    try {
      const href = link.href;
      // Only fetch if same origin or relative to avoid CORS errors
      if (href && (href.startsWith(window.location.origin) || !href.startsWith('http'))) {
        const response = await fetch(href);
        if (!response.ok) continue;
        const rawCss = await response.text();
        const sanitizedCss = translateColor(rawCss);

        const styleTag = document.createElement('style');
        styleTag.textContent = sanitizedCss;
        styleTag.setAttribute('data-sanitized', 'true');
        if (link.id) styleTag.id = link.id;

        link.parentNode?.insertBefore(styleTag, link);
        link.parentNode?.removeChild(link);
      }
    } catch (err) {
      console.warn('Failed to sanitize stylesheet:', link.href, err);
    }
  }
}

/**
 * A wrapper around html2canvas that prevents errors caused by modern CSS color functions
 * like `oklab(...)` or `oklch(...)` (commonly generated by Tailwind CSS v4 in modern browsers).
 *
 * It resolves computed styles into explicit RGB inline styles on the cloned DOM
 * and cleans up stylesheets containing `oklab` or `oklch` rules before html2canvas renders.
 */
export const safeHtml2Canvas = async (
  element: HTMLElement,
  options: Partial<Options> = {}
): Promise<HTMLCanvasElement> => {
  // Pre-sanitize all stylesheets and style tags in the real document first!
  try {
    await sanitizeDocumentStylesheets();
  } catch (e) {
    console.warn('Pre-sanitization of stylesheets failed:', e);
  }

  const origElements = [element, ...Array.from(element.querySelectorAll('*'))] as HTMLElement[];

  return html2canvas(element, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    ...options,
    onclone: (clonedDoc, clonedElement) => {
      // 1. Copy computed styles (resolved to rgb/rgba) from original DOM to cloned DOM
      const clonedElements = [clonedElement, ...Array.from(clonedElement.querySelectorAll('*'))] as HTMLElement[];

      for (let i = 0; i < origElements.length; i++) {
        const origEl = origElements[i];
        const clonedEl = clonedElements[i];
        if (!origEl || !clonedEl) continue;

        try {
          const computed = window.getComputedStyle(origEl);

          // Force resolved RGB/RGBA colors onto inline styles
          if (computed.backgroundColor && computed.backgroundColor !== 'transparent' && computed.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            clonedEl.style.backgroundColor = translateColor(computed.backgroundColor);
          }
          if (computed.color) {
            clonedEl.style.color = translateColor(computed.color);
          }
          if (computed.borderColor) {
            clonedEl.style.borderColor = translateColor(computed.borderColor);
          }
          if (computed.borderTopColor) {
            clonedEl.style.borderTopColor = translateColor(computed.borderTopColor);
          }
          if (computed.borderBottomColor) {
            clonedEl.style.borderBottomColor = translateColor(computed.borderBottomColor);
          }
          if (computed.borderLeftColor) {
            clonedEl.style.borderLeftColor = translateColor(computed.borderLeftColor);
          }
          if (computed.borderRightColor) {
            clonedEl.style.borderRightColor = translateColor(computed.borderRightColor);
          }
        } catch {
          // ignore computed style errors for unreachable nodes
        }
      }

      // 2. Sanitize all <style> tags in cloned document again just in case
      const styleTags = Array.from(clonedDoc.querySelectorAll('style'));
      styleTags.forEach((styleTag) => {
        if (styleTag.textContent) {
          styleTag.textContent = translateColor(styleTag.textContent);
        }
      });

      // 3. Purge rules containing oklab / oklch / color-mix from document.styleSheets
      try {
        const styleSheets = Array.from(clonedDoc.styleSheets);
        styleSheets.forEach((sheet) => {
          try {
            const rules = Array.from(sheet.cssRules || []);
            for (let i = rules.length - 1; i >= 0; i--) {
              const ruleText = rules[i].cssText;
              if (
                ruleText.includes('oklab') ||
                ruleText.includes('oklch') ||
                ruleText.includes('color-mix')
              ) {
                sheet.deleteRule(i);
              }
            }
          } catch {
            // Ignore cross-origin stylesheet access restrictions
          }
        });
      } catch {
        // Ignore styleSheet access errors
      }

      // 4. Invoke user custom onclone if provided
      if (options.onclone) {
        options.onclone(clonedDoc, clonedElement);
      }
    },
  });
};
