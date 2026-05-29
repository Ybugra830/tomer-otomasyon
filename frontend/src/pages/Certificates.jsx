import React from 'react';
import StudentSidebar from '../components/StudentSidebar';
import { Award, Lock, Download } from 'lucide-react';

const Certificates = () => {
  const certificates = [
    {
      id: 1,
      title: 'A1 Başarı Sertifikası',
      status: 'unlocked',
      date: '01.04.2026'
    },
    {
      id: 2,
      title: 'A2 Başarı Sertifikası',
      status: 'unlocked',
      date: '05.05.2026'
    },
    {
      id: 3,
      title: 'B1 Başarı Sertifikası',
      status: 'locked',
      date: null
    }
  ];

  return (
    <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
      
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Sertifikalarım</h1>
              <p className="text-slate-500 mt-1">Başarıyla tamamladığınız kurların resmi belgelerini buradan indirebilirsiniz.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {certificates.map((cert) => {
              const isLocked = cert.status === 'locked';

              return (
                <div 
                  key={cert.id} 
                  className={`bg-white rounded-3xl p-8 border shadow-sm flex flex-col items-center text-center transition-all duration-300 ${
                    isLocked 
                      ? 'border-slate-100 opacity-70 bg-slate-50/50' 
                      : 'border-emerald-100 hover:shadow-xl hover:-translate-y-2'
                  }`}
                >
                  {/* Icon Container */}
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 relative ${
                    isLocked ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-500'
                  }`}>
                    {isLocked ? <Lock className="w-10 h-10" /> : <Award className="w-12 h-12" />}
                    {!isLocked && (
                      <span className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Title & Info */}
                  <h3 className="text-xl font-extrabold text-slate-800 mb-2">{cert.title}</h3>
                  
                  {!isLocked ? (
                    <p className="text-sm font-semibold text-emerald-600 mb-8 bg-emerald-50 px-3 py-1 rounded-full">Kazanım Tarihi: {cert.date}</p>
                  ) : (
                    <p className="text-sm font-medium text-slate-400 mb-8 px-3 py-1">Henüz hak kazanılmadı</p>
                  )}

                  {/* Action Button */}
                  {isLocked ? (
                    <div className="mt-auto w-full py-3.5 px-4 bg-slate-100 text-slate-500 text-sm font-bold rounded-xl border border-slate-200">
                      Önce {cert.title.split(' ')[0]} Kurunu Tamamlayın
                    </div>
                  ) : (
                    <button className="mt-auto w-full py-3.5 px-4 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-md hover:shadow-lg text-sm font-bold rounded-xl flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      PDF Olarak İndir
                    </button>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
};

export default Certificates;
