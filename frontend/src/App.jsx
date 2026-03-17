import React, { useState, useEffect } from 'react';
import TomerApi from './services/TomerApi';
import Header from './components/Header';
import Footer from './components/Footer';
import WarningCard from './components/WarningCard';
import ApplicationDetails from './components/ApplicationDetails';
import PersonalDetails from './components/PersonalDetails';
import StatusMessage from './components/StatusMessage';
import BankInfo from './components/BankInfo';
import SubmitButton from './components/SubmitButton';

function App() {
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

  const [options, setOptions] = useState({
    diller: [],
    seviyeler: [],
    subeler: [],
    uyruklar: []
  });

  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await TomerApi.fetchAllFormOptions();
        setOptions({
          diller: data.diller || [],
          seviyeler: data.seviyeler || [],
          subeler: data.subeler || [],
          uyruklar: data.uyruklar || [],
          indirimler: data.indirimler || [],
          sinavTurleri: data.sinavTurleri || []
        });
      } catch (error) {
        console.error('Error fetching form options:', error);
      }
    };

    fetchOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
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
    e.preventDefault();
    setSubmitStatus('submitting');

    const submitData = new FormData();

    // 1. Kural 1: Her zaman gönderilecek temel kişisel veriler ve onaylar
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

    // 2. Kural 2: Senaryolara Göre Dinamik Alanlar
    const isKurs = formData.basvuru_tipi === 'Kurs Ön Kayıt';
    const isSinav = formData.basvuru_tipi === 'Sınav Ön Kayıt';
    const isYuzYuze = formData.egitim_sekli === 'Yüz Yüze';
    const isCevrimIci = formData.egitim_sekli === 'Çevrim İçi';

    if (isKurs && isYuzYuze) {
      // SENARYO A
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
      // SENARYO B
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
      // SENARYO C
      submitData.append('dil', formData.dil || '');
      submitData.append('sinav_turu', formData.sinav_turu || '');
      submitData.append('sube', formData.sube || '');
      submitData.append('kayit_bilgi_notu', formData.kayit_bilgi_notu || '');
      if (files?.identityDoc) submitData.append('kimlik_dosyasi', files.identityDoc);
    } 
    else if (isSinav && isCevrimIci) {
      // SENARYO D
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
      // Kural 4: Tek merkezden /api/basvuru-yap/ adresine gönderim
      const response = await TomerApi.submitApplication('basvuru-yap/', submitData);

      if (response.status === 201 || response.status === 200) {
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Submission error:', error);

      // CRITICAL LOGGING: To catch Django rejection reasons.
      if (error.response?.data) {
        console.error("DJANGO VALIDATION ERROR:", JSON.stringify(error.response.data));
      }

      setSubmitStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-slate-200 text-slate-800">

      <Header />

      <main className="flex-grow flex items-center justify-center p-4 md:p-10 relative overflow-hidden">
        {/* Ambient Decorative Blobs */}
        <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob"></div>
        <div className="absolute top-[20%] right-[5%] w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>

        <div className="w-full max-w-4xl bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 relative z-10 overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-emerald-400 to-teal-400 absolute top-0 left-0"></div>

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
              <BankInfo />
              <SubmitButton submitStatus={submitStatus} />
            </div>

          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
