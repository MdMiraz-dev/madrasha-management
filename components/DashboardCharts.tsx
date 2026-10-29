'use client';

import React, { useState } from 'react';
import { Users, TrendingUp, Calendar, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { toBengaliNumerals } from '@/components/HijriLiveClock';

// ─── 1. STUDENT DISTRIBUTION DONUT CHART ───
interface DistributionSegment {
  id: string;
  nameBn: string;
  nameEn: string;
  count: number;
  color: string;
  hoverColor: string;
  iconBg: string;
}

const DISTRIBUTION_DATA: DistributionSegment[] = [
  {
    id: 'residential',
    nameBn: 'আবাসিক (Residential)',
    nameEn: 'Residential',
    count: 320,
    color: '#059669', // Emerald 600
    hoverColor: '#047857', // Emerald 700
    iconBg: 'bg-emerald-500',
  },
  {
    id: 'non-residential',
    nameBn: 'অনাবাসিক (Non-residential)',
    nameEn: 'Non-residential',
    count: 175,
    color: '#0284c7', // Sky 600
    hoverColor: '#0369a1', // Sky 700
    iconBg: 'bg-sky-500',
  },
  {
    id: 'day-care',
    nameBn: 'ডে-কেয়ার / খণ্ডকালীন (Day-Care)',
    nameEn: 'Day-Care',
    count: 55,
    color: '#d97706', // Amber 600
    hoverColor: '#b45309', // Amber 700
    iconBg: 'bg-amber-500',
  },
];

export function StudentDistributionChart() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const totalCount = DISTRIBUTION_DATA.reduce((sum, item) => sum + item.count, 0);

  // SVG Geometry for Donut
  const radius = 64;
  const strokeWidth = 26;
  const center = 85;
  const circumference = 2 * Math.PI * radius;

  let currentAccumulatedPercentage = 0;

  const activeSegment = DISTRIBUTION_DATA.find((s) => s.id === activeId);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Users size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
              শিক্ষার্থী বণ্টন অনুপাত (Student Distribution)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
              আবাসিক, অনাবাসিক ও ডে-কেয়ার পরিসংখ্যান
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
          মোট: {toBengaliNumerals(totalCount)} জন
        </span>
      </div>

      {/* Main Chart Body */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-4">
        {/* SVG Interactive Donut */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width="170" height="170" viewBox="0 0 170 170" className="transform -rotate-90">
            {/* Background Track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth - 2}
              className="dark:stroke-slate-700/70"
            />

            {/* Segments */}
            {DISTRIBUTION_DATA.map((segment) => {
              const percentage = segment.count / totalCount;
              const strokeDasharray = `${percentage * circumference} ${circumference}`;
              const strokeDashoffset = -currentAccumulatedPercentage * circumference;
              currentAccumulatedPercentage += percentage;

              const isHovered = activeId === segment.id;

              return (
                <circle
                  key={segment.id}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={isHovered ? segment.hoverColor : segment.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="cursor-pointer transition-all duration-300 ease-out"
                  onMouseEnter={() => setActiveId(segment.id)}
                  onMouseLeave={() => setActiveId(null)}
                />
              );
            })}
          </svg>

          {/* Center Text Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
            {activeSegment ? (
              <>
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 truncate max-w-[80px]">
                  {activeSegment.nameEn}
                </span>
                <span className="text-lg font-black text-gray-900 dark:text-white leading-none mt-0.5">
                  {toBengaliNumerals(activeSegment.count)}
                </span>
                <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {toBengaliNumerals(((activeSegment.count / totalCount) * 100).toFixed(1))}%
                </span>
              </>
            ) : (
              <>
                <span className="text-[10.5px] font-semibold text-gray-400 dark:text-gray-500">
                  সর্বমোট
                </span>
                <span className="text-xl font-black text-gray-900 dark:text-white leading-none mt-0.5">
                  {toBengaliNumerals(totalCount)}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                  ১০০% শিক্ষার্থী
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend / Breakdown List */}
        <div className="flex-1 w-full space-y-2.5">
          {DISTRIBUTION_DATA.map((segment) => {
            const percent = ((segment.count / totalCount) * 100).toFixed(1);
            const isHovered = activeId === segment.id;

            return (
              <div
                key={segment.id}
                onMouseEnter={() => setActiveId(segment.id)}
                onMouseLeave={() => setActiveId(null)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isHovered
                    ? 'bg-slate-50 dark:bg-slate-700/60 border-emerald-400 dark:border-emerald-500 scale-[1.02] shadow-xs'
                    : 'bg-transparent border-gray-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/30'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="truncate">{segment.nameBn}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-gray-900 dark:text-white font-black">
                      {toBengaliNumerals(segment.count)} জন
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
                      ({toBengaliNumerals(percent)}%)
                    </span>
                  </div>
                </div>

                {/* Progress Mini Bar */}
                <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: segment.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2.5 border-t border-gray-100 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Sparkles size={13} className="text-emerald-500" />
          রিয়েল-টাইম ছাত্র ডাটাবেজ সমন্বিত
        </span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
          হোস্টেল ক্যাপাসিটি: ৯২%
        </span>
      </div>
    </div>
  );
}

// ─── 2. WEEKLY ATTENDANCE TREND CHART ───
interface AttendanceDay {
  dayBn: string;
  dayEn: string;
  date: string;
  percentage: number;
  present: number;
  total: number;
  status?: string;
}

const ATTENDANCE_WEEK_DATA: AttendanceDay[] = [
  { dayBn: 'শনি', dayEn: 'Sat', date: '২০ সেপ্টেম্বর', percentage: 95, present: 522, total: 550 },
  { dayBn: 'রবি', dayEn: 'Sun', date: '২১ সেপ্টেম্বর', percentage: 96, present: 528, total: 550 },
  { dayBn: 'সোম', dayEn: 'Mon', date: '২২ সেপ্টেম্বর', percentage: 93, present: 511, total: 550 },
  { dayBn: 'মঙ্গল', dayEn: 'Tue', date: '২৩ সেপ্টেম্বর', percentage: 98, present: 539, total: 550, status: 'সর্বোচ্চ' },
  { dayBn: 'বুধ', dayEn: 'Wed', date: '২৪ সেপ্টেম্বর', percentage: 96, present: 528, total: 550 },
  { dayBn: 'বৃহঃ', dayEn: 'Thu', date: '২৫ সেপ্টেম্বর', percentage: 94, present: 517, total: 550 },
  { dayBn: 'শুক্র', dayEn: 'Fri', date: '২৬ সেপ্টেম্বর', percentage: 91, present: 500, total: 550, status: 'জুমা বিশেষ' },
];

export function WeeklyAttendanceChart() {
  const [hoveredDay, setHoveredDay] = useState<AttendanceDay | null>(null);

  const avgAttendance = (
    ATTENDANCE_WEEK_DATA.reduce((acc, d) => acc + d.percentage, 0) /
    ATTENDANCE_WEEK_DATA.length
  ).toFixed(1);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
              সাপ্তাহিক উপস্থিতি ট্রেন্ড (Weekly Attendance Trend)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
              গত ৭ দিনের প্রতিদিনের ছাত্র উপস্থিতির হার
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            গড় উপস্থিতি: {toBengaliNumerals(avgAttendance)}%
          </span>
        </div>
      </div>

      {/* Visual Bar / Chart Grid Area */}
      <div className="my-5">
        <div className="h-44 w-full flex items-end justify-between gap-2 sm:gap-4 px-1 pt-6 pb-2 border-b border-gray-200 dark:border-slate-700 relative">
          
          {/* 90% Benchmark Threshold Line */}
          <div 
            className="absolute left-0 right-0 border-b border-dashed border-emerald-400/80 dark:border-emerald-500/60 z-0 flex items-center justify-end pr-2"
            style={{ bottom: `${(90 / 100) * 140}px` }}
          >
            <span className="text-[9.5px] font-mono text-emerald-600 dark:text-emerald-400 bg-white/90 dark:bg-slate-800/90 px-1 py-0.2 rounded font-semibold">
              ৯০% লক্ষ্যমাত্রা
            </span>
          </div>

          {ATTENDANCE_WEEK_DATA.map((item, idx) => {
            const isHovered = hoveredDay?.dayBn === item.dayBn;
            const barHeightPx = Math.max(30, (item.percentage / 100) * 140);

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer z-10"
                onMouseEnter={() => setHoveredDay(item)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 z-30 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-2.5 py-1 rounded-lg shadow-xl text-[11px] font-bold pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95">
                    <span className="block">{item.date}</span>
                    <span className="text-emerald-400 dark:text-emerald-600">
                      {toBengaliNumerals(item.percentage)}% ({toBengaliNumerals(item.present)}/{toBengaliNumerals(item.total)})
                    </span>
                    <div className="w-2 h-2 bg-slate-900 dark:bg-white rotate-45 mx-auto -mb-1 mt-0.5" />
                  </div>
                )}

                {/* Status Badge */}
                {item.status && (
                  <span className="text-[9px] font-bold px-1 py-0.2 rounded-sm bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 mb-1 leading-none">
                    {item.status}
                  </span>
                )}

                {/* The Animated Bar */}
                <div
                  className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 relative overflow-hidden ${
                    isHovered
                      ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md scale-y-105'
                      : item.percentage >= 95
                      ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                      : 'bg-gradient-to-t from-blue-600 to-sky-400'
                  }`}
                  style={{ height: `${barHeightPx}px` }}
                >
                  {/* Subtle top reflection */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-white/40 rounded-t-xl" />
                </div>

                {/* Percentage on Bar / Bottom */}
                <span className="text-[10px] font-bold font-mono text-gray-600 dark:text-gray-300 mt-1.5">
                  {toBengaliNumerals(item.percentage)}%
                </span>
                {/* Day Label */}
                <span className={`text-xs font-bold mt-0.5 ${
                  isHovered ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {item.dayBn}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Summary */}
      <div className="pt-2.5 border-t border-gray-100 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-500" />
          দৈনিক উপস্থিতি রেকর্ড স্বয়ংক্রিয়ভাবে সংরক্ষিত
        </span>
        <span className="text-blue-600 dark:text-blue-400 font-semibold">
          সর্বোচ্চ উপস্থিতি: মঙ্গল (৯৮%)
        </span>
      </div>
    </div>
  );
}
