/**
 * studentStore.ts
 * ─────────────────────────────────────────────────────────────────
 * Central persistence layer for the Taleem ERP Student Master Database.
 *
 * Strategy:
 *  1. On first load, seeds localStorage with INITIAL_STUDENTS from studentsData.ts
 *  2. All modules read from / write to a single localStorage key
 *  3. Changes fire a custom 'taleem_students_updated' event so every open tab
 *     / React component can react in real-time without a page refresh.
 * ─────────────────────────────────────────────────────────────────
 */

import { Student, INITIAL_STUDENTS } from './studentsData';
import { getFeeForJamat } from './feeStructure';
import { UNIFIED_QAWMI_JAMATS, QawmiJamatItem } from './qawmiJamats';

export const STUDENTS_STORAGE_KEY = 'taleem_students_master';
export const STUDENTS_UPDATED_EVENT = 'taleem_students_updated';

// ─── Bengali Numeral Helpers ──────────────────────────────────────
const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumeral(n: number): string {
  return String(n)
    .split('')
    .map((c) => BENGALI_DIGITS[parseInt(c)] ?? c)
    .join('');
}

export function fromBengaliNumeral(s: string): number {
  const mapped = s
    .split('')
    .map((c) => {
      const idx = BENGALI_DIGITS.indexOf(c);
      return idx >= 0 ? String(idx) : c;
    })
    .join('');
  return parseInt(mapped, 10) || 0;
}

// ─── ID / Roll Generation ─────────────────────────────────────────

/** Jamat prefix map for studentId generation */
const JAMAT_PREFIX_MAP: Record<string, string> = {
  'নূরানী': 'NUR',
  'নাজেরা': 'NAJ',
  'হিফজ': 'HIF',
  'তাইসীর': 'TAY',
  'মিজান': 'MZN',
  'নাহবেমীর': 'NAH',
  'হেদায়াতুন্নাহু': 'HED',
  'কাফিয়া': 'KAF',
  'শরহে জামী': 'JAM',
  'শরহে বেকায়া': 'BEK',
  'জালালাইন': 'JAL',
  'মেশকাত': 'FAZ',
  'দাওরায়ে হাদিস / তাকমীল': 'DAW',
  'ইফতা': 'IFT',
  'অন্যান্য / আদার্স': 'OTH',
};

/**
 * Helper to resolve any Jamat text variant to its canonical value (e.g. 'জালালাইন', 'হিফজ', 'মিজান', etc.)
 */
export function getCanonicalJamat(jamatStr: string): string {
  if (!jamatStr) return 'অন্যান্য / আদার্স';
  const trimmed = jamatStr.trim();
  const matched = UNIFIED_QAWMI_JAMATS.find(
    (j: QawmiJamatItem) =>
      j.value === trimmed ||
      j.nameBn === trimmed ||
      j.nameEn.toLowerCase() === trimmed.toLowerCase() ||
      j.keywords.some((kw: string) => trimmed.toLowerCase().includes(kw.toLowerCase()))
  );
  return matched ? matched.value : trimmed;
}

function getJamatPrefix(jamat: string): string {
  if (JAMAT_PREFIX_MAP[jamat]) return JAMAT_PREFIX_MAP[jamat];
  for (const [key, prefix] of Object.entries(JAMAT_PREFIX_MAP)) {
    if (jamat.includes(key) || key.includes(jamat)) return prefix;
  }
  return 'GEN';
}

/**
 * Generate a unique permanent Registration ID like "REG-2026-001"
 */
export function generateStudentId(jamat: string, existingStudentsCount: number = 0): string {
  const year = new Date().getFullYear();
  const seq = String(existingStudentsCount + 1).padStart(3, '0');
  return `REG-${year}-${seq}`;
}

/**
 * Normalize student rolls and IDs so:
 *  1. Every student receives a permanent Registration ID (REG-2026-001, REG-2026-002...) based on admission order
 *  2. Every student within a Jamat has a clean sequential Bengali roll (১, ২, ৩, ৪...)
 */
export function normalizeStudentRolls(students: Student[]): Student[] {
  const countsByJamat: Record<string, number> = {};

  return students.map((s, idx) => {
    const jamatKey = getCanonicalJamat(s.class || '');
    countsByJamat[jamatKey] = (countsByJamat[jamatKey] || 0) + 1;

    // 1. Global Registration ID (REG-2026-001, REG-2026-002...)
    const seq = String(idx + 1).padStart(3, '0');
    const cleanStudentId = `REG-2026-${seq}`;

    // 2. Class Roll Number: Strictly sequential per Jamat (১, ২, ৩, ৪...)
    const cleanRoll = toBengaliNumeral(countsByJamat[jamatKey]);

    return { 
      ...s, 
      studentId: cleanStudentId,
      roll: cleanRoll 
    };
  });
}

/**
 * Generate a sequential Bengali roll number for a given jamat.
 * Starts from 1 (১, ২, ৩...) for each Jamat.
 */
export function generateRoll(jamat: string, allStudents: Student[]): string {
  const canonicalTarget = getCanonicalJamat(jamat);
  const sameJamat = allStudents.filter((s) => getCanonicalJamat(s.class) === canonicalTarget);

  let maxRoll = 0;
  for (const s of sameJamat) {
    const n = fromBengaliNumeral(s.roll);
    if (!isNaN(n) && n < 500 && n > maxRoll) {
      maxRoll = n;
    }
  }

  const next = maxRoll > 0 ? maxRoll + 1 : sameJamat.length + 1;
  return toBengaliNumeral(next);
}

