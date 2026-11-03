'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { 
  Calendar, Book, FileText, Award, Bell, Clock, Search, 
  Printer, Send, CheckCircle, User, BookOpen, Plus, X,
  Save, CheckCircle2, Trophy, BarChart3, Edit3, Sparkles, Filter
} from 'lucide-react';
import OfficialWatermark from '@/components/OfficialWatermark';
import { UNIFIED_QAWMI_JAMATS, matchesUnifiedJamat } from '@/lib/qawmiJamats';

// ─── TYPES & INTERFACES ───

interface SubjectMark {
  name: string;
  marks: number;
  total: number;
}

interface StudentResult {
  roll: string;
  studentId?: string;
  name: string;
  department: string;
  className: string;
  subjects: SubjectMark[];
}

interface RoutineItem {
  id: string;
  day: string;
  period: string;
  time: string;
  className: string;
  bookName: string;
  teacherName: string;
}

const STORAGE_MARKS_KEY = 'taleem_exam_marks_data';

// Standard Qawmi Jamat Subjects Map
const JAMAT_SUBJECTS_MAP: Record<string, string[]> = {
  'নূরানী': ['কুরআন মজিদ ও মাখরাজ', 'বাংলা ও ব্যাকরণ', 'ইংরেজি ও গণিত', 'আমপারা ও নাজেরা'],
  'নাজেরা': ['নাজেরা কুরআন মজিদ', 'তাজবীদ ও মাখরাজ', 'মাসায়েলে নামাজ', 'উর্দু ও ফার্সি'],
  'হিফজ': ['হিফজুল কুরআন (সবক)', 'হিফজুল কুরআন (সবকি)', 'আমপারা ও মঞ্জিল', 'তাজবীদ ও আদাব'],
  'তাইসীর': ['তাইসীরুল মুবতাদী', 'কালেমা ও আকাইদ', 'ফার্সি কারীমা', 'এসো আরবি শিখি'],
  'মিজান': ['মিজানুস সরফ', 'মুন্শাইব', 'ইনশায়ে আরবি', 'আদাবু তাআল্লুম'],
  'নাহবেমীর': ['নাহবেমীর শরীফ', 'পঞ্জেগঞ্জ (সরফ)', 'তারকীব ও তারজুমা', 'সীরাতুন নবী (সা.)'],
  'হেদায়াতুন্নাহু': ['হেদায়াতুন্নাহু', 'শরহে তাহযীব (মাকূলিল)', 'শরহে মিয়াতে আমিল', 'ইনশা ও বালাগাত'],
  'কাফিয়া': ['কাফিয়াতুল মুকাদ্দিমা', 'নূরুল আনওয়ার (উসূল)', 'মাকামাতে হারিরি', 'শরহে মিয়াতে আমিল'],
  'শরহে জামী': ['শরহে জামী (নাহব)', 'নূরুল আনওয়ার', 'কুদুরী শরীফ (ফিকহ)', 'শরহে তাহযীব'],
  'শরহে বেকায়া': ['শরহে বেকায়া (১ম খণ্ড)', 'শরহে বেকায়া (২য় খণ্ড)', 'উসূলে শাশী', 'মাকামাত (সাহিত্য)'],
  'জালালাইন': ['তাফসীরে জালালাইন (১ম খণ্ড)', 'তাফসীরে জালালাইন (২য় খণ্ড)', 'আল-ফাওযুল কাবীর', 'হিসামে (উসূল)'],
  'মেশকাত': ['মিশকাতুল মাসাবীহ (১ম খণ্ড)', 'মিশকাতুল মাসাবীহ (২য় খণ্ড)', 'শরহে বেকায়া', 'সিরাজি (ফারায়েয)'],
  'দাওরায়ে হাদিস / তাকমীল': ['বুখারী শরীফ (১ম খণ্ড)', 'বুখারী শরীফ (২য় খণ্ড)', 'মুসলিম শরীফ', 'তিরমিজী শরীফ', 'আবু দাউদ শরীফ'],
  'ইফতা': ['শরহে উসূলে ইফতা', 'ফাতাওয়া শামী (রদ্দুল মুহতার)', 'আল-আশবাহ ওয়ান নাযাইর', 'কুদুরী শরীফ'],
  'অন্যান্য / আদার্স': ['বিষয়-১ (মৌলিক)', 'বিষয়-২ (উচ্চতর)', 'বিষয়-৩ (সাহিত্য)', 'বিষয়-৪ (ফিকহ)'],
};

