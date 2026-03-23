import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOptions } from '../store/slices/optionsSlice';
import TomerApi from '../services/TomerApi';
import WarningCard from '../components/WarningCard';
import ApplicationDetails from '../components/ApplicationDetails';
import PersonalDetails from '../components/PersonalDetails';
import StatusMessage from '../components/StatusMessage';
import SubmitButton from '../components/SubmitButton';

export default function RegistrationPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tc_pasaport_no: '',
    kimlik_tipi: 'TC',
    ad: '',
    soyad: '',
    eposta: '',
    telefon1: '',
    telefon2: '',
    baba_adi: '',
    anne_adi: '',
    dogum_yeri: '',
    dogum_tarihi: '',
    uyruk: '',
    kayit_bilgi_notu: '',
    indirim: '',
    indirim_kodu: '',
    vize_turu: '',
    vize_baslangic: '',
    vize_bitis: '',
    kayit_turu: '',
    ulke_adresi: '',
    turkiye_adresi: '',
    ulke_telefonu: '',
    onay_bilgiler_dogru: false,
    onay_sorumluluk: false,
    onay_fatura: false,
    onay_kursiyerlik: false,
    basvuru_tipi: 'Kurs Ön Kayıt',
    egitim_sekli: 'Yüz Yüze',
    dil: '',
    seviye: '',
    sinav_turu: '',
    sube: ''
  });

  const [files, setFiles] = useState({
    identityDoc: null,
    discountDoc: null
  });

  const dispatch = useDispatch();
  const options = useSelector((state) => state.options.data);
  const optionsLoading = useSelector((state) => state.options.loading);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    dispatch(fetchOptions());
  }, [dispatch]);

  const handleInputChange = (e) => {
    // e.target = O an kullanıcının işlem yaptığı kutucuk (input)
    // Kutucuğun "name" (adı), "value" (içindeki yazı), "type" (tipi) bilgilerini alıyoruz.
    const { name, value, type, checked } = e.target;

    // setFormData ile form çuvalımızı güncelliyoruz
    setFormData(prev => ({
      ...prev, // Çuvalın içindeki eski bilgileri silme, aynen tut (...prev)
      // Hangi kutuya (name) işlem yapıldıysa, sadece onun değerini değiştir!
      // Eğer kutu bir checkbox (onay kutusu) ise "checked" durumunu al, değilse normal yazıyı (value) al.
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles(prev => ({
        ...prev,
        [name]: selectedFiles[0]
      }));
    }
  };
  const handleSubmit = async (e) => {
    // 1. Formun klasik HTML mantığıyla sayfayı yenilemesini (F5 atmasını) engeller.
    e.preventDefault();

    // 2. Butonun içindeki yazıyı "Bekleyiniz..." yapmak ve animasyonu başlatmak için durumu günceller.
    setSubmitStatus('submitting');

    // ... (Buradan sonra veriler paketlenip Django'ya yollanır)

    const submitData = new FormData();

    const baseFields = [
      'tc_pasaport_no', 'kimlik_tipi', 'ad', 'soyad', 'eposta',
      'telefon1', 'telefon2', 'baba_adi', 'anne_adi', 'dogum_yeri',
      'dogum_tarihi', 'uyruk', 'basvuru_tipi', 'egitim_sekli'
    ];
    baseFields.forEach(field => {
      submitData.append(field, formData[field] || '');
    });

    submitData.append('onay_bilgiler_dogru', formData.onay_bilgiler_dogru ? 'True' : 'False');
    submitData.append('onay_sorumluluk', formData.onay_sorumluluk ? 'True' : 'False');
    submitData.append('onay_fatura', formData.onay_fatura ? 'True' : 'False');
    submitData.append('onay_kursiyerlik', formData.onay_kursiyerlik ? 'True' : 'False');

    const isKurs = formData.basvuru_tipi === 'Kurs Ön Kayıt';
    const isSinav = formData.basvuru_tipi === 'Sınav Ön Kayıt';
    const isYuzYuze = formData.egitim_sekli === 'Yüz Yüze';
    const isCevrimIci = formData.egitim_sekli === 'Çevrim İçi';

    if (isKurs && isYuzYuze) {
      submitData.append('dil', formData.dil || '');
      submitData.append('seviye', formData.seviye || '');
      submitData.append('sube', formData.sube || '');
      submitData.append('indirim', formData.indirim || '');
      submitData.append('indirim_kodu', formData.indirim_kodu || '');
      submitData.append('kayit_bilgi_notu', formData.kayit_bilgi_notu || '');
      if (files?.identityDoc) submitData.append('kimlik_dosyasi', files.identityDoc);
      if (files?.discountDoc) submitData.append('indirim_belgesi', files.discountDoc);
    }
    else if (isKurs && isCevrimIci) {
      submitData.append('dil', formData.dil || '');
      submitData.append('seviye', formData.seviye || '');
      submitData.append('sube', formData.sube || '');
      submitData.append('indirim', formData.indirim || '');
      submitData.append('indirim_kodu', formData.indirim_kodu || '');
      submitData.append('kayit_bilgi_notu', formData.kayit_bilgi_notu || '');
      submitData.append('vize_turu', formData.vize_turu || '');
      submitData.append('kayit_turu', formData.kayit_turu || '');
      submitData.append('vize_baslangic', formData.vize_baslangic || '');
      submitData.append('vize_bitis', formData.vize_bitis || '');
      submitData.append('turkiye_adresi', formData.turkiye_adresi || '');
      submitData.append('ulke_adresi', formData.ulke_adresi || '');
      submitData.append('ulke_telefonu', formData.ulke_telefonu || '');
      if (files?.identityDoc) submitData.append('kimlik_dosyasi', files.identityDoc);
      if (files?.discountDoc) submitData.append('indirim_belgesi', files.discountDoc);
    }
    else if (isSinav && isYuzYuze) {
      submitData.append('dil', formData.dil || '');
      submitData.append('sinav_turu', formData.sinav_turu || '');
      submitData.append('sube', formData.sube || '');
      submitData.append('kayit_bilgi_notu', formData.kayit_bilgi_notu || '');
      if (files?.identityDoc) submitData.append('kimlik_dosyasi', files.identityDoc);
    }
    else if (isSinav && isCevrimIci) {
      submitData.append('dil', formData.dil || '');
      submitData.append('sinav_turu', formData.sinav_turu || '');
      submitData.append('sube', formData.sube || '');
      submitData.append('kayit_bilgi_notu', formData.kayit_bilgi_notu || '');
      submitData.append('vize_turu', formData.vize_turu || '');
      submitData.append('vize_baslangic', formData.vize_baslangic || '');
      submitData.append('vize_bitis', formData.vize_bitis || '');
      submitData.append('turkiye_adresi', formData.turkiye_adresi || '');
      submitData.append('ulke_adresi', formData.ulke_adresi || '');
      submitData.append('ulke_telefonu', formData.ulke_telefonu || '');
      if (files?.identityDoc) submitData.append('kimlik_dosyasi', files.identityDoc);
    }

    try {
      const response = await TomerApi.submitApplication('basvuru-yap/', submitData);

      if (response.status === 201 || response.status === 200) {
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      if (error.response?.data) {
        console.error("DJANGO VALIDATION ERROR:", JSON.stringify(error.response.data));
      }
      setSubmitStatus('error');
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 relative z-10 overflow-hidden mt-8 md:mt-0 mx-auto">
      <div className="h-2 w-full bg-gradient-to-r from-blue-700 to-slate-900 absolute top-0 left-0"></div>

      <div className="flex justify-between items-center px-6 md:px-10 pt-8 pb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Kayıt Formu</h2>
          <p className="text-slate-500 mt-1">Lütfen bilgilerinizi eksiksiz doldurun.</p>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-white text-blue-700 font-semibold border border-blue-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl transition-all shadow-sm"
        >
          Giriş Yap
        </button>
      </div>

      <WarningCard />

      <form onSubmit={handleSubmit} className="px-6 md:px-10 pb-10 space-y-12">
        <ApplicationDetails
          formData={formData}
          handleInputChange={handleInputChange}
          options={options}
        />

        <PersonalDetails
          formData={formData}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
          options={options}
        />

        <StatusMessage submitStatus={submitStatus} />

        <div className="pt-6 border-t border-slate-200/60">
          <SubmitButton submitStatus={submitStatus} />
        </div>
      </form>
    </div>
  );
}
