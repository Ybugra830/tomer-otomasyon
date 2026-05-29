import React, { useState } from 'react';
import InstructorSidebar from './InstructorSidebar';
import { 
  Users, BarChart2, Paperclip, X, CheckCircle, UploadCloud 
} from 'lucide-react';

const mockStudents = [
  { id: 1, name: 'Yaşar Buğra Erbay', level: 'B1', stats: { gramer: 85, okuma: 70, dinleme: 40, yazma: 60 } },
  { id: 2, name: 'Ahmet Yılmaz', level: 'A2', stats: { gramer: 45, okuma: 55, dinleme: 80, yazma: 50 } },
  { id: 3, name: 'Ayşe Kaya', level: 'C1', stats: { gramer: 95, okuma: 90, dinleme: 88, yazma: 92 } },
  { id: 4, name: 'Mehmet Demir', level: 'B2', stats: { gramer: 65, okuma: 80, dinleme: 35, yazma: 75 } }
];

const ProgressBar = ({ label, value }) => {
  let colorClass = 'bg-blue-500';
  if (value < 50) colorClass = 'bg-red-500';
  else if (value >= 85) colorClass = 'bg-emerald-500';

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-900">%{value}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div className={`h-2.5 rounded-full ${colorClass} transition-all duration-500`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
};

const InstructorStudents = () => {
  const [selectedStudentForStats, setSelectedStudentForStats] = useState(null);
  const [selectedStudentForTask, setSelectedStudentForTask] = useState(null);

  const handleAssignTask = (e) => {
    e.preventDefault();
    alert("Görev öğrencinin paneline başarıyla iletildi");
    setSelectedStudentForTask(null);
  };

  return (
    <div className="flex min-h-[85vh] bg-slate-50 w-full relative z-10">
      <InstructorSidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" />
              Öğrencilerim ve Gelişim Takibi
            </h1>
            <p className="text-slate-500 mt-2 text-sm">Sınıfınızdaki öğrencilerin başarı durumlarını analiz edin ve hedefe yönelik görevler atayın.</p>
          </div>

          {/* Öğrenci Listesi (Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockStudents.map(student => (
              <div key={student.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{student.name}</h3>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold mt-1 inline-block">
                        Seviye: {student.level}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  <button 
                    onClick={() => setSelectedStudentForStats(student)}
                    className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold rounded-xl transition-colors text-sm"
                  >
                    <BarChart2 className="w-4 h-4" />
                    Gelişim Analizi
                  </button>
                  <button 
                    onClick={() => setSelectedStudentForTask(student)}
                    className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold rounded-xl transition-colors text-sm"
                  >
                    <Paperclip className="w-4 h-4" />
                    Özel Görev Ata
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* MODAL 1: Gelişim Analizi */}
      {selectedStudentForStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-blue-600" />
                  Gelişim Analizi
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1">{selectedStudentForStats.name}</p>
              </div>
              <button onClick={() => setSelectedStudentForStats(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <ProgressBar label="Gramer (Dilbilgisi)" value={selectedStudentForStats.stats.gramer} />
              <ProgressBar label="Okuma (Reading)" value={selectedStudentForStats.stats.okuma} />
              <ProgressBar label="Dinleme (Listening)" value={selectedStudentForStats.stats.dinleme} />
              <ProgressBar label="Yazma (Writing)" value={selectedStudentForStats.stats.yazma} />
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setSelectedStudentForStats(null)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors text-sm">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Akıllı Görev Atama */}
      {selectedStudentForTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
              <div>
                <h3 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
                  <Paperclip className="w-5 h-5" />
                  Özel Görev Ata
                </h3>
                <p className="text-sm text-emerald-600/80 font-medium mt-1">Hedef Öğrenci: {selectedStudentForTask.name}</p>
              </div>
              <button onClick={() => setSelectedStudentForTask(null)} className="p-2 text-emerald-600/60 hover:text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAssignTask} className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Görev Başlığı</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Dinleme Pratiği Ek Çalışması" 
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Materyal Türü</label>
                <select className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800 bg-white">
                  <option value="dinleme">Dinleme Egzersizi</option>
                  <option value="okuma">Okuma Parçası</option>
                  <option value="gramer">Gramer Testi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Eğitmen Notu</label>
                <textarea 
                  rows="3"
                  required
                  placeholder='Örn: "Dinleme becerin için bu kaydı incele ve soruları yanıtla..."'
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Son Teslim Tarihi</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Dosya Yükle</label>
                <div className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-emerald-50 hover:border-emerald-400 transition-all cursor-pointer group">
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 mb-2 transition-colors" />
                  <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-700">Dosya seçin veya buraya bırakın</span>
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                <span className="text-sm font-bold text-slate-700">Öğrenciden dosya yüklemesini (teslim) zorunlu kıl</span>
              </label>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setSelectedStudentForTask(null)} className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                  İptal
                </button>
                <button type="submit" className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InstructorStudents;
