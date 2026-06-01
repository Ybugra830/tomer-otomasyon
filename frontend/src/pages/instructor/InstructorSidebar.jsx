import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FilePlus,
  Video,
  Megaphone,
  ClipboardCheck
} from 'lucide-react';

const InstructorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavClass = (path) => {
    const isActive = location.pathname === path || (path === '/egitmen-panel' && location.pathname.startsWith('/egitmen-panel'));

    // Yalnızca '/' yolu kontrolü yerine spesifik kontrol ekleyebiliriz ama şimdilik exact match
    return isActive
      ? "w-full flex items-center gap-3 p-4 rounded-xl bg-indigo-900 text-white font-bold transition-all border-l-4 border-indigo-400"
      : "w-full flex items-center gap-3 p-4 rounded-xl text-indigo-200 hover:bg-indigo-900/50 hover:text-white font-medium transition-all group border-l-4 border-transparent";
  };

  const getIconClass = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "w-5 h-5 text-indigo-400"
      : "w-5 h-5 text-indigo-300 group-hover:text-indigo-200";
  };

  return (
    <aside className="w-full md:w-72 bg-indigo-950 shadow-xl flex flex-col relative z-10 shrink-0 text-white min-h-[85vh]">
      <div className="p-8 border-b border-indigo-900/50 flex items-center justify-center">
        <h2 className="text-xl font-black text-white tracking-widest uppercase">Eğitmen Konsolu</h2>
      </div>

      <nav className="flex-grow p-6 space-y-2 overflow-y-auto">
        <button onClick={() => navigate('/egitmen-panel')} className={getNavClass('/egitmen-panel')}>
          <LayoutDashboard className={getIconClass('/egitmen-panel')} />
          Genel Bakış
        </button>
        <button onClick={() => navigate('/egitmen-ogrenciler')} className={getNavClass('/egitmen-ogrenciler')}>
          <Users className={getIconClass('/egitmen-ogrenciler')} />
          Öğrencilerim
        </button>
        <button onClick={() => navigate('/egitmen-degerlendirme')} className={getNavClass('/egitmen-degerlendirme')}>
          <ClipboardCheck className={getIconClass('/egitmen-degerlendirme')} />
          Sınav Değerlendirme
        </button>
        <button onClick={() => navigate('/egitmen-materyal')} className={getNavClass('/egitmen-materyal')}>
          <FilePlus className={getIconClass('/egitmen-materyal')} />
          Materyal Gönder
        </button>
        <button onClick={() => navigate('/egitmen-canli')} className={getNavClass('/egitmen-canli')}>
          <Video className={getIconClass('/egitmen-canli')} />
          Canlı Yayın
        </button>
        <button onClick={() => navigate('/egitmen-duyurular')} className={getNavClass('/egitmen-duyurular')}>
          <Megaphone className={getIconClass('/egitmen-duyurular')} />
          Duyurular
        </button>
      </nav>

      {/* Kullanıcı Profili (Alt Kısım) */}
      <div className="p-6 border-t border-indigo-900/50 bg-indigo-950/80 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-800 flex items-center justify-center text-white font-bold text-lg shadow-inner">
            E
          </div>
          <div>
            <p className="text-sm font-bold text-white">Eğitmen Hesabı</p>
            <p className="text-xs text-indigo-300">TÖMER Uzaktan Eğitim</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default InstructorSidebar;
