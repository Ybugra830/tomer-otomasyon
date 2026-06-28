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

        const [examsRes, profileRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/exams/student/available-exams/', { headers }).catch(() => ({ data: [] })),
          axios.get('http://127.0.0.1:8000/api/accounts/profile/', { headers }).catch(() => ({ data: {} }))
        ]);

        const stLang = profileRes.data?.language?.toLowerCase();
        if (stLang) setStudentLanguage(stLang);

        if (profileRes.data && profileRes.data.kesinSeviye) {
          setRealLevel(profileRes.data.kesinSeviye.toUpperCase());
        }

        // 1. DİL DUVARI (Language Guard)
        const rawExams = examsRes.data || [];
        const filteredExams = bgFiltered(rawExams, stLang);
        setAvailableExams(filteredExams);

      } catch (error) {
        console.error('API Verileri alınamadı:', error);
      }
    };
    fetchDashboardData();
  }, []);

  const bgFiltered = (examsList, studentLang) => {
    if (!studentLang) return examsList; // Eğer öğrencinin dili yoksa hepsini görebilir (veya admin kararı)
    return examsList.filter(e => {
      if (!e.language) return true; // Dili belirtilmeyen genel sınavlar
      return e.language.toLowerCase() === studentLang.toLowerCase();
    });
  };

  const placementExam = availableExams.find(e =>
    e.exam_type?.toUpperCase() === 'PLACEMENT' ||
    e.title?.toLowerCase().includes('seviye')
  ) || availableExams[0];

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

  const exams = [
    {
      id: 'seviyeTespit',
      examType: 'PLACEMENT',
      title: 'Seviye Tespit Sınavı',
      desc: 'Çoktan seçmeli sorulardan oluşan seviye tespit sınavı. Bu modül diğer beceri sınavlarından önce tamamlanmalıdır.',
      time: placementExam ? `${placementExam.duration} Dakika` : '-- Dakika',
      questions: placementExam ? `${placementExam.total_questions} Soru` : '-- Soru',
      icon: <FileText className="w-7 h-7" />,
      colorClass: 'bg-blue-100 text-blue-600',
      btnClass: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'anaTest',
      examType: 'GRAMMAR',
      title: 'Ana Test (Gramer)',
      desc: 'Dilbilgisi, kelime dağarcığı ve temel yapı bilgisini ölçen çoktan seçmeli kur tamamlama sınavı.',
      time: '60 Dakika',
      questions: '50 Soru',
      icon: <BookOpen className="w-7 h-7" />,
      colorClass: 'bg-orange-100 text-orange-600',
      btnClass: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      id: 'dinleme',
      examType: 'LISTENING',
      title: 'Dinleme Sınavı',
      desc: 'Farklı zorluk seviyelerindeki ses kayıtlarını dinleyerek ilgili soruları cevaplandırmanız beklenmektedir.',
      time: '45 Dakika',
      questions: '20 Soru',
      icon: <Headphones className="w-7 h-7" />,
      colorClass: 'bg-indigo-100 text-indigo-600',
      btnClass: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      id: 'okuma',
      examType: 'READING',
      title: 'Okuma Sınavı',
      desc: 'Verilen metinleri dikkatlice okuyup, okuduğunu anlama kapasitenizi ölçen soruları yanıtlayın.',
      time: '60 Dakika',
      questions: '25 Soru',
      icon: <BookOpen className="w-7 h-7" />,
      colorClass: 'bg-teal-100 text-teal-600',
      btnClass: 'bg-teal-600 hover:bg-teal-700'
    },
    {
      id: 'yazma',
      examType: 'WRITING',
      title: 'Yazma Sınavı',
      desc: 'Size verilen konu başlıkları altında düşüncelerinizi kurallara uygun ve anlaşılır bir dille yazıya dökün.',
      time: '45 Dakika',
      questions: '2 Soru',
      icon: <PenTool className="w-7 h-7" />,
      colorClass: 'bg-purple-100 text-purple-600',
      btnClass: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

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
            {exams.map((exam) => {
              const matchedAvailableExam = availableExams.find(e => e.exam_type?.toUpperCase() === exam.examType);
              const isPlacement = exam.examType === 'PLACEMENT';
              const hasLevel = Boolean(realLevel && realLevel !== 'BELİRLENMEDİ');

              // Tamamlanma kontrolleri (Backend'den is_completed bayrağı)
              const grammarCompleted = availableExams.find(e => e.exam_type?.toUpperCase() === 'GRAMMAR')?.is_completed === true;
              const readingCompleted = availableExams.find(e => e.exam_type?.toUpperCase() === 'READING')?.is_completed === true;
              const listeningCompleted = availableExams.find(e => e.exam_type?.toUpperCase() === 'LISTENING')?.is_completed === true;

              let isLocked = false;
              let lockMessage = 'Önce Seviyenizin Belirlenmesi Gerekiyor';
              let isModuleCompleted = matchedAvailableExam?.is_completed === true || (isPlacement && placementExam?.is_completed);
              let isFullyLocked = false;

              // 2. SIRALI KİLİT MEKANİZMASI (Sequential Unlock Flow)
              if (isPlacement) {
                if (hasLevel) {
                  isLocked = true;
                  isFullyLocked = true;
                } else if (placementExam?.is_completed) {
                  isLocked = true;
                }
              } else {
                if (!hasLevel) {
                  isLocked = true;
                } else if (matchedAvailableExam?.level && matchedAvailableExam.level.toUpperCase() !== realLevel) {
                  isLocked = true;
                  lockMessage = 'Bu sınav mevcut seviyenize uygun değil.';
                } else {
                  // Seviyesi uygunsa, STRICT SEQUENCE uygula:
                  if (exam.examType === 'GRAMMAR') {
                    // Gramer ilk adım, seviye varsa her zaman açıktır (tamamlanmadıysa).
                    isLocked = false;
                  } else if (exam.examType === 'READING') {
                    if (!grammarCompleted) {
                      isLocked = true;
                      lockMessage = 'Önce Ana Test (Gramer) Sınavını Tamamlayın';
                    }
                  } else if (exam.examType === 'LISTENING') {
                    if (!readingCompleted) {
                      isLocked = true;
                      lockMessage = 'Önce Okuma Sınavını Tamamlayın';
                    }
                  } else if (exam.examType === 'WRITING') {
                    if (!listeningCompleted) {
                      isLocked = true;
                      lockMessage = 'Önce Dinleme Sınavını Tamamlayın';
                    }
                  }
                }
              }

              // Dinamik exam timer / title bindirmesi
              const actualExamToPlay = isPlacement ? placementExam : matchedAvailableExam;
              const durationText = actualExamToPlay?.duration ? `${actualExamToPlay.duration} Dakika` : '-- Dakika';
              const questionsText = actualExamToPlay?.total_questions ? `${actualExamToPlay.total_questions} Soru` : '-- Soru';

              return (
                <div
                  key={exam.id}
                  className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full transition-all relative ${(isLocked || isModuleCompleted || isFullyLocked) ? 'opacity-70 bg-slate-50/50' : 'hover:shadow-md'}`}
                >
                  <div className="absolute top-6 right-6">
                    {renderBadge(isLocked, isModuleCompleted, isFullyLocked)}
                  </div>

                  <div className="flex items-center gap-4 mb-4 pr-24">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${(isLocked || isFullyLocked) ? 'bg-slate-200 text-slate-400' : exam.colorClass}`}>
                      {exam.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{actualExamToPlay?.title || exam.title}</h3>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm mb-4 flex-grow">{exam.desc}</p>

                  <div className="flex items-center gap-5 text-sm text-slate-500 mb-6 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {durationText}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      {questionsText}
                    </div>
                  </div>

                  {isFullyLocked ? (
                    <div className="w-full py-3 bg-slate-100 text-slate-500 font-semibold rounded-xl text-center text-sm flex items-center justify-center gap-2 border border-slate-200">
                      <Lock className="w-4 h-4" />
                      Sınav Tamamlandı
                    </div>
                  ) : isModuleCompleted ? (
                    <button
                      disabled={true}
                      className="w-full py-3 bg-slate-200 text-slate-500 cursor-not-allowed font-semibold rounded-xl shadow-sm text-sm flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Değerlendiriliyor...
                    </button>
                  ) : isLocked ? (
                    <div className="w-full py-3 bg-slate-100 text-slate-500 font-semibold rounded-xl text-center text-sm flex items-center justify-center gap-2 border border-slate-200">
                      <Lock className="w-4 h-4" />
                      {lockMessage}
                    </div>
                  ) : (
                    <button
                      disabled={!actualExamToPlay?.id}
                      onClick={() => navigate(`/sinav-coz/${actualExamToPlay?.id}`)}
                      className={`w-full py-3 text-white font-semibold rounded-xl shadow-sm transition-colors text-sm ${exam.btnClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Sınava Başla
                    </button>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
