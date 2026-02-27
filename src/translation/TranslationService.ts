import type { TranslationResult } from '../types';

type SupportedLanguage = 'en' | 'hi';

export async function translate(
    text: string,
    _sourceLang: SupportedLanguage = 'en',
    _targetLang: SupportedLanguage = 'en'
): Promise<TranslationResult> {
    return {
        original: text,
        translated: text,
        signKeys: text.toLowerCase().split(/\s+/),
        language: 'en',
    };
}
