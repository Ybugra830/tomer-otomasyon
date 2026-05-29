import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TomerApi from '../../services/TomerApi';
import {
    User,
    ArrowRight,
    AlertTriangle,
    Upload,
    CheckCircle2,
    LogOut
} from 'lucide-react';

import StudentSidebar from '../../components/StudentSidebar';

const RegistrationComplete = () => {
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(false);
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
            const token = localStorage.getItem('access_token') || localStorage.getItem('access');

            const res = await axios.get('http://127.0.0.1:8000/api/accounts/profile/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = res.data;
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

            // If profile is already complete, redirect to main generic panel (e.g. UZEM panel)
            if (data.is_profile_complete) {
                navigate('/ogrenci-panel');
                return;
            }

            setError(null);
        } catch (err) {
            setError('Profil bilgileri yüklenirken bir hata oluştu. Lütfen tekrar giriş yapınız.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // fetchProfile(); // Şimdilik 401 hatasını engellemek için otomatik çekimi durdurduk
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
            const token = localStorage.getItem('access') || localStorage.getItem('access_token');
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

            setUpdateMsg({ type: 'success', text: 'Bilgileriniz kaydedildi. Asıl UZEM paneline yönlendiriliyorsunuz...' });
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Anında yetkiyi local'da da güncelle ve yönlendir
            localStorage.setItem('is_active', 'true');

            if (response.status === 200 || response.status === 201) {
                navigate('/student/dashboard');
            }

        } catch (err) {
            setUpdateMsg({ type: 'error', text: 'Profili güncellerken bir hata oluştu. Lütfen tekrar deneyiniz.' });
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading && !profileData) {
        return (
            <div className="w-full min-h-[85vh] flex items-center justify-center">
                <div className="text-xl font-semibold text-slate-500 animate-pulse">Profil yükleniyor...</div>
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

    return (
        <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
            <StudentSidebar />

            <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Üst Uyarı Bandı */}
                    <div className="bg-orange-50 border-l-8 border-orange-500 p-6 rounded-r-2xl shadow-md">
                        <div className="flex items-start gap-5">
                            <AlertTriangle className="w-8 h-8 text-orange-600 mt-0.5 shrink-0 animate-pulse" />
                            <div>
                                <h1 className="text-2xl font-black text-orange-900 mb-2">Profil Tamamlama Gerekli</h1>
                                <p className="text-orange-800 text-base leading-relaxed font-medium">
                                    ⚠️ Kurs kesin kaydınızın Süper Admin tarafından onaylanabilmesi ve sınavlarınızın aktifleşmesi için lütfen aşağıdaki eksik kişisel bilgileri ve belgeleri eksiksiz doldurun.
                                </p>
                            </div>
                        </div>
                    </div>

                    {updateMsg && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 font-semibold text-base ${updateMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {updateMsg.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                            {updateMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 bg-slate-900 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                                    <User className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-wide">Detaylı Bilgi Formu</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => { localStorage.clear(); navigate('/login'); }}
                                className="text-slate-400 hover:text-white transition-colors"
                                title="Çıkış Yap"
                            >
                                <LogOut className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Kimlik Türü</label>
                                    <select
                                        name="identity_type"
                                        value={formData.identity_type}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-medium text-slate-700"
                                        required
                                    >
                                        <option value="">Seçiniz...</option>
                                        <option value="TC">T.C. Kimlik Kartı</option>
                                        <option value="PASSPORT">Pasaport</option>
                                        <option value="OTHER">Yabancı Kimlik / Diğer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Uyruk</label>
                                    <input
                                        type="text"
                                        name="nationality"
                                        required
                                        value={formData.nationality}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-medium text-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Anne Adı</label>
                                    <input
                                        type="text"
                                        name="mother_name"
                                        required
                                        value={formData.mother_name}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-medium text-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Baba Adı</label>
                                    <input
                                        type="text"
                                        name="father_name"
                                        required
                                        value={formData.father_name}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-medium text-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Doğum Yeri</label>
                                    <input
                                        type="text"
                                        name="place_of_birth"
                                        required
                                        value={formData.place_of_birth}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-medium text-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Doğum Tarihi</label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        required
                                        value={formData.date_of_birth}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-medium text-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Telefon Numarası</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-medium text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-200">
                                <h3 className="font-black text-lg text-slate-800">Kimlik ve Belgeler Yükleme Ortamı</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Kimlik Belgesi Yükleme */}
                                    <div className="relative group border-2 border-dashed border-blue-300 rounded-2xl p-6 text-center hover:bg-blue-50/50 hover:border-blue-500 transition-all cursor-pointer bg-slate-50/50">
                                        <label className="cursor-pointer block w-full h-full absolute inset-0 z-10">
                                            <input type="file" name="identity_document" onChange={handleFileChange} className="hidden" accept=".png,.jpeg,.jpg,.pdf" required={!profileData?.identity_document_url} />
                                        </label>
                                        <Upload className="w-10 h-10 text-blue-400 group-hover:text-blue-600 mx-auto mb-3 transition-colors" />
                                        <span className="block text-base font-bold text-slate-800 mb-1">Kimlik/Pasaport Resmi Yükle</span>
                                        <span className="block text-sm text-slate-500 font-medium">Lütfen net okunan bir kopya seçin (.pdf, .jpg)</span>

                                        <div className="mt-4 relative z-20 pointer-events-none">
                                            {files.identity_document && <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-lg text-sm">{files.identity_document.name}</span>}
                                            {!files.identity_document && profileData?.identity_document_url && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg text-sm"><CheckCircle2 className="w-4 h-4" /> Mevcut Belge Yüklü</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* İndirim Belgesi Yükleme */}
                                    <div className="relative group border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 hover:border-slate-500 transition-all cursor-pointer bg-slate-50/50">
                                        <label className="cursor-pointer block w-full h-full absolute inset-0 z-10">
                                            <input type="file" name="discount_document" onChange={handleFileChange} className="hidden" accept=".png,.jpeg,.jpg,.pdf" />
                                        </label>
                                        <Upload className="w-10 h-10 text-slate-400 group-hover:text-slate-600 mx-auto mb-3 transition-colors" />
                                        <span className="block text-base font-bold text-slate-800 mb-1">İndirim Belgesi (Opsiyonel)</span>
                                        <span className="block text-sm text-slate-500 font-medium">Öğrenci belgesi, görev yeri belgesi vb.</span>

                                        <div className="mt-4 relative z-20 pointer-events-none">
                                            {files.discount_document && <span className="inline-block px-3 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg text-sm">{files.discount_document.name}</span>}
                                            {!files.discount_document && profileData?.discount_document_url && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg text-sm"><CheckCircle2 className="w-4 h-4" /> Mevcut Belge Yüklü</span>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="mt-10">
                                <button
                                    type="submit"
                                    disabled={isUpdating || (updateMsg && updateMsg.type === 'success')}
                                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-lg rounded-2xl shadow-[0_8px_30px_rgb(59,130,246,0.3)] transition-all hover:shadow-[0_8px_30px_rgb(59,130,246,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {updateMsg && updateMsg.type === 'success' ? 'KAYDEDİLDİ' : isUpdating ? 'GÜNCELLENİYOR...' : 'PROFİL BİLGİLERİNİ ONAYA GÖNDER'}
                                    {!isUpdating && !(updateMsg && updateMsg.type === 'success') && <ArrowRight className="w-6 h-6" />}
                                </button>
                            </div>

                        </div>
                    </form>

                </div>
            </main>
        </div>
    );
};

export default RegistrationComplete;
