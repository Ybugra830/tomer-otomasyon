import React, { useState, useEffect } from 'react';
import StudentSidebar from '../components/StudentSidebar';
import { Search, Filter, FileText, Headphones, Download, PlayCircle, NotebookPen, CheckCircle2, X, Loader2 } from 'lucide-react';
import axios from 'axios';

const CourseMaterials = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tümü');
  const [materialsData, setMaterialsData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Not Modal State'leri
  const [activeNoteModal, setActiveNoteModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('access')}`
  });

  // Materyalleri API'den çek
  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/education/materials/', {
          headers: getAuthHeader()
        });
        setMaterialsData(response.data);
      } catch (error) {
        console.error("Materyaller çekilemedi", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  // Not modalını aç ve mevcut notu çek
  const handleOpenNoteModal = async (material) => {
    setSelectedMaterial(material);
    setActiveNoteModal(true);
    setNoteLoading(true);
    setNoteText('');
    setNoteSaved(false);

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/education/notes/?material_id=${material.id}`,
        { headers: getAuthHeader() }
      );
      setNoteText(response.data.note_text || '');
    } catch (error) {
      console.error("Not çekilemedi", error);
      setNoteText('');
    } finally {
      setNoteLoading(false);
    }
  };

  // Not modalını kapat
  const handleCloseNoteModal = () => {
    setActiveNoteModal(false);
    setSelectedMaterial(null);
    setNoteText('');
    setNoteSaved(false);
  };

  // Notu kaydet
  const handleSaveNote = async () => {
    if (!selectedMaterial) return;
    setIsSavingNote(true);
    setNoteSaved(false);

    try {
      await axios.post('http://127.0.0.1:8000/api/education/notes/', {
        material_id: selectedMaterial.id,
        note_text: noteText
      }, {
        headers: getAuthHeader()
      });

      setNoteSaved(true);
      // 1.5 saniye sonra modalı kapat
      setTimeout(() => {
        handleCloseNoteModal();
      }, 1500);
    } catch (error) {
      console.error("Not kaydedilemedi", error);
      alert("Hata: Not kaydedilemedi!");
    } finally {
      setIsSavingNote(false);
    }
  };

  // Tüm materyalleri tek bir dizide toplayıp filtreleme
  let allMaterials = [];
  Object.keys(materialsData).forEach(cat => {
    materialsData[cat].forEach(mat => {
      allMaterials.push({ ...mat, category: cat });
    });
  });

  const filteredMaterials = allMaterials.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const iconType = item.material_type || item.icon_type || 'pdf';
    const matchesType = filterType === 'Tümü' ||
      (filterType === 'PDF' && iconType === 'pdf') ||
      (filterType === 'Ses' && (iconType === 'audio' || iconType === 'mp3')) ||
      (filterType === 'Video' && iconType === 'video');
    return matchesSearch && matchesType;
  });

  // Filtrelenmiş materyalleri tekrar kategorize et
  const groupedMaterials = filteredMaterials.reduce((acc, material) => {
    if (!acc[material.category]) acc[material.category] = [];
    acc[material.category].push(material);
    return acc;
  }, {});

  const getIconForType = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'audio' || t === 'mp3') return <Headphones className="w-8 h-8 text-purple-500" />;
    if (t === 'video' || t === 'mp4') return <PlayCircle className="w-8 h-8 text-blue-500" />;
    return <FileText className="w-8 h-8 text-red-500" />;
  };

  const getTypeBadgeColor = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'audio' || t === 'mp3') return 'bg-purple-100 text-purple-700';
    if (t === 'video' || t === 'mp4') return 'bg-blue-100 text-blue-700';
    return 'bg-red-100 text-red-700';
  };

  const getTypeLabel = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'audio' || t === 'mp3') return 'SES';
    if (t === 'video' || t === 'mp4') return 'VİDEO';
    return 'PDF';
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200 relative">

      <StudentSidebar />

      <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Üst Araç Çubuğu */}
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

          {/* Materyallerin Listelenmesi */}
          {isLoading ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Materyaller yükleniyor...</p>
            </div>
          ) : Object.keys(groupedMaterials).length === 0 ? (
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {groupedMaterials[category].map((item) => {
                    const iconType = item.material_type || item.icon_type || 'pdf';
                    return (
                      <div key={item.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
                        <div className="flex items-center gap-4 group">
                          {/* Sol İkon Bölümü */}
                          <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                            {getIconForType(iconType)}
                          </div>

                          {/* Orta Başlık/Bilgi Bölümü */}
                          <div className="flex-grow min-w-0 pr-4">
                            <h3 className="font-bold text-slate-800 text-sm md:text-base truncate group-hover:text-indigo-600 transition-colors" title={item.title}>
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-semibold">
                              <span className={`uppercase px-2 py-0.5 rounded tracking-wide font-bold ${getTypeBadgeColor(iconType)}`}>
                                {getTypeLabel(iconType)}
                              </span>
                              {item.file_size && <span>{item.file_size}</span>}
                              {item.created_at && <span className="text-slate-400">{item.created_at}</span>}
                            </div>
                          </div>

                          {/* Sağ Butonlar */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* 📝 Not Ekle/Gör Butonu – Madde 6 */}
                            <button
                              onClick={() => handleOpenNoteModal(item)}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 focus:outline-none bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200"
                              title="📝 Notlarım"
                            >
                              <NotebookPen className="w-4 h-4" />
                            </button>

                            {item.file_url && (
                              <a
                                href={item.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors duration-300 shadow-sm focus:outline-none border border-indigo-200"
                                title="İndir / Aç"
                              >
                                <Download className="w-5 h-5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

        </div>
      </main>

      {/* ===== NOT MODAL (Madde 6 - KRİTİK) ===== */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col transform transition-all">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-950 to-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-400/20 rounded-lg flex items-center justify-center">
                  <NotebookPen className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Kişisel Notlarım</h3>
                  {selectedMaterial && (
                    <p className="text-xs text-indigo-200 truncate max-w-[250px]">{selectedMaterial.title}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleCloseNoteModal}
                className="text-indigo-200 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4 font-medium">
                Bu materyal ile ilgili çalışırken aklınızda kalmasını istediğiniz notları buraya ekleyebilirsiniz.
              </p>

              {noteLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
              ) : (
                <textarea
                  className="w-full p-4 bg-amber-50/50 border border-amber-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-amber-300 min-h-[160px] resize-none text-slate-700"
                  placeholder="Örn: Bu PDF'in 3. sayfasındaki kelimeleri ezberle..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                ></textarea>
              )}

              {/* Başarı mesajı */}
              {noteSaved && (
                <div className="mt-3 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-bold">Not başarıyla kaydedildi!</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 p-5 pl-6 pr-6 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={handleCloseNoteModal}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                type="button"
              >
                İptal
              </button>
              <button
                onClick={handleSaveNote}
                disabled={isSavingNote || noteLoading || noteSaved}
                className="px-6 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isSavingNote ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Kaydediliyor...
                  </span>
                ) : noteSaved ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Kaydedildi
                  </span>
                ) : (
                  'Kaydet'
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CourseMaterials;
