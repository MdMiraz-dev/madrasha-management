'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Moon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const HIJRI_MONTHS_BN = [
  'মুহাররম',
  'সফর',
  'রবিউল আউয়াল',
  'রবিউস সানি',
  'জমাদিউল আউয়াল',
  'জমাদিউস সানি',
  'রজব',
  'শাবান',
  'রমজান',
  'শাওয়াল',
  'জিলকদ',
  'জিলহজ্জ',
];

const HIJRI_MONTHS_EN = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Shaban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qadah',
  'Dhu al-Hijjah',
];

// Convert English digits to Bengali digits
export function toBengaliNumerals(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

/**
 * Get accurate Hijri date string using Intl with Bengali fallback
 */
export function getHijriDate(date: Date, lang: string = 'bn'): string {
  try {
    // Attempt standard Intl Islamic Umalqura calendar formatting
    const intlFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = intlFormatter.formatToParts(date);
    const dayPart = parts.find((p) => p.type === 'day')?.value || '1';
    const monthPart = parts.find((p) => p.type === 'month')?.value || '1';
    const yearPart = parts.find((p) => p.type === 'year')?.value || '1448';

    const dayNum = parseInt(dayPart, 10);
    const monthIndex = Math.max(0, Math.min(11, parseInt(monthPart, 10) - 1));

    if (lang === 'bn') {
      const bnDay = toBengaliNumerals(dayNum);
      const bnMonth = HIJRI_MONTHS_BN[monthIndex] || 'রবিউল আউয়াল';
      const bnYear = toBengaliNumerals(yearPart);
      return `${bnDay} ${bnMonth} ${bnYear} হিজরি`;
    } else if (lang === 'ar') {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } else {
      const enMonth = HIJRI_MONTHS_EN[monthIndex] || 'Rabi al-Awwal';
      return `${dayNum} ${enMonth} ${yearPart} AH`;
    }
  } catch {
    // Robust fallback
    return lang === 'bn' ? '১০ রবিউল আউয়াল ১৪৪৮ হিজরি' : '10 Rabi al-Awwal 1448 AH';
  }
}

export default function HijriLiveClock({ className = '' }: { className?: string }) {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted || !currentTime) {
    return (
      <div className={`flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>হিজরি ক্যালেন্ডার লোড হচ্ছে...</span>
      </div>
    );
  }

  const isBn = language === 'bn';
  const isAr = language === 'ar';

  // Live Time Formatting
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const ampm = hours >= 12 ? (isBn ? 'অপরাহ্ন' : 'PM') : (isBn ? 'পূর্বাহ্ন' : 'AM');
  const formattedHours = hours % 12 || 12;
  const timeStringRaw = `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
  const timeString = isBn ? toBengaliNumerals(timeStringRaw) : timeStringRaw;

  // Gregorian Date Formatting
  const gregorianDate = currentTime.toLocaleDateString(
    isBn ? 'bn-BD' : isAr ? 'ar-SA' : 'en-US',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  );

  // Hijri Date
  const hijriString = getHijriDate(currentTime, language);

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-emerald-50/90 dark:bg-slate-800/90 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs backdrop-blur-sm transition-all text-xs ${className}`}
      title="বর্তমান সময়, ইংরেজি ও ইসলামিক হিজরি তারিখ"
    >
      {/* Live Time with Pulsing Dot */}
      <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-950 dark:text-emerald-300">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
        </span>
        <Clock size={13} className="text-emerald-700 dark:text-emerald-400" />
        <span>{timeString}</span>
      </div>

      <div className="h-3.5 w-[1px] bg-emerald-300 dark:bg-emerald-700/60 hidden sm:block" />

      {/* Gregorian Date */}
      <span className="text-gray-600 dark:text-gray-300 font-medium hidden md:inline">
        {gregorianDate}
      </span>

      <div className="h-3.5 w-[1px] bg-emerald-300 dark:bg-emerald-700/60" />

      {/* Islamic Hijri Date with Moon Icon */}
      <div className="flex items-center gap-1.5 font-bold text-[#065f46] dark:text-amber-300 bg-emerald-100/70 dark:bg-emerald-950/70 px-2 py-0.5 rounded-lg border border-emerald-300/60 dark:border-emerald-700/50">
        <Moon size={12} className="text-amber-600 dark:text-amber-300 fill-amber-500/20" />
        <span className="whitespace-nowrap">{hijriString}</span>
      </div>
    </div>
  );
}
