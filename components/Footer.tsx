'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Phone, Heart } from 'lucide-react';

interface FooterProps {
  onOpenAbout?: () => void;
}

export default function Footer({ onOpenAbout }: FooterProps) {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-white dark:bg-slate-800 border-t dark:border-slate-700 py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
          <span>{t.footerAttribution}</span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <a
            href="tel:01339564967"
            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
          >
            <Phone size={13} />
            <span>01339564967</span>
          </a>
          {onOpenAbout && (
            <button
              onClick={onOpenAbout}
              className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline transition"
            >
              {t.aboutDeveloper}
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
