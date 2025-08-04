
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import en from '@/locales/en.json';
import ta from '@/locales/ta.json';

type Language = 'en' | 'ta';

const translations = { en, ta };

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((key: string, options?: Record<string, string | number>) => {
    const keys = key.split('.');
    let result = translations[language] as any;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is not found
        let fallbackResult = translations['en'] as any;
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
             if (fallbackResult === undefined) return key;
        }
        result = fallbackResult;
        break;
      }
    }
    
    if (typeof result === 'string' && options) {
      return Object.entries(options).reduce((acc, [key, value]) => {
        return acc.replace(`{{${key}}}`, String(value));
      }, result);
    }
    
    return result || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
