'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/lib/context';
import { translations } from '@/lib/translations';
import { 
  Wallet, Landmark, Receipt, Bell, Printer, ArrowDownRight, 
  ArrowUpRight, Plus, FileText, Filter, Search, BookOpen, 
  CheckCircle2, XCircle, ChevronDown, Download, RefreshCw, X,
  BarChart3, Calendar, Sparkles, TrendingUp, TrendingDown,
  Coins, Zap, Utensils, GraduationCap, Flame, Wrench, Check
} from 'lucide-react';
import OfficialWatermark from '@/components/OfficialWatermark';
import { Student, INITIAL_STUDENTS, calculateStudentFees } from '@/lib/studentsData';
import { UNIFIED_QAWMI_JAMATS, JAMAT_FILTER_OPTIONS, matchesUnifiedJamat } from '@/lib/qawmiJamats';
import { getFeeForJamat } from '@/lib/feeStructure';

const QAWMI_JAMATS = JAMAT_FILTER_OPTIONS;

interface Transaction {
  id: string;
  date: string;
  voucherNo: string;
  category: 'মাসিক বেতন' | 'ভর্তি ফি' | 'লিল্লাহ/যাকাত' | 'দান/সদকা' | 'শিক্ষক বেতন' | 'মেস বাজার' | 'বিদ্যুৎ ও ইউটিলিটি' | 'অন্যান্য';
  ledger: 'general' | 'zakat';
  type: 'income' | 'expense';
  description: string;
  amount: number;
  jamat?: string;
  studentName?: string;
  roll?: string;
}

interface StudentDue {
  id: string;
  name: string;
  roll: string;
  jamat: string;
  due: string;
  dueAmount: number;
  months: string;
  phone: string;
}

