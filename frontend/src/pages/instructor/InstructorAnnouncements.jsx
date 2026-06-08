import React, { useState, useEffect } from 'react';
import InstructorSidebar from './InstructorSidebar';
import { Megaphone, Clock, PlusCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const InstructorAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('access');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.get('http://127.0.0.1:8000/api/communications/instructor/announcements/', config);
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setStatusMessage({ text: 'Lütfen başlık ve içerik alanlarını doldurun.', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('access');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post(
        'http://127.0.0.1:8000/api/communications/instructor/announcements/',
        { title, content },
        config
      );

      setStatusMessage({ text: 'Duyuru başarıyla oluşturuldu!', type: 'success' });
      setTitle('');
      setContent('');
      fetchAnnouncements(); // Optimistic/fetch update

      setTimeout(() => setStatusMessage({ text: '', type: '' }), 5000);
    } catch (err) {
      setStatusMessage({ text: 'Duyuru oluşturulurken bir hata oluştu.', type: 'error' });
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-[85vh] bg-slate-50 w-full relative z-10">
      <InstructorSidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-10">

          <div className="mb-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-indigo-600" />
              Duyuru Yönetimi
            </h1>
            <p className="text-slate-500 mt-2 text-sm">Öğrencilerinize anında iletmek istediğiniz bildirimleri buradan ekleyebilir ve geçmiş duyurularınızı görüntüleyebilirsiniz.</p>
          </div>

          {statusMessage.text && (
            <div className={`p-4 rounded-xl flex items-center gap-3 font-bold border ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              <CheckCircle className="w-5 h-5" />
              {statusMessage.text}
            </div>
          )}

          {/* Duyuru Ekleme Formu */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Yeni Duyuru Ekle</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Başlık</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Duyuru Başlığı..."
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Duyuru Mesajı</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Öğrencilerinizle paylaşmak istediğiniz mesajı buraya yazın..."
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-800 min-h-[120px] resize-y"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                >
                  <Megaphone className="w-5 h-5" />
                  Öğrencilere Gönder
                </button>
              </div>
            </form>
          </div>

          <div className="pt-4 space-y-6">
            <h2 className="text-2xl font-black text-slate-800 mb-6 border-b-2 border-slate-100 pb-4">Bütün Duyurularım</h2>

            {announcements.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-medium tracking-wide">
                Henüz hiç duyuru paylaşmadınız.
              </div>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>

                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h3 className="text-xl font-bold text-slate-800">{ann.title}</h3>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Clock className="w-4 h-4" />
                      {ann.created_at}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {ann.content}
                  </p>
                </div>
              ))
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default InstructorAnnouncements;
