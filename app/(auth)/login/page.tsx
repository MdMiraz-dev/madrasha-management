'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Book, Eye, EyeOff, PlayCircle, Sparkles, Award, Star, Flame } from 'lucide-react';
import Link from 'next/link';
import LoginSliceVideoModal from '@/components/LoginSliceVideoModal';

export default function LoginPage() {
  const { language, setLanguage, setInstituteCategory, setInstituteSettings } = useApp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Slice Video Presentation Modal State - Auto opens on visit
  const [isSliceModalOpen, setIsSliceModalOpen] = useState(true);

  const langLabels = { bn: 'বাংলা', en: 'EN', ar: 'AR' };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!db) {
      setError('ডাটাবেস কানেকশন নেই। Firebase কনফিগ চেক করুন।');
      return;
    }

    setLoading(true);
    try {
      // Firestore-based authentication (no Firebase Auth required)
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email), where('password', '==', password));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('ইমেইল বা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।');
        setLoading(false);
        return;
      }

      const userData = snapshot.docs[0].data();

      // Fetch institution data
      const instRef = collection(db, 'institutions');
      const instQ = query(instRef, where('institutionId', '==', userData.institutionId));
      const instSnap = await getDocs(instQ);

      let instituteName = '';
      let instituteAddress = '';
      let instituteCategory: 'qawmi' | 'alia' | 'school' = 'qawmi';

      if (!instSnap.empty) {
        const instData = instSnap.docs[0].data();
        instituteName = instData.name || '';
        instituteAddress = instData.address || '';
        instituteCategory = instData.category || 'qawmi';
      }

      // Save session to localStorage
      const session = {
        userId: userData.userId,
        institutionId: userData.institutionId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        category: instituteCategory,
        instituteName,
        instituteAddress,
      };
      localStorage.setItem('taleem_session', JSON.stringify(session));

      // Update context
      setInstituteCategory(instituteCategory);
      setInstituteSettings({
        name: instituteName,
        address: instituteAddress,
        logo: '',
        principalName: '',
        principalSignature: '',
      });

      router.push('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(`ত্রুটি: ${err.message}`);
      } else {
        setError('লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 p-4 relative overflow-hidden"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* ─── SLICE VIDEO SHOWCASE MODAL ─── */}
      <LoginSliceVideoModal
        isOpen={isSliceModalOpen}
        onClose={() => setIsSliceModalOpen(false)}
        onProceedToLogin={() => setIsSliceModalOpen(false)}
      />

      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Language switcher */}
      <div className="absolute top-4 right-4 z-20 flex gap-1 bg-slate-900/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
        {(['bn', 'en', 'ar'] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setLanguage(lang)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              language === lang ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            {langLabels[lang]}
          </button>
        ))}
      </div>

      {/* TOP PROMOTIONAL BANNER: SLICE VIDEO TRIGGER */}
      <div className="w-full max-w-md mb-4 z-10">
        <button
          onClick={() => setIsSliceModalOpen(true)}
          className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400 hover:from-amber-500 hover:to-emerald-500 text-slate-950 p-3.5 rounded-2xl shadow-xl flex items-center justify-between group transition transform hover:-translate-y-0.5 border border-amber-300/40"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 bg-slate-950 text-amber-400 rounded-xl group-hover:scale-110 transition shadow-inner">
              <PlayCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="bg-slate-950 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider block w-max">
                ★ ১ নম্বর প্ল্যাটফর্ম প্রেজেন্টেশন
              </span>
              <h3 className="text-sm font-black text-slate-950 leading-snug mt-0.5">
                ফিচার স্লাইস ভিডিওগুলো দেখুন (কওমি, আলিয়া ও স্কুল)
              </h3>
            </div>
          </div>
          <span className="text-xs bg-slate-950 text-white font-bold px-3 py-1.5 rounded-xl shrink-0 group-hover:bg-slate-900 transition">
            প্লে করুন 🎬
          </span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 border border-emerald-500/20">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="mx-auto bg-gradient-to-tr from-emerald-500 to-teal-600 p-4 rounded-3xl w-20 h-20 flex items-center justify-center mb-3 shadow-lg shadow-emerald-900/30">
            <Book className="w-10 h-10 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-black px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 mb-2">
            <Sparkles size={13} className="text-amber-500" />
            <span>বাংলাদেশের ১ নম্বর এডুকেশন ইআরপি</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">তা&apos;লীম ইআরপি (Taleem ERP)</h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">আপনার প্রতিষ্ঠানের অ্যাকাউন্টে প্রবেশ করুন</p>
        </div>

        {error && (
          <div className="mb-4 text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300 p-3 rounded-xl text-sm border border-red-200 dark:border-red-800">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              ইমেইল অ্যাড্রেস
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 dark:bg-slate-700 dark:text-white font-medium text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 dark:bg-slate-700 dark:text-white pr-10 font-medium text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black py-3 px-4 rounded-xl transition shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 mt-2 text-sm"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> লগইন হচ্ছে...</>
            ) : (
              'লগইন করুন'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t dark:border-slate-700 pt-4">
          নতুন প্রতিষ্ঠান?{' '}
          <Link href="/register" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">
            বিনামূল্যে অ্যাকাউন্ট করুন
          </Link>
        </div>

        {/* Developer attribution */}
        <div className="mt-4 text-center text-[11px] text-gray-400 dark:text-gray-500 border-t border-dashed border-gray-200 dark:border-slate-700/60 pt-3">
          কারিগরি তত্ত্বাবধানে ও নির্মাণে: মো: মিরাজ | আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট | হেল্পলাইন: 01339564967
        </div>
      </div>
    </div>
  );
}
