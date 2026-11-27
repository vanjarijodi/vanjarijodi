export interface SafeJsonResult<T = any> {
  ok: boolean;
  status: number;
  data: T;
  isNonJson: boolean;
}

/**
 * Safely parses a fetch Response as JSON.
 * Prevents cryptic `Unexpected token '<', "<!doctype "... is not valid JSON`
 * errors when a proxy, CDN, or static host returns HTML instead of JSON.
 */
export async function safeParseJson<T = any>(
  resp: Response,
  fallbackErrorMsg = 'सर्व्हरशी संपर्क करताना अडचण आली. कृपया पुन्हा प्रयत्न करा.'
): Promise<SafeJsonResult<T>> {
  const rawText = await resp.text().catch(() => '');
  const trimmed = rawText.trim();

  if (!trimmed) {
    return {
      ok: resp.ok,
      status: resp.status,
      data: { success: false, error: fallbackErrorMsg } as unknown as T,
      isNonJson: true,
    };
  }

  try {
    const parsed = JSON.parse(trimmed) as T;
    return {
      ok: resp.ok,
      status: resp.status,
      data: parsed,
      isNonJson: false,
    };
  } catch {
    const looksLikeHtml = trimmed.startsWith('<') || trimmed.toLowerCase().includes('<!doctype');
    const friendlyError = looksLikeHtml
      ? 'OTP सर्व्हरकडून योग्य प्रतिसाद मिळाला नाही. कृपया पेज रिफ्रेश करून पुन्हा प्रयत्न करा किंवा अ‍ॅडमिन पॅनेलमध्ये SMS Gateway सेटिंग्ज तपासा.'
      : fallbackErrorMsg;

    return {
      ok: false,
      status: resp.status,
      data: { success: false, error: friendlyError } as unknown as T,
      isNonJson: true,
    };
  }
}
