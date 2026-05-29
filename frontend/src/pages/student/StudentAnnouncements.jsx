import React from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { Bell, Clock, Info } from 'lucide-react';

const StudentAnnouncements = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 w-full relative z-10">
      <StudentSidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          
          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-600" />
              Duyurular ve Bildirimler
            </h1>
            <p className="text-slate-500 mt-2 text-sm">Sistem duyuruları ve eğitmen bildirimleri zaman akışı.</p>
          </div>

          <div className="relative border-l-2 border-slate-200 ml-4 pl-8 space-y-8 pb-12">
            
            {/* Timeline Item 1 - KURUMSAL */}
            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-red-500 border-4 border-slate-50 shadow-sm"></div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-black rounded-md tracking-wider">
                    [KURUMSAL]
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    Bugün, 14:30
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Sistem Bakımı Çalışması</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Değerli öğrencilerimiz, bu gece 02:00 - 04:00 saatleri arasında sunucularımızda planlı bakım çalışması yapılacaktır. 
                  Bu zaman diliminde sisteme erişimde kısa süreli kesintiler yaşanabilir. Anlayışınız için teşekkür ederiz.
                </p>
              </div>
            </div>

            {/* Timeline Item 2 - AKADEMİK */}
            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-slate-50 shadow-sm"></div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-md tracking-wider">
                    [AKADEMİK - Haluk Hoca]
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    Dün, 09:15
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">B1 Okuma Parçası Hakkında</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Merhaba arkadaşlar, sisteme yeni eklenen B1 seviyesi okuma parçasını hafta sonuna kadar bitirmenizi rica ediyorum. 
                  Pazartesi günkü canlı dersimizde bu parça üzerinden kelime çalışması yapacağız. Hepinize iyi çalışmalar.
                </p>
                <button className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  Materyale Git <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Timeline Item 3 - SİSTEM */}
            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-slate-400 border-4 border-slate-50 shadow-sm"></div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 opacity-75">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-black rounded-md tracking-wider">
                    [SİSTEM]
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    10 Mayıs 2026
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Yeni Dönem Kayıtları Başladı</h3>
                <p className="text-slate-600 text-sm">
                  Yaz dönemi kurları için kayıtlarımız aktif hale getirilmiştir. Profilinizden seviye seçimi yapabilirsiniz.
                </p>
              </div>
            </div>

          </div>
          
        </div>
      </main>
    </div>
  );
};

export default StudentAnnouncements;
