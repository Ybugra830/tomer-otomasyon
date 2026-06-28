import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Megaphone
} from 'lucide-react';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getLinkClass = (path) => {
    return location.pathname === path
      ? "w-full text-left flex items-center gap-3 p-3 rounded-xl bg-blue-600 text-white font-bold shadow-md transition-all"
      : "w-full text-left flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-all group";
  };

  const getIconClass = (path) => {
    return location.pathname === path
      ? "w-5 h-5 text-white"
      : "w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors";
  };

  return (
    <aside className="w-full md:w-72 bg-slate-950 shadow-2xl flex flex-col relative z-10 shrink-0 min-h-[85vh]">
      <div className="p-8 border-b border-slate-800/50 flex items-center justify-center">
        <h2 className="text-xl font-black text-white tracking-widest uppercase">
          Süper Admin
        </h2>
      </div>

      <nav className="flex-grow p-6 space-y-2 overflow-y-auto">
        <button onClick={() => navigate('/admin-panel')} className={getLinkClass('/admin-panel')}>
          <LayoutDashboard className={getIconClass('/admin-panel')} />
          Genel Bakış
        </button>
        <button onClick={() => navigate('/admin-ogrenciler')} className={getLinkClass('/admin-ogrenciler')}>
          <Users className={getIconClass('/admin-ogrenciler')} />
          Öğrenci Yönetimi
        </button>
        <button onClick={() => navigate('/admin-egitmen-ekle')} className={getLinkClass('/admin-egitmen-ekle')}>
          <UserCheck className={getIconClass('/admin-egitmen-ekle')} />
          Eğitmen Yönetimi
        </button>
        <button onClick={() => navigate('/admin-duyurular')} className={getLinkClass('/admin-duyurular')}>
          <Megaphone className={getIconClass('/admin-duyurular')} />
          Sistem Duyuruları
        </button>
      </nav>

      <div className="p-6 border-t border-slate-800/50 mt-auto bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
            A
          </div>
          <div>
            <p className="text-sm font-bold text-white">Yönetici Hesabı</p>
            <p className="text-xs text-slate-400">Sistem Yetkilisi</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
