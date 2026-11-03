'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLanguage as useLanguageContext, LanguageProvider, Language } from '@/context/LanguageContext';
import { Student } from './studentsData';
import {
  loadMasterStudents,
  saveMasterStudents,
  addStudentToMaster,
  updateStudentInMaster,
  removeStudentFromMaster,
  STUDENTS_UPDATED_EVENT,
} from './studentStore';

export { useLanguage, LanguageProvider } from '@/context/LanguageContext';
export type { Language } from '@/context/LanguageContext';

type InstituteCategory = 'qawmi' | 'alia' | 'school';

interface InstituteSettings {
  name: string;
  logo: string;
  address: string;
  principalName: string;
  principalSignature: string;
}

interface AppContextType {
  instituteCategory: InstituteCategory;
  setInstituteCategory: (category: InstituteCategory) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isRtl: boolean;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  instituteSettings: InstituteSettings;
  setInstituteSettings: (settings: InstituteSettings) => void;

  // ─── Central Student Master Database ───
  students: Student[];
  addStudent: (
    partial: Omit<Student, 'id' | 'studentId' | 'roll'> & { id?: string; studentId?: string; roll?: string }
  ) => Student;
  updateStudent: (updated: Student) => void;
  removeStudent: (id: string) => void;
  setStudents: (students: Student[]) => void;
}

const defaultSettings: InstituteSettings = {
  name: 'জামিয়া আরাবিয়া ইমদাদুল উলূম ফরিদাবাদ মাদ্রাসা, ঢাকা',
  logo: '/images/faridabad_madrasa_logo.svg',
  address: 'ফরিদাবাদ, গেন্ডারিয়া, ঢাকা-১২০৪',
  principalName: 'মাওলানা মুফতি আব্দুল কুদ্দুস',
  principalSignature: '',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, isRtl } = useLanguageContext();
  const [instituteCategory, setInstituteCategoryState] = useState<InstituteCategory>('qawmi');
  const [darkMode, setDarkModeState] = useState<boolean>(false);
  const [instituteSettings, setInstituteSettingsState] = useState<InstituteSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  // ─── Central Student State ──────────────────────────────────────
  const [students, setStudentsState] = useState<Student[]>([]);

  // Load students from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedCategory = localStorage.getItem('instituteCategory') as InstituteCategory;
      if (savedCategory) setInstituteCategoryState(savedCategory);

      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) setDarkModeState(savedMode === 'true');

      const savedSettings = localStorage.getItem('instituteSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          const isOldName = !parsed.name || parsed.name.includes('আস-সুন্নাহ') || parsed.name.includes('Al-Jamia');
          if (isOldName) {
            setInstituteSettingsState(defaultSettings);
            localStorage.setItem('instituteSettings', JSON.stringify(defaultSettings));
          } else {
            setInstituteSettingsState({
              ...defaultSettings,
              ...parsed,
              name: parsed.name || defaultSettings.name,
              logo: parsed.logo || defaultSettings.logo,
              address: parsed.address || defaultSettings.address,
            });
          }
        } catch {
          setInstituteSettingsState(defaultSettings);
        }
      } else {
        setInstituteSettingsState(defaultSettings);
      }

      // Load master student list
      const masterStudents = loadMasterStudents();
      setStudentsState(masterStudents);
    } catch (e) {
      console.error('Error loading from localStorage', e);
    }
  }, []);

  // ─── Real-Time Cross-Module Sync ────────────────────────────────
  // Listen for student updates fired from ANY module (admission, boarding, finance, etc.)
  useEffect(() => {
    const handleStudentsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<Student[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setStudentsState(customEvent.detail);
      } else {
        // Fallback: reload from localStorage
        setStudentsState(loadMasterStudents());
      }
    };

    window.addEventListener(STUDENTS_UPDATED_EVENT, handleStudentsUpdated);

    // Also listen for cross-tab sync via native 'storage' event
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'taleem_students_master' && e.newValue) {
        try {
          const parsed: Student[] = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setStudentsState(parsed);
        } catch {
          // ignore parse errors
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(STUDENTS_UPDATED_EVENT, handleStudentsUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // ─── Student CRUD ───────────────────────────────────────────────
  const addStudent = useCallback(
    (partial: Omit<Student, 'id' | 'studentId' | 'roll'> & { id?: string; studentId?: string; roll?: string }): Student => {
      let createdStudent!: Student;
      setStudentsState((prev) => {
        createdStudent = addStudentToMaster(partial, prev);
        return loadMasterStudents();
      });
      return createdStudent;
    },
    []
  );

  const updateStudent = useCallback((updated: Student) => {
    setStudentsState((prev) => updateStudentInMaster(updated, prev));
  }, []);

  const removeStudent = useCallback((id: string) => {
    setStudentsState((prev) => removeStudentFromMaster(id, prev));
  }, []);

  const setStudents = useCallback((list: Student[]) => {
    saveMasterStudents(list);
    setStudentsState(list);
  }, []);

  // ─── Persist Non-Student Settings ───────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('instituteCategory', instituteCategory);
  }, [instituteCategory, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('darkMode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('instituteSettings', JSON.stringify(instituteSettings));
  }, [instituteSettings, mounted]);

  const setInstituteCategory = (cat: InstituteCategory) => setInstituteCategoryState(cat);
  const setDarkMode = (mode: boolean) => setDarkModeState(mode);
  const setInstituteSettings = (settings: InstituteSettings) => setInstituteSettingsState(settings);

  return (
    <AppContext.Provider
      value={{
        instituteCategory,
        setInstituteCategory,
        language,
        setLanguage,
        isRtl,
        darkMode,
        setDarkMode,
        instituteSettings,
        setInstituteSettings,
        // ─── Student Context ───
        students,
        addStudent,
        updateStudent,
        removeStudent,
        setStudents,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
