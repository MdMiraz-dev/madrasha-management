'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, ChevronRight, ChevronLeft, X, 
  Sparkles, CheckCircle2, Award, Zap, BookOpen, GraduationCap, 
  School, Building, ArrowRight, ShieldCheck, Flame, Star, MessageSquare,
  Landmark, MapPin, Check, Clock, TrendingUp, DollarSign, Users,
  FileText, QrCode, PhoneCall, ShieldAlert, HeartHandshake, Layers
} from 'lucide-react';
import Link from 'next/link';

interface SliceVideo {
  id: number;
  title: string;
  subtitle: string;
  category: 'কওমি মাদ্রাসা' | 'আলিয়া মাদ্রাসা' | 'জেনারেল স্কুল' | 'সুবিধাসমূহ' | 'সার্বজনীন';
  categoryColor: string;
  duration: number; // in seconds
  bgGradient: string;
  accentColor: string;
  badge: string;
  imageUrl: string;
  imageAlt: string;
  locationBadge: string;
  narrationText: string;
  highlights: string[];
  benefits: { icon: string; title: string; desc: string }[];
  statBadge: string;
  videoCaption: string;
  description: string;
  mockupContent: {
    icon: React.ReactNode;
    heading: string;
    subheading: string;
    metrics: { label: string; val: string }[];
  };
}

