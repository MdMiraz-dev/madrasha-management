'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { translations } from '@/lib/translations';

export type Language = 'bn' | 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRtl: boolean;
  t: (typeof translations)['bn'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('bn');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedLang = localStorage.getItem('language') as Language;
      if (savedLang && (savedLang === 'bn' || savedLang === 'en' || savedLang === 'ar')) {
        setLanguageState(savedLang);
      }
    } catch (e) {
      console.error('Error loading language from localStorage', e);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('language', lang);
    } catch (e) {
      console.error('Error saving language to localStorage', e);
    }
  };

  const isRtl = language === 'ar';
  const t = translations[language as keyof typeof translations] || translations.bn;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRtl, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
