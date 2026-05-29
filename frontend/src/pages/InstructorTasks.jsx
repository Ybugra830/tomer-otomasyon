import React, { useState } from 'react';
import { Target, FileText, Headphones, Video, PlayCircle, Download, CheckSquare, Square } from 'lucide-react';
import StudentSidebar from '../components/StudentSidebar';

const InstructorTasks = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      instructor: 'Haluk Hoca',
      type: 'Dinleme Egzersizi',
      typeIcon: <Headphones className="w-5 h-5 text-indigo-600" />,
      note: 'Buğra dinlemen zayıf, sınavdan önce bunu mutlaka çöz ve cevaplarını bana mesajla ilet.',
      date: '15.05.2026',
      completed: false,
      actionText: 'Ses Dosyasını Dinle',
      actionIcon: <PlayCircle className="w-4 h-4" />
    },
    {
      id: 2,
      instructor: 'Ayşe Hoca',
      type: 'Gramer Testi (PDF)',
      typeIcon: <FileText className="w-5 h-5 text-indigo-600" />,
      note: 'Geçmiş zaman konularını pekiştirmen için hazırladığım bu 20 soruluk testi çözmelisin.',
      date: '14.05.2026',
      completed: true,
      actionText: 'PDF İndir',
      actionIcon: <Download className="w-4 h-4" />
    },
    {
      id: 3,
      instructor: 'Haluk Hoca',
      type: 'Konuşma Pratiği Videosu',
      typeIcon: <Video className="w-5 h-5 text-indigo-600" />,
      note: 'Telaffuz hataların için bu videodaki diyalogları aynaya baka baka tekrar etmeni istiyorum.',
      date: '12.05.2026',
      completed: false,
      actionText: 'Videoyu İzle',
      actionIcon: <PlayCircle className="w-4 h-4" />
    }
  ]);

  const toggleCompletion = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
      
      {/* Sol Menü */}
      <StudentSidebar />

      {/* Ana İçerik */}
      <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto relative">
        <div className="max-w-4xl mx-auto">
          
          {/* Sayfa Başlığı */}
          <div className="mb-8 flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-2xl">
              <Target className="w-8 h-8 text-indigo-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Eğitmen Görevleri <span className="text-indigo-600 font-medium">(Bana Özel)</span></h1>
              <p className="text-slate-500 mt-1">Hocalarınız tarafından eksiklerinizi gidermeniz için size özel atanan materyaller.</p>
            </div>
          </div>

          {/* Görev Listesi */}
          <div className="space-y-5">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className={`relative flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl border transition-all ${
                  task.completed 
                    ? 'bg-slate-50 border-slate-200 opacity-75' 
                    : 'bg-indigo-50 border-indigo-100 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Sol Taraf: Görev Bilgileri */}
                <div className="flex items-start gap-4 mb-4 md:mb-0 w-full md:w-2/3">
                  <div className="mt-1 bg-white p-2.5 rounded-xl border border-indigo-100 shadow-sm shrink-0">
                    {task.typeIcon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-800">{task.instructor}</span>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-100/50 px-2 py-0.5 rounded-md">{task.type}</span>
                    </div>
                    <p className={`text-sm mb-3 ${task.completed ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                      "{task.note}"
                    </p>
                    <div className="text-xs font-bold text-slate-400">
                      Atanma Tarihi: {task.date}
                    </div>
                  </div>
                </div>

                {/* Sağ Taraf: Aksiyonlar */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 md:pl-6 md:border-l border-indigo-100/50">
                  <button className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                    task.completed
                      ? 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                  }`}>
                    {task.actionIcon}
                    {task.actionText}
                  </button>
                  
                  <button 
                    onClick={() => toggleCompletion(task.id)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-colors ${
                      task.completed 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {task.completed ? <CheckSquare className="w-5 h-5 text-emerald-600" /> : <Square className="w-5 h-5 text-slate-400" />}
                    {task.completed ? 'Tamamlandı' : 'Tamamla'}
                  </button>
                </div>

                {/* Yeni Etiketi */}
                {!task.completed && (
                  <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                    YENİ
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
};

export default InstructorTasks;
