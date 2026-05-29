import React, { useState } from 'react';
import StudentSidebar from '../components/StudentSidebar';
import { Search, Filter, FileText, Headphones, Download, PlayCircle } from 'lucide-react';

const materials = [
  { id: 1, title: 'B1 Seviyesi Şartlı Cümleler', category: 'Gramer', type: 'pdf', size: '2.4 MB', date: '05.05.2026' },
  { id: 2, title: 'Geçmiş Zaman Alıştırmaları', category: 'Gramer', type: 'pdf', size: '1.8 MB', date: '04.05.2026' },
  { id: 3, title: 'Günlük Hayat Diyalogları', category: 'Dinleme', type: 'audio', size: '5.1 MB', date: '03.05.2026' },
  { id: 4, title: 'Haber Bülteni Dinletisi', category: 'Dinleme', type: 'audio', size: '4.2 MB', date: '02.05.2026' },
  { id: 5, title: 'Anadolu Efsaneleri Metni', category: 'Okuma', type: 'pdf', size: '3.1 MB', date: '01.05.2026' },
  { id: 6, title: 'Kısa Hikayeler ve Analizi', category: 'Okuma', type: 'pdf', size: '2.9 MB', date: '30.04.2026' },
  { id: 7, title: 'Zamanlar Tablosu Anlatımı', category: 'Gramer', type: 'video', size: '15.4 MB', date: '28.04.2026' },
];

const CourseMaterials = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tümü');

  // Filtreleme mantığı
  const filteredMaterials = materials.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'Tümü' || 
                        (filterType === 'PDF' && item.type === 'pdf') ||
                        (filterType === 'Ses' && item.type === 'audio') ||
                        (filterType === 'Video' && item.type === 'video');
    return matchesSearch && matchesType;
  });

  // Kategorilere göre gruplama (Gramer, Dinleme, Okuma vb.)
  const groupedMaterials = filteredMaterials.reduce((acc, material) => {
    if (!acc[material.category]) acc[material.category] = [];
    acc[material.category].push(material);
    return acc;
  }, {});

  // Dosya tipine göre renkli ikon döndüren yardımcı fonksiyon
  const getIconForType = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'audio': return <Headphones className="w-8 h-8 text-purple-500" />;
      case 'video': return <PlayCircle className="w-8 h-8 text-blue-500" />;
      default: return <FileText className="w-8 h-8 text-slate-500" />;
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
      
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Üst Araç Çubuğu (Toolbar) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Ders Materyalleri</h1>
              <p className="text-slate-500 mt-1">Ders notları, ses kayıtları ve ek kaynaklara buradan erişebilirsiniz.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Materyal ara..." 
                  className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm font-medium text-slate-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative min-w-[140px]">
                <select 
                  className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="Tümü">Tümü</option>
                  <option value="PDF">PDF</option>
                  <option value="Ses">Ses</option>
                  <option value="Video">Video</option>
                </select>
                <Filter className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Materyallerin Listelenmesi (Kategorize Edilmiş Grid Yapısı) */}
          {Object.keys(groupedMaterials).length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Materyal Bulunamadı</h3>
              <p className="text-slate-500">Arama veya filtreleme kriterlerinize uygun sonuç yok.</p>
            </div>
          ) : (
            Object.keys(groupedMaterials).map((category, index) => (
              <div key={index} className="space-y-5 bg-transparent">
                <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-indigo-500 rounded-full inline-block shadow-sm"></span>
                  {category}
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {groupedMaterials[category].map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex items-center gap-4 group cursor-pointer"
                    >
                      {/* Sol İkon Bölümü */}
                      <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                        {getIconForType(item.type)}
                      </div>
                      
                      {/* Orta Başlık/Bilgi Bölümü */}
                      <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-slate-800 text-sm md:text-base truncate group-hover:text-indigo-600 transition-colors" title={item.title}>
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-semibold">
                          <span className="uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-600 tracking-wide">{item.type}</span>
                          <span>{item.size}</span>
                        </div>
                      </div>
                      
                      {/* Sağ İndir Butonu */}
                      <button className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 hover:bg-indigo-600 hover:text-white transition-colors duration-300 shadow-sm focus:outline-none">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

        </div>
      </main>
    </div>
  );
};

export default CourseMaterials;
