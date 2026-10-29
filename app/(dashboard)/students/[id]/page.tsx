"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { Printer, Edit3, User, BookOpen, DollarSign, AlertTriangle, FileText, X, Check, FileAudio, Calendar, Mic } from "lucide-react";

interface DisciplinaryLog {
  date: string;
  description: string;
  severity: string;
}

interface Student {
  id: string;
  studentId?: string;
  nameEn?: string;
  nameBn?: string;
  class?: string;
  department?: string;
  boardingStatus?: string;
  primaryPhone?: string;
  photoBase64?: string;
  bloodGroup?: string;
  waiverStatus?: string;
  admissionFee?: number;
  monthlyFee?: number;
  dob?: string;
  gender?: string;
  orphanStatus?: string;
  medicalConditions?: string;
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  whatsappNumber?: string;
  altPhone?: string;
  localGuardianName?: string;
  localGuardianRelation?: string;
  division?: string;
  district?: string;
  village?: string;
  studentNid?: string;
  studentBirthReg?: string;
  parentNid?: string;
  previousInstitution?: string;
  disciplinaryLogs?: DisciplinaryLog[];
}

export default function StudentProfilePage() {
  const { id } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Personal");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Student>>({});

  const [disciplinaryLogs, setDisciplinaryLogs] = useState<{date:string, description:string, severity:string}[]>([]);
  const [newLog, setNewLog] = useState({ date: "", description: "", severity: "Warning" });

  useEffect(() => {
    if (!id) return;
    const fetchStudent = async () => {
      if (!db) return;
      const docRef = doc(db, "students", id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStudent({ id: docSnap.id, ...docSnap.data() });
        setEditForm({ id: docSnap.id, ...docSnap.data() });
        if (docSnap.data().disciplinaryLogs) {
          setDisciplinaryLogs(docSnap.data().disciplinaryLogs);
        }
      }
      setLoading(false);
    };
    fetchStudent();
  }, [id]);

  const handleSave = async () => {
    try {
      if (!db) return;
      const docRef = doc(db, "students", id as string);
      await updateDoc(docRef, editForm);
      setStudent((prev) => prev ? { ...prev, ...editForm } : null);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("Error saving");
    }
  };

  const addDisciplinaryLog = async () => {
    if (!newLog.date || !newLog.description) return;
    const updatedLogs = [...disciplinaryLogs, newLog];
    try {
      if (!db) return;
      const docRef = doc(db, "students", id as string);
      await updateDoc(docRef, { disciplinaryLogs: updatedLogs });
      setDisciplinaryLogs(updatedLogs);
      setNewLog({ date: "", description: "", severity: "Warning" });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!student) return <div className="p-8 text-center text-red-500">Student not found</div>;

  const tabs = [
    { name: "Personal", icon: <User size={18} /> },
    { name: "Academic", icon: <BookOpen size={18} /> },
    { name: "Hifz & Recitation", icon: <FileAudio size={18} /> },
    { name: "Finance", icon: <DollarSign size={18} /> },
    { name: "Disciplinary Log", icon: <AlertTriangle size={18} /> },
    { name: "Documents", icon: <FileText size={18} /> },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Student Dossier</h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded"><X size={18} /> Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded"><Check size={18} /> Save</button>
            </>
          ) : (
            <>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded"><Printer size={18} /> Print</button>
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded"><Edit3 size={18} /> Edit</button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel */}
        <div className="w-full lg:w-1/3 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center">
          <div className="h-40 w-40 rounded-full border-4 border-emerald-100 dark:border-slate-700 overflow-hidden mb-4 bg-gray-100">
            {student.photoBase64 ? (
              <img src={student.photoBase64} alt={student.nameEn} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400 font-bold">{student.nameEn?.charAt(0)}</div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">{student.nameEn}</h2>
          <h3 className="text-lg text-gray-500 dark:text-gray-400 text-center mb-4">{student.nameBn}</h3>
          
          <div className="w-full space-y-3">
            <div className="flex justify-between border-b pb-2 dark:border-slate-700">
              <span className="text-gray-500 dark:text-gray-400">Student ID</span>
              <span className="font-semibold text-gray-900 dark:text-white">{student.studentId || "-"}</span>
            </div>
            <div className="flex justify-between border-b pb-2 dark:border-slate-700">
              <span className="text-gray-500 dark:text-gray-400">Class</span>
              <span className="font-semibold text-gray-900 dark:text-white">{student.class} ({student.department})</span>
            </div>
            <div className="flex justify-between border-b pb-2 dark:border-slate-700">
              <span className="text-gray-500 dark:text-gray-400">Boarding</span>
              <span className="font-semibold text-gray-900 dark:text-white">{student.boardingStatus}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-gray-500 dark:text-gray-400">Blood Group</span>
              <span className="font-semibold text-red-500">{student.bloodGroup}</span>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Active</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{student.waiverStatus}</span>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-2/3 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex flex-wrap gap-2 border-b dark:border-slate-700 pb-4 mb-6 print:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === tab.name ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </div>

          <div className="print:block">
            {activeTab === "Personal" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                {['dob', 'gender', 'orphanStatus', 'medicalConditions', 'fatherName', 'fatherOccupation', 'motherName', 'primaryPhone', 'whatsappNumber', 'altPhone', 'localGuardianName', 'localGuardianRelation', 'division', 'district', 'village'].map((field) => (
                  <div key={field} className="border-b dark:border-slate-700 pb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</p>
                    {isEditing ? (
                      <input 
                        className="w-full bg-gray-50 dark:bg-slate-900 border p-1 rounded mt-1 text-gray-900 dark:text-white"
                        value={(editForm as Record<string, string>)[field] || ''}
                        onChange={(e) => setEditForm({...editForm, [field]: e.target.value})}
                      />
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">{(student as unknown as Record<string, string>)[field] || "-"}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Academic" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Current Academic Standing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                      <p className="font-bold text-gray-900 dark:text-white">{student.department}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Class/Jama'at</p>
                      <p className="font-bold text-gray-900 dark:text-white">{student.class}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Previous Institution</p>
                      <p className="font-bold text-gray-900 dark:text-white">{student.previousInstitution || "None"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Hifz & Recitation" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                    <FileAudio className="text-emerald-600" />
                    <span>হিফজ তিলাওয়াত ও সাপ্তাহিক ভুলের খতিয়ান</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">চলতি হিফজ স্ট্যাটাস</p>
                      <p className="font-black text-2xl text-emerald-900 dark:text-emerald-100 mt-1">১৫ পারা</p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">বর্তমান সবক: পৃষ্ঠা ২৯৩ (সূরা আল-কাহাফ)</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                      <p className="text-xs text-amber-700 dark:text-amber-300 font-bold">চলতি সপ্তাহের ভুল</p>
                      <p className="font-black text-2xl text-amber-900 dark:text-amber-100 mt-1">১ টি</p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">পৃষ্ঠা ২৯১, আয়াত ১০৫ (হরকত)</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-bold">সাপ্তাহিক মূল্যায়ন</p>
                      <p className="font-black text-xl text-blue-900 dark:text-blue-100 mt-1">মুমতায (A+)</p>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">তিলাওয়াত ৯৮% নির্ভুল ও শুদ্ধ</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">দৈনিক পড়া ও সংরক্ষিত অডিও রেকর্ড:</h4>
                    <div className="space-y-2.5">
                      <div className="p-3.5 bg-gray-50 dark:bg-slate-900/80 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-900 dark:text-white">২০ সেপ্টেম্বর ২০২৬ (রবিবার) • ০৩:১৫ PM</span>
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full font-bold text-[10px]">
                            ০ ভুল (সবক সম্পূর্ণ নির্ভুল ✅)
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          পারা ১৫, পৃষ্ঠা ২৯২ • সূরা আল-কাহাফ (আয়াত ১ - ১০)
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          মাশাআল্লাহ, এই দিনে কোনো ভুল হয়নি। মাখরাজ ও তানভীন যথাযথ আদায় হয়েছে।
                        </p>
                      </div>

                      <div className="p-3.5 bg-gray-50 dark:bg-slate-900/80 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-900 dark:text-white">১৯ সেপ্টেম্বর ২০২৬ (শনিবার) • ১০:৩০ AM</span>
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full font-bold text-[10px]">
                            ১টি ভুল
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          পারা ১৫, পৃষ্ঠা ২৯১ • সূরা আল-ইসরা (আয়াত ১০০ - ১১১)
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          <span className="text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                            পৃষ্ঠা ২৯১, আয়াত ১০৫: হরকত ভুল (যেরের জায়গায় যবর)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Finance" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400">Monthly Fee</p>
                    <p className="font-bold text-2xl text-blue-800 dark:text-blue-300">৳{student.monthlyFee}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Waiver Status</p>
                    <p className="font-bold text-xl text-emerald-800 dark:text-emerald-300">{student.waiverStatus}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 dark:text-purple-400">Admission Paid</p>
                    <p className="font-bold text-xl text-purple-800 dark:text-purple-300">৳{student.admissionFee}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Disciplinary Log" && (
              <div className="space-y-6">
                {disciplinaryLogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No disciplinary records found.</p>
                ) : (
                  <div className="space-y-4">
                    {disciplinaryLogs.map((log, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border-l-4 border-red-500">
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">{log.severity}</span>
                          <span className="text-sm text-gray-500">{log.date}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{log.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-8 bg-gray-50 dark:bg-slate-900 p-4 rounded-lg print:hidden border dark:border-slate-700">
                  <h4 className="font-semibold mb-4">Add New Record</h4>
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <input type="date" className="p-2 border rounded text-gray-900 dark:bg-slate-800 dark:text-white" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} />
                    <select className="p-2 border rounded text-gray-900 dark:bg-slate-800 dark:text-white" value={newLog.severity} onChange={e => setNewLog({...newLog, severity: e.target.value})}>
                      <option value="Warning">Warning</option>
                      <option value="Suspension">Suspension</option>
                      <option value="Expulsion">Expulsion</option>
                    </select>
                  </div>
                  <textarea placeholder="Description" className="w-full p-2 border rounded mb-4 text-gray-900 dark:bg-slate-800 dark:text-white" value={newLog.description} onChange={e => setNewLog({...newLog, description: e.target.value})}></textarea>
                  <button onClick={addDisciplinaryLog} className="bg-red-600 text-white px-4 py-2 rounded">Save Record</button>
                </div>
              </div>
            )}

            {activeTab === "Documents" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border dark:border-slate-700 p-4 rounded-lg flex items-start gap-4">
                  <FileText className="text-emerald-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Student NID</h4>
                    <p className="text-gray-600 dark:text-gray-400 font-mono mt-1">{student.studentNid || "Not Provided"}</p>
                  </div>
                </div>
                <div className="border dark:border-slate-700 p-4 rounded-lg flex items-start gap-4">
                  <FileText className="text-emerald-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Birth Registration</h4>
                    <p className="text-gray-600 dark:text-gray-400 font-mono mt-1">{student.studentBirthReg || "Not Provided"}</p>
                  </div>
                </div>
                <div className="border dark:border-slate-700 p-4 rounded-lg flex items-start gap-4">
                  <FileText className="text-emerald-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Parent NID</h4>
                    <p className="text-gray-600 dark:text-gray-400 font-mono mt-1">{student.parentNid || "Not Provided"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
