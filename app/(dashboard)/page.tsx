'use client';

import React from 'react';
import { useApp } from '@/lib/context';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { Users, UserCheck, DollarSign, PlusCircle, TrendingUp, Bell } from 'lucide-react';
import Link from 'next/link';
import HijriLiveClock from '@/components/HijriLiveClock';
import { StudentDistributionChart, WeeklyAttendanceChart } from '@/components/DashboardCharts';

export default function DashboardPage() {
  const { instituteSettings } = useApp();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.bn;

  const localeMap = {
    bn: 'bn-BD',
    en: 'en-US',
    ar: 'ar-SA',
  };

  const todayDate = new Date().toLocaleDateString(localeMap[language] || 'bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const instituteName = instituteSettings.name || t.yourInstitute;

  const statCards = [
    {
      label: t.totalStudents,
      value: t.totalStudentsValue,
      icon: <Users size={22} />,
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      trend: t.totalStudentsTrend,
      trendColor: 'text-blue-500',
    },
    {
      label: t.attendanceToday,
      value: t.attendanceTodayValue,
      icon: <UserCheck size={22} />,
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      trend: t.attendanceTodayTrend,
      trendColor: 'text-emerald-500',
    },
    {
      label: t.feesDue,
      value: t.feesDueValue,
      icon: <DollarSign size={22} />,
      bg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      trend: t.feesDueTrend,
      trendColor: 'text-red-500',
    },
    {
      label: t.recentAdmissions,
      value: t.recentAdmissionsValue,
      icon: <PlusCircle size={22} />,
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      trend: t.recentAdmissionsTrend,
      trendColor: 'text-purple-500',
    },
  ];

  const quickLinks = [
    { label: t.quickNewAdmission, href: '/admission', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800' },
    { label: t.quickStudentList, href: '/students', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800' },
    { label: t.quickFeeCollection, href: '/finance-fees', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 border border-orange-200 dark:border-orange-800' },
    { label: t.quickIdCard, href: '/id-cards', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800' },
    { label: t.quickHifzTracker, href: '/hifz-tracker', color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 border border-teal-200 dark:border-teal-800' },
    { label: t.quickSendSms, href: '/sms-engine', color: 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40 border border-pink-200 dark:border-pink-800' },
  ];

  const activityFeed = [
    {
      color: 'bg-emerald-500',
      text: t.activity1Text,
      time: t.activity1Time,
    },
    {
      color: 'bg-blue-500',
      text: t.activity2Text,
      time: t.activity2Time,
    },
    {
      color: 'bg-purple-500',
      text: t.activity3Text,
      time: t.activity3Time,
    },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm border border-emerald-600/30">
        <div>
          <span className="text-[11px] font-bold text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            তা'লীম ইআরপি স্মার্ট ড্যাশবোর্ড
          </span>
          <h2 className="text-xl sm:text-2xl font-bold leading-tight mt-1">{t.welcomeGreeting}</h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-0.5 leading-tight">{instituteName}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {/* Hijri & Live Clock Dignified Date Badge */}
          <HijriLiveClock className="bg-white/15 dark:bg-black/30 border-white/20 text-white" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className={`${card.bg} ${card.iconColor} p-2.5 rounded-lg flex-shrink-0`}>
                {card.icon}
              </div>
              <TrendingUp size={14} className="text-gray-300 dark:text-slate-600 flex-shrink-0 mt-1" />
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-tight">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 leading-tight">{card.value}</p>
              <p className={`text-xs mt-1 leading-tight ${card.trendColor}`}>{card.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── INTERACTIVE ANALYTICS CHARTS (Student Distribution & Weekly Attendance) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StudentDistributionChart />
        <WeeklyAttendanceChart />
      </div>

      {/* Quick Access + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Quick Access */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Bell size={16} className="text-emerald-500" />
            {t.quickAccess}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className={`${link.color} rounded-lg py-2.5 px-3 text-xs font-semibold text-center transition-all duration-150`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            {t.activityFeedTitle}
          </h3>
          <div className="space-y-4">
            {activityFeed.map((item, i) => (
              <div
                key={i}
                className={`flex gap-3 items-start ${i < activityFeed.length - 1 ? 'pb-4 border-b dark:border-slate-700' : ''}`}
              >
                <div className={`w-2.5 h-2.5 mt-1.5 rounded-full flex-shrink-0 ${item.color}`} />
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">{item.text}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
