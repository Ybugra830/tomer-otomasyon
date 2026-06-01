import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/DAİRESEL LOGO.png';
import { ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';

export default function ForcePasswordChange() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor. Lütfen tekrar kontrol edin.');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    try {
      setError('');
      // Backend'deki `new_password` anahtarına dikkat
      const response = await axios.post('http://127.0.0.1:8000/api/accounts/instructor/change-password/', {
        new_password: formData.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('access')}`
        }
      });

      alert(response.data.message || 'Şifreniz başarıyla güncellendi! Konsola yönlendiriliyorsunuz.');
      navigate('/egitmen-panel');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Şifre güncellenirken bir hata oluştu');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* Header */}
      <header className="bg-slate-900 py-4 px-6 shadow-md z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Turgut Özal University Logo" className="h-12 object-contain" />
            <div className="hidden md:block">
              <h1 className="text-white font-bold text-lg leading-tight tracking-wide">
                MALATYA TURGUT ÖZAL ÜNİVERSİTESİ
              </h1>
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider">
                Uzaktan Eğitim Sistemi
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl overflow-hidden relative z-10 mx-auto">
          <div className="h-2 w-full bg-gradient-to-r from-rose-600 to-slate-900"></div>

          <div className="p-8">
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="bg-rose-100 p-3 rounded-full mb-3">
                <ShieldAlert className="w-8 h-8 text-rose-600" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-800 text-center">
                Zorunlu Şifre Değişikliği
              </h2>
              <p className="text-sm text-slate-500 mt-2 text-center">
                Güvenliğiniz için lütfen sistem tarafından verilen varsayılan şifrenizi güncelleyin.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Yeni Şifre
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Yeni şifrenizi girin"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                  />
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Yeni Şifre (Tekrar)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Şifrenizi tekrar girin"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                  />
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 text-sm font-medium rounded-lg border border-rose-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5"
              >
                Şifremi Güncelle ve Giriş Yap
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Malatya Turgut Özal Üniversitesi. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>

    </div>
  );
}
