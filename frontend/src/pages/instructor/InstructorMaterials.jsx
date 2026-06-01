import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import InstructorSidebar from './InstructorSidebar';
import { UploadCloud, FileText, Send, CheckCircle2, Headphones, PlayCircle, Link2 } from 'lucide-react';
import axios from 'axios';

const InstructorMaterials = () => {
  const location = useLocation();
  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('access')}`
  });

  // Form State'leri
  const [title, setTitle] = useState('');
  const [materialType, setMaterialType] = useState('pdf');
  const [targetType, setTargetType] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  // Veri/Liste State'leri
  const [students, setStudents] = useState([]);
  const [archive, setArchive] = useState([]);

  // UI State'leri
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Dashboard'dan preSelect ile yönlendirdiyse
  useEffect(() => {
    if (location.state && location.state.preSelectedStudent) {
      setTargetType('individual');
    }
  }, [location]);

  // Öğrenci listesini API'den çek
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/education/instructor/students/', { headers: getAuthHeader() });
        setStudents(res.data);

        // Eğer preSelectedStudent ismi geldiyse eşleştir
        if (location.state?.preSelectedStudent && res.data.length > 0) {
          const found = res.data.find(s => s.full_name === location.state.preSelectedStudent);
          if (found) setSelectedStudentId(String(found.id));
        }
      } catch (err) {
        console.error('Öğrenci listesi çekilemedi:', err);
      }
    };
    fetchStudents();
  }, []);

  // Arşivi API'den çek
  const fetchArchive = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/education/instructor/archive/', { headers: getAuthHeader() });
      setArchive(res.data);
    } catch (err) {
      console.error('Arşiv çekilemedi:', err);
    }
  };

  useEffect(() => { fetchArchive(); }, []);

  // Toast helper
  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Dosya seçimi
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return showToast('Materyal adı zorunludur.', 'error');
    if (!file) return showToast('Dosya yüklemek zorunludur.', 'error');
    if (targetType === 'individual' && !selectedStudentId) return showToast('Öğrenci seçimi zorunludur.', 'error');

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', materialType);
    // Backend'in beklediği kesin format: 'all_class' veya 'individual'
    formData.append('target', targetType === 'all' ? 'all_class' : 'individual');
    if (targetType === 'individual') {
      formData.append('student_id', selectedStudentId);
    }
    formData.append('file', file);

    try {
      const token = localStorage.getItem('access') || localStorage.getItem('access_token');
      const res = await axios.post('http://127.0.0.1:8000/api/education/instructor/upload/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      showToast(res.data.message || 'Materyal başarıyla gönderildi!', 'success');

      // Formu sıfırla
      setTitle('');
      setMaterialType('pdf');
      setTargetType('all');
      setSelectedStudentId('');
      setFile(null);
      setFileName('');

      // Arşivi yenile
      fetchArchive();
    } catch (err) {
      showToast(err.response?.data?.error || err.message || 'Bir hata oluştu.', 'error');
      console.error("Detaylı Hata:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Type'a göre ikon ve renk
  const getTypeInfo = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('audio') || t.includes('mp3') || t.includes('ses')) {
      return { bg: 'bg-purple-100', text: 'text-purple-600', label: 'SES', icon: <Headphones className="w-4 h-4" /> };
    }
    if (t.includes('video') || t.includes('mp4')) {
      return { bg: 'bg-blue-100', text: 'text-blue-600', label: 'VİDEO', icon: <PlayCircle className="w-4 h-4" /> };
    }
    if (t.includes('link') || t.includes('bağlantı')) {
      return { bg: 'bg-teal-100', text: 'text-teal-600', label: 'LINK', icon: <Link2 className="w-4 h-4" /> };
    }
    return { bg: 'bg-red-100', text: 'text-red-600', label: 'PDF', icon: <FileText className="w-4 h-4" /> };
  };

  return (
    <div className="flex min-h-[85vh] bg-slate-50 w-full relative z-10">
      <InstructorSidebar />

      {/* Toast Mesajı */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 font-bold text-sm animate-in fade-in slide-in-from-top-5 ${toastType === 'success' ? 'bg-emerald-100 border border-emerald-200 text-emerald-700' : 'bg-rose-100 border border-rose-200 text-rose-700'}`}>
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

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

            <form className="p-6 space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Materyal Adı</label>
                  <input
                    type="text"
                    placeholder="Örn: B1 Hafta 2 Okuma Parçası"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Türü</label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800 bg-white"
                  >
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
                  <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex-1 ${targetType === 'all' ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200'}`}>
                    <input type="radio" name="target" value="all" checked={targetType === 'all'} onChange={() => { setTargetType('all'); setSelectedStudentId(''); }} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                    <span className="font-semibold text-slate-700">Tüm Sınıfa Gönder</span>
                  </label>
                  <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex-1 ${targetType === 'individual' ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200'}`}>
                    <input type="radio" name="target" value="individual" checked={targetType === 'individual'} onChange={() => setTargetType('individual')} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                    <span className="font-semibold text-slate-700">Bireysel Öğrenciye Gönder</span>
                  </label>
                </div>
                {targetType === 'individual' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Öğrenci Seçiniz</label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800 bg-white"
                    >
                      <option value="">-- Öğrenci seçin --</option>
                      {students.map((s) => (
                        <option key={s.id} value={String(s.id)}>
                          {s.full_name}{s.language ? ` - ${s.language}` : ''} ({s.level || '-'})
                        </option>
                      ))}
                    </select>
                    {students.length === 0 && (
                      <p className="text-xs text-amber-600 mt-2 font-medium">⚠ Branşınıza ait kayıtlı öğrenci bulunamadı.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Tek Ana Dosya Yükleme Alanı – Supplementary PDF alanı KALDIRILDI (Madde 2) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Dosya Yükle</label>
                <label className="w-full border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-indigo-50 hover:border-indigo-400 transition-all cursor-pointer group bg-slate-50/50">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.mp3,.mp4,.doc,.docx,.pptx,.zip,.wav,.ogg,.avi,.mkv,.mov,.webm"
                    onChange={handleFileChange}
                  />
                  <div className="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6 text-indigo-600" />
                  </div>
                  {fileName ? (
                    <h4 className="text-sm font-bold text-indigo-700 mb-1">📎 {fileName}</h4>
                  ) : (
                    <>
                      <h4 className="text-sm font-bold text-slate-700 mb-1">Tıklayın veya sürükleyip bırakın</h4>
                      <p className="text-xs text-slate-500">PDF, MP3, MP4 (Maks. 50MB)</p>
                    </>
                  )}
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </div>
            </form>
          </div>

          {/* Arşiv Bölümü - Madde 5: Dil bilgisi gösterimi */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Gönderilen Materyaller Arşivi</h2>
            </div>
            <div className="p-6 space-y-3">
              {archive.length === 0 ? (
                <p className="text-center text-slate-400 py-8 font-medium">Henüz gönderilmiş materyal bulunmuyor.</p>
              ) : (
                archive.map((item) => {
                  const info = getTypeInfo(item.type);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${info.bg} flex items-center justify-center shrink-0`}>
                          <span className={`${info.text}`}>{info.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{item.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {/* Madde 5: target artık "Berat Taha - İngilizce" formatında geliyor */}
                            <span className="font-semibold text-slate-600">{item.target}</span>
                            {item.target_language && item.target === 'Tüm Sınıf' && (
                              <span className="ml-1 text-indigo-500">({item.target_language})</span>
                            )}
                            <span className="mx-1.5">•</span>
                            {item.date}
                          </p>
                        </div>
                      </div>
                      {item.file_url && (
                        <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap">
                          İncele
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default InstructorMaterials;
