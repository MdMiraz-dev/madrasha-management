export interface QawmiJamatItem {
  id: string;
  value: string;
  nameBn: string;
  nameEn: string;
  nameWithEn: string; // e.g. "নূরানী (Nurani)"
  department: string;
  keywords: string[];
}

/**
 * UNIFIED OFFICIAL QAWMI MADRASA JAMAT LIST
 * Exact sequential hierarchy used across all forms, filters, admission, finance, and talimat.
 * "অন্যান্য / আদার্স (Others)" is strictly the last item.
 */
export const UNIFIED_QAWMI_JAMATS: QawmiJamatItem[] = [
  { 
    id: 'nurani', 
    value: 'নূরানী', 
    nameBn: 'নূরানী', 
    nameEn: 'Nurani', 
    nameWithEn: 'নূরানী (Nurani)', 
    department: 'নূরানী বিভাগ', 
    keywords: ['নূরানী', 'nurani', 'noorani'] 
  },
  { 
    id: 'najera', 
    value: 'নাজেরা', 
    nameBn: 'নাজেরা', 
    nameEn: 'Najera', 
    nameWithEn: 'নাজেরা (Najera)', 
    department: 'নাজেরা বিভাগ', 
    keywords: ['নাজেরা', 'najera', 'nazera'] 
  },
  { 
    id: 'hifz', 
    value: 'হিফজ', 
    nameBn: 'হিফজ', 
    nameEn: 'Hifz', 
    nameWithEn: 'হিফজ (Hifz)', 
    department: 'হিফজ বিভাগ', 
    keywords: ['হিফজ', 'hifz', 'হিফজুল কুরআন', 'hifzul quran'] 
  },
  { 
    id: 'taysir', 
    value: 'তাইসীর', 
    nameBn: 'তাইসীর', 
    nameEn: 'Taysir', 
    nameWithEn: 'তাইসীর (Taysir)', 
    department: 'কিতাব বিভাগ', 
    keywords: ['তাইসীর', 'taysir', 'taiseer'] 
  },
  { 
    id: 'mizan', 
    value: 'মিজান', 
    nameBn: 'মিজান', 
    nameEn: 'Mizan', 
    nameWithEn: 'মিজান (Mizan)', 
    department: 'কিতাব বিভাগ', 
    keywords: ['মিজান', 'mizan', 'মিজানুস সরফ'] 
  },
  { 
    id: 'nahwmeer', 
    value: 'নাহবেমীর', 
    nameBn: 'নাহবেমীর', 
    nameEn: 'Nahwmeer', 
    nameWithEn: 'নাহবেমীর (Nahwmeer)', 
    department: 'কিতাব বিভাগ', 
    keywords: ['নাহবেমীর', 'nahwmeer', 'nahbemeer'] 
  },
  { 
    id: 'hidayatun-nahw', 
    value: 'হেদায়াতুন্নাহু', 
    nameBn: 'হেদায়াতুন্নাহু', 
    nameEn: 'Hidayatun Nahw', 
    nameWithEn: 'হেদায়াতুন্নাহু (Hidayatun Nahw)', 
    department: 'কিতাব বিভাগ', 
    keywords: ['হেদায়াতুন্নাহু', 'হেদায়েতুন্নাহু', 'hidayatun nahw', 'hidayat'] 
  },
  { 
    id: 'kafiya', 
    value: 'কাফিয়া', 
    nameBn: 'কাফিয়া', 
    nameEn: 'Kafiya', 
    nameWithEn: 'কাফিয়া (Kafiya)', 
    department: 'কিতাব বিভাগ', 
    keywords: ['কাফিয়া', 'কাফিয়া', 'kafiya', 'kafia'] 
  },
  { 
    id: 'sharh-jami', 
    value: 'শরহে জামী', 
    nameBn: 'শরহে জামী', 
    nameEn: 'Sharh Jami', 
    nameWithEn: 'শরহে জামী (Sharh Jami)', 
    department: 'কিতাব বিভাগ', 
    keywords: ['শরহে জামী', 'জামী', 'sharh jami', 'jami'] 
  },
  { 
    id: 'sharh-bekaya', 
    value: 'শরহে বেকায়া', 
    nameBn: 'শরহে বেকায়া', 
    nameEn: 'Sharh Bekaya', 
    nameWithEn: 'শরহে বেকায়া (Sharh Bekaya)', 
    department: 'কিতাব বিভাগ', 
    keywords: ['শরহে বেকায়া', 'বেকায়া', 'sharh bekaya', 'bekaya'] 
  },
  { 
    id: 'jalalain', 
    value: 'জালালাইন', 
    nameBn: 'জালালাইন', 
    nameEn: 'Jalalain', 
    nameWithEn: 'জালালাইন (Jalalain)', 
    department: 'কিতাব বিভাগ', 
    keywords: ['জালালাইন', 'jalalain', 'tafsir jalalain'] 
  },
  { 
    id: 'mishkat', 
    value: 'মেশকাত', 
    nameBn: 'মেশকাত', 
    nameEn: 'Mishkat', 
    nameWithEn: 'মেশকাত (Mishkat)', 
    department: 'কিতাব বিভাগ', 
    keywords: ['মেশকাত', 'মিশকাত', 'mishkat', 'meshkat'] 
  },
  { 
    id: 'dawrah', 
    value: 'দাওরায়ে হাদিস / তাকমীল', 
    nameBn: 'দাওরায়ে হাদিস / তাকমীল', 
    nameEn: 'Dawrah-e-Hadith', 
    nameWithEn: 'দাওরায়ে হাদিস / তাকমীল (Dawrah-e-Hadith)', 
    department: 'কিতাব বিভাগ', 
    keywords: ['দাওরায়ে হাদিস', 'দাওরা', 'তাকমীল', 'dawrah', 'takmil'] 
  },
  { 
    id: 'ifta', 
    value: 'ইফতা', 
    nameBn: 'ইফতা', 
    nameEn: 'Ifta', 
    nameWithEn: 'ইফতা (Ifta)', 
    department: 'ইফতা বিভাগ', 
    keywords: ['ইফতা', 'ifta', 'ফতোয়া', 'fatwa'] 
  },
  { 
    id: 'others', 
    value: 'অন্যান্য / আদার্স', 
    nameBn: 'অন্যান্য / আদার্স', 
    nameEn: 'Others', 
    nameWithEn: 'অন্যান্য / আদার্স (Others)', 
    department: 'অন্যান্য বিশেষ বিভাগ', 
    keywords: ['অন্যান্য', 'others', 'আদার্স', 'অন্যান্য বিশেষ বিভাগ', 'আদব', 'ক্বিরাত'] 
  },
];

