import { UNIFIED_QAWMI_JAMATS } from './qawmiJamats';

export interface JamatFeeStructure {
  jamatKey: string;
  jamatName: string;
  jamatNameWithEn: string;
  department: string;
  admissionFee: number;       // ভর্তি ফি
  monthlyTuitionFee: number;  // মাসিক বেতন
  boardingFee: number;        // আবাসিক খাবার / মেস ফি (অনাবাসিকদের জন্য ০)
  examFee: number;            // সেমিস্টার / বার্ষিক পরীক্ষা ফি
  otherFee: number;           // আইডি কার্ড, লাইব্রেরি ও বিবিধ ফি
  updatedAt?: string;
}

/**
 * Standard realistic default fee structure for all 16 Unified Qawmi Jamats
 */
export const DEFAULT_JAMAT_FEES: JamatFeeStructure[] = [
  {
    jamatKey: 'nurani',
    jamatName: 'নূরানী',
    jamatNameWithEn: 'নূরানী (Nurani)',
    department: 'নূরানী বিভাগ',
    admissionFee: 1500,
    monthlyTuitionFee: 800,
    boardingFee: 2200,
    examFee: 400,
    otherFee: 300,
  },
  {
    jamatKey: 'najera',
    jamatName: 'নাজেরা',
    jamatNameWithEn: 'নাজেরা (Najera)',
    department: 'নাজেরা বিভাগ',
    admissionFee: 1500,
    monthlyTuitionFee: 900,
    boardingFee: 2400,
    examFee: 400,
    otherFee: 300,
  },
  {
    jamatKey: 'hifz',
    jamatName: 'হিফজ',
    jamatNameWithEn: 'হিফজ (Hifz)',
    department: 'হিফজ বিভাগ',
    admissionFee: 2000,
    monthlyTuitionFee: 1200,
    boardingFee: 2800,
    examFee: 500,
    otherFee: 400,
  },
  {
    jamatKey: 'taysir',
    jamatName: 'তাইসীর',
    jamatNameWithEn: 'তাইসীর (Taysir)',
    department: 'কিতাব বিভাগ',
    admissionFee: 1800,
    monthlyTuitionFee: 1000,
    boardingFee: 2500,
    examFee: 500,
    otherFee: 300,
  },
  {
    jamatKey: 'mizan',
    jamatName: 'মিজান',
    jamatNameWithEn: 'মিজান (Mizan)',
    department: 'কিতাব বিভাগ',
    admissionFee: 1800,
    monthlyTuitionFee: 1100,
    boardingFee: 2500,
    examFee: 500,
    otherFee: 300,
  },
  {
    jamatKey: 'nahwmeer',
    jamatName: 'নাহবেমীর',
    jamatNameWithEn: 'নাহবেমীর (Nahwmeer)',
    department: 'কিতাব বিভাগ',
    admissionFee: 2000,
    monthlyTuitionFee: 1200,
    boardingFee: 2600,
    examFee: 500,
    otherFee: 350,
  },
  {
    jamatKey: 'hidayatun-nahw',
    jamatName: 'হেদায়াতুন্নাহু',
    jamatNameWithEn: 'হেদায়াতুন্নাহু (Hidayatun Nahw)',
    department: 'কিতাব বিভাগ',
    admissionFee: 2000,
    monthlyTuitionFee: 1300,
    boardingFee: 2600,
    examFee: 500,
    otherFee: 350,
  },
  {
    jamatKey: 'kafiya',
    jamatName: 'কাফিয়া',
    jamatNameWithEn: 'কাফিয়া (Kafiya)',
    department: 'কিতাব বিভাগ',
    admissionFee: 2200,
    monthlyTuitionFee: 1400,
    boardingFee: 2700,
    examFee: 500,
    otherFee: 400,
  },
  {
    jamatKey: 'sharh-jami',
    jamatName: 'শরহে জামী',
    jamatNameWithEn: 'শরহে জামী (Sharh Jami)',
    department: 'কিতাব বিভাগ',
    admissionFee: 2200,
    monthlyTuitionFee: 1500,
    boardingFee: 2800,
    examFee: 500,
    otherFee: 400,
  },
  {
    jamatKey: 'sharh-bekaya',
    jamatName: 'শরহে বেকায়া',
    jamatNameWithEn: 'শরহে বেকায়া (Sharh Bekaya)',
    department: 'কিতাব বিভাগ',
    admissionFee: 2500,
    monthlyTuitionFee: 1600,
    boardingFee: 2900,
    examFee: 600,
    otherFee: 400,
  },
  {
    jamatKey: 'jalalain',
    jamatName: 'জালালাইন',
    jamatNameWithEn: 'জালালাইন (Jalalain)',
    department: 'কিতাব বিভাগ',
    admissionFee: 2500,
    monthlyTuitionFee: 1700,
    boardingFee: 3000,
    examFee: 600,
    otherFee: 450,
  },
  {
    jamatKey: 'mishkat',
    jamatName: 'মেশকাত',
    jamatNameWithEn: 'মেশকাত (Mishkat)',
    department: 'কিতাব বিভাগ',
    admissionFee: 2800,
    monthlyTuitionFee: 1900,
    boardingFee: 3200,
    examFee: 600,
    otherFee: 500,
  },
  {
    jamatKey: 'dawrah',
    jamatName: 'দাওরায়ে হাদিস / তাকমীল',
    jamatNameWithEn: 'দাওরায়ে হাদিস / তাকমীল (Dawrah-e-Hadith)',
    department: 'কিতাব বিভাগ',
    admissionFee: 3000,
    monthlyTuitionFee: 2200,
    boardingFee: 3500,
    examFee: 700,
    otherFee: 500,
  },
  {
    jamatKey: 'ifta',
    jamatName: 'ইফতা',
    jamatNameWithEn: 'ইফতা (Ifta)',
    department: 'ইফতা বিভাগ',
    admissionFee: 3200,
    monthlyTuitionFee: 2500,
    boardingFee: 3500,
    examFee: 800,
    otherFee: 600,
  },
  {
    jamatKey: 'others',
    jamatName: 'অন্যান্য / আদার্স',
    jamatNameWithEn: 'অন্যান্য / আদার্স (Others)',
    department: 'অন্যান্য বিশেষ বিভাগ',
    admissionFee: 2000,
    monthlyTuitionFee: 1200,
    boardingFee: 2500,
    examFee: 500,
    otherFee: 300,
  },
];

