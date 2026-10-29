'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import jsQR from 'jsqr';
import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/lib/context';
import { translations } from '@/lib/translations';
import { Student } from '@/lib/studentsData';
import { 
  Camera, QrCode, Search, CheckCircle2, AlertTriangle, XCircle, 
  Utensils, UserCheck, Cpu, Volume2, RotateCcw, ShieldCheck, Clock, User,
  BookOpen, Sparkles
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

interface StudentData {
  id: string;
  studentId: string;
  roll: string;
  name: string;
  className: string;
  department: string;
  boardingStatus: string;
  photo: string;
}

interface ScanLog {
  id: string;
  studentName: string;
  roll: string;
  time: string;
  mealSession: string;
  status: 'approved' | 'duplicate' | 'ineligible';
  message: string;
}

export default function MealScannerPage() {
  const { language } = useLanguage();
  const { students: centralStudents } = useApp();
  const t = translations[language as keyof typeof translations] || translations.bn;

  const [mode, setMode] = useState<'meal' | 'class' | 'biometric'>('meal');
  const [mealSession, setMealSession] = useState<string>(t.boarding_lunch);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');

  const [selectedScannerId, setSelectedScannerId] = useState('cam-01');
  const [manualCodeInput, setManualCodeInput] = useState('');

  const [biometricIp, setBiometricIp] = useState('192.168.1.201');
  const [biometricPort, setBiometricPort] = useState('4370');
  const [biometricConnected, setBiometricConnected] = useState(false);
  
  // Last scanned student status
  const [scannedResult, setScannedResult] = useState<{
    student: StudentData;
    status: 'approved' | 'duplicate' | 'ineligible';
    message: string;
    timestamp: string;
  } | null>(null);

  // Today's meal consumption registry (prevent duplicates)
  const [consumedRegistry, setConsumedRegistry] = useState<Record<string, string>>({
    '103': '08:20 AM',
    '১০৩': 'সকাল ০৮:২০',
  });

  // Logs
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([
    { 
      id: '1', 
      studentName: language === 'bn' ? 'আব্দুর রহমান' : language === 'ar' ? 'عبد الرحمن' : 'Abdur Rahman', 
      roll: language === 'bn' ? '১০৩' : language === 'ar' ? '١٠٣' : '103', 
      time: '12:45 PM', 
      mealSession: t.boarding_lunch, 
      status: 'duplicate', 
      message: t.scanner_duplicate 
    },
    { 
      id: '2', 
      studentName: language === 'bn' ? 'মুহাম্মদ হাসান' : language === 'ar' ? 'محمد حسن' : 'Muhammad Hasan', 
      roll: language === 'bn' ? '১০৪' : language === 'ar' ? '١٠٤' : '104', 
      time: '12:40 PM', 
      mealSession: t.boarding_lunch, 
      status: 'approved', 
      message: t.scanner_approved 
    },
  ]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastScannedCodeRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);

  // Localized student database built from central master student database
  const mockStudents: Record<string, StudentData> = useMemo(() => {
    const map: Record<string, StudentData> = {};

    if (centralStudents && centralStudents.length > 0) {
      centralStudents.forEach((s: Student) => {
        const studentObj: StudentData = {
          id: s.id,
          studentId: s.studentId,
          roll: s.roll,
          name: s.nameBn || s.nameEn || 'শিক্ষার্থী',
          className: s.class || 'মিজান',
          department: s.department || 'কিতাব বিভাগ',
          boardingStatus: s.boardingStatus || 'আবাসিক',
          photo: s.photoBase64 || '',
        };
        map[s.studentId] = studentObj;
        map[s.id] = studentObj;
        if (s.roll) map[s.roll] = studentObj;
      });
    }

    return map;
  }, [centralStudents]);


  // Play audio beep
  const playSound = (type: 'success' | 'error') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch (e) {
      console.log('Audio context not supported');
    }
  };

  const [firestoreStudents, setFirestoreStudents] = useState<StudentData[]>([]);

  useEffect(() => {
    if (!db) return;
    try {
      const q = query(collection(db, "students"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            studentId: d.studentId || doc.id,
            roll: d.roll || d.studentId || doc.id,
            name: (language === 'bn' && d.nameBn) ? d.nameBn : (d.nameEn || d.nameBn || 'শিক্ষার্থী'),
            className: d.class || 'সাধারণ',
            department: d.department || 'সাধারণ',
            boardingStatus: d.boardingStatus || 'আবাসিক',
            photo: d.photoBase64 || '',
          } as StudentData;
        });
        setFirestoreStudents(data);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firestore error in scanner", e);
    }
  }, [language]);

  // Process Student Attendance / Verification
  const verifyStudent = (rollOrId: string) => {
    let cleanId = rollOrId.trim();

    // 0. Smart extraction if QR contains formatted multi-line text or JSON
    if (cleanId.includes('ID:')) {
      const match = cleanId.match(/ID:\s*([^\s\n\r]+)/i);
      if (match && match[1]) {
        cleanId = match[1].trim();
      }
    } else if (cleanId.startsWith('{') && cleanId.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleanId);
        if (parsed.id || parsed.studentId) {
          cleanId = String(parsed.studentId || parsed.id).trim();
        }
      } catch (e) {}
    }

    const cleanIdLower = cleanId.toLowerCase();

    // 1. Match from live Firestore students
    const fsFound = firestoreStudents.find(s => 
      s.studentId?.toLowerCase() === cleanIdLower ||
      s.roll?.toLowerCase() === cleanIdLower ||
      s.id?.toLowerCase() === cleanIdLower ||
      s.name?.toLowerCase() === cleanIdLower
    );

    // 2. Match from mock database or fallback
    const student = fsFound || mockStudents[cleanId] || mockStudents[cleanId.toUpperCase()] || {
      id: cleanId,
      studentId: cleanId.startsWith('2026-') ? cleanId : `2026-GEN-${cleanId}`,
      roll: cleanId,
      name: `${language === 'bn' ? 'শিক্ষার্থী' : language === 'ar' ? 'طالب' : 'Student'} (${cleanId})`,
      className: language === 'bn' ? 'সাধারণ জামাত' : language === 'ar' ? 'المرحلة العامة' : 'General Grade',
      department: language === 'bn' ? 'ইসলামিক স্টাডিজ' : language === 'ar' ? 'الدراسات الإسلامية' : 'Islamic Studies',
      boardingStatus: language === 'bn' ? 'আবাসিক' : language === 'ar' ? 'مقيم' : 'Residential',
      photo: '',
    };

    const timeStr = new Date().toLocaleTimeString(language === 'bn' ? 'bn-BD' : language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });

    if (mode === 'meal') {
      // Check boarding eligibility
      if (student.boardingStatus === 'অনাবাসিক' || student.boardingStatus === 'Non-Resident' || student.boardingStatus === 'خارجي') {
        playSound('error');
        setScannedResult({
          student,
          status: 'ineligible',
          message: t.scanner_ineligible,
          timestamp: timeStr,
        });
        setScanLogs([
          { id: String(Date.now()), studentName: student.name, roll: student.roll, time: timeStr, mealSession, status: 'ineligible', message: t.scanner_ineligible },
          ...scanLogs
        ]);
        return;
      }

      // Check duplicate
      const registryKey = `${student.roll}_${mealSession}`;
      if (consumedRegistry[registryKey]) {
        playSound('error');
        setScannedResult({
          student,
          status: 'duplicate',
          message: `${t.scanner_duplicate} (${consumedRegistry[registryKey]})`,
          timestamp: timeStr,
        });
        setScanLogs([
          { id: String(Date.now()), studentName: student.name, roll: student.roll, time: timeStr, mealSession, status: 'duplicate', message: t.scanner_duplicate },
          ...scanLogs
        ]);
        return;
      }

      // Approved!
      playSound('success');
      setConsumedRegistry({
        ...consumedRegistry,
        [registryKey]: `${timeStr}`
      });

      setScannedResult({
        student,
        status: 'approved',
        message: `${t.scanner_approved} (${mealSession})`,
        timestamp: timeStr,
      });

      setScanLogs([
        { id: String(Date.now()), studentName: student.name, roll: student.roll, time: timeStr, mealSession, status: 'approved', message: t.scanner_approved },
        ...scanLogs
      ]);
    } else {
      // Class / Namaz mode
      playSound('success');
      setScannedResult({
        student,
        status: 'approved',
        message: language === 'bn' ? '✅ ক্লাসে উপস্থিতি নিশ্চিত করা হয়েছে!' : language === 'ar' ? '✅ تم تأكيد الحضور في الحصة بنجاح!' : '✅ Class attendance confirmed!',
        timestamp: timeStr,
      });

      setScanLogs([
        { id: String(Date.now()), studentName: student.name, roll: student.roll, time: timeStr, mealSession: t.scanner_tab_class, status: 'approved', message: 'Present' },
        ...scanLogs
      ]);
    }
  };

  const verifyStudentRef = useRef(verifyStudent);
  useEffect(() => {
    verifyStudentRef.current = verifyStudent;
  });

  const startScanning = () => {
    const scanFrame = async () => {
      if (!videoRef.current) return;
      const video = videoRef.current;

      if (video.readyState >= 2) {
        let canvas = canvasRef.current;
        if (!canvas) {
          canvas = document.createElement('canvas');
          canvasRef.current = canvas;
        }

        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }
        }

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          let detectedText: string | null = null;

          // 1. Try native BarcodeDetector if available (hardware acceleration)
          if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
            try {
              const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
              const codes = await barcodeDetector.detect(canvas);
              if (codes && codes.length > 0 && codes[0].rawValue) {
                detectedText = codes[0].rawValue;
              }
            } catch (e) {
              // Ignore and use jsQR fallback
            }
          }

          // 2. jsQR universal decoder
          if (!detectedText && imageData) {
            try {
              const qrResult = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
              });
              if (qrResult && qrResult.data) {
                detectedText = qrResult.data;
              }
            } catch (err) {
              // Frame decoding error ignored
            }
          }

          if (detectedText) {
            const cleanText = detectedText.trim();
            const now = Date.now();
            // Debounce: prevent same code scanning within 2.5s
            if (cleanText !== lastScannedCodeRef.current || (now - lastScannedTimeRef.current) > 2500) {
              lastScannedCodeRef.current = cleanText;
              lastScannedTimeRef.current = now;
              verifyStudentRef.current(cleanText);
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
          startScanning();
        }
      } else {
        setCameraError(language === 'bn' ? 'ক্যামেরা সাপোর্ট পাওয়া যায়নি।' : language === 'ar' ? 'الكاميرا غير مدعومة في هذا الجهاز.' : 'Camera not supported.');
      }
    } catch (err: any) {
      setCameraError(language === 'bn' ? 'ক্যামেরা পারমিশন প্রয়োজন।' : language === 'ar' ? 'يرجى السماح بالوصول إلى الكামেরা.' : 'Camera permission required.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    verifyStudent(manualInput);
    setManualInput('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <QrCode className="text-emerald-600" />
            {t.scanner_title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {t.scanner_subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/id-cards"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-slate-600 hover:bg-emerald-100 transition shadow-sm"
          >
            <BookOpen size={15} />
            {language === 'bn' ? '📇 আইডি কার্ড ও কিউআর প্রিন্ট করুন' : language === 'ar' ? '📇 طباعة البطاقات الذكية' : 'Print Student ID Cards'}
          </Link>

          {/* Mode Selector */}
          <div className="flex bg-gray-100 dark:bg-slate-700/60 p-1 rounded-lg">
          <button
            onClick={() => setMode('meal')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
              mode === 'meal' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
            }`}
          >
            <Utensils size={14} />
            {t.scanner_tab_meal}
          </button>
          <button
            onClick={() => setMode('class')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
              mode === 'class' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
            }`}
          >
            <UserCheck size={14} />
            {t.scanner_tab_class}
          </button>
          <button
            onClick={() => setMode('biometric')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
              mode === 'biometric' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
            }`}
          >
            <Cpu size={14} />
            {t.scanner_tab_biometric}
          </button>
        </div>
        </div>
      </div>

      {mode !== 'biometric' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Camera Viewfinder & Manual Fallback (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Meal Session Selector */}
            {mode === 'meal' && (
              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Clock size={15} className="text-emerald-600" />
                  {language === 'bn' ? 'বর্তমান খাবার অধিবেশন:' : language === 'ar' ? 'فترة الوجبة الحالية:' : 'Current Meal Session:'}
                </span>
                <div className="flex gap-1.5">
                  {[t.boarding_breakfast, t.boarding_lunch, t.boarding_dinner].map(session => (
                    <button
                      key={session}
                      onClick={() => setMealSession(session)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                        mealSession === session 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {session}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Camera Viewfinder Box */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-700 relative flex flex-col items-center justify-center min-h-[340px]">
              
              <video
                ref={videoRef}
                playsInline
                className={`w-full h-[340px] object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />

              {/* Viewfinder Target Graphic */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-56 h-56 border-2 border-dashed border-emerald-400 rounded-2xl animate-pulse relative flex items-center justify-center">
                    <div className="w-full h-0.5 bg-red-500/80 absolute top-1/2 -translate-y-1/2 shadow-[0_0_8px_#ef4444]" />
                    <span className="text-[10px] text-emerald-300 bg-black/60 px-2 py-0.5 rounded-full absolute -top-3">
                      {language === 'bn' ? 'আইডি কার্ডের QR কোড এখানে ধরুন' : language === 'ar' ? 'وجّه رمز QR أمام الكاميرا' : 'Align QR Code inside the frame'}
                    </span>
                  </div>
                </div>
              )}

              {/* Placeholder / Inactive State */}
              {!cameraActive && (
                <div className="text-center p-6 text-slate-300 space-y-3">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <Camera size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {language === 'bn' ? 'মোবাইল / ওয়েবক্যাম ক্যামেরা বন্ধ রয়েছে' : language === 'ar' ? 'كاميرا الهاتف / الويب غير مفعلة' : 'Camera is currently inactive'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {language === 'bn' ? 'ছাত্রদের আইডি কার্ডের কিউআর কোড স্ক্যান করতে ক্যামেরা সক্রিয় করুন' : language === 'ar' ? 'قم بتشغيل الكاميرا لمسح بطاقات الطلاب الذكية' : 'Start camera to scan student ID cards'}
                    </p>
                  </div>
                  <button
                    onClick={startCamera}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2 mx-auto"
                  >
                    <Camera size={18} />
                    {t.scanner_start_camera}
                  </button>
                </div>
              )}

              {/* Camera Active Controls Bar */}
              {cameraActive && (
                <div className="absolute bottom-3 inset-x-3 bg-black/70 backdrop-blur-sm p-2 rounded-xl flex justify-between items-center text-xs text-white">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {language === 'bn' ? 'ক্যামেরা স্ক্যানার সক্রিয়' : language === 'ar' ? 'الكاميرا نشطة' : 'Camera active'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => verifyStudent(language === 'bn' ? '১০১' : language === 'ar' ? '١٠١' : '101')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded font-medium"
                    >
                      {language === 'bn' ? 'টেস্ট স্ক্যান' : language === 'ar' ? 'مسح تجريبي' : 'Test Scan'}
                    </button>
                    <button
                      onClick={stopCamera}
                      className="bg-red-600/80 hover:bg-red-700 text-white px-2.5 py-1 rounded font-medium"
                    >
                      {t.scanner_stop_camera}
                    </button>
                  </div>
                </div>
              )}

              {cameraError && (
                <div className="p-3 bg-red-900/60 text-red-200 text-xs text-center border-t border-red-800 w-full">
                  {cameraError}
                </div>
              )}
            </div>

            {/* Manual Roll / ID Fallback Box */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <form onSubmit={handleManualSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder={t.scanner_manual_search}
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap"
                >
                  {language === 'bn' ? 'যাচাই করুন' : language === 'ar' ? 'تحقق' : 'Verify'}
                </button>
              </form>
            </div>

            {/* Quick 1-Click Simulation & Demo Scan Chips */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <Sparkles size={15} />
                  {language === 'bn' ? 'দ্রুত টেস্ট ও ডেমো শিক্ষার্থী স্ক্যান (ক্লিক করুন):' : language === 'ar' ? 'مسح تجريبي سريع للطلاب (اضغط للتجربة):' : 'Quick Test & Student Simulation (Click):'}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  1-Click Test
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => verifyStudent('2026-FAZ-8775')}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-lg text-xs font-medium border border-emerald-300/60 transition flex items-center gap-1"
                >
                  <User size={13} /> মিরাজ (2026-FAZ-8775)
                </button>
                <button
                  type="button"
                  onClick={() => verifyStudent('2026-KIT-1684')}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-lg text-xs font-medium border border-emerald-300/60 transition flex items-center gap-1"
                >
                  <User size={13} /> লাবিব (2026-KIT-1684)
                </button>
                <button
                  type="button"
                  onClick={() => verifyStudent(language === 'bn' ? '১০১' : '101')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition"
                >
                  আব্দুল্লাহ (১০১)
                </button>
                <button
                  type="button"
                  onClick={() => verifyStudent(language === 'bn' ? '১০২' : '102')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition"
                >
                  উমর ফারুক (১০২)
                </button>
                {firestoreStudents.slice(0, 4).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => verifyStudent(st.studentId || st.roll)}
                    className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300 rounded-lg text-xs font-medium border border-teal-200 dark:border-teal-800 transition"
                  >
                    {st.name} ({st.roll})
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Scan Result Card & Verification Badge (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Scanned Student Profile Dossier */}
            <div className={`p-6 rounded-2xl border-2 shadow-lg transition-all ${
              !scannedResult 
                ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-center text-gray-400 py-12' 
                : scannedResult.status === 'approved' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500' 
                  : scannedResult.status === 'duplicate' 
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500' 
                    : 'bg-red-50 dark:bg-red-950/40 border-red-500'
            }`}>
              
              {!scannedResult ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <User size={32} />
                  </div>
                  <h3 className="font-bold text-gray-700 dark:text-gray-200">
                    {language === 'bn' ? 'কোনো শিক্ষার্থী এখনও স্ক্যান করা হয়নি' : language === 'ar' ? 'لم يتم مسح أي طالب بعد' : 'No student scanned yet'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {language === 'bn' ? 'ক্যামেরায় কিউআর স্ক্যান করলে বা রোল লিখে সার্চ করলে শিক্ষার্থীর তথ্য প্রদর্শিত হবে।' : language === 'ar' ? 'امسح البطاقة أو اكتب رقم الطالب لعرض الملف والتحقق الفوري.' : 'Scan QR code or search by roll number to verify student details.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Status Banner */}
                  <div className={`p-3.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm ${
                    scannedResult.status === 'approved'
                      ? 'bg-emerald-600 text-white'
                      : scannedResult.status === 'duplicate'
                        ? 'bg-amber-600 text-white'
                        : 'bg-red-600 text-white'
                  }`}>
                    {scannedResult.status === 'approved' && <CheckCircle2 size={20} />}
                    {scannedResult.status === 'duplicate' && <AlertTriangle size={20} />}
                    {scannedResult.status === 'ineligible' && <XCircle size={20} />}
                    <span>{scannedResult.message}</span>
                  </div>

                  {/* Student Photo & Details */}
                  <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-slate-700 border-2 border-emerald-600 flex items-center justify-center text-emerald-700 font-bold text-2xl flex-shrink-0">
                      {scannedResult.student.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                        {scannedResult.student.name}
                      </h3>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        {t.marksheet_roll}: {scannedResult.student.roll} | ID: {scannedResult.student.studentId}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {scannedResult.student.className} ({scannedResult.student.department})
                      </p>
                    </div>
                  </div>

                  {/* Quota Badges */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border dark:border-slate-700">
                      <span className="text-gray-400 block text-[10px]">{language === 'bn' ? 'আবাসিক অবস্থা' : language === 'ar' ? 'حالة السكن' : 'Boarding Status'}</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {scannedResult.student.boardingStatus}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border dark:border-slate-700">
                      <span className="text-gray-400 block text-[10px]">{language === 'bn' ? 'যাচাইয়ের সময়' : language === 'ar' ? 'وقت التحقق' : 'Verified At'}</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{scannedResult.timestamp}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => setScannedResult(null)}
                    className="w-full text-center text-xs py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 rounded-lg transition font-semibold"
                  >
                    {language === 'bn' ? 'পরবর্তী শিক্ষার্থী স্ক্যান করুন' : language === 'ar' ? 'مسح الطالب التالي' : 'Scan Next Student'}
                  </button>
                </div>
              )}

            </div>

            {/* Recent Verification History Log */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                <span>{language === 'bn' ? 'আজকের সাম্প্রতিক স্ক্যান লগ' : language === 'ar' ? 'سجل العمليات الأخير' : 'Recent Scan Activity'}</span>
                <span className="text-[10px] text-gray-400">{scanLogs.length} entries</span>
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {scanLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-slate-700/40 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{log.studentName} ({log.roll})</span>
                      <span className="text-[10px] text-gray-400 block">{log.mealSession} • {log.time}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* ─── TAB 3: HARDWARE BIOMETRIC API INTEGRATION ─── */
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="text-center border-b pb-4 dark:border-slate-700">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Cpu size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {language === 'bn' ? 'হার্ডওয়্যার বায়োমেট্রিক ও ফিঙ্গারপ্রিন্ট সংযোগ' : language === 'ar' ? 'ربط أجهزة البصمة البيومترية' : 'Hardware Biometric Integration'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {language === 'bn' ? 'ZKTeco বা USB ফিঙ্গারপ্রিন্ট ডিভাইসের সাথে লোকাল নেটওয়ার্কের মাধ্যমে সিঙ্ক' : language === 'ar' ? 'مزامنة أجهزة ZKTeco وأجهزة الحضور الذكية عبر الشبكة المحلية' : 'Local LAN integration for ZKTeco, Realtime & USB fingerprint terminals'}
            </p>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {language === 'bn' ? 'ডিভাইস আইপি অ্যাড্রেস (Device LAN IP)' : language === 'ar' ? 'عنوان IP للجهاز' : 'Device LAN IP Address'}
              </label>
              <input
                type="text"
                value={biometricIp}
                onChange={(e) => setBiometricIp(e.target.value)}
                placeholder="192.168.1.201"
                className="w-full p-2.5 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {language === 'bn' ? 'ডিভাইস পোর্ট (Port Number)' : language === 'ar' ? 'منفذ الجهاز (Port)' : 'Device Port'}
              </label>
              <input
                type="text"
                value={biometricPort}
                onChange={(e) => setBiometricPort(e.target.value)}
                placeholder="4370"
                className="w-full p-2.5 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 font-mono text-sm"
              />
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
              <ShieldCheck className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <p className="font-bold">
                  {language === 'bn' ? 'ওয়েবহুক ও ক্লাউড সিঙ্ক প্রস্তুত' : language === 'ar' ? 'جاهز للمزامنة السحابية' : 'Cloud API Ready'}
                </p>
                <p>
                  {language === 'bn' ? 'ZKTime বা Standalone SDK চালু থাকলে স্বয়ংক্রিয়ভাবে হাজিরা Firebase Cloud-এ পুশ হবে।' : language === 'ar' ? 'يتم دفع سجلات الحضور تلقائياً إلى السحابة عبر Firebase Cloud.' : 'Automated attendance push directly to Firebase Cloud.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setBiometricConnected(true);
                alert(language === 'bn' ? `ডিভাইস ${biometricIp}:${biometricPort}-এর সাথে কানেক্ট হয়েছে!` : language === 'ar' ? `تم الاتصال بالجهاز ${biometricIp}:${biometricPort} بنجاح!` : `Connected to device ${biometricIp}:${biometricPort}!`);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
            >
              <Cpu size={18} />
              {biometricConnected ? (language === 'bn' ? 'ডিভাইস সংযুক্ত রয়েছে (Connected ✅)' : language === 'ar' ? 'الجهاز متصل (Connected ✅)' : 'Device Connected ✅') : (language === 'bn' ? 'ডিভাইস কানেক্ট টেস্ট করুন' : language === 'ar' ? 'اختبار اتصال الجهاز' : 'Test Device Connection')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
