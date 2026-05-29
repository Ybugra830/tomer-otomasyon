import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TomerApi from '../services/TomerApi';
import {
  ClipboardList,
  User,
  Info,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CreditCard,
  GraduationCap,
  AlertTriangle,
  Upload,
  CheckCircle2
} from 'lucide-react';
import StudentSidebar from '../components/StudentSidebar';

const StudentProfile = () => {
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    identity_type: '',
    nationality: '',
    father_name: '',
    mother_name: '',
    place_of_birth: '',
    date_of_birth: '',
    phone: '',
  });

  const [files, setFiles] = useState({
    identity_document: null,
    discount_document: null
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await TomerApi.getStudentProfile();
      setProfileData(data);
      setFormData({
        identity_type: data.identity_type || '',
        nationality: data.nationality || '',
        father_name: data.father_name || '',
        mother_name: data.mother_name || '',
        place_of_birth: data.place_of_birth || '',
        date_of_birth: data.date_of_birth || '',
        phone: data.phone || '',
      });
      setError(null);
    } catch (err) {
      setError('Profil bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setFiles(prev => ({ ...prev, [e.target.name]: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMsg(null);

    try {
      const token = localStorage.getItem('access_token'); // veya token neredeyse
      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      if (files.identity_document) formDataToSend.append('identity_document', files.identity_document);
      if (files.discount_document) formDataToSend.append('discount_document', files.discount_document);

      const response = await axios.post('http://127.0.0.1:8000/api/accounts/profile/update/', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      setUpdateMsg({ type: 'success', text: response.data.message || 'Profil başarıyla güncellendi!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await fetchProfile(); // Reload data
    } catch (err) {
      setUpdateMsg({ type: 'error', text: 'Profili güncellerken bir hata oluştu. Lütfen tekrar deneyiniz.' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && !profileData) {
    return (
      <div className="w-full min-h-[85vh] flex items-center justify-center">
        <div className="text-xl font-semibold text-slate-500 animate-pulse">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[85vh] flex items-center justify-center">
        <div className="text-xl font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  const isProfileIncomplete = profileData && !profileData.is_profile_complete;

  return (
    <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
      <StudentSidebar />
      <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-8">

          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Profilim</h1>
            <p className="text-slate-500">Kişisel bilgilerinizi ve güncel eğitim durumunuzu buradan yönetebilirsiniz.</p>
          </div>

          {updateMsg && (
            <div className={`p-4 rounded-xl flex items-center gap-3 font-semibold text-sm ${updateMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {updateMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              {updateMsg.text}
            </div>
          )}

          {isProfileIncomplete && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-5 rounded-r-xl shadow-sm flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-orange-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-orange-900 font-bold mb-1">Eksik Profil Bilgileri Formu</h3>
                <p className="text-orange-800 text-sm leading-relaxed">
                  ⚠️ Kurs kaydınızın kesinleşmesi ve sınav modüllerinizin açılması için lütfen aşağıdaki eksik belgeleri ve kişisel bilgileri doldurarak profilinizi güncelleyin.
                </p>
              </div>
            </div>
          )}

          {/* Eksik Bilgi Tamamlama Formu (Sadece Eksikse veya İstiyorsa Görünsün) */}
          {isProfileIncomplete && (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <User className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold text-slate-800">Bilgi Tamamlama Bölümü</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Kimlik Türü</label>
                    <select
                      name="identity_type"
                      value={formData.identity_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      required
                    >
                      <option value="">Seçiniz...</option>
                      <option value="TC">T.C. Kimlik Kartı</option>
                      <option value="PASSPORT">Pasaport</option>
                      <option value="OTHER">Yabancı Kimlik / Diğer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Uyruk</label>
                    <input
                      type="text"
                      name="nationality"
                      required
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Anne Adı</label>
                    <input
                      type="text"
                      name="mother_name"
                      required
                      value={formData.mother_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Baba Adı</label>
                    <input
                      type="text"
                      name="father_name"
                      required
                      value={formData.father_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Doğum Yeri</label>
                    <input
                      type="text"
                      name="place_of_birth"
                      required
                      value={formData.place_of_birth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Doğum Tarihi</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      required
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Telefon Numarası</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-semibold text-sm text-slate-800">Kimlik ve İndirim Belgeleri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                      <label className="cursor-pointer block">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <span className="block text-sm font-semibold text-slate-700">Kimlik Belgesi Yükle</span>
                        <span className="block text-xs text-slate-500 mt-1">Sadece resim veya PDF formulları</span>
                        <input type="file" name="identity_document" onChange={handleFileChange} className="hidden" accept=".png,.jpeg,.jpg,.pdf" required={!profileData.identity_document_url} />
                      </label>
                      {files.identity_document && <span className="text-xs text-blue-600 block mt-2">{files.identity_document.name}</span>}
                      {!files.identity_document && profileData.identity_document_url && (
                        <span className="text-xs text-emerald-600 block mt-2 flex items-center justify-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Mevcut Yüklendi</span>
                      )}
                    </div>

                    <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                      <label className="cursor-pointer block">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <span className="block text-sm font-semibold text-slate-700">İndirim Belgesi (Opsiyonel)</span>
                        <span className="block text-xs text-slate-500 mt-1">Öğrenci belgesi vb.</span>
                        <input type="file" name="discount_document" onChange={handleFileChange} className="hidden" accept=".png,.jpeg,.jpg,.pdf" />
                      </label>
                      {files.discount_document && <span className="text-xs text-blue-600 block mt-2">{files.discount_document.name}</span>}
                      {!files.discount_document && profileData.discount_document_url && (
                        <span className="text-xs text-emerald-600 block mt-2 flex items-center justify-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Mevcut Yüklendi</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Güncelleniyor...' : 'Profilimi Güncelle'}
                    {!isUpdating && <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Sadece Profil Tamamsa Gösterilen Kartlar */}
          {!isProfileIncomplete && (
            <>
              {/* Eğitim Durumu & Seviye Kartı */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-bold text-slate-800">Eğitim Durumu & Seviye</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1 w-full">
                      <span className="block text-sm text-slate-500 font-medium mb-1">Tahmini Seviyeniz</span>
                      <span className="text-xl font-bold text-slate-800">{profileData.tahminiSeviye}</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1 w-full">
                      <span className="block text-sm text-slate-500 font-medium mb-1">Kesinleşmiş Seviyeniz</span>
                      <span className="text-xl font-bold text-slate-800">
                        {profileData.kesinSeviye ? profileData.kesinSeviye : 'Belirlenmedi'}
                      </span>
                    </div>
                  </div>

                  {!profileData.kesinSeviye && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                      <Info className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-blue-800 font-medium leading-relaxed">
                          Kayıt aşamasında dil seviyenizi <span className="font-bold">{profileData.tahminiSeviye}</span> olarak belirttiniz. Seviyenizin onaylanması için gerekli aşamaları tamamlamanız beklenmektedir.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
