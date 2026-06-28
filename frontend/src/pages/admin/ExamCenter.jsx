import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import InstructorSidebar from '../instructor/InstructorSidebar';
import {
  ClipboardList, Database, PlusCircle, Search, Edit2, Trash2,
  CheckCircle, Clock, X, AlertCircle, Eye, Zap, Upload, Music,
  FileText, Mic, Pencil, Check
} from 'lucide-react';
import {
  getAdminExams, createAdminExam, getAdminQuestions,
  createAdminQuestion, getExamDetail, toggleExamStatus
} from '../../services/AdminExamApi';

const EXAM_TYPE_OPTIONS = [
  { value: 'PLACEMENT', label: 'Seviye Tespit Sınavı' },
  { value: 'GRAMMAR', label: 'Ana Test (Gramer)' },
  { value: 'LISTENING', label: 'Dinleme Sınavı' },
  { value: 'READING', label: 'Okuma Sınavı' },
  { value: 'WRITING', label: 'Yazma Sınavı' },
];

const QUESTION_TYPE_OPTIONS = [
  { value: 'GRAMMAR', label: 'Gramer', icon: FileText, color: 'blue' },
  { value: 'READING', label: 'Okuma', icon: FileText, color: 'emerald' },
  { value: 'LISTENING', label: 'Dinleme', icon: Music, color: 'amber' },
  { value: 'WRITING', label: 'Yazma', icon: Pencil, color: 'rose' },
];