/**
 * Filter dropdown options with "সব জামাত (সকল বিভাগ)" at the top
 */
export const JAMAT_FILTER_OPTIONS = [
  { value: 'all', labelBn: 'সব জামাত (সকল বিভাগ)', labelEn: 'All Jamats / Classes' },
  ...UNIFIED_QAWMI_JAMATS.map(j => ({ value: j.value, labelBn: j.nameWithEn, labelEn: j.nameEn }))
];

/**
 * List of pure strings for simple dropdowns
 */
export const JAMAT_STRING_LIST = UNIFIED_QAWMI_JAMATS.map(j => j.value);

/**
 * Helper to match any student/transaction text against a selected Jamat filter
 */
export function matchesUnifiedJamat(itemJamat: string | undefined, itemDesc: string | undefined, filterJamatValue: string): boolean {
  if (filterJamatValue === 'all') return true;
  
  const targetConfig = UNIFIED_QAWMI_JAMATS.find(j => j.value === filterJamatValue);
  if (!targetConfig) {
    return (itemJamat || '').includes(filterJamatValue);
  }

  const normalizedJamat = (itemJamat || '').toLowerCase();
  const normalizedDesc = (itemDesc || '').toLowerCase();

  return targetConfig.keywords.some(kw => 
    normalizedJamat.includes(kw.toLowerCase()) || 
    normalizedDesc.includes(kw.toLowerCase())
  );
}
