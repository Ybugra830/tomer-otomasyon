import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import InstructorSidebar from './InstructorSidebar';
import { UploadCloud, FileText, Send } from 'lucide-react';

const InstructorMaterials = () => {
  const location = useLocation();
  const [targetType, setTargetType] = useState('all');
  const [selectedStudentName, setSelectedStudentName] = useState('');

  useEffect(() => {
    if (location.state && location.state.preSelectedStudent) {
      setTargetType('individual');
      setSelectedStudentName(location.state.preSelectedStudent);
    }
  }, [location]);
  return (
    <div className="flex min-h-[85vh] bg-slate-50 w-full relative z-10">
      <InstructorSidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Materyal ve Ödev Yönetimi</h1>
            <p className="text-slate-500 mt-2 text-sm">Öğrencilerinize doküman, ses dosyası, video veya bağlantı gönderin.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Yeni Materyal / Ödev Gönder</h2>
            </div>
            
            <form className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Materyal Adı</label>
                  <input 
                    type="text" 
                    placeholder="Örn: B1 Hafta 2 Okuma Parçası" 
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Türü</label>
                  <select className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800 bg-white">
                    <option value="pdf">PDF Dokümanı</option>
                    <option value="mp3">Ses Dosyası (MP3)</option>
                    <option value="video">Video</option>
                    <option value="link">Dış Bağlantı (Link)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Hedef Seçimi</label>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex-1">
                    <input type="radio" name="target" value="all" checked={targetType === 'all'} onChange={() => setTargetType('all')} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                    <span className="font-semibold text-slate-700">Tüm Sınıfa Gönder</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex-1">
                    <input type="radio" name="target" value="individual" checked={targetType === 'individual'} onChange={() => setTargetType('individual')} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                    <span className="font-semibold text-slate-700">Bireysel Öğrenciye Gönder</span>
                  </label>
                </div>
                {targetType === 'individual' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Öğrenci Adı</label>
                    <input 
                      type="text" 
                      value={selectedStudentName}
                      onChange={(e) => setSelectedStudentName(e.target.value)}
                      placeholder="Öğrenci adını girin..." 
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Dosya Yükle</label>
                <div className="w-full border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-indigo-50 hover:border-indigo-400 transition-all cursor-pointer group bg-slate-50/50">
                  <div className="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 mb-1">Tıklayın veya sürükleyip bırakın</h4>
                  <p className="text-xs text-slate-500">PDF, MP3, MP4 (Maks. 50MB)</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button type="button" className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Gönder
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Gönderilen Materyaller Arşivi</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl mb-3 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <span className="text-red-600 font-bold text-xs">PDF</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">B1 Seviyesi Okuma Parçaları.pdf</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Tüm Sınıf • 12 Mayıs 2026</p>
                  </div>
                </div>
                <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">İncele</button>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:shadow-md transition-shadow bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-xs">MP3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Hafta 1 Dinleme Metni.mp3</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Bireysel Öğrenci • 10 Mayıs 2026</p>
                  </div>
                </div>
                <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">İncele</button>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default InstructorMaterials;
