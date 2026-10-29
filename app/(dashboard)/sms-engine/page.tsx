'use client';

import React, { useState } from 'react';
import { MessageSquare, Users, Bell, FileText, Copy, Check } from 'lucide-react';
import { useApp } from '@/lib/context';

export default function SmsEnginePage() {
  const { students: centralStudents } = useApp();
  const [activeTab, setActiveTab] = useState('absence');
  const [copied, setCopied] = useState(false);

  const displayStudents = React.useMemo(() => {
    if (centralStudents && centralStudents.length > 0) {
      return centralStudents.slice(0, 10).map(s => ({
        id: s.id,
        name: s.nameBn || s.nameEn || 'শিক্ষার্থী',
        roll: s.roll || '—',
        phone: s.primaryPhone || '01700000000',
      }));
    }
    return [
      { id: '1', name: 'আব্দুল্লাহ আল মাহমুদ', roll: '১০১', phone: '01711998877' },
      { id: '2', name: 'মুহাম্মদ উমর ফারুক', roll: '১০২', phone: '01822334455' },
      { id: '3', name: 'বুরহান উদ্দিন', roll: '৬৬৮৯', phone: '0172568565' },
    ];
  }, [centralStudents]);


  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">SMS & Communications Engine</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('absence')}
          className={`pb-2 flex items-center space-x-2 ${activeTab === 'absence' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          <Users className="w-5 h-5" />
          <span>Absence Alerts</span>
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`pb-2 flex items-center space-x-2 ${activeTab === 'broadcast' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Broadcast</span>
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`pb-2 flex items-center space-x-2 ${activeTab === 'fees' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          <Bell className="w-5 h-5" />
          <span>Fee Reminders</span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-2 flex items-center space-x-2 ${activeTab === 'templates' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          <FileText className="w-5 h-5" />
          <span>Templates</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          {activeTab === 'absence' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Absence Notification</h2>
              <div className="flex space-x-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Date</label>
                  <input type="date" className="p-2 border rounded bg-white text-gray-900 dark:bg-slate-800 dark:text-white dark:border-gray-600" defaultValue="2026-09-21" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter Class</label>
                  <select className="w-full p-2 border rounded bg-white text-gray-900 dark:bg-slate-800 dark:text-white dark:border-gray-600">
                    <option>All Classes</option>
                    <option>Class 1 (Hifz)</option>
                    <option>Class 2</option>
                  </select>
                </div>
              </div>

              <div className="border rounded dark:border-gray-700">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300 flex justify-between">
                  <span>Absent Students ({displayStudents.length})</span>
                  <button className="text-emerald-600 text-sm hover:underline">Select All</button>
                </div>
                <ul className="divide-y dark:divide-gray-700">
                  {displayStudents.map((st) => (
                    <li key={st.id} className="p-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" defaultChecked />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{st.name} (রোল: {st.roll})</p>
                          <p className="text-xs text-gray-500"> অভিভাবক: {st.phone}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Absent</span>

                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'broadcast' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Announcement Broadcast</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Group</label>
                  <select className="w-full p-2 border rounded bg-white text-gray-900 dark:bg-slate-800 dark:text-white dark:border-gray-600">
                    <option>All Parents</option>
                    <option>Specific Class</option>
                    <option>Hifz Department Only</option>
                    <option>Teachers / Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message Content</label>
                  <textarea 
                    rows={5} 
                    className="w-full p-2 border rounded bg-white text-gray-900 dark:bg-slate-800 dark:text-white dark:border-gray-600"
                    placeholder="Type your announcement here..."
                    defaultValue="Assalamu Alaikum, Madrasa will remain closed tomorrow due to heavy rain. Classes will resume the day after. - Authority"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Fee Reminders</h2>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded mb-6 text-sm text-yellow-800 dark:text-yellow-200">
                15 students have outstanding dues for the current month. Auto-generate reminders below.
              </div>
              <ul className="divide-y dark:divide-gray-700 border dark:border-gray-700 rounded">
                {[1, 2, 3].map((item) => (
                  <li key={item} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Student {item}</p>
                      <p className="text-xs text-red-500">Due: ৳ 1,500</p>
                    </div>
                    <button className="text-emerald-600 text-sm border border-emerald-600 px-3 py-1 rounded hover:bg-emerald-50 dark:hover:bg-slate-700">Preview SMS</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Message Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded dark:border-gray-700 cursor-pointer hover:border-emerald-500">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Eid Holiday</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Assalamu Alaikum, Madrasa will be closed from [Date] to [Date] for Eid. - Authority</p>
                </div>
                <div className="p-4 border rounded dark:border-gray-700 cursor-pointer hover:border-emerald-500">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Exam Result</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dear Parent, result for [Exam] has been published. Please collect the grade sheet.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Panel - common for all tabs */}
        <div className="bg-gray-100 dark:bg-slate-900 rounded-lg p-6 shadow-inner border border-gray-200 dark:border-gray-800 relative flex flex-col">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4 text-center">WhatsApp / SMS Preview</h3>
          
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 relative mb-4">
            <div className="absolute -left-2 top-4 w-4 h-4 bg-white dark:bg-slate-800 rotate-45"></div>
            <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap relative z-10">
              {activeTab === 'absence' && "Assalamu Alaikum,\nDear Parent, your child [Student Name] is absent today (21-Sep). Please contact the Madrasa if not informed earlier."}
              {activeTab === 'broadcast' && "Assalamu Alaikum,\nMadrasa will remain closed tomorrow due to heavy rain. Classes will resume the day after. - Authority"}
              {activeTab === 'fees' && "Assalamu Alaikum,\nDear Parent, a fee of ৳1,500 is due for [Student Name]. Kindly pay soon. Jazakallah."}
              {activeTab === 'templates' && "Select a template or type a message to see preview."}
            </p>
            <div className="text-right mt-2 text-[10px] text-gray-400">Just now</div>
          </div>

          <button 
            onClick={handleCopy}
            className={`w-full py-3 rounded-lg flex justify-center items-center font-medium transition-colors ${copied ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
          >
            {copied ? (
              <><Check className="w-5 h-5 mr-2" /> Copied to Clipboard!</>
            ) : (
              <><Copy className="w-5 h-5 mr-2" /> Copy Message</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
