'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { 
  Users, Plus, Shield, MessageSquare, Printer, HeartHandshake, 
  Coins, Search, Filter, CheckCircle2, Calendar, FileText, 
  ArrowUpRight, Download, Sparkles, AlertCircle, Phone, MapPin,
  Building, DollarSign, Wallet, Tag, Gift, Award, Send
} from 'lucide-react';
import OfficialWatermark from '@/components/OfficialWatermark';

// ─── TYPES & INTERFACES ───

interface Donor {
  id: string;
  name: string;
  phone: string;
  address: string;
  type: 'স্থায়ী আজীবন দাতা' | 'মাসিক শুভাকাঙ্ক্ষী' | 'সাধারণ এককালীন দাতা' | 'কোরবানি দাতা';
  pledgeAmount: number;
  totalDonated: number;
  lastDonationDate: string;
  preferredFund: 'সাধারণ ফান্ড' | 'লিল্লাহ/যাকাত ফান্ড' | 'কোরবানির চামড়া ফান্ড' | 'মসজিদ নির্মাণ ফান্ড';
  status: 'সক্রিয়' | 'নিষ্ক্রিয়';
}

interface DonationRecord {
  id: string;
  receiptNo: string;
  date: string;
  donorId: string;
  donorName: string;
  phone: string;
  fundCategory: 'সাধারণ ফান্ড' | 'লিল্লাহ/যাকাত ফান্ড' | 'সদকা ও ফিতরা' | 'কোরবানির চামড়া ফান্ড' | 'এতিমখানা আহার্য';
  amount: number;
  paymentMethod: 'নগদ' | 'বিকাশ/নগদ' | 'ব্যাংক ট্রান্সফার' | 'চেক';
  collectorName: string;
  remarks: string;
}

interface QurbaniHideRecord {
  id: string;
  seasonYear: string;
  donorName: string;
  addressArea: string;
  hideType: 'গরুর চামড়া' | 'ছাগলের চামড়া' | 'ভেড়ার চামড়া';
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  buyerName: string;
  collectionDate: string;
  status: 'সংগৃহীত' | 'বিক্রিত ও ক্যাশ জমা';
}

