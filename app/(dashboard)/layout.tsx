'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import {
  Menu, X, Sun, Moon, LogOut, Info, Book,
  Users, Building2, UserCheck, Activity, DollarSign,
  MessageSquare, Briefcase, GraduationCap, Home,
  Settings, BookOpen, BedDouble, QrCode, Search
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import AboutModal from '@/components/AboutModal';
import HijriLiveClock from '@/components/HijriLiveClock';
import CommandPalette from '@/components/CommandPalette';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const {
    instituteCategory,
    darkMode,
    setDarkMode,
    instituteSettings
  } = useApp();

  const { language, setLanguage } = useLanguage();

  const t = translations[language as keyof typeof translations] || translations.bn;
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global Ctrl + K / Cmd + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('taleem_session');
    router.push('/login');
  };

  type NavLink = { name: string; icon: React.ReactNode; href: string };

  const getNavLinks = (): NavLink[] => {
    switch (instituteCategory) {
      case 'qawmi':
        return [
          { name: t.qawmi_dashboard, icon: <Home size={18} />, href: '/' },
          { name: t.qawmi_admissions, icon: <Users size={18} />, href: '/admission' },
          { name: t.qawmi_students_list, icon: <GraduationCap size={18} />, href: '/students' },
          { name: t.qawmi_id_cards, icon: <BookOpen size={18} />, href: '/id-cards' },
          { name: t.qawmi_talimat, icon: <Book size={18} />, href: '/talimat' },
          { name: t.qawmi_hifz, icon: <Activity size={18} />, href: '/hifz-tracker' },
          { name: t.qawmi_tarbiyat, icon: <UserCheck size={18} />, href: '/namaz-tarbiyat' },
          { name: t.qawmi_darul_iqama, icon: <BedDouble size={18} />, href: '/boarding-mess' },
          { name: t.qawmi_meal_scanner || 'কিউআর ও খাবার স্ক্যানার', icon: <QrCode size={18} />, href: '/meal-scanner' },
          { name: t.qawmi_baitul_mal, icon: <DollarSign size={18} />, href: '/finance-fees' },
          { name: t.qawmi_data_fund, icon: <Briefcase size={18} />, href: '/donors-zakat' },
          { name: t.qawmi_sms, icon: <MessageSquare size={18} />, href: '/sms-engine' },
          { name: t.qawmi_settings, icon: <Settings size={18} />, href: '/settings' },
        ];
      case 'alia':
        return [
          { name: t.alia_dashboard, icon: <Home size={18} />, href: '/' },
          { name: t.alia_admissions, icon: <Users size={18} />, href: '/admission' },
          { name: t.alia_students_list, icon: <GraduationCap size={18} />, href: '/students' },
          { name: t.alia_id_cards, icon: <BookOpen size={18} />, href: '/id-cards' },
          { name: t.qawmi_meal_scanner || 'কিউআর ও খাবার স্ক্যানার', icon: <QrCode size={18} />, href: '/meal-scanner' },
          { name: t.alia_academic, icon: <Book size={18} />, href: '/talimat' },
          { name: t.alia_hostel, icon: <Building2 size={18} />, href: '/boarding-mess' },
          { name: t.alia_discipline, icon: <UserCheck size={18} />, href: '/namaz-tarbiyat' },
          { name: t.alia_finance, icon: <DollarSign size={18} />, href: '/finance-fees' },
          { name: t.alia_sms, icon: <MessageSquare size={18} />, href: '/sms-engine' },
          { name: t.alia_settings, icon: <Settings size={18} />, href: '/settings' },
        ];
      case 'school':
        return [
          { name: t.school_dashboard, icon: <Home size={18} />, href: '/' },
          { name: t.school_admissions, icon: <Users size={18} />, href: '/admission' },
          { name: t.school_students_list, icon: <GraduationCap size={18} />, href: '/students' },
          { name: t.school_id_cards, icon: <BookOpen size={18} />, href: '/id-cards' },
          { name: t.qawmi_meal_scanner || 'কিউআর ও খাবার স্ক্যানার', icon: <QrCode size={18} />, href: '/meal-scanner' },
          { name: t.school_academic, icon: <Book size={18} />, href: '/talimat' },
          { name: t.school_hostel, icon: <Building2 size={18} />, href: '/boarding-mess' },
          { name: t.school_finance, icon: <DollarSign size={18} />, href: '/finance-fees' },
          { name: t.school_sms, icon: <MessageSquare size={18} />, href: '/sms-engine' },
          { name: t.school_settings, icon: <Settings size={18} />, href: '/settings' },
        ];
      default:
        return [
          { name: t.dashboard, icon: <Home size={18} />, href: '/' },
          { name: t.students, icon: <Users size={18} />, href: '/students' },
          { name: t.settings, icon: <Settings size={18} />, href: '/settings' },
        ];
    }
  };

  const navLinks = getNavLinks();
  const isRtl = language === 'ar';
  const instituteName = instituteSettings.name || t.taleemErp;

  // Get first letter of institute name for avatar
  const adminInitial = instituteName.charAt(0) || (language === 'ar' ? 'ت' : language === 'en' ? 'T' : 'ত');

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex w-full">

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ─── SIDEBAR ─── */}
        <aside className={`
          fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-30
          w-64 bg-slate-900 text-white
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:static md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')}
        `}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700 min-h-[64px]">
            <div className="flex items-center gap-2.5 min-w-0">
              {instituteSettings.logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={instituteSettings.logo}
                  alt="Logo"
                  className="w-8 h-8 flex-shrink-0 object-contain bg-white rounded-full p-0.5"
                />
              ) : (
                <div className="w-8 h-8 flex-shrink-0 bg-emerald-600 rounded-full flex items-center justify-center">
                  <Book size={16} />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight truncate text-white" title={instituteName}>
                  {instituteName}
                </p>
                <p className="text-xs text-emerald-400 leading-tight">{t.taleemErp}</p>
              </div>
            </div>
            <button
              className="md:hidden flex-shrink-0 text-slate-400 hover:text-white p-1"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 px-2">
            <ul className="space-y-0.5">
              {navLinks.map((link, idx) => {
                const isActive = pathname === link.href;
                return (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                        transition-all duration-150 leading-snug
                        ${isActive
                          ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }
                      `}
                    >
                      <span className="flex-shrink-0">{link.icon}</span>
                      <span className="truncate">{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="px-3 py-3 border-t border-slate-700 space-y-3">
            {/* Language switcher */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 gap-1">
              {(['bn', 'en', 'ar'] as const).map((lang) => {
                const labels = { bn: 'বাং', en: 'EN', ar: 'عربي' };
                return (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`flex-1 py-1 text-xs font-semibold rounded transition ${
                      language === lang
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {labels[lang]}
                  </button>
                );
              })}
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
                {darkMode ? t.light : t.dark}
              </button>
              <button
                onClick={() => setShowDevModal(true)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition"
              >
                <Info size={15} />
                {t.aboutDeveloper}
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-sm bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white py-2 rounded-lg transition"
            >
              <LogOut size={16} />
              {t.logout}
            </button>
          </div>
        </aside>

        {/* ─── MAIN CONTENT ─── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Top Navbar */}
          <header className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700 h-16 flex items-center justify-between px-3 sm:px-5 flex-shrink-0 z-10 gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <button
                className="md:hidden text-gray-600 dark:text-gray-300 flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
              <div className="min-w-0">
                <h1 className="text-base font-bold text-gray-800 dark:text-white leading-tight truncate">
                  {t.dashboard}
                </h1>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight truncate hidden sm:block">
                  {instituteName}
                </p>
              </div>
            </div>

            {/* Center: Live Hijri Date & Live Clock Badge (Visible on desktop & tablet) */}
            <div className="hidden lg:flex items-center justify-center">
              <HijriLiveClock />
            </div>

            {/* Right: Global Command Palette Search & Admin Avatar */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Quick Search Trigger (Ctrl + K) */}
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-semibold transition border border-gray-200/80 dark:border-slate-600 shadow-2xs group"
                title="স্মার্ট গ্লোবাল সার্চ (Ctrl + K)"
              >
                <Search size={14} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">দ্রুত খুঁজুন...</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white dark:bg-slate-800 text-[10px] font-mono text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700 rounded shadow-2xs">
                  Ctrl K
                </kbd>
              </button>

              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {adminInitial}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6 text-gray-900 dark:text-gray-100">
            {children}
          </main>

          {/* Footer */}
          <div className="pb-16 md:pb-0">
            <Footer onOpenAbout={() => setShowDevModal(true)} />
          </div>

          {/* Mobile Bottom Navigation Bar (Smartphones only) */}
          <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 z-20 flex justify-around items-center px-1 py-1 shadow-lg">
            <Link
              href="/"
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition ${
                pathname === '/' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Home size={19} />
              <span className="mt-0.5">{language === 'bn' ? 'হোম' : language === 'ar' ? 'الرئيسية' : 'Home'}</span>
            </Link>

            <Link
              href="/students"
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition ${
                pathname === '/students' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <GraduationCap size={19} />
              <span className="mt-0.5">{language === 'bn' ? 'ছাত্র' : language === 'ar' ? 'الطلاب' : 'Students'}</span>
            </Link>

            {/* Quick Action Center: Camera QR Scanner */}
            <Link
              href="/meal-scanner"
              className="flex flex-col items-center justify-center -mt-3.5 px-2"
            >
              <div className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg border-[3px] border-white dark:border-slate-900 active:scale-95 transition-transform">
                <QrCode size={20} />
              </div>
              <span className={`text-[10px] font-bold mt-0.5 ${
                pathname === '/meal-scanner' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-300'
              }`}>
                {language === 'bn' ? 'হাজিরা' : language === 'ar' ? 'الحضور' : 'Scan'}
              </span>
            </Link>

            <Link
              href="/hifz-tracker"
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition ${
                pathname === '/hifz-tracker' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Activity size={19} />
              <span className="mt-0.5">{language === 'bn' ? 'হিফজ' : language === 'ar' ? 'الحفظ' : 'Hifz'}</span>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold text-gray-500 dark:text-gray-400"
            >
              <Menu size={19} />
              <span className="mt-0.5">{language === 'bn' ? 'মেনু' : language === 'ar' ? 'القائمة' : 'Menu'}</span>
            </button>
          </nav>
        </div>

        {/* Developer Modal */}
        <AboutModal isOpen={showDevModal} onClose={() => setShowDevModal(false)} />

        {/* Global Command Palette (Ctrl + K) */}
        <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      </div>
    </div>
  );
}
