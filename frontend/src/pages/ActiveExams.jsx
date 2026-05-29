import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
import { Clock, Calendar, CheckCircle, AlertCircle, ChevronRight, FileText, Zap, Lock, Loader2 } from 'lucide-react';
import { getMyPendingExams } from '../services/TomerApi';

const ActiveExams = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Bekleyen');
  const [pendingExams, setPendingExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Backend'den atanmış sınavları çek
  useEffect(() => {
    const fetchAssignments = async () => {
      setIsLoading(true);
      try {
        const data = await getMyPendingExams();
        setPendingExams(data);
      } catch (error) {
        console.error('Sınav atamaları alınamadı:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  // Seviye Tespit sınavı var mı kontrol et
  const placementExam = pendingExams.find(e => e.exam_type === 'PLACEMENT' && e.status === 'BEKLIYOR');

  // Sınav kartları listesi oluştur
  const examCards = [
    {
      id: 'placement',
      title: 'Seviye Tespit Sınavı',
      icon: Zap,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-500',
      borderColor: 'border-violet-100',
      duration: placementExam ? `${placementExam.duration} Dakika` : '60 Dakika',
      isAssigned: !!placementExam,
      assignmentData: placementExam,
      examType: 'PLACEMENT',
      route: '/sinav/seviye-tespit',
    },
    {
      id: 'grammar',
      title: 'Gramer Sınavı',
      icon: FileText,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-100',
      duration: '45 Dakika',
      isAssigned: !!pendingExams.find(e => e.exam_type === 'GRAMMAR' && e.status === 'BEKLIYOR'),
      assignmentData: pendingExams.find(e => e.exam_type === 'GRAMMAR' && e.status === 'BEKLIYOR'),
      examType: 'GRAMMAR',
      route: null,
    },
    {
      id: 'reading',
      title: 'Okuma Sınavı',
      icon: FileText,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      borderColor: 'border-emerald-100',
      duration: '30 Dakika',
      isAssigned: !!pendingExams.find(e => e.exam_type === 'READING' && e.status === 'BEKLIYOR'),
      assignmentData: pendingExams.find(e => e.exam_type === 'READING' && e.status === 'BEKLIYOR'),
      examType: 'READING',
      route: null,
    },
    {
      id: 'listening',
      title: 'Dinleme Sınavı',
      icon: FileText,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      borderColor: 'border-amber-100',
      duration: '30 Dakika',
      isAssigned: !!pendingExams.find(e => e.exam_type === 'LISTENING' && e.status === 'BEKLIYOR'),
      assignmentData: pendingExams.find(e => e.exam_type === 'LISTENING' && e.status === 'BEKLIYOR'),
      examType: 'LISTENING',
      route: null,
    },
  ];

  // Tamamlanmış sınavlar
  const completedExams = pendingExams.filter(e => e.status === 'TAMAMLANDI');

  // Tab filtreleme
  const filteredCards = activeTab === 'Bekleyen' ? examCards : [];

  // Status Badge Render Function
  const renderBadge = (isAssigned, status) => {
    if (status === 'TAMAMLANDI') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm border border-emerald-100">
          <CheckCircle className="w-3.5 h-3.5" />
          Tamamlandı
        </span>
      );
    }
    if (isAssigned) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-600 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm border border-violet-100">
          <AlertCircle className="w-3.5 h-3.5" />
          Hazır
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm border border-slate-200">
        <Lock className="w-3.5 h-3.5" />
        Kilitli
      </span>
    );
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">

      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header & Tabs */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Aktif Sınavlarım</h1>
              <p className="text-slate-500 mt-1">Gireceğiniz sınavları ve geçmiş sonuçlarınızı buradan takip edebilirsiniz.</p>
            </div>

            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveTab('Bekleyen')}
                className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'Bekleyen'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                Bekleyen
              </button>
              <button
                onClick={() => setActiveTab('Tamamlananlar')}
                className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'Tamamlananlar'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                Tamamlananlar
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Loader2 className="w-10 h-10 text-indigo-500 mx-auto mb-4 animate-spin" />
              <p className="text-slate-500 font-medium">Sınavlarınız yükleniyor...</p>
            </div>
          ) : activeTab === 'Tamamlananlar' ? (
            /* Tamamlananlar Tab */
            <div className="space-y-4">
              {completedExams.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700">Henüz tamamlanan sınav yok</h3>
                  <p className="text-slate-500">Tamamladığınız sınavlar burada listelenecektir.</p>
                </div>
              ) : (
                completedExams.map((exam) => (
                  <div
                    key={exam.assignment_id}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6"
                  >
                    <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{exam.title}</h3>
                      <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{exam.duration} Dakika</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                      {renderBadge(true, 'TAMAMLANDI')}
                      <button
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors text-sm bg-slate-100 text-slate-600 hover:bg-slate-200"
                      >
                        Sonucu Gör
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Bekleyen Tab - Sınav Kartları */
            <div className="space-y-4">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className={`bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center gap-6 group ${card.borderColor}`}
                >
                  {/* Left: Icon */}
                  <div className={`w-16 h-16 ${card.iconBg} rounded-xl flex items-center justify-center shrink-0 border ${card.borderColor}`}>
                    <card.icon className={`w-8 h-8 ${card.iconColor}`} />
                  </div>

                  {/* Middle: Details */}
                  <div className="flex-grow min-w-0">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{card.title}</h3>
                    <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{card.duration}</span>
                      </div>
                      {card.isAssigned && card.assignmentData && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>Atandı: {new Date(card.assignmentData.assigned_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Badge & Button */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                    {renderBadge(card.isAssigned, card.assignmentData?.status)}

                    {card.isAssigned ? (
                      <button
                        onClick={() => {
                          if (card.route) {
                            navigate(card.route, { state: { assignment_id: card.assignmentData?.assignment_id } });
                          }
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                      >
                        Sınava Başla
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                      >
                        <Lock className="w-4 h-4" />
                        Sınav Atanması Bekleniyor
                      </button>
                    )}
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
