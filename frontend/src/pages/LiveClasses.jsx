import React from 'react';
import StudentSidebar from '../components/StudentSidebar';
import { Video, Radio, PlayCircle, Calendar, Clock, User, ChevronRight } from 'lucide-react';

const activeClass = {
  title: 'B1 İleri Seviye Konuşma Pratiği',
  teacher: 'Haluk Hoca',
  startTime: '10:00',
  status: 'Live'
};

const upcomingClasses = [
  { id: 1, title: 'B1 Dinleme ve Anlama', date: 'Yarın', time: '14:00' },
  { id: 2, title: 'Gramer: İfade Ediliş Biçimleri', date: '12 Mayıs', time: '10:00' },
  { id: 3, title: 'Serbest Konuşma Kulübü', date: '14 Mayıs', time: '16:00' }
];

const pastRecordings = [
  { id: 1, title: 'B1 Okuma Stratejileri', duration: '45 Dk', date: '05 Mayıs 2026' },
  { id: 2, title: 'Gramer: Şartlı Cümleler Tekrarı', duration: '55 Dk', date: '03 Mayıs 2026' },
  { id: 3, title: 'Kelime Bilgisi Çalışması', duration: '40 Dk', date: '01 Mayıs 2026' }
];

const LiveClasses = () => {
  return (
    <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
      
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <Video className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Canlı Dersler</h1>
              <p className="text-slate-500 mt-1">Sanal sınıflarınıza katılabilir, haftalık programınızı ve geçmiş kayıtları görebilirsiniz.</p>
            </div>
          </div>

          {/* Hero Section: Aktif Ders */}
          <div className="bg-slate-900 rounded-3xl p-8 shadow-lg relative overflow-hidden text-white border border-slate-800">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Radio className="w-64 h-64 -mt-10 -mr-10" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full mb-6 shadow-sm">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                <span className="text-red-400 text-xs font-bold tracking-wider">CANLI YAYIN</span>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white drop-shadow-sm tracking-tight">{activeClass.title}</h2>
                  <div className="flex flex-wrap items-center gap-6 text-slate-300 font-medium text-sm">
                    <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                      <User className="w-4 h-4 text-indigo-400" />
                      {activeClass.teacher}
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      Başlama: <span className="text-white font-bold">{activeClass.startTime}</span>
                    </div>
                  </div>
                </div>
                
                <button className="w-full md:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 shrink-0 group">
                  <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Hemen Derse Katıl
                </button>
              </div>
            </div>
          </div>

          {/* 2 Kolon Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Sol Kolon: Yaklaşan Dersler */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-indigo-600" />
                Yaklaşan Dersler
              </h3>
              <div className="space-y-4">
                {upcomingClasses.map(cls => (
                  <div key={cls.id} className="flex items-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 transition-colors group">
                    <div className="w-24 shrink-0 text-center border-r border-slate-200 pr-4 mr-4 group-hover:border-indigo-200 transition-colors">
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{cls.date}</div>
                      <div className="text-xl font-black text-indigo-600">{cls.time}</div>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-slate-800 text-[15px]">{cls.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Sanal Sınıf</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sağ Kolon: Geçmiş Kayıtlar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-indigo-600" />
                Geçmiş Kayıtlar
              </h3>
              <div className="space-y-4 flex-grow">
                {pastRecordings.map(rec => (
                  <div key={rec.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-white hover:shadow-md transition-all group cursor-pointer">
                    <div className="w-28 h-16 bg-slate-200 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden">
                      <div className="absolute inset-0 bg-slate-800/10 group-hover:bg-slate-800/20 transition-colors"></div>
                      <PlayCircle className="w-8 h-8 text-white drop-shadow-md relative z-10 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-sm text-slate-800 truncate mb-1.5 group-hover:text-indigo-600 transition-colors">{rec.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {rec.duration}</span>
                        <span>{rec.date}</span>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
                Tüm Kayıtları Gör
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default LiveClasses;
