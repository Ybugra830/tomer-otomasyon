import React, { useState, useEffect } from 'react';
import StudentSidebar from '../components/StudentSidebar';
import { Video, Radio, Loader2 } from 'lucide-react';
import axios from 'axios';

const LiveClasses = () => {
  const [liveData, setLiveData] = useState({ is_active: false, meet_link: null, message: '', instructor_name: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLiveClass = async () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('access');
        const res = await axios.get('http://127.0.0.1:8000/api/education/student/live-class/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLiveData(res.data);
      } catch (err) {
        console.error('Canlı ders verisi çekilemedi:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLiveClass();
  }, []);

  return (
    <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">

      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <main className="flex-grow bg-slate-50 p-6 md:p-10 flex flex-col pt-10">
        <div className="max-w-4xl mx-auto w-full space-y-8 flex-grow flex flex-col">

          {/* Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <Video className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Canlı Dersler</h1>
              <p className="text-slate-500 mt-1">Eğitmeninizin başlattığı canlı yayınlara buradan anında katılabilirsiniz.</p>
            </div>
          </div>

          {/* Dinamik İçerik (KISS Prensibi) */}
          <div className="flex-grow flex flex-col justify-center items-center -mt-10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center text-indigo-500">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="font-bold">Bağlantı kontrol ediliyor...</p>
              </div>
            ) : liveData.is_active ? (

              // AKTİF CANLI YAYIN DURUMU
              <div className="w-full max-w-2xl bg-slate-900 rounded-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden text-center border border-slate-800 transform hover:scale-[1.02] transition-transform duration-500">

                {/* Arkaplan Dekorasyon */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-slate-900"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <Radio className="absolute -top-10 -right-10 w-64 h-64 text-white opacity-5" />

                <div className="relative z-10 flex flex-col items-center">

                  {/* Pulsasyon (Dalgalanma) Efekti */}
                  <div className="relative flex justify-center items-center mb-8">
                    <div className="absolute w-24 h-24 bg-red-500 rounded-full animate-ping opacity-20"></div>
                    <div className="absolute w-16 h-16 bg-red-500 rounded-full animate-pulse opacity-40"></div>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.8)] z-10 border-4 border-slate-900">
                    </div>
                  </div>

                  <span className="text-red-400 font-extrabold tracking-widest text-sm mb-3">CANLI YAYIN BAŞLADI</span>

                  <h2 className="text-3xl md:text-5xl font-black text-white mb-3">
                    {liveData.instructor_name}
                  </h2>
                  <p className="text-slate-300 font-medium mb-10 pb-6 border-b border-slate-700/50 w-3/4 mx-auto">
                    Öğretmeniniz derse başladı. Katılmak için aşağıdaki butona tıklayın.
                  </p>

                  {/* Dev Katılım Butonu */}
                  <a
                    href={liveData.meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-300 bg-emerald-500 rounded-2xl hover:bg-emerald-400 hover:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)]"
                  >
                    <Video className="w-7 h-7 mr-3 group-hover:animate-bounce" />
                    <span className="text-xl tracking-wide uppercase">Hemen Derse Katıl</span>
                  </a>

                </div>
              </div>

            ) : (

              // YAYIN YOK DURUMU (Fallback)
              <div className="text-center py-20 px-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center w-full max-w-xl">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                  <Radio className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-700 mb-3 block">Yayın Bekleniyor</h3>
                <p className="text-slate-500 font-medium text-lg">
                  {liveData.message || 'Şu an aktif bir canlı yayın bulunmuyor.'}
                </p>
                <div className="mt-8 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm">
                  Ders saatinizde sayfayı yenileyiniz.
                </div>
              </div>

            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default LiveClasses;
