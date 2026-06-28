import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Headphones,
  PenTool,
  FileText,
  Clock,
  HelpCircle,
  Lock
} from 'lucide-react';
import StudentSidebar from '../components/StudentSidebar';
const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [availableExams, setAvailableExams] = useState([]);
  const [studentLanguage, setStudentLanguage] = useState('');
  const [realLevel, setRealLevel] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('access');
        const headers = { Authorization: `Bearer ${token}` };

        console.log("Sınavlar çekilmeye başlanıyor... Token mevcut:", !!token);

        // 1. Profil Bilgisini Al
        try {
          const profileRes = await axios.get('http://127.0.0.1:8000/api/accounts/profile/', { headers });
          const stLang = profileRes.data?.language?.toLowerCase();
          if (stLang) setStudentLanguage(stLang);
          if (profileRes.data && profileRes.data.kesinSeviye) {
            setRealLevel(profileRes.data.kesinSeviye.toUpperCase());
          }
        } catch (pErr) {
          console.error("Profil çekilirken hata oluştu ama devam ediliyor:", pErr);
        }

        // 2. Atanan Sınavları Al (Zorunlu ve Net İstek)
        // URL sonundaki eğik çizgiye (/) ve adrese dikkat edin!
        const examsRes = await axios.get('http://127.0.0.1:8000/api/exams/student/available-exams/', { headers });
        console.log("Backend'den gelen ham sınav verisi:", examsRes.data);

        const rawExams = examsRes.data || [];
        setAvailableExams(rawExams);

      } catch (error) {
        console.error('Sınav verileri eğitmen havuzundan çekilemedi! Detay:', error);
      }
    };
    fetchDashboardData();
  }, []);

  // DİNAMİK İSİM
  const authUser = user?.user || user;
  const studentName = (() => {
    if (authUser?.first_name && authUser?.last_name) return `${authUser.first_name} ${authUser.last_name}`;
    if (authUser?.ad && authUser?.soyad) return `${authUser.ad} ${authUser.soyad}`;
    if (authUser?.first_name) return authUser.first_name;
    if (authUser?.username) return authUser.username;
    return localStorage.getItem('studentName') || 'Öğrenci';
  })();

  const renderBadge = (isLocked, isModuleCompleted, isFullyLocked) => {
    if (isFullyLocked) {
      return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">Tamamlandı</span>;
    }
    if (isModuleCompleted) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-full border border-slate-200">
          <Clock className="w-3.5 h-3.5" /> DEĞERLENDİRİLİYOR
        </span>
      );
    }
    if (isLocked) {
      return <span className="px-3 py-1 bg-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">Kilitli</span>;
    }
    return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">Hazır</span>;
  };

  // Dinamik olarak backend'den islenen statuler kullanildigi icin statik liste silindi

  return (
    <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
      <StudentSidebar />
      <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 mb-10 shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Hoş geldin, <span className="text-indigo-600">{studentName}</span> 👋</h1>
              <p className="text-slate-500">Aktif sınav modüllerine aşağıdan ulaşabilir ve sınavlarını başlatabilirsin. Başarılar dileriz!</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col justify-center">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-slate-600">Genel İlerleme</span>
                <span className="text-xl font-bold text-indigo-600">%25</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-slate-500">Mevcut Seviye:</span>
                <span className="font-semibold text-slate-700">{realLevel || 'Belirlenmedi'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableExams.length === 0 ? (
              <div className="md:col-span-2 bg-yellow-50 text-yellow-800 p-6 rounded-xl border border-yellow-200 text-center font-medium">
                Şu an adınıza atanmış aktif sınav bulunmamaktadır, lütfen eğitmeninizden atama yapmasını bekleyiniz.
              </div>
            ) : (
              availableExams.map((assignment) => {
                // Gerçek sınav verisi her zaman assignment.exam içindedir!
                const exam = assignment.exam;
                if (!exam) return null; // Veri hatası varsa patlama, geç.

                // Tema ayarları (Basit tutuldu)
                let icon = <BookOpen className="w-7 h-7" />;
                let colorClass = 'bg-slate-100 text-slate-600';
                let btnClass = 'bg-slate-600 hover:bg-slate-700';
                let desc = 'Sınavı en iyi şekilde tamamlamanız beklenmektedir.';

                if (exam.exam_type === 'PLACEMENT') {
                  icon = <FileText className="w-7 h-7" />; colorClass = 'bg-blue-100 text-blue-600'; btnClass = 'bg-blue-600 hover:bg-blue-700'; desc = 'Seviye belirleme modülü.';
                } else if (exam.exam_type === 'GRAMMAR') {
                  icon = <BookOpen className="w-7 h-7" />; colorClass = 'bg-orange-100 text-orange-600'; btnClass = 'bg-orange-600 hover:bg-orange-700'; desc = 'Gramer bilginizi ölçen modül.';
                } else if (exam.exam_type === 'LISTENING') {
                  icon = <Headphones className="w-7 h-7" />; colorClass = 'bg-indigo-100 text-indigo-600'; btnClass = 'bg-indigo-600 hover:bg-indigo-700'; desc = 'Dinleme becerinizi ölçen modül.';
                } else if (exam.exam_type === 'READING') {
                  icon = <BookOpen className="w-7 h-7" />; colorClass = 'bg-teal-100 text-teal-600'; btnClass = 'bg-teal-600 hover:bg-teal-700'; desc = 'Okuduğunu anlama modülü.';
                } else if (exam.exam_type === 'WRITING') {
                  icon = <PenTool className="w-7 h-7" />; colorClass = 'bg-purple-100 text-purple-600'; btnClass = 'bg-purple-600 hover:bg-purple-700'; desc = 'Yazma becerinizi ölçen modül.';
                }

                const durationText = exam.duration ? `${exam.duration} Dakika` : '-- Dakika';
                const questionsText = exam.total_questions ? `${exam.total_questions} Soru` : '-- Soru';

                return (
                  <div key={assignment.id || exam.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-all relative">
                    <div className="absolute top-6 right-6">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">Hazır</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4 pr-24">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}>
                        {icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{exam.title || exam.exam_title}</h3>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm mb-4 flex-grow">{desc}</p>
                    <div className="flex items-center gap-5 text-sm text-slate-500 mb-6 font-medium">
                      <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" />{durationText}</div>
                      <div className="flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-slate-400" />{questionsText}</div>
                    </div>
                    <button onClick={() => navigate(`/sinav-coz/${exam.id}`)} className={`w-full py-3 text-white font-semibold rounded-xl text-sm ${btnClass}`}>
                      Sınava Başla
                    </button>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
