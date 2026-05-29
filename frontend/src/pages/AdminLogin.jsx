import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
        username,
        password
      });

      if (response.data.access) {
        localStorage.setItem('adminToken', response.data.access);
        navigate('/admin-panel');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-8 border border-slate-100 mt-10 mb-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Admin Girişi</h2>
        <p className="text-slate-500 mt-2">Sadece yetkili personel içindir.</p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-lg mb-6 text-sm font-medium border border-rose-100">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Kullanıcı Adı</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Kullanıcı adınızı girin"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Şifre</label>
          <input
            type="password"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Şifrenizi girin"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg shadow-md transition-all focus:ring-4 focus:ring-slate-200 disabled:opacity-70"
        >
          {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