const SLICE_VIDEOS: SliceVideo[] = [
  {
    id: 1,
    title: 'কওমি মাদ্রাসা ডিজিটাল অটোমেশন ও পরিচালন ব্যবস্থা',
    subtitle: 'আপনার কওমি মাদ্রাসার তারবিয়াত, তালীমাত, বোর্ডিং ও প্রশাসনিক নিয়ম-কানুনকে আরও সুন্দর, নিখুঁত ও শৃঙ্খলাবদ্ধ করার ১ নম্বর মাধ্যম',
    category: 'কওমি মাদ্রাসা',
    categoryColor: 'bg-emerald-400 text-slate-950 font-bengali font-black',
    duration: 9,
    bgGradient: 'from-emerald-950 via-slate-900 to-slate-950',
    accentColor: '#10b981',
    badge: '🕌 কওমি নিসাবের অত্যন্ত উপযোগী ও গুরুত্বপূর্ণ প্ল্যাটফর্ম',
    imageUrl: '/images/hathazari_madrasa.jpg',
    imageAlt: 'কওমি মাদ্রাসা প্রাঙ্গণ ও সুশৃঙ্খল পরিবেশ',
    locationBadge: '🕌 কওমি মাদ্রাসা - সুশৃঙ্খল পরিবেশ ও দ্বীনি শিক্ষাঙ্গন',
    narrationText: 'কওমি মাদ্রাসার তালীমাত, হিফজ সবক, লিল্লাহ বোর্ডিং ও যাকাত ফান্ডের সূক্ষ্ম হিসাব সংরক্ষণে এটি অনন্য সহকারী।',
    highlights: [
      '📖 নূরানী, নাজেরা, হিফজ থেকে দাওরায়ে হাদিস ও ইফতা সকল জামাতের তালীমাত',
      '🍛 লিল্লাহ বোর্ডিং, মেস বাজার অডিট ও দৈনিক খোরাকি হিসাব অত্যন্ত স্বচ্ছতার সাথে',
      '🕋 যাকাত, লিল্লাহ ও সাধারণ ফান্ডের পৃথক শরয়ী ক্যাশবহি ও অটোমেটিক হিসাব',
      '🕌 ৫ ওয়াক্ত সালাত ও আমল তারবিয়াত ডিজিটাল স্কোরিং ব্যবস্থা'
    ],
    benefits: [
      { icon: '📖', title: 'হিফজ ও তালীমাত ট্র্যাকার', desc: 'দৈনিক সবক, সবকি, আমুখতা ও মুমতাজ-রাসিব কওমি রেজাল্ট শিট' },
      { icon: '🍛', title: 'লিল্লাহ বোর্ডিং অডিট', desc: 'দৈনিক মেস বাজার ও খোরাকি ক্যাটাগরি স্বচ্ছতার সাথে নিরূপণ' },
    ],
    description: 'আপনার কওমি মাদ্রাসার সকল নিয়ম-কানুন, তালীমাত, কিতাব বিভাগ, হিফজ ট্র্যাকার ও আর্থিক স্বচ্ছতা শতভাগ রক্ষা করতে এটি একটি অত্যন্ত প্রয়োজনীয় ও অনন্য সহায়তাকারী প্ল্যাটফর্ম।',
    statBadge: 'কওমি ধারার ১ নম্বর অল-ইন-ওয়ান সিস্টেম',
    videoCaption: '🎬 স্লাইস ১/৫: কওমি মাদ্রাসার জন্য শতভাগ উপযুক্ত ও সুনির্দিষ্ট ব্যবস্থাপনা!',
    mockupContent: {
      icon: <BookOpen className="w-8 h-8 text-emerald-300" />,
      heading: 'কওমি তালীমাত ও বোর্ডিং',
      subheading: 'নূরানী, নাজেরা, হিফজ ও কিতাবখানা',
      metrics: [
        { label: 'জামাত সাপোর্ট', val: '১৪ টি' },
        { label: 'ফান্ড হিসাব', val: 'শরিয়াহ সম্মত' },
        { label: 'হিফজ ট্র্যাকার', val: 'অটো সবক' },
      ],
    },
  },
  {
    id: 2,
    title: 'আলিয়া মাদ্রাসা একাডেমিক ও প্রশাসনিক ম্যানেজমেন্ট',
    subtitle: 'আলিয়া নিসাবের ইবতেদায়ী থেকে কামিল শ্রেণি পর্যন্ত প্রশাসনিক ও শিক্ষা সংক্রান্ত সকল কাজ সহজ করার সেরা ডিজিটাল সমাধান',
    category: 'আলিয়া মাদ্রাসা',
    categoryColor: 'bg-blue-400 text-slate-950 font-bengali font-black',
    duration: 9,
    bgGradient: 'from-blue-950 via-slate-900 to-slate-950',
    accentColor: '#3b82f6',
    badge: '🎓 আলিয়া মাদ্রাসা বোর্ড সাপোর্ট',
    imageUrl: '/images/dhaka_alia_madrasa.jpg',
    imageAlt: 'আলিয়া মাদ্রাসা শিক্ষা ভবন ও পরিবেশ',
    locationBadge: '🎓 আলিয়া মাদ্রাসা - একাডেমিক ভবন ও ক্লাস হাব',
    narrationText: 'আলিয়া নিসাবের ইবতেদায়ী থেকে কামিল পর্যন্ত জিপিএ ৫.০ গ্রেডিং, সেমিস্টার ফি ও প্রশাসনিক কাজ সহজ করার ডিজিটাল ব্যবস্থা।',
    highlights: [
      '📜 ইবতেদায়ী, দাখিল, আলিম, ফাজিল ও কামিল শ্রেণির জিপিএ ৫.০ বোর্ড গ্রেডিং',
      '🏢 ছাত্রাবাস সিট বরাদ্দ, অনলাইন সেমিস্টার ফি ও রসিদ ব্যবস্থাপনা',
      '👨‍🏫 উস্তাদ ও খাদেমগণের বায়োমেট্রিক হাজিরা ও সম্মানী ট্র্যাকিং',
      '📊 ডিজিটাল ফি কালেকশন ও নিখুঁত অটোমেটিক অডিট রেজুলেশন'
    ],
    benefits: [
      { icon: '📜', title: 'জিপিএ ৫.০ গ্রেডিং', desc: 'বোর্ড কারিকুলাম অনুযায়ী অটোমেটিক রেজাল্ট ও মার্কশিট প্রিন্ট' },
      { icon: '💳', title: 'অনলাইন ফি রসিদ', desc: 'শিক্ষার্থীদের ডিজিটাল মানি রিসিট ও বকেয়া তাগাদা সিস্টেম' },
    ],
    description: 'সারাদেশের আলিয়া মাদ্রাসাসমূহের আধুনিক ক্লাসরুম, সেমিস্টার পরীক্ষা, ছাত্রাবাস এবং প্রশাসনিক সকল কার্যক্রম নিমেষেই সম্পন্ন করার ডিজিটাল প্ল্যাটফর্ম।',
    statBadge: 'আলিয়া বোর্ড গ্রেডিং ও রেজাল্ট হাব',
    videoCaption: '🎬 স্লাইস ২/৫: আলিয়া মাদ্রাসার প্রাতিষ্ঠানিক উৎকর্ষতার আধুনিক ডিজিটাল রূপায়ণ!',
    mockupContent: {
      icon: <GraduationCap className="w-8 h-8 text-blue-300" />,
      heading: 'আলিয়া একাডেমিক হাব',
      subheading: 'ইবতেদায়ী থেকে কামিল ডিগ্রি',
      metrics: [
        { label: 'জিপিএ স্কেল', val: '৫.০' },
        { label: 'অনলাইন ফি', val: 'ইনস্ট্যান্ট' },
        { label: 'রিপোর্ট কার্ড', val: '১-ক্লিক' },
      ],
    },
  },
  {
    id: 3,
    title: 'জেনারেল স্কুল ও কিন্ডারগার্টেন স্মার্ট সলিউশন',
    subtitle: 'প্লে, নার্সারি থেকে ১০ম শ্রেণি - অভিভাবক হোয়াটসঅ্যাপ কানেক্ট ও ডিজিটাল স্মার্ট আইডি কার্ড',
    category: 'জেনারেল স্কুল',
    categoryColor: 'bg-purple-400 text-slate-950 font-bengali font-black',
    duration: 9,
    bgGradient: 'from-purple-950 via-indigo-950 to-slate-950',
    accentColor: '#8b5cf6',
    badge: '🏫 জেনারেল স্কুল ও কেজি ফ্রেন্ডলি',
    imageUrl: '/images/dhaka_university_school.jpg',
    imageAlt: 'জেনারেল স্কুল ও কিন্ডারগার্টেন বিদ্যাপিঠ',
    locationBadge: '🏫 মডেল স্কুল ও কেজি - আধুনিক শিক্ষাঙ্গন',
    narrationText: 'কিন্ডারগার্টেন ও জেনারেল স্কুলের জন্য অটো হোয়াটসঅ্যাপ মেসেজিং, কিউআর আইডি কার্ড ও ফি ম্যানেজমেন্ট সিস্টেম।',
    highlights: [
      '🎒 প্লে, নার্সারি, কেজি থেকে ১০ম শ্রেণির স্মার্ট এডুকেশন সলিউশন',
      '📲 অনুপস্থিতির স্বয়ংক্রিয় হোয়াটসঅ্যাপ মেসেজ অভিভাবকের ফোনে',
      '🎴 ছবি ও কিউআর কোডসহ পেশাদার ডিজিটাল স্টুডেন্ট কার্ড প্রিন্ট',
      '🗓️ ডিজিটাল ক্লাস রুটিন, নোটিশ ও এসএমএস ব্রডকাস্ট'
    ],
    benefits: [
      { icon: '📲', title: 'পেরেন্ট হোয়াটসঅ্যাপ', desc: 'ছাত্র অনুপস্থিত থাকলে সাথে সাথে অভিভাবকের ফোনে অটোমেটিক মেসেজ' },
      { icon: '🎴', title: 'কিউআর আইডি কার্ড', desc: '১-ক্লিকে সকল শিক্ষার্থীর ছবি ও বারকোডসহ প্রফেশনাল আইডি কার্ড' },
    ],
    description: 'কিন্ডারগার্টেন ও কেজি স্কুল থেকে শুরু করে মাধ্যমিক বিদ্যালয়ের শিক্ষক, অভিভাবক ও শিক্ষার্থীদের মধ্যে ডিজিটাল সংযোগ স্থাপন এবং ফি ও হাজিরা পরিচালনায় অনন্য।',
    statBadge: 'স্মার্ট স্কুল অ্যান্ড কেজি কানেক্ট',
    videoCaption: '🎬 স্লাইস ৩/৫: আধুনিক কেজি ও জেনারেল স্কুলের ডিজিটালাইজেশনের সেরা সমাধান!',
    mockupContent: {
      icon: <School className="w-8 h-8 text-purple-300" />,
      heading: 'স্মার্ট স্কুল কানেক্ট',
      subheading: 'প্লে-১০ম শ্রেণি পেরেন্ট পোর্টাল',
      metrics: [
        { label: 'হোয়াটসঅ্যাপ', val: 'অটোমেটিক' },
        { label: 'আইডি কার্ড', val: 'কিউআর প্রিন্ট' },
        { label: 'হাজিরা', val: 'স্মার্ট নোটিশ' },
      ],
    },
  },
  {
    id: 4,
    title: 'তা\'লীম ইআরপি ব্যবহার করলে আপনার প্রতিষ্ঠান কী কী লাভবান হবে?',
    subtitle: 'মাদ্রাসা পরিচালনা পরিষদ, প্রিন্সিপাল, শিক্ষক ও অভিভাবকদের জন্য অপার সুবিধা',
    category: 'সুবিধাসমূহ',
    categoryColor: 'bg-amber-400 text-slate-950 font-bengali font-black',
    duration: 10,
    bgGradient: 'from-amber-950 via-slate-900 to-slate-950',
    accentColor: '#f59e0b',
    badge: '💎 প্রতিষ্ঠানের প্রধান প্রধান লাভ ও সুবিধা',
    imageUrl: '/images/hathazari_madrasa.jpg',
    imageAlt: 'মাদ্রাসা পরিচালনা ও আর্থিক স্বচ্ছতা',
    locationBadge: '🏆 শতভাগ হিসাবের স্বচ্ছতা ও সুশৃঙ্খল অডিট প্যানেল',
    narrationText: 'এই প্ল্যাটফর্ম ব্যবহার করলে আপনার সময় সাশ্রয় হবে, অডিটে এক টাকার গরমিল হবে না এবং অভিভাবকরা আপনার প্রতিষ্ঠানের উপর শতভাগ আস্থা রাখবেন।',
    highlights: [
      '🏆 প্রতিষ্ঠানের মর্যাদা বৃদ্ধি: আধুনিক স্মার্ট রসিদ ও পেশাদার আইডি কার্ডে সম্মান বৃদ্ধি পাবে',
      '⏱️ সময় ও পরিশ্রমের সাশ্রয়: হাতে লেখা রেজিস্ট্রারের বদলে ১ ক্লিকে রিপোর্ট পাবেন',
      '💰 শতভাগ স্বচ্ছ হিসাবরক্ষণ: কমিটি অডিটের জন্য ১ পৃষ্ঠার প্রমিত সারসংক্ষেপ স্টেটমেন্ট',
      '🤝 অভিভাবকের আস্থা অর্জন: হোয়াটসঅ্যাপে লাইভ বকেয়া তাগাদা ও উপস্থিতি বার্তা'
    ],
    benefits: [
      { icon: '🏆', title: '১ নম্বর ব্র্যান্ডিং', desc: 'আপনার মাদ্রাসা বা স্কুল এলাকার সর্বাধুনিক স্মার্ট ডিজিটাল প্রতিষ্ঠানে রূপ নেবে' },
      { icon: '📊', title: 'রেজুলেশন অডিট রিপোর্ট', desc: 'কমিটি মিটিংয়ে ১-ক্লিকে উপস্থাপনের জন্য প্রমিত মাসিক আয়-ব্যয় অডিট প্যানেল' },
    ],
    description: 'আপনার শিক্ষাপ্রতিষ্ঠানের মর্যাদা, বিশ্বাসযোগ্যতা এবং কার্যক্ষমতা বহুগুণ বাড়িয়ে এটি প্রতিষ্ঠানকে বাংলাদেশের শীর্ষস্থানে উন্নীত করে।',
    statBadge: 'স্মার্ট এডুকেশন গ্যারান্টি',
    videoCaption: '🎬 স্লাইস ৪/৫: শতভাগ প্রতিষ্ঠানের সন্তুষ্টি ও প্রশাসনিক উৎকর্ষতা!',
    mockupContent: {
      icon: <Award className="w-8 h-8 text-amber-300" />,
      heading: 'ইনস্ট্যান্ট প্রাতিষ্ঠানিক লাভ',
      subheading: 'অডিট, রেজুলেশন ও সততা',
      metrics: [
        { label: 'অডিট স্বচ্ছতা', val: '১০০%' },
        { label: 'অভিভাবক ট্রাস্ট', val: 'উচ্চতম' },
        { label: 'প্রিন্ট সাপোর্ট', val: 'POS/A4' },
      ],
    },
  },
  {
    id: 5,
    title: 'আজই আপনার প্রতিষ্ঠানের নামে অনলাইন অ্যাকাউন্ট চালু করুন!',
    subtitle: 'কোনো কারিগরি জটিলতা ছাড়াই মাত্র ২ মিনিটে অনলাইন সেটআপ সম্পন্ন করুন',
    category: 'সার্বজনীন',
    categoryColor: 'bg-amber-400 text-slate-950 font-bengali font-black',
    duration: 9,
    bgGradient: 'from-emerald-900 via-teal-950 to-slate-950',
    accentColor: '#10b981',
    badge: '🚀 ২ মিনিটে অনলাইন ইনস্ট্যান্ট সেটআপ',
    imageUrl: '/images/dhaka_alia_madrasa.jpg',
    imageAlt: 'তা\'লীম ইআরপি ডিজিটাল সেটআপ',
    locationBadge: '📍 অনলাইন ক্লাউড হাব - ২৪/৭ হেল্পলাইন: 01339564967',
    narrationText: 'আজই আপনার প্রতিষ্ঠানের নামে অনলাইন অ্যাকাউন্ট তৈরি করুন। যেকোনো সাহায্যে আমাদের সাপোর্ট টিম ২৪ ঘণ্টা আপনার পাশে আছে।',
    highlights: [
      '✅ ইনস্ট্যান্ট অনলাইন অ্যাকাউন্ট খুলে সরাসরি ব্যবহারের সুবিধা',
      '📞 ২৪/৭ অন-কল কাস্টমার সাপোর্ট ও সম্পূর্ণ বিনামূল্যে ট্রেনিং সাপোর্ট',
      '📱 মোবাইল, ট্যাব বা কম্পিউটার - যেকোনো ব্রাউজারে দ্রুত ও সহজে চলে',
      '🏆 আপনার প্রতিষ্ঠানকে করুন বাংলাদেশের ১ নম্বর ডিজিটাল মডেল প্রতিষ্ঠান'
    ],
    benefits: [
      { icon: '🚀', title: 'তাৎক্ষণিক চালু', desc: 'ক্লিক করেই ২ মিনিটে নিজের প্রতিষ্ঠানের নামে চালু করতে পারবেন' },
      { icon: '📞', title: '২৪/৭ ফ্রি হেল্পলাইন', desc: 'যেকোনো প্রয়োজনে সরাসরি ফোন করুন: 01339564967' },
    ],
    description: 'হাজারো প্রতিষ্ঠানের আস্থা অর্জিত বাংলাদেশের সেরা ইআরপি সিস্টেমে এখনই যুক্ত হয়ে আপনার প্রতিষ্ঠানের প্রশাসনিক কার্যক্রমকে গতিশীল করুন।',
    statBadge: '২৪/৭ ফ্রি হেল্পলাইন: 01339564967',
    videoCaption: '🎬 স্লাইস ৫/৫: এখনই আপনার প্রতিষ্ঠানের নামে রেজিস্টার করুন!',
    mockupContent: {
      icon: <Award className="w-8 h-8 text-amber-300" />,
      heading: 'তা\'লীম ইআরপি রেজিস্টার',
      subheading: 'আপনার প্রতিষ্ঠানের নতুন দিগন্ত',
      metrics: [
        { label: 'সেটআপ সময়', val: '২ মিনিট' },
        { label: 'হেল্পলাইন', val: '01339564967' },
        { label: 'ব্যবহার', val: 'সহজ ও নিরাপদ' },
      ],
    },
  },
];

