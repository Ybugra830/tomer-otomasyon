import React, { useState } from 'react';
import InstructorSidebar from './InstructorSidebar';
import { ClipboardCheck, FileText, CheckCircle, X, Headphones, Edit3 } from 'lucide-react';

const mockPapers = [
  { id: 1, studentName: 'Yaşar Buğra Erbay', examType: 'B1 Yazma Sınavı', date: '16 Mayıs 2026', type: 'text', content: "My favorite holiday is going to the beach. I love swimming in the sea and eating ice cream every day. The weather is always sunny and perfect for relaxing." },
  { id: 2, studentName: 'Ahmet Yılmaz', examType: 'A2 Konuşma Sınavı', date: '15 Mayıs 2026', type: 'audio', content: "audio_recording_001.mp3" },
  { id: 3, studentName: 'Ayşe Kaya', examType: 'C1 Yazma Sınavı', date: '14 Mayıs 2026', type: 'text', content: "Global warming is one of the most pressing issues of our time. It requires immediate action from all nations to reduce carbon emissions and invest in renewable energy sources." }
];

const InstructorEvaluation = () => {
  const [selectedPaper, setSelectedPaper] = useState(null);

  const handleSaveEvaluation = (e) => {
    e.preventDefault();
    alert("Not kaydedildi ve öğrenciye iletildi!");
    setSelectedPaper(null);
  };

  return (
    <div className="flex min-h-[85vh] bg-slate-50 w-full relative z-10">
      <InstructorSidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8 text-indigo-600" />
              Okunmayı Bekleyen Sınav ve Ödevler
            </h1>
            <p className="text-slate-500 mt-2 text-sm">Öğrencilerinizin kompozisyon ve ses kayıtlarını manuel olarak puanlayın.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Bekleyen Kağıtlar</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Öğrenci Adı</th>
                    <th className="px-6 py-4">Sınav / Ödev Türü</th>
                    <th className="px-6 py-4">Teslim Tarihi</th>
                    <th className="px-6 py-4 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockPapers.map((paper) => (
                    <tr key={paper.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{paper.studentName}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2">
                          {paper.type === 'text' ? <FileText className="w-4 h-4 text-slate-400" /> : <Headphones className="w-4 h-4 text-slate-400" />}
                          {paper.examType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{paper.date}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedPaper(paper)}
                          className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold rounded-lg transition-colors flex items-center gap-2 ml-auto"
                        >
                          <Edit3 className="w-4 h-4" />
                          Değerlendir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Değerlendirme Modalı */}
      {selectedPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
              <div>
                <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5" />
                  Değerlendirme Ekranı
                </h3>
                <p className="text-sm text-indigo-700/80 font-medium mt-1">
                  {selectedPaper.studentName} - {selectedPaper.examType}
                </p>
              </div>
              <button onClick={() => setSelectedPaper(null)} className="p-2 text-indigo-600/60 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row overflow-hidden flex-1">
              {/* Öğrenci Yanıtı Alanı */}
              <div className="w-full md:w-1/2 border-r border-slate-100 p-6 bg-slate-50/50 overflow-y-auto flex flex-col">
                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  {selectedPaper.type === 'text' ? <FileText className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
                  Öğrenci Yanıtı
                </h4>
                
                {selectedPaper.type === 'text' ? (
                  <div className="p-4 bg-slate-200/50 rounded-xl border border-slate-200 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap flex-1 overflow-y-auto">
                    {selectedPaper.content}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 bg-white">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Headphones className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="font-bold text-slate-800">{selectedPaper.content}</p>
                    <p className="text-xs text-slate-500 mt-1">Ses kaydını dinlemek için oynatın</p>
                    <div className="w-full h-2 bg-slate-200 rounded-full mt-6 relative">
                       <div className="absolute left-0 top-0 h-full bg-blue-500 rounded-full w-1/3"></div>
                       <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-700 rounded-full shadow"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Puanlama Alanı */}
              <div className="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col">
                <form onSubmit={handleSaveEvaluation} className="space-y-6 flex flex-col h-full">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Sınav Puanı (0-100)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100"
                      required
                      placeholder="Örn: 85" 
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800 text-xl font-bold"
                    />
                  </div>

                  <div className="flex-1 flex flex-col min-h-[200px]">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Eğitmen Geri Bildirimi</label>
                    <textarea 
                      required
                      placeholder='Örn: "Gramer hatalarına dikkat etmelisin. Özellikle geçmiş zaman kiplerinde..."'
                      className="w-full flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800 resize-none"
                    ></textarea>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-auto">
                    <button type="submit" className="w-full px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Notu Kaydet ve Öğrenciye Gönder
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default InstructorEvaluation;
