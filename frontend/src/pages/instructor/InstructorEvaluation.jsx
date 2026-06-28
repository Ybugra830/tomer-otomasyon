import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InstructorSidebar from './InstructorSidebar';

const InstructorEvaluation = () => {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState({}); // Her answer_id için loading durumu

  // Bekleyen yazma sınavlarını backend'den çekiyoruz
  const fetchPendingWritings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/exams/instructor/pending-writings/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('access')}`
        }
      });
      setPendingTasks(response.data);
    } catch (error) {
      console.error("Bekleyen görevler yüklenirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingWritings();
  }, []);

  // TRUE/FALSE değerlendirme tetikleyicisi
  const handleEvaluate = async (answerId, isSuccessful) => {
    setSubmitting(prev => ({ ...prev, [answerId]: true }));

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/exams/instructor/submit-grade/', {
        answer_id: answerId,
        is_writing_successful: isSuccessful
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('access')}`
        }
      });

      const data = response.data;
      alert(
        `✅ Değerlendirme Kaydedildi!\n\n` +
        `Karar: ${isSuccessful ? 'Başarılı' : 'Başarısız'}\n` +
        `Başarı Oranı: %${data.success_rate}\n` +
        `Sonuç: ${data.decision} → ${data.assigned_level}`
      );

      // Listeyi yenile ki değerlendirilen kağıt ekrandan düşsün
      fetchPendingWritings();

    } catch (error) {
      console.error("Değerlendirme gönderilirken hata oluştu:", error);
      alert("Değerlendirme kaydedilirken bir sunucu hatası meydana geldi.");
    } finally {
      setSubmitting(prev => ({ ...prev, [answerId]: false }));
    }
  };

  return (
    <div className="flex min-h-[85vh] bg-slate-50 w-full relative z-10">
      <InstructorSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Eğitmen Görev Havuzu</h1>
            <p className="text-slate-500 text-sm">Öğrencilerin gönderdiği ve değerlendirilmesi bekleyen Yazma (Writing) sınavları.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-slate-600 font-medium">Bekleyen sınav kağıtları getiriliyor...</span>
            </div>
          ) : pendingTasks.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-xl text-center font-medium">
              🎉 Harika! Şu anda okunmayı bekleyen hiçbir öğrenci kompozisyonu bulunmuyor.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {pendingTasks.map((task) => (
                <div key={task.answer_id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">

                  {/* Sol Taraf: Öğrenci ve Sınav Bilgileri */}
                  <div className="p-6 bg-slate-50 md:w-1/4 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        Yazma Sınavı
                      </span>
                      <h3 className="mt-3 font-bold text-slate-800 text-lg">{task.student_name}</h3>
                      <p className="text-slate-500 text-xs mt-1">Sınav: {task.exam_title}</p>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                      ID: #{task.answer_id}
                    </div>
                  </div>

                  {/* Orta Kısım: Öğrencinin Yazdığı Kompozisyon Metni */}
                  <div className="p-6 flex-1 bg-white">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Soru Detayı</h4>
                    <p className="text-slate-700 text-sm font-medium mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                      "{task.question_text}"
                    </p>

                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Öğrencinin Cevabı</h4>
                    <div className="text-slate-800 text-base bg-amber-50/40 p-4 rounded-xl border border-amber-100 font-serif whitespace-pre-wrap leading-relaxed shadow-inner min-h-[120px]">
                      {task.text_answer || <span className="text-slate-400 italic">Öğrenci bu alanı boş bırakmış.</span>}
                    </div>
                  </div>

                  {/* Sağ Taraf: Başarılı / Başarısız Butonları */}
                  <div className="p-6 bg-slate-50/50 md:w-1/4 flex flex-col justify-center items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Değerlendirme
                    </span>
                    <button
                      disabled={submitting[task.answer_id]}
                      onClick={() => handleEvaluate(task.answer_id, true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting[task.answer_id] ? 'İşleniyor...' : '✓ Başarılı (Geçer)'}
                    </button>
                    <button
                      disabled={submitting[task.answer_id]}
                      onClick={() => handleEvaluate(task.answer_id, false)}
                      className="w-full bg-slate-300 hover:bg-red-500 hover:text-white text-slate-700 font-semibold py-3 px-4 rounded-xl text-sm transition shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting[task.answer_id] ? 'İşleniyor...' : '✗ Başarısız (Kalır)'}
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

export default InstructorEvaluation;
