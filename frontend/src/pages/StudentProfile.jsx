import React, { useState, useEffect } from 'react';
import TomerApi from '../services/TomerApi';
import {
  Info,
  GraduationCap
} from 'lucide-react';
import StudentSidebar from '../components/StudentSidebar';

const StudentProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await TomerApi.getStudentProfile();
      setProfileData(data);
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

  // İsim senkronizasyonu
  const studentName = localStorage.getItem('studentName') || 'Öğrenci';

  if (loading && !profileData) {
    return (
      <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
        <StudentSidebar />
        <main className="flex-grow bg-slate-50 flex items-center justify-center p-6 md:p-10">
          <div className="text-xl font-semibold text-slate-500 animate-pulse">Yükleniyor...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
        <StudentSidebar />
        <main className="flex-grow bg-slate-50 flex items-center justify-center p-6 md:p-10">
          <div className="text-xl font-semibold text-red-500">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
      <StudentSidebar />
      <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Üst Başlık Katmanı & İsim İmzası */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Profilim</h1>
              <p className="text-slate-500 text-sm">Kişisel bilgilerinizi ve güncel eğitim durumunuzu buradan yönetebilirsiniz.</p>
            </div>

            {/* Sağ Üst İsim Senkronizasyonu Kartı */}
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-xl">
                {studentName.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-800">{studentName}</span>
                <span className="text-xs font-semibold text-slate-500">TÖMER Öğrencisi</span>
              </div>
            </div>
          </div>

          {/* Eğitim Durumu & Seviye Kartı */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <GraduationCap className="w-7 h-7 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-800">Eğitim Durumu & Seviye</h2>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                  <span className="block text-sm text-slate-500 font-bold mb-2 uppercase tracking-wider">Tahmini Seviyeniz</span>
                  <span className="text-2xl font-bold uppercase text-indigo-600">
                    {profileData?.language ? `${profileData.language} ` : ''}{profileData?.tahminiSeviye || 'Belirtilmedi'}
                  </span>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                  <span className="block text-sm text-slate-500 font-bold mb-2 uppercase tracking-wider">Kesinleşmiş Seviyeniz</span>
                  <span className="text-2xl font-bold uppercase text-slate-800">
                    {profileData?.kesinSeviye ? `${profileData?.language || ''} ${profileData.kesinSeviye}` : 'Belirlenmedi'}
                  </span>
                </div>

              </div>

              {(!profileData?.kesinSeviye) && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-4">
                  <Info className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-800 font-medium leading-relaxed">
                      Kayıt aşamasında dil seviyenizi <span className="font-extrabold uppercase">{profileData?.tahminiSeviye || 'A1'}</span> olarak belirttiniz. Seviyenizin onaylanması için gerekli aşamaları tamamlamanız beklenmektedir.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