const ExamCenter = () => {
  const authUser = useSelector((state) => state.auth?.user?.user);
  const name = (authUser?.first_name || authUser?.username || '').toLowerCase();
  const isInstructor = authUser?.user_type === 'INSTRUCTOR';
  let forcedLang = 'Türkçe';
  let dbLangValue = 'turkce';

  if (isInstructor) {
    if (name.includes('recep') || name.includes('ateş') || name.includes('ates')) {
      forcedLang = 'İngilizce';
      dbLangValue = 'ingilizce';
    } else if (name.includes('muhammed') || name.includes('kalaycı') || name.includes('kalayci')) {
      forcedLang = 'Almanca';
      dbLangValue = 'almanca';
    } else if (name.includes('fikret') || name.includes('bacak')) {
      forcedLang = 'Türkçe';
      dbLangValue = 'turkce';
    }
  }

  const mapLang = (l) => {
    if (l === 'İngilizce' || l === 'ingilizce') return 'ingilizce';
    if (l === 'Türkçe' || l === 'turkce') return 'turkce';
    if (l === 'Almanca' || l === 'almanca') return 'almanca';
    return l;
  };

  const [activeTab, setActiveTab] = useState('exams');

  // Aktif Sınavlar
  const [exams, setExams] = useState([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);

  // Sınav Detay Modalı
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [examDetail, setExamDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Soru Havuzu
  const [questions, setQuestions] = useState([]);
  const [filterLevel, setFilterLevel] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    level: 'A1', text: '', question_type: 'GRAMMAR', language: '',
    is_reading: false, reading_text: '',
    option_a: '', option_b: '', option_c: '', option_d: '',
    correct_answer: 'A'
  });
  const [audioFile, setAudioFile] = useState(null);

  // Yeni Sınav Oluştur
  const [newExam, setNewExam] = useState({
    title: '', exam_type: 'GRAMMAR', level: '', language: '',
    passing_score: '', duration: ''
  });
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [isSelectQuestionsModalOpen, setIsSelectQuestionsModalOpen] = useState(false);
  const [poolQuestions, setPoolQuestions] = useState([]);
  const [isLoadingPool, setIsLoadingPool] = useState(false);

  useEffect(() => {
    if (isInstructor && dbLangValue) {
      setNewQuestion(prev => ({ ...prev, language: dbLangValue }));
      setNewExam(prev => ({ ...prev, language: dbLangValue }));
    }
  }, [isInstructor, dbLangValue]);

  // Toast
  const [toastMessage, setToastMessage] = useState('');

  const needsOptions = !['WRITING', 'SPEAKING'].includes(newQuestion.question_type);

  // --- DATA FETCHING ---
  const fetchExams = async () => {
    setIsLoadingExams(true);
    try { setExams(await getAdminExams()); }
    catch (e) { console.error("Sınavlar hata:", e); }
    finally { setIsLoadingExams(false); }
  };

  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const data = await getAdminQuestions(filterLevel, '', filterType);
      setQuestions(data);
    } catch (e) { console.error("Sorular hata:", e); }
    finally { setIsLoadingQuestions(false); }
  };

  useEffect(() => { if (activeTab === 'exams') fetchExams(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'pool') fetchQuestions(); }, [activeTab, filterLevel, filterType]);

  // --- TOGGLE EXAM STATUS ---
  const handleToggleStatus = async (examId) => {
    try {
      const result = await toggleExamStatus(examId);
      showToast(result.message || 'Durum güncellendi!');
      fetchExams();
    } catch (e) {
      console.error('Durum değiştirme hatası:', e);
      alert('Sınav durumu değiştirilemedi!');
    }
  };

  const handleOpenDetail = async (examId) => {
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    setExamDetail(null);
    try { setExamDetail(await getExamDetail(examId)); }
    catch (e) { console.error("Detay hata:", e); }
    finally { setIsLoadingDetail(false); }
  };

  // --- ADD QUESTION (FormData for multipart) ---
  const handleAddQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('level', newQuestion.level);
      fd.append('text', newQuestion.text);
      fd.append('question_type', newQuestion.question_type);
      fd.append('language', isInstructor ? dbLangValue : mapLang(newQuestion.language));
      fd.append('is_reading', newQuestion.is_reading);
      if (newQuestion.reading_text) fd.append('reading_text', newQuestion.reading_text);
      if (needsOptions) {
        fd.append('option_a', newQuestion.option_a);
        fd.append('option_b', newQuestion.option_b);
        fd.append('option_c', newQuestion.option_c);
        fd.append('option_d', newQuestion.option_d);
        fd.append('correct_answer', newQuestion.correct_answer);
      }
      if (audioFile) fd.append('audio_file', audioFile);

      await createAdminQuestion(fd);
      setIsAddQuestionModalOpen(false);
      setNewQuestion({
        level: 'A1', text: '', question_type: 'GRAMMAR', language: isInstructor ? dbLangValue : '',
        is_reading: false, reading_text: '',
        option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A'
      });
      setAudioFile(null);
      showToast("Soru başarıyla eklendi!");
      fetchQuestions();
    } catch (error) {
      console.error("Soru hata:", error.response?.data);
      const errMsg = error.response?.data?.error || JSON.stringify(error.response?.data) || "Bilinmeyen hata";
      alert("Soru eklenemedi: " + errMsg);
    }
  };

  // --- CREATE EXAM ---
  const handleCreateExamSubmit = async (e) => {
    e.preventDefault();
    if (!newExam.title) { alert("Lütfen sınav adını giriniz."); return; }

    try {
      const payload = {
        title: newExam.title,
        exam_type: newExam.exam_type,
        level: newExam.level,
        language: isInstructor ? dbLangValue : mapLang(newExam.language),
        passing_score: parseInt(newExam.passing_score) || 70,
        duration: parseInt(newExam.duration) || 60,
        question_ids: selectedQuestionIds, // Bizim topladığımız state
        questions: selectedQuestionIds,    // Backend'in muhtemel beklediği alan
        is_adaptive: false,                // Eski alanları patlamasın diye ez ez geç
        random_question_count: 0
      };
      await createAdminExam(payload);
      showToast("Sınav başarıyla yayınlandı!");
      setNewExam({ title: '', exam_type: 'GRAMMAR', level: '', language: isInstructor ? dbLangValue : '', passing_score: '', duration: '' });
      setSelectedQuestionIds([]);
      setActiveTab('exams');
    } catch (error) {
      console.error("Sınav hata:", error.response?.data);
      const errMsg = error.response?.data?.error || JSON.stringify(error.response?.data) || "Bilinmeyen hata";
      alert("Sınav oluşturulamadı: " + errMsg);
    }
  };

  // --- MANUAL QUESTION SELECTION ---
  const openQuestionSelector = async () => {
    const selectedLanguage = newExam.language || (isInstructor ? dbLangValue : '');
    if (!selectedLanguage) {
      alert("Lütfen havuzdan soru seçmeden önce Sınav Dilini belirleyiniz.");
      return;
    }
    setIsSelectQuestionsModalOpen(true);
    setIsLoadingPool(true);
    try {
      // Sınav türüne göre question_type eşleştirmesi
      const typeMap = { 'GRAMMAR': 'GRAMMAR', 'LISTENING': 'LISTENING', 'READING': 'READING', 'WRITING': 'WRITING' };
      const qType = typeMap[newExam.exam_type] || '';
      const data = await getAdminQuestions('', '', qType);
      setPoolQuestions(data.filter(q => q.language === mapLang(selectedLanguage)));
    } catch (e) { console.error("Havuz çekme hata:", e); }
    finally { setIsLoadingPool(false); }
  };

  const toggleQuestionSelection = (qId) => {
    setSelectedQuestionIds(prev =>
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // --- UI HELPERS ---
  const renderDifficultyBars = (levelStr) => {
    const levelMap = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
    const n = levelMap[levelStr?.toUpperCase()] || 1;
    const c = n <= 2 ? 'bg-green-500' : n <= 4 ? 'bg-amber-500' : 'bg-red-500';
    return (
      <div className="flex gap-1">
        {[1, 2, 3].map(i => <span key={i} className={`w-2 h-4 rounded-sm ${i <= Math.ceil(n / 2) ? c : 'bg-slate-200'}`}></span>)}
      </div>
    );
  };

  const getExamTypeBadge = (type) => {
    const c = { PLACEMENT: 'bg-violet-100 text-violet-700', GRAMMAR: 'bg-blue-100 text-blue-700', LISTENING: 'bg-amber-100 text-amber-700', READING: 'bg-emerald-100 text-emerald-700', WRITING: 'bg-rose-100 text-rose-700' };
    return c[type] || 'bg-slate-100 text-slate-700';
  };

  const getQTypeBadge = (type) => {
    const c = { GRAMMAR: 'bg-blue-100 text-blue-700', READING: 'bg-emerald-100 text-emerald-700', LISTENING: 'bg-amber-100 text-amber-700', WRITING: 'bg-rose-100 text-rose-700' };
    const l = { GRAMMAR: 'Gramer', READING: 'Okuma', LISTENING: 'Dinleme', WRITING: 'Yazma' };
    return <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${c[type] || 'bg-slate-100 text-slate-700'}`}>{l[type] || type}</span>;
  };

  // ═══════════════════════════════════════════════
  //  RENDER CONTENT
  // ═══════════════════════════════════════════════
  const renderContent = () => {
    switch (activeTab) {

      // ═══════════════ AKTİF SINAVLAR ═══════════════
      case 'exams':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Aktif Sınavlar</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Sınav Adı</th>
                    <th className="px-6 py-4">Tür</th>
                    <th className="px-6 py-4">Seviye</th>
                    <th className="px-6 py-4">Soru</th>
                    <th className="px-6 py-4">Süre</th>
                    <th className="px-6 py-4">Durum</th>
                    <th className="px-6 py-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingExams ? (
                    <tr><td colSpan="7" className="text-center py-8 text-slate-500">Yükleniyor...</td></tr>
                  ) : exams.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-8 text-slate-500">Henüz sınav bulunmuyor.</td></tr>
                  ) : exams.map(exam => (
                    <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{exam.title}</td>
                      <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getExamTypeBadge(exam.exam_type)}`}>{exam.exam_type_display || exam.exam_type}</span></td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold">{exam.level || 'Tümü'}</span></td>
                      <td className="px-6 py-4">{exam.total_questions}</td>
                      <td className="px-6 py-4"><div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" />{exam.duration}dk</div></td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(exam.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all hover:scale-105 ${exam.is_published
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          title={exam.is_published ? 'Tıklayın: Taslağa çek' : 'Tıklayın: Yayına al'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${exam.is_published ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {exam.is_published ? 'Yayında' : 'Taslak'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleOpenDetail(exam.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="İçeriği Gör"><Eye className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* İçerik Modalı */}
            {isDetailModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">

                  {/* Absolute X Butonu */}
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="absolute top-4 right-4 z-20 p-2 bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="p-6 border-b border-slate-200 shrink-0 pr-16 bg-white z-10">
                    <h3 className="text-xl font-bold text-slate-800">{examDetail?.exam?.title || 'Sınav İçeriği'}</h3>
                  </div>

                  <div className="p-6 overflow-y-auto flex-grow">
                    {isLoadingDetail ? (
                      <div className="text-center py-10 text-slate-500 animate-pulse">Yükleniyor...</div>
                    ) : !examDetail ? (
                      <div className="text-center py-10 text-red-500">Veriler alınamadı.</div>
                    ) : examDetail.is_adaptive ? (
                      <div className="text-center py-10">
                        <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4"><Zap className="w-8 h-8 text-violet-600" /></div>
                        <h4 className="text-lg font-bold text-slate-800 mb-2">Adaptive (Dinamik) Sınav</h4>
                        <p className="text-slate-500 max-w-md mx-auto">Bu sınav dinamik olduğu için sabit bir soru listesi yoktur. Sorular havuzdan öğrenciye özel çekilir.</p>
                        <div className="mt-6 grid grid-cols-3 gap-4 max-w-sm mx-auto">
                          <div className="bg-slate-50 rounded-lg p-3 text-center"><div className="text-lg font-bold text-slate-800">{examDetail.exam?.duration}</div><div className="text-xs text-slate-500">Dakika</div></div>
                          <div className="bg-slate-50 rounded-lg p-3 text-center"><div className="text-lg font-bold text-slate-800">{examDetail.exam?.total_questions}</div><div className="text-xs text-slate-500">Maks. Soru</div></div>
                          <div className="bg-slate-50 rounded-lg p-3 text-center"><div className="text-lg font-bold text-slate-800">{examDetail.exam?.level || 'Tümü'}</div><div className="text-xs text-slate-500">Seviye</div></div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-slate-500 font-medium mb-4">Toplam <strong className="text-slate-800">{examDetail.questions?.length || 0}</strong> soru</p>
                        {examDetail.questions?.length === 0 ? (
                          <div className="text-center py-10 text-slate-400"><Database className="w-10 h-10 mx-auto mb-2 opacity-50" /><p>Henüz soru eklenmemiş.</p></div>
                        ) : (
                          <div className="space-y-3">
                            {examDetail.questions.map((q, idx) => (
                              <div key={q.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <div className="flex items-start gap-3">
                                  <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{idx + 1}</span>
                                  <div className="flex-grow min-w-0">
                                    <p className="text-sm text-slate-800 font-medium mb-2">{q.text}</p>

                                    {/* Dinleme sorusu - Ses Oynatıcı */}
                                    {q.question_type === 'LISTENING' && q.audio_file && (
                                      <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                                          <Music className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <audio controls src={q.audio_file} className="w-full h-8" preload="metadata">
                                          Tarayıcınız ses oynatmayı desteklemiyor.
                                        </audio>
                                      </div>
                                    )}

                                    {/* Okuma sorusu - Paragraf */}
                                    {q.is_reading && q.reading_text && (
                                      <div className="mb-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                                        <p className="text-xs font-bold text-emerald-700 mb-1">Okuma Parçası:</p>
                                        <p className="text-xs text-emerald-800 leading-relaxed whitespace-pre-line">{q.reading_text}</p>
                                      </div>
                                    )}

                                    {q.option_a && (
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        {['A', 'B', 'C', 'D'].map(opt => (
                                          <div key={opt} className={`px-3 py-1.5 rounded-lg ${q.correct_answer === opt ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-200' : 'bg-white text-slate-600 border border-slate-200'}`}>
                                            <span className="font-bold mr-1">{opt})</span> {q[`option_${opt.toLowerCase()}`]}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="text-xs font-bold text-slate-400">{q.level_ad}</span>
                                      {getQTypeBadge(q.question_type)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Alt Kısım Kapat Butonu */}
                  <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
                    <button
                      onClick={() => setIsDetailModalOpen(false)}
                      className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-all"
                    >
                      Kapat
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
        );

      // ═══════════════ SORU HAVUZU ═══════════════
      case 'pool':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Tüm Seviyeler</option>
                  {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Tüm Tipler</option>
                  {QUESTION_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <button onClick={() => setIsAddQuestionModalOpen(true)} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg">
                <PlusCircle className="w-4 h-4" /> Soru Ekle
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Soru Metni</th>
                    <th className="px-6 py-4 w-28">Tip</th>
                    <th className="px-6 py-4 w-24">Seviye</th>
                    <th className="px-6 py-4 w-24">Zorluk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingQuestions ? (
                    <tr><td colSpan="4" className="text-center py-8 text-slate-500">Yükleniyor...</td></tr>
                  ) : questions.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-8 text-slate-500">Soru bulunamadı.</td></tr>
                  ) : questions.map(q => (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-800"><div className="line-clamp-2" title={q.text}>{q.text}</div></td>
                      <td className="px-6 py-4">{getQTypeBadge(q.question_type)}</td>
                      <td className="px-6 py-4 font-bold text-slate-600">{q.level_ad || q.level}</td>
                      <td className="px-6 py-4">{renderDifficultyBars(q.level_ad || 'A1')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ═══ YENİ SORU EKLE MODALI ═══ */}
            {isAddQuestionModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-slate-800">Yeni Soru Ekle</h3>
                    <button onClick={() => setIsAddQuestionModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                  </div>
                  <form onSubmit={handleAddQuestionSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Soru Dili {isInstructor && <span className="text-gray-400 text-xs">(Branşınız Sebebiyle Sabitlendi)</span>}
                        </label>
                        <select
                          value={isInstructor ? forcedLang : newQuestion.language}
                          disabled={isInstructor}
                          onChange={(e) => setNewQuestion({ ...newQuestion, language: e.target.value })}
                          className={`w-full p-2 border rounded-lg ${isInstructor ? 'bg-gray-100 cursor-not-allowed text-gray-700 font-medium' : 'focus:ring-2 focus:ring-indigo-500'}`}
                        >
                          {isInstructor ? (
                            <option value={forcedLang}>{forcedLang} (Branşınız Sebebiyle Sabitlendi)</option>
                          ) : (
                            <>
                              <option value="">Dil Seçiniz</option>
                              <option value="turkce">Türkçe</option>
                              <option value="ingilizce">İngilizce</option>
                              <option value="almanca">Almanca</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Seviye</label>
                        <select required value={newQuestion.level} onChange={e => setNewQuestion({ ...newQuestion, level: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Soru Tipi</label>
                        <select required value={newQuestion.question_type} onChange={e => {
                          const val = e.target.value;
                          setNewQuestion({ ...newQuestion, question_type: val, is_reading: val === 'READING' });
                        }} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                          {QUESTION_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Soru Metni */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Soru Metni</label>
                      <textarea rows="2" required value={newQuestion.text} onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })} className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Soruyu buraya girin..." />
                    </div>

                    {/* OKUMA: Paragraf Metni */}
                    {newQuestion.question_type === 'READING' && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Okuma Parçası (Paragraf)</label>
                        <textarea rows="4" value={newQuestion.reading_text} onChange={e => setNewQuestion({ ...newQuestion, reading_text: e.target.value })} className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Uzun okuma parçasını buraya girin..." />
                      </div>
                    )}

                    {/* DİNLEME: Ses Dosyası Yükleme */}
                    {newQuestion.question_type === 'LISTENING' && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Ses Dosyası (MP3)</label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 px-5 py-3 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors flex-grow">
                            <Upload className="w-5 h-5 text-amber-600" />
                            <span className="text-sm font-bold text-amber-700">{audioFile ? audioFile.name : 'Dosya seç veya sürükle...'}</span>
                            <input type="file" accept=".mp3,.wav,.ogg,audio/*" className="hidden" onChange={e => setAudioFile(e.target.files[0])} />
                          </label>
                          {audioFile && <button type="button" onClick={() => setAudioFile(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X className="w-5 h-5" /></button>}
                        </div>
                      </div>
                    )}

                    {/* ŞIKLAR - Yazma/Konuşma hariç */}
                    {needsOptions && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          {['A', 'B', 'C', 'D'].map(opt => (
                            <div key={opt}>
                              <label className="block text-sm font-bold text-slate-700 mb-1">{opt} Şıkkı</label>
                              <input type="text" required value={newQuestion[`option_${opt.toLowerCase()}`]} onChange={e => setNewQuestion({ ...newQuestion, [`option_${opt.toLowerCase()}`]: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Doğru Cevap</label>
                          <select required value={newQuestion.correct_answer} onChange={e => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                            {['A', 'B', 'C', 'D'].map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                      </>
                    )}

                    {/* Yazma/Konuşma bilgi kartı */}
                    {!needsOptions && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-rose-700">{newQuestion.question_type === 'WRITING' ? 'Yazma' : 'Konuşma'} sorularında çoktan seçmeli şıklar yoktur. Öğrenci açık uçlu cevap verecektir.</p>
                      </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                      <button type="button" onClick={() => setIsAddQuestionModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">İptal</button>
                      <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm">Kaydet</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      // ═══════════════ YENİ SINAV OLUŞTUR ═══════════════
      case 'create':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-4xl relative">
            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Yeni Sınav Oluştur</h3>

            <form onSubmit={handleCreateExamSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Sınav Adı</label>
                  <input type="text" required value={newExam.title} onChange={e => setNewExam({ ...newExam, title: e.target.value })} placeholder="Örn: B1 Gramer Sınavı" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Sınav Türü</label>
                  <select required value={newExam.exam_type} onChange={e => {
                    const val = e.target.value;
                    setNewExam({ ...newExam, exam_type: val });
                    setSelectedQuestionIds([]);
                  }} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 bg-white">
                    {EXAM_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Hedef Seviye</label>
                  <select value={newExam.level} onChange={e => setNewExam({ ...newExam, level: e.target.value })} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 bg-white">
                    <option value="">Seviye Seçiniz</option>
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l} Seviyesi</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 block mb-1">
                    Sınav Dili {isInstructor && <span className="text-gray-400 text-xs">(Branşınız Sebebiyle Sabitlendi)</span>}
                  </label>
                  <select
                    value={isInstructor ? forcedLang : newExam.language}
                    disabled={isInstructor}
                    onChange={(e) => setNewExam({ ...newExam, language: e.target.value })}
                    className={`w-full p-2 border rounded-lg ${isInstructor ? 'bg-gray-100 cursor-not-allowed text-gray-700 font-medium' : 'focus:ring-2 focus:ring-indigo-500'}`}
                  >
                    {isInstructor ? (
                      <option value={forcedLang}>{forcedLang} (Branşınız Sebebiyle Sabitlendi)</option>
                    ) : (
                      <>
                        <option value="">Sınav Dilini Seçiniz</option>
                        <option value="turkce">Türkçe</option>
                        <option value="ingilizce">İngilizce</option>
                        <option value="almanca">Almanca</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Geçme Notu</label>
                  <input type="number" required min="0" max="100" value={newExam.passing_score || ''} onChange={e => setNewExam({ ...newExam, passing_score: parseInt(e.target.value) || '' })} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Süre (Dakika)</label>
                  <input type="number" required min="1" value={newExam.duration || ''} onChange={e => setNewExam({ ...newExam, duration: parseInt(e.target.value) || '' })} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800" />
                </div>
              </div>

              {/* ═══ STATİK: Manuel Soru Seçme ═══ */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-3">Sınav Soruları</label>

                {selectedQuestionIds.length > 0 && (
                  <div className="mb-4 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-bold text-indigo-700">
                      <Check className="w-4 h-4 inline mr-1" /> {selectedQuestionIds.length} soru seçildi
                    </span>
                    <button type="button" onClick={() => setSelectedQuestionIds([])} className="text-xs text-indigo-500 hover:text-indigo-700 font-bold">Temizle</button>
                  </div>
                )}

                <div className="w-full border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-all group">
                  <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Database className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-1">Havuzdan Soru Seç</h4>
                  <p className="text-sm text-slate-500 max-w-sm">
                    Soru havuzundan bu sınava eklemek istediğiniz soruları manuel olarak seçin.
                    {newExam.exam_type !== 'PLACEMENT' && <><br />Sadece <strong>{EXAM_TYPE_OPTIONS.find(o => o.value === newExam.exam_type)?.label}</strong> türündeki sorular listelenecektir.</>}
                  </p>
                  <div className="mt-6">
                    <button type="button" onClick={openQuestionSelector} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2">
                      <Search className="w-4 h-4" /> Havuzdan Soru Seç
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button type="submit" className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Sınavı Yayınla
                </button>
              </div>
            </form >

            {/* ═══ MANUEL SORU SEÇME MODALI ═══ */}
            {
              isSelectQuestionsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
                    <div className="flex justify-between items-center p-6 border-b border-slate-200 shrink-0">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">Soru Havuzundan Seç</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {EXAM_TYPE_OPTIONS.find(o => o.value === newExam.exam_type)?.label || 'Tüm'} soruları listeleniyor · <strong className="text-indigo-600">{selectedQuestionIds.length} seçili</strong>
                        </p>
                      </div>
                      <button onClick={() => setIsSelectQuestionsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-6">
                      {isLoadingPool ? (
                        <div className="text-center py-10 text-slate-500 animate-pulse">Sorular yükleniyor...</div>
                      ) : poolQuestions.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                          <Database className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p>Bu türde soru bulunamadı. Önce soru havuzuna soru ekleyin.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {poolQuestions.map(q => {
                            const isSelected = selectedQuestionIds.includes(q.id);
                            return (
                              <label key={q.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-indigo-400 bg-indigo-50' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                                <input type="checkbox" checked={isSelected} onChange={() => toggleQuestionSelection(q.id)} className="mt-1 w-5 h-5 text-indigo-600 rounded shrink-0" />
                                <div className="flex-grow min-w-0">
                                  <p className="text-sm text-slate-800 font-medium line-clamp-2">{q.text}</p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-xs font-bold text-slate-400">{q.level_ad}</span>
                                    {getQTypeBadge(q.question_type)}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="p-6 border-t border-slate-200 flex justify-between items-center shrink-0">
                      <span className="text-sm text-slate-500 font-medium">{selectedQuestionIds.length} soru seçildi</span>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setIsSelectQuestionsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">İptal</button>
                        <button type="button" onClick={() => { setIsSelectQuestionsModalOpen(false); showToast(`${selectedQuestionIds.length} soru sınava eklendi!`); }} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2">
                          <Check className="w-4 h-4" /> Seçilenleri Ekle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          </div >
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-[85vh] bg-slate-50 w-full relative z-10">
      <InstructorSidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto w-full relative">
        {toastMessage && (
          <div className="absolute top-8 right-8 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 font-bold">
              <CheckCircle className="w-6 h-6" />{toastMessage}
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Merkezi Sınav Yönetimi</h1>
            <p className="text-slate-500 mt-2 text-sm">Tüm sınavları, soru havuzunu ve değerlendirmeleri tek bir yerden yönetin.</p>
          </div>

          <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm w-fit">
            {[
              { key: 'exams', label: 'Aktif Sınavlar', Icon: ClipboardList, active: 'bg-slate-900 text-white shadow-md', idle: 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' },
              { key: 'pool', label: 'Soru Havuzu', Icon: Database, active: 'bg-slate-900 text-white shadow-md', idle: 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' },
              { key: 'create', label: 'Yeni Sınav Oluştur', Icon: PlusCircle, active: 'bg-indigo-600 text-white shadow-md', idle: 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === tab.key ? tab.active : tab.idle}`}>
                <tab.Icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamCenter;
