import React, { useState, useEffect } from 'react';
import InstructorSidebar from './InstructorSidebar';
import { Video, Share2, StopCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const InstructorLiveClass = () => {
    const [meetLink, setMeetLink] = useState('');
    const [activeLive, setActiveLive] = useState(null);
    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

    const getAuthHeader = () => {
        const token = localStorage.getItem('access_token') || localStorage.getItem('access');
        if (!token) console.error("CRITICAL: Token localStorage'da bulunamadı!");
        return { Authorization: `Bearer ${token}` };
    };

    const fetchActiveLive = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/education/instructor/live-class/', {
                headers: getAuthHeader()
            });
            if (res.data.is_active) {
                setActiveLive(res.data);
            } else {
                setActiveLive(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchActiveLive();
    }, []);

    const openGoogleMeet = () => {
        window.open('https://meet.google.com/landing', '_blank');
    };

    const publishLink = async (e) => {
        e.preventDefault();
        if (!meetLink) return;

        try {
            const res = await axios.post(
                'http://127.0.0.1:8000/api/education/instructor/live-class/',
                { meet_link: meetLink },
                { headers: getAuthHeader() }
            );

            setStatusMessage({ text: res.data.message || 'Canlı ders başarıyla yayınlandı!', type: 'success' });
            setMeetLink('');
            fetchActiveLive();

            setTimeout(() => setStatusMessage({ text: '', type: '' }), 5000);
        } catch (err) {
            setStatusMessage({ text: 'Link yayınlanırken bir hata oluştu.', type: 'error' });
        }
    };

    const endLiveClass = async () => {
        try {
            await axios.patch(
                'http://127.0.0.1:8000/api/education/instructor/live-class/',
                {},
                { headers: getAuthHeader() }
            );
            setStatusMessage({ text: 'Yayın başarıyla sonlandırıldı.', type: 'success' });
            setActiveLive(null);
            setTimeout(() => setStatusMessage({ text: '', type: '' }), 5000);
        } catch (err) {
            setStatusMessage({ text: 'Yayın sonlandırılamadı.', type: 'error' });
        }
    };

    return (
        <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
            <InstructorSidebar />

            <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto">
                <div className="max-w-4xl mx-auto space-y-8">

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                            <Video className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Canlı Yayın Yönetimi</h1>
                            <p className="text-slate-500 mt-1">Sanal sınıf linkini buradan paylaşıp, derslerinizi yönetebilirsiniz.</p>
                        </div>
                    </div>

                    {statusMessage.text && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 font-bold border ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            <CheckCircle className="w-5 h-5" />
                            {statusMessage.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[300px]">
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <Video className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Google Meet</h3>
                            <p className="text-center text-slate-500 text-sm font-medium mb-6 px-4">
                                Yeni bir toplantı başlatmak veya planlanmış bir derse katılmak için tıklayın.
                            </p>
                            <button
                                onClick={openGoogleMeet}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                            >
                                Google Meet'i Aç
                            </button>
                        </div>

                        <form onSubmit={publishLink} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[300px]">
                            <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 bg-indigo-50 rounded-xl">
                                        <Share2 className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">Yayın Linkini Paylaş</h3>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-700">Canlı Ders Bağlantısı</label>
                                    <input
                                        type="url"
                                        value={meetLink}
                                        onChange={(e) => setMeetLink(e.target.value)}
                                        placeholder="https://meet.google.com/abc-defg-hij"
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                                        required
                                    />
                                    <p className="text-xs text-slate-500 font-medium">Öğrenciler doğrudan bu adrese yönlendirilecektir.</p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
                            >
                                Öğrencilerle Yayınla
                            </button>
                        </form>
                    </div>

                    {activeLive && (
                        <div className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 text-white">
                                <div className="relative">
                                    <span className="w-4 h-4 bg-red-500 rounded-full block animate-pulse absolute -top-1 -right-1 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                                    <Video className="w-10 h-10 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">Aktif Bir Yayın Var</h4>
                                    <p className="text-slate-400 text-sm font-medium mt-1">
                                        Paylaşım tarihi: {activeLive.created_at}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <a
                                    href={activeLive.meet_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition"
                                >
                                    Linke Git
                                </a>
                                <button
                                    onClick={endLiveClass}
                                    className="flex-grow md:flex-grow-0 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition"
                                >
                                    <StopCircle className="w-5 h-5" />
                                    Yayını Bitir
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default InstructorLiveClass;