export default function FinanceFeesPage() {
  const { language, isRtl } = useLanguage();
  const { instituteSettings, students } = useApp();
  const t = translations[language as keyof typeof translations] || translations.bn;

  // Active Tab & Month
  const [activeTab, setActiveTab] = useState<'summary' | 'cashbook' | 'statement' | 'collection'>('summary');
  const [selectedMonth, setSelectedMonth] = useState('সেপ্টেম্বর ২০২৬');
  
  // ─── Unified Filters State ───
  const [filterLedger, setFilterLedger] = useState<'all' | 'general' | 'zakat'>('all');
  const [selectedJamat, setSelectedJamat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Transactions State (Cashbook) with authentic Qawmi Jamat tagged vouchers
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', date: '২০২৬-০৯-২২', voucherNo: 'INC-1001', category: 'মাসিক বেতন', ledger: 'general', type: 'income', jamat: 'মেশকাত', studentName: 'আব্দুল্লাহ আল মাহমুদ', roll: '১০১', description: 'মেশকাত জামাতের ছাত্রদের মাসিক বেতন সংগ্রহ', amount: 48000 },
    { id: '2', date: '২০২৬-০৯-২২', voucherNo: 'INC-1002', category: 'মাসিক বেতন', ledger: 'general', type: 'income', jamat: 'ইফতা', studentName: 'বুরহান উদ্দিন', roll: '১০২', description: 'ইফতা বিভাগ মাসিক ফি ও কিতাব বাবদ আদায়', amount: 36000 },
    { id: '3', date: '২০২৬-০৯-২১', voucherNo: 'INC-1003', category: 'মাসিক বেতন', ledger: 'general', type: 'income', jamat: 'দাওরায়ে হাদিস / তাকমীল', studentName: 'যুবায়ের বিন খালিদ', roll: '১০৩', description: 'দাওরায়ে হাদিস / তাকমীল জামাতের ফি সংগ্রহ', amount: 62000 },
    { id: '4', date: '২০২৬-০৯-২১', voucherNo: 'EXP-2001', category: 'মেস বাজার', ledger: 'zakat', type: 'expense', description: 'লিল্লাহ বোর্ডিং দৈনিক চাল, ডাল, তেল ও গোশত ক্রয় ভাউচার', amount: 18460 },
    { id: '5', date: '২০২৬-০৯-২০', voucherNo: 'INC-1004', category: 'মাসিক বেতন', ledger: 'general', type: 'income', jamat: 'শরহে জামী', studentName: 'তৌহিদুল ইসলাম', roll: '১০৬', description: 'শরহে জামী জামাত মাসিক বেতন আদায়', amount: 28000 },
    { id: '6', date: '২০২৬-০৯-২০', voucherNo: 'INC-1005', category: 'মাসিক বেতন', ledger: 'general', type: 'income', jamat: 'নাহবেমীর', studentName: 'লাবিব আহমেদ', roll: '১০৮', description: 'নাহবেমীর জামাতের ছাত্রদের ফি সংগ্রহ', amount: 32000 },
    { id: '7', date: '২০২৬-০৯-১৯', voucherNo: 'INC-1006', category: 'মাসিক বেতন', ledger: 'general', type: 'income', jamat: 'তাইসীর', studentName: 'মোস্তাফিজুর রহমান', roll: '১১০', description: 'তাইসীর জামাতের মাসিক বেতন জমা', amount: 24000 },
    { id: '8', date: '২০২৬-০৯-১৯', voucherNo: 'INC-1007', category: 'মাসিক বেতন', ledger: 'general', type: 'income', jamat: 'হেদায়াতুন্নাহু', studentName: 'শাফিউল আলম', roll: '১০৭', description: 'হেদায়াতুন্নাহু জামাতের বেতন সংগ্রহ', amount: 29500 },
    { id: '9', date: '২০২৬-০৯-১৮', voucherNo: 'INC-1008', category: 'মাসিক বেতন', ledger: 'general', type: 'income', jamat: 'কাফিয়া', studentName: 'আব্দুর রহমান', roll: '১০৫', description: 'কাফিয়া জামাত মাসিক বেতন বাবদ জমা', amount: 31000 },
    { id: '10', date: '২০২৬-০৯-১৮', voucherNo: 'INC-1009', category: 'মাসিক বেতন', ledger: 'general', type: 'income', jamat: 'শরহে বেকায়া', studentName: 'মাহমুদুল হাসান', roll: '১১২', description: 'শরহে বেকায়া জামাত মাসিক টিউশন ফি', amount: 34000 },
    { id: '11', date: '২০২৬-০৯-১৭', voucherNo: 'INC-1010', category: 'মাসিক বেতন', ledger: 'general', type: 'income', jamat: 'জালালাইন', studentName: 'সাদিকুর রহমান', roll: '১১১', description: 'জালালাইন জামাতের কিতাব ও টিউশন ফি', amount: 38000 },
    { id: '12', date: '২০২৬-০৯-১৭', voucherNo: 'INC-1011', category: 'মাসিক বেতন', ledger: 'general', type: 'income', jamat: 'মিজান', studentName: 'সালমান ফারসী', roll: '১০৯', description: 'মিজান জামাতের শিক্ষার্থীদের মাসিক ফি', amount: 26000 },
    { id: '13', date: '২০২৬-০৯-১৬', voucherNo: 'INC-1012', category: 'মাসিক বেতন', ledger: 'general', type: 'income', jamat: 'হিফজ', studentName: 'হুসাইন আহমেদ', roll: '১১২', description: 'হিফজ বিভাগ মাসিক খাবার ও হাফেজি ফি', amount: 45000 },
    { id: '14', date: '২০২৬-০৯-১৬', voucherNo: 'INC-1013', category: 'মাসিক বেতন', ledger: 'general', type: 'income', jamat: 'নাজেরা', studentName: 'রায়হান উদ্দিন', roll: '১১৩', description: 'নাজেরা বিভাগ মাসিক তালীম ফি', amount: 22000 },
    { id: '15', date: '২০২৬-০৯-১৫', voucherNo: 'INC-1014', category: 'মাসিক বেতন', ledger: 'general', type: 'income', jamat: 'নূরানী', studentName: 'ওমর ফারুক', roll: '১১৪', description: 'নূরানী শিশু বিভাগ মাসিক বেতন সংগ্রহ', amount: 27500 },
    { id: '16', date: '২০২৬-০৯-১৫', voucherNo: 'INC-1015', category: 'মাসিক বেতন', ledger: 'general', type: 'income', jamat: 'অন্যান্য বিশেষ বিভাগ', studentName: 'তানভীর হাসান', roll: '১১৫', description: 'আরবি ভাষা ও কিরাত বিশেষ বিভাগ ফি', amount: 18000 },
    { id: '17', date: '২০২৬-০৯-১৪', voucherNo: 'INC-1016', category: 'লিল্লাহ/যাকাত', ledger: 'zakat', type: 'income', description: 'লিল্লাহ বোর্ডিং ও এতিমখানার যাকাত ফান্ডে অনুদান', amount: 150000 },
    { id: '18', date: '২০২৬-০৯-১২', voucherNo: 'EXP-2002', category: 'শিক্ষক বেতন', ledger: 'general', type: 'expense', description: 'উস্তাদ ও খাদেমগণের মাসিক সম্মানী ভাতা', amount: 120000 },
    { id: '19', date: '২০২৬-০৯-১০', voucherNo: 'EXP-2003', category: 'বিদ্যুৎ ও ইউটিলিটি', ledger: 'general', type: 'expense', description: 'পল্লী বিদ্যুৎ সমিতির মাসিক বিদ্যুৎ বিল পরিশোধ', amount: 14500 },
    { id: '20', date: '২০২৬-০৯-০৫', voucherNo: 'INC-1017', category: 'ভর্তি ফি', ledger: 'general', type: 'income', jamat: 'মেশকাত', description: 'নতুন ছাত্র ভর্তি ফি ও কিতাব বাবদ জমা (মেশকাত)', amount: 35000 },
  ]);

  // Student Dues List dynamically generated from central students master database
  const studentDues: StudentDue[] = useMemo(() => {
    const list = students.length > 0 ? students : INITIAL_STUDENTS;
    return list.map((s, idx) => {
      const fees = calculateStudentFees(s);
      const dueAmt = s.dueAmount !== undefined ? s.dueAmount : fees.total;
      return {
        id: s.id || `due-${idx}`,
        name: s.nameBn || s.nameEn || 'শিক্ষার্থী',
        roll: s.roll || '—',
        jamat: s.class || 'নূরানী',
        due: `৳ ${dueAmt.toLocaleString()}`,
        dueAmount: dueAmt,
        months: s.dueMonths || '১ মাস',
        phone: s.primaryPhone || '01700000000',
      };
    });
  }, [students]);


  // ─── AUTHENTIC MONTHLY BREAKDOWN SUMMARY DATA ───
  const monthlySummary = useMemo(() => {
    return {
      month: selectedMonth,
      jamatCollections: [
        { jamat: 'নূরানী', amount: 15000, percentage: 5.2 },
        { jamat: 'নাজেরা', amount: 12000, percentage: 4.2 },
        { jamat: 'হিফজখানা', amount: 25000, percentage: 8.8 },
        { jamat: 'তাইসীর', amount: 14000, percentage: 4.9 },
        { jamat: 'মিজান', amount: 18000, percentage: 6.3 },
        { jamat: 'নাহবেমীর', amount: 20000, percentage: 7.0 },
        { jamat: 'কাফিয়া', amount: 16000, percentage: 5.6 },
        { jamat: 'শরহে বেকায়া', amount: 22000, percentage: 7.7 },
        { jamat: 'জালালাইন', amount: 24000, percentage: 8.4 },
        { jamat: 'মেশকাত', amount: 28000, percentage: 9.8 },
        { jamat: 'দাওরায়ে হাদিস', amount: 35000, percentage: 12.3 },
        { jamat: 'ইফতা', amount: 16000, percentage: 5.6 },
        { jamat: 'সাধারণ দান/অনুদান', amount: 40000, percentage: 14.0 },
      ],
      categoryExpenses: [
        { category: 'বিদ্যুৎ বিল / কারেন্ট বিল (Electricity Bill)', amount: 12500, note: 'পল্লী বিদ্যুৎ সেপ্টেম্বর বিল', icon: 'zap' },
        { category: 'মেস বাজার (চাল, ডাল, তেল, গোশত)', amount: 60000, note: 'ছাত্রদের মেস ও লিল্লাহ বোর্ডিং খাবার', icon: 'utensils' },
        { category: 'শিক্ষক ও স্টাফদের বেতন', amount: 80000, note: 'উস্তাদ ও খাদেমগণের মাসিক সম্মানী', icon: 'graduation-cap' },
        { category: 'গ্যাস ও জ্বালানি বিল', amount: 4000, note: 'মেস রান্নাঘর সিলিন্ডার গ্যাস', icon: 'flame' },
        { category: 'মেরামত ও সংস্কার', amount: 5000, note: 'পানির পাম্প ও মাদ্রাসা ভবন মেরামত', icon: 'wrench' },
      ]
    };
  }, [selectedMonth]);

  const totalMonthlyIncome = useMemo(() => {
    return monthlySummary.jamatCollections.reduce((sum, item) => sum + item.amount, 0);
  }, [monthlySummary]);

  const totalMonthlyExpense = useMemo(() => {
    return monthlySummary.categoryExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [monthlySummary]);

  const monthlyNetSurplus = useMemo(() => {
    return totalMonthlyIncome - totalMonthlyExpense;
  }, [totalMonthlyIncome, totalMonthlyExpense]);

  // New Transaction Form State
  const [formDate, setFormDate] = useState('2026-09-22');
  const [formType, setFormType] = useState<'income' | 'expense'>('income');
  const [formCategory, setFormCategory] = useState<Transaction['category']>('মাসিক বেতন');
  const [formLedger, setFormLedger] = useState<'general' | 'zakat'>('general');
  const [formJamat, setFormJamat] = useState<string>('মেশকাত');
  const [formDesc, setFormDesc] = useState('');
  const [formAmount, setFormAmount] = useState<number | ''>('');

  // ─── Admitted Students & Automatic Fee Collection State ───
  const admittedStudents = students.length > 0 ? students : INITIAL_STUDENTS;
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  useEffect(() => {
    if (admittedStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(admittedStudents[0].studentId || admittedStudents[0].id);
    }
  }, [admittedStudents, selectedStudentId]);

  // Read URL params (?studentId=...&action=collect)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sId = params.get('studentId');
      const action = params.get('action');
      if (sId) {
        setSelectedStudentId(sId);
      }
      if (action === 'collect' || sId) {
        setActiveTab('collection');
      }
    }
  }, []);

  // Currently selected admitted student
  const activeStudent = useMemo(() => {
    return admittedStudents.find(s => s.studentId === selectedStudentId || s.id === selectedStudentId) || admittedStudents[0];
  }, [admittedStudents, selectedStudentId]);

  // Automatic Fee Items Toggles
  const [includeTuition, setIncludeTuition] = useState(true);
  const [includeBoarding, setIncludeBoarding] = useState(true);
  const [includeExam, setIncludeExam] = useState(true);

  // Collection Month & Ledger
  const [feeMonth, setFeeMonth] = useState('সেপ্টেম্বর ২০২৬');
  const [colLedger, setColLedger] = useState<'general' | 'zakat'>('general');

  // Standard Jamat fee configuration fallback from Settings
  const activeStudentJamatFee = useMemo(() => {
    return getFeeForJamat(activeStudent?.class || 'নূরানী');
  }, [activeStudent?.class]);

  // Auto-calculated fee breakdown (No manual typing!)
  const studentFeeBreakdown = useMemo(() => {
    // Standard tuition fee from student record or fallback to Jamat fee setup
    const tuitionAmount = (activeStudent.monthlyTuitionFee !== undefined && activeStudent.monthlyTuitionFee !== null && activeStudent.monthlyTuitionFee > 0)
      ? activeStudent.monthlyTuitionFee
      : (activeStudentJamatFee?.monthlyTuitionFee || 1500);

    const tuition = includeTuition ? tuitionAmount : 0;
    const isResidential = activeStudent.boardingStatus === 'আবাসিক';

    // Standard boarding fee fallback
    const standardBoardingFee = (activeStudent.boardingFee !== undefined && activeStudent.boardingFee !== null && activeStudent.boardingFee > 0)
      ? activeStudent.boardingFee
      : (activeStudentJamatFee?.boardingFee || 2500);

    const khurakiAmount = !isResidential ? 0 : (
      activeStudent.khurakiTier === 'লিল্লাহ বোর্ডিং'
        ? 0
        : (activeStudent.pledgedKhurakiFee !== undefined ? activeStudent.pledgedKhurakiFee : standardBoardingFee)
    );
    const boarding = (includeBoarding && isResidential) ? khurakiAmount : 0;

    // Standard exam fee fallback
    const examAmount = (activeStudent.examFee !== undefined && activeStudent.examFee !== null && activeStudent.examFee > 0)
      ? activeStudent.examFee
      : (activeStudentJamatFee?.examFee || 400);

    const exam = includeExam ? examAmount : 0;
    const total = tuition + boarding + exam;

    return {
      tuition,
      tuitionAmount,
      boarding,
      khurakiAmount,
      exam,
      examAmount,
      total,
      isResidential,
    };
  }, [activeStudent, activeStudentJamatFee, includeTuition, includeBoarding, includeExam]);

  // Printable Money Receipt Modal State
  interface PrintedReceiptData {
    receiptNo: string;
    date: string;
    studentName: string;
    studentId: string;
    roll: string;
    jamat: string;
    academicYear: string;
    boardingStatus: string;
    month: string;
    ledger: string;
    tuitionFee: number;
    boardingFee: number;
    examFee: number;
    totalPaid: number;
  }
  const [printedReceipt, setPrintedReceipt] = useState<PrintedReceiptData | null>(null);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc || !formAmount) return;

    const newTx: Transaction = {
      id: String(Date.now()),
      date: formDate,
      voucherNo: `${formType === 'income' ? 'INC' : 'EXP'}-${Math.floor(1000 + Math.random() * 9000)}`,
      category: formCategory,
      ledger: formLedger,
      type: formType,
      jamat: formCategory === 'মাসিক বেতন' || formCategory === 'ভর্তি ফি' ? formJamat : undefined,
      description: formDesc,
      amount: Number(formAmount),
    };

    setTransactions([newTx, ...transactions]);
    setFormDesc('');
    setFormAmount('');
    alert(language === 'ar' ? 'تم حفظ السند بنجاح!' : language === 'en' ? 'Voucher saved successfully!' : 'খতিয়ানে সফলভাবে এন্ট্রি সম্পন্ন হয়েছে!');
  };

  // Automatic fee collection submission & printable receipt generation
  const handleAutoCollectFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentFeeBreakdown.total <= 0) {
      alert('দয়া করে অন্তত একটি ফি আইটেম নির্বাচন করুন');
      return;
    }

    const receiptNo = `REC-${Math.floor(10000 + Math.random() * 90000)}`;
    const today = new Date().toISOString().split('T')[0];

    const newTx: Transaction = {
      id: String(Date.now()),
      date: today,
      voucherNo: receiptNo,
      category: 'মাসিক বেতন',
      ledger: colLedger,
      type: 'income',
      jamat: activeStudent.class,
      studentName: activeStudent.nameBn,
      roll: activeStudent.roll,
      description: `${activeStudent.nameBn} (${activeStudent.class}, রোল: ${activeStudent.roll}) - ${feeMonth} বেতন ও অন্যান্য ফি আদায়`,
      amount: studentFeeBreakdown.total,
    };

    setTransactions([newTx, ...transactions]);

    // Create receipt data to display in official printable receipt modal
    const receiptData: PrintedReceiptData = {
      receiptNo,
      date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
      studentName: activeStudent.nameBn,
      studentId: activeStudent.studentId,
      roll: activeStudent.roll,
      jamat: activeStudent.class,
      academicYear: activeStudent.academicYear || '২০২৬-২০২৭',
      boardingStatus: activeStudent.boardingStatus,
      month: feeMonth,
      ledger: colLedger === 'general' ? 'সাধারণ তহবিল' : 'যাকাত ও লিল্লাহ ফান্ড',
      tuitionFee: studentFeeBreakdown.tuition,
      boardingFee: studentFeeBreakdown.boarding,
      examFee: studentFeeBreakdown.exam,
      totalPaid: studentFeeBreakdown.total,
    };

    setPrintedReceipt(receiptData);
  };

  // ─── SMART INSTANT FILTER LOGIC ───
  const matchesJamatFilter = (itemJamat?: string, itemDesc?: string, selectedJamatKey?: string) => {
    return matchesUnifiedJamat(itemJamat, itemDesc, selectedJamatKey || 'all');
  };

  const matchesSearchQuery = (item: { 
    studentName?: string; 
    roll?: string; 
    jamat?: string; 
    description?: string; 
    voucherNo?: string; 
    category?: string; 
    amount?: number | string;
    name?: string;
  }, queryStr: string) => {
    if (!queryStr || queryStr.trim() === '') return true;
    const q = queryStr.toLowerCase().trim();

    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.studentName && item.studentName.toLowerCase().includes(q)) ||
      (item.roll && item.roll.toLowerCase().includes(q)) ||
      (item.jamat && item.jamat.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.voucherNo && item.voucherNo.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.amount && String(item.amount).includes(q))
    );
  };

  // Filtered Transactions for Cashbook & Statements
  const filteredTxs = useMemo(() => {
    return transactions.filter(tx => {
      // 1. Fund / Ledger Filter
      if (filterLedger !== 'all' && tx.ledger !== filterLedger) return false;

      // 2. Jamat Filter
      if (!matchesJamatFilter(tx.jamat, tx.description, selectedJamat)) return false;

      // 3. Search Query Filter
      if (!matchesSearchQuery(tx, searchQuery)) return false;

      return true;
    });
  }, [transactions, filterLedger, selectedJamat, searchQuery]);

  // Filtered Dues for Collection Tab
  const filteredDues = useMemo(() => {
    return studentDues.filter(due => {
      // 1. Jamat Filter
      if (!matchesJamatFilter(due.jamat, due.jamat, selectedJamat)) return false;

      // 2. Search Query Filter
      if (!matchesSearchQuery(due, searchQuery)) return false;

      return true;
    });
  }, [studentDues, selectedJamat, searchQuery]);

  // Calculations based on current active filtered subset
  const totalIncome = filteredTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = filteredTxs.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // Breakdown for Statement
  const salaryExpense = filteredTxs.filter(tx => tx.category === 'শিক্ষক বেতন').reduce((s, tx) => s + tx.amount, 0);
  const messExpense = filteredTxs.filter(tx => tx.category === 'মেস বাজার').reduce((s, tx) => s + tx.amount, 0);
  const utilityExpense = filteredTxs.filter(tx => tx.category === 'বিদ্যুৎ ও ইউটিলিটি').reduce((s, tx) => s + tx.amount, 0);
  const otherExpense = filteredTxs.filter(tx => tx.category === 'অন্যান্য').reduce((s, tx) => s + tx.amount, 0);

  const tuitionIncome = filteredTxs.filter(tx => tx.category === 'মাসিক বেতন').reduce((s, tx) => s + tx.amount, 0);
  const admissionIncome = filteredTxs.filter(tx => tx.category === 'ভর্তি ফি').reduce((s, tx) => s + tx.amount, 0);
  const zakatIncome = filteredTxs.filter(tx => tx.category === 'লিল্লাহ/যাকাত').reduce((s, tx) => s + tx.amount, 0);
  const donationIncome = filteredTxs.filter(tx => tx.category === 'দান/সদকা').reduce((s, tx) => s + tx.amount, 0);

  const activeJamatConfig = QAWMI_JAMATS.find(j => j.value === selectedJamat);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* ─── HEADER WITH MONTH SELECTOR & TABS ─── */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Landmark className="text-emerald-600" />
            {t.fin_title || 'হিসাব ও ফি ব্যবস্থাপনা'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {t.fin_subtitle || 'কওমি মাদ্রাসার ক্যাশবহি, সাধারণ ও লিল্লাহ ফান্ড এবং জামাতভিত্তিক ফি আদায়'}
          </p>
        </div>

        {/* Month Selector & Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
          
          {/* 1. Month Picker Selector */}
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-slate-700/80 px-3 py-1.5 rounded-xl border border-emerald-600/30 shadow-xs">
            <Calendar size={15} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 shrink-0">চলতি মাস:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-black text-emerald-950 dark:text-emerald-200 focus:outline-none cursor-pointer"
            >
              <option value="সেপ্টেম্বর ২০২৬">সেপ্টেম্বর ২০২৬</option>
              <option value="আগস্ট ২০২৬">আগস্ট ২০২৬</option>
              <option value="জুলাই ২০২৬">জুলাই ২০২৬</option>
              <option value="জুন ২০২৬">জুন ২০২৬</option>
              <option value="মে ২০২৬">মে ২০২৬</option>
              <option value="রমজানুল মোবারক ১৪৪৭">রমজানুল মোবারক ১৪৪৭</option>
            </select>
          </div>

          {/* 2. Tab Navigation Buttons */}
          <div className="flex bg-gray-100 dark:bg-slate-700/60 p-1.5 rounded-xl border border-gray-200/60 dark:border-slate-600">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3.5 py-1.5 text-xs md:text-sm font-bold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'summary' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
              }`}
              title="এক নজরে সম্পূর্ণ মাসের জামাতভিত্তিক আয় ও ব্যয় সারসংক্ষেপ"
            >
              <BarChart3 size={15} />
              মাসিক সারসংক্ষেপ রিপোর্ট
            </button>

            <button
              onClick={() => setActiveTab('cashbook')}
              className={`px-3.5 py-1.5 text-xs md:text-sm font-bold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'cashbook' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
              }`}
            >
              <Wallet size={15} />
              {t.fin_tab_cashbook || 'ক্যাশবহি'}
            </button>
            
            <button
              onClick={() => setActiveTab('statement')}
              className={`px-3.5 py-1.5 text-xs md:text-sm font-bold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'statement' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
              }`}
            >
              <FileText size={15} />
              অডিট বিবরণী
            </button>

            <button
              onClick={() => setActiveTab('collection')}
              className={`px-3.5 py-1.5 text-xs md:text-sm font-bold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'collection' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
              }`}
            >
              <Receipt size={15} />
              ফি কালেকশন
            </button>
          </div>

        </div>
      </div>

      {/* ─── TAB: MONTHLY BREAKDOWN SUMMARY DASHBOARD (এক নজরে মাসিক রিপোর্ট) ─── */}
      {activeTab === 'summary' && (
        <div id="monthly-summary-sheet" className="space-y-6 relative">
          
          {/* Official Seal Watermark for Printable Committee Statement */}
          <OfficialWatermark 
            instituteName={instituteSettings.name || 'জামিয়া আরাবিয়া ইমদাদুল উলুম ফরিদাবাদ'} 
            size={360} 
            className="top-[280px]" 
            opacity="opacity-[0.035] print:opacity-[0.08]" 
          />

          {/* 1. TOP NET FINANCIAL BALANCE CARD (মাসের নিট হিসাব সমীকরণ) */}
          <div className="bg-gradient-to-r from-[#064e3b] via-[#065f46] to-[#064e3b] rounded-2xl p-6 text-white border border-amber-400/40 shadow-xl relative overflow-hidden">
            
            {/* Top Row: Institute Info & Print Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-700/60 pb-4 mb-5">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/30">
                  <Sparkles size={13} />
                  {instituteSettings.name || 'জামিয়া আরাবিয়া ইমদাদুল উলুম ফরিদাবাদ মাদ্রাসা, ঢাকা'}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
                  {selectedMonth} - মাসিক আয়-ব্যয় ও জামাতভিত্তিক সারসংক্ষেপ
                </h2>
                <p className="text-xs text-emerald-100">
                  মাদ্রাসা পরিচালনা কমিটির মাসিক অডিট ও রেজুলেশন মিটিংয়ের জন্য ১ পৃষ্ঠার প্রমিত সারসংক্ষেপ
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-lg hover:shadow-amber-900/40 print:hidden shrink-0"
                title="কমিটি মিটিংয়ের জন্য ১ পৃষ্ঠার মাসিক স্টেটমেন্ট প্রিন্ট বা পিডিএফ সেভ করুন"
              >
                <Printer size={16} />
                প্রিন্ট / মাসিক স্টেটমেন্ট ডাউনলোড
              </button>
            </div>

            {/* Visual Balance Equation Banner: [ মোট আদায় ] - [ মোট খরচ ] = [ বর্তমান উদ্বৃত্ত ] */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              
              {/* Box 1: Total Income */}
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 border border-emerald-300/40 shadow-sm">
                <div className="flex justify-between items-center text-xs font-bold text-emerald-200 mb-1">
                  <span>[ মোট আদায় / আয় ] (+)</span>
                  <span className="bg-emerald-500/30 text-emerald-100 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">১৩ খাত</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
                  ৳ {totalMonthlyIncome.toLocaleString()}
                </p>
                <span className="text-[11px] text-emerald-100/80 mt-1 block font-medium">জামাতভিত্তিক বেতন ও দান সংগ্রহ</span>
              </div>

              {/* Box 2: Total Expense */}
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 border border-red-300/40 shadow-sm">
                <div className="flex justify-between items-center text-xs font-bold text-red-200 mb-1">
                  <span>[ মোট খরচ / ব্যয় ] (-)</span>
                  <span className="bg-red-500/30 text-red-100 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">৫ খাত</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-red-300 font-mono">
                  ৳ {totalMonthlyExpense.toLocaleString()}
                </p>
                <span className="text-[11px] text-red-100/80 mt-1 block font-medium">সম্মানী, মেস বাজার ও ইউটিলিটি</span>
              </div>

              {/* Box 3: Net Balance / Surplus */}
              <div className="bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 rounded-xl p-4 border border-amber-200 shadow-md">
                <div className="flex justify-between items-center text-xs font-black text-slate-900 mb-1">
                  <span>[ বর্তমান উদ্বৃত্ত / ব্যালেন্স ] (=)</span>
                  <span className="bg-slate-950/20 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-bold">উদ্বৃত্ত তহবিল</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
                  ৳ {monthlyNetSurplus.toLocaleString()}
                </p>
                <span className="text-[11px] text-slate-800 mt-1 block font-bold">চলতি মাসের নিট ক্যাশ উদ্বৃত্ত</span>
              </div>

            </div>

          </div>

          {/* 2. TWO-COLUMN BREAKDOWN: JAMAT TUITION vs CATEGORY EXPENSES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT CARD: CLASS-WISE TUITION COLLECTION BREAKDOWN (জামাতভিত্তিক বেতন আদায়) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-emerald-600/30 overflow-hidden flex flex-col justify-between">
              
              {/* Card Header */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-700 dark:to-slate-800 p-4 border-b border-emerald-100 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-gray-900 dark:text-white">জামাতভিত্তিক বেতন আদায়</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">প্রতিটি জামাতের মোট মাসিক আদায়কৃত ফি</p>
                  </div>
                </div>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                  {monthlySummary.jamatCollections.length} টি জামাত
                </span>
              </div>

              {/* Jamat List Table */}
              <div className="p-4 divide-y divide-gray-100 dark:divide-slate-700/60">
                {monthlySummary.jamatCollections.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/40 px-2 rounded-xl transition cursor-pointer group"
                    onClick={() => {
                      if (item.jamat !== 'সাধারণ দান/অনুদান') {
                        setSelectedJamat(item.jamat.replace('খানা', ''));
                        setActiveTab('cashbook');
                      }
                    }}
                    title="ক্যাশবহিতে এই জামাতের বিস্তারিত দেখতে ক্লিক করুন"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 transition">
                          {item.jamat}
                        </span>
                        <div className="w-24 sm:w-32 bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                          <div 
                            className="bg-emerald-500 h-full rounded-full" 
                            style={{ width: `${item.percentage * 5}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-gray-900 dark:text-white">
                        ৳ {item.amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400 block font-mono">
                        {item.percentage}% অংশ
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Left Card Footer: Highlighted Total Income */}
              <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex justify-between items-center rounded-b-2xl shadow-inner">
                <div className="flex items-center gap-2 font-black text-base">
                  <Coins size={20} className="text-amber-300" />
                  <span>👉 মোট আয় (Total Income)</span>
                </div>
                <span className="font-mono font-black text-xl text-amber-200">
                  ৳ {totalMonthlyIncome.toLocaleString()}
                </span>
              </div>

            </div>

            {/* RIGHT CARD: CATEGORY-WISE EXPENSE BREAKDOWN (খাতভিত্তিক মোট খরচ) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-red-500/30 overflow-hidden flex flex-col justify-between">
              
              {/* Card Header */}
              <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-slate-700 dark:to-slate-800 p-4 border-b border-red-100 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-600 text-white rounded-xl shadow-xs">
                    <TrendingDown size={16} />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-gray-900 dark:text-white">খাতভিত্তিক মোট খরচ</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">প্রতিটি হিসাব খাতের মোট মাসিক ব্যয়</p>
                  </div>
                </div>
                <span className="text-xs bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 font-bold px-2.5 py-1 rounded-full border border-red-200">
                  {monthlySummary.categoryExpenses.length} টি প্রধান খাত
                </span>
              </div>

              {/* Expense List Table */}
              <div className="p-4 divide-y divide-gray-100 dark:divide-slate-700/60 flex-1">
                {monthlySummary.categoryExpenses.map((exp, idx) => (
                  <div key={idx} className="py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/40 px-2 rounded-xl transition">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 mt-0.5">
                        {exp.icon === 'zap' && <Zap size={16} />}
                        {exp.icon === 'utensils' && <Utensils size={16} />}
                        {exp.icon === 'graduation-cap' && <GraduationCap size={16} />}
                        {exp.icon === 'flame' && <Flame size={16} />}
                        {exp.icon === 'wrench' && <Wrench size={16} />}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block">
                          {exp.category}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {exp.note}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-base text-red-600 dark:text-red-400">
                        ৳ {exp.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Card Footer: Highlighted Total Expenses */}
              <div className="p-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex justify-between items-center rounded-b-2xl shadow-inner">
                <div className="flex items-center gap-2 font-black text-base">
                  <ArrowUpRight size={20} className="text-amber-200" />
                  <span>👉 মোট খরচ (Total Expenses)</span>
                </div>
                <span className="font-mono font-black text-xl text-amber-200">
                  ৳ {totalMonthlyExpense.toLocaleString()}
                </span>
              </div>

            </div>

          </div>

          {/* 3. COMMITTEE RESOLUTION & SIGN-OFF SECTION (ফর রেজুলেশন ও প্রিন্ট) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
            <h4 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-2 border-b dark:border-slate-700 pb-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              মাদ্রাসা শুরা ও অর্থ উপকমিটির অনুমোদন ও স্বাক্ষর
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 text-center text-xs text-gray-600 dark:text-gray-400">
              <div>
                <div className="border-b border-gray-400 border-dashed pb-1 font-bold text-gray-800 dark:text-gray-200">
                  হাফেজ মোশাররফ হোসেন
                </div>
                <p className="mt-1 font-semibold">হিসাবরক্ষক (খাজাঞ্চি)</p>
              </div>

              <div>
                <div className="border-b border-gray-400 border-dashed pb-1 font-bold text-gray-800 dark:text-gray-200">
                  মাওলানা আব্দুল্লাহ আল-মামুন
                </div>
                <p className="mt-1 font-semibold">অভ্যন্তরীণ নিরীক্ষক (অডিটর)</p>
              </div>

              <div>
                <div className="border-b border-gray-400 border-dashed pb-1 font-bold text-gray-800 dark:text-gray-200">
                  মুফতি সৈয়দ বোরহানুল ইসলাম
                </div>
                <p className="mt-1 font-semibold">মুহতামিম / প্রিন্সিপাল</p>
              </div>

              <div>
                <div className="border-b border-gray-400 border-dashed pb-1 font-bold text-gray-800 dark:text-gray-200">
                  আলহাজ্ব নাসিরুদ্দিন আহমেদ
                </div>
                <p className="mt-1 font-semibold">সভাপতি / সাধারণ সম্পাদক</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ─── UNIFIED SMART SEARCH & QAWMI JAMAT FILTER BAR (for Cashbook, Statement, Collection) ─── */}
      {activeTab !== 'summary' && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-emerald-600/20 dark:border-slate-700 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* 1. Smart Instant Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-emerald-600" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 ছাত্রের নাম, রোল, জামাত বা বিবরণ দিয়ে খুঁজুন..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  title="মুছে ফেলুন"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* 2. Exact Qawmi Jamat Filter Dropdown */}
            <div className="flex items-center gap-2 min-w-[280px]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 shrink-0">
                <BookOpen size={16} className="text-emerald-600" />
                <span>জামাত ফিল্টার:</span>
              </div>
              <select
                value={selectedJamat}
                onChange={(e) => setSelectedJamat(e.target.value)}
                className="w-full p-2.5 border border-emerald-600/30 rounded-xl text-xs md:text-sm font-bold bg-emerald-50/50 dark:bg-slate-700 text-emerald-950 dark:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition cursor-pointer shadow-xs"
              >
                {QAWMI_JAMATS.map((j) => (
                  <option key={j.value} value={j.value} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white py-1">
                    {j.labelBn}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Fund / Ledger Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl shrink-0 border border-gray-200 dark:border-slate-600">
              <button
                onClick={() => setFilterLedger('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  filterLedger === 'all'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
                }`}
              >
                সব তহবিল
              </button>
              <button
                onClick={() => setFilterLedger('general')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  filterLedger === 'general'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
                }`}
              >
                সাধারণ তহবিল
              </button>
              <button
                onClick={() => setFilterLedger('zakat')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  filterLedger === 'zakat'
                    ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:text-purple-600'
                }`}
              >
                যাকাত ও লিল্লাহ তহবিল
              </button>
            </div>
          </div>

          {/* Active Filter Indicators & Reset Button */}
          {(selectedJamat !== 'all' || filterLedger !== 'all' || searchQuery.trim() !== '') && (
            <div className="pt-2 border-t border-gray-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-gray-500 dark:text-gray-400 font-semibold">সক্রিয় ফিল্টার:</span>
                
                {selectedJamat !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold border border-emerald-300/80">
                    <BookOpen size={12} />
                    জামাত: {activeJamatConfig?.labelBn}
                    <button onClick={() => setSelectedJamat('all')} className="hover:text-red-600 ml-0.5">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {filterLedger !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-bold border border-blue-300/80">
                    তহবিল: {filterLedger === 'general' ? 'সাধারণ তহবিল' : 'যাকাত ও লিল্লাহ'}
                    <button onClick={() => setFilterLedger('all')} className="hover:text-red-600 ml-0.5">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {searchQuery.trim() !== '' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold border border-amber-300/80">
                    সার্চ: &ldquo;{searchQuery}&rdquo;
                    <button onClick={() => setSearchQuery('')} className="hover:text-red-600 ml-0.5">
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-gray-500 dark:text-gray-400">
                  ফলাফল: <b className="text-emerald-600 font-mono">{filteredTxs.length}</b> টি ভাউচার
                </span>
                <button
                  onClick={() => {
                    setSelectedJamat('all');
                    setFilterLedger('all');
                    setSearchQuery('');
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-bold underline flex items-center gap-1"
                >
                  <RefreshCw size={12} />
                  সকল ফিল্টার মুছুন
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: MADRASA CASHBOOK ─── */}
      {activeTab === 'cashbook' && (
        <div className="space-y-6">

          {/* Dynamic Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {selectedJamat !== 'all' ? `${activeJamatConfig?.labelBn} - মোট জমা` : (t.fin_total_income || 'মোট আয়')}
                </span>
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl"><ArrowDownRight size={18} /></div>
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
                ৳ {totalIncome.toLocaleString()}
              </p>
              <span className="text-xs text-gray-400 mt-1 block">
                {selectedJamat !== 'all' ? 'নির্বাচিত জামাতের মোট ফি সংগ্রহ' : (t.fin_total_income_sub || 'বর্তমান ফিল্টার অনুযায়ী')}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {t.fin_total_expense || 'মোট ব্যয়'}
                </span>
                <div className="p-2 bg-red-100 text-red-700 rounded-xl"><ArrowUpRight size={18} /></div>
              </div>
              <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-2 font-mono">
                ৳ {totalExpense.toLocaleString()}
              </p>
              <span className="text-xs text-gray-400 mt-1 block">
                {t.fin_total_expense_sub || 'সম্মানী, মেস ও প্রশাসনিক খরচ'}
              </span>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl border border-slate-700 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">{t.fin_net_balance || 'নিট ব্যালেন্স / তহবিল স্থিতি'}</span>
                <Wallet size={18} className="text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-white mt-2 font-mono">
                ৳ {netBalance.toLocaleString()}
              </p>
              <span className="text-xs text-slate-300 mt-1 block">{t.fin_net_balance_sub || 'হিসাব সমাপনী উদ্বৃত্ত'}</span>
            </div>
          </div>

          {/* New Transaction Input Form with Jamat Selector */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h2 className="text-base font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Plus size={18} className="text-emerald-600" />
              {t.fin_new_voucher_title || 'নতুন ভাউচার / আয়-ব্যয় এন্ট্রি করুন'}
            </h2>

            <form onSubmit={handleAddTransaction} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{t.fin_date || 'তারিখ'}</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full p-2 border rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{t.fin_type || 'ধরন'}</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as 'income' | 'expense')}
                  className="w-full p-2 border rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                >
                  <option value="income">{t.fin_type_income || 'আয় / জমা (+)'}</option>
                  <option value="expense">{t.fin_type_expense || 'ব্যয় / খরচ (-)'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{t.fin_category || 'হিসাব খাত'}</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as Transaction['category'])}
                  className="w-full p-2 border rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                >
                  <option value="মাসিক বেতন">মাসিক বেতন / Tuition</option>
                  <option value="ভর্তি ফি">ভর্তি ফি / Admission</option>
                  <option value="লিল্লাহ/যাকাত">লিল্লাহ/যাকাত / Zakat</option>
                  <option value="দান/সদকা">দান/সদকা / Donation</option>
                  <option value="শিক্ষক বেতন">শিক্ষক বেতন / Salary</option>
                  <option value="মেস বাজার">মেস বাজার / Mess Bazar</option>
                  <option value="বিদ্যুৎ ও ইউটিলিটি">বিদ্যুৎ ও ইউটিলিটি / Utility</option>
                  <option value="অন্যান্য">অন্যান্য / Others</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">জামাত (প্রযোজ্য ক্ষেত্রে)</label>
                <select
                  value={formJamat}
                  onChange={(e) => setFormJamat(e.target.value)}
                  className="w-full p-2 border rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                >
                  {QAWMI_JAMATS.filter(j => j.value !== 'all').map((j) => (
                    <option key={j.value} value={j.value}>{j.labelBn}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{t.fin_ledger || 'তহবিল'}</label>
                <select
                  value={formLedger}
                  onChange={(e) => setFormLedger(e.target.value as 'general' | 'zakat')}
                  className="w-full p-2 border rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                >
                  <option value="general">{t.fin_ledger_general || 'সাধারণ তহবিল'}</option>
                  <option value="zakat">{t.fin_ledger_zakat || 'যাকাত ও লিল্লাহ তহবিল'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{t.fin_amount || 'টাকার পরিমাণ'} *</label>
                <input
                  type="number"
                  required
                  placeholder="৫০০০"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2 border rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 font-bold"
                />
              </div>

              <div className="lg:col-span-5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">বিবরণ / দাতার নাম / বিবরণী *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মেশকাত জামাত ছাত্র আব্দুল্লাহ আল মাহমুদের সেপ্টেম্বর মাসের বেতন"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2 border rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                />
              </div>

              <div className="lg:col-span-1">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl text-sm font-bold transition shadow-sm"
                >
                  {t.fin_save_voucher || 'ভাউচার সংরক্ষণ'}
                </button>
              </div>
            </form>
          </div>

          {/* Cashbook Ledger Table with Jamat Tags */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText size={16} className="text-emerald-600" />
                  {selectedJamat !== 'all' ? `${activeJamatConfig?.labelBn} - খতিয়ান রেকর্ড` : (t.fin_cashbook_title || 'দৈনিক ক্যাশবহি ও খতিয়ান হিসাব')}
                </h3>
                <span className="text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 px-2 py-0.5 rounded-full font-mono font-bold">
                  {filteredTxs.length} টি এন্ট্রি
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-slate-700/60 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                  <tr>
                    <th className="py-3 px-4">{t.fin_date || 'তারিখ'}</th>
                    <th className="py-3 px-4">{t.fin_voucher_no || 'ভাউচার নং'}</th>
                    <th className="py-3 px-4">জামাত / শ্রেণী</th>
                    <th className="py-3 px-4">{t.fin_category || 'খাত'}</th>
                    <th className="py-3 px-4">{t.fin_ledger || 'তহবিল'}</th>
                    <th className="py-3 px-4">{t.fin_description || 'বিবরণ'}</th>
                    <th className="py-3 px-4 text-right">{t.fin_credit || 'জমা (+)'}</th>
                    <th className="py-3 px-4 text-right">{t.fin_debit || 'খরচ (-)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredTxs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                          <BookOpen size={36} className="text-gray-300 dark:text-slate-600 mb-2" />
                          <p className="font-bold text-sm">কোনো লেনদেন বা ভাউচার পাওয়া যায়নি</p>
                          <p className="text-xs text-gray-400 mt-1">অন্য কোনো জামাত নির্বাচন করুন অথবা সার্চ কুয়েরি ক্লিয়ার করুন</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTxs.map((tx) => (
                      <tr key={tx.id} className="hover:bg-emerald-50/40 dark:hover:bg-slate-700/50 transition">
                        <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">{tx.date}</td>
                        <td className="py-3 px-4 font-mono text-xs font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          {tx.voucherNo}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {tx.jamat ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-300/80">
                              <BookOpen size={10} />
                              {tx.jamat}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-slate-500">সাধারণ / প্রশাসনিক</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md font-medium">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            tx.ledger === 'zakat' 
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200' 
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200'
                          }`}>
                            {tx.ledger === 'zakat' ? 'যাকাত ও লিল্লাহ' : 'সাধারণ তহবিল'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">
                          {tx.description}
                          {tx.studentName && (
                            <span className="block text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                              ছাত্র: {tx.studentName} {tx.roll ? `(রোল: ${tx.roll})` : ''}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {tx.type === 'income' ? `+৳ ${tx.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                          {tx.type === 'expense' ? `-৳ ${tx.amount.toLocaleString()}` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ─── TAB: MUHTAMIM AUDIT STATEMENT (PRINTABLE) ─── */}
      {activeTab === 'statement' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center print:hidden">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              নির্বাচিত জামাত: <b className="text-emerald-600">{activeJamatConfig?.labelBn}</b> | তহবিল: <b>{filterLedger === 'all' ? 'সব তহবিল' : filterLedger}</b>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Printer size={16} />
              {t.fin_print_statement || 'অডিট রিপোর্ট প্রিন্ট করুন'}
            </button>
          </div>

          {/* Printable Financial Statement Sheet */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-emerald-600/30 p-8 max-w-4xl mx-auto print:m-0 print:p-0 print:border-none print:shadow-none space-y-6">
            
            {/* Header */}
            <div className="text-center border-b-2 border-emerald-700 pb-4">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                {instituteSettings.name || 'জামিয়া আরাবিয়া ইমদাদুল উলুম ফরিদাবাদ মাদ্রাসা, ঢাকা'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {instituteSettings.address || 'ফরিদাবাদ, গেন্ডারিয়া, ঢাকা-১২০৪'} | কওমি বাইতুল মাল হিসাব
              </p>
              <div className="inline-block mt-3 bg-emerald-950 text-white px-5 py-1 rounded-full text-xs font-bold tracking-wide">
                মুহতামিম অডিট বিবরণী ({selectedMonth}) {selectedJamat !== 'all' ? `• জামাত: ${activeJamatConfig?.labelBn}` : ''}
              </div>
            </div>

            {/* Two Column Breakdown: Income vs Expense */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Income Column */}
              <div className="border border-emerald-200 dark:border-emerald-800 rounded-xl overflow-hidden">
                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 border-b border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
                  <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">আয়ের খাতসমূহ (Income Heads)</h3>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">৳</span>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                    <span className="text-gray-700 dark:text-gray-300">মাসিক বেতন (Tuition Fees)</span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">৳ {tuitionIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                    <span className="text-gray-700 dark:text-gray-300">ভর্তি ও সেশন ফি (Admission)</span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">৳ {admissionIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                    <span className="text-gray-700 dark:text-gray-300">সাধারণ দান ও সদকা (Donations)</span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">৳ {donationIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                    <span className="text-gray-700 dark:text-gray-300">লিল্লাহ ও যাকাত অনুদান (Zakat Fund)</span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">৳ {zakatIncome.toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-emerald-100/60 dark:bg-emerald-900/50 p-3 flex justify-between font-bold text-emerald-950 dark:text-emerald-100 text-sm">
                  <span>মোট আয় / আদায়</span>
                  <span className="font-mono">৳ {totalIncome.toLocaleString()}</span>
                </div>
              </div>

              {/* Expense Column */}
              <div className="border border-red-200 dark:border-red-800 rounded-xl overflow-hidden">
                <div className="bg-red-50 dark:bg-red-900/30 p-3 border-b border-red-200 dark:border-red-800 flex justify-between items-center">
                  <h3 className="font-bold text-red-900 dark:text-red-200 text-sm">ব্যয়ের খাতসমূহ (Expense Heads)</h3>
                  <span className="text-xs font-bold text-red-700 dark:text-red-300">৳</span>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                    <span className="text-gray-700 dark:text-gray-300">উস্তাদ ও খাদেম বেতন (Salaries)</span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">৳ {salaryExpense.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                    <span className="text-gray-700 dark:text-gray-300">মেস ও রান্না বাজার (Kitchen Bazar)</span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">৳ {messExpense.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                    <span className="text-gray-700 dark:text-gray-300">বিদ্যুৎ ও গ্যাস বিল (Utilities)</span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">৳ {utilityExpense.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                    <span className="text-gray-700 dark:text-gray-300">মেরামত ও অন্যান্য (Others)</span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">৳ {otherExpense.toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-red-100/60 dark:bg-red-900/50 p-3 flex justify-between font-bold text-red-950 dark:text-red-100 text-sm">
                  <span>মোট ব্যয় / খরচ</span>
                  <span className="font-mono">৳ {totalExpense.toLocaleString()}</span>
                </div>
              </div>

            </div>

            {/* Net Surplus / Balance Box */}
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-xl flex justify-between items-center text-sm font-bold">
              <span className="text-slate-800 dark:text-slate-200">নিট উদ্বৃত্ত / বর্তমান তহবিলের স্থিতি:</span>
              <span className="text-xl text-emerald-700 dark:text-emerald-300 font-mono">৳ {netBalance.toLocaleString()}</span>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 text-center text-xs pt-12 border-t border-dashed border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-400">
              <div>
                <div className="h-10"></div>
                <p className="border-t border-gray-400 pt-1 font-bold">হিসাবরক্ষক (খাজাঞ্চি)</p>
              </div>
              <div>
                <div className="h-10"></div>
                <p className="border-t border-gray-400 pt-1 font-bold">অভ্যন্তরীণ নিরীক্ষক (অডিটর)</p>
              </div>
              <div>
                <div className="h-10"></div>
                <p className="border-t border-gray-400 pt-1 font-bold">মুহতামিম / প্রিন্সিপাল</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── TAB: FEE COLLECTION & DUES (স্বয়ংক্রিয় ছাত্র-সংযুক্ত ফি আদায়) ─── */}
      {activeTab === 'collection' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Automatic Student-Linked Fee Collection Form */}
            <div className="p-6 bg-white dark:bg-slate-800 border rounded-2xl dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b dark:border-slate-700 pb-3">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Receipt size={20} className="text-emerald-600" />
                    <span>স্বয়ংক্রিয় ফি আদায় (Auto Fee Collection)</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    ছাত্র ডাটাবেজ থেকে স্বয়ংক্রিয় বেতন, বোর্ডিং ও পরীক্ষার ফি হিসাব (নো টাইপিং)
                  </p>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 shrink-0">
                  ভর্তি ডাটাবেজ লিংকড
                </span>
              </div>
              
              <form onSubmit={handleAutoCollectFee} className="space-y-4">
                {/* 1. Student Selector: Only Admitted Students */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    ভর্তিকৃত শিক্ষার্থী নির্বাচন করুন {selectedJamat !== 'all' ? `(${activeJamatConfig?.labelBn})` : ''} *
                  </label>
                  <select 
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full p-2.5 sm:p-3 border rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-700 text-gray-900 dark:text-white border-emerald-400 dark:border-emerald-600 font-bold shadow-2xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {admittedStudents
                      .filter(s => selectedJamat === 'all' || matchesJamatFilter(s.class, s.class, selectedJamat))
                      .map((std) => (
                        <option key={std.id} value={std.studentId}>
                          {std.nameBn} (আইডি: {std.studentId} • রোল: {std.roll} • {std.class} - {std.boardingStatus})
                        </option>
                      ))}
                  </select>
                </div>

                {/* 2. Auto-Populated Student Identity Details Badge */}
                <div className="bg-emerald-50/70 dark:bg-slate-700/40 rounded-xl p-3 border border-emerald-200/80 dark:border-slate-600 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10.5px] text-gray-500 dark:text-gray-400 block">শিক্ষার্থীর নাম:</span>
                      <span className="font-bold text-gray-900 dark:text-white">{activeStudent.nameBn}</span>
                    </div>
                    <div>
                      <span className="text-[10.5px] text-gray-500 dark:text-gray-400 block">রোল ও আইডি:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">{activeStudent.roll} ({activeStudent.studentId})</span>
                    </div>
                    <div>
                      <span className="text-[10.5px] text-gray-500 dark:text-gray-400 block">জামাত ও সেশন:</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{activeStudent.class} ({activeStudent.academicYear || '২০২৬-২০২৭'})</span>
                    </div>
                    <div>
                      <span className="text-[10.5px] text-gray-500 dark:text-gray-400 block">আবাসন স্ট্যাটাস:</span>
                      <span className={`font-bold inline-block px-2 py-0.5 rounded text-[11px] ${
                        activeStudent.boardingStatus === 'আবাসিক'
                          ? 'bg-emerald-200/80 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-sky-200/80 text-sky-900 dark:bg-sky-950 dark:text-sky-300'
                      }`}>
                        {activeStudent.boardingStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Auto-Populated Fee Items (Checked by default, zero manual typing!) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    ধার্যকৃত ফি বিবরণী (স্বয়ংক্রিয় হিসাব):
                  </label>
                  
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-gray-200 dark:border-slate-600 text-xs">
                    {/* Item 1: Monthly Tuition */}
                    <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={includeTuition} 
                          onChange={(e) => setIncludeTuition(e.target.checked)} 
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="font-bold text-gray-800 dark:text-gray-200">১. ধার্যকৃত মাসিক বেতন</span>
                      </div>
                      <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                        ৳ {studentFeeBreakdown.tuitionAmount.toLocaleString()}
                      </span>
                    </label>

                    {/* Item 2: Boarding / Meal Fee (Linked with Khuraki Assessment) */}
                    <label className={`flex items-center justify-between p-1.5 rounded-lg ${
                      activeStudent.boardingStatus === 'আবাসিক' 
                        ? 'cursor-pointer hover:bg-white dark:hover:bg-slate-700' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          disabled={activeStudent.boardingStatus !== 'আবাসিক'}
                          checked={includeBoarding && activeStudent.boardingStatus === 'আবাসিক'} 
                          onChange={(e) => setIncludeBoarding(e.target.checked)} 
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-800 dark:text-gray-200">২. বোর্ডিং ও খোরাকি ফি</span>
                            {activeStudent.boardingStatus === 'আবাসিক' && activeStudent.khurakiTier && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                activeStudent.khurakiTier === 'পূর্ণ পেইং' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' :
                                activeStudent.khurakiTier === 'আংশিক খোরাকি' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700' :
                                'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                              }`}>
                                {activeStudent.khurakiTier}
                              </span>
                            )}
                          </div>
                          {activeStudent.boardingStatus === 'আবাসিক' && activeStudent.khurakiTier === 'আংশিক খোরাকি' && (
                            <span className="text-[10px] text-amber-700 dark:text-amber-300 block font-medium">
                              (অঙ্গীকারকৃত প্রদেয়: ৳ {studentFeeBreakdown.khurakiAmount.toLocaleString()} • লিল্লাহ ফান্ড ভর্তুকি: ৳ {(activeStudent.subsidyKhurakiFee || 1000).toLocaleString()})
                            </span>
                          )}
                          {activeStudent.boardingStatus === 'আবাসিক' && activeStudent.khurakiTier === 'লিল্লাহ বোর্ডিং' && (
                            <span className="text-[10px] text-purple-700 dark:text-purple-300 block font-medium">
                              (১০০% ফ্রি খোরাকি - বাইতুল মাল লিল্লাহ ফান্ড থেকে পরিশোধিত)
                            </span>
                          )}
                          {activeStudent.boardingStatus !== 'আবাসিক' && (
                            <span className="text-[10px] text-gray-400 font-normal">(অনাবাসিক - প্রযোজ্য নয়)</span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                        ৳ {studentFeeBreakdown.boarding.toLocaleString()}
                      </span>
                    </label>

                    {/* Item 3: Exam Fee */}
                    <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={includeExam} 
                          onChange={(e) => setIncludeExam(e.target.checked)} 
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="font-bold text-gray-800 dark:text-gray-200">৩. পরীক্ষা ও সেমিনার ফি</span>
                      </div>
                      <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                        ৳ {studentFeeBreakdown.examAmount.toLocaleString()}
                      </span>
                    </label>
                  </div>
                </div>

                {/* 4. Month and Fund Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">প্রদেয় মাস</label>
                    <select 
                      value={feeMonth}
                      onChange={(e) => setFeeMonth(e.target.value)}
                      className="w-full p-2.5 border rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 font-semibold"
                    >
                      <option value="সেপ্টেম্বর ২০২৬">সেপ্টেম্বর ২০২৬ (চলতি মাস)</option>
                      <option value="অক্টোবর ২০২৬">অক্টোবর ২০২৬</option>
                      <option value="আগস্ট ২০২৬">আগস্ট ২০২৬</option>
                      <option value="জুলাই ২০২৬">জুলাই ২০২৬</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">জমার তহবিল</label>
                    <select 
                      value={colLedger}
                      onChange={(e) => setColLedger(e.target.value as 'general' | 'zakat')}
                      className="w-full p-2.5 border rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 font-semibold"
                    >
                      <option value="general">সাধারণ তহবিল (বেতন ফান্ড)</option>
                      <option value="zakat">যাকাত ও লিল্লাহ ফান্ড</option>
                    </select>
                  </div>
                </div>

                {/* 5. Total Payable Highlight (Zero Manual Typing) */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-xl flex justify-between items-center shadow-md">
                  <div>
                    <span className="text-[11px] text-emerald-100 uppercase tracking-wider block font-bold">
                      সর্বমোট প্রদেয় টাকা (স্বয়ংক্রিয় হিসাবকৃত)
                    </span>
                    <span className="text-xs text-amber-200">কোনো টাইপিং ছাড়াই নিখুঁত হিসাব</span>
                  </div>
                  <span className="font-mono font-black text-2xl text-amber-300 drop-shadow-xs">
                    ৳ {studentFeeBreakdown.total.toLocaleString()}
                  </span>
                </div>

                {/* 6. Single-click Action Button */}
                <div className="pt-1">
                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white py-3 rounded-xl text-sm font-black transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <Coins size={18} className="text-amber-300" />
                    <span>জমা নিন ও রসিদ প্রিন্ট করুন</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Filtered Student Dues List */}
            <div className="p-6 bg-white dark:bg-slate-800 border rounded-2xl dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell size={18} className="text-amber-500" />
                  {t.fin_dues_title || 'বকেয়া তালিকা ও তাগাদা SMS'}
                </h3>
                <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-2.5 py-0.5 rounded-full font-bold">
                  {filteredDues.length} জন বকেয়া
                </span>
              </div>

              <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1">
                {filteredDues.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                    <p className="font-bold text-sm">এই জামাতে কোনো বকেয়া ছাত্র নেই!</p>
                  </div>
                ) : (
                  filteredDues.map((std) => (
                    <div key={std.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700 hover:border-emerald-300 transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{std.name}</p>
                          <span className="text-[11px] bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.2 rounded-full font-bold">
                            {std.jamat}
                          </span>
                        </div>
                        <p className="text-xs text-red-600 dark:text-red-400 font-bold mt-0.5">
                          বকেয়া: {std.due} <span className="text-gray-400 font-normal">({std.months})</span> • রোল: {std.roll}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button 
                          onClick={() => {
                            const match = admittedStudents.find(s => s.nameBn.includes(std.name) || std.name.includes(s.nameBn));
                            if (match) {
                              setSelectedStudentId(match.studentId);
                            }
                          }}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 shadow-2xs"
                          title="এই ছাত্রের ফি ফর্মে লোড করুন"
                        >
                          <Coins size={12} className="text-amber-300" /> ফি আদায়
                        </button>
                        <button 
                          onClick={() => alert(`${std.name}-এর অভিভাবকের নম্বরে (${std.phone}) তাগাদা SMS পাঠানো হয়েছে!`)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-2 py-1.5 rounded-lg font-bold transition"
                          title="তাগাদা SMS পাঠান"
                        >
                          <Bell size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Fee Collections Summary for Selected Jamat */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-emerald-600" />
              কওমি জামাতভিত্তিক ফি আদায়ের সামারি {selectedJamat !== 'all' ? `(${activeJamatConfig?.labelBn})` : ''}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {QAWMI_JAMATS.filter(j => j.value !== 'all').map((j) => {
                const jamatTxs = transactions.filter(tx => matchesJamatFilter(tx.jamat, tx.description, j.value) && tx.type === 'income');
                const jamatTotal = jamatTxs.reduce((sum, tx) => sum + tx.amount, 0);
                const isSelected = selectedJamat === j.value;

                return (
                  <button
                    key={j.value}
                    onClick={() => setSelectedJamat(j.value)}
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected 
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 shadow-xs' 
                        : 'bg-slate-50 dark:bg-slate-700/40 border-gray-200 dark:border-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block truncate">{j.labelBn}</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                      ৳ {jamatTotal.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{jamatTxs.length} টি রশিদ</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── OFFICIAL PRINTABLE MONEY RECEIPT MODAL ─── */}
      {printedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Actions Bar (Hidden on print) */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800 flex justify-between items-center border-b dark:border-slate-700 print:hidden">
              <span className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <Receipt size={16} className="text-emerald-600" />
                অফিসিয়াল ফি আদায় মানি রসিদ
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                >
                  <Printer size={14} /> রসিদ প্রিন্ট করুন
                </button>
                <button
                  type="button"
                  onClick={() => setPrintedReceipt(null)}
                  className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* The Actual Printable Receipt Sheet */}
            <div id="printable-receipt" className="p-6 md:p-8 bg-white text-slate-900 relative overflow-hidden flex-1 overflow-y-auto print:p-0 print:overflow-visible">
              {/* Subtle Official Seal Watermark */}
              <OfficialWatermark 
                instituteName={instituteSettings.name || 'জামিয়া আরাবিয়া ইমদাদুল উলুম ফরিদাবাদ'} 
                size={260} 
                opacity="opacity-[0.07] print:opacity-[0.1]" 
              />

              {/* Receipt Header */}
              <div className="text-center border-b-2 border-emerald-800 pb-3 mb-4 relative z-10">
                <p className="text-[11px] font-semibold text-emerald-800 tracking-widest uppercase">
                  بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                </p>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  {instituteSettings.name || 'জামিয়া আরাবিয়া ইমদাদুল উলুম ফরিদাবাদ মাদ্রাসা, ঢাকা'}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {instituteSettings.address || 'ফরিদাবাদ, গেন্ডারিয়া, ঢাকা-১২০৪'} • বায়তুল মাল ও হিসাব বিভাগ
                </p>
                <div className="inline-block mt-2 bg-emerald-800 text-white px-3 py-0.5 rounded-full text-xs font-bold tracking-wide">
                  ফি আদায় মানি রসিদ (MONEY RECEIPT)
                </div>
              </div>

              {/* Meta details */}
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-4 relative z-10 border-b pb-2">
                <span>রসিদ নং: <strong className="font-mono text-slate-900">{printedReceipt.receiptNo}</strong></span>
                <span>তারিখ: <strong className="text-slate-900">{printedReceipt.date}</strong></span>
                <span>তহবিল: <strong className="text-slate-900">{printedReceipt.ledger}</strong></span>
              </div>

              {/* Student info grid */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs grid grid-cols-2 gap-2 mb-4 relative z-10">
                <div>
                  <span className="text-slate-500 block text-[10.5px]">শিক্ষার্থীর নাম:</span>
                  <span className="font-bold text-slate-900 text-sm">{printedReceipt.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10.5px]">আইডি ও রোল নং:</span>
                  <span className="font-bold font-mono text-slate-900">{printedReceipt.studentId} (রোল: {printedReceipt.roll})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10.5px]">জামাত ও সেশন:</span>
                  <span className="font-bold text-slate-900">{printedReceipt.jamat} ({printedReceipt.academicYear})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10.5px]">আবাসন ও প্রদেয় মাস:</span>
                  <span className="font-bold text-slate-900">{printedReceipt.boardingStatus} • {printedReceipt.month}</span>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-xs text-left border border-slate-300 mb-4 relative z-10">
                <thead className="bg-emerald-50 text-emerald-950 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2">ক্রম</th>
                    <th className="p-2">ফি-এর বিবরণ</th>
                    <th className="p-2 text-right">পরিমাণ (টাকা)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {printedReceipt.tuitionFee > 0 && (
                    <tr>
                      <td className="p-2 font-mono">০১</td>
                      <td className="p-2 font-semibold">ধার্যকৃত মাসিক বেতন ({printedReceipt.month})</td>
                      <td className="p-2 text-right font-mono font-bold">৳ {printedReceipt.tuitionFee.toLocaleString()}</td>
                    </tr>
                  )}
                  {printedReceipt.boardingFee > 0 && (
                    <tr>
                      <td className="p-2 font-mono">০২</td>
                      <td className="p-2 font-semibold">বোর্ডিং ও মেস চার্জ</td>
                      <td className="p-2 text-right font-mono font-bold">৳ {printedReceipt.boardingFee.toLocaleString()}</td>
                    </tr>
                  )}
                  {printedReceipt.examFee > 0 && (
                    <tr>
                      <td className="p-2 font-mono">০৩</td>
                      <td className="p-2 font-semibold">পরীক্ষা ও সেমিনার ফি</td>
                      <td className="p-2 text-right font-mono font-bold">৳ {printedReceipt.examFee.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td colSpan={2} className="p-2 text-right text-slate-900 font-bold">সর্বমোট পরিশোধিত টাকা:</td>
                    <td className="p-2 text-right font-mono font-black text-emerald-800 text-sm">
                      ৳ {printedReceipt.totalPaid.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signature Blocks */}
              <div className="grid grid-cols-2 pt-10 text-xs text-center border-t border-dashed border-slate-300 relative z-10">
                <div>
                  <div className="w-32 border-b border-slate-400 mx-auto mb-1" />
                  <span className="font-semibold text-slate-700">হিসাবরক্ষকের স্বাক্ষর</span>
                </div>
                <div>
                  <div className="w-32 border-b border-slate-400 mx-auto mb-1" />
                  <span className="font-semibold text-slate-700">মুহতামিম / অধ্যক্ষের সিল ও স্বাক্ষর</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── PRINT CSS STYLES ─── */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />

    </div>
  );
}
