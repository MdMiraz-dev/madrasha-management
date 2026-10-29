/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import { 
  Search, Grid, List, Eye, Edit, FileBadge, 
  DollarSign, Calendar, Filter, Users, CheckCircle2,
  GraduationCap, BookOpen, Coins, ArrowUpRight, MapPin, Phone, MessageSquare, X
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useApp } from "@/lib/context";
import { translations } from "@/lib/translations";
import { Student, ACADEMIC_YEARS, calculateStudentFees } from "@/lib/studentsData";
import { UNIFIED_QAWMI_JAMATS, matchesUnifiedJamat } from "@/lib/qawmiJamats";
import { normalizeStudentRolls, fromBengaliNumeral } from "@/lib/studentStore";

export default function StudentsListPage() {
  const { language } = useLanguage();
  const { students, setStudents } = useApp();
  const t = translations[language as keyof typeof translations] || translations.bn;

  const [loading, setLoading] = useState(false);
  const [selectedStudentModal, setSelectedStudentModal] = useState<Student | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [boardingFilter, setBoardingFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Listen to Firestore if available, otherwise central state already loaded
  useEffect(() => {
    if (!db) return;
    try {
      const q = query(collection(db, "students"), orderBy("createdAt", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const firestoreData = snapshot.docs.map(doc => {
            const d = doc.data();
            const rawRoll = d.roll ? String(d.roll) : '';
            const rollNum = fromBengaliNumeral(rawRoll);
            const isValidRoll = rawRoll && !isNaN(rollNum) && rollNum < 500;

            return {
              id: doc.id,
              studentId: d.studentId || doc.id,
              roll: isValidRoll ? rawRoll : '১',
              nameBn: d.nameBn || d.nameEn || 'শিক্ষার্থী',
              nameEn: d.nameEn || '',
              class: d.class || 'মিজান',
              department: d.department || 'কিতাব বিভাগ',
              academicYear: d.academicYear || '২০২৬-২০২৭',
              boardingStatus: d.boardingStatus || 'আবাসিক',
              bloodGroup: d.bloodGroup || 'A+',
              primaryPhone: d.primaryPhone || '01700000000',
              fatherName: d.fatherName || '',
              monthlyTuitionFee: Number(d.monthlyFee) || 1500,
              boardingFee: d.boardingStatus === 'আবাসিক' ? 2500 : 0,
              examFee: 400,
              dueAmount: Number(d.monthlyFee || 1500) + (d.boardingStatus === 'আবাসিক' ? 2500 : 0),
              dueMonths: 'সেপ্টেম্বর ২০২৬',
            } as Student;
          });

          // Merge Firestore with current central students (avoiding duplicate IDs)
          const existingIds = new Set(firestoreData.map(s => s.studentId));
          const merged = [...firestoreData, ...students.filter(s => !existingIds.has(s.studentId))];
          const normalized = normalizeStudentRolls(merged);
          setStudents(normalized);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  // Filter students based on Search + Academic Year + Jamat + Boarding
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // 1. Search filter
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = !searchLower || (
        (s.nameEn || "").toLowerCase().includes(searchLower) || 
        (s.nameBn || "").includes(searchTerm) ||
        (s.studentId || "").toLowerCase().includes(searchLower) ||
        (s.roll || "").includes(searchTerm)
      );

      // 2. Academic Year Filter
      const matchesYear = academicYearFilter === 'all' || s.academicYear === academicYearFilter;

      // 3. Jamat Filter
      const matchesClass = matchesUnifiedJamat(s.class, s.department, classFilter);

      // 4. Boarding Filter
      const matchesBoarding = boardingFilter === 'all' || s.boardingStatus === boardingFilter;

      return matchesSearch && matchesYear && matchesClass && matchesBoarding;
    });
  }, [students, searchTerm, academicYearFilter, classFilter, boardingFilter]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentData = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const selectedYearLabel = ACADEMIC_YEARS.find(y => y.value === academicYearFilter)?.labelBn;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Page Title & View Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
            <GraduationCap className="text-emerald-600 dark:text-emerald-400" size={32} />
            <span>{language === 'bn' ? 'শিক্ষার্থী তালিকা ও সালভিত্তিক ডাটাবেজ' : t.students}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            মাদ্রাসার বর্তমান ও সাবেক সকল শিক্ষাবর্ষের (সেশন) ও জামাতের ছাত্র তালিকা
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admission"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition"
          >
            <Users size={16} />
            <span>নতুন ভর্তি করুন</span>
          </Link>
          <div className="flex bg-gray-200 dark:bg-slate-700 rounded-xl p-1 gap-1">
            <button 
              onClick={() => setViewMode("table")} 
              className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs' : 'text-gray-600 dark:text-gray-300'}`}
              title="টেবিল ভিউ"
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode("card")} 
              className={`p-1.5 rounded-lg transition ${viewMode === 'card' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs' : 'text-gray-600 dark:text-gray-300'}`}
              title="কার্ড ভিউ"
            >
              <Grid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── FILTERS BAR: Academic Year + Jamat + Boarding + Search ─── */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* 1. Academic Year Filter (শিক্ষাবর্ষ / সাল) */}
          <div className="flex-1 min-w-[200px] sm:max-w-xs">
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
              <Calendar size={13} className="text-emerald-600 dark:text-emerald-400" />
              শিক্ষাবর্ষ / সাল (Academic Session)
            </label>
            <select 
              className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-700/60 text-gray-900 dark:text-white border-emerald-300 dark:border-emerald-700 font-bold text-xs focus:ring-2 focus:ring-emerald-500 outline-none shadow-2xs" 
              value={academicYearFilter} 
              onChange={(e) => { setAcademicYearFilter(e.target.value); setCurrentPage(1); }}
            >
              {ACADEMIC_YEARS.map(y => (
                <option key={y.value} value={y.value}>
                  {language === 'bn' ? y.labelBn : y.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Jamat Filter (কওমি জামাত) */}
          <div className="flex-1 min-w-[170px] sm:max-w-xs">
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
              <BookOpen size={13} className="text-blue-600 dark:text-blue-400" />
              জামাত / শ্রেণী (Class)
            </label>
            <select 
              className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-700/60 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 font-bold text-xs focus:ring-2 focus:ring-emerald-500 outline-none shadow-2xs" 
              value={classFilter} 
              onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">সব জামাত (সকল বিভাগ)</option>
              {UNIFIED_QAWMI_JAMATS.map(j => (
                <option key={j.value} value={j.value}>{j.nameWithEn}</option>
              ))}
            </select>
          </div>

          {/* 3. Boarding Status Filter */}
          <div className="w-36">
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
              আবাসন ধরন
            </label>
            <select 
              className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-700/60 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 font-semibold text-xs focus:ring-2 focus:ring-emerald-500 outline-none shadow-2xs" 
              value={boardingFilter} 
              onChange={(e) => { setBoardingFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">সব আবাসন</option>
              <option value="আবাসিক">আবাসিক</option>
              <option value="অনাবাসিক">অনাবাসিক</option>
              <option value="ডে-কেয়ার">ডে-কেয়ার</option>
            </select>
          </div>

          {/* 4. Instant Search Input */}
          <div className="flex-1 min-w-[220px]">
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
              শিক্ষার্থী সার্চ
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="নাম, রোল বা আইডি দিয়ে খুঁজুন..." 
                className="w-full pl-9 pr-4 py-2 border rounded-xl bg-slate-50 dark:bg-slate-700/60 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

        </div>

        {/* Active Filter Summary Bar */}
        <div className="pt-2 border-t border-gray-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              ফলাফল: {filteredStudents.length} জন শিক্ষার্থী
            </span>
            {academicYearFilter !== 'all' && (
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                {selectedYearLabel}
              </span>
            )}
            {classFilter !== 'all' && (
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 px-2 py-0.5 rounded-md font-bold">
                জামাত: {classFilter}
              </span>
            )}
          </div>

          {(academicYearFilter !== 'all' || classFilter !== 'all' || boardingFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setAcademicYearFilter('all');
                setClassFilter('all');
                setBoardingFilter('all');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="text-red-500 hover:text-red-700 font-bold text-xs"
            >
              ফিল্টার রিসেট করুন ↺
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500 font-bold">শিক্ষার্থীদের তথ্য লোড হচ্ছে...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-slate-700 space-y-2">
          <GraduationCap size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-2" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">কোনো শিক্ষার্থী পাওয়া যায়নি</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            নির্বাচিত শিক্ষাবর্ষ ({selectedYearLabel}) বা জামাত ({classFilter !== 'all' ? classFilter : 'সকল'}) অনুযায়ী কোনো রেকর্ড নেই
          </p>
        </div>
      ) : (
        <>
          {/* ─── 1. TABLE VIEW ─── */}
          {viewMode === "table" ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 text-left">
                <thead className="bg-slate-50 dark:bg-slate-700/60">
                  <tr>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">শিক্ষার্থী ও আইডি</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">জামাত ও বিভাগ</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">শিক্ষাবর্ষ (Session)</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">আবাসন</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">ধার্যকৃত ফি</th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">অ্যাকশন ও ফি আদায়</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700/60">
                  {currentData.map((s) => {
                    const fees = calculateStudentFees(s);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                        {/* Student Name & Avatar */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {s.photoBase64 ? (
                              <img className="h-10 w-10 rounded-full object-cover border border-emerald-500/40" src={s.photoBase64} alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shadow-2xs border border-emerald-200 dark:border-emerald-800">
                                {s.nameBn?.charAt(0) || s.nameEn?.charAt(0) || "শ"}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">
                                {s.nameBn || s.nameEn}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                আইডি: {s.studentId} • রোল: {s.roll}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Class & Dept */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{s.class}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{s.department}</div>
                        </td>

                        {/* Academic Year Badge */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60">
                            <Calendar size={11} className="text-amber-600" />
                            {s.academicYear || '২০২৬-২০২৭'}
                          </span>
                        </td>

                        {/* Boarding Status */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full ${
                            s.boardingStatus === 'আবাসিক' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300'
                          }`}>
                            {s.boardingStatus}
                          </span>
                        </td>

                        {/* Monthly Fee Breakdown */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="text-xs font-bold text-gray-900 dark:text-white font-mono">
                            মোট: ৳{fees.total.toLocaleString()}
                          </div>
                          <div className="text-[10.5px] text-gray-500 dark:text-gray-400">
                            বেতন: ৳{fees.tuition} {fees.isResidential ? `• বোর্ডিং: ৳${fees.boarding}` : ''}
                          </div>
                        </td>

                        {/* Actions: Direct Fee Collection + Profile + ID Card */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Direct Fee Collection Button (Auto-populate in finance-fees) */}
                            <Link 
                              href={`/finance-fees?studentId=${encodeURIComponent(s.studentId)}&action=collect`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                              title="এই শিক্ষার্থীর ফি আদায় ও রশিদ তৈরি করুন"
                            >
                              <Coins size={13} className="text-amber-300" />
                              <span>ফি আদায়</span>
                            </Link>

                            <Link 
                              href={`/students/${s.id}`} 
                              className="p-1.5 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                              title="প্রোফাইল দেখুন"
                            >
                              <Eye size={16} />
                            </Link>

                            <Link 
                              href="/id-cards" 
                              className="p-1.5 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                              title="আইডি কার্ড"
                            >
                              <FileBadge size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* ─── 2. CARD VIEW ─── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {currentData.map(s => {
                const fees = calculateStudentFees(s);
                return (
                  <div 
                    key={s.id} 
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col hover:shadow-md transition"
                  >
                    {/* Card Top Banner with Academic Year Badge */}
                    <div className="h-20 bg-gradient-to-r from-emerald-600 to-teal-700 p-3 relative flex justify-between items-start">
                      <span className="bg-black/30 backdrop-blur-sm text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                        {s.academicYear || '২০২৬-২০২৭'}
                      </span>
                      <span className="bg-white/20 text-white text-[10.5px] font-bold px-2 py-0.5 rounded-full">
                        {s.boardingStatus}
                      </span>
                      
                      {/* Avatar Centered */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                        {s.photoBase64 ? (
                          <img className="h-16 w-16 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md" src={s.photoBase64} alt="" />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xl border-4 border-white dark:border-slate-800 shadow-md">
                            {s.nameBn?.charAt(0) || s.nameEn?.charAt(0) || "শ"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="pt-10 pb-4 px-4 flex flex-col items-center flex-1 text-center">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                        {s.nameBn || s.nameEn}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                        আইডি: {s.studentId} • রোল: {s.roll}
                      </p>

                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2.5 w-full my-3 text-xs border border-gray-100 dark:border-slate-700 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">জামাত:</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{s.class}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">মাসিক প্রদেয়:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">৳{fees.total.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-auto w-full flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                        <Link 
                          href={`/students/${s.id}`} 
                          className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold transition"
                        >
                          প্রোফাইল
                        </Link>
                        <Link 
                          href={`/finance-fees?studentId=${encodeURIComponent(s.studentId)}&action=collect`}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Coins size={12} className="text-amber-300" />
                          <span>ফি আদায়</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 text-xs font-semibold">
              <span className="text-gray-500 dark:text-gray-400">
                মোট {filteredStudents.length} জনের মধ্যে {((currentPage - 1) * itemsPerPage) + 1} থেকে {Math.min(currentPage * itemsPerPage, filteredStudents.length)} প্রদর্শন
              </span>
              <div className="flex items-center gap-1.5">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)} 
                  className="px-3 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-700 disabled:opacity-40 text-gray-700 dark:text-gray-200"
                >
                  আগের পাতা
                </button>
                <span className="px-2 font-bold text-gray-800 dark:text-gray-100">
                  {currentPage} / {totalPages}
                </span>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)} 
                  className="px-3 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-700 disabled:opacity-40 text-gray-700 dark:text-gray-200"
                >
                  পরের পাতা
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── QUICK STUDENT IDENTITY CARD POPUP MODAL ─── */}
      {selectedStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white relative">
              <button 
                onClick={() => setSelectedStudentModal(null)}
                className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full transition"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4">
                {selectedStudentModal.photoBase64 ? (
                  <img 
                    src={selectedStudentModal.photoBase64} 
                    alt="" 
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white/80 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black text-white border-2 border-white/40 shadow-md">
                    {selectedStudentModal.nameBn?.charAt(0) || selectedStudentModal.nameEn?.charAt(0) || 'শ'}
                  </div>
                )}
                <div>
                  <span className="bg-white/20 text-amber-300 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full inline-block mb-1">
                    {selectedStudentModal.academicYear || '২০২৬-২০২৭'} • {selectedStudentModal.boardingStatus}
                  </span>
                  <h2 className="text-xl font-black leading-tight">{selectedStudentModal.nameBn}</h2>
                  {selectedStudentModal.nameEn && (
                    <p className="text-xs text-emerald-100 font-medium">{selectedStudentModal.nameEn}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 font-mono text-xs text-amber-200 font-bold">
                    <span className="bg-black/30 px-2 py-0.5 rounded-md">আইডি: {selectedStudentModal.studentId}</span>
                    <span className="bg-amber-400 text-slate-900 px-2 py-0.5 rounded-md">রোল: {selectedStudentModal.roll}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Jamat & Dept */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-700">
                <div>
                  <span className="text-gray-400 block font-semibold">জামাত / শ্রেণি</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{selectedStudentModal.class}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold">বিভাগ</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{selectedStudentModal.department}</span>
                </div>
              </div>

              {/* Address Details */}
              <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-800/40 space-y-1">
                <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1 text-xs">
                  <MapPin size={14} />
                  <span>স্থায়ী ঠিকানা (Permanent Address)</span>
                </div>
                <div className="text-gray-700 dark:text-gray-300 font-medium space-y-0.5">
                  <p><strong>গ্রাম/এলাকা:</strong> {selectedStudentModal.village || 'তথ্য দেওয়া নেই'}</p>
                  <p><strong>জেলা:</strong> {selectedStudentModal.district || 'তথ্য দেওয়া নেই'} | <strong>বিভাগ:</strong> {selectedStudentModal.division || 'তথ্য দেওয়া নেই'}</p>
                </div>
              </div>

              {/* Guardian Info & Phones */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-gray-100 dark:border-slate-700 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-gray-700 dark:text-gray-300">
                  <p><strong>পিতার নাম:</strong> {selectedStudentModal.fatherName || 'তথ্য দেওয়া নেই'}</p>
                  <p><strong>মাতার নাম:</strong> {selectedStudentModal.motherName || 'তথ্য দেওয়া নেই'}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t dark:border-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-emerald-600" />
                    <span className="font-mono font-bold text-gray-900 dark:text-white">{selectedStudentModal.primaryPhone}</span>
                  </div>
                  {selectedStudentModal.whatsappNumber && (
                    <a 
                      href={`https://wa.me/88${selectedStudentModal.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition"
                    >
                      <MessageSquare size={12} />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Monthly Fee Summary */}
              <div className="flex items-center justify-between p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/50 dark:border-amber-800/40">
                <div>
                  <span className="text-amber-800 dark:text-amber-300 font-bold block">ধার্যকৃত মাসিক বেতনে মোট:</span>
                  <span className="text-gray-500 text-[11px]">টিউশন: ৳{selectedStudentModal.monthlyTuitionFee} • বোর্ডিং: ৳{selectedStudentModal.boardingFee}</span>
                </div>
                <span className="text-base font-black text-amber-700 dark:text-amber-400 font-mono">
                  ৳{calculateStudentFees(selectedStudentModal).total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between gap-3">
              <Link
                href={`/students/${selectedStudentModal.id}`}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-800 dark:text-gray-100 rounded-xl font-bold text-center transition"
              >
                পূর্ণাঙ্গ প্রোফাইল
              </Link>
              <Link
                href={`/finance-fees?studentId=${encodeURIComponent(selectedStudentModal.studentId)}&action=collect`}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-center transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Coins size={14} className="text-amber-300" />
                <span>ফি আদায় করুন</span>
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
