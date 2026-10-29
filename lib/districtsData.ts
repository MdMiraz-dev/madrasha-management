export interface DistrictItem {
  id: string;
  nameBn: string;
  nameEn: string;
  label: string; // e.g. "ব্রাহ্মণবাড়িয়া (Brahmanbaria)"
  divisionId: string; // 'Dhaka', 'Chattogram', etc.
  divisionBn: string;
}

export interface DivisionItem {
  id: string;
  nameBn: string;
  nameEn: string;
  label: string; // e.g. "Dhaka (ঢাকা)"
}

export const BANGLADESH_DIVISIONS: DivisionItem[] = [
  { id: 'Dhaka', nameBn: 'ঢাকা', nameEn: 'Dhaka', label: 'Dhaka (ঢাকা)' },
  { id: 'Chattogram', nameBn: 'চট্টগ্রাম', nameEn: 'Chattogram', label: 'Chattogram (চট্টগ্রাম)' },
  { id: 'Rajshahi', nameBn: 'রাজশাহী', nameEn: 'Rajshahi', label: 'Rajshahi (রাজশাহী)' },
  { id: 'Khulna', nameBn: 'খুলনা', nameEn: 'Khulna', label: 'Khulna (খুলনা)' },
  { id: 'Barishal', nameBn: 'বরিশাল', nameEn: 'Barishal', label: 'Barishal (বরিশাল)' },
  { id: 'Sylhet', nameBn: 'সিলেট', nameEn: 'Sylhet', label: 'Sylhet (সিলেট)' },
  { id: 'Rangpur', nameBn: 'রংপুর', nameEn: 'Rangpur', label: 'Rangpur (রংপুর)' },
  { id: 'Mymensingh', nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh', label: 'Mymensingh (ময়মনসিংহ)' },
];

export const BANGLADESH_DISTRICTS: DistrictItem[] = [
  // ─── ঢাকা বিভাগ (Dhaka Division - 13 Districts) ───
  { id: 'dhaka', nameBn: 'ঢাকা', nameEn: 'Dhaka', label: 'ঢাকা (Dhaka)', divisionId: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'gazipur', nameBn: 'গাজীপুর', nameEn: 'Gazipur', label: 'গাজীপুর (Gazipur)', divisionId: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'narayanganj', nameBn: 'নারায়ণগঞ্জ', nameEn: 'Narayanganj', label: 'নারায়ণগঞ্জ (Narayanganj)', divisionId: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'narsingdi', nameBn: 'নরসিংদী', nameEn: 'Narsingdi', label: 'নরসিংদী (Narsingdi)', divisionId: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'tangail', nameBn: 'টাঙ্গাইল', nameEn: 'Tangail', label: 'টাঙ্গাইল (Tangail)', divisionId: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'kishoreganj', nameBn: 'কিশোরগঞ্জ', nameEn: 'Kishoreganj', label: 'কিশোরগঞ্জ (Kishoreganj)', divisionId: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'manikganj', nameBn: 'মানিকগঞ্জ', nameEn: 'Manikganj', label: 'মানিকগঞ্জ (Manikganj)', divisionId: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'munshiganj', nameBn: 'মুন্সীগঞ্জ', nameEn: 'Munshiganj', label: 'মুন্সীগঞ্জ (Munshiganj)', divisionId: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'rajbari', nameBn: 'রাজবাড়ী', nameEn: 'Rajbari', label: 'রাজবাড়ী (Rajbari)', divisionId: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'madaripur', nameBn: 'মাদারীপুর', nameEn: 'Madaripur', label: 'মাদারীপুর (Madaripur)', divisionId: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'gopalganj', nameBn: 'গোপালগঞ্জ', nameEn: 'Gopalganj', label: 'গোপালগঞ্জ (Gopalganj)', divisionId: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'faridpur', nameBn: 'ফরিদপুর', nameEn: 'Faridpur', label: 'ফরিদপুর (Faridpur)', divisionId: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'shariatpur', nameBn: 'শরীয়তপুর', nameEn: 'Shariatpur', label: 'শরীয়তপুর (Shariatpur)', divisionId: 'Dhaka', divisionBn: 'ঢাকা' },

  // ─── চট্টগ্রাম বিভাগ (Chattogram Division - 11 Districts) ───
  { id: 'brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', nameEn: 'Brahmanbaria', label: 'ব্রাহ্মণবাড়িয়া (Brahmanbaria)', divisionId: 'Chattogram', divisionBn: 'চট্টগ্রাম' },
  { id: 'cumilla', nameBn: 'কুমিল্লা', nameEn: 'Cumilla', label: 'কুমিল্লা (Cumilla)', divisionId: 'Chattogram', divisionBn: 'চট্টগ্রাম' },
  { id: 'feni', nameBn: 'ফেনী', nameEn: 'Feni', label: 'ফেনী (Feni)', divisionId: 'Chattogram', divisionBn: 'চট্টগ্রাম' },
  { id: 'chattogram', nameBn: 'চট্টগ্রাম', nameEn: 'Chattogram', label: 'চট্টগ্রাম (Chattogram)', divisionId: 'Chattogram', divisionBn: 'চট্টগ্রাম' },
  { id: 'coxsbazar', nameBn: 'কক্সবাজার', nameEn: "Cox's Bazar", label: "কক্সবাজার (Cox's Bazar)", divisionId: 'Chattogram', divisionBn: 'চট্টগ্রাম' },
  { id: 'noakhali', nameBn: 'নোয়াখালী', nameEn: 'Noakhali', label: 'নোয়াখালী (Noakhali)', divisionId: 'Chattogram', divisionBn: 'চট্টগ্রাম' },
  { id: 'chandpur', nameBn: 'চাঁদপুর', nameEn: 'Chandpur', label: 'চাঁদপুর (Chandpur)', divisionId: 'Chattogram', divisionBn: 'চট্টগ্রাম' },
  { id: 'lakshmipur', nameBn: 'লক্ষ্মীপুর', nameEn: 'Lakshmipur', label: 'লক্ষ্মীপুর (Lakshmipur)', divisionId: 'Chattogram', divisionBn: 'চট্টগ্রাম' },
  { id: 'rangamati', nameBn: 'রাঙ্গামাটি', nameEn: 'Rangamati', label: 'রাঙ্গামাটি (Rangamati)', divisionId: 'Chattogram', divisionBn: 'চট্টগ্রাম' },
  { id: 'khagrachhari', nameBn: 'খাগড়াছড়ি', nameEn: 'Khagrachhari', label: 'খাগড়াছড়ি (Khagrachhari)', divisionId: 'Chattogram', divisionBn: 'চট্টগ্রাম' },
  { id: 'bandarban', nameBn: 'বান্দরবান', nameEn: 'Bandarban', label: 'বান্দরবান (Bandarban)', divisionId: 'Chattogram', divisionBn: 'চট্টগ্রাম' },

  // ─── রাজশাহী বিভাগ (Rajshahi Division - 8 Districts) ───
  { id: 'rajshahi', nameBn: 'রাজশাহী', nameEn: 'Rajshahi', label: 'রাজশাহী (Rajshahi)', divisionId: 'Rajshahi', divisionBn: 'রাজশাহী' },
  { id: 'bogura', nameBn: 'বগুড়া', nameEn: 'Bogura', label: 'বগুড়া (Bogura)', divisionId: 'Rajshahi', divisionBn: 'রাজশাহী' },
  { id: 'pabna', nameBn: 'পাবনা', nameEn: 'Pabna', label: 'পাবনা (Pabna)', divisionId: 'Rajshahi', divisionBn: 'রাজশাহী' },
  { id: 'sirajganj', nameBn: 'সিরাজগঞ্জ', nameEn: 'Sirajganj', label: 'সিরাজগঞ্জ (Sirajganj)', divisionId: 'Rajshahi', divisionBn: 'রাজশাহী' },
  { id: 'naogaon', nameBn: 'নওগাঁ', nameEn: 'Naogaon', label: 'নওগাঁ (Naogaon)', divisionId: 'Rajshahi', divisionBn: 'রাজশাহী' },
  { id: 'natore', nameBn: 'নাটোর', nameEn: 'Natore', label: 'নাটোর (Natore)', divisionId: 'Rajshahi', divisionBn: 'রাজশাহী' },
  { id: 'chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', nameEn: 'Chapai Nawabganj', label: 'চাঁপাইনবাবগঞ্জ (Chapai Nawabganj)', divisionId: 'Rajshahi', divisionBn: 'রাজশাহী' },
  { id: 'joypurhat', nameBn: 'জয়পুরহাট', nameEn: 'Joypurhat', label: 'জয়পুরহাট (Joypurhat)', divisionId: 'Rajshahi', divisionBn: 'রাজশাহী' },

  // ─── খুলনা বিভাগ (Khulna Division - 10 Districts) ───
  { id: 'khulna', nameBn: 'খুলনা', nameEn: 'Khulna', label: 'খুলনা (Khulna)', divisionId: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'jashore', nameBn: 'যশোর', nameEn: 'Jashore', label: 'যশোর (Jashore)', divisionId: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'bagerhat', nameBn: 'বাগেরহাট', nameEn: 'Bagerhat', label: 'বাগেরহাট (Bagerhat)', divisionId: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'satkhira', nameBn: 'সাতক্ষীরা', nameEn: 'Satkhira', label: 'সাতক্ষীরা (Satkhira)', divisionId: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'jhenaidah', nameBn: 'ঝিনাইদহ', nameEn: 'Jhenaidah', label: 'ঝিনাইদহ (Jhenaidah)', divisionId: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'kushtia', nameBn: 'কুষ্টিয়া', nameEn: 'Kushtia', label: 'কুষ্টিয়া (Kushtia)', divisionId: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'chuadanga', nameBn: 'চুয়াডাঙ্গা', nameEn: 'Chuadanga', label: 'চুয়াডাঙ্গা (Chuadanga)', divisionId: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'meherpur', nameBn: 'মেহেরপুর', nameEn: 'Meherpur', label: 'মেহেরপুর (Meherpur)', divisionId: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'magura', nameBn: 'মাগুরা', nameEn: 'Magura', label: 'মাগুরা (Magura)', divisionId: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'narail', nameBn: 'নড়াইল', nameEn: 'Narail', label: 'নড়াইল (Narail)', divisionId: 'Khulna', divisionBn: 'খুলনা' },

  // ─── বরিশাল বিভাগ (Barishal Division - 6 Districts) ───
  { id: 'barishal', nameBn: 'বরিশাল', nameEn: 'Barishal', label: 'বরিশাল (Barishal)', divisionId: 'Barishal', divisionBn: 'বরিশাল' },
  { id: 'patuakhali', nameBn: 'পটুয়াখালী', nameEn: 'Patuakhali', label: 'পটুয়াখালী (Patuakhali)', divisionId: 'Barishal', divisionBn: 'বরিশাল' },
  { id: 'bhola', nameBn: 'ভোলা', nameEn: 'Bhola', label: 'ভোলা (Bhola)', divisionId: 'Barishal', divisionBn: 'বরিশাল' },
  { id: 'pirojpur', nameBn: 'পিরোজপুর', nameEn: 'Pirojpur', label: 'পিরোজপুর (Pirojpur)', divisionId: 'Barishal', divisionBn: 'বরিশাল' },
  { id: 'barguna', nameBn: 'বরগুনা', nameEn: 'Barguna', label: 'বরগুনা (Barguna)', divisionId: 'Barishal', divisionBn: 'বরিশাল' },
  { id: 'jhalokati', nameBn: 'ঝালকাঠি', nameEn: 'Jhalokati', label: 'ঝালকাঠি (Jhalokati)', divisionId: 'Barishal', divisionBn: 'বরিশাল' },

  // ─── সিলেট বিভাগ (Sylhet Division - 4 Districts) ───
  { id: 'sylhet', nameBn: 'সিলেট', nameEn: 'Sylhet', label: 'সিলেট (Sylhet)', divisionId: 'Sylhet', divisionBn: 'সিলেট' },
  { id: 'moulvibazar', nameBn: 'মৌলভীবাজার', nameEn: 'Moulvibazar', label: 'মৌলভীবাজার (Moulvibazar)', divisionId: 'Sylhet', divisionBn: 'সিলেট' },
  { id: 'habiganj', nameBn: 'হবিগঞ্জ', nameEn: 'Habiganj', label: 'হবিগঞ্জ (Habiganj)', divisionId: 'Sylhet', divisionBn: 'সিলেট' },
  { id: 'sunamganj', nameBn: 'সুনামগঞ্জ', nameEn: 'Sunamganj', label: 'সুনামগঞ্জ (Sunamganj)', divisionId: 'Sylhet', divisionBn: 'সিলেট' },

  // ─── রংপুর বিভাগ (Rangpur Division - 8 Districts) ───
  { id: 'rangpur', nameBn: 'রংপুর', nameEn: 'Rangpur', label: 'রংপুর (Rangpur)', divisionId: 'Rangpur', divisionBn: 'রংপুর' },
  { id: 'dinajpur', nameBn: 'দিনাজপুর', nameEn: 'Dinajpur', label: 'দিনাজপুর (Dinajpur)', divisionId: 'Rangpur', divisionBn: 'রংপুর' },
  { id: 'kurigram', nameBn: 'কুড়িগ্রাম', nameEn: 'Kurigram', label: 'কুড়িগ্রাম (Kurigram)', divisionId: 'Rangpur', divisionBn: 'রংপুর' },
  { id: 'gaibandha', nameBn: 'গাইবান্ধা', nameEn: 'Gaibandha', label: 'গাইবান্ধা (Gaibandha)', divisionId: 'Rangpur', divisionBn: 'রংপুর' },
  { id: 'nilphamari', nameBn: 'নীলফামারী', nameEn: 'Nilphamari', label: 'নীলফামারী (Nilphamari)', divisionId: 'Rangpur', divisionBn: 'রংপুর' },
  { id: 'panchagarh', nameBn: 'পঞ্চগড়', nameEn: 'Panchagarh', label: 'পঞ্চগড় (Panchagarh)', divisionId: 'Rangpur', divisionBn: 'রংপুর' },
  { id: 'thakurgaon', nameBn: 'ঠাকুরগাঁও', nameEn: 'Thakurgaon', label: 'ঠাকুরগাঁও (Thakurgaon)', divisionId: 'Rangpur', divisionBn: 'রংপুর' },
  { id: 'lalmonirhat', nameBn: 'লালমনিরহাট', nameEn: 'Lalmonirhat', label: 'লালমনিরহাট (Lalmonirhat)', divisionId: 'Rangpur', divisionBn: 'রংপুর' },

  // ─── ময়মনসিংহ বিভাগ (Mymensingh Division - 4 Districts) ───
  { id: 'mymensingh', nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh', label: 'ময়মনসিংহ (Mymensingh)', divisionId: 'Mymensingh', divisionBn: 'ময়মনসিংহ' },
  { id: 'jamalpur', nameBn: 'জামালপুর', nameEn: 'Jamalpur', label: 'জামালপুর (Jamalpur)', divisionId: 'Mymensingh', divisionBn: 'ময়মনসিংহ' },
  { id: 'netrokona', nameBn: 'নেত্রকোণা', nameEn: 'Netrokona', label: 'নেত্রকোণা (Netrokona)', divisionId: 'Mymensingh', divisionBn: 'ময়মনসিংহ' },
  { id: 'sherpur', nameBn: 'শেরপুর', nameEn: 'Sherpur', label: 'শেরপুর (Sherpur)', divisionId: 'Mymensingh', divisionBn: 'ময়মনসিংহ' },
];

/**
 * Filter districts dynamically based on division selection.
 * If division is empty or not found, returns all 64 districts.
 */
export function getDistrictsByDivision(divisionKey?: string): DistrictItem[] {
  if (!divisionKey || divisionKey.trim() === '') {
    return BANGLADESH_DISTRICTS;
  }

  const normalized = divisionKey.trim().toLowerCase();
  
  // Find matching division
  const matchedDiv = BANGLADESH_DIVISIONS.find(
    d => d.id.toLowerCase() === normalized || 
         d.nameBn.toLowerCase() === normalized || 
         d.nameEn.toLowerCase() === normalized
  );

  if (matchedDiv) {
    return BANGLADESH_DISTRICTS.filter(d => d.divisionId === matchedDiv.id);
  }

  // Fallback direct check
  const filtered = BANGLADESH_DISTRICTS.filter(
    d => d.divisionId.toLowerCase() === normalized || 
         d.divisionBn.toLowerCase() === normalized
  );

  return filtered.length > 0 ? filtered : BANGLADESH_DISTRICTS;
}

/**
 * Find division for a given district name
 */
export function getDivisionForDistrict(districtName: string): DivisionItem | undefined {
  if (!districtName) return undefined;
  const normalized = districtName.toLowerCase().trim();
  const d = BANGLADESH_DISTRICTS.find(
    item => item.nameBn.toLowerCase() === normalized || 
            item.nameEn.toLowerCase() === normalized ||
            item.label.toLowerCase().includes(normalized)
  );
  if (!d) return undefined;
  return BANGLADESH_DIVISIONS.find(div => div.id === d.divisionId);
}
