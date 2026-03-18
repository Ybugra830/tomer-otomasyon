import React, { useState } from 'react';
import logo from '../assets/DAİRESEL LOGO.png';
import TomerApi from '../services/TomerApi';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Login({ onGoToRegister, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    tc_pasaport_no: '',
    soyad: ''
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
        if (onLoginSuccess) {
           // Pass student data to parent if needed
           setTimeout(() => onLoginSuccess(response.data), 1500); 
        }
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
    <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden relative z-10 mx-auto">
      <div className="h-2 w-full bg-gradient-to-r from-emerald-400 to-teal-400"></div>
      
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
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Öğrenci Pasaport / Kimlik No
            </label>
            <input
              type="text"
              name="tc_pasaport_no"
              value={formData.tc_pasaport_no}
              onChange={handleInputChange}
              placeholder="Öğrenci Kimlik NO"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Öğrenci Soyadı
            </label>
            <input
              type="text"
              name="soyad"
              value={formData.soyad}
              onChange={handleInputChange}
              placeholder="Öğrenci Soyadı"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          {status === 'error' && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{errorMessage}</div>
            </div>
          )}

          {status === 'success' && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-700 font-medium">Giriş başarılı! Yönlendiriliyorsunuz...</div>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full flex items-center justify-center py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
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
                  onClick={onGoToRegister} 
                  type="button"
                  className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline inline-flex items-center transition-all"
                >
                    Kayıt Ol
                </button>
            </p>
        </div>
      </div>
    </div>
  );
}
