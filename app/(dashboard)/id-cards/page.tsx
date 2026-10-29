/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { 
  Printer, CheckSquare, Square, QrCode, Sliders, 
  Settings2, Eye, Download, Image as ImageIcon,
  ChevronDown, ChevronUp, Loader2, Sparkles, Share2,
  X, ShieldCheck
} from "lucide-react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useApp } from "@/lib/context";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import OfficialWatermark from "@/components/OfficialWatermark";

interface Student {
  id: string;
  nameEn: string;
  nameBn: string;
  class: string;
  department: string;
  bloodGroup: string;
  primaryPhone: string;
  photoBase64: string;
  studentId: string;
  roll: string;
}

export default function IDCardsPage() {
  const { instituteSettings, students: centralStudents } = useApp();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.bn;

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Real-Time Sync with Central Master Student Database
  useEffect(() => {
    if (centralStudents && centralStudents.length > 0) {
      setStudents(centralStudents.map(s => ({
        id: s.id,
        studentId: s.studentId,
        roll: s.roll || '১',
        nameBn: s.nameBn || s.nameEn || 'শিক্ষার্থী',
        nameEn: s.nameEn || '',
        class: s.class || 'মিজান',
        department: s.department || 'কিতাব বিভাগ',
        academicYear: s.academicYear || '২০২৬-২০২৭',
        boardingStatus: s.boardingStatus || 'আবাসিক',
        bloodGroup: s.bloodGroup || 'A+',
        primaryPhone: s.primaryPhone || '—',
        photoBase64: s.photoBase64 || '',
      })));
      setLoading(false);
    }
  }, [centralStudents]);

  // Interactive QR Code Verification Modal State
  const [verifiedModalStudent, setVerifiedModalStudent] = useState<Student | null>(null);

  // Exporting state
  const [exportingId, setExportingId] = useState<string | null>(null);

  // Customizable Card Back Settings
  const [cardValidity, setCardValidity] = useState('২০২৬-২০২৭');
  const [cardHelpline, setCardHelpline] = useState('01339564967');
  const [cardAddress, setCardAddress] = useState(instituteSettings.address || 'ফরিদাবাদ, গেন্ডারিয়া, ঢাকা-১২০৪');
  const [customRules, setCustomRules] = useState<string[]>([
    'এই পরিচয়পত্রটি মাদ্রাসার সম্মানিত ছাত্রের জন্য সর্বদা সাথে রাখা বাধ্যতামূলক।',
    'ক্লাস, সেমিনার, পরীক্ষা ও খাবার/মেসে প্রবেশের সময় কার্ড প্রদর্শন করতে হবে।',
    'কার্ডটি হারিয়ে গেলে তাৎক্ষণিক মাদ্রাসা অফিসে অবহিত করুন।',
    'কার্ডটি হস্তান্তরযোগ্য নয়। পাওয়া গেলে মাদ্রাসায় জমা দেওয়ার অনুরোধ রইল।'
  ]);

  // Default mock students (preloaded including the user's Burhan Uddin from screenshot)
  const defaultStudents: Student[] = useMemo(() => [
    {
      id: 'burhan-uddin-6689',
      studentId: 'REG-2026-001',
      roll: '১',
      nameBn: 'বুরহান উদ্দিন',
      nameEn: 'Burhan Uddin',
      class: 'ইফতা',
      department: 'ইফতা বিভাগ',
      bloodGroup: 'A+',
      primaryPhone: '0172568565',
      photoBase64: '',
    },
    {
      id: 'miraz-faz-8775',
      studentId: 'REG-2026-002',
      roll: '১',
      nameBn: 'মেরাজুল ইসলাম',
      nameEn: 'Merajul Islam',
      class: 'মেশকাত',
      department: 'কিতাব বিভাগ',
      bloodGroup: 'B+',
      primaryPhone: '01339564967',
      photoBase64: '',
    },
    {
      id: 'labib-kit-1684',
      studentId: 'REG-2026-003',
      roll: '১',
      nameBn: 'লাবিব আহমেদ',
      nameEn: 'Labib Ahmed',
      class: 'নাহবেমীর',
      department: 'কিতাব বিভাগ',
      bloodGroup: 'O+',
      primaryPhone: '01812345678',
      photoBase64: '',
    },
  ], []);

  useEffect(() => {
    if (!db) {
      setStudents(defaultStudents);
      setSelectedIds(new Set(defaultStudents.map(s => s.id)));
      setLoading(false);
      return;
    }
    try {
      const q = query(collection(db, "students"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        if (data.length > 0) {
          const merged = [...data];
          defaultStudents.forEach(ds => {
            if (!merged.find(s => s.studentId === ds.studentId)) {
              merged.push(ds);
            }
          });
          setStudents(merged);
          setSelectedIds(new Set([merged[0].id]));
        } else {
          setStudents(defaultStudents);
          setSelectedIds(new Set(defaultStudents.map(s => s.id)));
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (e) {
      setStudents(defaultStudents);
      setSelectedIds(new Set(defaultStudents.map(s => s.id)));
      setLoading(false);
    }
  }, [defaultStudents]);

  const toggleSelectAll = () => {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map(s => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectedStudents = students.filter(s => selectedIds.has(s.id));

  // ─── Single Student Print Trigger ───
  const printSingleStudent = (id: string) => {
    setSelectedIds(new Set([id]));
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // ─── Dual-Side ID Card PDF Export Handler (html2canvas scale: 2.5) ───
  const exportCardAsPDF = async (frontElementId: string, backElementId: string, studentName: string, studentId: string) => {
    const exportKey = `pdf-${studentId}`;
    setExportingId(exportKey);
    try {
      if (typeof document !== 'undefined' && document.fonts) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, 150));

      const frontEl = document.getElementById(frontElementId);
      const backEl = document.getElementById(backElementId);
      if (!frontEl || !backEl) return;

      // 1. Capture Front ID Card container with scale: 2.5 (300+ DPI)
      const frontCanvas = await html2canvas(frontEl, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // 2. Capture Back ID Card container with scale: 2.5 (300+ DPI)
      const backCanvas = await html2canvas(backEl, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const frontImg = frontCanvas.toDataURL('image/png', 1.0);
      const backImg = backCanvas.toDataURL('image/png', 1.0);

      // Card Dimensions in mm (CR80 standard: 54mm x 85.6mm)
      const cardW = 54;
      const cardH = 85.6;
      const gap = 4; // 4mm clean spacing between front & back
      const totalW = cardW * 2 + gap; // 112mm
      const totalH = cardH; // 85.6mm

      // 3. Create PDF with exact tight bounding box and insert captured images
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [totalW, totalH],
      });

      // Insert Front card high-res image
      pdf.addImage(frontImg, 'PNG', 0, 0, cardW, cardH, undefined, 'FAST');

      // Insert Back card high-res image
      pdf.addImage(backImg, 'PNG', cardW + gap, 0, cardW, cardH, undefined, 'FAST');

      const cleanName = studentName.replace(/[\/\\:*?"<>|]/g, '').trim().replace(/\s+/g, '_');
      const cleanId = studentId.replace(/[\/\\:*?"<>|]/g, '').trim();
      const fileName = `${cleanName}_${cleanId}_ID_Card.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Dual card PDF export failed', err);
      window.print();
    } finally {
      setExportingId(null);
    }
  };

  // ─── High Resolution Image Export Handler (WhatsApp ready) ───
  const exportCardAsImage = async (cleanExportId: string, studentName: string, studentId: string) => {
    const exportKey = `img-${studentId}`;
    setExportingId(exportKey);
    try {
      if (typeof document !== 'undefined' && document.fonts) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));

      const el = document.getElementById(cleanExportId);
      if (!el) return;

      const canvas = await html2canvas(el, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: null, // Transparent background so no white margins
        logging: false,
      });

      const cleanName = studentName.replace(/[\/\\:*?"<>|]/g, '').trim().replace(/\s+/g, '_');
      const cleanId = studentId.replace(/[\/\\:*?"<>|]/g, '').trim();
      const fileName = `${cleanName}_${cleanId}_ID_Card.png`;
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error('Image export failed', err);
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* ─── Top Header & Primary Actions ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Printer size={26} />
            </span>
            {t.idcard_title || "ডিজিটাল স্মার্ট আইডি কার্ড ও পিডিএফ"}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {language === 'bn' 
              ? 'ফ্রন্ট ও ব্যাক (উভয় পিঠ) সমৃদ্ধ পিভিসি কার্ড প্রিন্ট এবং অভিভাবকদের জন্য সরাসরি ১-ক্লিকে পিডিএফ ডাউনলোড' 
              : 'Dual-side PVC ID Card Printing with instant PDF download for parents and students'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Link to Camera QR Attendance Scanner */}
          <Link 
            href="/meal-scanner"
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 px-4 py-2.5 rounded-xl font-semibold text-xs md:text-sm transition shadow-sm"
          >
            <QrCode size={17} className="text-emerald-400" /> 
            {language === 'bn' ? '📷 কিউআর ক্যামেরা স্ক্যানার' : '📷 QR Scanner'}
          </Link>

          {/* Print Button */}
          <button 
            onClick={() => window.print()}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition disabled:opacity-50 shadow-md flex-1 md:flex-none justify-center"
          >
            <Printer size={18} /> 
            {t.idcard_print_selected || "প্রিন্ট করুন"} ({selectedIds.size})
          </button>
        </div>
      </div>

      {/* ─── Main Grid: Student Selector (Left) & ID Card Previews (Right) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
        
        {/* Left Column: Student List Selection (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 max-h-[85vh] overflow-y-auto space-y-3">
          <div className="flex items-center justify-between border-b dark:border-slate-700 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {t.idcard_select_students || "শিক্ষার্থী তালিকা"}
              </h2>
              <span className="text-[11px] text-emerald-600 font-semibold">
                {selectedIds.size} / {students.length} জন নির্বাচিত
              </span>
            </div>
            <button 
              onClick={toggleSelectAll} 
              className="text-xs text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg transition"
            >
              {selectedIds.size === students.length ? (t.idcard_deselect_all || "সব বাতিল") : (t.idcard_select_all || "সব নির্বাচন")}
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-gray-400 text-xs">{t.idcard_loading || "লোড হচ্ছে..."}</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">{t.idcard_no_students || "কোনো শিক্ষার্থী পাওয়া যায়নি"}</div>
          ) : (
            <div className="space-y-1.5">
              {students.map((student) => {
                const isSelected = selectedIds.has(student.id);
                const sName = language === 'bn' && student.nameBn ? student.nameBn : student.nameEn;
                return (
                  <div 
                    key={student.id} 
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition border ${
                      isSelected 
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-xs' 
                        : 'hover:bg-gray-50 dark:hover:bg-slate-700/50 border-gray-100 dark:border-slate-700'
                    }`}
                    onClick={() => toggleSelect(student.id)}
                  >
                    <div className="text-emerald-600">
                      {isSelected ? <CheckSquare size={19} /> : <Square size={19} className="text-gray-400" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 dark:text-white text-xs truncate">
                        {sName}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{student.studentId}</span>
                        <span>•</span>
                        <span>{student.class}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Live Screen Previews & Direct PDF Download Buttons (8 cols) */}
        <div className="lg:col-span-8 bg-slate-100 dark:bg-slate-900/60 p-5 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col gap-6 items-center min-h-[500px]">
          {selectedStudents.length === 0 ? (
            <div className="text-center text-gray-400 my-auto space-y-2">
              <Printer size={40} className="mx-auto text-gray-300" />
              <p className="text-sm font-semibold">{t.idcard_preview_hint || "কার্ড দেখতে বাম পাশ থেকে শিক্ষার্থী নির্বাচন করুন"}</p>
            </div>
          ) : (
            selectedStudents.map(student => {
              const displayName = (language === 'bn' && student.nameBn) ? student.nameBn : (student.nameEn || student.nameBn);
              const cleanExportId = `clean-cards-${student.id}`;
              const frontId = `card-front-${student.id}`;
              const backId = `card-back-${student.id}`;

              return (
                <div 
                  key={student.id} 
                  className="w-full max-w-2xl bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-200/90 dark:border-slate-700 shadow-sm space-y-4"
                >
                  {/* Student Title Header & Quick Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b dark:border-slate-700 pb-3">
                    <div>
                      <h3 className="font-black text-base text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{displayName}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          {student.class}
                        </span>
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        আইডি: {student.studentId}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* 1. Primary Vector PDF / Native Print Button (100% Crisp Vector, ZERO distortion) */}
                      <button
                        onClick={() => printSingleStudent(student.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                        title="১০০% নিখুঁত ভেক্টর পিডিএফ হিসেবে সেভ করুন বা প্রিন্ট দিন (বাংলা লেখা বিন্দুমাত্র ভাঙবে না)"
                      >
                        <Printer size={14} />
                        <span>{language === 'bn' ? 'ভেক্টর পিডিএফ / প্রিন্ট' : 'Vector PDF / Print'}</span>
                      </button>

                      {/* 2. High-Quality Image Button (PNG for WhatsApp) */}
                      <button
                        onClick={() => exportCardAsImage(cleanExportId, displayName, student.studentId)}
                        disabled={exportingId === `img-${student.studentId}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition shadow-sm disabled:opacity-50"
                        title="হোয়াটসঅ্যাপে পাঠানোর জন্য এইচডি ছবি হিসেবে সেভ করুন"
                      >
                        {exportingId === `img-${student.studentId}` ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <ImageIcon size={14} />
                        )}
                        <span>{language === 'bn' ? 'কার্ড ছবি (PNG)' : 'Image (PNG)'}</span>
                      </button>

                      {/* 3. Direct PDF File Download Button */}
                      <button
                        onClick={() => exportCardAsPDF(frontId, backId, displayName, student.studentId)}
                        disabled={exportingId === `pdf-${student.studentId}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-emerald-400 border border-slate-700 rounded-lg text-xs font-bold transition shadow-sm disabled:opacity-50"
                        title="সরাসরি পিডিএফ ফাইল ডাউনলোড করুন"
                      >
                        {exportingId === `pdf-${student.studentId}` ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                        <span>{language === 'bn' ? 'পিডিএফ ফাইল' : 'Download PDF'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Modern PVC ID Card Display Area: Distinct Front & Back with No White Canvas */}
                  <div className="p-6 md:p-8 bg-slate-950/40 dark:bg-slate-950/80 rounded-2xl flex items-center justify-center border border-slate-800/60 shadow-inner">
                    <div 
                      id={cleanExportId}
                      className="inline-flex flex-col sm:flex-row items-center justify-center gap-8 bg-transparent"
                      style={{ backgroundColor: 'transparent', padding: 0, margin: 0, boxSizing: 'border-box' }}
                    >
                      {/* Front Side Card Container */}
                      <div 
                        id={frontId} 
                        className="rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 transition-all duration-300 hover:scale-[1.01]"
                        style={{ padding: 0, margin: 0, display: 'inline-block' }}
                      >
                        <IDCardFront 
                          student={student} 
                          instituteName={instituteSettings.name}
                          t={t}
                          language={language}
                          validity={cardValidity}
                        />
                      </div>

                      {/* Back Side Card Container */}
                      <div 
                        id={backId} 
                        className="rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 transition-all duration-300 hover:scale-[1.01]"
                        style={{ padding: 0, margin: 0, display: 'inline-block' }}
                      >
                        <IDCardBack 
                          student={student} 
                          instituteName={instituteSettings.name}
                          t={t}
                          language={language}
                          validity={cardValidity}
                          helpline={cardHelpline}
                          address={cardAddress}
                          instructions={customRules}
                          onScanClick={(st) => setVerifiedModalStudent(st)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ─── INTERACTIVE QR CODE VERIFICATION MODAL ─── */}
      {verifiedModalStudent && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setVerifiedModalStudent(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-emerald-600/40 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Royal Emerald Header */}
            <div className="bg-gradient-to-r from-[#064e3b] via-[#065f46] to-[#047857] text-white p-4 relative border-b border-amber-400/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">অফিসিয়াল শিক্ষার্থী ভেরিফিকেশন</h3>
                  <p className="text-[11px] text-emerald-200">{instituteSettings.name || 'জামিয়া আরাবিয়া ইমদাদুল উলুম ফরিদাবাদ মাদ্রাসা'}</p>
                </div>
              </div>
              <button 
                onClick={() => setVerifiedModalStudent(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                title="বন্ধ করুন"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col items-center">
              {/* Photo with Royal Dual Ring */}
              <div className="h-24 w-24 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 shadow-lg mb-3">
                <div className="h-full w-full rounded-full p-[2px] bg-[#065f46] overflow-hidden flex items-center justify-center">
                  <div className="h-full w-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                    {verifiedModalStudent.photoBase64 ? (
                      <img src={verifiedModalStudent.photoBase64} alt="" className="h-full w-full rounded-full object-cover object-center" />
                    ) : (
                      <div className="h-full w-full rounded-full bg-emerald-50 flex items-center justify-center text-[#065f46] font-bold text-3xl">
                        {(verifiedModalStudent.nameBn || verifiedModalStudent.nameEn)?.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Name */}
              <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">
                {verifiedModalStudent.nameBn || verifiedModalStudent.nameEn}
              </h2>
              {verifiedModalStudent.nameEn && verifiedModalStudent.nameBn && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{verifiedModalStudent.nameEn}</p>
              )}

              {/* Official Verified Badge */}
              <div className="mt-2.5 mb-4 inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/50 rounded-full shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  অফিসিয়ালি ভেরিফাইড শিক্ষার্থী ✅
                </span>
              </div>

              {/* Info Grid */}
              <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">শিক্ষার্থী আইডি:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{verifiedModalStudent.studentId || verifiedModalStudent.id}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">জামাত / শ্রেণী:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{verifiedModalStudent.class}</span>
                </div>
                {verifiedModalStudent.department && (
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-1.5">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">বিভাগ:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{verifiedModalStudent.department}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">রক্তের গ্রুপ:</span>
                  <span className="font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                    {verifiedModalStudent.bloodGroup || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">অভিভাবক ফোন:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{verifiedModalStudent.primaryPhone || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">শিক্ষাবর্ষ মেয়াদ:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{cardValidity}</span>
                </div>
              </div>

              {/* Official Seal / Verification Stamp */}
              <div className="mt-4 w-full p-2.5 rounded-xl border border-dashed border-emerald-600/40 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-emerald-700 dark:border-emerald-500 flex flex-col items-center justify-center p-0.5 text-center rotate-[-6deg]">
                    <span className="text-[7px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-tighter leading-none">VERIFIED</span>
                    <span className="text-[6px] text-amber-700 dark:text-amber-400 font-mono leading-none">তা'লীম</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-emerald-950 dark:text-emerald-200 leading-tight">ডিজিটাল অফিসিয়াল সিল ও সনদ</p>
                    <p className="text-[9.5px] text-slate-500 dark:text-slate-400">তা'লীম ইআরপি স্মার্ট কার্ড অথেনটিকেশন ডাটাবেজ</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800">
                  SECURE-OK
                </span>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setVerifiedModalStudent(null)}
                className="mt-5 w-full py-2.5 bg-gradient-to-r from-[#064e3b] via-[#065f46] to-[#047857] hover:opacity-90 text-white text-xs font-bold rounded-xl transition shadow-md"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PRINT ONLY CONTAINER (Direct Page Output) ─── */}
      <div id="print-area" className="hidden print:flex flex-wrap gap-6 justify-start items-start">
        {selectedStudents.map(student => (
          <div 
            key={student.id} 
            className="flex gap-4 items-center justify-center p-0 page-break-avoid"
          >
            <div className="print-card-box">
              <IDCardFront 
                student={student} 
                instituteName={instituteSettings.name}
                t={t}
                language={language}
                validity={cardValidity}
              />
            </div>
            <div className="print-card-box">
              <IDCardBack 
                student={student} 
                instituteName={instituteSettings.name}
                t={t}
                language={language}
                validity={cardValidity}
                helpline={cardHelpline}
                address={cardAddress}
                instructions={customRules}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ─── PRINT CSS STYLES (A4 & PVC Formats) ─── */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4;
            margin: 8mm;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: 'Hind Siliguri', 'Noto Sans Bengali', sans-serif !important;
          }
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 6mm !important;
            justify-content: flex-start !important;
            align-items: flex-start !important;
          }
          .print-card-box {
            width: 54mm !important;
            height: 85.6mm !important;
            overflow: hidden !important;
            display: inline-block !important;
            box-sizing: border-box !important;
          }
          .print-card-box > div {
            transform: scale(0.6375) !important;
            transform-origin: top left !important;
            box-shadow: none !important;
            border-color: #cbd5e1 !important;
          }
          .page-break-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}

// ─── COMPACT AUTHENTIC SCANNABLE QR CODE (CLEAN CANVAS) ───
function CleanQRCode({ text, size = 82 }: { text: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    QRCode.toCanvas(canvas, text, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#064e3b',
        light: '#ffffff',
      },
    }).then(() => {
      if (canvas) {
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        canvas.style.maxWidth = `${size}px`;
        canvas.style.maxHeight = `${size}px`;
      }
    }).catch((err) => {
      console.error('Error generating QR', err);
    });
  }, [text, size]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size}
      height={size}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        maxWidth: `${size}px`, 
        maxHeight: `${size}px`,
        display: 'block'
      }}
      className="object-contain block" 
    />
  );
}

// ─── 1. FRONT SIDE COMPONENT (Royal Islamic Theme, Lowered Photo & Name, Balanced Spacing) ───
function IDCardFront({ 
  student, 
  instituteName,
  t,
  language,
  validity
}: { 
  student: Student; 
  instituteName?: string;
  t: typeof translations.bn;
  language: string;
  validity: string;
}) {
  const displayName = (language === 'bn' && student.nameBn) ? student.nameBn : (student.nameEn || student.nameBn);
  
  const defaultMadrasahName = language === 'ar' ? 'الجامعة العربية إمداد العلوم فريد آباد، دكا' :
    language === 'en' ? 'Jamia Arabia Imdadul Uloom Faridabad, Dhaka' :
    'জামিয়া আরাবিয়া ইমদাদুল উলুম ফরিদাবাদ মাদ্রাসা, ঢাকা';

  const orgName = instituteName && instituteName.trim().length > 0 ? instituteName : defaultMadrasahName;

  const getDeptDisplay = (dept?: string) => {
    if (!dept) return '';
    const dLower = dept.toLowerCase().trim();
    if (dLower === 'ifta' || dLower === 'ইফতা') return 'ইফতা বিভাগ';
    if (dLower === 'kitab' || dLower === 'কিতাব') return 'কিতাব বিভাগ';
    if (dLower === 'hifz' || dLower === 'হিফজ') return 'হিফজ বিভাগ';
    if (dLower === 'noorani' || dLower === 'নূরানী') return 'নূরানী বিভাগ';
    if (dLower === 'general' || dLower === 'সাধারণ') return 'সাধারণ বিভাগ';
    return dept;
  };

  return (
    <div 
      className="w-[320px] h-[500px] bg-white rounded-2xl overflow-hidden flex flex-col justify-between relative print:shadow-none select-none text-slate-800 shadow-xl border border-slate-200/80"
      style={{ 
        width: '320px', 
        height: '500px', 
        minWidth: '320px', 
        minHeight: '500px', 
        maxWidth: '320px', 
        maxHeight: '500px', 
        boxSizing: 'border-box', 
        margin: 0,
        fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
        lineHeight: 1.5,
        letterSpacing: '0px',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      
      {/* Official Background Watermark Seal */}
      <OfficialWatermark instituteName={orgName} size={230} className="top-[45px]" opacity="opacity-[0.06] print:opacity-[0.09]" />

      {/* Top Header Background - Deep Royal Emerald Green (#065f46 to #047857) */}
      <div className="h-[106px] bg-gradient-to-b from-[#064e3b] via-[#065f46] to-[#047857] w-full flex flex-col items-center justify-start pt-2.5 px-3 text-white relative z-0 shrink-0 border-b border-amber-500/30">
        {/* Subtle top golden accent bar */}
        <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-1 opacity-90" />

        {/* Madrasah Name - With plenty of clearance so 'ঢাকা' is completely clear */}
        <div className="w-full px-1 text-center">
          <h3 
            className="font-bold text-white text-center text-[12.5px] leading-snug break-words tracking-tight drop-shadow-xs"
            title={orgName}
          >
            {orgName}
          </h3>
        </div>
      </div>
      
      {/* Photo with Dual Emerald & Golden Amber (#d97706) Ring Border - Lowered to top-[62px] */}
      <div className="absolute top-[62px] left-1/2 transform -translate-x-1/2 z-20">
        <div className="h-[96px] w-[96px] rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-[#d97706] to-amber-400 shadow-md">
          <div className="h-full w-full rounded-full p-[2px] bg-[#065f46] overflow-hidden flex items-center justify-center">
            <div className="h-full w-full rounded-full bg-white overflow-hidden flex items-center justify-center">
              {student.photoBase64 ? (
                <img src={student.photoBase64} alt="" className="h-full w-full rounded-full object-cover object-center" />
              ) : (
                <div className="h-full w-full rounded-full bg-emerald-50 flex items-center justify-center text-[#065f46] font-bold text-2xl">
                  {displayName?.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body Details - Lowered with balanced spacing */}
      <div className="pt-[60px] px-4 flex-1 flex flex-col items-center justify-between pb-1.5">
        <div className="w-full flex flex-col items-center">
          <h4 className="text-[17.5px] font-bold text-[#0f172a] text-center tracking-normal leading-tight px-1">
            {displayName}
          </h4>
          <div className="bg-emerald-50 text-[#065f46] border border-emerald-300/80 text-[11px] font-bold px-3 py-0.5 rounded-full uppercase mt-1 mb-2 shadow-xs">
            {t.idcard_badge_student || "শিক্ষার্থী"}
          </div>

          {/* Student Info Table - Clean Crisp White with Dark Typography (#0f172a) */}
          <div className="w-full bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/80 space-y-1.5 shadow-xs">
            <div className="flex justify-between items-center border-b border-slate-200/70 pb-1 leading-normal">
              <span className="text-xs font-semibold text-slate-500 leading-normal">{t.idcard_field_id || "আইডি নং"}</span>
              <span className="text-xs font-mono font-bold text-[#0f172a] leading-normal">{student.studentId || '-'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/70 pb-1 leading-normal">
              <span className="text-xs font-semibold text-slate-500 leading-normal">{t.idcard_field_class || "জামাত"}</span>
              <span className="text-xs font-bold text-slate-800 leading-normal">{student.class}</span>
            </div>
            {student.department && (
              <div className="flex justify-between items-center border-b border-slate-200/70 pb-1 leading-normal">
                <span className="text-xs font-semibold text-slate-500 leading-normal">{language === 'bn' ? 'বিভাগ' : 'Dept'}</span>
                <span className="text-xs font-bold text-slate-800 break-words leading-normal">{getDeptDisplay(student.department)}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-b border-slate-200/70 pb-1 leading-normal">
              <span className="text-xs font-semibold text-slate-500 leading-normal">{t.idcard_field_blood || "রক্তের গ্রুপ"}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 leading-normal">{student.bloodGroup || '-'}</span>
            </div>
            <div className="flex justify-between items-center pt-0.5 leading-normal">
              <span className="text-xs font-semibold text-slate-500 leading-normal">{t.idcard_field_phone || "ফোন নম্বর"}</span>
              <span className="text-xs font-bold text-slate-800 leading-normal">{student.primaryPhone || '-'}</span>
            </div>
          </div>
        </div>

        {/* Signature & Validity Area */}
        <div className="w-full pt-2 pb-0.5 flex justify-between items-end px-2">
          <div className="text-left leading-tight">
            <span className="text-[10px] font-semibold text-slate-400 block leading-none">শিক্ষাবর্ষ</span>
            <span className="text-xs font-bold text-[#065f46] block leading-tight mt-0.5">{validity}</span>
          </div>
          <div className="text-center flex flex-col items-center leading-tight">
            <div className="w-20 border-b border-slate-400 mb-1 border-dashed" />
            <span className="text-[11px] font-semibold text-slate-700 leading-tight">মুহতামিম / অধ্যক্ষ</span>
          </div>
        </div>
      </div>

      {/* Footer Bar - Deep Royal Emerald Green (#065f46) */}
      <div className="h-7 bg-gradient-to-r from-[#064e3b] via-[#065f46] to-[#064e3b] w-full flex items-center justify-between px-4 border-t border-amber-400/40 shrink-0">
        <p className="text-[10px] font-semibold text-emerald-100">জ্ঞানই আলো • আইডি কার্ড</p>
        <p className="text-[10.5px] font-bold text-amber-300 tracking-wider">TALEEM ERP</p>
      </div>
    </div>
  );
}

// ─── 2. BACK SIDE COMPONENT (Compact Lowered QR Code, Clean Surface, Touch to Verify) ───
function IDCardBack({ 
  student, 
  instituteName,
  t,
  language,
  validity,
  helpline,
  address,
  instructions,
  onScanClick,
}: { 
  student: Student; 
  instituteName?: string;
  t: typeof translations.bn;
  language: string;
  validity: string;
  helpline: string;
  address: string;
  instructions: string[];
  onScanClick?: (student: Student) => void;
}) {
  const displayName = (language === 'bn' && student.nameBn) ? student.nameBn : (student.nameEn || student.nameBn);
  const defaultMadrasahName = language === 'ar' ? 'الجامعة العربية إمداد العلوم فريد آباد، دكا' :
    language === 'en' ? 'Jamia Arabia Imdadul Uloom Faridabad, Dhaka' :
    'জামিয়া আরাবিয়া ইমদাদুল উলুম ফরিদাবাদ মাদ্রাসা, ঢাকা';

  const orgName = instituteName && instituteName.trim().length > 0 ? instituteName : defaultMadrasahName;

  // The QR text payload: Verified status and student credentials for instant smartphone camera scanning
  const qrPayload = `✅ ভেরিফাইড শিক্ষার্থী | তা'লীম ইআরপি
👤 নাম: ${displayName}
🆔 আইডি নং: ${student.studentId || student.id}
📚 জামাত: ${student.class}${student.department ? ` (${student.department})` : ''}
🩸 রক্তের গ্রুপ: ${student.bloodGroup || '-'}
📞 মোবাইল: ${student.primaryPhone || '-'}
🏛️ প্রতিষ্ঠান: ${orgName}
📅 শিক্ষাবর্ষ: ${validity}`;

  return (
    <div 
      className="w-[320px] h-[500px] bg-white rounded-2xl overflow-hidden flex flex-col justify-between relative print:shadow-none select-none text-slate-800 shadow-xl border border-slate-200/80"
      style={{ 
        width: '320px', 
        height: '500px', 
        minWidth: '320px', 
        minHeight: '500px', 
        maxWidth: '320px', 
        maxHeight: '500px', 
        boxSizing: 'border-box', 
        margin: 0,
        fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
        lineHeight: 1.5,
        letterSpacing: '0px',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      
      {/* Official Background Watermark Seal */}
      <OfficialWatermark instituteName={orgName} size={230} className="top-[30px]" opacity="opacity-[0.06] print:opacity-[0.09]" />

      {/* Top Header - Deep Royal Emerald Green (#065f46) */}
      <div className="h-[58px] bg-gradient-to-r from-[#064e3b] via-[#065f46] to-[#064e3b] w-full flex flex-col items-center justify-center px-3 text-white shrink-0 border-b border-amber-500/30">
        <span className="text-xs font-bold text-amber-300 uppercase tracking-wide leading-tight">
          {language === 'bn' ? 'জরুরি নির্দেশনাবলী ও কিউআর কোড' : 'Instructions & QR Code'}
        </span>
        <span className="text-[11.5px] text-emerald-100 font-semibold leading-tight text-center mt-0.5 break-words">
          {orgName}
        </span>
      </div>

      {/* Main Body - QR Code Lowered and Spaced Out Nicely */}
      <div className="px-4 py-2 flex-1 flex flex-col items-center justify-between">
        
        {/* Compact Scannable QR Code - Lowered with safe margins, strictly sized */}
        <div className="flex flex-col items-center mt-2 mb-1">
          <div 
            onClick={() => onScanClick?.(student)}
            className="p-1.5 bg-white border-2 border-emerald-600/60 hover:border-amber-500 rounded-xl shadow-sm w-[94px] h-[94px] max-w-[94px] max-h-[94px] flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 group relative select-none overflow-hidden"
            title="শিক্ষার্থীর প্রোফাইল ভেরিফিকেশন দেখতে ক্লিক বা টাচ করুন"
          >
            <CleanQRCode text={qrPayload} size={82} />
            <div className="absolute inset-0 bg-emerald-950/25 opacity-0 group-hover:opacity-100 rounded-xl transition flex items-center justify-center print:hidden">
              <span className="bg-[#064e3b] text-amber-300 font-bold text-[9px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                <QrCode size={10} /> টাচ করুন
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-800 mt-1 leading-none">
            ID: {student.studentId || '-'}
          </span>
        </div>

        {/* Instructions / Terms List */}
        <div className="w-full bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/80 text-left space-y-0.5">
          <span className="text-xs font-bold text-emerald-950 block border-b border-slate-200 pb-0.5 leading-tight">
            {language === 'bn' ? 'মাদ্রাসার জরুরি নিয়মাবলী:' : 'Card Rules:'}
          </span>
          <ul className="space-y-0.5">
            {instructions.slice(0, 4).map((rule, idx) => (
              <li key={idx} className="text-[10px] text-slate-700 font-medium leading-[1.35] flex items-start gap-1">
                <span className="text-[#065f46] font-bold">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact & Return Notice */}
        <div className="w-full text-center bg-emerald-950/5 rounded-xl px-2.5 py-1.5 border border-emerald-100 flex flex-col justify-center gap-0.5">
          <p className="text-[10px] text-slate-600 font-medium leading-normal">
            কার্ডটি পাওয়া গেলে নিম্নোক্ত ঠিকানায় পৌঁছে দেওয়ার অনুরোধ রইল:
          </p>
          <p className="text-xs font-bold text-[#0f172a] leading-normal break-words">
            {address}
          </p>
          <p className="text-xs font-bold text-[#065f46] leading-normal">
            হেল্পলাইন: {helpline}
          </p>
        </div>
      </div>

      {/* Footer Bar - Deep Royal Emerald Green (#065f46) */}
      <div className="h-7 bg-gradient-to-r from-[#064e3b] via-[#065f46] to-[#064e3b] w-full flex items-center justify-between px-4 border-t border-amber-400/40 shrink-0">
        <p className="text-[10px] font-semibold text-emerald-200">মেয়াদ: {validity}</p>
        <p className="text-[10.5px] font-bold text-amber-300 tracking-wider">TALEEM ERP</p>
      </div>
    </div>
  );
}
