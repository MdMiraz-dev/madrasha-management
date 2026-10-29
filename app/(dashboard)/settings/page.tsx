'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { translations } from '@/lib/translations';
import { 
  AlertCircle, Upload, Coins, Settings as SettingsIcon, 
  CheckCircle2, RotateCcw, Save, Edit3, ArrowRight, 
  Building2, GraduationCap, Utensils, FileSpreadsheet, ShieldAlert
} from 'lucide-react';
import { UNIFIED_QAWMI_JAMATS } from '@/lib/qawmiJamats';
import { 
  JamatFeeStructure, 
  DEFAULT_JAMAT_FEES, 
  getStoredFeeStructures, 
  saveStoredFeeStructures 
} from '@/lib/feeStructure';

export default function SettingsPage() {
  const { language, instituteSettings, setInstituteSettings, instituteCategory, setInstituteCategory } = useApp();
  const t = translations[language as keyof typeof translations];
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'general' | 'fee-structure'>('general');

  // General Settings Form
  const [formData, setFormData] = useState({
    name: instituteSettings.name || '',
    address: instituteSettings.address || '',
    principalName: instituteSettings.principalName || '',
    logo: instituteSettings.logo || '',
    principalSignature: instituteSettings.principalSignature || ''
  });
  
  const [cat, setCat] = useState(instituteCategory);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (instituteSettings) {
      setFormData({
        name: instituteSettings.name || '',
        address: instituteSettings.address || '',
        principalName: instituteSettings.principalName || '',
        logo: instituteSettings.logo || '',
        principalSignature: instituteSettings.principalSignature || ''
      });
    }
    setCat(instituteCategory);
  }, [instituteSettings, instituteCategory]);

  // ─── Fee Structure State ───
  const [feeStructures, setFeeStructures] = useState<JamatFeeStructure[]>(DEFAULT_JAMAT_FEES);
  const [selectedJamatKey, setSelectedJamatKey] = useState<string>('nurani');
  const [feeSavedAlert, setFeeSavedAlert] = useState(false);
  const [feeResetAlert, setFeeResetAlert] = useState(false);

  // Load fee structures on mount
  useEffect(() => {
    const loaded = getStoredFeeStructures();
    setFeeStructures(loaded);
  }, []);

  // Current active Jamat fee in editor
  const currentFeeItem = feeStructures.find(f => f.jamatKey === selectedJamatKey) || feeStructures[0];

  // Editor form state for the selected Jamat
  const [editForm, setEditForm] = useState<JamatFeeStructure>(currentFeeItem);

  // Keep editor in sync when user picks a different Jamat from dropdown or table
  useEffect(() => {
    const target = feeStructures.find(f => f.jamatKey === selectedJamatKey);
    if (target) {
      setEditForm({ ...target });
    }
  }, [selectedJamatKey, feeStructures]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'principalSignature') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setInstituteSettings(formData);
    setInstituteCategory(cat);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Save current Jamat fee configuration
  const handleSaveJamatFee = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = feeStructures.map(item => {
      if (item.jamatKey === editForm.jamatKey) {
        return {
          ...editForm,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });

    setFeeStructures(updated);
    saveStoredFeeStructures(updated);
    setFeeSavedAlert(true);
    setTimeout(() => setFeeSavedAlert(false), 3500);
  };

  // Reset to authentic Qawmi Madrasa defaults
  const handleResetDefaults = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে সকল জামাতের ফি ডিফল্ট মানে রিসেট করতে চান?')) {
      setFeeStructures(DEFAULT_JAMAT_FEES);
      saveStoredFeeStructures(DEFAULT_JAMAT_FEES);
      const target = DEFAULT_JAMAT_FEES.find(f => f.jamatKey === selectedJamatKey) || DEFAULT_JAMAT_FEES[0];
      setEditForm({ ...target });
      setFeeResetAlert(true);
      setTimeout(() => setFeeResetAlert(false), 3500);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="text-emerald-600" size={26} />
            {t.settings}
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            মাদ্রাসার সার্বিক তথ্য, লোগো, স্বাক্ষর এবং জামাতভিত্তিক স্ট্যান্ডার্ড ফি কাঠামো পরিচালনা করুন
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 dark:bg-slate-700/60 p-1.5 rounded-xl border border-gray-200 dark:border-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeTab === 'general'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            <Building2 size={16} />
            সাধারণ তথ্য সেটিংস
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fee-structure')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeTab === 'fee-structure'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            <Coins size={16} />
            ফি কাঠামো সেটিংস (Fee Setup)
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: GENERAL SETTINGS
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'general' && (
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          {saved && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center gap-2 font-semibold">
              <CheckCircle2 size={20} />
              প্রতিষ্ঠান সেটিংস সফলভাবে সংরক্ষিত হয়েছে!
            </div>
          )}

          <form onSubmit={handleSaveGeneral} className="space-y-6">
            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.uploadLogo}</label>
                <div className="flex items-center gap-4">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="w-16 h-16 object-contain border rounded-lg bg-white p-1" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 border rounded-lg flex items-center justify-center">
                      <Upload className="text-gray-400" size={24} />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'logo')} className="text-xs text-gray-600 dark:text-gray-300" />
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.uploadSignature}</label>
                <div className="flex items-center gap-4">
                  {formData.principalSignature ? (
                    <img src={formData.principalSignature} alt="Signature" className="h-16 object-contain border rounded-lg bg-white px-2 py-1" />
                  ) : (
                    <div className="w-32 h-16 bg-gray-100 dark:bg-slate-700 border rounded-lg flex items-center justify-center">
                      <Upload className="text-gray-400" size={24} />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'principalSignature')} className="text-xs text-gray-600 dark:text-gray-300" />
                </div>
              </div>
            </div>

            {/* Text Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.instituteName}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.address}</label>
                <textarea 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.principalName}</label>
                <input 
                  type="text" 
                  value={formData.principalName}
                  onChange={e => setFormData({...formData, principalName: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* Category Change */}
            <div className="pt-4 border-t dark:border-slate-700">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.selectCategory}</label>
              <div className="flex items-center gap-2 mb-2 p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-xl text-xs">
                <AlertCircle size={18} className="shrink-0" />
                {t.categoryWarning}
              </div>
              <select 
                value={cat}
                onChange={e => setCat(e.target.value as 'qawmi' | 'alia' | 'school')}
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white font-semibold"
              >
                <option value="qawmi">{t.qawmiCard}</option>
                <option value="alia">{t.aliaCard}</option>
                <option value="school">{t.schoolCard}</option>
              </select>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow transition flex items-center gap-2"
              >
                <Save size={18} />
                {t.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: JAMAT-WISE FEE STRUCTURE CONFIGURATION
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'fee-structure' && (
        <div className="space-y-6">
          {/* Notification Banners */}
          {feeSavedAlert && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-3 font-bold shadow-sm">
              <CheckCircle2 size={22} className="text-emerald-600" />
              <div>
                <p>"{editForm.jamatNameWithEn}" জামাতের ফি কাঠামো সফলভাবে সংরক্ষিত হয়েছে!</p>
                <p className="text-xs font-normal text-emerald-700 dark:text-emerald-400 mt-0.5">
                  ভর্তি ফরম এবং ফি আদায় ড্যাশবোর্ডে এই নতুন ফি স্বয়ংক্রিয়ভাবে কার্যকর হয়ে গেছে।
                </p>
              </div>
            </div>
          )}

          {feeResetAlert && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 rounded-xl flex items-center gap-3 font-bold shadow-sm">
              <RotateCcw size={22} className="text-blue-600" />
              <div>
                <p>সকল জামাতের ফি কাঠামো ডিফল্ট কওমি মানে সফলভাবে রিসেট করা হয়েছে!</p>
              </div>
            </div>
          )}

          {/* Quick Info Callout */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent p-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Coins size={22} />
              </div>
              <div>
                <h3 className="font-black text-gray-900 dark:text-white text-base">
                  জামাতভিত্তিক স্ট্যান্ডার্ড ফি নির্ধারণ ও অটো-সিঙ্ক
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  এখানে নির্ধারিত ফি অনুযায়ী শিক্ষার্থী ভর্তি (Admission) ও ফি কালেকশনে (Finance) স্বয়ংক্রিয়ভাবে টাকার পরিমাণ লোড হবে।
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 transition"
            >
              <RotateCcw size={14} />
              ডিফল্ট মানে রিসেট
            </button>
          </div>

          {/* Editor Card for Selected Jamat */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
            <form onSubmit={handleSaveJamatFee} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-slate-700">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                    সম্পাদনার জন্য জামাত নির্বাচন করুন:
                  </label>
                  <select
                    value={selectedJamatKey}
                    onChange={(e) => setSelectedJamatKey(e.target.value)}
                    className="p-2.5 bg-emerald-50/60 dark:bg-slate-700 border-2 border-emerald-500/40 rounded-xl font-bold text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-emerald-500"
                  >
                    {UNIFIED_QAWMI_JAMATS.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.nameWithEn} ({j.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">মাসিক সর্বমোট (টিউশন + বোর্ডিং)</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ৳ {Number(editForm.monthlyTuitionFee || 0) + Number(editForm.boardingFee || 0)}
                  </span>
                </div>
              </div>

              {/* Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Admission Fee */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/40 border border-gray-200/80 dark:border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <GraduationCap size={15} className="text-emerald-600" />
                      ভর্তি ফি (Admission Fee)
                    </label>
                    <span className="text-[10px] text-gray-400 font-mono">এককালীন</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={editForm.admissionFee}
                      onChange={(e) => setEditForm({ ...editForm, admissionFee: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border rounded-lg font-bold text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">নতুন ছাত্র ভর্তির সময় নির্ধারিত ফি</p>
                </div>

                {/* Monthly Tuition Fee */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/40 border border-gray-200/80 dark:border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Coins size={15} className="text-blue-600" />
                      মাসিক বেতন (Monthly Tuition)
                    </label>
                    <span className="text-[10px] text-blue-600 font-bold">প্রতি মাসে</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={editForm.monthlyTuitionFee}
                      onChange={(e) => setEditForm({ ...editForm, monthlyTuitionFee: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border rounded-lg font-bold text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">সকল শিক্ষার্থীর মাসিক পড়াশোনার বেতন</p>
                </div>

                {/* Boarding / Meal Fee */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/40 border border-gray-200/80 dark:border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Utensils size={15} className="text-amber-600" />
                      আবাসিক মেস/খাবার ফি (Boarding)
                    </label>
                    <span className="text-[10px] text-amber-600 font-bold">আবাসিকদের জন্য</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={editForm.boardingFee}
                      onChange={(e) => setEditForm({ ...editForm, boardingFee: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border rounded-lg font-bold text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">অনাবাসিক সিলেক্ট করলে এটি ৳ ০ হয়ে যাবে</p>
                </div>

                {/* Exam Fee */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/40 border border-gray-200/80 dark:border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <FileSpreadsheet size={15} className="text-purple-600" />
                      পরীক্ষা ফি (Exam Fee)
                    </label>
                    <span className="text-[10px] text-gray-400 font-mono">সেমিস্টার ভিত্তিক</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={editForm.examFee}
                      onChange={(e) => setEditForm({ ...editForm, examFee: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border rounded-lg font-bold text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">ত্রৈমাসিক/অর্ধবার্ষিক/বার্ষিক পরীক্ষা ফি</p>
                </div>

                {/* Other Fees */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/40 border border-gray-200/80 dark:border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Building2 size={15} className="text-rose-600" />
                      অন্যান্য ফি (বই/আইডি কার্ড/বিবিধ)
                    </label>
                    <span className="text-[10px] text-gray-400 font-mono">ঐচ্ছিক</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={editForm.otherFee}
                      onChange={(e) => setEditForm({ ...editForm, otherFee: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border rounded-lg font-bold text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">পরিচয়পত্র, ডায়রি ও লাইব্রেরি ফি বাবদ</p>
                </div>

                {/* Department Info */}
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                  <label className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    অন্তর্ভুক্ত বিভাগ (Department)
                  </label>
                  <div className="p-2.5 bg-white dark:bg-slate-800 border rounded-lg font-bold text-gray-800 dark:text-gray-200 text-sm">
                    {editForm.department}
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">অফিসিয়াল সিলেবাস অনুযায়ী নির্ধারিত বিভাগ</p>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-8 rounded-xl shadow-md transition flex items-center gap-2 text-sm"
                >
                  <Save size={18} />
                  {editForm.jamatName} জামাতের ফি সংরক্ষণ করুন (Save Changes)
                </button>

                <p className="text-xs text-gray-400">
                  * পরিবর্তন সাথে সাথে ব্রাউজারের স্টোরেজে সংরক্ষিত হবে।
                </p>
              </div>
            </form>
          </div>

          {/* Master Table of All 16 Jamats */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-black text-gray-900 dark:text-white text-base flex items-center gap-2">
                  <FileSpreadsheet className="text-emerald-600" size={20} />
                  সকল জামাতের স্ট্যান্ডার্ড ফি চার্ট তালিকা (Master Fee Matrix)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  এক নজরে সকল ১৬টি জামাতের নির্ধারিত ফি এবং সরাসরি দ্রুত সম্পাদনা
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full">
                মোট জামাত: {feeStructures.length}টি
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-gray-50 dark:bg-slate-900/60 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold border-b dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">জামাত ও বিভাগ</th>
                    <th className="py-3 px-3 text-right">ভর্তি ফি</th>
                    <th className="py-3 px-3 text-right">মাসিক বেতন</th>
                    <th className="py-3 px-3 text-right">আবাসিক বোর্ডিং</th>
                    <th className="py-3 px-3 text-right">পরীক্ষা ফি</th>
                    <th className="py-3 px-3 text-right">অন্যান্য</th>
                    <th className="py-3 px-4 text-right bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                      মোট মাসিক (আবাসিক)
                    </th>
                    <th className="py-3 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 font-medium text-gray-800 dark:text-gray-200">
                  {feeStructures.map((f) => {
                    const isCurrent = f.jamatKey === selectedJamatKey;
                    const monthlyTotal = (f.monthlyTuitionFee || 0) + (f.boardingFee || 0);

                    return (
                      <tr 
                        key={f.jamatKey} 
                        className={`hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition ${
                          isCurrent ? 'bg-emerald-50/60 dark:bg-emerald-950/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                            {f.jamatNameWithEn}
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 bg-emerald-600 text-white rounded-md font-bold">
                                সক্রিয়
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 font-normal">{f.department}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                          ৳ {f.admissionFee.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                          ৳ {f.monthlyTuitionFee.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                          ৳ {f.boardingFee.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-gray-600 dark:text-gray-400">
                          ৳ {f.examFee.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-gray-500 dark:text-gray-400">
                          ৳ {f.otherFee.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20">
                          ৳ {monthlyTotal.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedJamatKey(f.jamatKey);
                              window.scrollTo({ top: 120, behavior: 'smooth' });
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto ${
                              isCurrent
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 dark:bg-slate-700 dark:text-gray-300'
                            }`}
                          >
                            <Edit3 size={13} />
                            সম্পাদনা
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