interface LoginSliceVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToLogin: () => void;
}

export default function LoginSliceVideoModal({
  isOpen,
  onClose,
  onProceedToLogin,
}: LoginSliceVideoModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'reels' | 'features' | 'benefits'>('reels');

  const activeVideo = SLICE_VIDEOS[currentIndex];

  // Safe Speech Synthesis Utterance
  const speakNarration = (text: string) => {
    if (typeof window === 'undefined' || isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'bn-BD';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  // Trigger Voice Narration safely when unmuted
  useEffect(() => {
    if (isOpen && !isMuted && activeTab === 'reels') {
      speakNarration(activeVideo.narrationText);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }, [currentIndex, isOpen, isMuted, activeTab]);

  // Clean Progress Timer Engine (Prevents React State Update Loop Crash!)
  useEffect(() => {
    if (!isOpen || !isPlaying || activeTab !== 'reels') return;

    const durationMs = activeVideo.duration * 1000;
    const intervalTime = 100;
    const step = (intervalTime / durationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, isPlaying, isOpen, activeTab, activeVideo.duration]);

  // Handle Progress Completion & Slide Transition safely
  useEffect(() => {
    if (progress >= 100) {
      setProgress(0);
      setCurrentIndex((prev) => (prev < SLICE_VIDEOS.length - 1 ? prev + 1 : 0));
    }
  }, [progress]);

  // Reset progress when slide index changes manually
  const handleNext = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev < SLICE_VIDEOS.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : SLICE_VIDEOS.length - 1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-2 sm:p-4 overflow-hidden animate-in fade-in duration-300 font-bengali">
      
      {/* Background Animated Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${activeVideo.bgGradient} opacity-95 transition-all duration-700`} />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main Slice Video Container */}
      <div className="relative w-full max-w-5xl h-[94vh] sm:h-[88vh] bg-slate-900/90 rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col justify-between text-white backdrop-blur-md">
        
        {/* TOP REEL HEADER / STORY PROGRESS BARS & TAB SYSTEM */}
        <div className="relative z-20 p-3 sm:p-4 bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-transparent space-y-2 shrink-0">
          
          {/* Multi-story Progress Bars */}
          <div className="flex gap-1.5 w-full">
            {SLICE_VIDEOS.map((video, idx) => (
              <div
                key={video.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setProgress(0);
                  setActiveTab('reels');
                }}
                className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:bg-white/40 transition"
              >
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-75 ease-linear"
                  style={{
                    width:
                      idx === currentIndex
                        ? `${progress}%`
                        : idx < currentIndex
                        ? '100%'
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Top Control Bar & Mode Selector */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-0.5">
            
            {/* View Mode Navigation Tabs */}
            <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/10 text-xs w-full sm:w-auto justify-center font-bengali">
              <button
                onClick={() => setActiveTab('reels')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'reels' ? 'bg-amber-400 text-slate-950 shadow-md font-black' : 'text-gray-200 hover:bg-white/10'
                }`}
              >
                <Play size={13} className="fill-current" />
                <span>ভিডিও স্লাইস রিলস</span>
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'features' ? 'bg-amber-400 text-slate-950 shadow-md font-black' : 'text-gray-200 hover:bg-white/10'
                }`}
              >
                <Sparkles size={13} />
                <span>ফিচার ক্যাটালগ</span>
              </button>
              <button
                onClick={() => setActiveTab('benefits')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'benefits' ? 'bg-amber-400 text-slate-950 shadow-md font-black' : 'text-gray-200 hover:bg-white/10'
                }`}
              >
                <Award size={13} />
                <span>কী কী লাভবান হবেন</span>
              </button>
            </div>

            {/* Audio Voiceover & Control Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 font-bengali">
              <button
                onClick={() => {
                  const newMute = !isMuted;
                  setIsMuted(newMute);
                  if (newMute && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    try { window.speechSynthesis.cancel(); } catch {}
                  } else {
                    speakNarration(activeVideo.narrationText);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  !isMuted 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse font-black' 
                    : 'bg-white/10 text-gray-300 border-white/10'
                }`}
                title={isMuted ? 'ভয়েস ওভার চালু করুন' : 'ভয়েস ওভার বন্ধ করুন'}
              >
                {!isMuted ? <Volume2 size={15} /> : <VolumeX size={15} />}
                <span>{!isMuted ? '🔊 ভয়েস চলছে' : '🔇 ভয়েস অন করুন'}</span>
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition border border-white/10"
                title={isPlaying ? 'পজ করুন' : 'প্লে করুন'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-300 transition border border-red-500/30"
                title="বন্ধ করুন"
              >
                <X size={18} />
              </button>
            </div>
          </div>

        </div>

        {/* MIDDLE CONTENT: TAB 1 - REELS SHOWCASE */}
        {activeTab === 'reels' && (
          <div className="relative z-10 flex-1 px-4 sm:px-6 py-1 flex flex-col lg:flex-row items-center justify-between gap-4 overflow-y-auto custom-scrollbar font-bengali">
            
            {/* Left Panel: Visual Landmark Photo & Persuasive Copy */}
            <div className="w-full lg:w-1/2 space-y-2.5 text-left">
              
              {/* Landmark Photo Showcase Banner - Guaranteed on ALL slides */}
              <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-2xl group bg-slate-950">
                <img
                  src={activeVideo.imageUrl}
                  alt={activeVideo.imageAlt || activeVideo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                
                {/* Location Badge */}
                <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10.5px] font-bold px-2.5 py-0.5 rounded-xl border border-amber-400/30 flex items-center gap-1 shadow-md">
                  <MapPin size={11} className="text-amber-400" />
                  <span>{activeVideo.locationBadge}</span>
                </div>

                <div className="absolute top-2.5 right-2.5 bg-emerald-500/90 text-slate-950 font-black text-[9.5px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                  ডিজিটাল সিস্টেম
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase ${activeVideo.categoryColor} shadow-xs`}>
                  {activeVideo.category}
                </span>
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  <Flame size={13} className="text-amber-400 animate-bounce" />
                  <span>{activeVideo.statBadge}</span>
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white leading-snug drop-shadow-sm font-bengali">
                {activeVideo.title}
              </h2>

              <p className="text-emerald-200 text-xs font-medium leading-relaxed">
                {activeVideo.subtitle}
              </p>

              {/* Bullet Feature Reel Highlights */}
              <div className="space-y-1">
                {activeVideo.highlights.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white/5 backdrop-blur-md p-1.5 sm:p-2 rounded-xl border border-white/10 hover:bg-white/10 transition">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-gray-100">{item}</span>
                  </div>
                ))}
              </div>

              {/* Instant Benefit Cards */}
              <div className="grid grid-cols-2 gap-2">
                {activeVideo.benefits.map((b, idx) => (
                  <div key={idx} className="bg-amber-400/10 border border-amber-400/30 p-2 rounded-xl">
                    <span className="text-sm block mb-0.5">{b.icon}</span>
                    <h5 className="font-bold text-amber-300 text-[11.5px]">{b.title}</h5>
                    <p className="text-[10px] text-gray-300 leading-tight mt-0.5">{b.desc}</p>
                  </div>
                ))}
              </div>

              {/* Bottom Speech Overlay */}
              <div className="p-2 bg-slate-950/90 rounded-xl border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center gap-2 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                <span>{activeVideo.videoCaption}</span>
              </div>
            </div>

            {/* Right Panel: Interactive Dashboard Mockup Reel */}
            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-4 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden group">
                
                {/* Decorative Glow Circle */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />

                {/* Simulated Live Top Banner */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                      {activeVideo.mockupContent.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-xs sm:text-sm text-white">{activeVideo.mockupContent.heading}</h4>
                      <p className="text-[10px] text-emerald-300">{activeVideo.mockupContent.subheading}</p>
                    </div>
                  </div>
                  <span className="bg-emerald-500 text-slate-950 text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase">
                    লাইভ ইআরপি
                  </span>
                </div>

                {/* Dynamic Animated Cards Inside Mockup */}
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    {activeVideo.mockupContent.metrics.map((m, idx) => (
                      <div key={idx} className="bg-white/5 p-1.5 rounded-xl border border-white/10">
                        <span className="text-[9.5px] text-gray-400 block font-bold">{m.label}</span>
                        <span className="font-mono font-black text-emerald-400 text-xs">{m.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Animated Simulated Action Card */}
                  <div className="bg-gradient-to-r from-emerald-900/60 to-teal-900/60 p-2.5 rounded-xl border border-emerald-400/30 space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-bold text-emerald-200">
                      <span>স্বয়ংক্রিয় সিস্টেম ডেমো</span>
                      <span className="text-amber-300">১০০% অ্যাক্টিভ</span>
                    </div>
                    <p className="text-[11px] text-gray-200 leading-snug">
                      {activeVideo.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Interactive Play Trigger Badge */}
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <ShieldCheck size={13} /> অফিশিয়াল সিকিউরড
                  </span>
                  <span className="font-mono text-emerald-300">স্লাইস {currentIndex + 1} / {SLICE_VIDEOS.length}</span>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* MIDDLE CONTENT: TAB 2 - FEATURES CATALOG */}
        {activeTab === 'features' && (
          <div className="relative z-10 flex-1 px-4 sm:px-8 py-3 overflow-y-auto space-y-3 custom-scrollbar text-left font-bengali">
            <div className="border-b border-white/10 pb-2">
              <h3 className="text-lg sm:text-xl font-black text-amber-300 flex items-center gap-2 font-bengali">
                <Sparkles size={18} />
                <span>তা'লীম ইআরপি-এর ১০০+ স্মার্ট ফিচারসমূহ</span>
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                আপনার শিক্ষাপ্রতিষ্ঠান পরিচালনার প্রতিটি ক্ষেত্রের জন্য তৈরি অল-ইন-ওয়ান সিস্টেম
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                { title: 'স্বয়ংক্রিয় ভর্তি ও রোল অ্যাসাইনমেন্ট', desc: 'ভর্তির সাথে সাথে স্থায়ী রেজিস্ট্রেশন আইডি (REG-2026-001) ও জামাতভিত্তিক ১, ২, ৩ শ্রেণি রোল জেনারেট', icon: <Users className="text-emerald-400" /> },
                { title: 'কওমি তালীমাত ও মুমতাজ গ্রেডিং', desc: 'নূরানী, নাজেরা, হিফজ থেকে ইফতা পর্যন্ত কওমি নিসাবের প্রমিত ফলাফল ও মেধা তালিকা', icon: <BookOpen className="text-amber-400" /> },
                { title: 'আলিয়া বোর্ড জিপিএ ৫.০ স্কেল', desc: 'ইবতেদায়ী থেকে কামিল শ্রেণি পর্যন্ত রেজাল্ট শীট, সেমিস্টার ফি ও মার্কশিট প্রিন্ট', icon: <GraduationCap className="text-blue-400" /> },
                { title: 'অভিভাবক হোয়াটসঅ্যাপ অটোমেশন', desc: 'শিক্ষার্থী অনুপস্থিত থাকলে বা বকেয়া ফি থাকলে স্বয়ংক্রিয়ভাবে অভিভাবকের ফোনে মেসেজ', icon: <MessageSquare className="text-purple-400" /> },
                { title: 'লিল্লাহ বোর্ডিং ও মেস বাজার অডিট', desc: 'দৈনিক চাল-ডাল বাজার অডিট, মিল হিসাব ও খোরাকি ফি ক্যাটাগরি (পূর্ণ পেইং/লিল্লাহ)', icon: <Building className="text-red-400" /> },
                { title: 'যাকাত ও লিল্লাহ পৃথক শরয়ী ফান্ড', desc: 'সাধারণ ফি ফান্ড এবং যাকাত/লিল্লাহ ফান্ডের পৃথক শরয়ী ক্যাশবহি ও উদ্বৃত্ত হিসাব', icon: <DollarSign className="text-emerald-400" /> },
                { title: 'কিউআর কোড যুক্ত ডিজিটাল আইডি কার্ড', desc: '১-ক্লিকে ছবি, রক্তের গ্রুপ ও বারকোডসহ প্রাতিষ্ঠানিক প্রফেশনাল আইডি কার্ড তৈরি', icon: <QrCode className="text-cyan-400" /> },
                { title: '৫ ওয়াক্ত সালাত ও আমল তারবিয়াত', desc: 'শিক্ষার্থীদের সালাতে জামাত ও তারবিয়াত পারফরম্যান্সের দৈনিক ড্যাশবোর্ড ট্র্যাকিং', icon: <Award className="text-amber-400" /> },
                { title: '১ পৃষ্ঠার প্রমিত অডিট রেজুলেশন', desc: 'মাদ্রাসা পরিচালনা কমিটি মিটিংয়ে পেশ করার জন্য ১ পৃষ্ঠার প্রমিত আয়-ব্যয় অডিট স্টেটমেন্ট', icon: <FileText className="text-emerald-400" /> },
              ].map((feat, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 space-y-1 hover:bg-white/10 transition">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-950 rounded-xl">
                      {feat.icon}
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-white font-bengali">{feat.title}</h4>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed font-bengali">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MIDDLE CONTENT: TAB 3 - KEY BENEFITS */}
        {activeTab === 'benefits' && (
          <div className="relative z-10 flex-1 px-4 sm:px-8 py-3 overflow-y-auto space-y-3 custom-scrollbar text-left font-bengali">
            <div className="border-b border-white/10 pb-2">
              <h3 className="text-lg sm:text-xl font-black text-amber-300 flex items-center gap-2 font-bengali">
                <Award size={18} />
                <span>তা'লীম ইআরপি ব্যবহার করলে আপনি কী কী লাভবান হবেন?</span>
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                মাদ্রাসা বা স্কুল পরিচালনা পর্ষদ, মুহতামিম/প্রিন্সিপাল, উস্তাদ ও অভিভাবক সকলের জন্য সুনির্দিষ্ট সুবিধা
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { title: '⏱️ ১০ গুণ সময় সাশ্রয়', desc: 'যে কাজগুলো করতে আগে ঘণ্টার পর ঘণ্টা রেজিস্টার খাতা লিখতে হতো, তা এখন ১ ক্লিকেই স্বয়ংক্রিয়ভাবে তৈরি হবে।' },
                { title: '🎯 ০% আর্থিক ভুলভ্রান্তি ও গরমিল', desc: 'বাইতুল মাল, যাকাত ও লিল্লাহ ফান্ডের একটি টাকার হিসাবও এলোমেলো হবে না। অডিটে শতভাগ সততা নিশ্চিত থাকবে।' },
                { title: '🏆 আপনার প্রতিষ্ঠান হবে এলাকার ১ নম্বর', desc: 'ছবিসহ প্রফেশনাল আইডি কার্ড, কিউআর কোড, ও ডিজিটাল মানি রিসিটের মাধ্যমে আপনার প্রতিষ্ঠানের সম্মান বহুগুণ বৃদ্ধি পাবে।' },
                { title: '🤝 অভিভাবকদের শতভাগ আস্থা অর্জন', desc: 'বাচ্চা মাদ্রাসায় অনুপস্থিত থাকলে বা ফি প্রদেয় হলে অভিভাবকের হোয়াটসঅ্যাপে লাইভ নোটিফিকেশন যাবে, যা বিশ্বাসযোগ্যতা বাড়ায়।' },
                { title: '📊 ১ ক্লিকে অডিট ও কমিটি রেজুলেশন', desc: 'মাসিক অডিট ও রেজুলেশন মিটিংয়ের জন্য ১ পৃষ্ঠার প্রমিত সার্বিক প্রতিবেদন প্রস্তুত থাকে, যা প্রিন্ট বা পিডিএফ করা যায়।' },
                { title: '📱 যেকোনো ডিভাইস থেকে সহজ পরিচালনা', desc: 'মোবাইল, কম্পিউটার বা ট্যাবলেট - যেকোনো স্থান থেকে মুহতামিম বা প্রিন্সিপাল প্রতিষ্ঠানের লাইভ আপডেট দেখতে পারবেন।' },
              ].map((item, idx) => (
                <div key={idx} className="bg-gradient-to-r from-emerald-950/80 to-slate-900 p-3.5 rounded-2xl border border-emerald-500/30 space-y-0.5 shadow-md">
                  <h4 className="font-black text-sm text-amber-300 font-bengali">{item.title}</h4>
                  <p className="text-xs text-gray-200 leading-relaxed font-bengali">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NAVIGATION OVERLAY ARROWS */}
        {activeTab === 'reels' && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-slate-950/80 hover:bg-slate-950 text-white transition border border-white/20 shadow-lg"
              title="পূর্ববর্তী স্লাইস"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-slate-950/80 hover:bg-slate-950 text-white transition border border-white/20 shadow-lg"
              title="পরবর্তী স্লাইস"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* BOTTOM REEL FOOTER & CALL TO ACTIONS */}
        <div className="relative z-20 p-3.5 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0 font-bengali">
          
          <div className="text-center sm:text-left">
            <span className="text-xs text-emerald-300 font-bold flex items-center justify-center sm:justify-start gap-1 font-bengali">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              বাংলাদেশের সকল কওমি, আলিয়া ও স্কুলের জন্য শতভাগ পারফেক্ট
            </span>
            <p className="text-[11px] text-gray-400 mt-0.5 font-bengali">
              কারিগরি তত্ত্বাবধানে: মো: মিরাজ | হেল্পলাইন: 01339564967
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto font-bengali">
            <button
              onClick={onProceedToLogin}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs sm:text-sm transition shadow-lg flex items-center justify-center gap-2 group font-bengali"
            >
              <span>লগইন ফর্মে প্রবেশ করুন</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition" />
            </button>
            <Link
              href="/register"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm transition shadow-lg flex items-center justify-center gap-1.5 font-bengali"
            >
              <span>নতুন রেজিস্টার</span>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
