'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, X, GraduationCap, BookOpen, DollarSign, 
  Settings, Activity, MessageSquare, BedDouble, QrCode, 
  Home, Users, UserCheck, Briefcase, FileText, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'students' | 'jamats' | 'navigation' | 'finance';
  categoryLabelBn: string;
  icon: React.ReactNode;
  url: string;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Default dataset for instant comprehensive search
  const commandItems: CommandItem[] = useMemo(() => [
    // Navigation / Menus
    {
      id: 'nav-home',
      title: 'প্রধান ড্যাশবোর্ড',
      subtitle: 'সার্বিক চিত্র, পরিসংখ্যান ও কুইক অ্যাক্সেস',
      category: 'navigation',
      categoryLabelBn: 'নেভিগেশন ও মেনু',
      icon: <Home size={16} className="text-emerald-500" />,
      url: '/',
      keywords: ['home', 'dashboard', 'ড্যাশবোর্ড', 'হোম', 'প্রধান'],
    },
    {
      id: 'nav-admission',
      title: 'নতুন ছাত্র ভর্তি ফরম',
      subtitle: 'শিক্ষার্থী রেজিস্ট্রেশন ও ভর্তি ফি আদায়',
      category: 'navigation',
      categoryLabelBn: 'নেভিগেশন ও মেনু',
      icon: <Users size={16} className="text-blue-500" />,
      url: '/admission',
      keywords: ['admission', 'ভর্তি', 'নতুন ছাত্র', 'ফর্ম'],
    },
    {
      id: 'nav-students',
      title: 'ছাত্র তালিকা ও প্রোফাইল',
      subtitle: 'সকল জামাতের শিক্ষার্থীদের তথ্য ও সার্চ',
      category: 'navigation',
      categoryLabelBn: 'নেভিগেশন ও মেনু',
      icon: <GraduationCap size={16} className="text-indigo-500" />,
      url: '/students',
      keywords: ['students', 'ছাত্র', 'তালিকা', 'শিক্ষার্থী', 'স্টুডেন্ট'],
    },
    {
      id: 'nav-idcards',
      title: 'স্মার্ট আইডি কার্ড ও কিউআর কোড',
      subtitle: 'ডিজিটাল পিভিসি আইডি কার্ড জেনারেশন ও প্রিন্ট',
      category: 'navigation',
      categoryLabelBn: 'নেভিগেশন ও মেনু',
      icon: <BookOpen size={16} className="text-purple-500" />,
      url: '/id-cards',
      keywords: ['id card', 'আইডি কার্ড', 'পরিচয়পত্র', 'কিউআর', 'qr'],
    },
    {
      id: 'nav-talimat',
      title: 'তা\'লীমাত ও পরীক্ষা ফলাফল',
      subtitle: 'ক্লাস রুটিন, সিলেবাস ও অফিশিয়াল নম্বরপত্র/সনদ',
      category: 'navigation',
      categoryLabelBn: 'নেভিগেশন ও মেনু',
      icon: <FileText size={16} className="text-amber-500" />,
      url: '/talimat',
      keywords: ['talimat', 'তালিমাত', 'পরীক্ষা', 'নম্বরপত্র', 'মার্কশিট', 'রুটিন'],
    },
    {
      id: 'nav-hifz',
      title: 'হিফজুল কুরআন ট্র্যাকার',
      subtitle: 'সবক, সবকি ও আমপারা ট্র্যাকিং সিস্টেম',
      category: 'navigation',
      categoryLabelBn: 'নেভিগেশন ও মেনু',
      icon: <Activity size={16} className="text-teal-500" />,
      url: '/hifz-tracker',
      keywords: ['hifz', 'হিফজ', 'সবক', 'আমপারা', 'হাফেজ'],
    },
    {
      id: 'nav-namaz',
      title: 'নামায ও তরবিয়ত মনিটরিং',
      subtitle: 'পাঁচ ওয়াক্ত নামাযের জামাত উপস্থিতি ও আখলাক',
      category: 'navigation',
      categoryLabelBn: 'নেভিগেশন ও মেনু',
      icon: <UserCheck size={16} className="text-emerald-600" />,
      url: '/namaz-tarbiyat',
      keywords: ['namaz', 'নামায', 'তারবিয়াত', 'তরবিয়ত', 'উপস্থিতি', 'আখলাক'],
    },
    {
      id: 'nav-mess',
      title: 'দারুল ইকামা ও বোর্ডিং মেস',
      subtitle: 'খাবার মিল কাউন্টিং ও সিট বণ্টন',
      category: 'navigation',
      categoryLabelBn: 'নেভিগেশন ও মেনু',
      icon: <BedDouble size={16} className="text-rose-500" />,
      url: '/boarding-mess',
      keywords: ['mess', 'boarding', 'বোর্ডিং', 'মেস', 'খাবার', 'সিট'],
    },
    {
      id: 'nav-meal-scanner',
      title: 'কিউআর ও খাবার স্ক্যানার',
      subtitle: 'ক্যামেরা দিয়ে আইডি কার্ড স্ক্যান ও স্বয়ংক্রিয় মিল এন্ট্রি',
      category: 'navigation',
      categoryLabelBn: 'নেভিগেশন ও মেনু',
      icon: <QrCode size={16} className="text-cyan-500" />,
      url: '/meal-scanner',
      keywords: ['scanner', 'স্ক্যানার', 'কিউআর স্ক্যান', 'খাবার স্ক্যান'],
    },
    {
      id: 'nav-finance',
      title: 'বায়তুল মাল ও মাসিক ফিন্যান্স',
      subtitle: 'মাসিক সারসংক্ষেপ, দৈনিক ক্যাশ বহি ও বেতন আদায়',
      category: 'finance',
      categoryLabelBn: 'আর্থিক হিসাব ও রিপোর্ট',
      icon: <DollarSign size={16} className="text-emerald-500" />,
      url: '/finance-fees',
      keywords: ['finance', 'fees', 'আয় ব্যয়', 'বেতন', 'ক্যাশ বহি', 'বায়তুল মাল'],
    },
    {
      id: 'nav-donors',
      title: 'দান ও যাকাত ফান্ড (ডোনার তালিকা)',
      subtitle: 'লিল্লাহ ফান্ড, যাকাত দাতা ও রসিদ',
      category: 'finance',
      categoryLabelBn: 'আর্থিক হিসাব ও রিপোর্ট',
      icon: <Briefcase size={16} className="text-orange-500" />,
      url: '/donors-zakat',
      keywords: ['donor', 'zakat', 'দান', 'যাকাত', 'ডোনার', 'লিল্লাহ'],
    },
    {
      id: 'nav-sms',
      title: 'বাল্ক এসএমএস ইঞ্জিন',
      subtitle: 'অভিভাবকদের নামায, ফি ও ছুটির জরুরি নোটিশ প্রেরণ',
      category: 'navigation',
      categoryLabelBn: 'নেভিগেশন ও মেনু',
      icon: <MessageSquare size={16} className="text-pink-500" />,
      url: '/sms-engine',
      keywords: ['sms', 'এসএমএস', 'মেসেজ', 'নোটিশ'],
    },
    {
      id: 'nav-settings',
      title: 'মাদ্রাসা সেটিংস ও কনফিগারেশন',
      subtitle: 'প্রতিষ্ঠানের নাম, লোগো, সিলেবাস ও সিস্টেম ব্যাকআপ',
      category: 'navigation',
      categoryLabelBn: 'নেভিগেশন ও মেনু',
      icon: <Settings size={16} className="text-slate-500" />,
      url: '/settings',
      keywords: ['settings', 'সেটিংস', 'মাদ্রাসা নাম', 'লোগো'],
    },

    // Students
    {
      id: 'student-burhan',
      title: 'বুরহান উদ্দিন (Burhan Uddin)',
      subtitle: 'আইডি: 2026-IFT-6689 • জামাত: ইফতা (রক্ত: A+)',
      category: 'students',
      categoryLabelBn: 'শিক্ষার্থী',
      icon: <GraduationCap size={16} className="text-emerald-600" />,
      url: '/id-cards',
      keywords: ['বুরহান উদ্দিন', 'burhan uddin', '6689', 'ইফতা', 'ifta'],
    },
    {
      id: 'student-miraz',
      title: 'মেরাজুল ইসলাম (Merajul Islam)',
      subtitle: 'আইডি: 2026-FAZ-8775 • জামাত: মেশকাত (রক্ত: B+)',
      category: 'students',
      categoryLabelBn: 'শিক্ষার্থী',
      icon: <GraduationCap size={16} className="text-emerald-600" />,
      url: '/students',
      keywords: ['মেরাজুল ইসলাম', 'merajul', '8775', 'মেশকাত', 'mishkat'],
    },
    {
      id: 'student-tanvir',
      title: 'তানভীর আহমেদ (Tanvir Ahmed)',
      subtitle: 'আইডি: 2026-NUR-101 • জামাত: নূরানী (রক্ত: O+)',
      category: 'students',
      categoryLabelBn: 'শিক্ষার্থী',
      icon: <GraduationCap size={16} className="text-emerald-600" />,
      url: '/students',
      keywords: ['তানভীর আহমেদ', 'tanvir', '101', 'নূরানী', 'nurani'],
    },
    {
      id: 'student-abdullah',
      title: 'আব্দুল্লাহ আল মামুন (Abdullah Al Mamun)',
      subtitle: 'আইডি: 2026-MZN-104 • জামাত: মিজান (রক্ত: A+)',
      category: 'students',
      categoryLabelBn: 'শিক্ষার্থী',
      icon: <GraduationCap size={16} className="text-emerald-600" />,
      url: '/students',
      keywords: ['আব্দুল্লাহ', 'মামুন', 'abdullah', '104', 'মিজান', 'mizan'],
    },
    {
      id: 'student-mahmud',
      title: 'মাহমুদ হাসান (Mahmud Hasan)',
      subtitle: 'আইডি: 2026-HIF-302 • জামাত: হিফজখানা (রক্ত: AB+)',
      category: 'students',
      categoryLabelBn: 'শিক্ষার্থী',
      icon: <GraduationCap size={16} className="text-emerald-600" />,
      url: '/hifz-tracker',
      keywords: ['মাহমুদ হাসান', 'mahmud', '302', 'হিফজ', 'hifz'],
    },

    // Qawmi Jamats
    {
      id: 'jamat-nurani',
      title: 'নূরানী জামাত (Nurani)',
      subtitle: 'প্রাথমিক কুরআন ও কায়দা বিভাগ • বেতন ও ছাত্র তথ্য',
      category: 'jamats',
      categoryLabelBn: 'কওমি জামাতসমূহ',
      icon: <BookOpen size={16} className="text-emerald-500" />,
      url: '/finance-fees?jamat=নূরানী',
      keywords: ['নূরানী', 'nurani', 'noorani', 'কায়দা'],
    },
    {
      id: 'jamat-najera',
      title: 'নাজেরা জামাত (Najera)',
      subtitle: 'নাজেরা কুরআনুল কারীম বিভাগ • বেতন ও ছাত্র তথ্য',
      category: 'jamats',
      categoryLabelBn: 'কওমি জামাতসমূহ',
      icon: <BookOpen size={16} className="text-emerald-500" />,
      url: '/finance-fees?jamat=নাজেরা',
      keywords: ['নাজেরা', 'najera', 'nazera'],
    },
    {
      id: 'jamat-hifz',
      title: 'হিফজখানা (Hifz)',
      subtitle: 'হিফজুল কুরআনুল কারীম বিভাগ • বেতন ও ছাত্র তথ্য',
      category: 'jamats',
      categoryLabelBn: 'কওমি জামাতসমূহ',
      icon: <BookOpen size={16} className="text-emerald-500" />,
      url: '/finance-fees?jamat=হিফজ',
      keywords: ['হিফজ', 'হিফজখানা', 'hifz'],
    },
    {
      id: 'jamat-taysir',
      title: 'তাইসীর জামাত (Taysir)',
      subtitle: 'ফার্সি ও প্রাথমিক আরবি ব্যাকরণ • বেতন ও ছাত্র তথ্য',
      category: 'jamats',
      categoryLabelBn: 'কওমি জামাতসমূহ',
      icon: <BookOpen size={16} className="text-teal-500" />,
      url: '/finance-fees?jamat=তাইসীর',
      keywords: ['তাইসীর', 'taysir', 'taiseer'],
    },
    {
      id: 'jamat-mizan',
      title: 'মিজান জামাত (Mizan)',
      subtitle: 'মিজানুস সরফ ও মুনশাইব • বেতন ও ছাত্র তথ্য',
      category: 'jamats',
      categoryLabelBn: 'কওমি জামাতসমূহ',
      icon: <BookOpen size={16} className="text-teal-500" />,
      url: '/finance-fees?jamat=মিজান',
      keywords: ['মিজান', 'mizan', 'মিজানুস সরফ'],
    },
    {
      id: 'jamat-nahwmeer',
      title: 'নাহবেমীর জামাত (Nahwmeer)',
      subtitle: 'নাহবেমীর আরবি ব্যাকরণ • বেতন ও ছাত্র তথ্য',
      category: 'jamats',
      categoryLabelBn: 'কওমি জামাতসমূহ',
      icon: <BookOpen size={16} className="text-cyan-500" />,
      url: '/finance-fees?jamat=নাহবেমীর',
      keywords: ['নাহবেমীর', 'nahwmeer', 'nahbemeer'],
    },
    {
      id: 'jamat-hidayatun',
      title: 'হেদায়াতুন্নাহু জামাত (Hidayatun Nahw)',
      subtitle: 'হেদায়াতুন্নাহু কিতাব বিভাগ • বেতন ও ছাত্র তথ্য',
      category: 'jamats',
      categoryLabelBn: 'কওমি জামাতসমূহ',
      icon: <BookOpen size={16} className="text-cyan-500" />,
      url: '/finance-fees?jamat=হেদায়াতুন্নাহু',
      keywords: ['হেদায়াতুন্নাহু', 'hidayatun nahw', 'hedayatun'],
    },
    {
      id: 'jamat-kafiya',
      title: 'কাফিয়া জামাত (Kafiya)',
      subtitle: 'কাফিয়া ইবনে হাজিব • বেতন ও ছাত্র তথ্য',
      category: 'jamats',
      categoryLabelBn: 'কওমি জামাতসমূহ',
      icon: <BookOpen size={16} className="text-blue-500" />,
      url: '/finance-fees?jamat=কাফিয়া',
      keywords: ['কাফিয়া', 'কাফিয়া', 'kafiya', 'kafia'],
    },
    {
      id: 'jamat-sharh-jami',
      title: 'শরহে জামী জামাত (Sharh Jami)',
      subtitle: 'শরহে মোল্লা জামী • বেতন ও ছাত্র তথ্য',
      category: 'jamats',
      categoryLabelBn: 'কওমি জামাতসমূহ',
      icon: <BookOpen size={16} className="text-blue-500" />,
      url: '/finance-fees?jamat=শরহে জামী',
      keywords: ['শরহে জামী', 'জামী', 'sharh jami'],
    },
    {
      id: 'jamat-sharh-bekaya',
      title: 'শরহে বেকায়া জামাত (Sharh Bekaya)',
      subtitle: 'ফিকহ ও উসূলে ফিকহ বিভাগ • বেতন ও ছাত্র তথ্য',
      category: 'jamats',
      categoryLabelBn: 'কওমি জামাতসমূহ',
      icon: <BookOpen size={16} className="text-indigo-500" />,
      url: '/finance-fees?jamat=শরহে বেকায়া',
      keywords: ['শরহে বেকায়া', 'বেকায়া', 'sharh bekaya'],
    },
    {
      id: 'jamat-jalalain',
      title: 'জালালাইন জামাত (Jalalain)',
      subtitle: 'তাফসিরে জালালাইন বিভাগ • বেতন ও ছাত্র তথ্য',
      category: 'jamats',
      categoryLabelBn: 'কওমি জামাতসমূহ',
      icon: <BookOpen size={16} className="text-indigo-500" />,
      url: '/finance-fees?jamat=জালালাইন',
      keywords: ['জালালাইন', 'jalalain', 'তাফসির'],
    },
    {
      id: 'jamat-mishkat',
      title: 'মেশকাত জামাত (Mishkat)',
      subtitle: 'মেশকাতুল মাসাবীহ হাদিস বিভাগ • বেতন ও ছাত্র তথ্য',
      category: 'jamats',
      categoryLabelBn: 'কওমি জামাতসমূহ',
      icon: <BookOpen size={16} className="text-violet-500" />,
      url: '/finance-fees?jamat=মেশকাত',
      keywords: ['মেশকাত', 'মিশকাত', 'mishkat'],
    },
    {
      id: 'jamat-dawrah',
      title: 'দাওরায়ে হাদিস / তাকমীল (Dawrah-e-Hadith)',
      subtitle: 'সিহাহ সিত্তাহ মাস্টার্স সমমান • বেতন ও ছাত্র তথ্য',
      category: 'jamats',
      categoryLabelBn: 'কওমি জামাতসমূহ',
      icon: <BookOpen size={16} className="text-purple-600" />,
      url: '/finance-fees?jamat=দাওরায়ে হাদিস / তাকমীল',
      keywords: ['দাওরায়ে হাদিস', 'দাওরা', 'তাকমীল', 'dawrah', 'takmil'],
    },
    {
      id: 'jamat-ifta',
      title: 'ইফতা বিভাগ (Ifta)',
      subtitle: 'উচ্চতর ফতোয়া ও গবেষণা বিভাগ • বেতন ও ছাত্র তথ্য',
      category: 'jamats',
      categoryLabelBn: 'কওমি জামাতসমূহ',
      icon: <BookOpen size={16} className="text-amber-600" />,
      url: '/finance-fees?jamat=ইফতা',
      keywords: ['ইফতা', 'ifta', 'ফতোয়া', 'মুফতি'],
    },
  ], []);

  // Filter items according to search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return commandItems.slice(0, 10);
    }
    const query = searchQuery.toLowerCase().trim();
    return commandItems.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchSubtitle = item.subtitle?.toLowerCase().includes(query);
      const matchKeywords = item.keywords?.some((k) => k.toLowerCase().includes(query));
      return matchTitle || matchSubtitle || matchKeywords;
    });
  }, [commandItems, searchQuery]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Keyboard navigation within list
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  const handleSelect = (item: CommandItem) => {
    onClose();
    router.push(item.url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <Search size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="যেকোনো ছাত্র, জামাত (মিজান, ইফতা) বা মেনু খুঁজুন..."
            className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-semibold text-gray-500 bg-white dark:bg-slate-800 dark:text-gray-400 border border-gray-200 dark:border-slate-700 rounded shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="max-h-[380px] overflow-y-auto p-2 divide-y divide-gray-100 dark:divide-slate-800/60"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-gray-400 dark:text-gray-500 space-y-1">
              <Search size={32} className="mx-auto text-gray-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold">কোনো ফলাফল পাওয়া যায়নি</p>
              <p className="text-xs">সঠিক নাম, আইডি বা জামাত লিখে পুনরায় অনুসন্ধান করুন</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-white'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-800/60 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isSelected
                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-tight truncate">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      item.category === 'students'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                        : item.category === 'jamats'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        : item.category === 'finance'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    }`}>
                      {item.categoryLabelBn}
                    </span>
                    {isSelected && (
                      <CornerDownLeft size={14} className="text-emerald-600 dark:text-emerald-400 hidden sm:inline" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-200 dark:border-slate-800 text-[11px] text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border rounded font-mono shadow-2xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border rounded font-mono shadow-2xs">↓</kbd>
              নির্বাচন
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border rounded font-mono shadow-2xs">↵</kbd>
              যাওয়ার জন্য
            </span>
          </div>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            তা'লীম ইআরপি স্মার্ট সার্চ
          </span>
        </div>
      </div>
    </div>
  );
}