export const FEE_STORAGE_KEY = 'madrasha_jamat_fee_structures';

/**
 * Retrieve saved fee structures or fall back to defaults
 */
export function getStoredFeeStructures(): JamatFeeStructure[] {
  if (typeof window === 'undefined') {
    return DEFAULT_JAMAT_FEES;
  }

  try {
    const raw = localStorage.getItem(FEE_STORAGE_KEY);
    if (!raw) return DEFAULT_JAMAT_FEES;

    const parsed: JamatFeeStructure[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_JAMAT_FEES;

    // Merge with defaults to ensure all jamats are present
    const map = new Map<string, JamatFeeStructure>();
    DEFAULT_JAMAT_FEES.forEach(def => map.set(def.jamatKey, { ...def }));
    parsed.forEach(item => {
      if (item && item.jamatKey) {
        const existing = map.get(item.jamatKey);
        map.set(item.jamatKey, {
          ...(existing || item),
          ...item,
        });
      }
    });

    return Array.from(map.values());
  } catch (err) {
    console.error('Failed to load fee structures from localStorage:', err);
    return DEFAULT_JAMAT_FEES;
  }
}

/**
 * Persist fee structures into localStorage
 */
export function saveStoredFeeStructures(fees: JamatFeeStructure[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(FEE_STORAGE_KEY, JSON.stringify(fees));
    // Trigger custom event so other components (e.g. Admission / Finance) can react if desired
    window.dispatchEvent(new Event('madrasha_fee_structures_updated'));
    return true;
  } catch (err) {
    console.error('Failed to save fee structures to localStorage:', err);
    return false;
  }
}

/**
 * Look up fee structure for a given Jamat (by key, exact Bangla name, or substring)
 */
export function getFeeForJamat(jamatNameOrKey: string): JamatFeeStructure {
  const allFees = getStoredFeeStructures();
  if (!jamatNameOrKey) return allFees[0];

  const trimmed = jamatNameOrKey.trim().toLowerCase();

  // 1. Direct key match
  let matched = allFees.find(f => f.jamatKey.toLowerCase() === trimmed);
  if (matched) return matched;

  // 2. Direct bangla name match
  matched = allFees.find(f => f.jamatName.toLowerCase() === trimmed);
  if (matched) return matched;

  // 3. Match against UNIFIED_QAWMI_JAMATS keywords
  const jamatMeta = UNIFIED_QAWMI_JAMATS.find(j => 
    j.value === jamatNameOrKey || 
    j.nameBn === jamatNameOrKey || 
    j.keywords.some(kw => trimmed.includes(kw.toLowerCase()) || kw.toLowerCase().includes(trimmed))
  );

  if (jamatMeta) {
    matched = allFees.find(f => f.jamatKey === jamatMeta.id || f.jamatName === jamatMeta.value);
    if (matched) return matched;
  }

  // 4. Substring fallback
  matched = allFees.find(f => f.jamatName.includes(jamatNameOrKey) || jamatNameOrKey.includes(f.jamatName));
  if (matched) return matched;

  // Default to first (নূরানী)
  return allFees[0];
}
