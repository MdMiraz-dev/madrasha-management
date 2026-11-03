'use client';

import React, { useState, useMemo } from 'react';
import { MessageSquare, Users, Bell, FileText, Copy, Check, Send, PhoneCall, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useLanguage } from '@/context/LanguageContext';
import { UNIFIED_QAWMI_JAMATS } from '@/lib/qawmiJamats';

export default function SmsEnginePage() {
  const { students: centralStudents, instituteSettings } = useApp();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'absence' | 'broadcast' | 'fees' | 'templates'>('absence');
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [selectedJamat, setSelectedJamat] = useState<string>('all');
  const [customBroadcast, setCustomBroadcast] = useState(
    'আস-সালামু আলাইকুম ওয়া রাহমাতুল্লাহ। সম্মানিত অভিভাবক, আগামীকাল বিশেষ কারণে মাদ্রাসার যাবতীয় পাঠদান স্থগিত থাকবে। আগামী শনিবার থেকে যথারীতি ক্লাস চলবে। - কর্তৃপক্ষ'
  );

  const madrasaName = instituteSettings.name || 'জামিয়া আরাবিয়া ইমদাদুল উলূম ফরিদাবাদ মাদ্রাসা, ঢাকা';

  const displayStudents = useMemo(() => {
    let list = centralStudents && centralStudents.length > 0 ? centralStudents : [];
    if (selectedJamat !== 'all') {
      list = list.filter(s => s.class === selectedJamat);
    }
    return list.slice(0, 12).map((s, idx) => ({
      id: s.id || String(idx),
      name: s.nameBn || s.nameEn || 'শিক্ষার্থী',
      roll: s.roll || '১',
      class: s.class || 'মিজান',
      phone: s.primaryPhone || s.whatsappNumber || '01711000000',
      due: s.dueAmount || 2500,
    }));
  }, [centralStudents, selectedJamat]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSendAll = () => {
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <MessageSquare size={13} />
            অভিভাবক যোগাযোগ ও নোটিফিকেশন ইঞ্জিন
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-1.5">
            এসএমএস ও হোয়াটসঅ্যাপ নোটিফিকেশন সেন্টার
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {madrasaName} • অনুপস্থিতি, নোটিশ, রেজাল্ট ও ফি তাগাদা সরাসরি অভিভাবকের মোবাইলে প্রেরণ
          </p>
        </div>

        {sentSuccess && (
          <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 size={16} className="text-emerald-600" />
            মেসেজ সফলভাবে ব্রডকাস্ট কিউ-তে যুক্ত হয়েছে!
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-700 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('absence')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
            activeTab === 'absence'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users size={16} />
          <span>অনুপস্থিতি বার্তা (Absence Alert)</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
            activeTab === 'broadcast'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare size={16} />
          <span>সাধারণ ঘোষণা ও নোটিশ (Broadcast)</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
            activeTab === 'fees'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bell size={16} />
          <span>বকেয়া ফি তাগাদা (Fee Reminder)</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
            activeTab === 'templates'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText size={16} />
          <span>ইসলামিক টেমপ্লেট সংগ্রহ (Templates)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Pane */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xs border border-gray-100 dark:border-slate-700">
          {activeTab === 'absence' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-lg font-black text-gray-900 dark:text-white">আজকের অনুপস্থিত ছাত্রদের তালিকা</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedJamat}
                    onChange={(e) => setSelectedJamat(e.target.value)}
                    className="p-2 border rounded-xl bg-gray-50 dark:bg-slate-900 text-xs font-semibold dark:border-slate-700"
                  >
                    <option value="all">সকল জামাত</option>
                    {UNIFIED_QAWMI_JAMATS.map((j) => (
                      <option key={j.id} value={j.value}>{j.nameBn}</option>
                    ))}
                  </select>
                  <button onClick={handleSendAll} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
                    <Send size={14} />
                    এক ক্লিকে সবাইকে পাঠান
                  </button>
                </div>
              </div>

              <div className="border rounded-xl dark:border-slate-700 overflow-hidden">
                <div className="p-3 bg-gray-50 dark:bg-slate-900 border-b dark:border-slate-700 font-bold text-xs text-gray-600 dark:text-gray-300 flex justify-between items-center">
                  <span>অনুপস্থিত শিক্ষার্থী ({displayStudents.length} জন)</span>
                  <span className="text-emerald-600">স্বয়ংক্রিয়ভাবে চিহ্নিত</span>
                </div>
                <ul className="divide-y dark:divide-slate-700 max-h-96 overflow-y-auto">
                  {displayStudents.map((st) => (
                    <li key={st.id} className="p-3.5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-700/40 transition">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" defaultChecked />
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{st.name}</p>
                          <p className="text-xs text-gray-500">জামাত: {st.class} • রোল: {st.roll} • অভিভাবক: {st.phone}</p>
                        </div>
                      </div>
                      <a
                        href={`https://wa.me/88${st.phone}?text=${encodeURIComponent(`আস-সালামু আলাইকুম। সম্মানিত অভিভাবক, আপনার সন্তান ${st.name} (রোল: ${st.roll}, জামাত: ${st.class}) আজ ক্লাসে উপস্থিত ছিল না। অনুগ্রহ করে কারণ অবহিত করুন। - ${madrasaName}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-100 transition flex items-center gap-1"
                      >
                        হোয়াটসঅ্যাপ বার্তা
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'broadcast' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">সার্বজনীন মাদ্রাসা নোটিশ ও জরুরি বার্তা</h2>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">প্রাপক নির্বাচন করুন</label>
                <select className="w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-slate-900 text-xs font-semibold dark:border-slate-700">
                  <option>সকল অভিভাবক (আবাসিক ও অনাবাসিক)</option>
                  <option>শুধুমাত্র আবাসিক ছাত্র ও বোর্ডিং অভিভাবক</option>
                  <option>হিফজ বিভাগ অভিভাবক পরিষদ</option>
                  <option>সম্মানিত উস্তাদ ও খাদেমবৃন্দ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">বার্তার বিষয়বস্তু</label>
                <textarea
                  rows={6}
                  value={customBroadcast}
                  onChange={(e) => setCustomBroadcast(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 text-sm font-medium dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSendAll} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs">
                  <Send size={15} />
                  সকলকে নোটিশ প্রেরণ করুন
                </button>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">মাসিক বেতন ও খোরাকি ফি তাগাদা</h2>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Bell size={18} className="text-amber-600 flex-shrink-0" />
                <span>চলতি মাসের বকেয়া ফি পরিশোধের জন্য অভিভাবকদের নিকট সম্মানজনক তাগাদা বার্তা পাঠানো যাবে।</span>
              </div>

              <ul className="divide-y dark:divide-slate-700 border dark:border-slate-700 rounded-xl overflow-hidden">
                {displayStudents.slice(0, 6).map((st) => (
                  <li key={st.id} className="p-3.5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-700/40">
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{st.name}</p>
                      <p className="text-xs text-rose-600 font-semibold">বকেয়া: ৳{st.due.toLocaleString('bn-BD')} • জামাত: {st.class}</p>
                    </div>
                    <a
                      href={`https://wa.me/88${st.phone}?text=${encodeURIComponent(`আস-সালামু আলাইকুম। সম্মানিত অভিভাবক, ${madrasaName}-এ আপনার সন্তান ${st.name} (রোল: ${st.roll})-এর চলতি মাসের প্রদেয় ৳${st.due} বকেয়া রয়েছে। অতি দ্রুত হিসাব শাখায় পরিশোধ করার বিনীত অনুরোধ রইল। জাযাকাল্লাহু খাইরান।`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
                    >
                      তাগাদা পাঠান
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">নিয়মিত প্রাতিষ্ঠানিক এসএমএস টেমপ্লেট</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border-2 border-emerald-100 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 hover:border-emerald-500 transition cursor-pointer">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                    <span>🌙</span> ঈদের ছুটি ঘোষণা
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    আস-সালামু আলাইকুম। আগামী [তারিখ] থেকে পবিত্র ঈদুল ফিতর উপলক্ষে মাদ্রাসা বন্ধ থাকবে এবং [তারিখ] পুনরায় কিতাব ও সবক শুরু হবে। - মুহতামিম, {madrasaName}
                  </p>
                </div>

                <div className="p-4 border-2 border-emerald-100 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 hover:border-emerald-500 transition cursor-pointer">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                    <span>📜</span> সাময়িক পরীক্ষার ফলাফল প্রকাশ
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    মুহতারাম অভিভাবক, আপনার সন্তান [ছাত্রের নাম]-এর প্রথম সাময়িক পরীক্ষার ফলাফল প্রকাশিত হয়েছে। রেজাল্ট কার্ড সংগ্রহ করতে মাদ্রাসা অফিসে আসার অনুরোধ করা হচ্ছে।
                  </p>
                </div>

                <div className="p-4 border-2 border-emerald-100 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 hover:border-emerald-500 transition cursor-pointer">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                    <span>🕋</span> হিফজ সবক ও সবকি অগ্রগতি
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    আলহামদুলিল্লাহ! আপনার সন্তান আজ নতুন সবক সুন্দরভাবে শুনিয়েছে এবং বর্তমানে [পারা নং] পারায় রয়েছে। তার দ্বীনি কামিয়াবির জন্য দোয়া করবেন।
                  </p>
                </div>

                <div className="p-4 border-2 border-emerald-100 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 hover:border-emerald-500 transition cursor-pointer">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                    <span>🤝</span> অভিভাবক সমাবেশ ও পরামর্শ সভা
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    সম্মানিত অভিভাবক, আগামী শুক্রবার বাদ আছর মাদ্রাসার মিলনায়তনে এক জরুরি অভিভাবক সমাবেশের আয়োজন করা হয়েছে। আপনার উপস্থিতি একান্ত কাম্য।
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Message Preview Side Panel */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={14} />
                লাইভ মেসেজ প্রিভিউ (WhatsApp / SMS)
              </h3>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 font-mono">
                ইউনিকোড অনুমোদিত
              </span>
            </div>

            <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 relative text-xs leading-relaxed space-y-2">
              <p className="text-emerald-400 font-bold">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
              <p className="text-gray-200">
                {activeTab === 'absence' &&
                  `আস-সালামু আলাইকুম। সম্মানিত অভিভাবক, আপনার সন্তান আব্দুল্লাহ আল মাহমুদ (রোল: ১০১, জামাত: মেশকাত) আজ মাদ্রাসায় অনুপস্থিত রয়েছে। কোনো কারণ থাকলে মাদ্রাসার কার্যালয়ে অবহিত করুন।\n\nবিনীত—\nতালীমাত বিভাগ,\n${madrasaName}`}
                {activeTab === 'broadcast' && customBroadcast}
                {activeTab === 'fees' &&
                  `আস-সালামু আলাইকুম। সম্মানিত অভিভাবক, ${madrasaName}-এ আপনার সন্তানের চলতি মাসের মাসিক বেতন বাবদ ৳১,৫০০ বকেয়া রয়েছে। অতি দ্রুত হিসাব শাখায় পরিশোধ করার বিনীত অনুরোধ রইল। জাযাকাল্লাহু খাইরান।`}
                {activeTab === 'templates' &&
                  `আস-সালামু আলাইকুম। মুহতারাম অভিভাবক, আপনার সন্তানের সামগ্রিক তালীমাত ও তারবিয়াতি অগ্রগতি অত্যন্ত সন্তোষজনক। বিস্তারিত জানতে মাদ্রাসা অফিসে যোগাযোগ করুন। - ${madrasaName}`}
              </p>
              <div className="text-right text-[10px] text-slate-400 pt-2 border-t border-slate-700/60">
                {madrasaName} • অফিসিয়াল গেটওয়ে
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => handleCopy(
                activeTab === 'broadcast'
                  ? customBroadcast
                  : `আস-সালামু আলাইকুম। সম্মানিত অভিভাবক, আপনার সন্তানের নোটিফিকেশন। - ${madrasaName}`
              )}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  মেসেজ কপি সম্পন্ন হয়েছে!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  মেসেজ কপি করুন
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-400">
              অভিভাবকের নম্বরে এসএমএস বা সরাসরি হোয়াটসঅ্যাপে পাঠানো যাবে
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
