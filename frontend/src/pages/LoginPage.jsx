import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/DAİRESEL LOGO.png';
import TomerApi from '../services/TomerApi';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { Loader2, AlertCircle, CheckCircle2, User, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'instructor'
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData({ username: '', password: '' });
    setStatus('idle');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setErrorMessage('Lütfen tüm alanları doldurun.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    if (activeTab === 'student') {
      try {
        // Doğrudan axios ile accounts login endpoint'ine gidiyoruz
        const response = await axios.post('http://127.0.0.1:8000/api/accounts/login/student/', {
          tc_pasaport_no: formData.username,
          password: formData.password
        });

        if (response.status === 200) {
          setStatus('success');

          if (response.data.access) {
            localStorage.setItem('access', response.data.access);
            localStorage.setItem('access_token', response.data.access);
            // Axios anlık hafıza güncellemesi (Global interceptorlara bırakmadan işlemi garantiye alıyoruz)
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
          }
          if (response.data.refresh) {
            localStorage.setItem('refresh', response.data.refresh);
            localStorage.setItem('refresh_token', response.data.refresh);
          }

          dispatch(login(response.data));

          if (response.data.user) {
            localStorage.setItem('studentName', `${response.data.user.ad} ${response.data.user.soyad}`);
            localStorage.setItem('is_active', 'true');
          }

          navigate('/ogrenci-panel');
        } else {
          setStatus('error');
          setErrorMessage(response.data?.error || 'Giriş başarısız.');
        }
      } catch (error) {
        setStatus('error');
        const msg = error.response?.data?.error || error.response?.data?.detail || 'Sunucu ile bağlantı kurulamadı.';
        setErrorMessage(msg);
      }
    } else {
      // Akademisyen Girişi
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/accounts/login/instructor/', {
          username: formData.username,
          password: formData.password
        });

        if (response.status === 200) {
          setStatus('success');

          if (response.data.access) {
            localStorage.setItem('access', response.data.access);
            localStorage.setItem('access_token', response.data.access);
            // Axios anlık hafıza güncellemesi
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
          }
          if (response.data.refresh) {
            localStorage.setItem('refresh', response.data.refresh);
            localStorage.setItem('refresh_token', response.data.refresh);
          }

          dispatch(login(response.data));

          if (response.data.user) {
            localStorage.setItem('instructorName', `${response.data.user.ad} ${response.data.user.soyad}`);
            localStorage.setItem('is_active', 'true');
          }

          // Yönlendirme mantığı: İlk giriş ise şifre belirlemeye yolla
          if (response.data.is_first_login) {
            setTimeout(() => navigate('/sifre-belirle'), 1000);
          } else {
            setTimeout(() => navigate('/egitmen-panel'), 1000);
          }
        } else {
          setStatus('error');
          setErrorMessage(response.data?.error || 'Giriş başarısız.');
        }
      } catch (error) {
        setStatus('error');
        const msg = error.response?.data?.error || error.response?.data?.detail || 'Sunucu ile bağlantı kurulamadı.';
        setErrorMessage(msg);
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl overflow-hidden relative z-10 mx-auto">
      <div className="h-2 w-full bg-gradient-to-r from-blue-700 to-slate-900"></div>

      <div className="p-8">
        <div className="flex flex-col items-center justify-center mb-8">
          <img
            src={logo}
            alt="Turgut Özal University Logo"
            className="h-20 object-contain drop-shadow-sm mb-2"
          />
          <h2 className="text-xl font-bold tracking-tight text-slate-800 text-center">
            {activeTab === 'student' ? 'Öğrenci Bilgi Sistemi' : 'Eğitmen Bilgi Sistemi'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">Sisteme giriş yapmak için bilgilerinizi giriniz.</p>
        </div>

        {/* Tab Menüsü */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
          <button
            type="button"
            onClick={() => handleTabChange('student')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'student'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
          >
            <GraduationCap className="w-4 h-4" />
            Öğrenci
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('instructor')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'instructor'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
          >
            <User className="w-4 h-4" />
            Akademisyen
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'student' ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Öğrenci Kimlik / Pasaport No
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Kimlik veya Pasaport No"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Şifreniz"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Kurumsal E-Posta / Sicil No
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="ornek@ozal.edu.tr veya Sicil No"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Şifreniz"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </>
          )}

          {status === 'error' && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{errorMessage}</div>
            </div>
          )}

          {status === 'success' && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 font-medium">Giriş başarılı! Yönlendiriliyorsunuz...</div>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full flex items-center justify-center py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Giriliyor...
              </>
            ) : (
              'OTURUM AÇ'
            )}
          </button>
        </form>

        {activeTab === 'student' && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Hesabınız yok mu?{' '}
              <button
                onClick={() => navigate('/')}
                type="button"
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline inline-flex items-center transition-all"
              >
                Kayıt Ol
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
