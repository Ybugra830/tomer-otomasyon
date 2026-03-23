import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/DAİRESEL LOGO.png';
import TomerApi from '../services/TomerApi';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    tc_pasaport_no: '',
    soyad: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target; // Hangi kutuya yazıldı (name) ve ne yazıldı (value)?
    setFormData(prev => ({
      ...prev,        // Çuvaldaki diğer bilgiyi silme (örn: soyad yazarken TC'yi silme)
      [name]: value   // Sadece işlem yapılan kutuyu güncelle
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tc_pasaport_no || !formData.soyad) {
      setErrorMessage('Lütfen tüm alanları doldurun.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await TomerApi.ogrenciLogin(formData);
      if (response.status === 200) {
        setStatus('success');
        dispatch(login(response.data)); // Update global Auth state

        // Redirect to a dashboard or home after successful login
        // For now, redirect to '/' just to show it works, or you could keep them on a success screen
        setTimeout(() => navigate('/'), 1500);
      } else {
        setStatus('error');
        setErrorMessage(response.data?.error || 'Giriş başarısız.');
      }
    } catch (error) {
      setStatus('error');
      const msg = error.response?.data?.error || 'Sunucu ile bağlantı kurulamadı.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl overflow-hidden relative z-10 mx-auto">
      <div className="h-2 w-full bg-gradient-to-r from-blue-700 to-slate-900"></div>

      <div className="p-8">
        <div className="flex flex-col items-center justify-center mb-10">
          <img
            src={logo}
            alt="Turgut Özal University Logo"
            className="h-20 object-contain drop-shadow-sm mb-2"
          />
          <h2 className="text-xl font-bold tracking-tight text-slate-800 text-center">
            Öğrenci Bilgi Sistemi
          </h2>
          <p className="text-sm text-slate-500 mt-1">Sisteme giriş yapmak için bilgilerinizi giriniz.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Öğrenci Pasaport / Kimlik No
            </label>
            <input
              type="text"
              name="tc_pasaport_no"
              value={formData.tc_pasaport_no}
              onChange={handleInputChange}
              placeholder="Öğrenci Kimlik NO"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Öğrenci Soyadı
            </label>
            <input
              type="text"
              name="soyad"
              value={formData.soyad}
              onChange={handleInputChange}
              placeholder="Öğrenci Soyadı"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>

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
      </div>
    </div>
  );
}
