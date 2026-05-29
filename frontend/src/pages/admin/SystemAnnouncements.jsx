import React from 'react';
import AdminSidebar from './AdminSidebar';
import { Megaphone, Send, Trash2 } from 'lucide-react';

const SystemAnnouncements = () => {
  return (
    <div className="flex min-h-[85vh] bg-slate-50 w-full relative z-10">
      <AdminSidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sistem Duyuruları</h1>
            <p className="text-slate-500 mt-2 text-sm">Sistem genelindeki duyuruları yönetin ve yayınlayın.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Yeni Sistem Duyurusu Yayınla</h2>
            </div>
            
            <form className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Duyuru Başlığı</label>
                <input 
                  type="text" 
                  placeholder="Duyuru başlığını giriniz..." 
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Mesaj</label>
                <textarea 
                  rows="4"
                  placeholder="Duyuru detaylarını buraya yazınız..." 
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Öncelik</label>
                  <select className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 bg-white">
                    <option value="normal">Normal</option>
                    <option value="urgent">Acil / Kırmızı</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Hedef Kitle</label>
                  <select className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 bg-white">
                    <option value="all">Tüm Sistem</option>
                    <option value="students">Sadece Öğrenciler</option>
                    <option value="instructors">Sadece Eğitmenler</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="button" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Yayınla
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Geçmiş Duyurular</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Tarih</th>
                    <th className="px-6 py-4">Başlık</th>
                    <th className="px-6 py-4">Hedef</th>
                    <th className="px-6 py-4 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">16 Mayıs 2026</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">Sistem Bakımı Çalışması</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold">Tüm Sistem</span></td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">14 Mayıs 2026</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">Yeni Dönem Kayıtları Hakkında</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold">Öğrenciler</span></td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default SystemAnnouncements;
