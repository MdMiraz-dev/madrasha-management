"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/lib/context';
import { translations } from '@/lib/translations';
import { UNIFIED_QAWMI_JAMATS } from '@/lib/qawmiJamats';
import { getFeeForJamat } from '@/lib/feeStructure';
import { 
  BANGLADESH_DIVISIONS, 
  BANGLADESH_DISTRICTS, 
  getDistrictsByDivision, 
  getDivisionForDistrict 
} from '@/lib/districtsData';
import { Coins, Sparkles, Check, Calculator, Info, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AdmissionPage() {
  const { language } = useLanguage();
  const { instituteSettings, addStudent, students } = useApp();

  const t = translations[language as keyof typeof translations] || translations.bn;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nameEn: '',
    nameBn: '',
    dob: '',
    bloodGroup: 'A+',
    gender: 'Male',
    orphanStatus: 'No',
    medicalConditions: '',
    photoBase64: '',
    instituteCategory: 'qawmi',
    department: 'নূরানী বিভাগ',
    class: 'নূরানী',
    boardingStatus: 'আবাসিক',
    previousInstitution: '',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    primaryPhone: '',
    whatsappNumber: '',
    altPhone: '',
    localGuardianName: '',
    localGuardianRelation: '',
    division: '',
    district: '',
    village: '',
    studentNid: '',
    studentBirthReg: '',
    parentNid: '',
    // ─── Fee Structure Integration ───
    admissionFee: 1500,
    monthlyFee: 800,
    boardingFee: 2200,
    examFee: 400,
    waiverAmount: 0,
    waiverStatus: 'Full Payment',
    generateReceipt: true
  });

  const [showReceipt, setShowReceipt] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [assignedRoll, setAssignedRoll] = useState('');

  // Initial load: Category + Standard Jamat Fee from Settings
  useEffect(() => {
    const cat = localStorage.getItem('instituteCategory') || 'qawmi';
    const feeConfig = getFeeForJamat(formData.class || 'নূরানী');
    setFormData((prev) => ({ 
      ...prev, 
      instituteCategory: cat,
      admissionFee: feeConfig.admissionFee,
      monthlyFee: feeConfig.monthlyTuitionFee,
      boardingFee: prev.boardingStatus === 'আবাসিক' ? feeConfig.boardingFee : 0,
      examFee: feeConfig.examFee,
    }));
  }, []);

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const availableDistricts = useMemo(() => {
    return getDistrictsByDivision(formData.division);
  }, [formData.division]);

  const handleDivisionChange = (newDivision: string) => {
    const validDistricts = getDistrictsByDivision(newDivision);
    const isCurrentValid = validDistricts.some(
      d => d.nameBn === formData.district || d.nameEn === formData.district || d.label === formData.district
    );
    setFormData((prev) => ({
      ...prev,
      division: newDivision,
      district: isCurrentValid ? prev.district : ''
    }));
  };

  const handleDistrictChange = (newDistrict: string) => {
    const matchedDiv = getDivisionForDistrict(newDistrict);
    setFormData((prev) => ({
      ...prev,
      district: newDistrict,
      division: matchedDiv ? matchedDiv.id : prev.division
    }));
  };

  const getDepartments = () => {
    switch (formData.instituteCategory) {
      case 'qawmi': return ['নূরানী বিভাগ', 'নাজেরা বিভাগ', 'হিফজ বিভাগ', 'কিতাব বিভাগ', 'ইফতা বিভাগ', 'অন্যান্য বিশেষ বিভাগ'];
      case 'alia': return ['ইবতেদায়ী', 'দাখিল', 'আলিম', 'ফাযিল', 'কামিল'];
      case 'school': return ['প্লে', 'নার্সারি', 'কেজি', '১ম-১০ম শ্রেণি'];
      default: return ['নূরানী বিভাগ', 'নাজেরা বিভাগ', 'হিফজ বিভাগ', 'কিতাব বিভাগ', 'ইফতা বিভাগ', 'অন্যান্য বিশেষ বিভাগ'];
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setFormData((prev) => ({ ...prev, photoBase64: dataUrl }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Fee Calculation Helpers
  const subTotalFees = useMemo(() => {
    return (formData.admissionFee || 0) + (formData.monthlyFee || 0) + (formData.boardingFee || 0) + (formData.examFee || 0);
  }, [formData.admissionFee, formData.monthlyFee, formData.boardingFee, formData.examFee]);

  const netPayableFee = useMemo(() => {
    return Math.max(0, subTotalFees - (formData.waiverAmount || 0));
  }, [subTotalFees, formData.waiverAmount]);

  const handleWaiverStatusChange = (newStatus: string) => {
    let waiver = 0;
    if (newStatus === 'Half Free') {
      waiver = Math.round((formData.monthlyFee || 0) / 2);
    } else if (newStatus === 'Full Free') {
      waiver = (formData.monthlyFee || 0) + (formData.boardingFee || 0);
    }
    setFormData(prev => ({
      ...prev,
      waiverStatus: newStatus,
      waiverAmount: waiver
    }));
  };

  const generateId = () => {
    const year = new Date().getFullYear();
    const count = (students ? students.length : 0) + 1;
    return `REG-${year}-${String(count).padStart(3, '0')}`;
  };

  const handleSubmit = async () => {
    const newId = generateId();
    setStudentId(newId);

    const isResidential = formData.boardingStatus === 'আবাসিক';
    const pledgedKhurakiFee = isResidential ? (formData.boardingFee || 0) : undefined;

    // ─── 1. Save to Firestore (if available) ───
    try {
      if (db) {
        await addDoc(collection(db, 'students'), {
          ...formData,
          subTotalFees,
          netPayableFee,
          studentId: newId,
          createdAt: new Date()
        });
      }
    } catch (e) {
      console.error("Firestore error, saving locally", e);
    }

    // ─── 2. Provision into Central Student Master (localStorage + global context) ───
    // This makes the student immediately visible in ALL modules without any refresh.
    const created = addStudent({
      studentId: newId,
      nameBn: formData.nameBn || formData.nameEn || 'নতুন শিক্ষার্থী',
      nameEn: formData.nameEn || formData.nameBn || '',
      class: formData.class || 'নূরানী',
      department: formData.department || 'নূরানী বিভাগ',
      academicYear: '২০২৬-২০২৭',
      boardingStatus: formData.boardingStatus as 'আবাসিক' | 'অনাবাসিক' | 'ডে-কেয়ার',
      bloodGroup: formData.bloodGroup || '',
      primaryPhone: formData.primaryPhone || '',
      fatherName: formData.fatherName || '',
      fatherOccupation: formData.fatherOccupation || '',
      motherName: formData.motherName || '',
      whatsappNumber: formData.whatsappNumber || '',
      localGuardianName: formData.localGuardianName || '',
      localGuardianRelation: formData.localGuardianRelation || '',
      division: formData.division || '',
      district: formData.district || '',
      village: formData.village || '',
      studentNid: formData.studentNid || '',
      studentBirthReg: formData.studentBirthReg || '',
      parentNid: formData.parentNid || '',
      photoBase64: formData.photoBase64 || '',
      monthlyTuitionFee: formData.monthlyFee || 0,
      boardingFee: isResidential ? (formData.boardingFee || 0) : 0,
      khurakiTier: isResidential ? 'পূর্ণ পেইং' : undefined,
      pledgedKhurakiFee,
      subsidyKhurakiFee: isResidential ? 0 : undefined,
      examFee: formData.examFee || 0,
      dueAmount: netPayableFee,
      dueMonths: new Date().toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' }),
    });

    if (created) {
      setAssignedRoll(created.roll);
      setStudentId(created.studentId);
    }

    if (formData.generateReceipt) {
      setShowReceipt(true);
    } else {
      alert(language === 'bn' ? `ভর্তি সফলভাবে সম্পন্ন হয়েছে! শ্রেণি রোল: ${created?.roll || '১'} (আইডি: ${newId})` : `Admission successful! Roll: ${created?.roll || '1'} (ID: ${newId})`);
    }
  };


  if (showReceipt) {
    const orgName = instituteSettings.name || (language === 'ar' ? 'الجامعة العربية إمداد العلوم فريد آباد، دكا' : language === 'en' ? 'Jamia Arabia Imdadul Uloom Faridabad Madrasah, Dhaka' : 'জামিয়া আরাবিয়া ইমদাদুল উলূম ফরিদাবাদ মাদ্রাসা, ঢাকা');
    const orgAddr = instituteSettings.address || (language === 'ar' ? 'فريد آباد، غنداريا، دكا-١٢٠٤' : language === 'en' ? 'Faridabad, Gandaria, Dhaka-1204' : 'ফরিদাবাদ, গেন্ডারিয়া, ঢাকা-১২০৪');

    return (
      <div className="p-8 bg-gray-50 dark:bg-slate-900 min-h-screen font-sans text-gray-900 dark:text-white">
        <div id="receipt" className="max-w-2xl mx-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-8 shadow-sm rounded-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{orgName}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{orgAddr}</p>
          </div>
          <div className="border-t border-b py-3 mb-6 border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-center">
              {language === 'bn' ? 'ভর্তি ফি মানি রসিদ (Admission Money Receipt)' : language === 'ar' ? 'إيصال دفع رسوم القبول' : 'Admission Money Receipt'}
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <p><strong>{language === 'bn' ? 'রসিদ নং:' : 'Receipt No:'}</strong> #{Math.floor(100000 + Math.random() * 900000)}</p>
            <p><strong>{t.fin_date}:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>{t.marksheet_student_name}:</strong> {formData.nameBn || formData.nameEn}</p>
            <p><strong>{t.marksheet_roll}:</strong> {assignedRoll || '১'}</p>
            <p><strong>{language === 'bn' ? 'স্টুডেন্ট আইডি:' : 'Student ID:'}</strong> {studentId}</p>
            <p><strong>{t.marksheet_class}:</strong> {formData.class} ({formData.boardingStatus})</p>
            <p><strong>বিভাগ:</strong> {formData.department}</p>
          </div>

          {/* Detailed Itemized Fee Breakdown in Receipt */}
          <div className="border rounded-lg overflow-hidden mb-6 text-xs">
            <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-slate-700 font-bold">
                <tr>
                  <th className="p-2">ফি বিবরণী</th>
                  <th className="p-2 text-right">টাকা (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-700">
                <tr>
                  <td className="p-2">ভর্তি ফি (Admission Fee)</td>
                  <td className="p-2 text-right font-mono">৳ {formData.admissionFee.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-2">প্রথম মাসের মাসিক বেতন (Monthly Tuition)</td>
                  <td className="p-2 text-right font-mono">৳ {formData.monthlyFee.toLocaleString()}</td>
                </tr>
                {formData.boardingStatus === 'আবাসিক' && (
                  <tr>
                    <td className="p-2">মেস/বোর্ডিং খাবার ফি (Boarding Fee)</td>
                    <td className="p-2 text-right font-mono">৳ {formData.boardingFee.toLocaleString()}</td>
                  </tr>
                )}
                <tr>
                  <td className="p-2">পরীক্ষা ও অন্যান্য ফি (Exam Fee)</td>
                  <td className="p-2 text-right font-mono">৳ {formData.examFee.toLocaleString()}</td>
                </tr>
                {formData.waiverAmount > 0 && (
                  <tr className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/20">
                    <td className="p-2">বিশেষ ছাড় / মওকুফ স্কলারশিপ ({formData.waiverStatus})</td>
                    <td className="p-2 text-right font-mono">- ৳ {formData.waiverAmount.toLocaleString()}</td>
                  </tr>
                )}
                <tr className="bg-gray-50 dark:bg-slate-700/50 font-black text-sm text-gray-900 dark:text-white">
                  <td className="p-2.5">সর্বমোট পরিশোধিত টাকা (Net Paid Amount)</td>
                  <td className="p-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400">
                    ৳ {netPayableFee.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-12 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="border-t border-gray-400 pt-2 w-48 text-center">{language === 'bn' ? 'অভিভাবকের স্বাক্ষর' : 'Guardian Signature'}</div>
            <div className="border-t border-gray-400 pt-2 w-48 text-center">{language === 'bn' ? 'দায়িত্বপ্রাপ্ত কোষাধ্যক্ষ / মুহতামিম' : 'Authorized Signature'}</div>
          </div>
          <div className="mt-8 text-center print:hidden flex gap-3 justify-center">
            <button onClick={() => window.print()} className="bg-emerald-600 text-white px-6 py-2 rounded-lg shadow font-bold hover:bg-emerald-700 transition">
              {language === 'bn' ? 'রসিদ প্রিন্ট করুন' : 'Print Receipt'}
            </button>
            <button onClick={() => setShowReceipt(false)} className="bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition">
              {language === 'bn' ? 'নতুন ভর্তি ফরম' : 'New Admission'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6 text-emerald-600 dark:text-emerald-400">
        {language === 'bn' ? 'নতুন শিক্ষার্থী ভর্তি ফরম' : language === 'ar' ? 'استمارة تسجيل وقبول الطالب الجديد' : 'Student Admission Wizard'}
      </h1>
      
      <div className="mb-8 flex space-x-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-2 flex-1 rounded ${step >= i ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-slate-700'}`}></div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold mb-4">
              {language === 'bn' ? 'ধাপ ১: ব্যক্তিগত তথ্য' : language === 'ar' ? 'الخطوة ١: البيانات الشخصية' : 'Step 1: Personal Info'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Full Name (English) *" required className="p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm" value={formData.nameEn} onChange={(e) => setFormData({...formData, nameEn: e.target.value})} />
              <input placeholder="শিক্ষার্থীর নাম (বাংলা) *" required className="p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm" value={formData.nameBn} onChange={(e) => setFormData({...formData, nameBn: e.target.value})} />
              <input type="date" placeholder="Date of Birth" className="p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
              <select className="p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm" value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}>
                <option value="A+">Blood: A+</option><option value="A-">Blood: A-</option>
                <option value="B+">Blood: B+</option><option value="B-">Blood: B-</option>
                <option value="O+">Blood: O+</option><option value="O-">Blood: O-</option>
                <option value="AB+">Blood: AB+</option><option value="AB-">Blood: AB-</option>
              </select>
              <select className="p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                <option value="Male">{language === 'bn' ? 'ছাত্র (পুরুষ)' : language === 'ar' ? 'طالب (ذكر)' : 'Male'}</option>
                <option value="Female">{language === 'bn' ? 'ছাত্রী (মহিলা)' : language === 'ar' ? 'طالبة (أنثى)' : 'Female'}</option>
              </select>
              <select className="p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm" value={formData.orphanStatus} onChange={(e) => setFormData({...formData, orphanStatus: e.target.value})}>
                <option value="No">{language === 'bn' ? 'অভিভাবক জীবিত (সাধারণ)' : language === 'ar' ? 'الوالدان على قيد الحياة' : 'Not Orphan'}</option>
                <option value="Yes">{language === 'bn' ? 'এতিম শিক্ষার্থী (লিল্লাহ)' : language === 'ar' ? 'يتيم (صندوق الفقراء)' : 'Orphan'}</option>
              </select>
              <input placeholder={language === 'bn' ? 'কোনো শারীরিক অসুস্থতা থাকলে লিখুন' : language === 'ar' ? 'أي حالات صحية أو أمراض' : 'Medical Conditions'} className="p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm md:col-span-2" value={formData.medicalConditions} onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})} />
              <div className="md:col-span-2">
                <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? 'শিক্ষার্থীর ছবি আপলোড' : language === 'ar' ? 'تحميل صورة الطالب' : 'Student Photo Upload'}
                </label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full text-sm text-gray-900 dark:text-white" />
              </div>
            </div>
            <button onClick={handleNext} disabled={!formData.nameEn || !formData.nameBn} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 mt-4 rounded-lg font-semibold shadow disabled:opacity-50 text-sm transition">
              {t.next}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold mb-4">
              {language === 'bn' ? 'ধাপ ২: শিক্ষাগত তথ্য' : language === 'ar' ? 'الخطوة ٢: البيانات التعليمية' : 'Step 2: Academic Info'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? 'জামাত / শ্রেণি *' : language === 'ar' ? 'المرحلة / الصف *' : 'Jamat / Class *'}
                </label>
                <select 
                  className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm font-semibold" 
                  value={formData.class} 
                  onChange={(e) => {
                    const selectedVal = e.target.value;
                    const matched = UNIFIED_QAWMI_JAMATS.find(j => j.value === selectedVal);
                    const feeConfig = getFeeForJamat(selectedVal);
                    const isRes = formData.boardingStatus === 'আবাসিক';
                    
                    setFormData(prev => ({
                      ...prev, 
                      class: selectedVal,
                      department: matched ? matched.department : prev.department,
                      admissionFee: feeConfig.admissionFee,
                      monthlyFee: feeConfig.monthlyTuitionFee,
                      boardingFee: isRes ? feeConfig.boardingFee : 0,
                      examFee: feeConfig.examFee,
                    }));
                  }}
                >
                  <option value="" disabled>-- {language === 'bn' ? 'জামাত / শ্রেণি নির্বাচন করুন' : 'Select Jamat / Class'} --</option>
                  {UNIFIED_QAWMI_JAMATS.map((j) => (
                    <option key={j.value} value={j.value}>
                      {j.nameWithEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? 'বিভাগ (Department)' : language === 'ar' ? 'القسم' : 'Department'}
                </label>
                <select 
                  className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm font-semibold" 
                  value={formData.department} 
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                >
                  {getDepartments().map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? 'আবাসিক স্ট্যাটাস' : 'Boarding Status'}
                </label>
                <select 
                  className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm font-semibold" 
                  value={formData.boardingStatus} 
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    const feeConfig = getFeeForJamat(formData.class);
                    const isRes = newStatus === 'আবাসিক';
                    setFormData(prev => ({
                      ...prev, 
                      boardingStatus: newStatus,
                      boardingFee: isRes ? feeConfig.boardingFee : 0,
                    }));
                  }}
                >
                  <option value="আবাসিক">{language === 'bn' ? 'আবাসিক (Residential - খাবার ফি সহ)' : 'Residential'}</option>
                  <option value="অনাবাসিক">{language === 'bn' ? 'অনাবাসিক (Non-Residential - মেস ফি ৳০)' : 'Non-Residential'}</option>
                  <option value="ডে-কেয়ার">{language === 'bn' ? 'ডে-কেয়ার (Day Care)' : 'Day Care'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? 'পূর্ববর্তী প্রতিষ্ঠানের নাম' : 'Previous Institution'}
                </label>
                <input placeholder={language === 'bn' ? "পূর্ববর্তী প্রতিষ্ঠানের নাম (যদি থাকে)" : language === 'ar' ? "المعهد السابق" : "Previous Institution"} className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm font-semibold" value={formData.previousInstitution} onChange={(e) => setFormData({...formData, previousInstitution: e.target.value})} />
              </div>
            </div>

            {/* Live Fee preview callout in Step 2 */}
            <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs">
              <span className="text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                <Coins size={15} />
                "{formData.class}" জামাতের নির্ধারিত স্ট্যান্ডার্ড ফি অনুযায়ী ভর্তি ফরম স্বয়ংক্রিয়ভাবে প্রস্তুত হচ্ছে।
              </span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                ভর্তি: ৳{formData.admissionFee} | মাসিক: ৳{formData.monthlyFee} | বোর্ডিং: ৳{formData.boardingFee}
              </span>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={handlePrev} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold shadow text-sm transition">{t.back}</button>
              <button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold shadow text-sm transition">{t.next}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold mb-4">
              {language === 'bn' ? 'ধাপ ৩: অভিভাবক ও যোগাযোগ' : language === 'ar' ? 'الخطوة ٣: ولي الأمر والتواصل' : 'Step 3: Guardian & Contact'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder={language === 'bn' ? "পিতার নাম" : language === 'ar' ? "اسم الوالد" : "Father's Name"} className="p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm" value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} />
              <input placeholder={language === 'bn' ? "পিতার পেশা" : language === 'ar' ? "مهنة الوالد" : "Father's Occupation"} className="p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm" value={formData.fatherOccupation} onChange={(e) => setFormData({...formData, fatherOccupation: e.target.value})} />
              <input placeholder={language === 'bn' ? "মাতার নাম" : language === 'ar' ? "اسم الوالدة" : "Mother's Name"} className="p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm" value={formData.motherName} onChange={(e) => setFormData({...formData, motherName: e.target.value})} />
              <input placeholder={language === 'bn' ? "অভিভাবকের মোবাইল নম্বর *" : language === 'ar' ? "رقم الهاتف الأساسي *" : "Primary Phone *"} required type="tel" className="p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm" value={formData.primaryPhone} onChange={(e) => setFormData({...formData, primaryPhone: e.target.value})} />
              <input placeholder="WhatsApp Number" type="tel" className="p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm" value={formData.whatsappNumber} onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})} />
              <input placeholder={language === 'bn' ? "বিকল্প ফোন নম্বর" : language === 'ar' ? "رقم بديل" : "Alternative Phone"} type="tel" className="p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm" value={formData.altPhone} onChange={(e) => setFormData({...formData, altPhone: e.target.value})} />
              <input placeholder={language === 'bn' ? "স্থানীয় অভিভাবকের নাম" : language === 'ar' ? "اسم ولي الأمر المحلي" : "Local Guardian Name"} className="p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm" value={formData.localGuardianName} onChange={(e) => setFormData({...formData, localGuardianName: e.target.value})} />
              <input placeholder={language === 'bn' ? "সম্পর্ক" : language === 'ar' ? "صلة القرابة" : "Relationship"} className="p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm" value={formData.localGuardianRelation} onChange={(e) => setFormData({...formData, localGuardianRelation: e.target.value})} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handlePrev} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold shadow text-sm transition">{t.back}</button>
              <button onClick={handleNext} disabled={!formData.primaryPhone} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold shadow disabled:opacity-50 text-sm transition">{t.next}</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold mb-4">
              {language === 'bn' ? 'ধাপ ৪: ঠিকানা ও কাগজপত্র' : language === 'ar' ? 'الخطوة ٤: العنوان والوثائق' : 'Step 4: Address & Documents'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? 'বিভাগ (Division)' : language === 'ar' ? 'المحافظة' : 'Division'}
                </label>
                <select 
                  className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm font-semibold" 
                  value={formData.division} 
                  onChange={(e) => handleDivisionChange(e.target.value)}
                >
                  <option value="">{language === 'bn' ? '-- সকল বিভাগ (সব জেলা দেখুন) --' : '-- All Divisions (Show 64 Districts) --'}</option>
                  {BANGLADESH_DIVISIONS.map(d => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? 'জেলা (District) *' : language === 'ar' ? 'المنطقة / المقاطعة' : 'District *'}
                </label>
                <select 
                  className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm font-semibold" 
                  value={formData.district} 
                  onChange={(e) => handleDistrictChange(e.target.value)}
                >
                  <option value="">
                    {formData.division 
                      ? (language === 'bn' ? `-- ${BANGLADESH_DIVISIONS.find(d => d.id === formData.division)?.nameBn} বিভাগের জেলা (${availableDistricts.length}টি) --` : '-- Select District --')
                      : (language === 'bn' ? '-- জেলা নির্বাচন করুন (৬৪ জেলা) --' : '-- Select District (64 Districts) --')
                    }
                  </option>
                  {availableDistricts.map(d => (
                    <option key={d.id} value={d.nameBn}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? 'গ্রাম / এলাকা / ঠিকানা' : language === 'ar' ? 'القرية / الحي' : 'Village/Area'}
                </label>
                <input placeholder={language === 'bn' ? "গ্রাম / পাড়া / এলাকা" : language === 'ar' ? "القرية / الحي" : "Village/Area"} className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm font-semibold" value={formData.village} onChange={(e) => setFormData({...formData, village: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? 'জন্ম নিবন্ধন নম্বর' : language === 'ar' ? 'رقم شهادة الميلاد' : 'Birth Reg No'}
                </label>
                <input placeholder={language === 'bn' ? "১৭ সংখ্যার জন্ম নিবন্ধন নম্বর" : language === 'ar' ? "رقم شهادة الميلاد" : "Birth Reg No"} className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm font-semibold" value={formData.studentBirthReg} onChange={(e) => setFormData({...formData, studentBirthReg: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? 'ছাত্রের এনআইডি (যদি থাকে)' : language === 'ar' ? 'الهوية الوطنية للطالب' : 'Student NID (optional)'}
                </label>
                <input placeholder={language === 'bn' ? "ছাত্রের জাতীয় পরিচয়পত্র (ঐচ্ছিক)" : language === 'ar' ? "الهوية الوطنية للطالب" : "Student NID (optional)"} className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm font-semibold" value={formData.studentNid} onChange={(e) => setFormData({...formData, studentNid: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? 'পিতা/মাতার এনআইডি' : language === 'ar' ? 'الهوية الوطنية لولي الأمر' : 'Parent NID (optional)'}
                </label>
                <input placeholder={language === 'bn' ? "অভিভাবকের জাতীয় পরিচয়পত্র নম্বর" : language === 'ar' ? "الهوية الوطنية لولي الأمر" : "Parent NID (optional)"} className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 text-sm font-semibold" value={formData.parentNid} onChange={(e) => setFormData({...formData, parentNid: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handlePrev} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold shadow text-sm transition">{t.back}</button>
              <button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold shadow text-sm transition">{t.next}</button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 5: FEES, SCHOLARSHIP WAIVER & ADMISSION CONFIRMATION
            ───────────────────────────────────────────────────────────── */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Coins className="text-emerald-600" size={22} />
                {language === 'bn' ? 'ধাপ ৫: ফি নির্ধারণ, বিশেষ ছাড় ও ভর্তি সম্পন্ন' : 'Step 5: Fees, Waiver & Admission'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                নির্বাচিত জামাত "{formData.class}" ও আবাসন ধরন "{formData.boardingStatus}" অনুযায়ী স্বয়ংক্রিয়ভাবে ফি নির্ধারণ করা হয়েছে।
              </p>
            </div>

            {/* Selected Jamat Badge Callout */}
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold">
                  {formData.class}
                </span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  বিভাগ: {formData.department} | স্ট্যাটাস: {formData.boardingStatus}
                </span>
              </div>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 size={14} />
                ফি সেটিংস থেকে সংযুক্ত
              </span>
            </div>

            {/* Fee Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Admission Fee */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-700 space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  ভর্তি ফি (Admission Fee) ৳
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.admissionFee} 
                  onChange={(e) => setFormData({...formData, admissionFee: Number(e.target.value)})} 
                  className="w-full p-2 font-bold font-mono border rounded-lg bg-white text-gray-900 dark:bg-slate-800 dark:text-white border-gray-300 dark:border-slate-600 text-sm focus:ring-2 focus:ring-emerald-500" 
                />
                <span className="text-[10px] text-gray-400">এককালীন ধার্য</span>
              </div>

              {/* Monthly Tuition Fee */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-700 space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  ১ম মাসের বেতন (Tuition) ৳
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.monthlyFee} 
                  onChange={(e) => setFormData({...formData, monthlyFee: Number(e.target.value)})} 
                  className="w-full p-2 font-bold font-mono border rounded-lg bg-white text-gray-900 dark:bg-slate-800 dark:text-white border-gray-300 dark:border-slate-600 text-sm focus:ring-2 focus:ring-emerald-500" 
                />
                <span className="text-[10px] text-gray-400">প্রতি মাসে ধার্য</span>
              </div>

              {/* Boarding Fee */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-700 space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  আবাসিক খাবার ফি ৳
                </label>
                <input 
                  type="number" 
                  min="0"
                  disabled={formData.boardingStatus !== 'আবাসিক'}
                  value={formData.boardingFee} 
                  onChange={(e) => setFormData({...formData, boardingFee: Number(e.target.value)})} 
                  className="w-full p-2 font-bold font-mono border rounded-lg bg-white text-gray-900 dark:bg-slate-800 dark:text-white border-gray-300 dark:border-slate-600 text-sm focus:ring-2 focus:ring-emerald-500 disabled:opacity-50" 
                />
                <span className="text-[10px] text-gray-400">
                  {formData.boardingStatus === 'আবাসিক' ? 'আবাসিক মেস বাবদ' : 'অনাবাসিক (৳ ০)'}
                </span>
              </div>

              {/* Exam Fee */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-700 space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  পরীক্ষা ও আইডি ফি ৳
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.examFee} 
                  onChange={(e) => setFormData({...formData, examFee: Number(e.target.value)})} 
                  className="w-full p-2 font-bold font-mono border rounded-lg bg-white text-gray-900 dark:bg-slate-800 dark:text-white border-gray-300 dark:border-slate-600 text-sm focus:ring-2 focus:ring-emerald-500" 
                />
                <span className="text-[10px] text-gray-400">প্রাথমিক পরীক্ষা ফি</span>
              </div>
            </div>

            {/* Waiver & Scholarship Section */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/70 to-indigo-50/40 dark:from-slate-900/60 dark:to-slate-900/40 border border-blue-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-blue-600" />
                  বিশেষ ছাড় / স্কলারশিপ (Waiver & Scholarship)
                </h3>
                <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">অসচ্ছল ও মেধাবী ছাত্রদের জন্য</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    মওকুফ ক্যাটাগরি (Waiver Status)
                  </label>
                  <select 
                    className="w-full p-2.5 border rounded-lg bg-white text-gray-900 dark:bg-slate-800 dark:text-white border-gray-300 dark:border-slate-600 text-sm font-semibold" 
                    value={formData.waiverStatus} 
                    onChange={(e) => handleWaiverStatusChange(e.target.value)}
                  >
                    <option value="Full Payment">সম্পূর্ণ বেতন প্রদানকারী (Full Payment - কোনো ছাড় নেই)</option>
                    <option value="Half Free">অর্ধেক মওকুফ (Half Free - মাসিক বেতনের ৫০% ছাড়)</option>
                    <option value="Full Free">সম্পূর্ণ ফ্রি (Full Free / লিল্লাহ বোর্ডিং ফান্ড)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    বিশেষ ছাড়ের পরিমাণ (Waiver Amount) ৳
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">৳</span>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.waiverAmount} 
                      onChange={(e) => setFormData({...formData, waiverAmount: Number(e.target.value)})} 
                      className="w-full pl-8 pr-3 py-2 font-bold font-mono border rounded-lg bg-white text-gray-900 dark:bg-slate-800 dark:text-white border-gray-300 dark:border-slate-600 text-sm focus:ring-2 focus:ring-blue-500" 
                      placeholder="0"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 block">
                    * মওকুফকৃত এই টাকাটি সর্বমোট প্রদেয় ফি থেকে বাদ যাবে
                  </span>
                </div>
              </div>
            </div>

            {/* Calculation & Net Payable Summary Card */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/70 border border-gray-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <span>মোট ধার্যকৃত ফি:</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">৳ {subTotalFees.toLocaleString()}</span>
                    <span>({formData.admissionFee} + {formData.monthlyFee} + {formData.boardingFee} + {formData.examFee})</span>
                  </div>
                  {formData.waiverAmount > 0 && (
                    <div className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2">
                      <span>বিশেষ ছাড় / মওকুফ:</span>
                      <span className="font-mono">- ৳ {formData.waiverAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">
                    ভর্তিকালীন সর্বমোট প্রদেয় ফি (Net Payable)
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    ৳ {netPayableFee.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 mt-3 border-t dark:border-slate-700">
                <input 
                  type="checkbox" 
                  id="receiptCheck" 
                  checked={formData.generateReceipt} 
                  onChange={(e) => setFormData({...formData, generateReceipt: e.target.checked})} 
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" 
                />
                <label htmlFor="receiptCheck" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  {language === 'bn' ? 'ভর্তি মানি রসিদ স্বয়ংক্রিয়ভাবে তৈরি ও প্রিন্ট করুন' : 'Generate & Print Admission Money Receipt'}
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={handlePrev} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2.5 rounded-xl font-bold shadow text-sm transition">
                {t.back}
              </button>
              <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-md text-sm transition flex items-center gap-2">
                <Check size={18} />
                {t.finish}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
