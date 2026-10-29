'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Star, CheckCircle, Award } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/lib/context';
import { translations } from '@/lib/translations';

export default function NamazTarbiyatPage() {
  const { language } = useLanguage();
  const { students: centralStudents } = useApp();
  const t = translations[language as keyof typeof translations] || translations.bn;

  const [date, setDate] = useState('2026-09-21');
  const [activeTab, setActiveTab] = useState<'namaz' | 'tarbiyat' | 'report'>('namaz');
  const [saved, setSaved] = useState(false);

  const students = React.useMemo(() => {
    if (centralStudents && centralStudents.length > 0) {
      return centralStudents.map((s) => ({
        id: s.id,
        name: s.nameBn || s.nameEn || 'শিক্ষার্থী',
        roll: s.roll || '—',
        class: s.class || 'মিজান'
      }));
    }
    return [
      { id: '1', name: 'আব্দুল্লাহ আল মাহমুদ', roll: '১০১', class: 'মেশকাত' },
      { id: '2', name: 'মুহাম্মদ উমর ফারুক', roll: '১০২', class: 'ইফতা' },
      { id: '3', name: 'আহমেদ হাসান', roll: '১০৩', class: 'নূরানী' },
    ];
  }, [centralStudents]);


  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="text-emerald-600" />
            {t.namaz_title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {t.namaz_subtitle}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-gray-100 dark:bg-slate-700/60 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('namaz')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition ${
              activeTab === 'namaz' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
            }`}
          >
            {t.namaz_tab_daily}
          </button>
          <button
            onClick={() => setActiveTab('tarbiyat')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition ${
              activeTab === 'tarbiyat' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
            }`}
          >
            {t.namaz_tab_tarbiyat}
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition ${
              activeTab === 'report' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
            }`}
          >
            {t.namaz_tab_monthly}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        {activeTab === 'namaz' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.namaz_select_date}</label>
              <div className="flex items-center border rounded-lg p-2 bg-white dark:bg-slate-700 dark:border-slate-600">
                <CalendarIcon className="w-4 h-4 text-gray-500 mr-2" />
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700">
              <table className="min-w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700/60 border-b dark:border-slate-700 text-xs font-bold uppercase text-gray-700 dark:text-gray-200">
                    <th className="py-3 px-4">{t.marksheet_student_name}</th>
                    <th className="py-3 px-4 text-center">{t.namaz_fajr}</th>
                    <th className="py-3 px-4 text-center">{t.namaz_zuhr}</th>
                    <th className="py-3 px-4 text-center">{t.namaz_asr}</th>
                    <th className="py-3 px-4 text-center">{t.namaz_maghrib}</th>
                    <th className="py-3 px-4 text-center">{t.namaz_isha}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                        <div>{student.name}</div>
                        <span className="text-xs text-gray-400">Roll: {student.roll}</span>
                      </td>
                      {[1, 2, 3, 4, 5].map((prayer) => (
                        <td key={prayer} className="py-3 px-4 text-center">
                          <select className="p-1.5 text-xs font-medium border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white dark:border-slate-600 outline-none">
                            <option value="jamaat">{language === 'bn' ? 'জামাত ✔' : language === 'ar' ? 'جماعة ✔' : 'Jama\'at ✔'}</option>
                            <option value="munfarid">{language === 'bn' ? 'একাকী ⏺' : language === 'ar' ? 'منفرداً ⏺' : 'Alone ⏺'}</option>
                            <option value="late">{language === 'bn' ? 'মাকবুল ⏱' : language === 'ar' ? 'متأخر ⏱' : 'Late ⏱'}</option>
                            <option value="qaza">{language === 'bn' ? 'কাজা ✘' : language === 'ar' ? 'قضاء ✘' : 'Qaza ✘'}</option>
                          </select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <button 
                onClick={handleSave}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
              >
                {t.namaz_save_btn}
              </button>
              {saved && (
                <span className="text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
                  <CheckCircle size={16} />
                  {language === 'bn' ? 'আলহামদুলিল্লাহ, নামাযের হাজিরা সংরক্ষিত হয়েছে!' : language === 'ar' ? 'تم حفظ سجل الصلوات بنجاح!' : 'Alhamdulillah, attendance saved!'}
                </span>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tarbiyat' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {language === 'bn' ? 'সাপ্তাহিক চরিত্র ও আচরণ মূল্যায়ন' : language === 'ar' ? 'التقييم الأسبوعي للأخلاق والسلوك' : 'Weekly Character & Conduct Evaluation'}
            </h2>
            <div className="space-y-4">
              {students.slice(0, 2).map((student) => (
                <div key={student.id} className="p-4 border rounded-xl dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
                  <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-3">{student.name} ({student.roll})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {language === 'bn' ? 'আখলাক ও শিষ্টাচার (১-১০)' : language === 'ar' ? 'الأخلاق والآداب (١-١٠)' : 'Akhlaq & Manners (1-10)'}
                      </label>
                      <input type="number" min="1" max="10" className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white dark:border-slate-600 text-sm" defaultValue="9" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {language === 'bn' ? 'উস্তাদের আনুগত্য (১-১০)' : language === 'ar' ? 'طاعة الأساتذة (١-١٠)' : 'Obedience (1-10)'}
                      </label>
                      <input type="number" min="1" max="10" className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white dark:border-slate-600 text-sm" defaultValue="8" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {language === 'bn' ? 'পরিচ্ছন্নতা (১-১০)' : language === 'ar' ? 'النظافة والترتيب (١-١٠)' : 'Cleanliness (1-10)'}
                      </label>
                      <input type="number" min="1" max="10" className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white dark:border-slate-600 text-sm" defaultValue="10" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {language === 'bn' ? 'সময়নিষ্ঠা (১-১০)' : language === 'ar' ? 'المواظبة والانضباط (١-١٠)' : 'Punctuality (1-10)'}
                      </label>
                      <input type="number" min="1" max="10" className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white dark:border-slate-600 text-sm" defaultValue="7" />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={handleSave}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
              >
                {language === 'bn' ? 'তারবিয়াত স্কোর সংরক্ষণ করুন' : language === 'ar' ? 'حفظ درجات التربية' : 'Save Tarbiyat Scores'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'bn' ? 'মাসিক তারবিয়াত ও নামায রিপোর্ট' : language === 'ar' ? 'التقرير الشهري للسلوك والصلوات' : 'Monthly Tarbiyat & Namaz Report'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm max-w-md mx-auto">
              {language === 'bn' ? 'মাস নির্বাচন করে পূর্ণাঙ্গ চরিত্র ও নামাযের মূল্যায়ন রিপোর্ট ডাউনলোড বা প্রিন্ট করুন।' : language === 'ar' ? 'اختر الشهر لتوليد التقرير الشامل لحضور الصلوات والتقييم السلوكي.' : 'Select a month to generate comprehensive character and prayer reports.'}
            </p>
            <input type="month" className="p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white dark:border-slate-600 mb-4 block mx-auto text-sm" defaultValue="2026-09" />
            <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">
              {language === 'bn' ? 'রিপোর্ট জেনারেট করুন' : language === 'ar' ? 'توليد التقرير' : 'Generate Report'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
