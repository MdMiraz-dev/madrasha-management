'use client';

import React from 'react';
import Link from 'next/link';
import { Book, ArrowRight, Home, LogIn } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4 font-bengali">
      <div className="bg-slate-800 p-8 rounded-3xl border border-emerald-500/30 max-w-md w-full text-center space-y-6 shadow-2xl">
        <div className="mx-auto bg-emerald-500/20 text-emerald-400 p-4 rounded-full w-20 h-20 flex items-center justify-center border border-emerald-500/40">
          <Book className="w-10 h-10" />
        </div>

        <div>
          <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase">
            তা'লীম ইআরপি (Taleem ERP)
          </span>
          <h1 className="text-2xl font-black text-white mt-3">সহজ নেভিগেশন সুবিধা</h1>
          <p className="text-gray-300 text-xs mt-1 leading-relaxed">
            আপনি সঠিক ঠিকানায় প্রবেশ করতে নিচের যেকোনো বাটনে ক্লিক করুন।
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/login"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black py-3 px-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            <LogIn size={18} />
            <span>সরাসরি লগইন পেজে যান</span>
          </Link>

          <Link
            href="/"
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm border border-slate-600"
          >
            <Home size={18} />
            <span>মূল ড্যাশবোর্ডে যান</span>
          </Link>
        </div>

        <p className="text-[11px] text-gray-400 border-t border-slate-700 pt-4">
          কারিগরি সাহায্য: 01339564967
        </p>
      </div>
    </div>
  );
}