// ─── Storage API ──────────────────────────────────────────────────

/** Load the master student list from localStorage (merging with INITIAL_STUDENTS seed) */
export function loadMasterStudents(): Student[] {
  if (typeof window === 'undefined') return INITIAL_STUDENTS;

  try {
    const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (!raw) {
      const normalizedSeed = normalizeStudentRolls(INITIAL_STUDENTS);
      saveMasterStudents(normalizedSeed);
      return normalizedSeed;
    }

    const parsed: Student[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const normalizedSeed = normalizeStudentRolls(INITIAL_STUDENTS);
      saveMasterStudents(normalizedSeed);
      return normalizedSeed;
    }

    // Ensure we always have the seed students (by id) so initial data is never lost
    const existingIds = new Set(parsed.map((s) => s.id));
    const missing = INITIAL_STUDENTS.filter((s) => !existingIds.has(s.id));
    const merged = [...parsed, ...missing];
    const normalized = normalizeStudentRolls(merged);

    return normalized;
  } catch (err) {
    console.error('[StudentStore] Failed to load from localStorage:', err);
    return normalizeStudentRolls([...INITIAL_STUDENTS]);
  }
}

/** Persist the master student list to localStorage and fire sync event */
export function saveMasterStudents(students: Student[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
    // Fire event so all React components subscribed via useStudents() re-render
    window.dispatchEvent(new CustomEvent(STUDENTS_UPDATED_EVENT, { detail: students }));
  } catch (err) {
    console.error('[StudentStore] Failed to save to localStorage:', err);
  }
}

/**
 * Add a new student to the master list.
 * Auto-generates studentId and roll if not provided.
 * Returns the complete student object with generated fields.
 */
export function addStudentToMaster(
  partial: Omit<Student, 'id' | 'studentId' | 'roll'> & { id?: string; studentId?: string; roll?: string },
  currentStudents: Student[]
): Student {
  const jamat = partial.class || 'নূরানী';
  const id = partial.id || `student-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const studentId = (partial.studentId && /^REG-\d{4}-\d{3,}$/.test(partial.studentId)) 
    ? partial.studentId 
    : generateStudentId(jamat, currentStudents.length);
  const roll = partial.roll || generateRoll(jamat, currentStudents);

  const feeConfig = getFeeForJamat(jamat);
  const isResidential = partial.boardingStatus === 'আবাসিক';

  const newStudent: Student = {
    id,
    studentId,
    roll,
    nameBn: partial.nameBn || '',
    nameEn: partial.nameEn || '',
    class: jamat,
    department: partial.department || feeConfig.department,
    academicYear: partial.academicYear || getCurrentAcademicYear(),
    boardingStatus: partial.boardingStatus || 'অনাবাসিক',
    bloodGroup: partial.bloodGroup || '',
    primaryPhone: partial.primaryPhone || '',
    fatherName: partial.fatherName || '',
    fatherOccupation: partial.fatherOccupation || '',
    motherName: partial.motherName || '',
    whatsappNumber: partial.whatsappNumber || '',
    localGuardianName: partial.localGuardianName || '',
    localGuardianRelation: partial.localGuardianRelation || '',
    division: partial.division || '',
    district: partial.district || '',
    village: partial.village || '',
    studentNid: partial.studentNid || '',
    studentBirthReg: partial.studentBirthReg || '',
    parentNid: partial.parentNid || '',
    photoBase64: partial.photoBase64 || '',
    monthlyTuitionFee: partial.monthlyTuitionFee ?? feeConfig.monthlyTuitionFee,
    boardingFee: isResidential ? (partial.boardingFee ?? feeConfig.boardingFee) : 0,
    khurakiTier: isResidential ? (partial.khurakiTier || 'পূর্ণ পেইং') : undefined,
    pledgedKhurakiFee: isResidential ? (partial.pledgedKhurakiFee ?? feeConfig.boardingFee) : undefined,
    subsidyKhurakiFee: isResidential ? (partial.subsidyKhurakiFee ?? 0) : undefined,
    examFee: partial.examFee ?? feeConfig.examFee,
    totalPayableMonthly: undefined,
    dueAmount: partial.dueAmount ?? (feeConfig.monthlyTuitionFee + (isResidential ? feeConfig.boardingFee : 0)),
    dueMonths: partial.dueMonths || getCurrentMonthBn(),
  };

  const updated = normalizeStudentRolls([...currentStudents, newStudent]);
  saveMasterStudents(updated);
  const createdStudent = updated.find((s) => s.id === id) || updated[updated.length - 1];
  return createdStudent;
}

/** Update an existing student in the master list */
export function updateStudentInMaster(updated: Student, currentStudents: Student[]): Student[] {
  const newList = currentStudents.map((s) => (s.id === updated.id ? updated : s));
  const normalized = normalizeStudentRolls(newList);
  saveMasterStudents(normalized);
  return normalized;
}

/** Remove a student from the master list */
export function removeStudentFromMaster(id: string, currentStudents: Student[]): Student[] {
  const newList = currentStudents.filter((s) => s.id !== id);
  const normalized = normalizeStudentRolls(newList);
  saveMasterStudents(normalized);
  return normalized;
}

// ─── Helpers ──────────────────────────────────────────────────────

const CURRENT_ACADEMIC_YEAR = '২০২৬-২০২৭';

function getCurrentAcademicYear(): string {
  return CURRENT_ACADEMIC_YEAR;
}

const BENGALI_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
];

function getCurrentMonthBn(): string {
  const now = new Date();
  return `${BENGALI_MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}
