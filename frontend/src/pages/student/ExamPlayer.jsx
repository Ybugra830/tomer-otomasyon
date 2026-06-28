import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ChevronRight, AlertCircle, Clock, Volume2, BookOpen } from 'lucide-react';

const ExamPlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { question_id: selected_option }
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const getAuthHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('access')}`
    });

    useEffect(() => {
        const fetchExamData = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/exams/student/get-exam-questions/${id}/`, {
                    headers: getAuthHeader()
                });

                setExam(response.data.exam);
                const fetchedQuestions = response.data.questions || [];
                // KESİNLİKLE DOĞRU CEVAPLARI GİZLE (Frontend tarafında objeden kaldırıyoruz ki yanlışlıkla sızmasın)
                const sanitizedQuestions = fetchedQuestions.map(q => {
                    const safeQ = { ...q };
                    delete safeQ.correct_answer;
                    return safeQ;
                });
                setQuestions(sanitizedQuestions);

                if (response.data.exam && response.data.exam.duration) {
                    setTimeLeft(response.data.exam.duration * 60);
                }
            } catch (err) {
                console.error(err);
                setError('Sınav verileri yüklenirken bir sorun oluştu.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchExamData();
    }, [id]);

    // Timer logic
    useEffect(() => {
        let timer;
        if (!isLoading && !error && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmitExam();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isLoading, error, timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (option) => {
        const qId = questions[currentQuestionIndex].id;
        setAnswers(prev => ({ ...prev, [qId]: option }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleSubmitExam();
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmitExam = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        // answers format: list of obj { question_id, selected_option }
        const answersList = Object.keys(answers).map(qId => ({
            question_id: parseInt(qId),
            selected_option: answers[qId]
        }));

        try {
            await axios.post(`http://127.0.0.1:8000/api/exams/submit-static-exam/${id}/`, {
                exam_id: id,
                answers: answersList
            }, {
                headers: getAuthHeader()
            });
            navigate('/aktif-sinavlarim');
        } catch (err) {
            console.error(err);
            setError('Sınav gönderilirken bir hata oluştu.');
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-800">Sınav Yükleniyor...</h2>
                </div>
            </div>
        );
    }

    if (error || !exam || questions.length === 0) {
        return (
            <div className="w-full max-w-3xl mx-auto flex items-center justify-center min-h-[50vh]">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Başarısız</h2>
                    <p className="text-slate-600 mb-6">{error || 'Bu sınavda henüz soru bulunmuyor.'}</p>
                    <button
                        onClick={() => navigate('/aktif-sinavlarim')}
                        className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold"
                    >
                        Geri Dön
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const currentQId = currentQuestion.id;
    const selectedOption = answers[currentQId];
    const isListening = currentQuestion.question_type === 'LISTENING' && currentQuestion.audio_file;

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col h-[88vh] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            {/* Top Bar */}
            <div className="bg-white border-b border-slate-200 shrink-0">
                <div className="h-1.5 bg-slate-100">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all rounded-r-full"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
                <div className="px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="font-bold text-slate-800 text-lg">{exam.title}</h1>
                        <p className="text-sm text-slate-500">Soru {currentQuestionIndex + 1} / {questions.length}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold border ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                        <Clock className="w-4 h-4" />
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                {/* Reading Panel */}
                {currentQuestion.is_reading && currentQuestion.reading_text && (
                    <div className="md:w-1/2 p-6 bg-emerald-50/30 md:border-r border-slate-200 overflow-y-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="w-5 h-5 text-emerald-600" />
                            <h3 className="font-bold text-emerald-800">Okuma Parçası</h3>
                        </div>
                        <div className="bg-white rounded-xl p-5 border border-emerald-100">
                            <p className="text-slate-700 whitespace-pre-wrap">{currentQuestion.reading_text}</p>
                        </div>
                    </div>
                )}

                {/* Question Panel */}
                <div className={`p-6 md:p-8 bg-slate-50/50 overflow-y-auto flex flex-col ${currentQuestion.is_reading ? 'md:w-1/2' : 'w-full max-w-3xl mx-auto'}`}>
                    <h2 className="text-xl font-bold text-slate-800 mb-6">{currentQuestion.text}</h2>

                    {isListening && (
                        <div className="mb-6 bg-amber-50 rounded-xl p-4 flex items-center gap-4 border border-amber-200">
                            <Volume2 className="w-6 h-6 text-amber-600 shrink-0" />
                            <audio controls src={currentQuestion.audio_file} className="w-full h-10 preload-auto">
                                Tarayıcı desteği yok.
                            </audio>
                        </div>
                    )}

                    <div className="space-y-3 flex-grow">
                        {currentQuestion.question_type === 'WRITING' || (!currentQuestion.option_a && !currentQuestion.option_b) ? (
                            <textarea
                                className="w-full h-64 p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 bg-white text-slate-700 whitespace-pre-wrap resize-none transition-all"
                                placeholder="Kompozisyonunuzu veya cevabınızı buraya yazınız..."
                                value={answers[currentQuestion.id] || ''}
                                onChange={(e) => handleOptionSelect(e.target.value)}
                            />
                        ) : (
                            ['A', 'B', 'C', 'D'].map((opt) => {
                                const optText = currentQuestion[`option_${opt.toLowerCase()}`];
                                if (!optText) return null;
                                const isSelected = selectedOption === opt;

                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleOptionSelect(opt)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${isSelected ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
                                    >
                                        <span className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {opt}
                                        </span>
                                        <span className="text-slate-700 mt-0.5">{optText}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <div className="mt-8 flex justify-between shrink-0">
                        <button
                            onClick={handlePrev}
                            disabled={currentQuestionIndex === 0}
                            className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold disabled:opacity-50"
                        >
                            Önceki
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2"
                        >
                            {isSubmitting ? 'Gönderiliyor...' : (isLastQuestion ? 'Sınavı Bitir' : 'Sonraki Soru')}
                            {!isLastQuestion && <ChevronRight className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamPlayer;
