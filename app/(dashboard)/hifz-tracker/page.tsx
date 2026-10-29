'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/lib/context';
import { translations } from '@/lib/translations';
import {
  BookOpen,
  Activity,
  Target,
  CheckCircle2,
  User,
  Sparkles,
  Mic,
  Square,
  Volume2,
  AlertTriangle,
  Plus,
  Trash2,
  Download,
  Calendar,
  Clock,
  Award,
  Play,
  FileAudio,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';

interface StudentInfo {
  id: string;
  name: string;
  roll: string;
  totalParas: number;
  currentPara: number;
  currentPage: number;
}

interface MistakeItem {
  id: string;
  page: string | number;
  ayah: string | number;
  errorType: string;
}

interface HifzSessionRecord {
  id: string;
  studentId: string;
  studentName: string;
  roll: string;
  date: string;
  displayDate: string;
  dayName: string;
  time: string;
  para: number;
  page: number | string;
  surah: string;
  ayahRange: string;
  mistakesCount: number;
  mistakesList: MistakeItem[];
  audioUrl?: string;
  audioFileName?: string;
  evaluation: string;
}

export default function HifzTrackerPage() {
  const { language, isRtl } = useLanguage();
  const { students: centralStudents } = useApp();
  const t = translations[language as keyof typeof translations] || translations.bn;

  const studentsList: StudentInfo[] = React.useMemo(() => {
    if (centralStudents && centralStudents.length > 0) {
      // Filter Hifz students first, or include all students if no Hifz students exist
      const hifzOnly = centralStudents.filter(s => s.class === 'হিফজ' || s.department === 'হিফজ বিভাগ');
      const listToUse = hifzOnly.length > 0 ? hifzOnly : centralStudents;

      return listToUse.map((s, idx) => ({
        id: s.id || `hifz-${idx}`,
        name: s.nameBn || s.nameEn || 'শিক্ষার্থী',
        roll: s.roll || '—',
        totalParas: 30,
        currentPara: 1,
        currentPage: 1,
      }));
    }

    return [
      { id: '1', name: 'মুহাম্মদ উমর ফারুক', roll: '১০২', totalParas: 15, currentPara: 15, currentPage: 293 },
      { id: '2', name: 'আব্দুল্লাহ আল মাহমুদ', roll: '১০১', totalParas: 22, currentPara: 22, currentPage: 440 },
      { id: '3', name: 'জাকারিয়া আহমেদ', roll: '১১৮', totalParas: 8, currentPara: 8, currentPage: 160 },
    ];
  }, [centralStudents]);

  const [student, setStudent] = useState('');
  const activeStudent = studentsList.find((s) => s.id === student) || studentsList[0];


  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [sabakPara, setSabakPara] = useState<number>(activeStudent.currentPara);
  const [sabakPage, setSabakPage] = useState<number | string>(activeStudent.currentPage);
  const [surahName, setSurahName] = useState('সূরা আল-কাহাফ');
  const [ayahRange, setAyahRange] = useState('১ - ১৬');
  const [sabakMistakes, setSabakMistakes] = useState<number>(0);
  const [saatNotes, setSaatNotes] = useState('মাখরাজ সুন্দর ও সহীহ হয়েছে');
  const [amokhtaPara, setAmokhtaPara] = useState(14);
  const [amokhtaMistakes, setAmokhtaMistakes] = useState(0);
  const [totalParas, setTotalParas] = useState(activeStudent.totalParas);

  // AI Voice Recorder States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [waveBars, setWaveBars] = useState<number[]>([20, 35, 50, 70, 40, 85, 60, 30, 55, 90, 45, 65, 30, 80, 45, 25]);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>('');
  const [detectedMistakes, setDetectedMistakes] = useState<MistakeItem[]>([]);

  // Manual Mistake Tagger Inputs
  const [tagPage, setTagPage] = useState<string>('293');
  const [tagAyah, setTagAyah] = useState<string>('');
  const [tagErrorType, setTagErrorType] = useState<string>('হরকত ভুল');

  // Student Profile Saved Records History
  const [studentRecords, setStudentRecords] = useState<HifzSessionRecord[]>([]);

  // Audio refs for Web Audio API & MediaRecorder
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // Load student records from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`taleem_hifz_records_${student}`);
      if (stored) {
        setStudentRecords(JSON.parse(stored));
      } else {
        // Realistic initial default record for the student
        const initialRecords: HifzSessionRecord[] = [
          {
            id: 'init-1',
            studentId: student,
            studentName: activeStudent.name,
            roll: activeStudent.roll,
            date: '2026-09-20',
            displayDate: '২০ সেপ্টেম্বর ২০২৬',
            dayName: 'রবিবার',
            time: '০৩:১৫ PM',
            para: activeStudent.currentPara,
            page: activeStudent.currentPage - 1,
            surah: 'সূরা আল-কাহাফ',
            ayahRange: '১ - ১০',
            mistakesCount: 0,
            mistakesList: [],
            evaluation: 'মুমতায (A+)',
            audioFileName: `${activeStudent.name.replace(/\s+/g, '_')}_পারা_${activeStudent.currentPara}_পৃষ্ঠা_${activeStudent.currentPage - 1}.webm`
          },
          {
            id: 'init-2',
            studentId: student,
            studentName: activeStudent.name,
            roll: activeStudent.roll,
            date: '2026-09-19',
            displayDate: '১৯ সেপ্টেম্বর ২০২৬',
            dayName: 'শনিবার',
            time: '১০:৩০ AM',
            para: activeStudent.currentPara,
            page: activeStudent.currentPage - 2,
            surah: 'সূরা আল-ইসরা',
            ayahRange: '১০০ - ১১১',
            mistakesCount: 1,
            mistakesList: [{ id: 'm-1', page: activeStudent.currentPage - 2, ayah: '১০৫', errorType: 'হরকত ভুল' }],
            evaluation: 'জায়্যিদ (ভালো)',
            audioFileName: `${activeStudent.name.replace(/\s+/g, '_')}_পারা_${activeStudent.currentPara}_পৃষ্ঠা_${activeStudent.currentPage - 2}.webm`
          }
        ];
        setStudentRecords(initialRecords);
      }
    } catch {
      // Fallback
    }

    // Sync form with active student
    setSabakPara(activeStudent.currentPara);
    setSabakPage(activeStudent.currentPage);
    setTagPage(String(activeStudent.currentPage));
    setTotalParas(activeStudent.totalParas);
    setRecordedAudioUrl(null);
    setDetectedMistakes([]);
    setSabakMistakes(0);
  }, [student, activeStudent.currentPara, activeStudent.currentPage, activeStudent.name, activeStudent.roll, activeStudent.totalParas]);

  // Save student records to localStorage
  const saveRecordsToStorage = (records: HifzSessionRecord[]) => {
    setStudentRecords(records);
    try {
      localStorage.setItem(`taleem_hifz_records_${student}`, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save hifz records', e);
    }
  };

  // Start Voice Recording (Mobile & Desktop compatible)
  const startRecording = async () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setRecordedAudioUrl(null);
    audioChunksRef.current = [];

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    // Attempt real MediaStream and MediaRecorder
    try {
      if (typeof window !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // Determine best supported MIME type for cross-browser / mobile (Safari iOS / Android)
        let mimeType = '';
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';
          else if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
          else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
          else if (MediaRecorder.isTypeSupported('audio/aac')) mimeType = 'audio/aac';
        }

        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedAudioUrl(url);

          // Name the audio recording strictly after the student
          const safeStudentName = activeStudent.name.replace(/\s+/g, '_');
          const formattedDate = new Date().toISOString().split('T')[0];
          const fileName = `${safeStudentName}_রোল_${activeStudent.roll}_পারা_${sabakPara}_পৃষ্ঠা_${sabakPage}_${formattedDate}.webm`;
          setAudioFileName(fileName);
        };

        recorder.start(100);

        // Web Audio API wave visualizer
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateWaveform = () => {
          analyser.getByteFrequencyData(dataArray);
          const normalized = Array.from(dataArray.slice(0, 16)).map((v) => Math.max(12, Math.min(100, Math.round((v / 255) * 100))));
          setWaveBars(normalized);
          animFrameRef.current = requestAnimationFrame(updateWaveform);
        };
        updateWaveform();
        return;
      }
    } catch (err) {
      console.warn('Microphone permission or hardware unavailable, using safe simulation', err);
    }

    // Synthetic wave generator fallback for dev/permission blocked
    const simulateWaves = () => {
      const simulated = Array.from({ length: 16 }).map(() => Math.floor(Math.random() * 75) + 15);
      setWaveBars(simulated);
      animFrameRef.current = requestAnimationFrame(simulateWaves);
    };
    simulateWaves();
  };

  // Stop Recording
  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    setIsRecording(false);

    // If no media chunks captured (e.g. simulated environment), create sample audio URL
    if (audioChunksRef.current.length === 0) {
      const safeStudentName = activeStudent.name.replace(/\s+/g, '_');
      const formattedDate = new Date().toISOString().split('T')[0];
      setAudioFileName(`${safeStudentName}_রোল_${activeStudent.roll}_পারা_${sabakPara}_পৃষ্ঠা_${sabakPage}_${formattedDate}.webm`);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Add a specific mistake (Concise Page & Ayah format as requested: "পৃষ্ঠা এত, আয়াত এত")
  const handleAddMistake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagAyah.trim()) return;

    const newMistake: MistakeItem = {
      id: Date.now().toString(),
      page: tagPage || sabakPage,
      ayah: tagAyah.trim(),
      errorType: tagErrorType,
    };

    const updated = [...detectedMistakes, newMistake];
    setDetectedMistakes(updated);
    setSabakMistakes(updated.length);
    setTagAyah('');
  };

  // Remove a mistake
  const handleRemoveMistake = (id: string) => {
    const updated = detectedMistakes.filter((m) => m.id !== id);
    setDetectedMistakes(updated);
    setSabakMistakes(updated.length);
  };

  // Reset to Zero Mistakes (সবক সম্পূর্ণ নির্ভুল)
  const handleSetZeroMistakes = () => {
    setDetectedMistakes([]);
    setSabakMistakes(0);
  };

  // Save Record into Student Profile
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const todayDate = new Date().toISOString().split('T')[0];
    const daysBangla = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const dayName = daysBangla[new Date().getDay()];
    const displayDate = new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
    const time = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

    const newSession: HifzSessionRecord = {
      id: Date.now().toString(),
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      roll: activeStudent.roll,
      date: todayDate,
      displayDate,
      dayName,
      time,
      para: Number(sabakPara),
      page: sabakPage,
      surah: surahName,
      ayahRange,
      mistakesCount: sabakMistakes,
      mistakesList: [...detectedMistakes],
      audioUrl: recordedAudioUrl || undefined,
      audioFileName: audioFileName || `${activeStudent.name.replace(/\s+/g, '_')}_পারা_${sabakPara}_পৃষ্ঠা_${sabakPage}.webm`,
      evaluation: sabakMistakes === 0 ? 'মুমতায (A+)' : sabakMistakes <= 2 ? 'জায়্যিদ (ভালো)' : 'পুনরাবৃত্তি প্রয়োজন'
    };

    const updated = [newSession, ...studentRecords];
    saveRecordsToStorage(updated);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  // Calculate weekly statistics for active student
  const totalWeeklyMistakes = studentRecords.reduce((acc, curr) => acc + curr.mistakesCount, 0);
  const accurateSessionsCount = studentRecords.filter((r) => r.mistakesCount === 0).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BookOpen size={22} />
            </div>
            <span>{t.hifz_title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.hifz_subtitle}
          </p>
        </div>

        {/* Student Selector */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {t.hifz_select_student}:
          </label>
          <select
            className="w-full md:w-80 p-2.5 border rounded-2xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 outline-none focus:ring-2 focus:ring-emerald-500 font-bold shadow-sm"
            value={student}
            onChange={(e) => setStudent(e.target.value)}
          >
            {studentsList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (রোল: {s.roll}, {s.totalParas} পারা)
              </option>
            ))}
          </select>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-sm font-semibold flex items-center gap-2.5 shadow-sm animate-in fade-in">
          <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>আলহামদুলিল্লাহ! {activeStudent.name}-এর প্রোফাইলে অডিও ও ভুলের খতিয়ান সংরক্ষিত হয়েছে।</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Voice Recorder & Sabak Entry (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* 🎙️ MOBILE-FRIENDLY VOICE RECORDER CARD WITH STUDENT TAGGING */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-emerald-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* Header with active student indicator */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mic size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                      <span>ভয়েস রেকর্ডার ও তিলাওয়াত লিসেনার</span>
                      <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                        মোবাইল রেডি
                      </span>
                    </h3>
                    <p className="text-xs text-emerald-300 font-medium mt-0.5">
                      রেকর্ডিং হবে: <span className="underline font-bold text-white">{activeStudent.name} (রোল: {activeStudent.roll})</span>-এর নামে
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Recording Area */}
              {isRecording && (
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-rose-500/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-rose-400 font-semibold animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-lg shadow-rose-500" />
                      🔴 অডিও রেকর্ড হচ্ছে ({activeStudent.name})...
                    </span>
                    <span className="font-mono text-base font-bold text-white bg-slate-800 px-3 py-1 rounded-xl">
                      {formatTime(recordingSeconds)}
                    </span>
                  </div>

                  {/* Dynamic Live Wave Bars */}
                  <div className="h-16 flex items-center justify-center gap-1.5 px-4 bg-slate-900/90 rounded-xl">
                    {waveBars.map((height, i) => (
                      <div
                        key={i}
                        className="w-2 bg-gradient-to-t from-emerald-500 to-teal-300 rounded-full transition-all duration-100 ease-out"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Controls: Start / Stop Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3.5 px-5 rounded-2xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2.5 transition active:scale-[0.98]"
                  >
                    <Mic size={19} />
                    <span>🎙️ {activeStudent.name}-এর পড়া রেকর্ড শুরু করুন</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-5 rounded-2xl shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2.5 transition active:scale-[0.98] animate-pulse"
                  >
                    <Square size={19} />
                    <span>⏹️ রেকর্ডিং সমাপ্ত ও সেভ করুন</span>
                  </button>
                )}
              </div>

              {/* 🎧 PLAYBACK PLAYER & DOWNLOAD IF RECORDED */}
              {recordedAudioUrl && (
                <div className="mt-4 p-4 bg-slate-950/85 rounded-2xl border border-emerald-500/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileAudio size={18} className="text-emerald-400" />
                      <div>
                        <p className="text-xs font-bold text-white">তিলাওয়াত অডিও প্লেয়ার</p>
                        <p className="text-[10px] text-emerald-300 font-mono truncate max-w-[200px] sm:max-w-xs">
                          {audioFileName}
                        </p>
                      </div>
                    </div>
                    <a
                      href={recordedAudioUrl}
                      download={audioFileName}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
                      title="মোবাইলে অডিও ফাইলটি ডাউনলোড করুন"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">ডাউনলোড</span>
                    </a>
                  </div>

                  {/* HTML5 Audio Player */}
                  <audio controls src={recordedAudioUrl} className="w-full h-9 rounded-lg" />
                </div>
              )}

              {/* 🎯 ACCURATE MISTAKE TAGGING TOOLBAR (No fake mistakes!) */}
              <div className="mt-4 p-4 bg-slate-950/80 rounded-2xl border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-400" />
                    <span>ভুল চিহ্নিতকরণ (পৃষ্ঠা ও আয়াত নম্বর)</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleSetZeroMistakes}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60 transition"
                  >
                    {t.hifz_no_mistakes}
                  </button>
                </div>

                {/* Tag Input Form */}
                <form onSubmit={handleAddMistake} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={tagPage}
                      onChange={(e) => setTagPage(e.target.value)}
                      placeholder="পৃষ্ঠা নং (যেমন: ২৯৩)"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={tagAyah}
                      onChange={(e) => setTagAyah(e.target.value)}
                      placeholder="আয়াত নং (যেমন: ৪)"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <select
                      value={tagErrorType}
                      onChange={(e) => setTagErrorType(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-semibold"
                    >
                      <option value="হরকত ভুল">হরকত ভুল</option>
                      <option value="শব্দে আটকা / অতিরিক্ত বিরতি">শব্দে আটকা / অতিরিক্ত বিরতি</option>
                      <option value="ওয়াজিব গুন্নাহ ছাড়া">ওয়াজিব গুন্নাহ ছাড়া</option>
                      <option value="মাদ্দ / টান কম">মাদ্দ / টান কম</option>
                      <option value="মাখরাজ অস্পষ্টতা">মাখরাজ অস্পষ্টতা</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="w-full h-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition"
                    >
                      <Plus size={14} />
                      <span>যোগ</span>
                    </button>
                  </div>
                </form>

                {/* Display Tagged Mistakes Chips */}
                <div className="pt-1">
                  {detectedMistakes.length === 0 ? (
                    <div className="p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-800/40 text-xs text-emerald-300 font-medium flex items-center gap-2">
                      <Check size={15} className="text-emerald-400 flex-shrink-0" />
                      <span>{t.hifz_no_mistakes} — কোনো ভুল পাওয়া যায়নি।</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {detectedMistakes.map((mistake) => (
                        <span
                          key={mistake.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold"
                        >
                          <span>পৃষ্ঠা {mistake.page}, আয়াত {mistake.ayah} ({mistake.errorType})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMistake(mistake.id)}
                            className="text-slate-400 hover:text-rose-400 p-0.5 rounded-full"
                          >
                            <Trash2 size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* 📝 DAILY SABAK ENTRY FORM */}
          <div className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b pb-3 dark:border-slate-700">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>{t.hifz_daily_record} ({activeStudent.name})</span>
            </h2>

            <form onSubmit={handleSave} className="space-y-4">

              {/* 1. Sabak (Today's new lesson) */}
              <div className="p-4 sm:p-5 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                    {t.hifz_sabak_title}
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    রোল: {activeStudent.roll}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Para Selector */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t.hifz_sabak_para}
                    </label>
                    <select
                      value={sabakPara}
                      onChange={(e) => setSabakPara(Number(e.target.value))}
                      className="w-full p-2.5 border rounded-xl text-xs bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    >
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((paraNum) => (
                        <option key={paraNum} value={paraNum}>
                          {language === 'ar' ? `الجزء ${paraNum}` : language === 'en' ? `Para ${paraNum}` : `${paraNum} নং পারা`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Page Number */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t.hifz_sabak_page}
                    </label>
                    <input
                      type="number"
                      value={sabakPage}
                      onChange={(e) => {
                        setSabakPage(e.target.value);
                        setTagPage(e.target.value);
                      }}
                      placeholder={t.hifz_sabak_page}
                      className="w-full p-2.5 border rounded-xl text-xs bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  {/* Surah Name */}
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t.hifz_surah_name}
                    </label>
                    <input
                      type="text"
                      value={surahName}
                      onChange={(e) => setSurahName(e.target.value)}
                      placeholder={t.hifz_surah_name}
                      className="w-full p-2.5 border rounded-xl text-xs bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Ayah Range */}
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t.hifz_ayah_range}
                    </label>
                    <input
                      type="text"
                      value={ayahRange}
                      onChange={(e) => setAyahRange(e.target.value)}
                      placeholder={t.hifz_ayah_range}
                      className="w-full p-2.5 border rounded-xl text-xs bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Mistakes Count */}
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t.hifz_mistakes_count}
                    </label>
                    <input
                      type="number"
                      value={sabakMistakes}
                      onChange={(e) => setSabakMistakes(Number(e.target.value))}
                      placeholder={t.hifz_mistakes_count}
                      className="w-full p-2.5 border rounded-xl text-xs bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 outline-none focus:ring-2 focus:ring-emerald-500 font-black text-amber-600 dark:text-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Saat-Sabak (Recent Revision) */}
              <div className="p-4 sm:p-5 border-2 border-blue-200 dark:border-blue-800 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
                <h3 className="font-bold text-blue-900 dark:text-blue-200 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  {t.hifz_saat_sabak_title}
                </h3>
                <input
                  type="text"
                  value={saatNotes}
                  onChange={(e) => setSaatNotes(e.target.value)}
                  placeholder={t.hifz_saat_notes}
                  className="w-full p-2.5 border rounded-xl text-xs bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 3. Amokhta / Dour (Old Revision) */}
              <div className="p-4 sm:p-5 border-2 border-purple-200 dark:border-purple-800 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
                <h3 className="font-bold text-purple-900 dark:text-purple-200 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
                  {t.hifz_amokhta_title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t.hifz_para_number}
                    </label>
                    <input
                      type="number"
                      value={amokhtaPara}
                      onChange={(e) => setAmokhtaPara(Number(e.target.value))}
                      placeholder={t.hifz_para_number}
                      className="w-full p-2 border rounded-xl text-xs bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t.hifz_mistakes_count}
                    </label>
                    <input
                      type="number"
                      value={amokhtaMistakes}
                      onChange={(e) => setAmokhtaMistakes(Number(e.target.value))}
                      placeholder={t.hifz_mistakes_count}
                      className="w-full p-2 border rounded-xl text-xs bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t.hifz_total_memorized}
                    </label>
                    <input
                      type="number"
                      value={totalParas}
                      onChange={(e) => setTotalParas(Number(e.target.value))}
                      placeholder={t.hifz_total_memorized}
                      className="w-full p-2 border rounded-xl text-xs bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 font-bold text-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-5 rounded-2xl transition shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 active:scale-[0.99] text-sm"
              >
                <CheckCircle2 size={19} />
                <span>{activeStudent.name}-এর দৈনিক রেকর্ড ও অডিও সংরক্ষণ করুন</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Weekly Mistake Routine & Student Audio History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* 📅 WEEKLY MISTAKE ROUTINE SUMMARY CARD (সাপ্তাহিক ভুলের খতিয়ান) */}
          <div className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-700">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>সাপ্তাহিক ভুলের খতিয়ান ও রুটিন</span>
              </h2>
              <span className="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-full">
                {activeStudent.name}
              </span>
            </div>

            {/* Weekly Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200/60 dark:border-slate-700 text-center">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">চলতি সপ্তাহে মোট ভুল</p>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  {totalWeeklyMistakes} টি
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200/60 dark:border-slate-700 text-center">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">সম্পূর্ণ নির্ভুল দিন</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {accurateSessionsCount} দিন
                </p>
              </div>
            </div>

            {/* Daily Mistake Log for this Student */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                দিনভিত্তিক ভুলের রুটিন:
              </p>

              {studentRecords.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">এখনও কোনো পড়ার রেকর্ড নেই</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {studentRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200/70 dark:border-slate-600/60 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          {rec.dayName} ({rec.displayDate})
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          rec.mistakesCount === 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {rec.mistakesCount === 0 ? '০ ভুল (নির্ভুল)' : `${rec.mistakesCount} ভুল`}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-600 dark:text-gray-300">
                        পারা {rec.para}, পৃষ্ঠা {rec.page} • {rec.surah} (আয়াত: {rec.ayahRange})
                      </p>

                      {/* Mistakes breakdown chips */}
                      {rec.mistakesList.length > 0 ? (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {rec.mistakesList.map((m, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800"
                            >
                              পৃষ্ঠা {m.page}, আয়াত {m.ayah}: {m.errorType}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          মাশাআল্লাহ, এই দিনে সম্পূর্ণ নির্ভুল সবক দিয়েছে।
                        </p>
                      )}

                      {/* Audio Playback player if available */}
                      {rec.audioUrl && (
                        <div className="pt-1">
                          <audio controls src={rec.audioUrl} className="w-full h-7 rounded" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Completion Forecast */}
          <div className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b pb-3 dark:border-slate-700">
              <Target className="w-5 h-5 text-emerald-600" />
              <span>{t.hifz_forecast_title} ({activeStudent.name})</span>
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                <span className="text-emerald-600 dark:text-emerald-400">
                  {totalParas} {t.hifz_paras_memorized} ({Math.round((totalParas / 30) * 100)}%)
                </span>
                <span className="text-gray-400">
                  {30 - totalParas} {t.hifz_paras_left}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3.5 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${(totalParas / 30) * 100}%` }}
                />
              </div>

              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                {t.hifz_forecast_est}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
