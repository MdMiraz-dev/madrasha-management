'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  X,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  MessageCircle,
  ExternalLink,
  Code,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 relative shadow-2xl border border-emerald-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header Avatar & Branding */}
        <div className="text-center pt-2">
          <div className="relative inline-block mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/instructor_miraz.jpg"
              alt={t.developerName}
              className="w-20 h-20 rounded-2xl object-cover object-top shadow-lg shadow-emerald-600/20 border-2 border-emerald-500 mx-auto"
            />
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow" title="Verified Creator">
              <Sparkles size={14} />
            </div>
          </div>

          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {t.developerName}
          </h3>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {t.developerTitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5 text-xs text-gray-600 dark:text-gray-300">
            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full font-medium">
              <GraduationCap size={13} />
              {t.instituteOrg}
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full font-medium">
              <MapPin size={13} />
              {t.developerLocation}
            </span>
          </div>
        </div>

        {/* Application Banner */}
        <div className="mt-5 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100/80 dark:border-emerald-800/30 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">{t.taleemErp}</p>
            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400 truncate">
              {language === 'ar' ? 'نظام إدارة شامل للمدارس والكتاتيب' : language === 'en' ? 'Complete Madrasah & Education ERP System' : 'আধুনিক মাদ্রাসা ও শিক্ষা ব্যবস্থাপনা সফটওয়্যার'}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg shadow-sm border border-emerald-100 dark:border-slate-700">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>v2.5 Pro</span>
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <div className="mt-5 space-y-2.5">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 px-1 uppercase tracking-wider">
            {language === 'ar' ? 'التواصل المباشر والدعم الفني' : language === 'en' ? 'Direct Contact & Support' : 'সরাসরি যোগাযোগ ও কারিগরি সাপোর্ট'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* WhatsApp */}
            <a
              href="https://wa.me/8801339564967"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-xs shadow-sm transition transform active:scale-95"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="leading-tight">{t.contactWhatsApp}</p>
                <p className="text-[10px] text-emerald-100 font-normal">01339564967</p>
              </div>
              <ExternalLink size={14} className="text-white/70" />
            </a>

            {/* Direct Call */}
            <a
              href="tel:01339564967"
              className="flex items-center gap-3 p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-xs shadow-sm transition transform active:scale-95"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Phone size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="leading-tight">{t.contactCall}</p>
                <p className="text-[10px] text-teal-100 font-normal">01339564967</p>
              </div>
            </a>

            {/* Facebook Profile */}
            <a
              href="https://www.facebook.com/md.miraz.204814"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-sm transition transform active:scale-95"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <ExternalLink size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="leading-tight">{t.contactFacebook}</p>
                <p className="text-[10px] text-blue-100 font-normal">md.miraz.204814</p>
              </div>
              <ExternalLink size={14} className="text-white/70" />
            </a>

            {/* Email */}
            <a
              href="mailto:mdmirazahmed3690@gmail.com"
              className="flex items-center gap-3 p-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs shadow-sm transition transform active:scale-95"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Mail size={18} />
              </div>
              <div className="min-w-0 flex-1 truncate">
                <p className="leading-tight">{t.contactEmail}</p>
                <p className="text-[10px] text-slate-300 font-normal truncate">mdmirazahmed3690@gmail.com</p>
              </div>
            </a>
          </div>
        </div>

        {/* Footer info inside modal */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-700 text-center text-[11px] text-gray-500 dark:text-gray-400">
          <p>{t.footerAttribution}</p>
        </div>
      </div>
    </div>
  );
}
