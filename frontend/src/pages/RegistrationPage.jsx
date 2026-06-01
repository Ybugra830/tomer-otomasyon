import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    identityNo: '',
    email: '',
    phone: '',
    password: '',
    language: 'Türkçe',
    level: 'A1'
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [identifyDocument, setIdentifyDocument] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    const formDataToSend = new FormData();
    formDataToSend.append('firstName', formData.firstName);
    formDataToSend.append('lastName', formData.lastName);
    formDataToSend.append('identityNo', formData.identityNo);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('language', formData.language);
    formDataToSend.append('level', formData.level);
    formDataToSend.append('applicationType', 'KURS_ON_KAYIT');
    formDataToSend.append('educationMode', 'CEVRIM_ICI');

    if (identifyDocument) {
      formDataToSend.append('identify_document', identifyDocument);
    }

    try {
      // TomerApi veya global axios kullanmıyoruz ki içeride kalan eski token Registration isteğini engellemesin
      const cleanAxios = axios.create();
      const response = await cleanAxios.post(
        'http://127.0.0.1:8000/api/accounts/register/student/',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (response.status === 201 || response.status === 200) {
        setStatus({
          type: 'success',
          message: 'Kaydınız başarıyla alındı! Şimdi giriş yapabilirsiniz.'
        });
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyiniz.';
      setStatus({
        type: 'error',
        message: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Öğrenci Kayıt Formu
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Buradan giriş yapın
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-200 relative overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-blue-700 to-slate-900 absolute top-0 left-0"></div>

          {status.message && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-semibold flex items-start gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'} border`}>
              <span>{status.message}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Ad</label>
                <div className="mt-1">
                  <input
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Adınız"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Soyad</label>
                <div className="mt-1">
                  <input
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Soyadınız"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">T.C. Kimlik / Pasaport No</label>
              <div className="mt-1">
                <input
                  name="identityNo"
                  type="text"
                  required
                  value={formData.identityNo}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Kullanıcı adı olarak kullanılacaktır"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">E-Posta Adresi</label>
              <div className="mt-1">
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="ornek@mail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Telefon Numarası</label>
              <div className="mt-1">
                <input
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Sistem Şifresi</label>
              <div className="mt-1">
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Öğrenmek İstenilen Dil</label>
                <div className="mt-1">
                  <select
                    name="language"
                    required
                    value={formData.language}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="Türkçe">Türkçe</option>
                    <option value="İngilizce">İngilizce</option>
                    <option value="almanca">Almanca</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Mevcut Seviye</label>
                <div className="mt-1">
                  <select
                    name="level"
                    required
                    value={formData.level}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700">Kimlik / Pasaport Belgesi Yükleyin</label>
              <div className="mt-1">
                <input
                  type="file"
                  accept=".png,.jpeg,.jpg,.pdf"
                  required
                  onChange={(e) => setIdentifyDocument(e.target.files[0])}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Kaydediliyor...
                  </span>
                ) : (
                  'Kayıt Ol'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
