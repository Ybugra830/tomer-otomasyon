import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  BookOpen,
  LayoutDashboard,
  ClipboardList,
  Award,
  User,
  Bell,
  Video,
  MessageSquare,
  FileBadge,
  Target
} from 'lucide-react';

const StudentSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const kisiselBilgiler = useSelector((state) => state.student.kisiselBilgiler);

  const studentName = kisiselBilgiler?.adSoyad || localStorage.getItem('studentName') || 'Öğrenci';
  const isActiveUser = localStorage.getItem('is_active') === 'true';

  // Aktif sayfa durumunu kontrol eden yardımcı fonksiyon
  const getNavClass = (path) => {
    const isActive = location.pathname === path || (path === '/ogrenci-panel' && location.pathname === '/');
    return isActive
      ? "w-full flex items-center gap-3 p-4 rounded-xl bg-indigo-50 text-indigo-700 font-semibold transition-all"
      : "w-full flex items-center gap-3 p-4 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-all group";
  };

  const getIconClass = (path) => {
    const isActive = location.pathname === path || (path === '/ogrenci-panel' && location.pathname === '/');
    return isActive
      ? "w-5 h-5"
      : "w-5 h-5 text-slate-400 group-hover:text-indigo-500";
  };

  return (
    <aside className="w-full md:w-72 bg-white shadow-lg flex flex-col border-r border-slate-100 relative z-10 shrink-0">
      <div className="p-8 border-b border-slate-100 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">UZEM Paneli</h2>
      </div>
      <nav className="flex-grow p-6 space-y-2 overflow-y-auto">
        {isActiveUser && (
          <>
            <button onClick={() => navigate('/ogrenci-panel')} className={getNavClass('/ogrenci-panel')}>
              <LayoutDashboard className={getIconClass('/ogrenci-panel')} />
              Gösterge Paneli
            </button>
            <button onClick={() => navigate('/materyaller')} className={getNavClass('/materyaller')}>
              <BookOpen className={getIconClass('/materyaller')} />
              Ders Materyalleri
            </button>
            <button onClick={() => navigate('/canli-dersler')} className={`${getNavClass('/canli-dersler')} justify-between`}>
              <div className="flex items-center gap-3">
                <Video className={getIconClass('/canli-dersler')} />
                Canlı Dersler
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                CANLI
              </span>
            </button>
            <button onClick={() => navigate('/aktif-sinavlarim')} className={getNavClass('/aktif-sinavlarim')}>
              <ClipboardList className={getIconClass('/aktif-sinavlarim')} />
              Aktif Sınavlarım
            </button>
            <button onClick={() => navigate('/sinav-sonuclari')} className={getNavClass('/sinav-sonuclari')}>
              <Award className={getIconClass('/sinav-sonuclari')} />
              Sınav Sonuçları
            </button>
            <button onClick={() => navigate('/egitmen-gorevleri')} className={`${getNavClass('/egitmen-gorevleri')} justify-between`}>
              <div className="flex items-center gap-3">
                <Target className={getIconClass('/egitmen-gorevleri')} />
                Eğitmen Görevleri
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-600 rounded-full flex items-center shadow-sm">
                1 Yeni
              </span>
            </button>
            <button onClick={() => navigate('/duyurular')} className={getNavClass('/duyurular')}>
              <Bell className={getIconClass('/duyurular')} />
              Duyurular
            </button>
            <button onClick={() => navigate('/mesajlar')} className={getNavClass('/mesajlar')}>
              <MessageSquare className={getIconClass('/mesajlar')} />
              Hocaya Sor / Mesajlar
            </button>
            <button onClick={() => navigate('/sertifikalar')} className={getNavClass('/sertifikalar')}>
              <FileBadge className={getIconClass('/sertifikalar')} />
              Sertifikalarım
            </button>
          </>
        )}

        {isActiveUser && (
          <button onClick={() => navigate('/profil')} className={getNavClass('/profil')}>
            <User className={getIconClass('/profil')} />
            Profilim
          </button>
        )}
      </nav>

      {/* User profile brief at bottom of sidebar */}
      <div className="p-6 border-t border-slate-100 bg-slate-50 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
            {studentName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{studentName}</p>
            <p className="text-xs text-slate-500">Öğrenci</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default StudentSidebar;
