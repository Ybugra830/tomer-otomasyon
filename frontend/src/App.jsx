import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    kayit_bilgi_notu: '',
    indirim: '',
    onay_bilgiler_dogru: false,
    onay_sorumluluk: false,
    onay_fatura: false,
    onay_kursiyerlik: false,
    basvuru_tipi: 'Kurs Ön Kayıt',
    egitim_sekli: 'Yüz Yüze',
    dil: '',
    seviye: '',
    sube: ''
  });

  const [files, setFiles] = useState({
    identityDoc: null,
    discountDoc: null
  });

  const [options, setOptions] = useState({
    diller: [],
    seviyeler: [],
    subeler: []
  });

  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [dillerRes, seviyelerRes, subelerRes] = await Promise.all([
          axios.get('http://localhost:8000/api/diller/').catch(() => ({ data: [] })),
          axios.get('http://localhost:8000/api/seviyeler/').catch(() => ({ data: [] })),
          axios.get('http://localhost:8000/api/subeler/').catch(() => ({ data: [] })),
        ]);

        setOptions({
          diller: dillerRes.data || [],
          seviyeler: seviyelerRes.data || [],
          subeler: subelerRes.data || [],
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

    // Map Kimlik Tipi properly to Django choices (if UI choice is different, map it here, but they seem to match. Let's send exactly what's in state)
    // The error says "T.C. Kimlik Kartı" is not a valid choice. Let's fix mapping if backend expects something else, like 'TC', 'Yabancı', 'Pasaport', vb.
    // If we assume backend expects the exact strings from the frontend, it might just be the quotes or exact Match issue.
    // I will log and keep it strict to formData.kimlik_tipi. User didn't specify the exact Django mapping string, just requested: submitData.append('kimlik_tipi', formData.<YOUR_IDENTITY_TYPE_KEY>);
    submitData.append('tc_pasaport_no', formData.tc_pasaport_no || '');
    submitData.append('kimlik_tipi', formData.kimlik_tipi || '');
    submitData.append('ad', formData.ad || '');
    submitData.append('soyad', formData.soyad || '');
    submitData.append('eposta', formData.eposta || '');

    // Map existing React state properties if they are defined, else provide empty string
    submitData.append('telefon1', formData.telefon1 || '');
    submitData.append('baba_adi', formData.baba_adi || '');
    submitData.append('anne_adi', formData.anne_adi || '');
    submitData.append('dogum_yeri', formData.dogum_yeri || '');
    submitData.append('dogum_tarihi', formData.dogum_tarihi || '');
    submitData.append('uyruk', formData.uyruk || '');

    submitData.append('dil', formData.dil || '');
    submitData.append('seviye', formData.seviye || '');
    submitData.append('sube', formData.sube || '');
    submitData.append('egitim_sekli', formData.egitim_sekli || '');
    submitData.append('basvuru_tipi', formData.basvuru_tipi || '');

    // Yeni Eklenen Alanlar
    submitData.append('telefon2', formData.telefon2 || '');
    submitData.append('kayit_bilgi_notu', formData.kayit_bilgi_notu || '');
    submitData.append('indirim', formData.indirim || '');
    submitData.append('onay_bilgiler_dogru', formData.onay_bilgiler_dogru ? 'True' : 'False');
    submitData.append('onay_sorumluluk', formData.onay_sorumluluk ? 'True' : 'False');
    submitData.append('onay_fatura', formData.onay_fatura ? 'True' : 'False');
    submitData.append('onay_kursiyerlik', formData.onay_kursiyerlik ? 'True' : 'False');

    // Check if 'files' state exists in scope before appending file documents
    if (typeof files !== 'undefined' && files) {
      if (files.identityDoc) submitData.append('kimlik_dosyasi', files.identityDoc);
      if (files.discountDoc) submitData.append('indirim_belgesi', files.discountDoc);
    }

    try {
      const response = await axios.post('http://localhost:8000/api/aday-kayit/', submitData, {
        // FormData automatically handles the Content-Type boundary correctly.
      });

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
