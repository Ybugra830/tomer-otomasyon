import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, UploadCloud, Info, CheckCircle2 } from 'lucide-react';

const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        applicationType: 'Kurs Ön Kayıt',
        educationMode: 'Yüz Yüze',
        identityType: 'Pasaport',
        nationality: '',
        language: '',
        level: '',
        branch: '',
        identityNo: '',
        firstName: '',
        lastName: '',
        fatherName: '',
        motherName: '',
        birthPlace: '',
        birthDate: '',
        phone: '',
        email: '',
        telefon1: '',
        terms1: false,
        terms2: false,
        terms3: false,
    });

    const [files, setFiles] = useState({
        identityDoc: null,
        discountDoc: null,
    });

    const [options, setOptions] = useState({
        nationalities: [],
        languages: [],
        levels: [],
        branches: [],
    });

    const [loading, setLoading] = useState(true);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', 'submitting'

    useEffect(() => {
        // Fetch options from API on mount
        const fetchOptions = async () => {
            try {
                const [nationalitiesRes, languagesRes, levelsRes, branchesRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/uyruklar/').catch(() => ({ data: [{ id: 1, name: 'Türkiye' }, { id: 2, name: 'Diğer' }] })),
                    axios.get('http://localhost:8000/api/diller/').catch(() => ({ data: [{ id: 1, name: 'Türkçe' }, { id: 2, name: 'İngilizce' }] })),
                    axios.get('http://localhost:8000/api/seviyeler/').catch(() => ({ data: [{ id: 1, name: 'A1' }, { id: 2, name: 'A2' }, { id: 3, name: 'B1' }, { id: 4, name: 'B2' }, { id: 5, name: 'C1' }] })),
                    axios.get('http://localhost:8000/api/subeler/').catch(() => ({ data: [{ id: 1, name: 'Merkez Kampüs' }, { id: 2, name: 'Şehir Şubesi' }] })),
                ]);

                setOptions({
                    nationalities: nationalitiesRes.data,
                    languages: languagesRes.data,
                    levels: levelsRes.data,
                    branches: branchesRes.data,
                });
            } catch (error) {
                console.error('Error fetching form options:', error);
            } finally {
                setLoading(false);
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
        if (selectedFiles.length > 0) {
            setFiles(prev => ({
                ...prev,
                [name]: selectedFiles[0]
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus('submitting');

        // Construct FormData correctly to handle files and text data
        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            submitData.append(key, formData[key]);
        });

        if (files.identityDoc) submitData.append('identityDoc', files.identityDoc);
        if (files.discountDoc) submitData.append('discountDoc', files.discountDoc);

        const endpoint = formData.applicationType === 'Kurs Ön Kayıt'
            ? 'http://localhost:8000/api/kurs-basvuru/'
            : 'http://localhost:8000/api/aday-kayit/';

        try {
            // Use axios POST wrapper, assuming it's correctly returning responses 
            const response = await axios.post(endpoint, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            setSubmitStatus('success');
            console.log('Submission success:', response.data);
        } catch (error) {
            console.error('Submission error:', error);
            setSubmitStatus('error');
        }
    };

    const FormGroup = ({ label, children }) => (
        <div className="flex flex-col space-y-1">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            {children}
        </div>
    );

    return (
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">

            {/* Warning Box */}
            <div className="bg-red-50 border-l-4 border-red-800 p-4 m-6 rounded-r-md flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-800 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="text-red-900 font-bold text-sm md:text-base">ÖNEMLİ UYARI / IMPORTANT WARNING</h3>
                    <p className="text-red-800 text-sm mt-1">
                        Lütfen formdaki bilgileri <span className="font-bold underline">tamı tamına Pasaportunuzda göründüğü gibi</span> doldurunuz. Hatalı yazılan bilgilerden dolayı doğacak sorunlardan kurumumuz sorumlu değildir. <br />
                        Please fill in the information on the form <span className="font-bold underline">exactly as it appears on your Passport</span>. Our institution is not responsible for problems arising from incorrectly written information.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-8">

                {/* Section 1: Application Details */}
                <section className="space-y-6">
                    <div className="border-b pb-2">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full inline-flex justify-center items-center mr-3 text-sm">1</span>
                            Başvuru Bilgileri / Application Details
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Radio: Application Type */}
                        <FormGroup label="Başvuru Tipi / Application Type *">
                            <div className="flex space-x-4 mt-2">
                                {['Kurs Ön Kayıt', 'Sınav Ön Kayıt'].map(type => (
                                    <label key={type} className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1 transition-colors">
                                        <input
                                            type="radio" name="applicationType" value={type}
                                            checked={formData.applicationType === type} onChange={handleInputChange}
                                            className="text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                                            required
                                        />
                                        <span className="text-sm text-gray-700 font-medium">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </FormGroup>

                        {/* Radio: Education Mode */}
                        <FormGroup label="Eğitim Şekli / Education Mode *">
                            <div className="flex space-x-4 mt-2">
                                {['Yüz Yüze', 'Çevrim İçi'].map(mode => (
                                    <label key={mode} className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1 transition-colors">
                                        <input
                                            type="radio" name="educationMode" value={mode}
                                            checked={formData.educationMode === mode} onChange={handleInputChange}
                                            className="text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                                            required
                                        />
                                        <span className="text-sm text-gray-700 font-medium">{mode}</span>
                                    </label>
                                ))}
                            </div>
                        </FormGroup>

                        <FormGroup label="Dil / Language *">
                            <select name="language" value={formData.language} onChange={handleInputChange} required className="form-select mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2.5 border bg-white">
                                <option value="">Seçiniz / Select</option>
                                {options.languages.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                            </select>
                        </FormGroup>

                        <FormGroup label="Seviye / Level *">
                            <select name="level" value={formData.level} onChange={handleInputChange} required className="form-select mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2.5 border bg-white">
                                <option value="">Seçiniz / Select</option>
                                {options.levels.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                            </select>
                        </FormGroup>

                        <FormGroup label="Şube / Branch *">
                            <select name="branch" value={formData.branch} onChange={handleInputChange} required className="form-select mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2.5 border bg-white">
                                <option value="">Seçiniz / Select</option>
                                {options.branches.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                            </select>
                        </FormGroup>
                    </div>
                </section>

                {/* Section 2: Personal Details */}
                <section className="space-y-6">
                    <div className="border-b pb-2">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full inline-flex justify-center items-center mr-3 text-sm">2</span>
                            Kişisel Bilgiler / Personal Details
                        </h2>
                    </div>

                    {/* Identity Type Radios */}
                    <FormGroup label="Kimlik Tipi / Identity Type *">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                            {['T.C. Kimlik Kartı', 'Yabancı Kimlik Kartı', 'Pasaport', 'ID Kart'].map(type => (
                                <label key={type} className={`flex items-center space-x-2 cursor-pointer p-3 border rounded-lg transition-colors ${formData.identityType === type ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'}`}>
                                    <input
                                        type="radio" name="identityType" value={type}
                                        checked={formData.identityType === type} onChange={handleInputChange}
                                        className="text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                                        required
                                    />
                                    <span className="text-xs sm:text-sm text-gray-700 font-medium truncate" title={type}>{type}</span>
                                </label>
                            ))}
                        </div>
                    </FormGroup>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormGroup label="T.C. / Pasaport No *">
                            <input type="text" name="identityNo" value={formData.identityNo} onChange={handleInputChange} required className="form-input mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 p-2.5 border" placeholder="Kimlik Numaranız..." />
                        </FormGroup>

                        <FormGroup label="Uyruk / Nationality *">
                            <select name="nationality" value={formData.nationality} onChange={handleInputChange} required className="form-select mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 p-2.5 border bg-white">
                                <option value="">Seçiniz / Select</option>
                                {options.nationalities.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                            </select>
                        </FormGroup>

                        <FormGroup label="Ad / Name *">
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="form-input mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 p-2.5 border" />
                        </FormGroup>

                        <FormGroup label="Soyad / Surname *">
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="form-input mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 p-2.5 border" />
                        </FormGroup>

                        <FormGroup label="Baba Adı / Father's Name *">
                            <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} required className="form-input mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 p-2.5 border" />
                        </FormGroup>

                        <FormGroup label="Anne Adı / Mother's Name *">
                            <input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange} required className="form-input mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 p-2.5 border" />
                        </FormGroup>

                        <FormGroup label="Doğum Yeri / Place of Birth *">
                            <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleInputChange} required className="form-input mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 p-2.5 border" />
                        </FormGroup>

                        <FormGroup label="Doğum Tarihi / Date of Birth *">
                            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} required className="form-input mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 p-2.5 border" />
                        </FormGroup>

                        <FormGroup label="Telefon / Phone Number *">
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="form-input mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 p-2.5 border" placeholder="+90 555 555 5555" />
                        </FormGroup>

                        <FormGroup label="E-Posta / E-Mail *">
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="form-input mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 p-2.5 border" placeholder="ornek@mail.com" />
                        </FormGroup>
                    </div>
                </section>

                {/* Section 3: File Uploads */}
                <section className="space-y-6">
                    <div className="border-b pb-2">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full inline-flex justify-center items-center mr-3 text-sm">3</span>
                            Belgeler / Documents
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition relative">
                            <UploadCloud className="w-8 h-8 text-gray-400 mb-2 mx-auto" />
                            <div className="text-center">
                                <span className="text-sm font-semibold text-gray-700 block">Kimlik Dosyası (PDF/JPG) *</span>
                                <span className="text-xs text-gray-500">Identity Document</span>
                            </div>
                            <input
                                type="file" name="identityDoc" onChange={handleFileChange} required
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,image/*"
                            />
                            {files.identityDoc && <p className="text-xs text-green-600 mt-2 text-center font-medium truncate px-2">{files.identityDoc.name}</p>}
                        </div>

                        <div className="flex flex-col border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition relative">
                            <UploadCloud className="w-8 h-8 text-gray-400 mb-2 mx-auto" />
                            <div className="text-center">
                                <span className="text-sm font-semibold text-gray-700 block">İndirim Belgesi (İsteğe Bağlı)</span>
                                <span className="text-xs text-gray-500">Discount Document (Optional)</span>
                            </div>
                            <input
                                type="file" name="discountDoc" onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,image/*"
                            />
                            {files.discountDoc && <p className="text-xs text-green-600 mt-2 text-center font-medium truncate px-2">{files.discountDoc.name}</p>}
                        </div>
                    </div>
                </section>

                {/* Section 4: Terms and Confirmation */}
                <section className="space-y-4">
                    <div className="border-b pb-2">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full inline-flex justify-center items-center mr-3 text-sm">4</span>
                            Onaylar / Confirmations
                        </h2>
                    </div>

                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input type="checkbox" name="terms1" checked={formData.terms1} onChange={handleInputChange} required className="mt-1 w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                            <span className="text-sm text-gray-700 leading-snug">KVKK Aydınlatma Metnini okudum ve kabul ediyorum. (I have read and accept the Personal Data Protection text.) *</span>
                        </label>
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input type="checkbox" name="terms2" checked={formData.terms2} onChange={handleInputChange} required className="mt-1 w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                            <span className="text-sm text-gray-700 leading-snug">Verdiğim bilgilerin eksiksiz ve doğru olduğunu onaylıyorum. (I confirm that the information I have provided is complete and accurate.) *</span>
                        </label>
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input type="checkbox" name="terms3" checked={formData.terms3} onChange={handleInputChange} required className="mt-1 w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                            <span className="text-sm text-gray-700 leading-snug">TÖMER eğitim kural ve şartlarını kabul ediyorum. (I accept the TÖMER education rules and conditions.) *</span>
                        </label>
                    </div>
                </section>

                {/* Status Message */}
                {submitStatus === 'success' && (
                    <div className="bg-green-50 border-green-200 border p-4 rounded-lg flex items-center text-green-700">
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        <p className="font-semibold text-sm">Başvurunuz başarıyla alınmıştır. Gösterdiğiniz ilgi için teşekkür ederiz.</p>
                    </div>
                )}
                {submitStatus === 'error' && (
                    <div className="bg-red-50 border-red-200 border p-4 rounded-lg flex items-center text-red-700">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <p className="font-semibold text-sm">Başvurunuz sırasında bir hata oluştu. Lütfen tekrar deneyin.</p>
                    </div>
                )}

                {/* Bottom Section: Bank Info and Submit */}
                <div className="mt-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-6">
                        <div className="flex items-start space-x-3">
                            <Info className="w-6 h-6 text-red-700 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-red-800 mb-2">Banka ve IBAN Bilgileri / Bank and IBAN Information</h3>
                                <p className="text-sm text-red-900 mb-1"><strong>Banka:</strong> Ziraat Bankası - Turgut Özal Üniversitesi Şubesi</p>
                                <p className="text-sm text-red-900 mb-1"><strong>Alıcı:</strong> T.C. Turgut Özal Üniversitesi TÖMER</p>
                                <div className="bg-white p-2 rounded border border-red-200 mt-2 font-mono text-center text-red-800 font-bold">
                                    TR12 3456 7890 1234 5678 9012 34
                                </div>
                                <p className="text-xs text-red-700 mt-3 italic">* Kayıt ücretini yatırırken açıklama kısmına Ad-Soyad ve Pasaport/TC numaranızı yazmayı unutmayınız.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitStatus === 'submitting'}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-lg md:text-xl py-4 px-6 rounded-lg shadow-md transition-colors duration-200 flex justify-center items-center"
                    >
                        {submitStatus === 'submitting' ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                İşleniyor / Processing...
                            </span>
                        ) : 'GÖNDER / SEND'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default RegistrationForm;
