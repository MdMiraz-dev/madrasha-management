'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Building2, BookOpen, GraduationCap, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

type Category = 'qawmi' | 'alia' | 'school';

export default function RegisterPage() {
  const { setInstituteCategory, setInstituteSettings } = useApp();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [category, setLocalCategory] = useState<Category>('qawmi');
  const [instituteData, setInstituteData] = useState({ name: '', address: '', phone: '', email: '' });
  const [adminData, setAdminData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categoryLabels = {
    qawmi: 'কওমি মাদ্রাসা ও হিফজখানা',
    alia: 'আলিয়া মাদ্রাসা',
    school: 'জেনারেল স্কুল ও কিন্ডারগার্টেন',
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      setError('ডাটাবেস কানেকশন নেই। Firebase কনফিগ চেক করুন।');
      return;
    }
    if (adminData.password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Check if email already registered
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', adminData.email));
      const existing = await getDocs(q);
      if (!existing.empty) {
        setError('এই ইমেইল দিয়ে আগেই রেজিস্ট্রেশন করা হয়েছে। লগইন করুন।');
        setLoading(false);
        return;
      }

      // Generate a unique institution ID
      const institutionId = `inst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      // Save institution to Firestore
      await setDoc(doc(db, 'institutions', institutionId), {
        institutionId,
        category,
        name: instituteData.name,
        address: instituteData.address,
        phone: instituteData.phone,
        email: instituteData.email,
        adminEmail: adminData.email,
        adminName: adminData.name,
        createdAt: new Date().toISOString(),
      });

      // Save user to Firestore (password stored as plain text for simplicity - no Firebase Auth)
      // In production, hash the password server-side. For this app, Firestore rules protect data.
      await setDoc(doc(db, 'users', userId), {
        userId,
        institutionId,
        name: adminData.name,
        email: adminData.email,
        password: adminData.password, // store for Firestore-based auth
        role: 'admin',
        createdAt: new Date().toISOString(),
      });

      // Save session locally
      const session = {
        userId,
        institutionId,
        name: adminData.name,
        email: adminData.email,
        role: 'admin',
        category,
        instituteName: instituteData.name,
        instituteAddress: instituteData.address,
      };
      localStorage.setItem('taleem_session', JSON.stringify(session));

      // Update app context
      setInstituteCategory(category);
      setInstituteSettings({
        name: instituteData.name,
        address: instituteData.address,
        logo: '',
        principalName: '',
        principalSignature: '',
      });

      router.push('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(`ত্রুটি: ${err.message}`);
      } else {
        setError('রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-900 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 md:p-8">

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">তা&apos;লীম ইআরপি</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">নতুন প্রতিষ্ঠান নিবন্ধন</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > s ? 'bg-emerald-600 text-white' :
                step === s ? 'bg-emerald-600 text-white ring-4 ring-emerald-200' :
                'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-gray-400'
              }`}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 rounded ${step > s ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-600'}`} />}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="mb-4 text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Step 1: Category */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">আপনার প্রতিষ্ঠানের ধরন নির্বাচন করুন</h2>
            <div className="grid grid-cols-1 gap-3">
              {(['qawmi', 'alia', 'school'] as Category[]).map((cat) => {
                const Icon = cat === 'qawmi' ? Building2 : cat === 'alia' ? BookOpen : GraduationCap;
                const colors = {
                  qawmi: { active: 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600' },
                  alia: { active: 'border-blue-600 bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600' },
                  school: { active: 'border-purple-600 bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600' },
                };
                const isActive = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setLocalCategory(cat)}
                    className={`p-4 border-2 rounded-xl flex items-center gap-4 transition text-left ${
                      isActive ? colors[cat].active : 'border-gray-200 dark:border-slate-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-8 h-8 flex-shrink-0 ${isActive ? colors[cat].icon : 'text-gray-400'}`} />
                    <span className={`font-medium ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                      {categoryLabels[cat]}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition flex items-center gap-2"
              >
                পরবর্তী <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Institute Details */}
        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">প্রতিষ্ঠানের তথ্য দিন</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">প্রতিষ্ঠানের নাম *</label>
              <input type="text" required value={instituteData.name}
                onChange={e => setInstituteData({ ...instituteData, name: e.target.value })}
                placeholder="যেমন: জামিয়া ইসলামিয়া দারুল উলুম"
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ঠিকানা *</label>
              <input type="text" required value={instituteData.address}
                onChange={e => setInstituteData({ ...instituteData, address: e.target.value })}
                placeholder="গ্রাম, উপজেলা, জেলা"
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ফোন নম্বর *</label>
                <input type="tel" required value={instituteData.phone}
                  onChange={e => setInstituteData({ ...instituteData, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ইমেইল *</label>
                <input type="email" required value={instituteData.email}
                  onChange={e => setInstituteData({ ...instituteData, email: e.target.value })}
                  placeholder="madrasa@example.com"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-semibold py-2.5 px-5 rounded-lg transition hover:bg-gray-200">
                <ArrowLeft className="w-4 h-4" /> পিছনে
              </button>
              <button type="submit" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition">
                পরবর্তী <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Admin Account */}
        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">অ্যাডমিন অ্যাকাউন্ট তৈরি করুন</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">আপনার নাম *</label>
              <input type="text" required value={adminData.name}
                onChange={e => setAdminData({ ...adminData, name: e.target.value })}
                placeholder="মুহতামিম/প্রিন্সিপালের নাম"
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ইমেইল *</label>
              <input type="email" required value={adminData.email}
                onChange={e => setAdminData({ ...adminData, email: e.target.value })}
                placeholder="admin@example.com"
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পাসওয়ার্ড * (কমপক্ষে ৬ অক্ষর)</label>
              <input type="password" required value={adminData.password}
                onChange={e => setAdminData({ ...adminData, password: e.target.value })}
                placeholder="••••••••"
                minLength={6}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
            <div className="mt-6 flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-semibold py-2.5 px-5 rounded-lg transition hover:bg-gray-200">
                <ArrowLeft className="w-4 h-4" /> পিছনে
              </button>
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition disabled:opacity-60">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> অপেক্ষা করুন...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> নিবন্ধন সম্পন্ন করুন</>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t dark:border-slate-700 pt-4">
          আগেই নিবন্ধিত?{' '}
          <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
            লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