export default function DonorsZakatPage() {
  const { instituteSettings } = useApp();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.bn;

  const [activeTab, setActiveTab] = useState<'list' | 'add-donation' | 'qurbani' | 'receipts'>('list');

  // Search & Filter state
  const [donorSearch, setDonorSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [fundFilter, setFundFilter] = useState('all');

  // ─── INITIAL MOCK DATA & STORAGE ───
  const [donors, setDonors] = useState<Donor[]>([
    {
      id: 'dn-101',
      name: 'হাজী রফিকুল ইসলাম',
      phone: '01711223344',
      address: 'ধানমন্ডি, ঢাকা',
      type: 'স্থায়ী আজীবন দাতা',
      pledgeAmount: 5000,
      totalDonated: 120000,
      lastDonationDate: '২০২৬-০৯-১৫',
      preferredFund: 'লিল্লাহ/যাকাত ফান্ড',
      status: 'সক্রিয়',
    },
    {
      id: 'dn-102',
      name: 'আলহাজ্ব গোলাম মোস্তফা',
      phone: '01822334455',
      address: 'উত্তরা, ঢাকা',
      type: 'মাসিক শুভাকাঙ্ক্ষী',
      pledgeAmount: 3000,
      totalDonated: 45000,
      lastDonationDate: '২০২৬-০৯-১০',
      preferredFund: 'সাধারণ ফান্ড',
      status: 'সক্রিয়',
    },
    {
      id: 'dn-103',
      name: 'ইঞ্জিনিয়ার মাহমুদুল হাসান',
      phone: '01933445566',
      address: 'গুলশান, ঢাকা',
      type: 'স্থায়ী আজীবন দাতা',
      pledgeAmount: 10000,
      totalDonated: 250000,
      lastDonationDate: '২০২৬-০৯-০১',
      preferredFund: 'লিল্লাহ/যাকাত ফান্ড',
      status: 'সক্রিয়',
    },
    {
      id: 'dn-104',
      name: 'ড. সাইফুর রহমান',
      phone: '01755667788',
      address: 'মিরপুর, ঢাকা',
      type: 'সাধারণ এককালীন দাতা',
      pledgeAmount: 0,
      totalDonated: 20000,
      lastDonationDate: '২০২৬-০৮-২০',
      preferredFund: 'মসজিদ নির্মাণ ফান্ড',
      status: 'সক্রিয়',
    },
  ]);

  const [donations, setDonations] = useState<DonationRecord[]>([
    {
      id: 'rec-1001',
      receiptNo: 'DON-2026-101',
      date: '২০২৬-০৯-১৫',
      donorId: 'dn-101',
      donorName: 'হাজী রফিকুল ইসলাম',
      phone: '01711223344',
      fundCategory: 'লিল্লাহ/যাকাত ফান্ড',
      amount: 50000,
      paymentMethod: 'বিকাশ/নগদ',
      collectorName: 'মাওলানা নোমান হাবিব',
      remarks: 'এতিমখানার ছাত্রদের আহার্য ও লিল্লাহ বোর্ডিং বাবদ যাকাত অনুদান',
    },
    {
      id: 'rec-1002',
      receiptNo: 'DON-2026-102',
      date: '২০২৬-০৯-১০',
      donorId: 'dn-102',
      donorName: 'আলহাজ্ব গোলাম মোস্তফা',
      phone: '01822334455',
      fundCategory: 'সাধারণ ফান্ড',
      amount: 15000,
      paymentMethod: 'নগদ',
      collectorName: 'হাফেজ জহিরুল ইসলাম',
      remarks: 'মাদ্রাসার সাধারণ ব্যয় ও বিদ্যুৎ বিল বাবদ দান',
    },
    {
      id: 'rec-1003',
      receiptNo: 'DON-2026-103',
      date: '২০২৬-০৯-০১',
      donorId: 'dn-103',
      donorName: 'ইঞ্জিনিয়ার মাহমুদুল হাসান',
      phone: '01933445566',
      fundCategory: 'লিল্লাহ/যাকাত ফান্ড',
      amount: 100000,
      paymentMethod: 'ব্যাংক ট্রান্সফার',
      collectorName: 'মুহতামিম সাহেব',
      remarks: 'লিল্লাহ বোর্ডিং খাদ্য তহবিল অনুদান',
    },
  ]);

  const [qurbaniHides, setQurbaniHides] = useState<QurbaniHideRecord[]>([
    {
      id: 'qh-1',
      seasonYear: '২০২৬ (১৪৪৭ হিজরী)',
      donorName: 'হাজী আনোয়ার হোসেন (এলাকাবাসী)',
      addressArea: 'গেন্ডারিয়া, ঢাকা',
      hideType: 'গরুর চামড়া',
      quantity: 45,
      unitPrice: 850,
      totalAmount: 38250,
      buyerName: 'তানভীর লেদার ট্যানারি',
      collectionDate: '২০২৬-০৬-১৭',
      status: 'বিক্রিত ও ক্যাশ জমা',
    },
    {
      id: 'qh-2',
      seasonYear: '২০২৬ (১৪৪৭ হিজরী)',
      donorName: 'মহল্লাবাসী অনুদান (কালেকশন পয়েন্ট-২)',
      addressArea: 'জুরাইন, ঢাকা',
      hideType: 'ছাগলের চামড়া',
      quantity: 80,
      unitPrice: 120,
      totalAmount: 9600,
      buyerName: 'মেসার্স রফিক ট্যানার্স',
      collectionDate: '২০২৬-০৬-১৭',
      status: 'বিক্রিত ও ক্যাশ জমা',
    },
  ]);

  // ─── NEW DONATION FORM STATE ───
  const [newDonation, setNewDonation] = useState({
    donorName: '',
    phone: '',
    address: '',
    donorType: 'সাধারণ এককালীন দাতা' as Donor['type'],
    fundCategory: 'লিল্লাহ/যাকাত ফান্ড' as DonationRecord['fundCategory'],
    amount: 1000,
    paymentMethod: 'নগদ' as DonationRecord['paymentMethod'],
    collectorName: 'ক্যাশিয়ার সাহেব',
    remarks: 'মাদ্রাসার লিল্লাহ ফান্ডের জন্য সাধারণ দান',
    sendSms: true,
  });

  const [createdReceipt, setCreatedReceipt] = useState<DonationRecord | null>(null);

  // ─── NEW DONOR REGISTRATION FORM STATE ───
  const [showAddDonorModal, setShowAddDonorModal] = useState(false);
  const [newDonorForm, setNewDonorForm] = useState({
    name: '',
    phone: '',
    address: '',
    type: 'মাসিক শুভাকাঙ্ক্ষী' as Donor['type'],
    pledgeAmount: 1000,
    preferredFund: 'লিল্লাহ/যাকাত ফান্ড' as Donor['preferredFund'],
  });

  // ─── NEW QURBANI HIDE FORM STATE ───
  const [showAddHideModal, setShowAddHideModal] = useState(false);
  const [newHideForm, setNewHideForm] = useState({
    donorName: '',
    addressArea: 'ঢাকা দক্ষিণ',
    hideType: 'গরুর চামড়া' as QurbaniHideRecord['hideType'],
    quantity: 10,
    unitPrice: 800,
    buyerName: 'স্থানীয় চামড়া ব্যবসায়ী',
  });

  // Filtered Donors List
  const filteredDonors = useMemo(() => {
    return donors.filter((d) => {
      const matchSearch = !donorSearch || d.name.includes(donorSearch) || d.phone.includes(donorSearch) || d.address.includes(donorSearch);
      const matchType = typeFilter === 'all' || d.type === typeFilter;
      const matchFund = fundFilter === 'all' || d.preferredFund === fundFilter;
      return matchSearch && matchType && matchFund;
    });
  }, [donors, donorSearch, typeFilter, fundFilter]);

  // Aggregate Fund Statistics
  const totalZakatFund = useMemo(() => {
    return donations.filter(d => d.fundCategory.includes('যাকাত') || d.fundCategory.includes('লিল্লাহ')).reduce((sum, d) => sum + d.amount, 0);
  }, [donations]);

  const totalGeneralFund = useMemo(() => {
    return donations.filter(d => d.fundCategory === 'সাধারণ ফান্ড').reduce((sum, d) => sum + d.amount, 0);
  }, [donations]);

  const totalQurbaniHidesRevenue = useMemo(() => {
    return qurbaniHides.reduce((sum, q) => sum + q.totalAmount, 0);
  }, [qurbaniHides]);

  // Submit New Donation Action
  const handleSaveDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonation.donorName.trim() || newDonation.amount <= 0) return;

    const receiptNo = `DON-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const dateStr = new Date().toISOString().split('T')[0];

    // Find or register donor
    let matchedDonor = donors.find(d => d.phone === newDonation.phone || d.name === newDonation.donorName);
    let donorId = matchedDonor ? matchedDonor.id : `dn-${Date.now()}`;

    if (!matchedDonor) {
      const newD: Donor = {
        id: donorId,
        name: newDonation.donorName,
        phone: newDonation.phone || '—',
        address: newDonation.address || '—',
        type: newDonation.donorType,
        pledgeAmount: 0,
        totalDonated: newDonation.amount,
        lastDonationDate: dateStr,
        preferredFund: newDonation.fundCategory.includes('যাকাত') ? 'লিল্লাহ/যাকাত ফান্ড' : 'সাধারণ ফান্ড',
        status: 'সক্রিয়',
      };
      setDonors(prev => [newD, ...prev]);
    } else {
      setDonors(prev => prev.map(d => d.id === donorId ? {
        ...d,
        totalDonated: d.totalDonated + newDonation.amount,
        lastDonationDate: dateStr,
      } : d));
    }

    const newRecord: DonationRecord = {
      id: `rec-${Date.now()}`,
      receiptNo,
      date: dateStr,
      donorId,
      donorName: newDonation.donorName,
      phone: newDonation.phone || '—',
      fundCategory: newDonation.fundCategory,
      amount: newDonation.amount,
      paymentMethod: newDonation.paymentMethod,
      collectorName: newDonation.collectorName,
      remarks: newDonation.remarks,
    };

    setDonations(prev => [newRecord, ...prev]);
    setCreatedReceipt(newRecord);
    setActiveTab('receipts');
  };

  // Register New Lifetime Donor Action
  const handleRegisterDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonorForm.name.trim()) return;

    const newD: Donor = {
      id: `dn-${Date.now()}`,
      name: newDonorForm.name,
      phone: newDonorForm.phone || '—',
      address: newDonorForm.address || '—',
      type: newDonorForm.type,
      pledgeAmount: newDonorForm.pledgeAmount || 0,
      totalDonated: 0,
      lastDonationDate: '—',
      preferredFund: newDonorForm.preferredFund,
      status: 'সক্রিয়',
    };

    setDonors(prev => [newD, ...prev]);
    setShowAddDonorModal(false);
    setNewDonorForm({ name: '', phone: '', address: '', type: 'মাসিক শুভাকাঙ্ক্ষী', pledgeAmount: 1000, preferredFund: 'লিল্লাহ/যাকাত ফান্ড' });
  };

  // Add Qurbani Hides Record Action
  const handleSaveHideRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHideForm.donorName.trim() || newHideForm.quantity <= 0) return;

    const total = newHideForm.quantity * newHideForm.unitPrice;
    const item: QurbaniHideRecord = {
      id: `qh-${Date.now()}`,
      seasonYear: '২০২৬ (১৪৪৭ হিজরী)',
      donorName: newHideForm.donorName,
      addressArea: newHideForm.addressArea,
      hideType: newHideForm.hideType,
      quantity: newHideForm.quantity,
      unitPrice: newHideForm.unitPrice,
      totalAmount: total,
      buyerName: newHideForm.buyerName,
      collectionDate: new Date().toISOString().split('T')[0],
      status: 'বিক্রিত ও ক্যাশ জমা',
    };

    setQurbaniHides(prev => [item, ...prev]);
    setShowAddHideModal(false);
    setNewHideForm({ donorName: '', addressArea: 'ঢাকা দক্ষিণ', hideType: 'গরুর চামড়া', quantity: 10, unitPrice: 800, buyerName: 'স্থানীয় চামড়া ব্যবসায়ী' });
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">

      {/* HEADER BAR */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <HeartHandshake className="text-emerald-600" />
            দান, যাকাত ও কোরবানির চামড়া ফান্ড
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            স্থায়ী আজীবন দাতা সদস্য, যাকাত/লিল্লাহ অনুদান ও কোরবানির পশুর চামড়া তহবিল খতিয়ান
          </p>
        </div>

        {/* SUB-TABS */}
        <div className="flex bg-gray-100 dark:bg-slate-700/60 p-1.5 rounded-xl flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'list' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
            }`}
          >
            <Users size={15} />
            দাতা খতিয়ান ({donors.length})
          </button>
          <button
            onClick={() => setActiveTab('add-donation')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'add-donation' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
            }`}
          >
            <Plus size={15} />
            নতুন অনুদান এন্ট্রি
          </button>
          <button
            onClick={() => setActiveTab('qurbani')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'qurbani' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
            }`}
          >
            <Shield size={15} />
            কোরবানির চামড়া ফান্ড
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'receipts' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
            }`}
          >
            <FileText size={15} />
            দান রসিদ ও অডিট
          </button>
        </div>
      </div>

      {/* FUND SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-tr from-emerald-800 to-teal-700 text-white p-5 rounded-2xl shadow-sm border border-emerald-600">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-100 mb-1">
            <span>লিল্লাহ ও যাকাত ফান্ড সংগৃহীত (Zakat & Lillah Boarding)</span>
            <Coins size={18} className="text-emerald-200" />
          </div>
          <p className="text-2xl font-black font-mono">৳ {totalZakatFund.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-100/80 mt-1 block">এতিমখানা আহার্য ও লিল্লাহ বোর্ডিং ফান্ড</span>
        </div>

        <div className="bg-gradient-to-tr from-blue-800 to-indigo-800 text-white p-5 rounded-2xl shadow-sm border border-blue-600">
          <div className="flex justify-between items-center text-xs font-bold text-blue-100 mb-1">
            <span>সাধারণ অনুদান ফান্ড (General Donation Fund)</span>
            <Wallet size={18} className="text-blue-200" />
          </div>
          <p className="text-2xl font-black font-mono">৳ {totalGeneralFund.toLocaleString()}</p>
          <span className="text-[11px] text-blue-100/80 mt-1 block">মাদ্রাসার সাধারণ পরিচালনা ও শিক্ষক ভাতা</span>
        </div>

        <div className="bg-gradient-to-tr from-amber-600 to-amber-700 text-white p-5 rounded-2xl shadow-sm border border-amber-500">
          <div className="flex justify-between items-center text-xs font-bold text-amber-100 mb-1">
            <span>কোরবানির চামড়া ফান্ড আয় (Qurbani Hides Sales)</span>
            <Shield size={18} className="text-amber-200" />
          </div>
          <p className="text-2xl font-black font-mono">৳ {totalQurbaniHidesRevenue.toLocaleString()}</p>
          <span className="text-[11px] text-amber-100/80 mt-1 block">চলতি মৌসুমের চামড়া বিক্রি থেকে নিট জমা</span>
        </div>
      </div>

      {/* ─── SUB-TAB 1: DONORS LIST & REGISTRY ─── */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xs border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto flex-1">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  value={donorSearch}
                  onChange={(e) => setDonorSearch(e.target.value)}
                  placeholder="দাতার নাম, মোবাইল বা এলাকা অনুসন্ধান..." 
                  className="w-full pl-9 pr-4 py-2 border rounded-xl bg-gray-50 dark:bg-slate-700 dark:border-slate-600 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="p-2 border rounded-xl bg-white dark:bg-slate-700 text-xs font-bold text-gray-800 dark:text-white outline-none"
              >
                <option value="all">সকল দাতা ক্যাটাগরি</option>
                <option value="স্থায়ী আজীবন দাতা">স্থায়ী আজীবন দাতা</option>
                <option value="মাসিক শুভাকাঙ্ক্ষী">মাসিক শুভাকাঙ্ক্ষী</option>
                <option value="সাধারণ এককালীন দাতা">সাধারণ এককালীন দাতা</option>
              </select>

              <button
                onClick={() => setShowAddDonorModal(true)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Plus size={16} />
                + নতুন দাতা রেজিস্ট্রেশন
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-700 font-bold text-gray-700 dark:text-gray-200 border-b">
                    <th className="p-3">দাতার নাম ও ঠিকানা</th>
                    <th className="p-3">মোবাইল নম্বর</th>
                    <th className="p-3">দাতা ক্যাটাগরি</th>
                    <th className="p-3">পছন্দের ফান্ড</th>
                    <th className="p-3 text-right">মাসিক অঙ্গীকার (৳)</th>
                    <th className="p-3 text-right">সর্বমোট প্রদান (৳)</th>
                    <th className="p-3 text-center">সর্বশেষ অনুদান</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-700">
                  {filteredDonors.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                      <td className="p-3">
                        <strong className="text-gray-900 dark:text-white block text-xs">{d.name}</strong>
                        <span className="text-gray-400 text-[11px] flex items-center gap-1">
                          <MapPin size={11} /> {d.address}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-600">
                        <span className="flex items-center gap-1">
                          <Phone size={11} /> {d.phone}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {d.type}
                        </span>
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300 font-bold">{d.preferredFund}</td>
                      <td className="p-3 text-right font-mono font-bold">
                        {d.pledgeAmount > 0 ? `৳ ${d.pledgeAmount.toLocaleString()}` : '—'}
                      </td>
                      <td className="p-3 text-right font-mono font-black text-emerald-700 dark:text-emerald-400">
                        ৳ {d.totalDonated.toLocaleString()}
                      </td>
                      <td className="p-3 text-center font-mono text-gray-500">{d.lastDonationDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── SUB-TAB 2: ADD NEW DONATION ─── */}
      {activeTab === 'add-donation' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-700 max-w-3xl mx-auto space-y-6">
          <div className="border-b pb-4 border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="text-emerald-600" size={20} />
              নতুন অনুদান গ্রহণ ও অফিসিয়াল রসিদ প্রদান
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              যাকাত, সদকা বা সাধারণ ফান্ডে অনুদান যুক্ত করে অফিসিয়াল টাকা রসিদ জেনারেট করুন
            </p>
          </div>

          <form onSubmit={handleSaveDonation} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">দাতার পূর্ণ নাম:</label>
                <input
                  type="text"
                  value={newDonation.donorName}
                  onChange={(e) => setNewDonation({ ...newDonation, donorName: e.target.value })}
                  placeholder="যেমন: হাজী রফিকুল ইসলাম"
                  className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">মোবাইল নম্বর (SMS ধন্যবাদ বার্তার জন্য):</label>
                <input
                  type="text"
                  value={newDonation.phone}
                  onChange={(e) => setNewDonation({ ...newDonation, phone: e.target.value })}
                  placeholder="01711XXXXXX"
                  className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">ফান্ড খাতা / ক্যাটাগরি:</label>
                <select
                  value={newDonation.fundCategory}
                  onChange={(e) => setNewDonation({ ...newDonation, fundCategory: e.target.value as any })}
                  className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-700 font-bold text-emerald-700 dark:text-emerald-400 outline-none"
                >
                  <option value="লিল্লাহ/যাকাত ফান্ড">লিল্লাহ/যাকাত ফান্ড (এতিমখানা ও খাবার)</option>
                  <option value="সাধারণ ফান্ড">সাধারণ ফান্ড (মাদ্রাসা পরিচালনা)</option>
                  <option value="সদকা ও ফিতরা">সদকা ও ফিতরা</option>
                  <option value="কোরবানির চামড়া ফান্ড">কোরবানির চামড়া ফান্ড</option>
                  <option value="এতিমখানা আহার্য">এতিমখানা বিশেষ খাদ্য অনুদান</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">অনুদানের পরিমাণ (টাকা ৳):</label>
                <input
                  type="number"
                  min="10"
                  value={newDonation.amount}
                  onChange={(e) => setNewDonation({ ...newDonation, amount: parseInt(e.target.value) || 0 })}
                  className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-mono font-black text-base outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">পরিশোধের মাধ্যম:</label>
                <select
                  value={newDonation.paymentMethod}
                  onChange={(e) => setNewDonation({ ...newDonation, paymentMethod: e.target.value as any })}
                  className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-700 font-bold outline-none"
                >
                  <option value="নগদ">নগদ (Cash)</option>
                  <option value="বিকাশ/নগদ">বিকাশ / নগদ (Bkash/Nagad)</option>
                  <option value="ব্যাংক ট্রান্সফার">ব্যাংক ট্রান্সফার (Bank Deposit)</option>
                  <option value="চেক">চেক (Cheque)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">আদায়কারী / সংগ্রাহক কর্মকর্তা:</label>
                <input
                  type="text"
                  value={newDonation.collectorName}
                  onChange={(e) => setNewDonation({ ...newDonation, collectorName: e.target.value })}
                  placeholder="যেমন: মাওলানা নোমান হাবিব"
                  className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-700 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">বিশেষ মন্তব্য / উদ্দেশ্য:</label>
              <textarea
                value={newDonation.remarks}
                onChange={(e) => setNewDonation({ ...newDonation, remarks: e.target.value })}
                rows={2}
                placeholder="যেমন: লিল্লাহ বোর্ডিংয়ের ছাত্রদের এক বেলার বিশেষ খাসির গোশত খাওয়ানোর জন্য অনুদান"
                className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-700 outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition"
              >
                <CheckCircle2 size={16} />
                অনুদানের টাকা জমা নিন ও রসিদ জেনারেট করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── SUB-TAB 3: QURBANI HIDES FUND ─── */}
      {activeTab === 'qurbani' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="text-amber-600" size={20} />
                কোরবানির পশুর চামড়া সংগ্রহ ও বিক্রয় খতিয়ান
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ঈদুল আজহা মৌসুমে চামড়া দান, কালেকশন পয়েন্ট এবং বিক্রিত অর্থের খতিয়ান
              </p>
            </div>

            <button
              onClick={() => setShowAddHideModal(true)}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus size={16} />
              + নতুন চামড়া বিক্রয় ভাউচার যোগ
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-gray-200 font-bold border-b">
                    <th className="p-3">কোরবানি মৌসুম</th>
                    <th className="p-3">দাতা / এলাকা পয়েন্ট</th>
                    <th className="p-3">চামড়ার ধরন</th>
                    <th className="p-3 text-center">সংখ্যা (টি)</th>
                    <th className="p-3 text-right">দর (প্রতি টি)</th>
                    <th className="p-3 text-right">মোট বিক্রয়মূল্য (৳)</th>
                    <th className="p-3">ক্রেতা / ট্যানারির নাম</th>
                    <th className="p-3 text-center">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-700">
                  {qurbaniHides.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                      <td className="p-3 font-mono font-bold text-amber-700 dark:text-amber-400">{q.seasonYear}</td>
                      <td className="p-3 font-bold text-gray-900 dark:text-white">{q.donorName}</td>
                      <td className="p-3">{q.hideType}</td>
                      <td className="p-3 text-center font-mono font-bold">{q.quantity} টি</td>
                      <td className="p-3 text-right font-mono">৳ {q.unitPrice}</td>
                      <td className="p-3 text-right font-mono font-black text-emerald-700 dark:text-emerald-400">
                        ৳ {q.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300 font-bold">{q.buyerName}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {q.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── SUB-TAB 4: PRINTABLE DONATION MONEY RECEIPT & AUDIT ─── */}
      {activeTab === 'receipts' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xs border border-gray-100 dark:border-slate-700 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
              সর্বশেষ অনুদান রসিদসমূহ ({donations.length} টি ভাউচার)
            </span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-900 transition"
            >
              <Printer size={15} />
              প্রিন্ট রসিদ
            </button>
          </div>

          {/* PRINTABLE MONEY RECEIPT CARD */}
          {createdReceipt && (
            <div id="printable-receipt" className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 relative overflow-hidden max-w-2xl mx-auto">
              <OfficialWatermark />

              <div className="text-center border-b pb-4 border-gray-200 dark:border-slate-700 relative z-10">
                <h2 className="text-2xl font-black text-emerald-800 dark:text-emerald-400 font-serif">
                  {instituteSettings.name || "জামিয়া আরাবিয়া ইমদাদুল উলুম ফরিদাবাদ মাদ্রাসা, ঢাকা"}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {instituteSettings.address || "ফরিদাবাদ, গেন্ডারিয়া, ঢাকা-১২০৪"} — এতিমখানা ও লিল্লাহ ফান্ড
                </p>
                
                <div className="inline-block mt-2 px-5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs rounded-full">
                  অফিসিয়াল টাকা রসিদ (Donation Receipt)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-6 text-xs relative z-10 border-b dark:border-slate-700">
                <div>
                  <span className="text-gray-400 block font-medium">রসিদ নম্বর:</span>
                  <strong className="text-sm text-emerald-700 font-mono font-bold">{createdReceipt.receiptNo}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">তারিখ:</span>
                  <strong className="text-sm font-mono text-gray-900 dark:text-white font-bold">{createdReceipt.date}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">দাতার নাম:</span>
                  <strong className="text-sm text-gray-900 dark:text-white font-bold">{createdReceipt.donorName}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">মোবাইল:</span>
                  <strong className="text-sm font-mono text-gray-900 dark:text-white font-bold">{createdReceipt.phone}</strong>
                </div>
              </div>

              <div className="py-6 space-y-3 relative z-10 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">ফান্ড খাত:</span>
                  <span className="font-bold text-emerald-700">{createdReceipt.fundCategory}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">পরিশোধের মাধ্যম:</span>
                  <span className="font-bold">{createdReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">বিশেষ উদ্দেশ্য / মন্তব্য:</span>
                  <span className="font-bold text-gray-700">{createdReceipt.remarks}</span>
                </div>
                <div className="flex justify-between p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200">
                  <span className="font-bold text-gray-800">মোট প্রাপ্ত অনুদান:</span>
                  <span className="font-black text-emerald-700 text-lg font-mono">৳ {createdReceipt.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-8 mt-4 border-t dark:border-slate-700 relative z-10 text-xs">
                <div className="text-center">
                  <div className="border-t border-gray-400 w-32 pt-1 font-bold">{createdReceipt.collectorName}</div>
                  <span className="text-[10px] text-gray-400">আদায়কারী স্বাক্ষর</span>
                </div>
                <div className="text-center">
                  <div className="border-t border-gray-400 w-32 pt-1 font-bold">মুহতামিম সাহেব</div>
                  <span className="text-[10px] text-gray-400">অনুমোদনকারী স্বাক্ষর</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── ADD DONOR MODAL ─── */}
      {showAddDonorModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-base text-gray-900 dark:text-white pb-3 border-b dark:border-slate-700 mb-4 flex items-center gap-2">
              <Plus className="text-emerald-600" size={18} />
              নতুন স্থায়ী/মাসিক দাতা রেজিস্ট্রেশন
            </h3>

            <form onSubmit={handleRegisterDonor} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">দাতার পূর্ণ নাম:</label>
                <input
                  type="text"
                  value={newDonorForm.name}
                  onChange={(e) => setNewDonorForm({ ...newDonorForm, name: e.target.value })}
                  placeholder="যেমন: হাজী রফিকুল ইসলাম"
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-700 font-bold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">মোবাইল নম্বর:</label>
                <input
                  type="text"
                  value={newDonorForm.phone}
                  onChange={(e) => setNewDonorForm({ ...newDonorForm, phone: e.target.value })}
                  placeholder="01711223344"
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-700 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">ঠিকানা / এলাকা:</label>
                <input
                  type="text"
                  value={newDonorForm.address}
                  onChange={(e) => setNewDonorForm({ ...newDonorForm, address: e.target.value })}
                  placeholder="যেমন: ধানমন্ডি, ঢাকা"
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">ক্যাটাগরি:</label>
                <select
                  value={newDonorForm.type}
                  onChange={(e) => setNewDonorForm({ ...newDonorForm, type: e.target.value as any })}
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-700 font-bold outline-none"
                >
                  <option value="স্থায়ী আজীবন দাতা">স্থায়ী আজীবন দাতা</option>
                  <option value="মাসিক শুভাকাঙ্ক্ষী">মাসিক শুভাকাঙ্ক্ষী</option>
                  <option value="সাধারণ এককালীন দাতা">সাধারণ এককালীন দাতা</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">মাসিক অঙ্গীকারকৃত অনুদান (৳):</label>
                <input
                  type="number"
                  value={newDonorForm.pledgeAmount}
                  onChange={(e) => setNewDonorForm({ ...newDonorForm, pledgeAmount: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-700 font-mono font-bold text-emerald-600 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDonorModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition"
                >
                  রেজিস্ট্রেশন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ADD QURBANI HIDE MODAL ─── */}
      {showAddHideModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-base text-gray-900 dark:text-white pb-3 border-b dark:border-slate-700 mb-4 flex items-center gap-2">
              <Shield className="text-amber-600" size={18} />
              নতুন চামড়া সংগ্রহ ও বিক্রয় তথ্য
            </h3>

            <form onSubmit={handleSaveHideRecord} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">দাতা / সংগ্রহ পয়েন্ট নাম:</label>
                <input
                  type="text"
                  value={newHideForm.donorName}
                  onChange={(e) => setNewHideForm({ ...newHideForm, donorName: e.target.value })}
                  placeholder="যেমন: জুরাইন কালভার্ট রোড পয়েন্ট"
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-700 font-bold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">চামড়ার ধরন:</label>
                <select
                  value={newHideForm.hideType}
                  onChange={(e) => setNewHideForm({ ...newHideForm, hideType: e.target.value as any })}
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-700 font-bold outline-none"
                >
                  <option value="গরুর চামড়া">গরুর চামড়া</option>
                  <option value="ছাগলের চামড়া">ছাগলের চামড়া</option>
                  <option value="ভেড়ার চামড়া">ভেড়ার চামড়া</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">পরিমাণ (টি):</label>
                  <input
                    type="number"
                    value={newHideForm.quantity}
                    onChange={(e) => setNewHideForm({ ...newHideForm, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border rounded-xl bg-white dark:bg-slate-700 font-mono font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">বিক্রয় দর (প্রতি টি ৳):</label>
                  <input
                    type="number"
                    value={newHideForm.unitPrice}
                    onChange={(e) => setNewHideForm({ ...newHideForm, unitPrice: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border rounded-xl bg-white dark:bg-slate-700 font-mono font-bold text-amber-600 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">ক্রেতা / ট্যানারি প্রতিষ্ঠানের নাম:</label>
                <input
                  type="text"
                  value={newHideForm.buyerName}
                  onChange={(e) => setNewHideForm({ ...newHideForm, buyerName: e.target.value })}
                  placeholder="যেমন: তানভীর লেদার ট্যানারি"
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-700 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddHideModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 text-white py-2.5 rounded-xl font-bold hover:bg-amber-700 transition"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
