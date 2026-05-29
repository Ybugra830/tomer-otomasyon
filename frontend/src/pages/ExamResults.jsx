import React from 'react';
import StudentSidebar from '../components/StudentSidebar';

const mockSonuclar = [
  { id: 1, sinav: 'Seviye Tespit Sınavı', tarih: '06.05.2026', puan: 85, durum: 'Başarılı' },
  { id: 2, sinav: 'B1 Okuma Modülü', tarih: '10.05.2026', puan: 45, durum: 'Tekrar Gerekiyor' }
];

const ExamResults = () => {
  return (
    <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
      
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h1 className="text-3xl font-bold text-slate-800">Sınav Sonuçları</h1>
            <p className="text-slate-500 mt-1">Geçmiş sınav performansınızı ve notlarınızı buradan detaylı olarak inceleyebilirsiniz.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase tracking-wider">
                    <th className="p-5 font-semibold">Sınav Adı</th>
                    <th className="p-5 font-semibold">Tarih</th>
                    <th className="p-5 font-semibold text-center">Puan</th>
                    <th className="p-5 font-semibold text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockSonuclar.map((sonuc) => (
                    <tr key={sonuc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5 font-bold text-slate-800">{sonuc.sinav}</td>
                      <td className="p-5 text-slate-600 text-sm font-medium">{sonuc.tarih}</td>
                      <td className="p-5 text-center">
                        <span className={`text-lg font-bold ${sonuc.puan >= 50 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {sonuc.puan}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        {sonuc.durum === 'Başarılı' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 shadow-sm border border-emerald-200">
                            {sonuc.durum}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-700 shadow-sm border border-orange-200">
                            {sonuc.durum}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {mockSonuclar.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-500">
                        Henüz açıklanmış bir sınav sonucunuz bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ExamResults;
