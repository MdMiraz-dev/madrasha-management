'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/lib/context';
import { translations } from '@/lib/translations';
import { 
  Home, Utensils, ShoppingCart, Calculator, Plus, Trash2, 
  CheckCircle, Calendar, DollarSign, Users, Layers, ShieldCheck,
  AlertTriangle, FileText, Printer, Phone, Send, Clock, Sparkles,
  HeartPulse, Stethoscope, Award, ClipboardCheck, Lock, LogOut,
  LogIn, Bell, Search, Filter, X, ChevronRight, Check, Bed,
  Building2, UserCheck, MessageSquare, Flame, CheckCircle2,
  Coins, History, FileCheck, BadgePercent, FileSignature
} from 'lucide-react';
import OfficialWatermark from '@/components/OfficialWatermark';
import { UNIFIED_QAWMI_JAMATS } from '@/lib/qawmiJamats';

// ─── TYPES & DATA STRUCTURES ───

interface ResidentialStudent {
  id: string;
  nameBn: string;
  nameEn: string;
  studentId: string;
  roll: string;
  jamat: string;
  building: string;
  floor: string;
  roomNo: string;
  roomTitle: string;
  bedNo: string;
  bloodGroup: string;
  primaryPhone: string;
  guardianPhone: string;
  guardianName: string;
  photoUrl?: string;
  status: 'উপস্থিত' | 'ছুটিতে' | 'বাহিরে (গেটপাস)' | 'অসুস্থ';
  // খোরাকি নির্ধারণ ও সমন্বয় (Khuraki Assessment & Boarding Fee)
  khurakiTier: 'পূর্ণ পেইং' | 'আংশিক খোরাকি' | 'লিল্লাহ বোর্ডিং' | 'অন্যান্য / আদার্স';
  pledgedKhurakiFee: number; // ছাত্র/অভিভাবকের অঙ্গীকারকৃত মাসিক প্রদেয় (টাকা)
  subsidyKhurakiFee: number; // লিল্লাহ বা যাকাত তহবিল থেকে ভর্তুকি (টাকা)
  lastAdjustedDate?: string;
}

interface KhurakiAdjustmentLog {
  id: string;
  studentId: string;
  studentName: string;
  jamat: string;
  roomNo: string;
  previousTier: 'পূর্ণ পেইং' | 'আংশিক খোরাকি' | 'লিল্লাহ বোর্ডিং' | 'অন্যান্য / আদার্স';
  previousFee: number;
  newTier: 'পূর্ণ পেইং' | 'আংশিক খোরাকি' | 'লিল্লাহ বোর্ডিং' | 'অন্যান্য / আদার্স';
  newFee: number;
  subsidyFee: number;
  reason: string;
  approvedBy: string;
  date: string;
}

interface HujraRoom {
  roomNo: string;
  roomTitle: string;
  building: string;
  floor: string;
  capacity: number;
  occupied: number;
  leaderName: string;
  leaderPhone: string;
  cleanlinessScore: number; // Out of 10
}

interface GatePass {
  id: string;
  passNo: string;
  studentName: string;
  jamat: string;
  roomNo: string;
  purpose: string;
  exitTime: string;
  expectedReturn: string;
  actualReturn?: string;
  approvedBy: string;
  status: 'বাহিরে' | 'ফেরত এসেছে' | 'সময় অতিক্রান্ত';
}

interface LeaveRequest {
  id: string;
  studentName: string;
  jamat: string;
  roomNo: string;
  reason: string;
  days: number;
  startDate: string;
  endDate: string;
  guardianConsent: boolean;
  guardianPhone: string;
  status: 'অনুমোদিত' | 'বিচারাধীন' | 'বাতিল';
}

interface NightRollCall {
  id: string;
  roomNo: string;
  totalStudents: number;
  present: number;
  onLeave: number;
  sick: number;
  absent: number;
  checkedBy: string;
  time: string;
}

interface BazarItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface IllnessLog {
  id: string;
  studentName: string;
  jamat: string;
  roomNo: string;
  symptoms: string;
  date: string;
  doctorVisit: boolean;
  prescribedMedicine: string;
  guardianInformed: boolean;
  status: 'বিশ্রামে' | 'সুস্থ' | 'হাসপাতালে';
}

interface DisciplineLog {
  id: string;
  studentName: string;
  jamat: string;
  roomNo: string;
  type: 'প্রশংসা/পুরস্কার' | 'সতর্কবার্তা' | 'শৃঙ্খলাভঙ্গ';
  description: string;
  actionTaken: string;
  recordedBy: string;
  date: string;
}

interface ValuablesLog {
  id: string;
  studentName: string;
  jamat: string;
  roomNo: string;
  itemType: 'নগদ টাকা' | 'মোবাইল' | 'কাগজপত্র' | 'অন্যান্য';
  amountOrDetails: string;
  depositDate: string;
  returnDate?: string;
  receivedBy: string;
  status: 'হেফাজতে আছে' | 'ফেরত দেওয়া হয়েছে';
}

interface HostelStaff {
  id: string;
  name: string;
  role: string;
  phone: string;
  assignedBuilding: string;
  responsibilities: string;
}

interface HostelNotice {
  id: string;
  title: string;
  category: 'জরুরি' | 'সাধারণ' | 'খাবার' | 'পরিচ্ছন্নতা';
  date: string;
  content: string;
  issuedBy: string;
}

