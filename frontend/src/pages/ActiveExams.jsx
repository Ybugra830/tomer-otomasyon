import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
import { Clock, Calendar, CheckCircle, AlertCircle, ChevronRight, FileText, Zap, Lock, Loader2 } from 'lucide-react';
import { getMyPendingExams } from '../services/TomerApi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ActiveExams = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('Bekleyen');
  const [pendingExams, setPendingExams] = useState([]);
  const [availableExams, setAvailableExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. KULLANICI İSMİNİN DİNAMİKLEŞTİRİLMESİ
  const authUser = user?.user || user;
  const studentName = (() => {
    if (authUser?.first_name && authUser?.last_name) return `${authUser.first_name} ${authUser.last_name}`;
    if (authUser?.ad && authUser?.soyad) return `${authUser.ad} ${authUser.soyad}`;
    if (authUser?.first_name) return authUser.first_name;
    if (authUser?.username) return authUser.username;
    return localStorage.getItem('studentName') || 'Öğrenci';
  })();

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('access')}`
  });

  // VERİTABANINDAN SINAVLARI ÇEKME
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [assignmentData, availableData] = await Promise.all([
          getMyPendingExams(),
          axios.get('http://127.0.0.1:8000/api/exams/student/available-exams/', { headers: getAuthHeader() }).then(r => r.data).catch(() => [])
        ]);
        setPendingExams(assignmentData);
        setAvailableExams(availableData);
      } catch (error) {
        console.error('Sınav verileri alınamadı:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // 2. FILTER RELAXATION & FIRST EXAM FORCING
  const placementExam = availableExams.find(e =>
    e.exam_type?.toUpperCase() === 'PLACEMENT' ||
    e.title?.toLowerCase().includes('seviye')
  ) || availableExams[0];

  const findExam = (type) => availableExams.find(e => e.exam_type?.toUpperCase() === type);
  const findAssignment = (type) => pendingExams.find(e => e.exam_type === type && e.status === 'BEKLIYOR');

  const cardTemplates = [
    { id: 'placement', examType: 'PLACEMENT', fallbackTitle: 'Seviye Tespit Sınavı', icon: Zap, iconBg: 'bg-violet-50', iconColor: 'text-violet-500', borderColor: 'border-violet-100' },
    { id: 'grammar', examType: 'GRAMMAR', fallbackTitle: 'Gramer Sınavı', icon: FileText, iconBg: 'bg-blue-50', iconColor: 'text-blue-500', borderColor: 'border-blue-100' },
    { id: 'reading', examType: 'READING', fallbackTitle: 'Okuma Sınavı', icon: FileText, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', borderColor: 'border-emerald-100' },
    { id: 'listening', examType: 'LISTENING', fallbackTitle: 'Dinleme Sınavı', icon: FileText, iconBg: 'bg-amber-50', iconColor: 'text-amber-500', borderColor: 'border-amber-100' },
  ];

  const examCards = cardTemplates.map(tpl => {
    const exam = tpl.examType === 'PLACEMENT' ? placementExam : findExam(tpl.examType);
    const assignment = findAssignment(tpl.examType);

    let hasExam = !!exam;

    return {
      ...tpl,
      title: exam ? exam.title : tpl.fallbackTitle,
      duration: exam ? exam.duration : null,
      totalQuestions: exam ? exam.total_questions : null,
      level: exam ? exam.level : null,
      passingScore: exam ? exam.passing_score : null,
      isAssigned: !!assignment,
      isAvailable: hasExam,
      assignmentData: assignment,
      examId: exam ? exam.id : null,
    };
  });

  const completedExams = pendingExams.filter(e => e.status === 'TAMAMLANDI');
  const filteredCards = activeTab === 'Bekleyen' ? examCards : [];

  const renderBadge = (isAvailable, isAssigned, statusVal) => {
    if (statusVal === 'TAMAMLANDI') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm border border-emerald-100">
          <CheckCircle className="w-3.5 h-3.5" /> Tamamlandı
        </span>
      );
    }
    if (isAvailable || isAssigned) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-600 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm border border-violet-100">
          <AlertCircle className="w-3.5 h-3.5" /> Hazır
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm border border-slate-200">
        <Lock className="w-3.5 h-3.5" /> Kilitli
      </span>
    );
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
      <StudentSidebar />

      <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-8">

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Aktif Sınavlarım</h1>
              <p className="text-slate-500 mt-1">
                Hoş geldin, <span className="font-semibold text-indigo-600">{studentName}</span>! Gireceğiniz sınavları ve geçmiş sonuçlarınızı buradan takip edebilirsiniz.
              </p>
            </div>
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button onClick={() => setActiveTab('Bekleyen')} className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'Bekleyen' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Bekleyen</button>
              <button onClick={() => setActiveTab('Tamamlananlar')} className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'Tamamlananlar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Tamamlananlar</button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Loader2 className="w-10 h-10 text-indigo-500 mx-auto mb-4 animate-spin" />
              <p className="text-slate-500 font-medium">Sınavlarınız yükleniyor...</p>
            </div>
          ) : activeTab === 'Tamamlananlar' ? (
            <div className="space-y-4">
              {completedExams.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700">Henüz tamamlanan sınav yok</h3>
                  <p className="text-slate-500">Tamamladığınız sınavlar burada listelenecektir.</p>
                </div>
              ) : (
                completedExams.map((exam) => (
                  <div key={exam.assignment_id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100"><CheckCircle className="w-8 h-8 text-emerald-500" /></div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{exam.title}</h3>
                      <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /><span>{exam.duration} dk</span></div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                      {renderBadge(false, true, 'TAMAMLANDI')}
                      <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors text-sm bg-slate-100 text-slate-600 hover:bg-slate-200">Sonucu Gör <ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCards.map((card) => (
                <div key={card.id} className={`bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center gap-6 group ${card.borderColor}`}>
                  <div className={`w-16 h-16 ${card.iconBg} rounded-xl flex items-center justify-center shrink-0 border ${card.borderColor}`}>
                    <card.icon className={`w-8 h-8 ${card.iconColor}`} />
                  </div>

                  <div className="flex-grow min-w-0">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      {card.examType === 'PLACEMENT' ? (placementExam?.title || card.title) : card.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500 font-medium">

                      {/* DİNAMİK SÜRE: PLACEMENT özel bindirmesi */}
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>
                          {card.examType === 'PLACEMENT'
                            ? (placementExam?.duration ? `${placementExam.duration} dk` : '--')
                            : (card.duration ? `${card.duration} dk` : '--')}
                        </span>
                      </div>

                      {/* DİNAMİK SORU SAYISI: PLACEMENT özel bindirmesi */}
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>
                          {card.examType === 'PLACEMENT'
                            ? (placementExam?.total_questions ? `${placementExam.total_questions} Soru` : '--')
                            : (card.totalQuestions ? `${card.totalQuestions} Soru` : '--')}
                        </span>
                      </div>

                      {card.level && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-md border border-blue-100">
                          {card.level}
                        </span>
                      )}

                      {card.passingScore && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-slate-400" />
                          <span>Geçme: %{card.passingScore}</span>
                        </div>
                      )}

                      {card.isAssigned && card.assignmentData && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>Atandı: {new Date(card.assignmentData.assigned_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SAĞ TARAF: BUTON VE KİLİT MEKANİZMASI */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                    {renderBadge(card.isAvailable, card.isAssigned, card.assignmentData?.status)}

                    {/* BUTON: VERİTABANINDAN CANLI ID YÖNLENDİRMESİ */}
                    <button
                      disabled={!(card.isAvailable || card.isAssigned) || (card.examType === 'PLACEMENT' && !placementExam?.id) || (card.examType !== 'PLACEMENT' && !card.examId)}
                      onClick={() => {
                        if (card.examType === 'PLACEMENT' && placementExam?.id) {
                          navigate('/sinav-coz/' + placementExam.id);
                        } else if (card.examId) {
                          navigate('/sinav-coz/' + card.examId);
                        }
                      }}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all text-sm shadow-sm ${(card.isAvailable || card.isAssigned)
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                        }`}
                    >
                      {(card.isAvailable || card.isAssigned) ? (
                        <>Sınava Başla <ChevronRight className="w-4 h-4" /></>
                      ) : (
                        <><Lock className="w-4 h-4" />Sınav Atanması Bekleniyor</>
                      )}
                    </button>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ActiveExams;
