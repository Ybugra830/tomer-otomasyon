import React, { useState, useEffect } from 'react';
import { Target, FileText, Headphones, Video, PlayCircle, Download, CheckSquare, Square, Loader2 } from 'lucide-react';
import StudentSidebar from '../components/StudentSidebar';
import axios from 'axios';

const InstructorTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const getAuthHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('access')}`
    });

    // ─── Görevleri API'den çek ───
    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/education/student/tasks/', {
                    headers: getAuthHeader()
                });
                setTasks(res.data);
            } catch (err) {
                console.error('Görevler çekilemedi:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasks();
    }, []);

    // ─── Tamamla / Geri Al toggle ───
    const toggleTaskCompletion = async (taskId, currentStatus) => {
        const newStatus = !currentStatus;

        // Optimistic UI: anında güncelle
        setTasks(prev =>
            prev.map(t => (t.id === taskId ? { ...t, is_completed: newStatus } : t))
        );

        try {
            await axios.patch(
                'http://127.0.0.1:8000/api/education/student/tasks/',
                { task_id: taskId, is_completed: newStatus },
                { headers: getAuthHeader() }
            );
        } catch (err) {
            console.error('Durum güncellenemedi:', err);
            // Hata olursa eski duruma dön
            setTasks(prev =>
                prev.map(t => (t.id === taskId ? { ...t, is_completed: currentStatus } : t))
            );
        }
    };

    // ─── Görev tipine göre tema ───
    const getTheme = (taskType) => {
        const t = (taskType || '').toLowerCase();

        if (t.includes('audio') || t.includes('mp3') || t.includes('ses') || t.includes('dinleme')) {
            return {
                icon: <Headphones className="w-5 h-5 text-purple-600" />,
                actionIcon: <PlayCircle className="w-4 h-4" />,
                actionText: 'Ses Dosyasını Dinle',
                cardBg: 'bg-purple-50 border-purple-200',
                badgeBg: 'bg-purple-100 text-purple-700',
                btnBg: 'bg-purple-600 hover:bg-purple-700',
            };
        }

        if (t.includes('video') || t.includes('mp4') || t.includes('izle')) {
            return {
                icon: <Video className="w-5 h-5 text-blue-600" />,
                actionIcon: <PlayCircle className="w-4 h-4" />,
                actionText: 'Videoyu İzle',
                cardBg: 'bg-blue-50 border-blue-200',
                badgeBg: 'bg-blue-100 text-blue-700',
                btnBg: 'bg-blue-600 hover:bg-blue-700',
            };
        }

        // PDF / Doküman (varsayılan)
        return {
            icon: <FileText className="w-5 h-5 text-amber-600" />,
            actionIcon: <Download className="w-4 h-4" />,
            actionText: 'Dokümanı İndir',
            cardBg: 'bg-amber-50 border-amber-200',
            badgeBg: 'bg-amber-100 text-amber-700',
            btnBg: 'bg-amber-600 hover:bg-amber-700',
        };
    };

    // ═══════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════
    return (
        <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">

            <StudentSidebar />

            <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto relative">
                <div className="max-w-4xl mx-auto">

                    {/* Başlık */}
                    <div className="mb-8 flex items-center gap-4">
                        <div className="bg-indigo-100 p-3 rounded-2xl">
                            <Target className="w-8 h-8 text-indigo-700" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">
                                Eğitmen Görevleri <span className="text-indigo-600 font-medium">(Bana Özel)</span>
                            </h1>
                            <p className="text-slate-500 mt-1">
                                Hocalarınız tarafından eksiklerinizi gidermeniz için size özel atanan materyaller.
                            </p>
                        </div>
                    </div>

                    {/* İçerik */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <p className="font-semibold">Görevler yükleniyor...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                <Target className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">Harikasınız! 🎉</h3>
                            <p className="text-slate-500">Size atanmış yeni bir eğitmen görevi bulunmuyor.</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {tasks.map((task) => {
                                const theme = getTheme(task.task_type);
                                const done = task.is_completed;

                                return (
                                    <div
                                        key={task.id}
                                        className={`relative flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl border transition-all duration-300 ${done
                                                ? 'bg-slate-50 border-slate-200 opacity-80'
                                                : `${theme.cardBg} shadow-sm hover:shadow-md`
                                            }`}
                                    >
                                        {/* Sol: Bilgiler */}
                                        <div className="flex items-start gap-4 mb-4 md:mb-0 w-full md:w-2/3">
                                            <div className={`mt-1 p-2.5 rounded-xl border shadow-sm shrink-0 ${done ? 'bg-slate-100 border-slate-200' : 'bg-white border-slate-100'}`}>
                                                {done ? <Target className="w-5 h-5 text-slate-400" /> : theme.icon}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className={`text-sm font-bold ${done ? 'text-slate-500' : 'text-slate-800'}`}>
                                                        {task.instructor_name}
                                                    </span>
                                                    <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md tracking-wide ${done ? 'bg-slate-100 text-slate-500' : theme.badgeBg}`}>
                                                        {task.task_type}
                                                    </span>
                                                </div>
                                                <h4 className={`text-base font-bold mb-1 ${done ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                                    {task.title}
                                                </h4>
                                                {task.message && (
                                                    <p className={`text-sm mb-3 ${done ? 'text-slate-400' : 'text-slate-600 font-medium leading-relaxed'}`}>
                                                        "{task.message}"
                                                    </p>
                                                )}
                                                <div className="text-xs font-bold text-slate-400">
                                                    Atanma Tarihi: <span className="font-semibold">{task.created_at}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sağ: Butonlar */}
                                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 md:pl-6 md:border-l border-slate-100">
                                            {/* Dosya Butonu */}
                                            {task.file_url ? (
                                                <a
                                                    href={task.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${done
                                                            ? 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                                            : `${theme.btnBg} text-white hover:shadow-md`
                                                        }`}
                                                >
                                                    {theme.actionIcon}
                                                    {theme.actionText}
                                                </a>
                                            ) : (
                                                <span className="text-sm text-slate-400 italic font-medium px-3">Dosya yok</span>
                                            )}

                                            {/* Tamamla Butonu */}
                                            <button
                                                onClick={() => toggleTaskCompletion(task.id, task.is_completed)}
                                                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all duration-300 ${done
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {done
                                                    ? <CheckSquare className="w-5 h-5 text-emerald-600" />
                                                    : <Square className="w-5 h-5 text-slate-400" />
                                                }
                                                {done ? 'Tamamlandı' : 'Tamamla'}
                                            </button>
                                        </div>

                                        {/* YENİ Badge */}
                                        {!done && (
                                            <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                                                YENİ
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default InstructorTasks;
