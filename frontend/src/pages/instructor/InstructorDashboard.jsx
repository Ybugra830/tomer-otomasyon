import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, MessageSquare, Send } from 'lucide-react';
import InstructorSidebar from './InstructorSidebar';

const InstructorDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Aktif Öğrencilerim",
      value: "24",
      icon: <Users className="w-8 h-8 text-blue-600" />,
      bg: "bg-blue-100"
    },
    {
      title: "Okunmayı Bekleyen Ödevler",
      value: "5",
      icon: <FileText className="w-8 h-8 text-amber-600" />,
      bg: "bg-amber-100"
    },
    {
      title: "Cevaplanmamış Mesajlar",
      value: "3",
      icon: <MessageSquare className="w-8 h-8 text-rose-600" />,
      bg: "bg-rose-100"
    }
  ];

  const students = [
    { id: 1, name: "Yaşar Buğra Erbay", level: "B1", status: "Aktif" },
    { id: 2, name: "Ayşe Yılmaz", level: "A2", status: "Aktif" },
    { id: 3, name: "Mehmet Demir", level: "B2", status: "Sınav Bekliyor" },
    { id: 4, name: "Zeynep Çelik", level: "A1", status: "Aktif" },
    { id: 5, name: "John Doe", level: "C1", status: "Mezun" }
  ];

  return (
    <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
      
      {/* Sol Menü */}
      <InstructorSidebar />

      {/* Ana İçerik */}
      <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Sayfa Başlığı */}
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Genel Bakış</h1>
            <p className="text-slate-500">Öğrencilerinizin durumunu ve bekleyen işlerinizi buradan takip edebilirsiniz.</p>
          </div>

          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md transition-all">
                <div className={`p-4 rounded-xl ${stat.bg}`}>
                  {stat.icon}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800 mb-1">{stat.value}</h3>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{stat.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Öğrenci Listesi Tablosu */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Öğrenci Listesi</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <th className="px-6 py-4 border-b border-slate-100">Öğrenci Adı</th>
                    <th className="px-6 py-4 border-b border-slate-100">Seviyesi</th>
                    <th className="px-6 py-4 border-b border-slate-100">Durumu</th>
                    <th className="px-6 py-4 border-b border-slate-100 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-800">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                          {student.level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${
                          student.status === 'Aktif' ? 'text-emerald-600' : 
                          student.status === 'Sınav Bekliyor' ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => navigate('/egitmen-materyal', { state: { preSelectedStudent: student.name } })} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow">
                          <Send className="w-4 h-4" />
                          Materyal Ata
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default InstructorDashboard;
