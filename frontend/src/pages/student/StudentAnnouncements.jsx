import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { Bell, Clock } from 'lucide-react';
import axios from 'axios';

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('access');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const res = await axios.get('http://127.0.0.1:8000/api/communications/student/announcements/', config);
        setAnnouncements(res.data);

        // Işık/Bildirim sönmesi için localStorage güncellemesi
        if (res.data && res.data.length > 0) {
          localStorage.setItem('last_read_announcement_id', res.data[0].id.toString());
        }
      } catch (err) {
        console.error("Duyurular getirilemedi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="flex min-h-[85vh] bg-slate-50 w-full relative z-10">
      <StudentSidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">

          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-600" />
              Duyurular ve Bildirimler
            </h1>
            <p className="text-slate-500 mt-2 text-sm">Hocalarınız tarafından paylaşılan önemli detaylar ve duyurular zaman akışı.</p>
          </div>

          {loading ? (
            <div className="text-center py-10 font-bold text-slate-400">Yükleniyor...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-medium tracking-wide">
              Henüz sizi ilgilendiren bir duyuru bulunmamaktadır.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 pl-8 space-y-8 pb-12">

              {announcements.map((ann, index) => {
                // Determine a pseudo-random color based on index or just use a standard one for all
                const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-red-500', 'bg-indigo-500'];
                const cardColors = ['bg-emerald-100 text-emerald-700', 'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-red-100 text-red-700', 'bg-indigo-100 text-indigo-700'];
                const colorIdx = index % colors.length;

                return (
                  <div key={ann.id} className="relative">
                    <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full ${colors[colorIdx]} border-4 border-slate-50 shadow-sm`}></div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <span className={`px-3 py-1 ${cardColors[colorIdx]} text-xs font-black rounded-md tracking-wider`}>
                          [{ann.instructor_name} Hoca]
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {ann.created_at}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">{ann.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {ann.content}
                      </p>
                    </div>
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

export default StudentAnnouncements;
