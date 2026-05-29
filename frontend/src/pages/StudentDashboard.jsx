import React from 'react';
import { useSelector } from 'react-redux';
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
  const ogrenciDurumu = useSelector((state) => state.student.ogrenciDurumu);
  const kisiselBilgiler = useSelector((state) => state.student.kisiselBilgiler);
  
  const sinavDurumlari = ogrenciDurumu.sinavDurumlari;
  const studentName = kisiselBilgiler?.adSoyad || 'Öğrenci';

  // Duruma göre renkli rozetleri (badge) render eden yardımcı fonksiyon
  const renderBadge = (durum) => {
    if (durum === 'bekliyor') {
      return <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">Bekliyor</span>;
    }
    if (durum === 'kilitli') {
      return <span className="px-3 py-1 bg-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">Kilitli</span>;
    }
    if (durum === 'tamamlandi') {
      return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">Tamamlandı</span>;
    }
  };

  // Sınav modüllerinin listesi
  const exams = [
    {
      id: 'seviyeTespit',
      title: 'Seviye Tespit Sınavı',
      desc: 'Çoktan seçmeli sorulardan oluşan seviye tespit sınavı. Bu modül diğer beceri sınavlarından önce tamamlanmalıdır.',
      time: '60 Dakika',
      questions: '50 Soru',
      icon: <FileText className="w-7 h-7" />,
      colorClass: 'bg-blue-100 text-blue-600',
      btnClass: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'anaTest',
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
      
      {/* Extract Edilmiş Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto">
        <div className="max-w-5xl mx-auto">
          
          {/* Top Banner & Stats */}
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
                <span className="font-semibold text-slate-700">{ogrenciDurumu.kesinSeviye || 'Belirlenmedi'}</span>
              </div>
            </div>
          </div>

          {/* Exam Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam) => {
              const durum = sinavDurumlari[exam.id];
              const isLocked = durum === 'kilitli';

              return (
                <div 
                  key={exam.id} 
                  className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full transition-all relative ${isLocked ? 'opacity-70 bg-slate-50/50' : 'hover:shadow-md'}`}
                >
                  {/* Status Badge */}
                  <div className="absolute top-6 right-6">
                    {renderBadge(durum)}
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4 pr-24">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isLocked ? 'bg-slate-200 text-slate-400' : exam.colorClass}`}>
                      {exam.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{exam.title}</h3>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-4 flex-grow">{exam.desc}</p>
                  
                  {/* Exam Details (Time & Questions) */}
                  <div className="flex items-center gap-5 text-sm text-slate-500 mb-6 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {exam.time}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      {exam.questions}
                    </div>
                  </div>

                  {/* Action Button */}
                  {isLocked ? (
                    <div className="w-full py-3 bg-slate-100 text-slate-500 font-semibold rounded-xl text-center text-sm flex items-center justify-center gap-2 border border-slate-200">
                      <Lock className="w-4 h-4" />
                      Önce Seviye Tespit Sınavını Tamamlayın
                    </div>
                  ) : (
                    <button className={`w-full py-3 text-white font-semibold rounded-xl shadow-sm transition-colors text-sm ${exam.btnClass}`}>
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
