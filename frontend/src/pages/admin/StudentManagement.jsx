import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import { Check, X, Search, Filter, ShieldCheck, Clock, Eye, Download, FileText, UserCircle, FileSearch, XCircle, Loader2, Zap } from 'lucide-react';
import { assignExam } from '../../services/AdminExamApi';
import { getStudentDetails, reviewStudentApplication } from '../../services/AdminApi';

const API_BASE = 'http://127.0.0.1:8000/api';

const StudentManagement = () => {
  const [activeTab, setActiveTab] = useState('bekleyen'); // 'bekleyen' or 'aktif'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sınav atama state'leri
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignDone, setAssignDone] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' | 'error'

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Backend'den bekleyen başvuruları çek
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE}/admin-dashboard-bekleyenler/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      // Backend'den dönen veriyi frontend formatına dönüştür
      const mapped = response.data.map((item, idx) => ({
        id: idx + 1,
        adSoyad: item.ad_soyad,
        kimlikNo: item.tc,
        basvuruTuru: item.basvuru_turu,
        kimlikDosyasiUrl: item.kimlik_dosyasi_url,
        durum: 'Bekliyor',
      }));
      setStudents(mapped);
    } catch (error) {
      console.error('Öğrenci verileri alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // "Detay İncele" butonuna basıldığında
  const handleViewDetail = async (student) => {
    setSelectedStudent(student);
    setDetailLoading(true);
    setDetailData(null);
    setAssignDone(false);

    try {
      const data = await getStudentDetails(student.kimlikNo);
      setDetailData(data);
    } catch (error) {
      console.error('Detay alınamadı:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  // "Kaydı Onayla" butonuna basıldığında
  const handleApprove = async () => {
    if (!detailData || !detailData.aday) return;
    setActionLoading(true);

    try {
      await reviewStudentApplication(detailData.aday.tc_pasaport_no, 'approve');
      showToast('Öğrenci kaydı başarıyla onaylandı.', 'success');

      // Tabloyu güncelle
      setStudents(prev => prev.filter(s => s.kimlikNo !== detailData.aday.tc_pasaport_no));
      setSelectedStudent(null);
      setDetailData(null);
    } catch (error) {
      showToast(error.response?.data?.error || 'Onay sırasında bir hata oluştu.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // "Reddet" butonuna basıldığında
  const handleReject = async () => {
    if (!detailData || !detailData.aday) return;
    setActionLoading(true);

    try {
      await reviewStudentApplication(detailData.aday.tc_pasaport_no, 'reject');
      showToast('Öğrenci kaydı başarıyla reddedildi.', 'success');

      setStudents(prev => prev.filter(s => s.kimlikNo !== detailData.aday.tc_pasaport_no));
      setSelectedStudent(null);
      setDetailData(null);
    } catch (error) {
      showToast(error.response?.data?.error || 'Reddetme sırasında bir hata oluştu.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // "Seviye Tespit Sınavı Ata" butonuna basıldığında
  const handleAssignExam = async () => {
    if (!detailData?.aday?.tc_pasaport_no) return;
    setAssignLoading(true);

    try {
      await assignExam(detailData.aday.tc_pasaport_no);
      setAssignDone(true);
      showToast('Seviye Tespit Sınavı başarıyla atandı!', 'success');
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Sınav atanamadı. Bir hata oluştu.';
      showToast(errMsg, 'error');
    } finally {
      setAssignLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const searchMatch = student.adSoyad.toLowerCase().includes(searchTerm.toLowerCase()) || student.kimlikNo.includes(searchTerm);
    return searchMatch;
  });

  return (
    <div className="w-full flex flex-col md:flex-row min-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 relative">

      {/* Toast Bildirim */}
      {toastMessage && (
        <div className="fixed top-8 right-8 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 font-bold text-white ${toastType === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
            {toastType === 'success' ? <Check className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {toastMessage}
          </div>
        </div>
      )}

      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Öğrenci Yönetimi</h1>
              <p className="text-slate-500 font-medium mt-1">Sisteme kayıt olan öğrencilerin onay süreçlerini yönetin.</p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Öğrenci veya TC Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm shadow-sm bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-slate-200/50 p-1 rounded-xl w-max">
            <button
              onClick={() => setActiveTab('bekleyen')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'bekleyen'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
            >
              <Clock className="w-4 h-4" />
              Onay Bekleyenler
              <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-xs ml-1">
                {students.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('aktif')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'aktif'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Aktif Öğrenciler
            </button>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {activeTab === 'bekleyen' ? 'İnceleme Bekleyen Başvurular' : 'Sisteme Kayıtlı Öğrenciler'}
              </h2>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="ml-3 text-slate-500 font-medium">Yükleniyor...</span>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                      <th className="px-6 py-4">Ad Soyad</th>
                      <th className="px-6 py-4">Kimlik No</th>
                      <th className="px-6 py-4">Başvuru Türü</th>
                      <th className="px-6 py-4">Durum</th>
                      <th className="px-6 py-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                                {student.adSoyad.charAt(0)}
                              </div>
                              <div className="font-bold text-slate-800">{student.adSoyad}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600 font-mono text-sm">
                            {student.kimlikNo}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-600">
                            {student.basvuruTuru}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-max bg-amber-50 text-amber-700 border border-amber-100">
                              <Clock className="w-3 h-3" />
                              Bekliyor
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleViewDetail(student)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-lg transition-all text-sm font-bold shadow-sm"
                            >
                              <Eye className="w-4 h-4" />
                              Detay İncele
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                          Bu listede öğrenci bulunmamaktadır.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Detay İnceleme Modalı */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">Başvuru Detayları</h2>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">TC: {selectedStudent.kimlikNo}</p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedStudent(null); setDetailData(null); setAssignDone(false); }}
                className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-2 rounded-full transition-colors border border-slate-200 shadow-sm"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-grow bg-slate-50/50">
              {detailLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="ml-3 text-slate-500 font-medium">Detaylar yükleniyor...</span>
                </div>
              ) : detailData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Kişisel Bilgiler Kartı */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Kişisel Bilgiler</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm font-medium">Ad Soyad</span>
                        <span className="text-slate-800 text-sm font-bold">{detailData.aday.ad} {detailData.aday.soyad}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm font-medium">Kimlik Türü</span>
                        <span className="text-slate-800 text-sm font-bold">{detailData.aday.kimlik_tipi || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm font-medium">Kimlik No</span>
                        <span className="text-slate-800 text-sm font-mono font-bold">{detailData.aday.tc_pasaport_no}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm font-medium">Uyruk</span>
                        <span className="text-slate-800 text-sm font-bold">{detailData.aday.uyruk || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm font-medium">Anne / Baba Adı</span>
                        <span className="text-slate-800 text-sm font-bold">{detailData.aday.anne_adi || '-'} / {detailData.aday.baba_adi || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm font-medium">Doğum Yeri</span>
                        <span className="text-slate-800 text-sm font-bold">{detailData.aday.dogum_yeri || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm font-medium">Doğum Tarihi</span>
                        <span className="text-slate-800 text-sm font-bold">{detailData.aday.dogum_tarihi || '-'}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-50">
                        <span className="text-slate-500 text-sm font-medium">Telefon</span>
                        <span className="text-slate-800 text-sm font-bold">{detailData.aday.telefon1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm font-medium">E-Posta</span>
                        <span className="text-slate-800 text-sm font-bold">{detailData.aday.eposta}</span>
                      </div>
                    </div>
                  </div>

                  {/* Başvuru ve Belgeler */}
                  <div className="space-y-6">
                    {detailData.basvurular.map((b, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                          Başvuru #{idx + 1} — {b.basvuru_turu}
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-500 text-sm font-medium">Durum</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${b.durum === 'BEKLIYOR' ? 'bg-amber-100 text-amber-700' :
                              b.durum === 'ONAYLANDI' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-rose-100 text-rose-700'
                              }`}>{b.durum}</span>
                          </div>
                          {b.dil && (
                            <div className="flex justify-between">
                              <span className="text-slate-500 text-sm font-medium">Dil</span>
                              <span className="text-slate-800 text-sm font-bold">{b.dil}</span>
                            </div>
                          )}
                          {b.seviye && (
                            <div className="flex justify-between">
                              <span className="text-slate-500 text-sm font-medium">Seviye</span>
                              <span className="text-slate-800 text-sm font-bold">{b.seviye}</span>
                            </div>
                          )}
                          {b.sube && (
                            <div className="flex justify-between">
                              <span className="text-slate-500 text-sm font-medium">Şube</span>
                              <span className="text-slate-800 text-sm font-bold">{b.sube}</span>
                            </div>
                          )}
                          {b.sinav_turu && (
                            <div className="flex justify-between">
                              <span className="text-slate-500 text-sm font-medium">Sınav Türü</span>
                              <span className="text-slate-800 text-sm font-bold">{b.sinav_turu}</span>
                            </div>
                          )}
                        </div>

                        {/* Belgeler */}
                        <div className="mt-4 space-y-2">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Yüklenen Belgeler</h4>
                          {b.kimlik_dosyasi_url && (
                            <a href={b.kimlik_dosyasi_url} target="_blank" rel="noreferrer"
                              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 group hover:bg-blue-50 transition-colors">
                              <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                                <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Kimlik/Pasaport Belgesi</span>
                              </div>
                              <span className="text-xs font-semibold text-blue-600">Görüntüle ↗</span>
                            </a>
                          )}
                          {b.indirim_belgesi_url && (
                            <a href={b.indirim_belgesi_url} target="_blank" rel="noreferrer"
                              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 group hover:bg-emerald-50 transition-colors">
                              <div className="flex items-center gap-2">
                                <FileSearch className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                                <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">İndirim Belgesi</span>
                              </div>
                              <span className="text-xs font-semibold text-emerald-600">Görüntüle ↗</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">Detay bilgisi alınamadı.</div>
              )}
            </div>

            {/* Modal Footer (Aksiyonlar) */}
            {detailData && detailData.basvurular && detailData.basvurular.some(b => b.durum === 'BEKLIYOR') && (
              <div className="px-6 py-4 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-500">Mevcut Durum:</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                    Bekliyor
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Seviye Tespit Sınavı Ata Butonu */}
                  <button
                    onClick={handleAssignExam}
                    disabled={assignLoading || assignDone || actionLoading}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${assignDone
                      ? 'bg-violet-100 text-violet-700 border border-violet-200 cursor-not-allowed'
                      : 'bg-violet-600 text-white hover:bg-violet-700 shadow-md hover:shadow-lg disabled:opacity-50'
                      }`}
                  >
                    {assignLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : assignDone ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    {assignLoading ? 'Atanıyor...' : assignDone ? 'Sınav Atandı' : 'Seviye Tespit Sınavı Ata'}
                  </button>

                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    Reddet
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Kaydı Onayla
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default StudentManagement;
