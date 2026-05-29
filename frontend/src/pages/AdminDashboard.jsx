import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './admin/AdminSidebar';
import { Users, UserCheck, Clock, FileCheck, ArrowRight, Loader } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    total_students: 0,
    active_instructors: 0,
    pending_approvals: 0,
    exams_solved_today: 0,
    recent_applications: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('access');
        const response = await axios.get('http://127.0.0.1:8000/api/admin/dashboard-stats/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error("Dashboard verileri çekilirken hata:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
  const stats = [
    {
      title: "Toplam Öğrenci",
      value: dashboardData.total_students,
      icon: <Users className="w-8 h-8 text-blue-600" />,
      bg: "bg-blue-100",
      trend: "Sistem geneli"
    },
    {
      title: "Aktif Eğitmen",
      value: dashboardData.active_instructors,
      icon: <UserCheck className="w-8 h-8 text-emerald-600" />,
      bg: "bg-emerald-100",
      trend: "Tüm departmanlar"
    },
    {
      title: "Bekleyen Kayıt Onayı",
      value: dashboardData.pending_approvals,
      icon: <Clock className="w-8 h-8 text-rose-600" />,
      bg: "bg-rose-100",
      trend: "Öncelikli işlem"
    },
    {
      title: "Bugün Çözülen Sınav",
      value: dashboardData.exams_solved_today,
      icon: <FileCheck className="w-8 h-8 text-purple-600" />,
      bg: "bg-purple-100",
      trend: "Son 24 saat"
    }
  ];

  return (
    <div className="w-full flex flex-col md:flex-row min-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-200">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Genel Bakış</h1>
            <p className="text-slate-500 font-medium mt-1">Sistem istatistikleri ve genel durumu buradan takip edebilirsiniz.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800 mb-1">{stat.value}</h3>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">{stat.title}</p>
                </div>
                <div className="mt-4 text-xs font-semibold text-slate-400">
                  {stat.trend}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Applications Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-slate-800">Son Kayıt Başvuruları</h2>
              <button
                onClick={() => navigate('/admin-ogrenciler')}
                className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                Tümünü Gör
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-10">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                  <p className="text-slate-500 font-medium">Veriler yükleniyor...</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                      <th className="px-6 py-4 border-b border-slate-100">Başvuru ID</th>
                      <th className="px-6 py-4 border-b border-slate-100">Ad Soyad</th>
                      <th className="px-6 py-4 border-b border-slate-100">Başvuru Tarihi</th>
                      <th className="px-6 py-4 border-b border-slate-100">Durum</th>
                      <th className="px-6 py-4 border-b border-slate-100 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dashboardData.recent_applications.length > 0 ? (
                      dashboardData.recent_applications.map((app, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4 text-sm font-bold text-slate-500">{app.id}</td>
                          <td className="px-6 py-4 font-bold text-slate-800">{app.ad_soyad}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium">{app.basvuru_tarihi}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-max 
                              ${app.durum === 'Bekliyor' || app.durum === 'BEKLIYOR' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                  app.durum === 'Onaylandı' || app.durum === 'ONAYLANDI' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    'bg-rose-50 text-rose-700 border-rose-100'}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full animate-pulse 
                                ${app.durum === 'Bekliyor' || app.durum === 'BEKLIYOR' ? 'bg-amber-500' :
                                    app.durum === 'Onaylandı' || app.durum === 'ONAYLANDI' ? 'bg-emerald-500' :
                                      'bg-rose-500'}`}
                              ></span>
                              {app.durum}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => navigate('/admin-ogrenciler')}
                              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
                            >
                              Hızlı İncele
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">Henüz kayıt başvurusu bulunmamaktadır.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>


        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