export default function TalimatPage() {
  const { instituteSettings, students: centralStudents } = useApp();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.bn;

  // Sub-tab Navigation
  const [activeTab, setActiveTab] = useState<'results' | 'marks-entry' | 'tabulation' | 'routine'>('results');

  // Common Exam Filters
  const examTerms = useMemo(() => [
    t.talimat_term_annual || 'বার্ষিক পরীক্ষা',
    t.talimat_term_half || 'ষাণ্মাসিক / মধ্যবর্তী পরীক্ষা',
    t.talimat_term_first || '১ম টিউটোরিয়াল পরীক্ষা',
  ], [t]);

  const [selectedTerm, setSelectedTerm] = useState(examTerms[0]);
  const [selectedJamat, setSelectedJamat] = useState<string>('মিজান');
  const [searchRoll, setSearchRoll] = useState('১০১');
  const [smsSent, setSmsSent] = useState(false);
  const [reminderActive, setReminderActive] = useState(true);

  // ─── LOCAL STORAGE PERSISTENT MARKS STATE ───
  // Key format: `{jamat}_{term}_{studentId/roll}` -> Record<subjectName, marks>
  const [marksData, setMarksData] = useState<Record<string, Record<string, number>>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(STORAGE_MARKS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const saveMarksToStorage = (updated: Record<string, Record<string, number>>) => {
    setMarksData(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_MARKS_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save exam marks:', err);
      }
    }
  };

  // Qawmi Grading Formula
  const getQawmiGrade = (percentage: number) => {
    if (percentage >= 80) return { grade: t.grade_mumtaz || 'মুমতাজ (এ+)', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
    if (percentage >= 65) return { grade: t.grade_jayyid_jiddan || 'জায়্যিদ জিদ্দান (এ)', color: 'text-blue-700 bg-blue-100 border-blue-300' };
    if (percentage >= 50) return { grade: t.grade_jayyid || 'জায়্যিদ (বি)', color: 'text-cyan-700 bg-cyan-100 border-cyan-300' };
    if (percentage >= 40) return { grade: t.grade_maqbool || 'মাকবুল (সি)', color: 'text-amber-700 bg-amber-100 border-amber-300' };
    return { grade: t.grade_rasib || 'রাসিব (অকৃতকার্য)', color: 'text-red-700 bg-red-100 border-red-300' };
  };

  // Helper to get standard subjects for a Jamat
  const getSubjectsForJamat = (jamatName: string): string[] => {
    for (const [key, list] of Object.entries(JAMAT_SUBJECTS_MAP)) {
      if (jamatName.includes(key) || key.includes(jamatName)) return list;
    }
    return JAMAT_SUBJECTS_MAP['অন্যান্য / আদার্স'];
  };

  // ─── MARKS ENTRY FORM STATE ───
  const [selectedEntrySubject, setSelectedEntrySubject] = useState<string>('');
  const [entryDraftMarks, setEntryDraftMarks] = useState<Record<string, number>>({});
  const [marksSavedNotice, setMarksSavedNotice] = useState(false);

  // Sync available subjects when Jamat changes
  const activeJamatSubjects = useMemo(() => {
    return getSubjectsForJamat(selectedJamat);
  }, [selectedJamat]);

  useEffect(() => {
    if (activeJamatSubjects.length > 0 && !activeJamatSubjects.includes(selectedEntrySubject)) {
      setSelectedEntrySubject(activeJamatSubjects[0]);
    }
  }, [activeJamatSubjects, selectedEntrySubject]);

  // Load existing saved draft marks for selected Jamat + Subject + Term
  const jamatStudents = useMemo(() => {
    if (!centralStudents || centralStudents.length === 0) return [];
    return centralStudents.filter(s => s.class === selectedJamat || matchesUnifiedJamat(s.class, s.class, selectedJamat));
  }, [centralStudents, selectedJamat]);

  useEffect(() => {
    if (!selectedEntrySubject || !selectedJamat) return;
    const initialDraft: Record<string, number> = {};
    jamatStudents.forEach(st => {
      const key = `${selectedJamat}_${selectedTerm}_${st.id}`;
      const savedForStudent = marksData[key];
      if (savedForStudent && savedForStudent[selectedEntrySubject] !== undefined) {
        initialDraft[st.id] = savedForStudent[selectedEntrySubject];
      } else {
        // Default realistic mock marks
        initialDraft[st.id] = 85;
      }
    });
    setEntryDraftMarks(initialDraft);
  }, [selectedEntrySubject, selectedJamat, selectedTerm, jamatStudents, marksData]);

  const handleSaveSubjectMarks = () => {
    const updated = { ...marksData };
    jamatStudents.forEach(st => {
      const key = `${selectedJamat}_${selectedTerm}_${st.id}`;
      if (!updated[key]) updated[key] = {};
      updated[key][selectedEntrySubject] = entryDraftMarks[st.id] ?? 80;
    });
    saveMarksToStorage(updated);
    setMarksSavedNotice(true);
    setTimeout(() => setMarksSavedNotice(false), 3000);
  };

  // ─── TABULATION & MERIT RANKING GENERATOR ───
  const tabulationRows = useMemo(() => {
    const subjects = activeJamatSubjects;
    const rows = jamatStudents.map((st) => {
      const key = `${selectedJamat}_${selectedTerm}_${st.id}`;
      const studentSavedMarks = marksData[key] || {};

      let total = 0;
      const subMarks = subjects.map(subName => {
        const score = studentSavedMarks[subName] !== undefined ? studentSavedMarks[subName] : (st.roll === '১০১' ? 92 : 82);
        total += score;
        return { name: subName, marks: score, total: 100 };
      });

      const maxPossible = subjects.length * 100;
      const percentage = maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0;
      const gradeInfo = getQawmiGrade(percentage);

      return {
        id: st.id,
        roll: st.roll,
        name: st.nameBn || st.nameEn || 'শিক্ষার্থী',
        studentId: st.studentId,
        subjects: subMarks,
        totalMarks: total,
        maxMarks: maxPossible,
        percentage,
        grade: gradeInfo.grade,
        gradeColor: gradeInfo.color,
      };
    });

    // Sort descending by totalMarks to derive 1st, 2nd, 3rd position
    rows.sort((a, b) => b.totalMarks - a.totalMarks);

    const positionLabels = ['১ম স্থান (মুমতাজ)', '২য় স্থান', '৩য় স্থান'];
    return rows.map((r, idx) => ({
      ...r,
      meritRank: idx + 1,
      meritBadge: idx < 3 ? positionLabels[idx] : `${idx + 1}তম`,
    }));
  }, [jamatStudents, activeJamatSubjects, selectedJamat, selectedTerm, marksData]);

  // ─── SINGLE STUDENT MARKSHEET LOOKUP ───
  const currentStudent = useMemo<StudentResult>(() => {
    const matched = centralStudents.find(
      s => s.roll === searchRoll || s.studentId === searchRoll || s.id === searchRoll
    );

    if (matched) {
      const jamatName = matched.class || 'মিজান';
      const subjects = getSubjectsForJamat(jamatName);
      const key = `${jamatName}_${selectedTerm}_${matched.id}`;
      const savedForStudent = marksData[key] || {};

      const subMarks = subjects.map((subName, i) => ({
        name: subName,
        marks: savedForStudent[subName] !== undefined ? savedForStudent[subName] : (i % 2 === 0 ? 92 : 86),
        total: 100,
      }));

      return {
        roll: matched.roll || searchRoll,
        studentId: matched.studentId,
        name: matched.nameBn || matched.nameEn || 'শিক্ষার্থী',
        department: matched.department || 'কিতাব বিভাগ',
        className: jamatName,
        subjects: subMarks,
      };
    }

    // Default Fallback Student (আব্দুল্লাহ আল মাহমুদ roll 101)
    return {
      roll: '১০১',
      studentId: '2026-MZN-101',
      name: 'আব্দুল্লাহ আল মাহমুদ',
      department: 'কিতাব বিভাগ',
      className: 'মেশকাত জামাত (ফযীলত)',
      subjects: [
        { name: 'মিশকাতুল মাসাবীহ (১ম খণ্ড)', marks: 95, total: 100 },
        { name: 'শরহে বেকায়া (২য় খণ্ড)', marks: 88, total: 100 },
        { name: 'জালালাইন শরীফ', marks: 92, total: 100 },
        { name: 'মাকামাতে হারিরি (আরবি সাহিত্য)', marks: 84, total: 100 },
        { name: 'সিরাজি (ফারায়েয)', marks: 90, total: 100 },
      ],
    };
  }, [searchRoll, centralStudents, selectedTerm, marksData]);

  const studentTotalMarks = useMemo(() => {
    return currentStudent.subjects.reduce((acc, curr) => acc + curr.marks, 0);
  }, [currentStudent]);

  const studentMaxMarks = useMemo(() => {
    return currentStudent.subjects.reduce((acc, curr) => acc + curr.total, 0);
  }, [currentStudent]);

  const studentPercentage = useMemo(() => {
    return studentMaxMarks > 0 ? Math.round((studentTotalMarks / studentMaxMarks) * 100) : 0;
  }, [studentTotalMarks, studentMaxMarks]);

  const currentGradeInfo = useMemo(() => {
    return getQawmiGrade(studentPercentage);
  }, [studentPercentage]);

  // ─── ROUTINE MANAGEMENT STATE ───
  const [routineClassFilter, setRoutineClassFilter] = useState<string>('all');
  const [showAddRoutineModal, setShowAddRoutineModal] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    day: 'শনিবার',
    period: '১ম ঘণ্টা',
    time: 'সকাল ০৮:০০ - ০৮:৪৫',
    className: 'নূরানী',
    bookName: '',
    teacherName: ''
  });

  const [routines, setRoutines] = useState<RoutineItem[]>([
    { id: '1', day: 'শনিবার', period: '১ম ঘণ্টা', time: 'সকাল ০৮:০০ - ০৮:৪৫', className: 'দাওরায়ে হাদিস / তাকমীল', bookName: 'বুখারী শরীফ (১ম খণ্ড)', teacherName: 'মাওলানা মুফতি আব্দুর রাজ্জাক' },
    { id: '2', day: 'শনিবার', period: '২য় ঘণ্টা', time: 'সকাল ০৮:৪৫ - ০৯:৩০', className: 'মেশকাত', bookName: 'শরহে বেকায়া', teacherName: 'মাওলানা নোমান হাবিব' },
    { id: '3', day: 'শনিবার', period: '৩য় ঘণ্টা', time: 'সকাল ০৯:৪৫ - ১০:৩০', className: 'জালালাইন', bookName: 'তাফসীরে জালালাইন', teacherName: 'মাওলানা মাহমুদ হাসান' },
    { id: '4', day: 'রবিবার', period: '১ম ঘণ্টা', time: 'সকাল ০৮:০০ - ০৮:৪৫', className: 'হেদায়াতুন্নাহু', bookName: 'হেদায়াতুন্নাহু (১ম খণ্ড)', teacherName: 'মাওলানা মুফতি আব্দুর রাজ্জাক' },
    { id: '5', day: 'রবিবার', period: '২য় ঘণ্টা', time: 'সকাল ০৮:৪৫ - ০৯:৩০', className: 'কাফিয়া', bookName: 'কাফিয়া ও ইলমুন নাহু', teacherName: 'মাওলানা সাইফুল্লাহ' },
  ]);

  const filteredRoutines = useMemo(() => {
    return routines.filter((item) => {
      if (routineClassFilter === 'all') return true;
      return matchesUnifiedJamat(item.className, item.bookName, routineClassFilter);
    });
  }, [routines, routineClassFilter]);

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutine.bookName.trim() || !newRoutine.teacherName.trim()) return;
    const item: RoutineItem = {
      id: `rt-${Date.now()}`,
      ...newRoutine
    };
    setRoutines([item, ...routines]);
    setShowAddRoutineModal(false);
    setNewRoutine({ day: 'শনিবার', period: '১ম ঘণ্টা', time: 'সকাল ০৮:০০ - ০৮:৪৫', className: 'নূরানী', bookName: '', teacherName: '' });
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* HEADER TOOLBAR */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="text-emerald-600" />
            {t.talimat_title || "তালীমাত ও পরীক্ষা ড্যাশবোর্ড"}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t.talimat_subtitle || "অফিসিয়াল নম্বরপত্র, মেধা তালিকা, মার্কস এন্ট্রি ও রুটিন ব্যবস্থাপনা"}
          </p>
        </div>

        {/* SUB-TAB NAV BUTTONS */}
        <div className="flex bg-gray-100 dark:bg-slate-700/60 p-1.5 rounded-xl flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('results')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'results' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
            }`}
          >
            <Award size={15} />
            নম্বরপত্র / মার্কশিট
          </button>
          <button
            onClick={() => setActiveTab('marks-entry')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'marks-entry' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
            }`}
          >
            <Edit3 size={15} />
            মার্কস এন্ট্রি
          </button>
          <button
            onClick={() => setActiveTab('tabulation')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'tabulation' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
            }`}
          >
            <BarChart3 size={15} />
            মেধা তালিকা ও টেবুলেশন
          </button>
          <button
            onClick={() => setActiveTab('routine')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'routine' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
            }`}
          >
            <Calendar size={15} />
            ক্লাস ও পরীক্ষা রুটিন
          </button>
        </div>
      </div>

      {/* ─── TAB 1: MARKSHEET / RESULT CARD VIEW ─── */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* SEARCH & TERM SELECTOR */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xs border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <form onSubmit={(e) => { e.preventDefault(); }} className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  value={searchRoll} 
                  onChange={(e) => setSearchRoll(e.target.value)}
                  placeholder="রোল বা আইডি নম্বর..." 
                  className="w-full pl-9 pr-4 py-2 border rounded-xl bg-gray-50 dark:bg-slate-700 dark:border-slate-600 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button 
                type="button" 
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
              >
                খুঁজুন
              </button>
            </form>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <select 
                value={selectedTerm} 
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="p-2 border rounded-xl bg-white dark:bg-slate-700 text-xs font-bold text-gray-800 dark:text-white outline-none"
              >
                {examTerms.map(term => <option key={term} value={term}>{term}</option>)}
              </select>

              <button 
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-slate-800 text-white dark:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-900 transition"
              >
                <Printer size={15} />
                প্রিন্ট করুন
              </button>
            </div>
          </div>

          {/* OFFICIAL MARKSHEET CARD */}
          <div id="printable-marksheet" className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 relative overflow-hidden">
            <OfficialWatermark />

            {/* MARKSHEET HEADER */}
            <div className="text-center border-b pb-6 border-gray-200 dark:border-slate-700 relative z-10">
              <h2 className="text-2xl md:text-3xl font-black text-emerald-800 dark:text-emerald-400 font-serif">
                {instituteSettings.name || "জামিয়া আরাবিয়া ইমদাদুল উলুম ফরিদাবাদ মাদ্রাসা, ঢাকা"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {instituteSettings.address || "ফরিদাবাদ, গেন্ডারিয়া, ঢাকা-১২০৪"} — তালীমাত ও পরীক্ষা নিয়ন্ত্রণ বিভাগ
              </p>
              
              <div className="inline-block mt-3 px-6 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold text-sm rounded-full">
                অফিসিয়াল নম্বরপত্র (Marksheet) — {selectedTerm}
              </div>
            </div>

            {/* STUDENT INFO MATRIX */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 text-xs relative z-10 border-b dark:border-slate-700">
              <div>
                <span className="text-gray-400 block font-medium">শিক্ষার্থীর নাম:</span>
                <strong className="text-sm text-gray-900 dark:text-white font-bold">{currentStudent.name}</strong>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">রোল নম্বর:</span>
                <strong className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold">{currentStudent.roll}</strong>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">জামাত / শ্রেণি:</span>
                <strong className="text-sm text-gray-900 dark:text-white font-bold">{currentStudent.className}</strong>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">বিভাগ:</span>
                <strong className="text-sm text-gray-900 dark:text-white font-bold">{currentStudent.department}</strong>
              </div>
            </div>

            {/* SUBJECT MARKS TABLE */}
            <div className="py-6 relative z-10">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-50 dark:bg-slate-700/80 font-bold text-gray-700 dark:text-gray-200 border-b">
                    <th className="p-3">ক্রম</th>
                    <th className="p-3">বিষয় / কিতাবের নাম</th>
                    <th className="p-3 text-center">পূর্ণমান</th>
                    <th className="p-3 text-center">প্রাপ্ত নম্বর</th>
                    <th className="p-3 text-right">গ্রেড / মূল্যায়ন</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-700">
                  {currentStudent.subjects.map((sub, idx) => {
                    const perc = (sub.marks / sub.total) * 100;
                    const subGrade = getQawmiGrade(perc);
                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                        <td className="p-3 font-mono text-gray-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-gray-900 dark:text-white">{sub.name}</td>
                        <td className="p-3 text-center font-mono">{sub.total}</td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">{sub.marks}</td>
                        <td className="p-3 text-right font-bold">
                          <span className={`px-2 py-0.5 rounded text-[11px] ${subGrade.color}`}>
                            {subGrade.grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MARKSHEET SUMMARY FOOTER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-gray-200 dark:border-slate-700 relative z-10">
              <div className="text-center md:text-left">
                <span className="text-xs text-gray-500 dark:text-gray-400 block">মোট প্রাপ্ত নম্বর:</span>
                <span className="text-xl font-black text-gray-900 dark:text-white font-mono">{studentTotalMarks} / {studentMaxMarks}</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 block">প্রাপ্ত শতকরা (Percentage):</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{studentPercentage}%</span>
              </div>
              <div className="text-center md:text-right">
                <span className="text-xs text-gray-500 dark:text-gray-400 block">সর্বমোট ফলাফল (Final Qawmi Grade):</span>
                <span className={`inline-block mt-1 px-3 py-1 text-xs font-black rounded-lg border ${currentGradeInfo.color}`}>
                  {currentGradeInfo.grade}
                </span>
              </div>
            </div>

            {/* SIGNATURE SECTION */}
            <div className="flex justify-between items-end pt-12 mt-6 border-t dark:border-slate-700 relative z-10 text-xs">
              <div className="text-center">
                <div className="border-t border-gray-400 w-36 pt-1 font-bold">নাযেমে তালীমাত (পরীক্ষা নিয়ন্ত্রক)</div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 w-36 pt-1 font-bold">মুহতামিম / প্রধান অভিভাবক</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: MARKS ENTRY (বিষয়ভিত্তিক নম্বর এন্ট্রি) ─── */}
      {activeTab === 'marks-entry' && (
        <div className="space-y-6">
          {/* MARKS ENTRY TOOLBAR */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-700 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="text-emerald-600" size={18} />
                  বিষয়ভিত্তিক মার্কস ইনপুট এন্ট্রি
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  জামাত ও বিষয় নির্বাচন করে সকল শিক্ষার্থীর প্রাপ্ত নম্বর একসাথে ইনপুট দিন
                </p>
              </div>

              {marksSavedNotice && (
                <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold animate-pulse">
                  <CheckCircle2 size={16} />
                  আলহামদুলিল্লাহ, নম্বরসমূহ সফলভাবে সংরক্ষিত হয়েছে!
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t dark:border-slate-700">
              {/* 1. Jamat Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">১. জামাত নির্বাচন করুন:</label>
                <select
                  value={selectedJamat}
                  onChange={(e) => setSelectedJamat(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-700 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {UNIFIED_QAWMI_JAMATS.map(j => <option key={j.id} value={j.value}>{j.nameBn}</option>)}
                </select>
              </div>

              {/* 2. Term Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">২. পরীক্ষার টার্ম:</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-700 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {examTerms.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* 3. Subject Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">৩. বিষয় / কিতাব নির্বাচন:</label>
                <select
                  value={selectedEntrySubject}
                  onChange={(e) => setSelectedEntrySubject(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-700 text-xs font-bold text-emerald-600 dark:text-emerald-400 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {activeJamatSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* MARKS ENTRY TABLE */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/60 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                জামাত: <span className="text-emerald-600">{selectedJamat}</span> | বিষয়: <span className="text-emerald-600">{selectedEntrySubject}</span> (মোট শিক্ষার্থী: {jamatStudents.length} জন)
              </span>
              <button
                onClick={handleSaveSubjectMarks}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs transition"
              >
                <Save size={15} />
                সকলের মার্কস সংরক্ষণ করুন
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-700 font-bold text-gray-700 dark:text-gray-200 border-b">
                    <th className="p-3">রোল</th>
                    <th className="p-3">শিক্ষার্থীর নাম</th>
                    <th className="p-3">আইডি</th>
                    <th className="p-3 text-center">পূর্ণমান</th>
                    <th className="p-3 text-center">প্রাপ্ত নম্বর (১০০ এর মধ্যে)</th>
                    <th className="p-3 text-right">আনুপাতিক গ্রেড</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-700">
                  {jamatStudents.length > 0 ? (
                    jamatStudents.map((st) => {
                      const currentVal = entryDraftMarks[st.id] !== undefined ? entryDraftMarks[st.id] : 85;
                      const grade = getQawmiGrade(currentVal);
                      return (
                        <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                          <td className="p-3 font-bold font-mono text-emerald-600">{st.roll}</td>
                          <td className="p-3 font-bold text-gray-900 dark:text-white">{st.nameBn || st.nameEn}</td>
                          <td className="p-3 font-mono text-gray-400">{st.studentId}</td>
                          <td className="p-3 text-center font-mono">১০০</td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={currentVal}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setEntryDraftMarks(prev => ({ ...prev, [st.id]: val }));
                              }}
                              className="w-24 text-center p-1.5 border rounded-lg bg-white dark:bg-slate-700 font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${grade.color}`}>
                              {grade.grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400 text-xs">
                        {selectedJamat} জামাতে কোনো শিক্ষার্থী পাওয়া যায়নি। ভর্তি ফর্ম থেকে নতুন শিক্ষার্থী যোগ করুন।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: TABULATION SHEET & MERIT LIST ─── */}
      {activeTab === 'tabulation' && (
        <div className="space-y-6">
          {/* TABULATION HEADER FILTER */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="text-emerald-600" size={18} />
                জামাতভিত্তিক টেবুলেশন শিট ও মেধা তালিকা
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                সকল বিষয়ে প্রাপ্ত নম্বরের ভিত্তিতে স্বয়ংক্রিয় মেধাক্রম (১ম, ২য়, ৩য়) ও মেধা তালিকা
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedJamat}
                onChange={(e) => setSelectedJamat(e.target.value)}
                className="p-2 border rounded-xl bg-white dark:bg-slate-700 text-xs font-bold text-gray-900 dark:text-white outline-none"
              >
                {UNIFIED_QAWMI_JAMATS.map(j => <option key={j.id} value={j.value}>{j.nameBn}</option>)}
              </select>

              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="p-2 border rounded-xl bg-white dark:bg-slate-700 text-xs font-bold text-gray-900 dark:text-white outline-none"
              >
                {examTerms.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-900 transition"
              >
                <Printer size={15} />
                প্রিন্ট
              </button>
            </div>
          </div>

          {/* TABULATION MATRIX TABLE */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-700 text-white font-bold border-b">
                    <th className="p-3 text-center">মেধাক্রম</th>
                    <th className="p-3">রোল</th>
                    <th className="p-3">শিক্ষার্থীর নাম</th>
                    {activeJamatSubjects.map((sub, idx) => (
                      <th key={idx} className="p-3 text-center">{sub}</th>
                    ))}
                    <th className="p-3 text-center bg-emerald-800">মোট মার্কস</th>
                    <th className="p-3 text-center bg-emerald-800">শতকরা</th>
                    <th className="p-3 text-right bg-emerald-900">চুড়ান্ত গ্রেড</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-700">
                  {tabulationRows.length > 0 ? (
                    tabulationRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                        <td className="p-3 text-center font-bold">
                          {row.meritRank <= 3 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                              <Trophy size={13} className="text-amber-600" />
                              {row.meritBadge}
                            </span>
                          ) : (
                            <span className="font-mono text-gray-500">{row.meritRank}তম</span>
                          )}
                        </td>
                        <td className="p-3 font-bold font-mono text-emerald-600">{row.roll}</td>
                        <td className="p-3 font-bold text-gray-900 dark:text-white">{row.name}</td>
                        {row.subjects.map((sub, i) => (
                          <td key={i} className="p-3 text-center font-mono font-bold text-gray-700 dark:text-gray-300">
                            {sub.marks}
                          </td>
                        ))}
                        <td className="p-3 text-center font-mono font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                          {row.totalMarks} / {row.maxMarks}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-gray-900 dark:text-white">
                          {row.percentage}%
                        </td>
                        <td className="p-3 text-right font-bold">
                          <span className={`px-2.5 py-0.5 rounded text-[11px] ${row.gradeColor}`}>
                            {row.grade}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={activeJamatSubjects.length + 6} className="p-8 text-center text-gray-400 text-xs">
                        {selectedJamat} জামাতে কোনো মার্কস পাওয়া যায়নি। মার্কস এন্ট্রি ট্যাব থেকে নম্বর প্রদান করুন।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: CLASS & EXAM ROUTINE ─── */}
      {activeTab === 'routine' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="text-emerald-600" size={18} />
                ক্লাস ও পরীক্ষা রুটিন
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                জামাতভিত্তিক দৈনন্দিন পিরিয়ড, সময়সূচি ও শিক্ষক বণ্টন
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={routineClassFilter}
                onChange={(e) => setRoutineClassFilter(e.target.value)}
                className="p-2 border rounded-xl bg-white dark:bg-slate-700 text-xs font-bold text-gray-800 dark:text-white outline-none"
              >
                <option value="all">সকল জামাত</option>
                {UNIFIED_QAWMI_JAMATS.map(j => <option key={j.id} value={j.value}>{j.nameBn}</option>)}
              </select>

              <button
                onClick={() => setShowAddRoutineModal(true)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Plus size={16} />
                নতুন রুটিন যোগ করুন
              </button>
            </div>
          </div>

          {/* ROUTINE TABLE */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-700 font-bold text-gray-700 dark:text-gray-200 border-b">
                    <th className="p-3">দিন (Day)</th>
                    <th className="p-3">ঘণ্টা / পিরিয়ড</th>
                    <th className="p-3">সময়সূচি</th>
                    <th className="p-3">জামাত</th>
                    <th className="p-3">কিতাব / বিষয়</th>
                    <th className="p-3">উস্তাদ / শিক্ষক</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-700">
                  {filteredRoutines.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                      <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">{r.day}</td>
                      <td className="p-3 font-bold">{r.period}</td>
                      <td className="p-3 font-mono text-gray-500">{r.time}</td>
                      <td className="p-3 font-bold text-gray-900 dark:text-white">{r.className}</td>
                      <td className="p-3 font-bold text-emerald-600">{r.bookName}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">{r.teacherName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD ROUTINE MODAL ─── */}
      {showAddRoutineModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex justify-between items-center pb-4 border-b dark:border-slate-700 mb-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" />
                নতুন পিরিয়ড / রুটিন যোগ করুন
              </h3>
              <button onClick={() => setShowAddRoutineModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRoutine} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">বার / দিন:</label>
                <select
                  value={newRoutine.day}
                  onChange={(e) => setNewRoutine({ ...newRoutine, day: e.target.value })}
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-700 font-bold outline-none"
                >
                  <option value="শনিবার">শনিবার</option>
                  <option value="রবিবার">রবিবার</option>
                  <option value="সোমবার">সোমবার</option>
                  <option value="মঙ্গলবার">মঙ্গলবার</option>
                  <option value="বুধবার">বুধবার</option>
                  <option value="বৃহস্পতিবার">বৃহস্পতিবার</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">পিরিয়ড / ঘণ্টা:</label>
                <input
                  type="text"
                  value={newRoutine.period}
                  onChange={(e) => setNewRoutine({ ...newRoutine, period: e.target.value })}
                  placeholder="যেমন: ১ম ঘণ্টা"
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-700 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">সময়সূচি:</label>
                <input
                  type="text"
                  value={newRoutine.time}
                  onChange={(e) => setNewRoutine({ ...newRoutine, time: e.target.value })}
                  placeholder="যেমন: সকাল ০৮:০০ - ০৮:৪৫"
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-700 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">জামাত:</label>
                <select
                  value={newRoutine.className}
                  onChange={(e) => setNewRoutine({ ...newRoutine, className: e.target.value })}
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-700 font-bold outline-none"
                >
                  {UNIFIED_QAWMI_JAMATS.map(j => <option key={j.id} value={j.value}>{j.nameBn}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">কিতাব / বিষয়:</label>
                <input
                  type="text"
                  value={newRoutine.bookName}
                  onChange={(e) => setNewRoutine({ ...newRoutine, bookName: e.target.value })}
                  placeholder="যেমন: বুখারী শরীফ"
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-700 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">উস্তাদ / শিক্ষকের নাম:</label>
                <input
                  type="text"
                  value={newRoutine.teacherName}
                  onChange={(e) => setNewRoutine({ ...newRoutine, teacherName: e.target.value })}
                  placeholder="যেমন: মাওলানা মুফতি আব্দুর রাজ্জাক"
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-700 outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoutineModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
