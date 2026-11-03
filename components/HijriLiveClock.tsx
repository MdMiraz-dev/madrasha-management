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
      const bnMonth = HIJRI_MONTHS_BN[monthIndex] || 'জমাদিউল আউয়াল';
      const bnYear = toBengaliNumerals(yearPart);
      return `${bnDay} ${bnMonth} ${bnYear} হিজরি`;
    } else if (lang === 'ar') {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } else {
      const enMonth = HIJRI_MONTHS_EN[monthIndex] || 'Jumada al-Awwal';
      return `${dayNum} ${enMonth} ${yearPart} AH`;
    }
  } catch {
    return lang === 'bn' ? '২৩ জমাদিউল আউয়াল ১৪৪৮ হিজরি' : '23 Jumada al-Awwal 1448 AH';
  }
}

interface HijriLiveClockProps {
  className?: string;
  variant?: 'default' | 'banner';
}

export default function HijriLiveClock({ className = '', variant = 'default' }: HijriLiveClockProps) {
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
      <div className={`flex items-center gap-2 text-xs font-bold text-white ${className}`}>
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span>সময় লোড হচ্ছে...</span>
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

  if (variant === 'banner') {
    return (
      <div
        className={`inline-flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-950/70 border border-white/30 shadow-lg backdrop-blur-md text-xs sm:text-sm text-white ${className}`}
        title="বর্তমান সময়, ইংরেজি ও ইসলামিক হিজরি তারিখ"
      >
        {/* Live Time with Pulsing Bright Neon Dot */}
        <div className="flex items-center gap-2 font-mono font-black text-white tracking-wide">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-90"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
          </span>
          <Clock size={15} className="text-amber-300" />
          <span>{timeString}</span>
        </div>

        <div className="h-4 w-[1px] bg-white/40 hidden sm:block" />

        {/* Gregorian Date */}
        <span className="text-white font-bold text-xs sm:text-sm hidden md:inline">
          {gregorianDate}
        </span>

        <div className="h-4 w-[1px] bg-white/40" />

        {/* Islamic Hijri Date with Moon Icon - High Contrast Gold Badge */}
        <div className="flex items-center gap-1.5 font-black text-slate-950 bg-amber-400 px-3 py-1 rounded-lg border border-amber-300 shadow-sm text-xs sm:text-sm whitespace-nowrap">
          <Moon size={14} className="text-slate-950 fill-slate-950" />
          <span>{hijriString}</span>
        </div>
      </div>
    );
  }

  // Default navbar appearance (Crisp, High Contrast)
  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xs text-xs ${className}`}
      title="বর্তমান সময়, ইংরেজি ও ইসলামিক হিজরি তারিখ"
    >
      {/* Live Time */}
      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-emerald-300">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
        </span>
        <Clock size={14} className="text-emerald-700 dark:text-emerald-400" />
        <span>{timeString}</span>
      </div>

      <div className="h-3.5 w-[1px] bg-slate-300 dark:bg-slate-600 hidden sm:block" />

      {/* Gregorian Date */}
      <span className="text-slate-700 dark:text-slate-200 font-semibold hidden md:inline">
        {gregorianDate}
      </span>

      <div className="h-3.5 w-[1px] bg-slate-300 dark:bg-slate-600" />

      {/* Islamic Hijri Date */}
      <div className="flex items-center gap-1.5 font-bold text-white bg-emerald-700 dark:bg-emerald-600 px-2.5 py-0.5 rounded-lg shadow-xs whitespace-nowrap">
        <Moon size={13} className="text-amber-300 fill-amber-300" />
        <span>{hijriString}</span>
      </div>
    </div>
  );
}
