import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Info, UserPlus, Trash2, Users, PlusCircle } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const AddInstructor = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'add'

  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/accounts/instructor/list/');
      setInstructors(response.data);
    } catch (error) {
      console.error("Eğitmenler listelenirken hata oluştu:", error);
    }
  };

  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    tc: '',
    email: '',
    sicil: '',
    brans: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDelete = (id) => {
    setInstructors(prev => prev.filter(inst => inst.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        first_name: formData.ad,
        last_name: formData.soyad,
        username: formData.tc, // TC is used as username/password default
        email: formData.email,
        sicil_no: formData.sicil,
        department: formData.brans
      };

      const response = await axios.post('http://127.0.0.1:8000/api/accounts/instructor/create/', payload);
      alert(response.data.message || `Eğitmen başarıyla eklendi, varsayılan şifre: ${formData.tc}`);

      setActiveTab('list');
      setFormData({ ad: '', soyad: '', tc: '', email: '', sicil: '', brans: '' });
      fetchInstructors(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.error || "Eğitmen eklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row min-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-200">

      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-grow bg-slate-50 p-6 md:p-10 overflow-auto">
        <div className="max-w-5xl mx-auto">

          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
            Eğitmen Yönetimi
          </h1>
          <p className="text-slate-500 font-medium mb-8">Sistemde yer alan akademisyenleri görüntüleyin veya yeni eğitmen ataması yapın.</p>

          {/* Tab Menüsü */}
          <div className="flex gap-2 bg-slate-200/50 p-1 rounded-xl w-max mb-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'list'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
            >
              <Users className="w-4 h-4" />
              Sistemdeki Eğitmenler
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'add'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
            >
              <PlusCircle className="w-4 h-4" />
              Yeni Eğitmen Ekle
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

            {activeTab === 'list' ? (
              /* Eğitmen Listesi Tablosu */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                      <th className="px-6 py-4">Ad Soyad</th>
                      <th className="px-6 py-4">E-Posta</th>
                      <th className="px-6 py-4">Departman</th>
                      <th className="px-6 py-4 text-center">Durum</th>
                      <th className="px-6 py-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {instructors.length > 0 ? (
                      instructors.map((instructor) => (
                        <tr key={instructor.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{instructor.full_name}</div>
                            <div className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">{instructor.sicil_no}</div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600 text-sm">
                            {instructor.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-bold border border-slate-200">
                              {instructor.department_display}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block w-max ${instructor.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}>
                              {instructor.is_active ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDelete(instructor.id)}
                              title="Eğitmeni Sil"
                              className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-colors shadow-sm inline-flex"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                          Sistemde kayıtlı eğitmen bulunmamaktadır.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Yeni Eğitmen Ekleme Formu */
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Ad</label>
                      <input
                        type="text"
                        name="ad"
                        value={formData.ad}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-slate-50"
                        placeholder="Eğitmen Adı"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Soyad</label>
                      <input
                        type="text"
                        name="soyad"
                        value={formData.soyad}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-slate-50"
                        placeholder="Eğitmen Soyadı"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">TC Kimlik No</label>
                      <input
                        type="text"
                        name="tc"
                        value={formData.tc}
                        onChange={handleChange}
                        required
                        maxLength={11}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-slate-50"
                        placeholder="11 Haneli TC Kimlik Numarası"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Kurumsal E-Posta</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-slate-50"
                        placeholder="ornek@ozal.edu.tr"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Sicil Numarası</label>
                      <input
                        type="text"
                        name="sicil"
                        value={formData.sicil}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-slate-50"
                        placeholder="Kurum Sicil No"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Branş / Departman</label>
                      <select
                        name="brans"
                        value={formData.brans}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-slate-50 text-slate-700"
                      >
                        <option value="" disabled>Departman Seçiniz</option>
                        <option value="turkce">Türkçe Öğretimi (TÖMER)</option>
                        <option value="ingilizce">İngilizce Hazırlık Koordinatörlüğü</option>
                        <option value="almanca">Almanca Hazırlık Koordinatörlüğü</option>
                        <option value="diger">Diğer</option>
                      </select>
                    </div>
                  </div>

                  {/* Güvenlik Politikası Uyarı Kutusu */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 mt-6">
                    <Info className="w-6 h-6 text-blue-600 shrink-0" />
                    <p className="text-sm text-blue-800 font-medium leading-relaxed">
                      <strong className="font-bold">Güvenlik Politikası:</strong> Sisteme eklenen her eğitmen için varsayılan şifre otomatik olarak TC Kimlik Numarası atanacaktır. Eğitmen sisteme ilk giriş yaptığında şifresini değiştirmek zorundadır.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 px-8 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <UserPlus className="w-5 h-5" />
                      {loading ? 'Kaydediliyor...' : 'Eğitmeni Kaydet'}
                    </button>
                  </div>

                </form>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
};

export default AddInstructor;
