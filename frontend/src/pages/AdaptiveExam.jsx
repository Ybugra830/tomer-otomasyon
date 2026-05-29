import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle, ChevronRight, BookOpen, Volume2, Shield, Zap, Award, ArrowRight, Loader2, XCircle } from 'lucide-react';
import { startExam, submitAnswer, getExamResult } from '../services/ExamApi';

// ─── Konfeti Parçacık Bileşeni ───
const ConfettiPiece = ({ delay, left }) => {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 6 + Math.random() * 8;
  const rotation = Math.random() * 360;
  const duration = 2.5 + Math.random() * 2;

  return (
    <div
      className="absolute rounded-sm"
      style={{
        left: `${left}%`,
        top: '-5%',
        width: `${size}px`,
        height: `${size * 0.6}px`,
        backgroundColor: color,
        transform: `rotate(${rotation}deg)`,
        animation: `confettiFall ${duration}s ease-in ${delay}s forwards`,
        opacity: 0,
      }}
    />
  );
};

const AdaptiveExam = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Core state
  const [examState, setExamState] = useState('loading');       // 'loading' | 'active' | 'completed' | 'error'
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionCounter, setQuestionCounter] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [currentLevel, setCurrentLevel] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [examResult, setExamResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch first question automatically on mount
  useEffect(() => {
    handleStartExam();
  }, []);

  // Fade animation
  const [questionVisible, setQuestionVisible] = useState(true);

  // Prevent accidental navigation
  useEffect(() => {
    if (examState === 'active') {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [examState]);

  // Timer logic
  useEffect(() => {
    let timer;
    if (examState === 'active' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && examState === 'active') {
      handleCompleteExam();
    }
    return () => clearInterval(timer);
  }, [examState, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartExam = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await startExam();
      setSessionId(data.session_id);
      setCurrentQuestion(data.current_question);
      setQuestionCounter(data.question_counter + 1);
      setCurrentLevel(data.current_level);
      if (data.duration) setTimeLeft(data.duration * 60);
      if (data.total_questions) setTotalQuestions(data.total_questions);
      setExamState('active');
    } catch (err) {
      setError(err.response?.data?.error || 'Sınav başlatılırken bir hata oluştu.');
      setExamState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!selectedOption || isSubmitting) return;

    setIsSubmitting(true);
    setError('');
    try {
      const data = await submitAnswer(sessionId, currentQuestion.id, selectedOption);

      if (data.status === 'completed' || data.is_finished) {
        handleCompleteExam(data);
      } else {
        // Smooth transition
        setQuestionVisible(false);
        setTimeout(() => {
          setCurrentQuestion(data.current_question);
          setQuestionCounter(data.question_counter + 1);
          setCurrentLevel(data.current_level);
          setSelectedOption('');
          setQuestionVisible(true);
        }, 300);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Cevap gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteExam = async (directResult = null) => {
    setExamState('completed');
    setShowConfetti(true);
    setIsLoading(true);

    try {
      if (directResult && directResult.final_level) {
        setExamResult({
          final_level: directResult.final_level,
          correct_answers: directResult.correct_count,
          wrong_answers: (directResult.total_questions || 0) - (directResult.correct_count || 0),
          total_questions: directResult.total_questions,
        });
      } else if (sessionId) {
        const resultData = await getExamResult(sessionId);
        setExamResult(resultData);
      }
    } catch (err) {
      console.error('Sonuç alma hatası:', err);
    } finally {
      setIsLoading(false);
    }

    // 5 saniye sonra UZEM paneline yönlendir
    setTimeout(() => {
      navigate('/aktif-sinavlarim');
    }, 6000);
  };

  // ────────────────────────────────────────────────
  //  LOADING / ERROR SCREEN
  // ────────────────────────────────────────────────
  if (examState === 'loading') {
    return (
      <div className="w-full max-w-3xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Sınav Yükleniyor...</h2>
          <p className="text-slate-500 mt-2">Lütfen bekleyin, sorularınız hazırlanıyor.</p>
        </div>
      </div>
    );
  }

  if (examState === 'error') {
    return (
      <div className="w-full max-w-3xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Sınav Başlatılamadı</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/aktif-sinavlarim')}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all"
          >
            Aktif Sınavlarıma Dön
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  //  ACTIVE EXAM SCREEN
  // ────────────────────────────────────────────────
  if (examState === 'active' && currentQuestion) {
    const progress = (questionCounter / totalQuestions) * 100;
    const isListening = currentQuestion.question_type === 'LISTENING' && currentQuestion.audio_file;

    return (
      <div className="w-full max-w-5xl mx-auto flex flex-col h-[88vh] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 shrink-0">
          {/* Progress Bar */}
          <div className="h-1.5 bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out rounded-r-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm border border-indigo-100">
                Soru {questionCounter} / {totalQuestions}
              </div>
              <div className="bg-violet-50 text-violet-700 px-4 py-2 rounded-lg font-bold text-sm border border-violet-100">
                Seviye: {currentLevel}
              </div>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm border ${
              timeLeft < 300 
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                : timeLeft < 600 
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          
          {/* Reading Context (Left Panel) */}
          {currentQuestion.is_reading && currentQuestion.reading_text && (
            <div className="md:w-1/2 p-6 md:p-8 bg-emerald-50/30 md:border-r border-slate-200 overflow-y-auto">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-bold text-emerald-800">Okuma Parçası</h3>
              </div>
              <div className="bg-white rounded-xl p-5 border border-emerald-100 shadow-sm">
                <div className="text-slate-700 leading-relaxed text-[15px]">
                  {currentQuestion.reading_text.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-3 last:mb-0">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Question & Options (Right or Full Panel) */}
          <div className={`p-6 md:p-8 bg-slate-50/50 overflow-y-auto flex flex-col ${
            currentQuestion.is_reading ? 'md:w-1/2' : 'w-full max-w-3xl mx-auto'
          }`}>
            
            <div className={`transition-all duration-300 ${questionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              
              {/* Question Text */}
              <h2 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">
                {currentQuestion.text}
              </h2>

              {/* Audio Player (Listening) */}
              {isListening && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <Volume2 className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs font-bold text-amber-700 mb-1.5 uppercase tracking-wider">Ses Kaydını Dinleyin</p>
                    <audio
                      controls
                      src={currentQuestion.audio_file}
                      className="w-full h-10"
                      preload="auto"
                    >
                      Tarayıcınız ses oynatmayı desteklemiyor.
                    </audio>
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="space-y-3 flex-grow">
                {['A', 'B', 'C', 'D'].map((option) => {
                  const optionText = currentQuestion[`option_${option.toLowerCase()}`];
                  if (!optionText) return null;
                  
                  return (
                    <button
                      key={option}
                      onClick={() => setSelectedOption(option)}
                      disabled={isSubmitting}
                      className={`w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all duration-200 flex items-start gap-4 group ${
                        selectedOption === option
                          ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                          : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-sm'
                      } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <span className={`flex items-center justify-center w-9 h-9 rounded-xl font-bold shrink-0 transition-all text-sm ${
                        selectedOption === option
                          ? 'bg-indigo-600 text-white scale-110'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                      }`}>
                        {option}
                      </span>
                      <span className="text-slate-700 mt-1 leading-relaxed">
                        {optionText}
                      </span>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end shrink-0">
              <button
                onClick={handleNextQuestion}
                disabled={!selectedOption || isSubmitting}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg shadow-indigo-200 hover:shadow-xl active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    Cevabı Onayla
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  //  COMPLETED SCREEN
  // ────────────────────────────────────────────────
  if (examState === 'completed') {
    return (
      <div className="w-full max-w-2xl mx-auto relative">
        
        {/* Konfeti */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 60 }).map((_, i) => (
              <ConfettiPiece key={i} delay={Math.random() * 1.5} left={Math.random() * 100} />
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 relative z-10">
          {/* Success Header */}
          <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-10 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-8 w-32 h-32 border-2 border-white rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
              <div className="absolute bottom-4 left-8 w-24 h-24 border-2 border-white rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
            </div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-white/30 animate-bounce" style={{ animationDuration: '2s' }}>
                <Award className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
                Sınavınız Tamamlandı! 🎉
              </h1>
              <p className="text-emerald-100 text-lg font-medium">
                Seviyeniz başarıyla hesaplandı.
              </p>
            </div>
          </div>

          {/* Result */}
          <div className="p-8">
            {isLoading || !examResult ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-spin" />
                <p className="text-slate-500 font-medium text-lg">Sonuçlarınız hesaplanıyor...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Level Badge */}
                <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-8 border border-indigo-100 text-center">
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-3">Kesinleşmiş Seviyeniz</p>
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 mb-3">
                    {examResult.final_level}
                  </div>
                  <p className="text-slate-500 text-sm">Tebrikler! Seviyeniz sisteme kaydedildi.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-emerald-600 mb-1">{examResult.correct_answers}</div>
                    <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Doğru</div>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-rose-600 mb-1">{examResult.wrong_answers}</div>
                    <div className="text-xs font-bold text-rose-500 uppercase tracking-wider">Yanlış</div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-indigo-600 mb-1">{examResult.total_questions}</div>
                    <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Toplam</div>
                  </div>
                </div>

                {/* Redirect Notice */}
                <div className="text-center pt-2">
                  <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Birkaç saniye içinde panele yönlendirileceksiniz...
                  </p>
                </div>

                {/* Manual Navigate */}
                <button
                  onClick={() => navigate('/aktif-sinavlarim')}
                  className="w-full py-4 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white rounded-xl font-bold text-lg transition-all shadow-lg active:scale-[0.99]"
                >
                  Panele Dön
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AdaptiveExam;
