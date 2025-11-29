/**
 * Translation Service
 * Handles API-based translations with caching and fallback to local JSON files
 */

interface TranslationCache {
  [language: string]: {
    data: Record<string, string>;
    timestamp: number;
  };
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const API_BASE_URL = 'http://localhost:5000';

let translationCache: TranslationCache = {};

/**
 * Fetch translations from the API endpoint
 * @param language - Language code (e.g., 'en', 'hi', 'pa')
 * @returns Promise<Record<string, string>> - Translation dictionary
 */
export const fetchTranslationsFromAPI = async (
  language: string
): Promise<Record<string, string>> => {
  try {
    // Check if translation is already cached and not expired
    if (translationCache[language]) {
      const { data, timestamp } = translationCache[language];
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log(`[i18n] Using cached translations for ${language}`);
        return data;
      }
    }

    console.log(`[i18n] Fetching translations for ${language} from API...`);
    const response = await fetch(`${API_BASE_URL}/translate?lang=${language}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data: Record<string, string> = await response.json();

    // Cache the translation
    translationCache[language] = {
      data,
      timestamp: Date.now(),
    };

    console.log(`[i18n] Successfully fetched translations for ${language}`);
    return data;
  } catch (error) {
    console.error(`[i18n] Failed to fetch translations for ${language}:`, error);
    // Return empty object on error; caller should have fallback
    return {};
  }
};

/**
 * Clear translation cache for a specific language or all languages
 * @param language - Optional language code; if omitted, clears all cache
 */
export const clearTranslationCache = (language?: string) => {
  if (language) {
    delete translationCache[language];
    console.log(`[i18n] Cleared cache for ${language}`);
  } else {
    translationCache = {};
    console.log(`[i18n] Cleared all translation cache`);
  }
};

/**
 * Get single translation key
 * @param key - Translation key
 * @param language - Language code
 * @param fallback - Fallback translation dictionary (e.g., from JSON)
 * @returns Translated string or key if not found
 */
export const getTranslation = (
  key: string,
  language: string,
  fallback?: Record<string, string>
): string => {
  // Check cache first
  if (translationCache[language]?.data[key]) {
    return translationCache[language].data[key];
  }
  // Fallback to provided dictionary
  if (fallback?.[key]) {
    return fallback[key];
  }
  // Return key if translation not found
  return key;
};

/**
 * Preload translations for a language
 * Useful to call on app startup or when user switches language
 * @param language - Language code
 * @param fallback - Fallback translations while API is loading
 */
export const preloadTranslations = async (
  language: string,
  fallback?: Record<string, string>
): Promise<Record<string, string>> => {
  try {
    const translations = await fetchTranslationsFromAPI(language);
    // Merge with fallback if API returned empty or partial data
    return { ...fallback, ...translations };
  } catch (error) {
    console.error(`[i18n] Preload failed for ${language}:`, error);
    return fallback || {};
  }
};
