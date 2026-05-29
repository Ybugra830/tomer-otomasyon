import React from 'react';
import InstructorSidebar from './InstructorSidebar';
import { Megaphone, Clock, AlertTriangle, Info, User } from 'lucide-react';

const InstructorAnnouncements = () => {
  return (
    <div className="flex min-h-[85vh] bg-slate-50 w-full relative z-10">
      <InstructorSidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-indigo-600" />
              Kurumsal Duyurular
            </h1>
            <p className="text-slate-500 mt-2 text-sm">Sistem yöneticileri tarafından paylaşılan önemli bildirimler ve idari duyurular.</p>
          </div>

          <div className="space-y-6">
            
            {/* Mock Card 1 - ACİL */}
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 hover:shadow-md transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
              
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-xs font-black rounded-md tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  [ACİL]
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  16 Mayıs 2026, 09:30
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-3">Bahar Dönemi Kur Sınavı Teslim Tarihleri</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">
                Değerli Eğitmenlerimiz, Bahar Dönemi kur bitirme sınavı notlarının sisteme girilmesi için son tarih 20 Mayıs Çarşamba günü mesai bitimi olarak belirlenmiştir. Not girişlerinin zamanında tamamlanması hususunda gereğini rica ederiz.
              </p>
              
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <span>Süper Admin tarafından gönderildi</span>
              </div>
            </div>

            {/* Mock Card 2 - GENEL */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
              
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded-md tracking-wider">
                  <Info className="w-3.5 h-3.5" />
                  [GENEL]
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  14 Mayıs 2026, 14:15
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-3">Uluslararası Öğrenci Kayıt Kabul Süreçleri Bilgilendirmesi</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">
                Yeni dönem uluslararası öğrenci kayıt kabul süreçlerimizde bir takım güncellemeler yapılmıştır. Özellikle B1 ve B2 seviyelerindeki denklik işlemlerinde talep edilecek evraklar listesi güncellenmiş olup, detaylı belgeye portalımız üzerinden ulaşabilirsiniz.
              </p>
              
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <span>Süper Admin tarafından gönderildi</span>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default InstructorAnnouncements;