export default function BoardingMessPage() {
  const { language } = useLanguage();
  const { instituteSettings, students: centralStudents } = useApp();
  const t = translations[language as keyof typeof translations] || translations.bn;

  // Active Main Sub-Tab
  const [activeTab, setActiveTab] = useState<'accommodations' | 'movement' | 'dining' | 'khuraki' | 'discipline' | 'reports'>('accommodations');

  // ─── STATE 1: ACCOMMODATIONS ───
  const [selectedJamatFilter, setSelectedJamatFilter] = useState('all');
  const [selectedBloodFilter, setSelectedBloodFilter] = useState('all');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('all');
  const [studentSearch, setStudentSearch] = useState('');

  // Initial Residential Students
  const [students, setStudents] = useState<ResidentialStudent[]>([
    {
      id: 'std-1',
      nameBn: 'বুরহান উদ্দিন',
      nameEn: 'Burhan Uddin',
      studentId: '2026-IFT-6689',
      roll: '৬৬৮৯',
      jamat: 'ইফতা',
      building: 'দারুল আরকাম ভবন',
      floor: '১ম তলা',
      roomNo: '১০১',
      roomTitle: 'হুজরা হযরত আবু বকর (রা.)',
      bedNo: 'A-১',
      bloodGroup: 'A+',
      primaryPhone: '0172568565',
      guardianPhone: '01711223344',
      guardianName: 'মাওলানা আকমল হোসেন',
      status: 'উপস্থিত',
      khurakiTier: 'পূর্ণ পেইং',
      pledgedKhurakiFee: 3000,
      subsidyKhurakiFee: 0,
      lastAdjustedDate: '২০২৬-০৮-১৫',
    },
    {
      id: 'std-2',
      nameBn: 'মেরাজুল ইসলাম',
      nameEn: 'Merajul Islam',
      studentId: '2026-FAZ-8775',
      roll: '৮৭৭৫',
      jamat: 'মেশকাত',
      building: 'দারুল আরকাম ভবন',
      floor: '১ম তলা',
      roomNo: '১০১',
      roomTitle: 'হুজরা হযরত আবু বকর (রা.)',
      bedNo: 'A-২',
      bloodGroup: 'B+',
      primaryPhone: '01339564967',
      guardianPhone: '01819556677',
      guardianName: 'মুফতি শফিকুল ইসলাম',
      status: 'উপস্থিত',
      khurakiTier: 'পূর্ণ পেইং',
      pledgedKhurakiFee: 2800,
      subsidyKhurakiFee: 0,
      lastAdjustedDate: '২০২৬-০৮-১৫',
    },
    {
      id: 'std-3',
      nameBn: 'আব্দুল্লাহ আল মামুন',
      nameEn: 'Abdullah Al Mamun',
      studentId: '2026-MZN-104',
      roll: '১০৪',
      jamat: 'মিজান',
      building: 'দারুল আরকাম ভবন',
      floor: '১ম তলা',
      roomNo: '১০২',
      roomTitle: 'হুজরা হযরত উমর (রা.)',
      bedNo: 'B-১',
      bloodGroup: 'A+',
      primaryPhone: '01712345678',
      guardianPhone: '01912345678',
      guardianName: 'হাফেজ রফিকুল ইসলাম',
      status: 'বাহিরে (গেটপাস)',
      khurakiTier: 'আংশিক খোরাকি',
      pledgedKhurakiFee: 1500,
      subsidyKhurakiFee: 1500,
      lastAdjustedDate: '২০২৬-০৮-২০',
    },
    {
      id: 'std-4',
      nameBn: 'মুহাম্মদ সালমান',
      nameEn: 'Muhammad Salman',
      studentId: '2025-NAH-205',
      roll: '২০৫',
      jamat: 'নাহবেমীর',
      building: 'দারুল আরকাম ভবন',
      floor: '১ম তলা',
      roomNo: '১০২',
      roomTitle: 'হুজরা হযরত উমর (রা.)',
      bedNo: 'B-২',
      bloodGroup: 'O+',
      primaryPhone: '01899887766',
      guardianPhone: '01799887766',
      guardianName: 'আলহাজ্ব দেলোয়ার হোসেন',
      status: 'ছুটিতে',
      khurakiTier: 'লিল্লাহ বোর্ডিং',
      pledgedKhurakiFee: 0,
      subsidyKhurakiFee: 3000,
      lastAdjustedDate: '২০২৬-০৬-১৫',
    },
    {
      id: 'std-5',
      nameBn: 'যুবায়ের আহমেদ',
      nameEn: 'Zubayer Ahmed',
      studentId: '2026-SBK-301',
      roll: '৩০১',
      jamat: 'শরহে বেকায়া',
      building: 'দারুস সালাম ভবন',
      floor: '২য় তলা',
      roomNo: '২০১',
      roomTitle: 'হুজরা হযরত উসমান (রা.)',
      bedNo: 'C-১',
      bloodGroup: 'AB+',
      primaryPhone: '01655443322',
      guardianPhone: '01555443322',
      guardianName: 'মাওলানা কামরুল ইসলাম',
      status: 'উপস্থিত',
      khurakiTier: 'আংশিক খোরাকি',
      pledgedKhurakiFee: 1800,
      subsidyKhurakiFee: 1200,
      lastAdjustedDate: '২০২৬-০৮-১৫',
    },
    {
      id: 'std-6',
      nameBn: 'মুসআব বিন উমাইর',
      nameEn: 'Musab Bin Umair',
      studentId: '2026-DAW-401',
      roll: '৪০১',
      jamat: 'দাওরায়ে হাদিস / তাকমীল',
      building: 'দারুস সালাম ভবন',
      floor: '২য় তলা',
      roomNo: '২০১',
      roomTitle: 'হুজরা হযরত উসমান (রা.)',
      bedNo: 'C-২',
      bloodGroup: 'B+',
      primaryPhone: '01777889900',
      guardianPhone: '01888990011',
      guardianName: 'মুফতি আব্দুর রাজ্জাক',
      status: 'উপস্থিত',
      khurakiTier: 'পূর্ণ পেইং',
      pledgedKhurakiFee: 3200,
      subsidyKhurakiFee: 0,
      lastAdjustedDate: '২০২৬-০৮-১৫',
    },
    {
      id: 'std-7',
      nameBn: 'হুসাইন বিন আলী',
      nameEn: 'Hussain Bin Ali',
      studentId: '2026-HIF-501',
      roll: '৫০১',
      jamat: 'হিফজ',
      building: 'দারুস সালাম ভবন',
      floor: '২য় তলা',
      roomNo: '২০২',
      roomTitle: 'হুজরা হযরত আলী (রা.)',
      bedNo: 'D-১',
      bloodGroup: 'O+',
      primaryPhone: '01911223344',
      guardianPhone: '01922334455',
      guardianName: 'ক্বারী আব্দুল কুদ্দুস',
      status: 'অসুস্থ',
      khurakiTier: 'লিল্লাহ বোর্ডিং',
      pledgedKhurakiFee: 0,
      subsidyKhurakiFee: 3000,
      lastAdjustedDate: '২০২৬-০৭-০১',
    },
    {
      id: 'std-8',
      nameBn: 'সাঈদ বিন যায়েদ',
      nameEn: 'Sayeed Bin Zayd',
      studentId: '2026-TAY-601',
      roll: '৬০১',
      jamat: 'তাইসীর',
      building: 'দারুস সালাম ভবন',
      floor: '২য় তলা',
      roomNo: '২০২',
      roomTitle: 'হুজরা হযরত আলী (রা.)',
      bedNo: 'D-২',
      bloodGroup: 'A+',
      primaryPhone: '01744556677',
      guardianPhone: '01844556677',
      guardianName: 'মাওলানা জহিরুল ইসলাম',
      status: 'উপস্থিত',
      khurakiTier: 'আংশিক খোরাকি',
      pledgedKhurakiFee: 1400,
      subsidyKhurakiFee: 1600,
      lastAdjustedDate: '২০২৬-০৮-২৫',
    },
  ]);

  // ─── Real-Time Sync with Central Student Master Database ───
  // Residential students automatically appear in Accommodations, Khuraki, Seat Assignment, and Movement
  React.useEffect(() => {
    if (!centralStudents || centralStudents.length === 0) return;

    setStudents((prev) => {
      const existingIds = new Set(prev.map(s => s.studentId || s.id));
      const newResidential = centralStudents.filter(cs => 
        (cs.boardingStatus === 'আবাসিক' || cs.boardingStatus?.includes('আবাসিক')) &&
        !existingIds.has(cs.studentId) &&
        !existingIds.has(cs.id)
      );

      if (newResidential.length === 0) return prev;

      const converted: ResidentialStudent[] = newResidential.map((cs) => ({
        id: cs.id || `res-${cs.studentId}`,
        nameBn: cs.nameBn || cs.nameEn || 'নতুন শিক্ষার্থী',
        nameEn: cs.nameEn || '',
        studentId: cs.studentId,
        roll: cs.roll || '—',
        jamat: cs.class || 'নূরানী',
        building: 'হোস্টেল বরাদ্দ বাকি',
        floor: '—',
        roomNo: 'সিট বরাদ্দ বাকি (Unassigned)',
        roomTitle: 'সিট বরাদ্দ বাকি (Unassigned)',
        bedNo: 'বরাদ্দ বাকি',
        bloodGroup: cs.bloodGroup || 'A+',
        primaryPhone: cs.primaryPhone || '—',
        guardianPhone: cs.primaryPhone || '—',
        guardianName: cs.fatherName || 'অভিভাবক',
        status: 'উপস্থিত',
        khurakiTier: (cs.khurakiTier as any) || 'পূর্ণ পেইং',
        pledgedKhurakiFee: cs.pledgedKhurakiFee ?? cs.boardingFee ?? 3000,
        subsidyKhurakiFee: cs.subsidyKhurakiFee ?? 0,
        lastAdjustedDate: new Date().toISOString().split('T')[0],
      }));

      return [...prev, ...converted];
    });
  }, [centralStudents]);

  // ─── STATE: KHURAKI ASSESSMENT & BOARDING FEE ───
  const [selectedKhurakiTierFilter, setSelectedKhurakiTierFilter] = useState<'all' | 'পূর্ণ পেইং' | 'আংশিক খোরাকি' | 'লিল্লাহ বোর্ডিং' | 'অন্যান্য / আদার্স'>('all');
  const [khurakiSearch, setKhurakiSearch] = useState('');
  const [showAdjustKhurakiModal, setShowAdjustKhurakiModal] = useState(false);
  const [studentToAdjust, setStudentToAdjust] = useState<ResidentialStudent | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    newTier: 'আংশিক খোরাকি' as 'পূর্ণ পেইং' | 'আংশিক খোরাকি' | 'লিল্লাহ বোর্ডিং' | 'অন্যান্য / আদার্স',
    newFee: 1500,
    customAmount: 0,
    reason: 'পারিবারিক অসচ্ছলতা',
    customReason: '',
    approvedBy: 'মুহতামিম সাহেব',
    effectiveDate: '২০২৬-০৯-২২',
  });

  const [showPrintPledgeModal, setShowPrintPledgeModal] = useState(false);
  const [studentToPrintPledge, setStudentToPrintPledge] = useState<ResidentialStudent | null>(null);

  // ─── STATE: NEW KHURAKI ASSIGNMENT MODAL ───
  const [showNewKhurakiModal, setShowNewKhurakiModal] = useState(false);
  const BASE_KHURAKI_STANDARD = 3000; // standard full paying cost
  const [newKhurakiForm, setNewKhurakiForm] = useState({
    selectedStudentId: '',
    roomNo: '১০১',
    bedNo: 'A-১',
    khurakiTier: 'পূর্ণ পেইং' as 'পূর্ণ পেইং' | 'আংশিক খোরাকি' | 'লিল্লাহ বোর্ডিং' | 'অন্যান্য / আদার্স',
    customAmount: 0,
    pledgedFee: 3000,
    reason: 'নতুন ভর্তি',
    approvedBy: 'মুহতামিম সাহেব',
    effectiveDate: new Date().toISOString().split('T')[0],
  });

  // Khuraki Adjustment Audit Logs (মাঝে মাঝে ফি পরিবর্তনের হিস্ট্রি)
  const [khurakiAdjustmentLogs, setKhurakiAdjustmentLogs] = useState<KhurakiAdjustmentLog[]>([
    {
      id: 'kh-log-1',
      studentId: '2026-MZN-104',
      studentName: 'আব্দুল্লাহ আল মামুন',
      jamat: 'মিজান',
      roomNo: '১০২',
      previousTier: 'পূর্ণ পেইং',
      previousFee: 3000,
      newTier: 'আংশিক খোরাকি',
      newFee: 1500,
      subsidyFee: 1500,
      reason: 'পারিবারিক অসচ্ছলতা ও পিতার অসুস্থতা',
      approvedBy: 'মুহতামিম সাহেব',
      date: '২০২৬-০৮-২০',
    },
    {
      id: 'kh-log-2',
      studentId: '2026-HIF-501',
      studentName: 'হুসাইন বিন আলী',
      jamat: 'হিফজ',
      roomNo: '২০২',
      previousTier: 'আংশিক খোরাকি',
      previousFee: 1500,
      newTier: 'লিল্লাহ বোর্ডিং',
      newFee: 0,
      subsidyFee: 3000,
      reason: 'পিতৃহীন এতিম ও হেফজ বিভাগের বিশেষ মেধা বৃত্তি',
      approvedBy: 'মুহতামিম সাহেব',
      date: '২০২৬-০৭-০১',
    },
    {
      id: 'kh-log-3',
      studentId: '2025-NAH-205',
      studentName: 'মুহাম্মদ সালমান',
      jamat: 'নাহবেমীর',
      roomNo: '১০২',
      previousTier: 'পূর্ণ পেইং',
      previousFee: 3000,
      newTier: 'লিল্লাহ বোর্ডিং',
      newFee: 0,
      subsidyFee: 3000,
      reason: 'যাকাত ও লিল্লাহ ফান্ড বিশেষ অনুদান কমিটি অনুমোদন',
      approvedBy: 'নাজেমে তালিমাত',
      date: '২০২৬-০৬-১৫',
    },
    {
      id: 'kh-log-4',
      studentId: '2026-TAY-601',
      studentName: 'সাঈদ বিন যায়েদ',
      jamat: 'তাইসীর',
      roomNo: '২০২',
      previousTier: 'পূর্ণ পেইং',
      previousFee: 3000,
      newTier: 'আংশিক খোরাকি',
      newFee: 1400,
      subsidyFee: 1600,
      reason: 'অভিভাবকের কৃষিকাজে আর্থিক সংকট আবেদন',
      approvedBy: 'মুহতামিম সাহেব',
      date: '২০২৬-০৮-২৫',
    },
  ]);

  // Hujra Rooms Data
  const [rooms, setRooms] = useState<HujraRoom[]>([
    {
      roomNo: '১০১',
      roomTitle: 'হুজরা হযরত আবু বকর (রা.)',
      building: 'দারুল আরকাম ভবন',
      floor: '১ম তলা',
      capacity: 8,
      occupied: 7,
      leaderName: 'বুরহান উদ্দিন (ইফতা)',
      leaderPhone: '0172568565',
      cleanlinessScore: 9.8,
    },
    {
      roomNo: '১০২',
      roomTitle: 'হুজরা হযরত উমর (রা.)',
      building: 'দারুল আরকাম ভবন',
      floor: '১ম তলা',
      capacity: 8,
      occupied: 8,
      leaderName: 'আব্দুল্লাহ মামুন (মিজান)',
      leaderPhone: '01712345678',
      cleanlinessScore: 9.2,
    },
    {
      roomNo: '২০১',
      roomTitle: 'হুজরা হযরত উসমান (রা.)',
      building: 'দারুস সালাম ভবন',
      floor: '২য় তলা',
      capacity: 10,
      occupied: 9,
      leaderName: 'মুসআব বিন উমাইর (দাওরা)',
      leaderPhone: '01777889900',
      cleanlinessScore: 9.5,
    },
    {
      roomNo: '২০২',
      roomTitle: 'হুজরা হযরত আলী (রা.)',
      building: 'দারুস সালাম ভবন',
      floor: '২য় তলা',
      capacity: 10,
      occupied: 6,
      leaderName: 'হুসাইন বিন আলী (হিফজ)',
      leaderPhone: '01911223344',
      cleanlinessScore: 8.9,
    },
  ]);

  // Selected Room for Seat Matrix inspection
  const [activeMatrixRoom, setActiveMatrixRoom] = useState<string>('১০১');

  // ─── STATE 2: MOVEMENT & LEAVE ───
  const [gatePasses, setGatePasses] = useState<GatePass[]>([
    {
      id: 'gp-1',
      passNo: 'GP-8841',
      studentName: 'আব্দুল্লাহ আল মামুন',
      jamat: 'মিজান',
      roomNo: '১০২',
      purpose: 'জরুরি কিতাব ও ঔষধ ক্রয়',
      exitTime: 'বিকাল ০৪:৩০',
      expectedReturn: 'সন্ধ্যা ০৬:০০',
      approvedBy: 'মাওলানা নোমান হাবিব',
      status: 'বাহিরে',
    },
    {
      id: 'gp-2',
      passNo: 'GP-8840',
      studentName: 'বুরহান উদ্দিন',
      jamat: 'ইফতা',
      roomNo: '১০১',
      purpose: 'ফতোয়া রিসার্চ লাইব্রেরি ভিজিট',
      exitTime: 'সকাল ১০:০০',
      expectedReturn: 'দুপুর ০১:০০',
      actualReturn: 'দুপুর ১২:৪৫',
      approvedBy: 'মুফতি আব্দুর রাজ্জাক',
      status: 'ফেরত এসেছে',
    },
    {
      id: 'gp-3',
      passNo: 'GP-8839',
      studentName: 'সাঈদ বিন যায়েদ',
      jamat: 'তাইসীর',
      roomNo: '২০২',
      purpose: 'অভিভাবকের সাথে জরুরি সাক্ষাৎ',
      exitTime: 'সকাল ১১:০০',
      expectedReturn: 'দুপুর ১২:০০',
      actualReturn: 'দুপুর ১২:১০',
      approvedBy: 'মাওলানা কামরুল ইসলাম',
      status: 'ফেরত এসেছে',
    },
  ]);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: 'lv-1',
      studentName: 'মুহাম্মদ সালমান',
      jamat: 'নাহবেমীর',
      roomNo: '১০২',
      reason: 'বড় বোনের বিবাহ উপলক্ষে ছুটি',
      days: 3,
      startDate: '২০২৬-০৯-২০',
      endDate: '২০২৬-০৯-২৩',
      guardianConsent: true,
      guardianPhone: '01799887766',
      status: 'অনুমোদিত',
    },
    {
      id: 'lv-2',
      studentName: 'হুসাইন বিন আলী',
      jamat: 'হিফজ',
      roomNo: '২০২',
      reason: 'হঠাৎ তীব্র জ্বর ও রক্ত পরীক্ষা',
      days: 2,
      startDate: '২০২৬-০৯-২২',
      endDate: '২০২৬-০৯-২৪',
      guardianConsent: true,
      guardianPhone: '01922334455',
      status: 'অনুমোদিত',
    },
  ]);

  const [nightRollCalls, setNightRollCalls] = useState<NightRollCall[]>([
    { id: 'nrc-1', roomNo: '১০১', totalStudents: 7, present: 7, onLeave: 0, sick: 0, absent: 0, checkedBy: 'মাওলানা মাহমুদ হাসান', time: 'রাত ১০:১৫' },
    { id: 'nrc-2', roomNo: '১০২', totalStudents: 8, present: 6, onLeave: 1, sick: 0, absent: 1, checkedBy: 'মাওলানা মাহমুদ হাসান', time: 'রাত ১০:২২' },
    { id: 'nrc-3', roomNo: '২০১', totalStudents: 9, present: 9, onLeave: 0, sick: 0, absent: 0, checkedBy: 'মাওলানা নোমান হাবিব', time: 'রাত ১০:৩০' },
    { id: 'nrc-4', roomNo: '২০২', totalStudents: 6, present: 5, onLeave: 0, sick: 1, absent: 0, checkedBy: 'মাওলানা নোমান হাবিব', time: 'রাত ১০:৩৫' },
  ]);

  // Modal states for Movement
  const [showGatePassModal, setShowGatePassModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const [newGatePass, setNewGatePass] = useState({
    studentName: 'বুরহান উদ্দিন',
    jamat: 'ইফতা',
    roomNo: '১০১',
    purpose: '',
    exitTime: 'বিকাল ০৪:৪৫',
    expectedReturn: 'সন্ধ্যা ০৬:১৫',
    approvedBy: 'মাওলানা নোমান হাবিব'
  });

  const [newLeave, setNewLeave] = useState({
    studentName: 'বুরহান উদ্দিন',
    jamat: 'ইফতা',
    roomNo: '১০১',
    reason: '',
    days: 2,
    startDate: '২০২৬-০৯-২৩',
    endDate: '২০২৬-০৯-২৫',
    guardianConsent: true,
    guardianPhone: '01711223344'
  });

  // ─── STATE 3: DINING & HEALTH ───
  const [mealDate, setMealDate] = useState('২০২৬-০৯-২২');
  const [payingMeals, setPayingMeals] = useState({ breakfast: 145, lunch: 160, dinner: 155 });
  const [lillahMeals, setLillahMeals] = useState({ breakfast: 50, lunch: 55, dinner: 52 });

  const [bazarItems, setBazarItems] = useState<BazarItem[]>([
    { id: '1', name: 'মিনিকেট চাল', category: 'চাল/আটা', quantity: 75, unit: 'কেজি', unitPrice: 70, total: 5250 },
    { id: '2', name: 'মসুর ডাল', category: 'ডাল', quantity: 12, unit: 'কেজি', unitPrice: 130, total: 1560 },
    { id: '3', name: 'সয়াবিন তেল', category: 'তেল/মসলা', quantity: 10, unit: 'লিটার', unitPrice: 185, total: 1850 },
    { id: '4', name: 'ব্রয়লার মুরগি (গোশত)', category: 'মাছ/গোশত', quantity: 35, unit: 'কেজি', unitPrice: 200, total: 7000 },
    { id: '5', name: 'আলু ও পেঁয়াজ', category: 'সবজি', quantity: 30, unit: 'কেজি', unitPrice: 45, total: 1350 },
    { id: '6', name: 'রান্নার লাকড়ি/গ্যাস', category: 'জ্বালানি', quantity: 1, unit: 'সিলিন্ডার', unitPrice: 1450, total: 1450 },
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('চাল/আটা');
  const [newItemQty, setNewItemQty] = useState<number | ''>('');
  const [newItemUnit, setNewItemUnit] = useState('কেজি');
  const [newItemPrice, setNewItemPrice] = useState<number | ''>('');

  const [illnessLogs, setIllnessLogs] = useState<IllnessLog[]>([
    {
      id: 'med-1',
      studentName: 'হুসাইন বিন আলী',
      jamat: 'হিফজ',
      roomNo: '২০২',
      symptoms: 'মৌসুমি সর্দি ও জ্বর (১০১°F)',
      date: '২০২৬-০৯-২২',
      doctorVisit: true,
      prescribedMedicine: 'প্যারাসিটামল ৫০০ মি.গ্রা. + হিস্টাসিন',
      guardianInformed: true,
      status: 'বিশ্রামে',
    },
    {
      id: 'med-2',
      studentName: 'মেরাজুল ইসলাম',
      jamat: 'মেশকাত',
      roomNo: '১০১',
      symptoms: 'গ্যাস্ট্রিক ও পেটের ব্যথা',
      date: '২০২৬-০৯-২১',
      doctorVisit: false,
      prescribedMedicine: 'এন্টাসিড ট্যাবলেট ও ওআরএস স্যালাইন',
      guardianInformed: true,
      status: 'সুস্থ',
    },
  ]);

  const [showAddIllnessModal, setShowAddIllnessModal] = useState(false);
  const [newIllness, setNewIllness] = useState({
    studentName: 'বুরহান উদ্দিন',
    jamat: 'ইফতা',
    roomNo: '১০১',
    symptoms: '',
    prescribedMedicine: '',
    doctorVisit: true,
    guardianInformed: true,
  });

  // ─── STATE 4: DISCIPLINE & CARE ───
  const [disciplineLogs, setDisciplineLogs] = useState<DisciplineLog[]>([
    {
      id: 'disc-1',
      studentName: 'বুরহান উদ্দিন',
      jamat: 'ইফতা',
      roomNo: '১০১',
      type: 'প্রশংসা/পুরস্কার',
      description: 'হুজরার সকল সহপাঠীকে নিয়ে তাহাজ্জুদে নিয়মিত উদ্বুদ্ধকরণ',
      actionTaken: 'দারুল ইকামাহ থেকে বিশেষ পুরস্কার ও সম্মাননা',
      recordedBy: 'মাওলানা নোমান হাবিব',
      date: '২০২৬-০৯-২১',
    },
    {
      id: 'disc-2',
      studentName: 'আব্দুল্লাহ আল মামুন',
      jamat: 'মিজান',
      roomNo: '১০২',
      type: 'সতর্কবার্তা',
      description: 'রাত ১০:৩০ এর পর মোবাইল ফোনে কথা বলা',
      actionTaken: 'মৌখিক সতর্কবার্তা ও অভিভাবককে অবহিতকরণ',
      recordedBy: 'মাওলানা মাহমুদ হাসান',
      date: '২০২৬-০৯-১৯',
    },
  ]);

  const [valuablesLogs, setValuablesLogs] = useState<ValuablesLog[]>([
    {
      id: 'val-1',
      studentName: 'বুরহান উদ্দিন',
      jamat: 'ইফতা',
      roomNo: '১০১',
      itemType: 'নগদ টাকা',
      amountOrDetails: '৳ ৫,০০০ (মাসিক খরচের টাকা)',
      depositDate: '২০২৬-০৯-১৫',
      receivedBy: 'মাওলানা কামরুল ইসলাম (হিসাবরক্ষক)',
      status: 'হেফাজতে আছে',
    },
    {
      id: 'val-2',
      studentName: 'মুহাম্মদ সালমান',
      jamat: 'নাহবেমীর',
      roomNo: '১০২',
      itemType: 'কাগজপত্র',
      amountOrDetails: 'মূল দাখিল সনদ ও জন্ম নিবন্ধন ফটোকপি',
      depositDate: '২০২৬-০৯-১০',
      receivedBy: 'মাওলানা নোমান হাবিব',
      status: 'হেফাজতে আছে',
    },
  ]);

  const [hostelStaff, setHostelStaff] = useState<HostelStaff[]>([
    {
      id: 'st-1',
      name: 'মাওলানা নোমান হাবিব',
      role: 'নাজেমে দারুল ইকামাহ (প্রধান হোস্টেল সুপার)',
      phone: '01712000001',
      assignedBuilding: 'সকল ভবন',
      responsibilities: 'সামগ্রিক শৃঙ্খলা, রাতের হাজিরা ও ছাত্র কল্যাণ',
    },
    {
      id: 'st-2',
      name: 'মাওলানা মাহমুদ হাসান',
      role: 'সহকারী হোস্টেল তত্ত্বাবধায়ক',
      phone: '01812000002',
      assignedBuilding: 'দারুল আরকাম ভবন',
      responsibilities: '১ম ও ২য় তলার তদারকি ও চিকিৎসা সমন্বয়',
    },
    {
      id: 'st-3',
      name: 'কারী রফিকুল ইসলাম',
      role: 'সহকারী তত্ত্বাবধায়ক ও পরিচ্ছন্নতা ইনচার্জ',
      phone: '01912000003',
      assignedBuilding: 'দারুস সালাম ভবন',
      responsibilities: 'হুজরা পরিচ্ছন্নতা ও রাতের পাহারা সমন্বয়',
    },
    {
      id: 'st-4',
      name: 'জনাব বশির উদ্দিন',
      role: 'প্রধান বাবুর্চি ও মেস ইনচার্জ',
      phone: '01612000004',
      assignedBuilding: 'কেন্দ্রীয় মেস ও পাকশালা',
      responsibilities: 'দৈনিক বাজার, রান্না ও খাবার পরিবেশন',
    },
  ]);

  // ─── STATE 5: NOTICES & REPORTS ───
  const [notices, setNotices] = useState<HostelNotice[]>([
    {
      id: 'not-1',
      title: 'রাতের হাজিরা ও লাইট অফের সময়সূচি কঠোরভাবে অনুসরণ',
      category: 'জরুরি',
      date: '২০২৬-০৯-২২',
      content: 'সকল আবাসিক ছাত্রদের অবগতির জন্য জানানো যাচ্ছে যে, রাত ১০:০০ টায় অবশ্যই নিজ নিজ হুজরায় উপস্থিত থাকতে হবে এবং ১০:১৫ এর মধ্যে লাইট অফ করে বিশ্রামে যেতে হবে। অহেতুক ঘোরাফেরা সম্পূর্ণ নিষিদ্ধ।',
      issuedBy: 'নাজেমে দারুল ইকামাহ',
    },
    {
      id: 'not-2',
      title: 'আগামী শুক্রবার সাপ্তাহিক হুজরা পরিচ্ছন্নতা অভিযান',
      category: 'পরিচ্ছন্নতা',
      date: '২০২৬-০৯-২১',
      content: 'আসন্ন জুমার নামাজের পর সকল হুজরার মেঝে, বিছানা ও আশপাশ পরিষ্কার করা হবে। পরিচ্ছন্নতায় সর্বোচ্চ নম্বরপ্রাপ্ত হুজরাকে মাসিক মেস বিলে বিশেষ ছাড় ও পুরস্কার দেওয়া হবে।',
      issuedBy: 'পরিচ্ছন্নতা কমিটি',
    },
  ]);

  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<'জরুরি' | 'সাধারণ' | 'খাবার' | 'পরিচ্ছন্নতা'>('সাধারণ');
  const [newNoticeContent, setNewNoticeContent] = useState('');

  // Calculations for Dining / Meal
  const totalBazarExpenseToday = bazarItems.reduce((sum, item) => sum + item.total, 0);
  const totalPayingMealsToday = payingMeals.breakfast + payingMeals.lunch + payingMeals.dinner;
  const totalLillahMealsToday = lillahMeals.breakfast + lillahMeals.lunch + lillahMeals.dinner;
  const totalMealsServedToday = totalPayingMealsToday + totalLillahMealsToday;
  const todayMealRate = totalMealsServedToday > 0 ? (totalBazarExpenseToday / totalMealsServedToday).toFixed(2) : '0.00';

  // Calculations for Accommodations
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const totalOccupied = rooms.reduce((sum, r) => sum + r.occupied, 0);
  const totalVacant = totalCapacity - totalOccupied;
  const occupancyPercentage = Math.round((totalOccupied / totalCapacity) * 100);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchJamat = selectedJamatFilter === 'all' || s.jamat.includes(selectedJamatFilter) || selectedJamatFilter.includes(s.jamat);
      const matchBlood = selectedBloodFilter === 'all' || s.bloodGroup === selectedBloodFilter;
      const matchRoom = selectedRoomFilter === 'all' || s.roomNo === selectedRoomFilter;
      const searchLower = studentSearch.toLowerCase().trim();
      const matchSearch = !searchLower || (
        s.nameBn.includes(studentSearch) ||
        s.nameEn.toLowerCase().includes(searchLower) ||
        s.roll.includes(studentSearch) ||
        s.studentId.toLowerCase().includes(searchLower)
      );
      return matchJamat && matchBlood && matchRoom && matchSearch;
    });
  }, [students, selectedJamatFilter, selectedBloodFilter, selectedRoomFilter, studentSearch]);

  // ─── CALCULATIONS FOR KHURAKI ASSESSMENT ───
  const khurakiStats = useMemo(() => {
    const totalResidential = students.length;
    const fullPayingStudents = students.filter(s => s.khurakiTier === 'পূর্ণ পেইং');
    const subsidizedStudents = students.filter(s => s.khurakiTier === 'আংশিক খোরাকি');
    const freeStudents = students.filter(s => s.khurakiTier === 'লিল্লাহ বোর্ডিং');

    const totalPledgedCollection = students.reduce((sum, s) => sum + (s.pledgedKhurakiFee || 0), 0);
    const totalSubsidyFromLillah = students.reduce((sum, s) => sum + (s.subsidyKhurakiFee || 0), 0);
    const totalEstimatedKhuraki = totalPledgedCollection + totalSubsidyFromLillah;

    return {
      totalResidential,
      fullPayingCount: fullPayingStudents.length,
      fullPayingSum: fullPayingStudents.reduce((sum, s) => sum + (s.pledgedKhurakiFee || 0), 0),
      subsidizedCount: subsidizedStudents.length,
      subsidizedPledgedSum: subsidizedStudents.reduce((sum, s) => sum + (s.pledgedKhurakiFee || 0), 0),
      subsidizedSubsidySum: subsidizedStudents.reduce((sum, s) => sum + (s.subsidyKhurakiFee || 0), 0),
      freeCount: freeStudents.length,
      freeSubsidySum: freeStudents.reduce((sum, s) => sum + (s.subsidyKhurakiFee || 0), 0),
      totalPledgedCollection,
      totalSubsidyFromLillah,
      totalEstimatedKhuraki,
    };
  }, [students]);

  // Helper: Convert Bengali numeral string to integer for sorting
  const bengaliToInt = (bn: string): number => {
    const bnDigits: Record<string, string> = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
    return parseInt(bn.replace(/[০-৯]/g, d => bnDigits[d] || d) || '0', 10) || 0;
  };

  // Filtered & Sorted Students for Khuraki Tab (sorted by Admission Roll ascending)
  const filteredKhurakiStudents = useMemo(() => {
    return students.filter((s) => {
      const matchTier = selectedKhurakiTierFilter === 'all' || s.khurakiTier === selectedKhurakiTierFilter;
      const searchLower = khurakiSearch.toLowerCase().trim();
      const matchSearch = !searchLower || (
        s.nameBn.includes(khurakiSearch) ||
        s.nameEn.toLowerCase().includes(searchLower) ||
        s.roll.includes(khurakiSearch) ||
        s.studentId.toLowerCase().includes(searchLower) ||
        s.jamat.includes(khurakiSearch) ||
        s.roomNo.includes(khurakiSearch)
      );
      return matchTier && matchSearch;
    }).sort((a, b) => bengaliToInt(a.roll) - bengaliToInt(b.roll));
  }, [students, selectedKhurakiTierFilter, khurakiSearch]);

  // Handler: Save New Khuraki Assessment (new student assignment)
  const handleSaveNewKhurakiAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const { selectedStudentId, khurakiTier, customAmount, pledgedFee, roomNo, bedNo, reason, approvedBy, effectiveDate } = newKhurakiForm;
    if (!selectedStudentId) {
      alert('অনুগ্রহ করে একজন শিক্ষার্থী নির্বাচন করুন।');
      return;
    }
    const actualPledged = khurakiTier === 'লিল্লাহ বোর্ডিং' ? 0
      : khurakiTier === 'পূর্ণ পেইং' ? BASE_KHURAKI_STANDARD
      : khurakiTier === 'অন্যান্য / আদার্স' ? customAmount
      : pledgedFee;
    const actualSubsidy = Math.max(0, BASE_KHURAKI_STANDARD - actualPledged);

    // Find the selected student's room title from rooms list
    const selectedRoom = rooms.find(r => r.roomNo === roomNo);

    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudentId) {
        return {
          ...s,
          khurakiTier,
          pledgedKhurakiFee: actualPledged,
          subsidyKhurakiFee: actualSubsidy,
          roomNo,
          bedNo,
          roomTitle: selectedRoom?.roomTitle || s.roomTitle,
          lastAdjustedDate: effectiveDate,
        };
      }
      return s;
    }));

    // Add audit log entry
    const student = students.find(s => s.id === selectedStudentId);
    if (student) {
      const log: KhurakiAdjustmentLog = {
        id: `kh-adj-${Date.now()}`,
        studentId: student.studentId,
        studentName: student.nameBn,
        jamat: student.jamat,
        roomNo,
        previousTier: student.khurakiTier,
        previousFee: student.pledgedKhurakiFee,
        newTier: khurakiTier,
        newFee: actualPledged,
        subsidyFee: actualSubsidy,
        reason,
        approvedBy,
        date: effectiveDate,
      };
      setKhurakiAdjustmentLogs(prev => [log, ...prev]);
    }

    setShowNewKhurakiModal(false);
    // Reset form
    setNewKhurakiForm({
      selectedStudentId: '',
      roomNo: '১০১',
      bedNo: 'A-১',
      khurakiTier: 'পূর্ণ পেইং',
      customAmount: 0,
      pledgedFee: 3000,
      reason: 'নতুন ভর্তি',
      approvedBy: 'মুহতামিম সাহেব',
      effectiveDate: new Date().toISOString().split('T')[0],
    });
    alert('খোরাকি নির্ধারণ সফলভাবে সংরক্ষিত হয়েছে!');
  };

  // Handlers for Khuraki Adjustment
  const handleOpenAdjustModal = (student: ResidentialStudent) => {
    setStudentToAdjust(student);
    setAdjustForm({
      newTier: student.khurakiTier,
      newFee: student.pledgedKhurakiFee,
      customAmount: student.khurakiTier === 'অন্যান্য / আদার্স' ? student.pledgedKhurakiFee : 0,
      reason: 'পারিবারিক অসচ্ছলতা',
      customReason: '',
      approvedBy: 'মুহতামিম সাহেব',
      effectiveDate: new Date().toISOString().split('T')[0],
    });
    setShowAdjustKhurakiModal(true);
  };

  const handleSaveKhurakiAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToAdjust) return;

    const baseKhurakiStandard = BASE_KHURAKI_STANDARD;
    const pledgedFee = adjustForm.newTier === 'লিল্লাহ বোর্ডিং' ? 0
      : adjustForm.newTier === 'পূর্ণ পেইং' ? baseKhurakiStandard
      : adjustForm.newTier === 'অন্যান্য / আদার্স' ? Number(adjustForm.customAmount)
      : Number(adjustForm.newFee);
    const subsidyFee = Math.max(0, baseKhurakiStandard - pledgedFee);
    const actualReason = adjustForm.reason === 'অন্যান্য' && adjustForm.customReason.trim()
      ? adjustForm.customReason.trim()
      : adjustForm.reason;

    // Create Audit Log
    const newLog: KhurakiAdjustmentLog = {
      id: `kh-adj-${Date.now()}`,
      studentId: studentToAdjust.studentId,
      studentName: studentToAdjust.nameBn,
      jamat: studentToAdjust.jamat,
      roomNo: studentToAdjust.roomNo,
      previousTier: studentToAdjust.khurakiTier,
      previousFee: studentToAdjust.pledgedKhurakiFee,
      newTier: adjustForm.newTier,
      newFee: pledgedFee,
      subsidyFee,
      reason: actualReason,
      approvedBy: adjustForm.approvedBy || 'মুহতামিম সাহেব',
      date: adjustForm.effectiveDate,
    };

    // Update students state
    setStudents(students.map(s => {
      if (s.id === studentToAdjust.id) {
        return {
          ...s,
          khurakiTier: adjustForm.newTier,
          pledgedKhurakiFee: pledgedFee,
          subsidyKhurakiFee: subsidyFee,
          lastAdjustedDate: adjustForm.effectiveDate,
        };
      }
      return s;
    }));

    setKhurakiAdjustmentLogs([newLog, ...khurakiAdjustmentLogs]);
    setShowAdjustKhurakiModal(false);
    alert(`${studentToAdjust.nameBn} এর খোরাকি ফি সফলভাবে সমন্বয় ও বাইতুল মালে আপডেট করা হয়েছে!`);
  };

  // Handlers for Khuraki Pledge Print
  const handleOpenPrintPledge = (student: ResidentialStudent) => {
    setStudentToPrintPledge(student);
    setShowPrintPledgeModal(true);
  };

  // Handlers for Bazar
  const handleAddBazarItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemQty || !newItemPrice) return;
    const total = Number(newItemQty) * Number(newItemPrice);
    const item: BazarItem = {
      id: String(Date.now()),
      name: newItemName,
      category: newItemCategory,
      quantity: Number(newItemQty),
      unit: newItemUnit,
      unitPrice: Number(newItemPrice),
      total,
    };
    setBazarItems([...bazarItems, item]);
    setNewItemName('');
    setNewItemQty('');
    setNewItemPrice('');
  };

  // Handlers for GatePass
  const handleAddGatePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGatePass.purpose) {
      alert('দয়া করে গমনের কারণ লিখুন');
      return;
    }
    const gp: GatePass = {
      id: `gp-${Date.now()}`,
      passNo: `GP-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: newGatePass.studentName,
      jamat: newGatePass.jamat,
      roomNo: newGatePass.roomNo,
      purpose: newGatePass.purpose,
      exitTime: newGatePass.exitTime,
      expectedReturn: newGatePass.expectedReturn,
      approvedBy: newGatePass.approvedBy,
      status: 'বাহিরে',
    };
    setGatePasses([gp, ...gatePasses]);
    setShowGatePassModal(false);
    setNewGatePass({ ...newGatePass, purpose: '' });
  };

  const handleReturnGatePass = (id: string) => {
    setGatePasses(gatePasses.map(gp => {
      if (gp.id === id) {
        return { ...gp, status: 'ফেরত এসেছে', actualReturn: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) };
      }
      return gp;
    }));
  };

  // Handlers for Leave
  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.reason) {
      alert('দয়া করে ছুটির কারণ লিখুন');
      return;
    }
    const lv: LeaveRequest = {
      id: `lv-${Date.now()}`,
      studentName: newLeave.studentName,
      jamat: newLeave.jamat,
      roomNo: newLeave.roomNo,
      reason: newLeave.reason,
      days: Number(newLeave.days),
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      guardianConsent: newLeave.guardianConsent,
      guardianPhone: newLeave.guardianPhone,
      status: 'অনুমোদিত',
    };
    setLeaveRequests([lv, ...leaveRequests]);
    setShowLeaveModal(false);
    setNewLeave({ ...newLeave, reason: '' });
  };

  // Handlers for Illness
  const handleAddIllness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIllness.symptoms) {
      alert('দয়া করে অসুস্থতার লক্ষণ লিখুন');
      return;
    }
    const med: IllnessLog = {
      id: `med-${Date.now()}`,
      studentName: newIllness.studentName,
      jamat: newIllness.jamat,
      roomNo: newIllness.roomNo,
      symptoms: newIllness.symptoms,
      date: new Date().toISOString().split('T')[0],
      doctorVisit: newIllness.doctorVisit,
      prescribedMedicine: newIllness.prescribedMedicine || 'বিশ্রাম ও পথ্য',
      guardianInformed: newIllness.guardianInformed,
      status: 'বিশ্রামে',
    };
    setIllnessLogs([med, ...illnessLogs]);
    setShowAddIllnessModal(false);
    setNewIllness({ ...newIllness, symptoms: '', prescribedMedicine: '' });
  };

  // Handlers for Notices
  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) return;
    const n: HostelNotice = {
      id: `not-${Date.now()}`,
      title: newNoticeTitle,
      category: newNoticeCategory,
      date: '২০২৬-০৯-২২',
      content: newNoticeContent,
      issuedBy: 'দারুল ইকামাহ প্রশাসন',
    };
    setNotices([n, ...notices]);
    setNewNoticeTitle('');
    setNewNoticeContent('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* ─── HEADER WITH BRANDING & SUB-TABS ─── */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-xl">
              <Building2 size={24} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                দারুল ইকামাহ ও বোর্ডিং ব্যবস্থাপনা
                <span className="text-xs bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                  খোরাকি নির্ধারণ ও মেস সমন্বয় সহ পূর্ণাঙ্গ সিস্টেম
                </span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                কওমি মাদ্রাসার আবাসিক হোস্টেল, খোরাকি নির্ধারণ ও পরিবর্তন, ডিজিটাল গেটপাস, হুজরা বণ্টন ও মেস ব্যবস্থাপনা
              </p>
            </div>
          </div>
        </div>

        {/* 6 SUB-TABS NAVIGATION */}
        <div className="flex flex-wrap bg-slate-100 dark:bg-slate-700/60 p-1.5 rounded-xl gap-1 border border-slate-200 dark:border-slate-600">
          <button
            onClick={() => setActiveTab('accommodations')}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'accommodations'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            <Bed size={15} />
            <span>১. আবাসন ও সিট</span>
          </button>

          <button
            onClick={() => setActiveTab('movement')}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'movement'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            <Clock size={15} />
            <span>২. চলাচল ও ছুটি</span>
          </button>

          <button
            onClick={() => setActiveTab('dining')}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'dining'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            <Utensils size={15} />
            <span>৩. খাবার ও চিকিৎসা</span>
          </button>

          <button
            onClick={() => setActiveTab('khuraki')}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'khuraki'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            <Coins size={15} />
            <span>৪. খোরাকি ও ফি নির্ধারণ</span>
          </button>

          <button
            onClick={() => setActiveTab('discipline')}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'discipline'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            <ShieldCheck size={15} />
            <span>৫. শৃঙ্খলা ও তত্ত্বাবধান</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            <Bell size={15} />
            <span>৬. নোটিশ ও রিপোর্ট</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TAB 1: 🛏️ আবাসন ও সিট (ACCOMMODATIONS & SEAT MATRIX)
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'accommodations' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* 1. ড্যাশবোর্ড মেট্রিক্স (4 Key Stats) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-xs">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-bold block">মোট আবাসিক ছাত্র</span>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{totalOccupied} জন</p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <Users size={13} />
                <span>সকল হুজরায় বরাদ্দকৃত</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-xs">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-bold block">রুম অকুপেন্সি ও সিট খালি</span>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{occupancyPercentage}% পূর্ণ</p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500 font-semibold">
                <Bed size={13} />
                <span>{totalVacant}টি সিট এখনও খালি আছে</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-xs">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-bold block">আজকের পরিবেশিত মিল</span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{totalMealsServedToday} মিল</p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold">
                <Utensils size={13} />
                <span>সাধারণ {totalPayingMealsToday} + লিল্লাহ {totalLillahMealsToday}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-xs">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-bold block">ছুটি ও বাইরে অবস্থান</span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {students.filter(s => s.status !== 'উপস্থিত').length} জন
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-rose-700 font-semibold">
                <Clock size={13} />
                <span>অনুমোদিত গেটপাস ও ছুটিপ্রাপ্ত</span>
              </div>
            </div>
          </div>

          {/* 2. হোস্টেল/ভবন ও তলা ব্যবস্থাপনা + রুম/হুজরা ও সিট বণ্টন ম্যাট্রিক্স */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b dark:border-slate-700 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Bed size={20} className="text-emerald-600" />
                  <span>রুম/হুজরা ও সিট বণ্টন ম্যাট্রিক্স (Bed Allocation Matrix)</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  প্রতিটি হুজরার সক্ষমতা, খালি সিট এবং লাইভ শিক্ষার্থী বণ্টন পরিদর্শন করুন
                </p>
              </div>

              {/* Room Tabs */}
              <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                {rooms.map(r => (
                  <button
                    key={r.roomNo}
                    onClick={() => setActiveMatrixRoom(r.roomNo)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                      activeMatrixRoom === r.roomNo
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600'
                    }`}
                  >
                    হুজরা {r.roomNo}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Room Details Bar */}
            {(() => {
              const currentRoom = rooms.find(r => r.roomNo === activeMatrixRoom) || rooms[0];
              const roomOccupants = students.filter(s => s.roomNo === currentRoom.roomNo);
              const vacantSeats = currentRoom.capacity - roomOccupants.length;

              return (
                <div className="space-y-4">
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">
                        {currentRoom.building} • {currentRoom.floor}
                      </span>
                      <h4 className="text-base font-black text-emerald-950 dark:text-emerald-200 mt-0.5">
                        {currentRoom.roomTitle} (কক্ষ নং {currentRoom.roomNo})
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                        হুজরা প্রধান: <strong>{currentRoom.leaderName}</strong> (ফোন: {currentRoom.leaderPhone})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block font-semibold">সিট বরাদ্দ</span>
                        <span className="text-sm font-mono font-black text-gray-900 dark:text-white">
                          {roomOccupants.length} / {currentRoom.capacity} টি
                        </span>
                      </div>
                      <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border dark:border-slate-700 text-center">
                        <span className="text-[10px] text-gray-400 block font-bold">পরিচ্ছন্নতা স্কোর</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          ★ {currentRoom.cleanlinessScore} / ১০
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bed Grid Visual Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({ length: currentRoom.capacity }).map((_, idx) => {
                      const occupant = roomOccupants[idx];
                      const bedCode = `সিট ${idx + 1}`;

                      return occupant ? (
                        <div key={idx} className="p-3.5 rounded-xl border-2 border-emerald-500 bg-white dark:bg-slate-700 shadow-xs relative overflow-hidden group hover:border-emerald-600 transition">
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                              {bedCode}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              occupant.status === 'উপস্থিত' ? 'bg-emerald-100 text-emerald-800' :
                              occupant.status === 'ছুটিতে' ? 'bg-amber-100 text-amber-800' :
                              occupant.status === 'অসুস্থ' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {occupant.status}
                            </span>
                          </div>
                          <p className="font-black text-sm text-gray-900 dark:text-white mt-2 truncate">{occupant.nameBn}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">
                            {occupant.jamat} • রোল: {occupant.roll}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1 font-mono">রক্ত: {occupant.bloodGroup}</p>
                        </div>
                      ) : (
                        <div key={idx} className="p-3.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 bg-gray-50/50 dark:bg-slate-800/40 text-center flex flex-col items-center justify-center min-h-[110px] hover:border-emerald-400 transition cursor-pointer">
                          <Bed size={20} className="text-gray-400 mb-1" />
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{bedCode} (ফাঁকা)</span>
                          <span className="text-[10px] text-emerald-600 font-bold mt-1">+ ছাত্র বরাদ্দ করুন</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 3. আবাসিক ছাত্র তালিকা (Filter by Jamat, blood group, emergency contact) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Users size={20} className="text-emerald-600" />
                  <span>আবাসিক শিক্ষার্থী তালিকা ও জরুরি যোগাযোগ</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  জামাত, রক্তের গ্রুপ ও হুজরা অনুযায়ী তাৎক্ষণিক ফিল্টার করুন
                </p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-3 py-1 rounded-full font-bold">
                মোট {filteredStudents.length} জন ফিল্টার করা হয়েছে
              </span>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-50 dark:bg-slate-700/40 p-3 rounded-xl border dark:border-slate-700">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">নাম/রোল অনুসন্ধান</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="নাম বা আইডি লিখুন..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                  <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">কওমি জামাত</label>
                <select
                  value={selectedJamatFilter}
                  onChange={(e) => setSelectedJamatFilter(e.target.value)}
                  className="w-full p-1.5 text-xs font-bold rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="all">সকল জামাত</option>
                  {UNIFIED_QAWMI_JAMATS.map(j => (
                    <option key={j.value} value={j.value}>{j.nameWithEn}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">হুজরা / কক্ষ</label>
                <select
                  value={selectedRoomFilter}
                  onChange={(e) => setSelectedRoomFilter(e.target.value)}
                  className="w-full p-1.5 text-xs font-bold rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="all">সকল হুজরা</option>
                  {rooms.map(r => (
                    <option key={r.roomNo} value={r.roomNo}>হুজরা {r.roomNo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">রক্তের গ্রুপ</label>
                <select
                  value={selectedBloodFilter}
                  onChange={(e) => setSelectedBloodFilter(e.target.value)}
                  className="w-full p-1.5 text-xs font-bold rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="all">সকল রক্তের গ্রুপ</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-700/70 text-gray-700 dark:text-gray-200 font-black uppercase">
                  <tr>
                    <th className="py-3 px-4">শিক্ষার্থীর নাম ও আইডি</th>
                    <th className="py-3 px-4">জামাত ও রোল</th>
                    <th className="py-3 px-4">হুজরা ও সিট</th>
                    <th className="py-3 px-4">খোরাকি স্তর ও ফি</th>
                    <th className="py-3 px-4">রক্তের গ্রুপ</th>
                    <th className="py-3 px-4">অভিভাবক ও জরুরি ফোন</th>
                    <th className="py-3 px-4">বর্তমান অবস্থা</th>
                    <th className="py-3 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{s.nameBn}</p>
                        <p className="text-gray-400 font-mono text-[11px]">{s.studentId}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-800 dark:text-gray-200">{s.jamat}</span>
                        <p className="text-gray-400 text-[11px]">রোল: {s.roll}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">হুজরা {s.roomNo}</span>
                        <p className="text-gray-400 text-[11px]">{s.bedNo}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10.5px] inline-block ${
                          s.khurakiTier === 'পূর্ণ পেইং' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                          s.khurakiTier === 'আংশিক খোরাকি' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                        }`}>
                          {s.khurakiTier}
                        </span>
                        <p className="font-mono font-black text-gray-900 dark:text-white text-xs mt-0.5">
                          ৳ {s.pledgedKhurakiFee.toLocaleString()}
                        </p>
                        {s.subsidyKhurakiFee > 0 && (
                          <span className="text-[10px] text-gray-400 font-medium block">
                            (লিল্লাহ: ৳{s.subsidyKhurakiFee.toLocaleString()})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 font-bold px-2 py-0.5 rounded text-[11px]">
                          {s.bloodGroup}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-800 dark:text-gray-200">{s.guardianName}</p>
                        <a href={`tel:${s.guardianPhone}`} className="text-blue-600 dark:text-blue-400 flex items-center gap-1 font-mono mt-0.5 hover:underline">
                          <Phone size={11} /> {s.guardianPhone}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          s.status === 'উপস্থিত' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                          s.status === 'ছুটিতে' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                          s.status === 'অসুস্থ' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => {
                              setNewGatePass({
                                studentName: s.nameBn,
                                jamat: s.jamat,
                                roomNo: s.roomNo,
                                purpose: '',
                                exitTime: 'বিকাল ০৪:৩০',
                                expectedReturn: 'সন্ধ্যা ০৬:০০',
                                approvedBy: 'মাওলানা নোমান হাবিব'
                              });
                              setShowGatePassModal(true);
                              setActiveTab('movement');
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-1 rounded-lg font-bold text-[11px] transition shadow-2xs"
                            title="গেটপাস ইস্যু"
                          >
                            গেটপাস
                          </button>
                          <button
                            onClick={() => handleOpenAdjustModal(s)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-1 rounded-lg font-bold text-[11px] transition shadow-2xs"
                            title="খোরাকি ফি পরিবর্তন ও মওকুফ"
                          >
                            খোরাকি
                          </button>
                          <button
                            onClick={() => handleOpenPrintPledge(s)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-1 rounded-lg font-bold text-[11px] transition shadow-2xs"
                            title="অঙ্গীকারনামা ফরম প্রিন্ট"
                          >
                            ফরম
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 2: ⏱️ চলাচল ও ছুটি (MOVEMENT, GATE PASS & NIGHT ROLL CALL)
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'movement' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* 1. বাহিরে যাওয়া ও ফেরত (Digital Gate Pass) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b dark:border-slate-700 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <LogOut size={20} className="text-emerald-600" />
                  <span>ডিজিটাল গেটপাস ও বাহিরে চলাচল (Digital Gate Pass)</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  প্রস্থান ও প্রবেশের সময় রেকর্ড, গমনের কারণ ও অনুমোদন যাচাই
                </p>
              </div>

              <button
                onClick={() => setShowGatePassModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus size={15} />
                <span>নতুন গেটপাস ইস্যু করুন</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-700/70 text-gray-700 dark:text-gray-200 font-black uppercase">
                  <tr>
                    <th className="py-3 px-4">পাস নং</th>
                    <th className="py-3 px-4">শিক্ষার্থীর নাম ও জামাত</th>
                    <th className="py-3 px-4">হুজরা</th>
                    <th className="py-3 px-4">গমনের কারণ</th>
                    <th className="py-3 px-4">প্রস্থান ও প্রত্যাশিত ফেরত</th>
                    <th className="py-3 px-4">অনুমোদনকারী</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {gatePasses.map((gp) => (
                    <tr key={gp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {gp.passNo}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900 dark:text-white">{gp.studentName}</p>
                        <p className="text-gray-400 text-[11px]">{gp.jamat}</p>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">হুজরা {gp.roomNo}</td>
                      <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">{gp.purpose}</td>
                      <td className="py-3 px-4 font-mono">
                        <span className="text-gray-600 dark:text-gray-300 block">বের: {gp.exitTime}</span>
                        <span className="text-amber-600 dark:text-amber-400 block font-bold">ফেরত: {gp.expectedReturn}</span>
                        {gp.actualReturn && <span className="text-emerald-600 block text-[10px]">প্রকৃত প্রবেশ: {gp.actualReturn}</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-semibold">{gp.approvedBy}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          gp.status === 'ফেরত এসেছে' ? 'bg-emerald-100 text-emerald-800' :
                          gp.status === 'বাহিরে' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {gp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {gp.status === 'বাহিরে' ? (
                          <button
                            onClick={() => handleReturnGatePass(gp.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] transition shadow-2xs flex items-center gap-1 mx-auto"
                          >
                            <LogIn size={12} /> প্রবেশ নিশ্চিত করুন
                          </button>
                        ) : (
                          <span className="text-gray-400 font-semibold flex items-center justify-center gap-1">
                            <CheckCircle2 size={13} className="text-emerald-600" /> সম্পন্ন
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. ছুটি ব্যবস্থাপনা (Leave Request & Guardian Consent) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b dark:border-slate-700 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar size={20} className="text-emerald-600" />
                  <span>ছুটি ব্যবস্থাপনা ও অভিভাবকের সম্মতি (Leave Management)</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  ছুটির আবেদন, কারণ, অভিভাবকের সম্মতি যাচাই ও অনুমোদন
                </p>
              </div>

              <button
                onClick={() => setShowLeaveModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus size={15} />
                <span>নতুন ছুটির আবেদন</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leaveRequests.map((lv) => (
                <div key={lv.id} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-sm text-gray-900 dark:text-white">{lv.studentName}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-300">{lv.jamat} • হুজরা {lv.roomNo}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {lv.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 dark:text-gray-200 font-medium bg-white dark:bg-slate-800 p-2.5 rounded-lg border dark:border-slate-600">
                    <strong>ছুটির কারণ:</strong> {lv.reason}
                  </p>

                  <div className="flex flex-wrap justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-1">
                    <span>মেয়াদ: {lv.startDate} থেকে {lv.endDate} ({lv.days} দিন)</span>
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle size={13} /> অভিভাবকের সম্মতি নিশ্চিত ({lv.guardianPhone})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. রাতের উপস্থিতি ও দৈনিক বোর্ডিং রুটিন (Hostel Night Roll-Call & Routine Timeline) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Night Roll-Call Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <UserCheck size={18} className="text-emerald-600" />
                <span>রাতের হাজিরা ট্র্যাকার (Hostel Night Roll-Call)</span>
              </h3>
              <p className="text-xs text-gray-500">প্রতি রাতে ১০:০০ টার উপস্থিতির হালনাগাদ রেকর্ড</p>

              <div className="space-y-2.5">
                {nightRollCalls.map(nrc => (
                  <div key={nrc.id} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-700 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">হুজরা {nrc.roomNo} ({nrc.totalStudents} জন)</p>
                      <p className="text-gray-400 text-[11px] mt-0.5">তদারককারী: {nrc.checkedBy} • {nrc.time}</p>
                    </div>
                    <div className="flex items-center gap-2 font-mono font-bold">
                      <span className="text-emerald-600">উপস্থিত: {nrc.present}</span>
                      {nrc.onLeave > 0 && <span className="text-amber-600">ছুটি: {nrc.onLeave}</span>}
                      {nrc.sick > 0 && <span className="text-purple-600">অসুস্থ: {nrc.sick}</span>}
                      {nrc.absent > 0 && <span className="text-rose-600">অনুপস্থিত: {nrc.absent}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Routine Timeline */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Clock size={18} className="text-emerald-600" />
                <span>দৈনিক বোর্ডিং রুটিন ও সময়সূচি</span>
              </h3>
              <p className="text-xs text-gray-500">দারুল ইকামাহর দৈনিক ২৪ ঘণ্টার রুটিন</p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 w-24">ভোর ০৪:৩০</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">তাহাজ্জুদ, ফজরের নামাজ ও কুরআন তিলাওয়াত</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <span className="font-mono font-bold text-gray-600 dark:text-gray-300 w-24">সকাল ০৬:৩০</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">সকালের নাস্তা ও মাদ্রাসার ক্লাসের প্রস্তুতি</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <span className="font-mono font-bold text-gray-600 dark:text-gray-300 w-24">দুপুর ০১:১৫</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">যোহরের নামাজ, দুপুরের খাবার ও কায়লুলা (বিশ্রাম)</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <span className="font-mono font-bold text-gray-600 dark:text-gray-300 w-24">বিকাল ০৪:৩০</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">আসরের নামাজ, খেলাধুলা ও ব্যক্তিগত কাজ</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <span className="font-mono font-bold text-gray-600 dark:text-gray-300 w-24">মাগরিব-এশা</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">সন্ধ্যা সবক মুতালায়া ও তিলাওয়াত</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 w-24">রাত ১০:০০</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">রাতের হাজিরা, হুজরা তালা ও লাইট অফ</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 3: 🍲 খাবার ও চিকিৎসা (DINING, BAZAR & INFIRMARY)
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'dining' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* 1. খাবার ব্যবস্থাপনা (Meal counts, daily bazar expense, meal rate calculator) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Meal Counts & Live Rate Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Calculator size={18} className="text-emerald-600" />
                <span>দৈনিক মিল গণনা ও লাইভ মিল রেট</span>
              </h3>

              <div className="bg-emerald-50 dark:bg-emerald-950/50 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">আজকের লাইভ মিল রেট (Meal Rate)</span>
                <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1">
                  ৳ {todayMealRate} <span className="text-xs text-gray-500 font-normal">/ প্রতি মিল</span>
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  মোট বাজার ৳{totalBazarExpenseToday.toLocaleString()} ÷ মোট {totalMealsServedToday} মিল
                </p>
              </div>

              {/* Meal Counts Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl space-y-2">
                  <span className="font-bold text-gray-800 dark:text-gray-200 block">১. সাধারণ বোর্ডিং মিল (Paying Meals)</span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border">
                      <span className="text-[10px] text-gray-400 block">সকাল</span>
                      <span className="font-black text-sm text-gray-900 dark:text-white font-mono">{payingMeals.breakfast}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border">
                      <span className="text-[10px] text-gray-400 block">দুপুর</span>
                      <span className="font-black text-sm text-gray-900 dark:text-white font-mono">{payingMeals.lunch}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border">
                      <span className="text-[10px] text-gray-400 block">রাত</span>
                      <span className="font-black text-sm text-gray-900 dark:text-white font-mono">{payingMeals.dinner}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/50 dark:bg-slate-700/50 rounded-xl space-y-2 border border-amber-200 dark:border-slate-600">
                  <span className="font-bold text-amber-900 dark:text-amber-300 block">২. লিল্লাহ ও যাকাত ফান্ড মিল (Free Meals)</span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border">
                      <span className="text-[10px] text-gray-400 block">সকাল</span>
                      <span className="font-black text-sm text-gray-900 dark:text-white font-mono">{lillahMeals.breakfast}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border">
                      <span className="text-[10px] text-gray-400 block">দুপুর</span>
                      <span className="font-black text-sm text-gray-900 dark:text-white font-mono">{lillahMeals.lunch}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border">
                      <span className="text-[10px] text-gray-400 block">রাত</span>
                      <span className="font-black text-sm text-gray-900 dark:text-white font-mono">{lillahMeals.dinner}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bazar Audit & Entry */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b dark:border-slate-700 pb-3">
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <ShoppingCart size={18} className="text-emerald-600" />
                    <span>আজকের মেস বাজার তালিকা (Daily Mess Bazar)</span>
                  </h3>
                  <p className="text-xs text-gray-500">মোট খরচ: ৳ {totalBazarExpenseToday.toLocaleString()}</p>
                </div>

                <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-300">
                  তারিখ: {mealDate}
                </span>
              </div>

              {/* Add Bazar Item Form */}
              <form onSubmit={handleAddBazarItem} className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-xl text-xs">
                <input
                  type="text"
                  placeholder="পণ্যের নাম (যেমন: আলু)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="sm:col-span-2 p-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-semibold"
                  required
                />
                <input
                  type="number"
                  placeholder="পরিমাণ"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(Number(e.target.value))}
                  className="p-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-semibold"
                  required
                />
                <select
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="p-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-semibold"
                >
                  <option value="কেজি">কেজি</option>
                  <option value="লিটার">লিটার</option>
                  <option value="পিস">পিস</option>
                  <option value="সিলিন্ডার">সিলিন্ডার</option>
                  <option value="প্যাকেট">প্যাকেট</option>
                </select>
                <input
                  type="number"
                  placeholder="দর (৳)"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  className="p-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-semibold"
                  required
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-1 shadow-xs"
                >
                  <Plus size={14} /> যোগ করুন
                </button>
              </form>

              {/* Bazar Items Table */}
              <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-xl border dark:border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-700 font-bold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">পণ্য</th>
                      <th className="py-2.5 px-3">ক্যাটাগরি</th>
                      <th className="py-2.5 px-3">পরিমাণ</th>
                      <th className="py-2.5 px-3">দর</th>
                      <th className="py-2.5 px-3">মোট (৳)</th>
                      <th className="py-2.5 px-3 text-center">মুছুন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {bazarItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                        <td className="py-2 px-3 font-bold text-gray-900 dark:text-white">{item.name}</td>
                        <td className="py-2 px-3 text-gray-500">{item.category}</td>
                        <td className="py-2 px-3 font-mono">{item.quantity} {item.unit}</td>
                        <td className="py-2 px-3 font-mono">৳{item.unitPrice}</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-600">৳{item.total.toLocaleString()}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => setBazarItems(bazarItems.filter(b => b.id !== item.id))}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* 2. স্বাস্থ্য ও চিকিৎসা লগ (Student Infirmary & Health Care) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <HeartPulse size={18} className="text-rose-600" />
                  <span>স্বাস্থ্য ও চিকিৎসা লগ (Student Infirmary & Health Care)</span>
                </h3>
                <p className="text-xs text-gray-500">অসুস্থ ছাত্রের সেবা, প্রেসক্রিপশন ও অভিভাবককে তথ্য প্রেরণ</p>
              </div>

              <button
                onClick={() => setShowAddIllnessModal(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus size={15} />
                <span>নতুন চিকিৎসা লগ</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {illnessLogs.map((med) => (
                <div key={med.id} className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-slate-700/40 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{med.studentName}</h4>
                      <p className="text-xs text-gray-500">{med.jamat} • হুজরা {med.roomNo} • {med.date}</p>
                    </div>
                    <span className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {med.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-800 dark:text-gray-200">
                    <strong>লক্ষণ:</strong> {med.symptoms}
                  </p>

                  <p className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200">
                    <strong>ঔষধ ও পথ্য:</strong> {med.prescribedMedicine}
                  </p>

                  <div className="flex justify-between items-center text-[11px] text-gray-500 pt-1">
                    <span>ডাক্তার ভিজিট: {med.doctorVisit ? '✅ সম্পন্ন' : 'নরমাল বিশ্রাম'}</span>
                    <span>অভিভাবক অবহিত: {med.guardianInformed ? '✅ হ্যাঁ' : 'না'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 4: 💰 খোরাকি নির্ধারণ ও ফি সমন্বয় (KHURAKI ASSESSMENT & CONCESSION)
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'khuraki' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Banner: Finance Auto-Sync Notification */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-1">
              <span className="text-[11px] bg-white/20 text-emerald-100 font-bold px-2.5 py-0.5 rounded-full inline-block">
                🔗 বাইতুল মালে স্বয়ংক্রিয় লিংকড
              </span>
              <h2 className="text-lg sm:text-xl font-black">
                আবাসিক খোরাকি নির্ধারণ ও ফি সমন্বয় ব্যবস্থাপনা
              </h2>
              <p className="text-xs text-emerald-100 max-w-2xl">
                ছাত্রদের মাসিক খাবারের ক্যাটাগরি (পূর্ণ পেইং, হাফ-ফ্রি, লিল্লাহ বোর্ডিং) নির্ধারণ, অঙ্গীকারকৃত টাকার হিসাব, বিশেষ মওকুফ ও অঙ্গীকারনামা ফরম প্রিন্ট।
              </p>
            </div>
            <div className="shrink-0 bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20 text-center">
              <span className="text-[10px] text-emerald-200 block font-semibold">মাসিক প্রাক্কলিত খোরাকি রাজস্ব</span>
              <span className="text-xl font-mono font-black text-amber-300">
                ৳ {khurakiStats.totalEstimatedKhuraki.toLocaleString()}
              </span>
            </div>
          </div>

          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Residential */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400">
                <span>মোট আবাসিক শিক্ষার্থী</span>
                <Users size={16} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
                {khurakiStats.totalResidential} <span className="text-xs font-normal text-gray-400">জন</span>
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                ছাত্রদের খোরাকি তহবিল অন্তর্ভুক্ত
              </span>
            </div>

            {/* Card 2: Full Paying */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400">
                <span>পূর্ণ পেইং শিক্ষার্থী</span>
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {khurakiStats.fullPayingCount} জন
                </span>
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                ৳ {khurakiStats.fullPayingSum.toLocaleString()}
              </p>
              <span className="text-[11px] text-gray-400 block mt-1 font-mono">
                অভিভাবক কর্তৃক ১০০% প্রদেয়
              </span>
            </div>

            {/* Card 3: Subsidized / Half-Free */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400">
                <span>আংশিক খোরাকি / হাফ-ফ্রি</span>
                <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {khurakiStats.subsidizedCount} জন
                </span>
              </div>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                ৳ {khurakiStats.subsidizedPledgedSum.toLocaleString()} <span className="text-xs text-gray-400 font-normal">আদায়</span>
              </p>
              <span className="text-[11px] text-amber-700 dark:text-amber-300 block mt-1 font-mono">
                লিল্লাহ ফান্ড ভর্তুকি: ৳{khurakiStats.subsidizedSubsidySum.toLocaleString()}
              </span>
            </div>

            {/* Card 4: 100% Free / Lillah */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400">
                <span>সম্পূর্ণ ফ্রি / লিল্লাহ বোর্ডিং</span>
                <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {khurakiStats.freeCount} জন
                </span>
              </div>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
                ৳ ০ <span className="text-xs text-gray-400 font-normal">ছাত্র প্রদেয়</span>
              </p>
              <span className="text-[11px] text-purple-700 dark:text-purple-300 block mt-1 font-mono">
                ফান্ড অনুদান: ৳{khurakiStats.freeSubsidySum.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Khuraki Register Table Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Coins size={18} className="text-emerald-600" />
                  <span>আবাসিক খোরাকি খতিয়ান ও শিক্ষার্থী রেজিস্টার</span>
                </h3>
                <p className="text-xs text-gray-500">
                  প্রত্যেক শিক্ষার্থীর নির্ধারিত স্তর, অঙ্গীকারকৃত ফি ও পরিবর্তনের ব্যবস্থা — রোল নং অনুযায়ী সাজানো
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-3 py-1 rounded-full font-bold border border-emerald-200">
                  মোট {filteredKhurakiStudents.length} জন প্রদর্শিত
                </span>
                <button
                  onClick={() => setShowNewKhurakiModal(true)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs transition shadow-sm"
                >
                  <Plus size={14} />
                  নতুন খোরাকি নির্ধারণ
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 dark:bg-slate-700/40 p-3 rounded-xl border dark:border-slate-700">
              <div className="sm:col-span-2 relative">
                <input
                  type="text"
                  placeholder="ছাত্রের নাম, রোল, আইডি বা হুজরা দিয়ে খুঁজুন..."
                  value={khurakiSearch}
                  onChange={(e) => setKhurakiSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>

              <div>
                <select
                  value={selectedKhurakiTierFilter}
                  onChange={(e) => setSelectedKhurakiTierFilter(e.target.value as any)}
                  className="w-full p-2 text-xs font-bold rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="all">সকল খোরাকি ক্যাটাগরি</option>
                  <option value="পূর্ণ পেইং">পূর্ণ পেইং (Full Paying)</option>
                  <option value="আংশিক খোরাকি">আংশিক খোরাকি / হাফ-ফ্রি (Subsidized)</option>
                  <option value="লিল্লাহ বোর্ডিং">সম্পূর্ণ ফ্রি / লিল্লাহ বোর্ডিং (Free)</option>
                  <option value="অন্যান্য / আদার্স">অন্যান্য / কাস্টম ফি (Custom)</option>
                </select>
              </div>
            </div>

            {/* Khuraki Students Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-700/70 text-gray-700 dark:text-gray-200 font-black uppercase">
                  <tr>
                    <th className="py-3 px-3 text-center">রোল নং</th>
                    <th className="py-3 px-4">শিক্ষার্থীর নাম ও আইডি</th>
                    <th className="py-3 px-4">জামাত ও হুজরা</th>
                    <th className="py-3 px-4">খোরাকি স্তর (ক্যাটাগরি)</th>
                    <th className="py-3 px-4 text-right">অভিভাবক দেয়</th>
                    <th className="py-3 px-4 text-right">লিল্লাহ ভর্তুকি</th>
                    <th className="py-3 px-4 text-right">মোট স্ট্যান্ডার্ড</th>
                    <th className="py-3 px-4 text-center">সর্বশেষ সমন্বয়</th>
                    <th className="py-3 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredKhurakiStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                      {/* Roll No (Meal Token) */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-xs border border-emerald-300 dark:border-emerald-700">
                          {s.roll}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{s.nameBn}</p>
                        <p className="text-gray-400 font-mono text-[11px]">{s.studentId}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-800 dark:text-gray-200">{s.jamat}</span>
                        <p className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                          হুজরা {s.roomNo} ({s.bedNo})
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1 ${
                          s.khurakiTier === 'পূর্ণ পেইং' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300' :
                          s.khurakiTier === 'আংশিক খোরাকি' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300' :
                          s.khurakiTier === 'অন্যান্য / আদার্স' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-300' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-300'
                        }`}>
                          <BadgePercent size={12} />
                          {s.khurakiTier}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400">
                          ৳ {s.pledgedKhurakiFee.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-mono font-bold text-xs ${
                          s.subsidyKhurakiFee > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'
                        }`}>
                          {s.subsidyKhurakiFee > 0 ? `৳ ${s.subsidyKhurakiFee.toLocaleString()}` : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                        ৳ {(s.pledgedKhurakiFee + s.subsidyKhurakiFee).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-500 font-mono text-[11px]">
                        {s.lastAdjustedDate || '২০২৬-০৮-০১'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenAdjustModal(s)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-1 rounded-lg font-bold text-xs transition border border-amber-200 dark:border-amber-800 shadow-2xs"
                            title="খোরাকি ফি পরিবর্তন ও মওকুফ"
                          >
                            এডিট / পরিবর্তন
                          </button>
                          <button
                            onClick={() => handleOpenPrintPledge(s)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-1 rounded-lg font-bold text-xs transition border border-emerald-200 dark:border-emerald-800 shadow-2xs flex items-center gap-1"
                            title="অঙ্গীকারনামা ফরম প্রিন্ট করুন"
                          >
                            <FileSignature size={13} />
                            অঙ্গীকারনামা
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredKhurakiStudents.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-gray-400 text-sm font-semibold">
                        কোনো শিক্ষার্থী পাওয়া যায়নি। নতুন খোরাকি নির্ধারণ করুন।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>


          {/* Concession & Adjustment Audit Log Card (মাঝে মাঝে ফি পরিবর্তনের হিস্ট্রি) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <History size={18} className="text-emerald-600" />
                  <span>খোরাকি ফি পরিবর্তন ও মওকুফের হিস্ট্রি (Concession Audit Log)</span>
                </h3>
                <p className="text-xs text-gray-500">
                  বছরের মাঝে শিক্ষার্থীদের ফি পরিবর্তন, কারণ ও মুহতামিম সাহেবের অনুমোদন রেকর্ড
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">
                মোট {khurakiAdjustmentLogs.length} টি রেকর্ড
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">তারিখ</th>
                    <th className="py-2.5 px-3">শিক্ষার্থী ও জামাত</th>
                    <th className="py-2.5 px-3">পূর্বের ফি</th>
                    <th className="py-2.5 px-3">নতুন নির্ধারিত ফি</th>
                    <th className="py-2.5 px-3">পরিবর্তনের কারণ</th>
                    <th className="py-2.5 px-3">অনুমোদনকারী কর্তৃপক্ষ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {khurakiAdjustmentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                      <td className="py-2.5 px-3 font-mono text-gray-500">{log.date}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-gray-900 dark:text-white block">{log.studentName}</span>
                        <span className="text-[11px] text-gray-400">{log.jamat} • হুজরা {log.roomNo}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-rose-600 font-semibold line-through">
                          ৳ {log.previousFee.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-semibold">({log.previousTier})</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-emerald-600 font-black text-sm">
                          ৳ {log.newFee.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">({log.newTier})</span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-800 dark:text-gray-200">
                        <span className="bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded border border-amber-200 inline-block text-[11px]">
                          {log.reason}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                          <span>{log.approvedBy}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 5: ⚖️ শৃঙ্খলা ও তত্ত্বাবধান (DISCIPLINE, HYGIENE & SAFEKEEPING)
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'discipline' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* 1. শৃঙ্খলা ও আচরণ রেকর্ড + হুজরা পরিচ্ছন্নতা তদারকি */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Conduct & Disciplinary Records */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b dark:border-slate-700 pb-3">
                <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Award size={18} className="text-emerald-600" />
                  <span>শৃঙ্খলা ও আচরণ রেকর্ড (Good Conduct & Warnings)</span>
                </h3>
              </div>

              <div className="space-y-3">
                {disciplineLogs.map(d => (
                  <div key={d.id} className="p-3.5 rounded-xl border bg-gray-50 dark:bg-slate-700/50 space-y-1.5 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{d.studentName} ({d.jamat})</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        d.type === 'প্রশংসা/পুরস্কার' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {d.type}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300"><strong>বিবরণ:</strong> {d.description}</p>
                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold"><strong>গৃহীত ব্যবস্থা:</strong> {d.actionTaken}</p>
                    <div className="flex justify-between text-gray-400 text-[10px] pt-1">
                      <span>নথিভুক্তকারী: {d.recordedBy}</span>
                      <span>তারিখ: {d.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cleanliness & Hygiene Inspection */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b dark:border-slate-700 pb-3">
                <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  <span>হুজরা পরিচ্ছন্নতা তদারকি (Cleanliness Scores)</span>
                </h3>
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
                  সাপ্তাহিক মূল্যায়ন
                </span>
              </div>

              <div className="space-y-3">
                {rooms.map(r => (
                  <div key={r.roomNo} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white">হুজরা {r.roomNo} - {r.roomTitle}</h4>
                      <p className="text-[11px] text-gray-500">দায়িত্বপ্রাপ্ত: {r.leaderName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 dark:bg-slate-600 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: `${(r.cleanlinessScore / 10) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 w-10 text-right">
                        {r.cleanlinessScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <Award size={20} className="text-amber-600 shrink-0" />
                <span>🏆 <strong>সেরা পরিচ্ছন্ন হুজরা:</strong> হুজরা ১০১ (আবু বকর রা.) - ৯.৮ স্কোর অর্জন করেছে!</span>
              </div>
            </div>

          </div>

          {/* 2. ছাত্রের আমানত/সামগ্রী + দায়িত্বপ্রাপ্ত শিক্ষক ও খাদেম তালিকা */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Valuables Safekeeping Log */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Lock size={18} className="text-emerald-600" />
                <span>ছাত্রদের আমানত ও সামগ্রী হেফাজত (Safekeeping Log)</span>
              </h3>
              <p className="text-xs text-gray-500">হোস্টেল সুপারের নিকট গচ্ছিত অর্থ ও মালামাল</p>

              <div className="space-y-2.5">
                {valuablesLogs.map(v => (
                  <div key={v.id} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 dark:text-white">{v.studentName} ({v.jamat})</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {v.status}
                      </span>
                    </div>
                    <p className="text-emerald-700 dark:text-emerald-400 font-bold">{v.itemType}: {v.amountOrDetails}</p>
                    <p className="text-gray-400 text-[11px]">জমার তারিখ: {v.depositDate} • গ্রহণকারী: {v.receivedBy}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hostel Staff Directory */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-emerald-600" />
                <span>দায়িত্বপ্রাপ্ত শিক্ষক ও খাদেম তালিকা (Hostel Staff)</span>
              </h3>
              <p className="text-xs text-gray-500">হোস্টেল সুপার ও দায়িত্বশীলগণের জরুরি নম্বর</p>

              <div className="space-y-2.5">
                {hostelStaff.map(st => (
                  <div key={st.id} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{st.name}</h4>
                      <p className="text-emerald-700 dark:text-emerald-400 font-semibold">{st.role}</p>
                      <p className="text-gray-400 text-[11px]">{st.responsibilities}</p>
                    </div>
                    <a href={`tel:${st.phone}`} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-mono font-bold flex items-center gap-1">
                      <Phone size={12} /> {st.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 5: 📢 নোটিশ ও রিপোর্ট (COMMUNICATION, MONTHLY AUDIT & SETTINGS)
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* 1. বোর্ডিং নোটিশ বোর্ড ও জরুরি যোগাযোগ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Notice Board */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Bell size={18} className="text-amber-500" />
                <span>বোর্ডিং নোটিশ বোর্ড (Hostel Notice Board)</span>
              </h3>

              <div className="space-y-3">
                {notices.map(n => (
                  <div key={n.id} className="p-3.5 rounded-xl border bg-gray-50 dark:bg-slate-700/50 space-y-1.5 text-xs">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{n.title}</h4>
                      <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {n.category}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{n.content}</p>
                    <div className="flex justify-between text-gray-400 text-[10px] pt-1">
                      <span>জারি করেছেন: {n.issuedBy}</span>
                      <span>তারিখ: {n.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Publish Notice Form */}
              <form onSubmit={handleAddNotice} className="space-y-2 pt-2 border-t dark:border-slate-700 text-xs">
                <input
                  type="text"
                  placeholder="নোটিশের শিরোনাম লিখুন..."
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-semibold"
                  required
                />
                <textarea
                  placeholder="নোটিশের বিস্তারিত বক্তব্য..."
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-semibold"
                  rows={2}
                  required
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-4 rounded-lg transition text-xs flex items-center gap-1.5"
                >
                  <Send size={13} /> নোটিশ প্রকাশ করুন
                </button>
              </form>
            </div>

            {/* Emergency Parent Alerts & Rules */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Phone size={18} className="text-rose-600" />
                <span>জরুরি অভিভাবক যোগাযোগ ও নীতিমালা</span>
              </h3>

              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 space-y-2 text-xs text-rose-900 dark:text-rose-200">
                <h4 className="font-bold flex items-center gap-1.5">
                  <AlertTriangle size={15} /> জরুরি স্বাস্থ্য বা আচরণ বার্তা
                </h4>
                <p>ছাত্রের অসুস্থতা, অনুপস্থিতি বা জরুরি প্রয়োজনে সরাসরি অভিভাবকের সাথে যোগাযোগ করুন।</p>
                <div className="flex gap-2 pt-1">
                  <button 
                    onClick={() => alert('জরুরি স্বাস্থ্য এসএমএস গেটওয়ে চালু হচ্ছে...')}
                    className="bg-rose-600 text-white px-3 py-1.5 rounded-lg font-bold"
                  >
                    স্বাস্থ্য বুলেটিন SMS
                  </button>
                  <button 
                    onClick={() => alert('ছুটির মেয়াদ উত্তীর্ণ ছাত্রদের অভিভাবকদের তাগাদা পাঠানো হচ্ছে...')}
                    className="bg-white dark:bg-slate-800 border text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-lg font-bold"
                  >
                    অনুপস্থিতি তাগাদা SMS
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border space-y-2 text-xs">
                <h4 className="font-bold text-gray-900 dark:text-white">হোস্টেল নিয়মাবলি ও আচরণবিধি:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                  <li>রাত ১০:০০টার পর হুজরার বাইরে ঘোরাফেরা সম্পূর্ণ নিষিদ্ধ।</li>
                  <li>অভিভাবকের লিখিত বা ফোন অনুমোদন ছাড়া কোনো ছাত্রকে ছুটি দেওয়া হবে না।</li>
                  <li>প্রতি শুক্রবার বাধ্যতামূলক হুজরা পরিচ্ছন্নতা কার্যক্রমে অংশ নিতে হবে।</li>
                  <li>খাবারের অপচয় কঠোরভাবে নিষিদ্ধ।</li>
                </ul>
              </div>
            </div>

          </div>

          {/* 2. মাসিক বোর্ডিং খতিয়ান ও রিপোর্ট (Printable Monthly Hostel Report) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-emerald-600/30 shadow-lg relative overflow-hidden space-y-6">
            <OfficialWatermark instituteName={instituteSettings.name || 'জামিয়া আরাবিয়া ইমদাদুল উলুম'} size={320} opacity="opacity-[0.04] print:opacity-[0.08]" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-emerald-700 pb-4">
              <div>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                  মাসিক বোর্ডিং ও মেস খতিয়ান
                </span>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                  {instituteSettings.name || 'জামিয়া আরাবিয়া ইমদাদুল উলুম ফরিদাবাদ মাদ্রাসা, ঢাকা'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  দারুল ইকামাহ ও ছাত্রাবাস প্রশাসনিক মাসিক রিপোর্ট • সেপ্টেম্বর ২০২৬
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs print:hidden"
              >
                <Printer size={15} />
                <span>রিপোর্ট প্রিন্ট করুন</span>
              </button>
            </div>

            {/* Report KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-gray-400 block font-semibold">মোট আবাসিক ছাত্র</span>
                <span className="font-black text-base text-gray-900 dark:text-white font-mono">{totalOccupied} জন</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">চলতি মাসের মোট বাজার</span>
                <span className="font-black text-base text-emerald-600 dark:text-emerald-400 font-mono">
                  ৳ {(totalBazarExpenseToday * 30).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">পরিবেশিত মোট মিল</span>
                <span className="font-black text-base text-gray-900 dark:text-white font-mono">
                  {(totalMealsServedToday * 30).toLocaleString()} মিল
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">গড় মিল রেট</span>
                <span className="font-black text-base text-blue-600 dark:text-blue-400 font-mono">৳ {todayMealRate}</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-4 text-center pt-8 text-xs text-gray-600 dark:text-gray-400 border-t dark:border-slate-700">
              <div>
                <div className="w-28 border-b border-gray-400 mx-auto mb-1" />
                <span>মেস ইনচার্জ / বাবুর্চি</span>
              </div>
              <div>
                <div className="w-28 border-b border-gray-400 mx-auto mb-1" />
                <span>নাজেমে দারুল ইকামাহ</span>
              </div>
              <div>
                <div className="w-28 border-b border-gray-400 mx-auto mb-1" />
                <span>মুহতামিম / অধ্যক্ষ</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ─── MODAL 1: NEW GATEPASS ─── */}
      {showGatePassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-700">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <LogOut size={18} className="text-emerald-600" />
                <span>নতুন ডিজিটাল গেটপাস ইস্যু</span>
              </h3>
              <button onClick={() => setShowGatePassModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddGatePass} className="space-y-3 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">শিক্ষার্থীর নাম *</label>
                  <select
                    value={newGatePass.studentName}
                    onChange={(e) => {
                      const match = students.find(s => s.nameBn === e.target.value);
                      setNewGatePass({
                        ...newGatePass,
                        studentName: e.target.value,
                        jamat: match ? match.jamat : newGatePass.jamat,
                        roomNo: match ? match.roomNo : newGatePass.roomNo
                      });
                    }}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.nameBn}>{s.nameBn} ({s.jamat})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">হুজরা কক্ষ</label>
                  <input
                    type="text"
                    disabled
                    value={`হুজরা ${newGatePass.roomNo}`}
                    className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">গমনের সুনির্দিষ্ট কারণ *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: জরুরি ঔষধ ক্রয় / ডাক্তারের পরামর্শ"
                  value={newGatePass.purpose}
                  onChange={(e) => setNewGatePass({ ...newGatePass, purpose: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">প্রস্থানের সময়</label>
                  <input
                    type="text"
                    value={newGatePass.exitTime}
                    onChange={(e) => setNewGatePass({ ...newGatePass, exitTime: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">প্রত্যাশিত ফেরার সময় *</label>
                  <input
                    type="text"
                    required
                    value={newGatePass.expectedReturn}
                    onChange={(e) => setNewGatePass({ ...newGatePass, expectedReturn: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">অনুমোদনকারী শিক্ষক</label>
                <input
                  type="text"
                  value={newGatePass.approvedBy}
                  onChange={(e) => setNewGatePass({ ...newGatePass, approvedBy: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowGatePassModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  গেটপাস ইস্যু করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: NEW LEAVE REQUEST ─── */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-700">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar size={18} className="text-emerald-600" />
                <span>নতুন ছুটির আবেদন ও অভিভাবক সম্মতি</span>
              </h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddLeave} className="space-y-3 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">শিক্ষার্থীর নাম</label>
                  <select
                    value={newLeave.studentName}
                    onChange={(e) => {
                      const match = students.find(s => s.nameBn === e.target.value);
                      setNewLeave({
                        ...newLeave,
                        studentName: e.target.value,
                        jamat: match ? match.jamat : newLeave.jamat,
                        roomNo: match ? match.roomNo : newLeave.roomNo,
                        guardianPhone: match ? match.guardianPhone : newLeave.guardianPhone
                      });
                    }}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.nameBn}>{s.nameBn} ({s.jamat})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">ছুটির দিনসংখ্যা</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={newLeave.days}
                    onChange={(e) => setNewLeave({ ...newLeave, days: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">ছুটির সুনির্দিষ্ট কারণ *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: পারিবারিক অনুষ্ঠান / অসুস্থতা"
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">শুরুর তারিখ</label>
                  <input
                    type="date"
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">সমাপ্তির তারিখ</label>
                  <input
                    type="date"
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">অভিভাবকের মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={newLeave.guardianPhone}
                  onChange={(e) => setNewLeave({ ...newLeave, guardianPhone: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                <input
                  type="checkbox"
                  id="guardianConsent"
                  checked={newLeave.guardianConsent}
                  onChange={(e) => setNewLeave({ ...newLeave, guardianConsent: e.target.checked })}
                  className="accent-emerald-600"
                />
                <label htmlFor="guardianConsent" className="text-emerald-900 dark:text-emerald-300 cursor-pointer">
                  অভিভাবকের সাথে ফোনে কথা বলে সম্মতি যাচাই করা হয়েছে
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  ছুটি অনুমোদন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: NEW ILLNESS / MEDICAL LOG ─── */}
      {showAddIllnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-700">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <HeartPulse size={18} className="text-rose-600" />
                <span>নতুন স্বাস্থ্য ও চিকিৎসা লগ</span>
              </h3>
              <button onClick={() => setShowAddIllnessModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddIllness} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">অসুস্থ শিক্ষার্থীর নাম *</label>
                <select
                  value={newIllness.studentName}
                  onChange={(e) => {
                    const match = students.find(s => s.nameBn === e.target.value);
                    setNewIllness({
                      ...newIllness,
                      studentName: e.target.value,
                      jamat: match ? match.jamat : newIllness.jamat,
                      roomNo: match ? match.roomNo : newIllness.roomNo,
                    });
                  }}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.nameBn}>{s.nameBn} ({s.jamat} • হুজরা {s.roomNo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">অসুস্থতা ও লক্ষণ *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: জ্বর, সর্দি, পেটে ব্যথা, দুর্বলতা"
                  value={newIllness.symptoms}
                  onChange={(e) => setNewIllness({ ...newIllness, symptoms: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">প্রদত্ত ঔষধ ও পথ্য</label>
                <input
                  type="text"
                  placeholder="যেমন: প্যারাসিটামল ৫০০ মি.গ্রা. ও ওআরএস স্যালাইন"
                  value={newIllness.prescribedMedicine}
                  onChange={(e) => setNewIllness({ ...newIllness, prescribedMedicine: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIllness.doctorVisit}
                    onChange={(e) => setNewIllness({ ...newIllness, doctorVisit: e.target.checked })}
                    className="accent-rose-600"
                  />
                  <span>ডাক্তার দেখানো হয়েছে</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIllness.guardianInformed}
                    onChange={(e) => setNewIllness({ ...newIllness, guardianInformed: e.target.checked })}
                    className="accent-rose-600"
                  />
                  <span>অভিভাবককে জানানো হয়েছে</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddIllnessModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
                >
                  লগ সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADJUST KHURAKI FEE & CONCESSION ─── */}
      {showAdjustKhurakiModal && studentToAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-700">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Coins size={18} className="text-amber-600" />
                <span>খোরাকি পরিবর্তন ও মওকুফ আবেদন</span>
              </h3>
              <button onClick={() => setShowAdjustKhurakiModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {/* Student Info Card */}
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500 block">শিক্ষার্থীর নাম:</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{studentToAdjust.nameBn}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">জামাত ও হুজরা:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{studentToAdjust.jamat} • হুজরা {studentToAdjust.roomNo}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">বর্তমান স্তর:</span>
                  <span className="font-bold text-emerald-600">{studentToAdjust.khurakiTier}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">বর্তমান প্রদেয় ফি:</span>
                  <span className="font-mono font-bold text-emerald-600">৳ {studentToAdjust.pledgedKhurakiFee.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveKhurakiAdjustment} className="space-y-3 text-xs font-semibold">
              {/* Select New Tier */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">নতুন খোরাকি স্তর নির্বাচন করুন *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['পূর্ণ পেইং', 'আংশিক খোরাকি', 'লিল্লাহ বোর্ডিং', 'অন্যান্য / আদার্স'] as const).map((tier) => (
                    <button
                      type="button"
                      key={tier}
                      onClick={() => {
                        let newFee = adjustForm.newFee;
                        if (tier === 'লিল্লাহ বোর্ডিং') newFee = 0;
                        if (tier === 'পূর্ণ পেইং') newFee = BASE_KHURAKI_STANDARD;
                        if (tier === 'আংশিক খোরাকি' && (newFee === 0 || newFee >= BASE_KHURAKI_STANDARD)) newFee = 1500;
                        setAdjustForm({ ...adjustForm, newTier: tier, newFee });
                      }}
                      className={`p-2 rounded-xl text-center border font-bold transition text-xs ${
                        adjustForm.newTier === tier
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input (only for অন্যান্য / আদার্স) */}
              {adjustForm.newTier === 'অন্যান্য / আদার্স' && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">কাস্টম পরিমাণ (৳) *</label>
                  <input
                    type="number"
                    min={0}
                    max={BASE_KHURAKI_STANDARD}
                    value={adjustForm.customAmount}
                    onChange={(e) => setAdjustForm({ ...adjustForm, customAmount: Number(e.target.value) })}
                    placeholder="যেমন: ৫০০, ১০০০, ২০০০..."
                    className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white font-mono font-bold text-sm"
                    required
                  />
                  <p className="text-[11px] text-amber-600 mt-1">
                    লিল্লাহ ভর্তুকি: ৳ {Math.max(0, BASE_KHURAKI_STANDARD - adjustForm.customAmount).toLocaleString()} (স্বয়ংক্রিয়)
                  </p>
                </div>
              )}


              {/* Amount Inputs (hidden for অন্যান্য / আদার্স since it has its own input above) */}
              {adjustForm.newTier !== 'অন্যান্য / আদার্স' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">
                    ছাত্র/অভিভাবকের প্রদেয় টাকা (৳) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={6000}
                    disabled={adjustForm.newTier === 'লিল্লাহ বোর্ডিং' || adjustForm.newTier === 'পূর্ণ পেইং'}
                    value={adjustForm.newTier === 'লিল্লাহ বোর্ডিং' ? 0 : adjustForm.newTier === 'পূর্ণ পেইং' ? BASE_KHURAKI_STANDARD : adjustForm.newFee}
                    onChange={(e) => setAdjustForm({ ...adjustForm, newFee: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white font-mono font-bold text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">
                    লিল্লাহ ফান্ড হতে ভর্তুকি (স্বয়ংক্রিয়)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`৳ ${Math.max(0, BASE_KHURAKI_STANDARD - (adjustForm.newTier === 'লিল্লাহ বোর্ডিং' ? 0 : adjustForm.newTier === 'পূর্ণ পেইং' ? BASE_KHURAKI_STANDARD : adjustForm.newFee)).toLocaleString()}`}
                    className="w-full p-2.5 border rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-mono font-bold text-sm"
                  />
                </div>
              </div>
              )}


              {/* Reason */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">ফি পরিবর্তনের সুনির্দিষ্ট কারণ *</label>
                <select
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="পারিবারিক অসচ্ছলতা">পারিবারিক অসচ্ছলতা ও আর্থিক সংকট</option>
                  <option value="রমজান উপলক্ষে বিশেষ ছাড়">রমজান উপলক্ষে বিশেষ মওকুফ</option>
                  <option value="অভিভাবকের সামর্থ্য হ্রাস">অভিভাবকের আয়ের সামর্থ্য হ্রাস</option>
                  <option value="পিতৃহীন এতিম ছাত্র অনুদান">পিতৃহীন এতিম ছাত্র বিশেষ অনুদান</option>
                  <option value="মেধাবী ছাত্র বিশেষ বৃত্তি">হিফজ/কিতাব বিভাগ মেধা বৃত্তি</option>
                  <option value="অন্যান্য">অন্যান্য সুনির্দিষ্ট কারণ</option>
                </select>
              </div>

              {adjustForm.reason === 'অন্যান্য' && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">কারণ বিস্তারিত লিখুন *</label>
                  <input
                    type="text"
                    required
                    placeholder="সুনির্দিষ্ট কারণ লিখুন..."
                    value={adjustForm.customReason}
                    onChange={(e) => setAdjustForm({ ...adjustForm, customReason: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              {/* Approver & Effective Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">অনুমোদনকারী কর্তৃপক্ষ *</label>
                  <input
                    type="text"
                    required
                    value={adjustForm.approvedBy}
                    onChange={(e) => setAdjustForm({ ...adjustForm, approvedBy: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">কার্যকরের তারিখ</label>
                  <input
                    type="date"
                    value={adjustForm.effectiveDate}
                    onChange={(e) => setAdjustForm({ ...adjustForm, effectiveDate: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAdjustKhurakiModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 size={15} />
                  সমন্বয় অনুমোদন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: NEW KHURAKI ASSESSMENT (নতুন খোরাকি নির্ধারণ) ─── */}
      {showNewKhurakiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-lg space-y-4 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-700">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" />
                <span>নতুন খোরাকি নির্ধারণ</span>
              </h3>
              <button onClick={() => setShowNewKhurakiModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewKhurakiAssignment} className="space-y-4 text-xs font-semibold">
              {/* Student Selector */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">শিক্ষার্থী নির্বাচন করুন *</label>
                <select
                  required
                  value={newKhurakiForm.selectedStudentId}
                  onChange={(e) => setNewKhurakiForm({ ...newKhurakiForm, selectedStudentId: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white text-xs"
                >
                  <option value="">— শিক্ষার্থী নির্বাচন করুন —</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      রোল {s.roll} | {s.nameBn} | {s.jamat}
                    </option>
                  ))}
                </select>
                {newKhurakiForm.selectedStudentId && (() => {
                  const sel = students.find(s => s.id === newKhurakiForm.selectedStudentId);
                  return sel ? (
                    <div className="mt-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 text-[11px] text-emerald-800 dark:text-emerald-300 font-mono">
                      {sel.nameBn} • আইডি: {sel.studentId} • বর্তমান: {sel.khurakiTier} (৳ {sel.pledgedKhurakiFee})
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Room & Bed Assignment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">হুজরা / রুম নম্বর *</label>
                  <select
                    value={newKhurakiForm.roomNo}
                    onChange={(e) => setNewKhurakiForm({ ...newKhurakiForm, roomNo: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  >
                    {rooms.map(r => (
                      <option key={r.roomNo} value={r.roomNo}>
                        হুজরা {r.roomNo} ({r.building})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">সিট / বেড নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: A-১, B-২..."
                    value={newKhurakiForm.bedNo}
                    onChange={(e) => setNewKhurakiForm({ ...newKhurakiForm, bedNo: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Khuraki Tier Selection */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1.5">খোরাকি স্তর নির্বাচন করুন *</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { tier: 'পূর্ণ পেইং', label: 'পূর্ণ পেইং', sub: `৳ ${BASE_KHURAKI_STANDARD.toLocaleString()}`, color: 'emerald' },
                    { tier: 'আংশিক খোরাকি', label: 'আংশিক খোরাকি', sub: '৳ ১,৫০০ (হাফ-ফ্রি)', color: 'amber' },
                    { tier: 'লিল্লাহ বোর্ডিং', label: 'লিল্লাহ বোর্ডিং', sub: '৳ ০ (সম্পূর্ণ ফ্রি)', color: 'purple' },
                    { tier: 'অন্যান্য / আদার্স', label: 'অন্যান্য / কাস্টম', sub: 'নিজে পরিমাণ দিন', color: 'sky' },
                  ] as const).map(({ tier, label, sub }) => (
                    <button
                      type="button"
                      key={tier}
                      onClick={() => {
                        let pledgedFee = newKhurakiForm.pledgedFee;
                        if (tier === 'লিল্লাহ বোর্ডিং') pledgedFee = 0;
                        if (tier === 'পূর্ণ পেইং') pledgedFee = BASE_KHURAKI_STANDARD;
                        if (tier === 'আংশিক খোরাকি') pledgedFee = 1500;
                        setNewKhurakiForm({ ...newKhurakiForm, khurakiTier: tier, pledgedFee, customAmount: 0 });
                      }}
                      className={`p-2.5 rounded-xl text-center border font-bold transition text-left ${
                        newKhurakiForm.khurakiTier === tier
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:border-emerald-400'
                      }`}
                    >
                      <div className="text-xs font-black">{label}</div>
                      <div className={`text-[10px] font-semibold mt-0.5 ${newKhurakiForm.khurakiTier === tier ? 'text-white/80' : 'text-gray-400'}`}>{sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input */}
              {newKhurakiForm.khurakiTier === 'অন্যান্য / আদার্স' && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">কাস্টম পরিমাণ (৳) — অভিভাবক দেবেন *</label>
                  <input
                    type="number"
                    min={0}
                    max={BASE_KHURAKI_STANDARD}
                    required
                    placeholder="যেমন: ১০০, ৫০০, ১০০০, ২০০০..."
                    value={newKhurakiForm.customAmount || ''}
                    onChange={(e) => setNewKhurakiForm({ ...newKhurakiForm, customAmount: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white font-mono font-bold text-sm"
                  />
                </div>
              )}

              {/* Live Fee Summary */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-gray-500 block">অভিভাবক / অঙ্গীকারকৃত ফি:</span>
                  <span className="font-black text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                    ৳ {(
                      newKhurakiForm.khurakiTier === 'লিল্লাহ বোর্ডিং' ? 0
                      : newKhurakiForm.khurakiTier === 'পূর্ণ পেইং' ? BASE_KHURAKI_STANDARD
                      : newKhurakiForm.khurakiTier === 'অন্যান্য / আদার্স' ? newKhurakiForm.customAmount
                      : newKhurakiForm.pledgedFee
                    ).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">লিল্লাহ ফান্ড ভর্তুকি (স্বয়ংক্রিয়):</span>
                  <span className="font-black text-amber-600 dark:text-amber-400 font-mono text-sm">
                    ৳ {Math.max(0, BASE_KHURAKI_STANDARD - (
                      newKhurakiForm.khurakiTier === 'লিল্লাহ বোর্ডিং' ? 0
                      : newKhurakiForm.khurakiTier === 'পূর্ণ পেইং' ? BASE_KHURAKI_STANDARD
                      : newKhurakiForm.khurakiTier === 'অন্যান্য / আদার্স' ? newKhurakiForm.customAmount
                      : newKhurakiForm.pledgedFee
                    )).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Reason & Approver */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">অনুমোদনকারী কর্তৃপক্ষ *</label>
                  <input
                    type="text"
                    required
                    value={newKhurakiForm.approvedBy}
                    onChange={(e) => setNewKhurakiForm({ ...newKhurakiForm, approvedBy: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">কার্যকরের তারিখ</label>
                  <input
                    type="date"
                    value={newKhurakiForm.effectiveDate}
                    onChange={(e) => setNewKhurakiForm({ ...newKhurakiForm, effectiveDate: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowNewKhurakiModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 size={15} />
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: PRINTABLE KHURAKI PLEDGE FORM ─── */}
      {showPrintPledgeModal && studentToPrintPledge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-200 w-full max-w-3xl space-y-6 relative text-gray-900 my-8">
            
            {/* Watermark Background */}
            <OfficialWatermark instituteName={instituteSettings.name || 'জামিয়া আরাবিয়া ইমদাদুল উলুম'} size={320} opacity="opacity-[0.05] print:opacity-[0.08]" />

            {/* Top Bar for Action (Hidden in Print) */}
            <div className="flex justify-between items-center border-b pb-3 print:hidden">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                অফিসিয়াল খোরাকি অঙ্গীকারনামা প্রিন্ট প্রিভিউ
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Printer size={15} /> প্রিন্ট করুন
                </button>
                <button
                  onClick={() => setShowPrintPledgeModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Document Printable Area */}
            <div className="border-4 border-double border-emerald-800 p-6 sm:p-8 rounded-xl space-y-5 bg-white relative">
              
              {/* Islamic Bismillah & Madrasah Header */}
              <div className="text-center space-y-1">
                <p className="text-emerald-800 font-serif font-bold text-sm tracking-widest">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  {instituteSettings.name || 'জামিয়া আরাবিয়া ইমদাদুল উলুম ফরিদাবাদ'}
                </h2>
                <p className="text-xs text-gray-600">
                  দারুল ইকামাহ ও ছাত্রাবাস প্রশাসনিক বিভাগ • ঢাকা, বাংলাদেশ
                </p>
                <div className="inline-block bg-emerald-800 text-white font-black text-xs px-4 py-1 rounded-full mt-2 tracking-wide uppercase">
                  আবাসিক ছাত্রের খোরাকি অঙ্গীকারনামা ও চুক্তিপত্র
                </div>
                <p className="text-[11px] text-gray-500 font-mono mt-1">শিক্ষাবর্ষ: ২০২৬-২০২৭ খ্রি.</p>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border text-xs">
                <div>
                  <span className="text-gray-500 block text-[11px]">শিক্ষার্থীর নাম:</span>
                  <span className="font-black text-gray-900 text-sm">{studentToPrintPledge.nameBn}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">ছাত্র আইডি ও রোল:</span>
                  <span className="font-mono font-bold text-gray-900">{studentToPrintPledge.studentId} (রোল: {studentToPrintPledge.roll})</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">জামাত / শ্রেণি:</span>
                  <span className="font-bold text-gray-900">{studentToPrintPledge.jamat}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">হুজরা ও সিট নং:</span>
                  <span className="font-bold text-emerald-800">হুজরা {studentToPrintPledge.roomNo} ({studentToPrintPledge.bedNo})</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">পিতা / অভিভাবকের নাম:</span>
                  <span className="font-bold text-gray-900">{studentToPrintPledge.guardianName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">অভিভাবকের মোবাইল:</span>
                  <span className="font-mono font-bold text-gray-900">{studentToPrintPledge.guardianPhone}</span>
                </div>
              </div>

              {/* Khuraki Financial Tier Breakdown */}
              <div className="border border-emerald-700 rounded-xl overflow-hidden text-xs">
                <div className="bg-emerald-800 text-white p-2.5 font-bold flex justify-between items-center">
                  <span>ধার্যকৃত খোরাকি ফি ও সহায়তার বিবরণী</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[11px]">ক্যাটাগরি: {studentToPrintPledge.khurakiTier}</span>
                </div>
                <div className="p-4 space-y-2 bg-emerald-50/30">
                  <div className="flex justify-between border-b border-gray-200 pb-1.5">
                    <span className="text-gray-700 font-semibold">মাদ্রাসার নিয়মিত পূর্ণ খোরাকি ফি (মাসিক):</span>
                    <span className="font-mono font-bold text-gray-900">৳ ৩,০০০</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1.5">
                    <span className="text-gray-700 font-semibold">অভিভাবক কর্তৃক অঙ্গীকারকৃত মাসিক প্রদেয়:</span>
                    <span className="font-mono font-black text-emerald-800 text-sm">৳ {studentToPrintPledge.pledgedKhurakiFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1.5">
                    <span className="text-gray-700 font-semibold">বাইতুল মাল লিল্লাহ ফান্ড হতে বিশেষ অনুদান/ভর্তুকি:</span>
                    <span className="font-mono font-bold text-amber-700">৳ {studentToPrintPledge.subsidyKhurakiFee.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Formal Bengali Guardian Pledge Declaration */}
              <div className="p-4 bg-slate-50 rounded-xl border text-xs leading-relaxed space-y-2 text-gray-800">
                <h4 className="font-bold text-emerald-900 border-b pb-1">অভিভাবকের আনুষ্ঠানিক অঙ্গীকারনামা:</h4>
                <p>
                  আমি অত্র মাদ্রাসার আবাসিক শিক্ষার্থী <strong>{studentToPrintPledge.nameBn}</strong>-এর অভিভাবক হিসেবে সজ্ঞানে অঙ্গীকার করিতেছি যে, উপরোক্ত নির্ধারিত মাসিক খোরাকি ফি বাবদ <strong>৳ {studentToPrintPledge.pledgedKhurakiFee.toLocaleString()}/-</strong> প্রতি ইংরেজি মাসের ১০ তারিখের মধ্যে মাদ্রাসার বাইতুল মালে নিয়মিত পরিশোধ করিব।
                </p>
                <p>
                  যদি কোনো কারণে নির্ধারিত সময়ে ফি পরিশোধে অপারগ হই, তবে পূর্বাহ্নেই মুহতামিম মহোদয়কে অবহিত করিয়া যথাযথ অনুমতি গ্রহণ করিব। মাদ্রাসার হোস্টেলের যাবতীয় নিয়মাবলি, পরিচ্ছন্নতা ও সময়সূচি পালন করিতে আমার সন্তানকে সার্বক্ষণিক তাগিদ প্রদান করিব।
                </p>
              </div>

              {/* Official Signature Lines */}
              <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs text-gray-700">
                <div>
                  <div className="border-b border-gray-500 pb-1 font-bold">
                    {studentToPrintPledge.guardianName}
                  </div>
                  <span className="text-[11px] text-gray-500 mt-0.5 block">অভিভাবকের স্বাক্ষর ও তারিখ</span>
                </div>
                <div>
                  <div className="border-b border-gray-500 pb-1 font-bold">
                    মাওলানা নোমান হাবিব
                  </div>
                  <span className="text-[11px] text-gray-500 mt-0.5 block">নাজেমে দারুল ইকামাহ</span>
                </div>
                <div>
                  <div className="border-b border-gray-500 pb-1 font-bold">
                    মুহতামিম / অধ্যক্ষ
                  </div>
                  <span className="text-[11px] text-gray-500 mt-0.5 block">স্বাক্ষর ও অফিসিয়াল সিলমোহর</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
