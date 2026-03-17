import React from 'react';
import FormGroup from './FormGroup';

export default function PersonalDetails({ formData, handleInputChange, handleFileChange, options }) {
    return (
        <section className="space-y-6">
            <div className="flex items-center pb-4 border-b border-slate-200/60">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 font-bold text-lg flex items-center justify-center mr-4 shadow-inner border border-emerald-200/50">2</span>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Kişisel Bilgiler</h2>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-0.5">Personal Details</p>
                </div>
            </div>

            <FormGroup label="Kimlik Tipi / Identity Type *">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                    {[
                        { label: 'T.C. Kimlik Kartı', value: 'TC' },
                        { label: 'Yabancı Kimlik Kartı', value: 'YABANCI' },
                        { label: 'Pasaport', value: 'PASAPORT' },
                        { label: 'ID Kart', value: 'ID_KART' }
                    ].map(type => (
                        <label key={type.value} className={`flex items-center justify-center px-4 py-3 rounded-xl cursor-pointer transition-all border text-center ${formData.kimlik_tipi === type.value ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-inner' : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white hover:border-emerald-300'}`}>
                            <input type="radio" name="kimlik_tipi" value={type.value} checked={formData.kimlik_tipi === type.value} onChange={handleInputChange} className="hidden" required />
                            <span className="text-xs sm:text-sm font-medium leading-tight">{type.label}</span>
                        </label>
                    ))}
                </div>
            </FormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-2">
                <FormGroup label="Ad / Name *">
                    <input type="text" name="ad" value={formData.ad || ''} onChange={handleInputChange} required className="form-input-premium" placeholder="Adınız..." />
                </FormGroup>

                <FormGroup label="Soyad / Surname *">
                    <input type="text" name="soyad" value={formData.soyad || ''} onChange={handleInputChange} required className="form-input-premium" placeholder="Soyadınız..." />
                </FormGroup>

                <FormGroup label="Uyruk / Nationality *">
                    <div className="relative">
                        <select name="uyruk" value={formData.uyruk || ''} onChange={handleInputChange} required className="form-input-premium appearance-none pr-10">
                            <option value="">Seçiniz / Select</option>
                            {options?.uyruklar && options.uyruklar.map(u => (
                                <option key={u.id} value={u.id}>{u.ad}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </FormGroup>

                <FormGroup label="T.C. / Pasaport No *">
                    <input type="text" name="tc_pasaport_no" value={formData.tc_pasaport_no} onChange={handleInputChange} required className="form-input-premium" placeholder="Kimlik Numaranızı giriniz..." />
                </FormGroup>

                <FormGroup label="Baba Adı / Father's Name">
                    <input type="text" name="baba_adi" value={formData.baba_adi || ''} onChange={handleInputChange} className="form-input-premium" placeholder="Baba Adı" />
                </FormGroup>

                <FormGroup label="Anne Adı / Mother's Name">
                    <input type="text" name="anne_adi" value={formData.anne_adi || ''} onChange={handleInputChange} className="form-input-premium" placeholder="Anne Adı" />
                </FormGroup>

                <FormGroup label="Doğum Yeri / Place of Birth">
                    <input type="text" name="dogum_yeri" value={formData.dogum_yeri || ''} onChange={handleInputChange} className="form-input-premium" placeholder="Doğum Yeri" />
                </FormGroup>

                <FormGroup label="Doğum Tarihi / Date of Birth">
                    <input type="date" name="dogum_tarihi" value={formData.dogum_tarihi || ''} onChange={handleInputChange} className="form-input-premium" />
                </FormGroup>

                <FormGroup label="Telefon No / Phone No *">
                    <input type="tel" name="telefon1" value={formData.telefon1 || ''} onChange={handleInputChange} required className="form-input-premium" placeholder="05XX XXX XX XX" />
                </FormGroup>

                <FormGroup label="Telefon No 2 / Phone No 2 (Opsiyonel)">
                    <input type="tel" name="telefon2" value={formData.telefon2 || ''} onChange={handleInputChange} className="form-input-premium" placeholder="İkinci Telefon" />
                </FormGroup>

                <div className="md:col-span-2">
                    <FormGroup label="E-Posta / E-Mail *">
                        <input type="email" name="eposta" value={formData.eposta} onChange={handleInputChange} required className="form-input-premium" placeholder="ornek@mail.com" />
                    </FormGroup>
                </div>

            <div className="md:col-span-2">
                    <FormGroup label="Kayıt Bilgi Notu / Additional Notes">
                        <textarea name="kayit_bilgi_notu" value={formData.kayit_bilgi_notu || ''} onChange={handleInputChange} rows={3} className="form-input-premium resize-none" placeholder="Eklemek istedikleriniz..."></textarea>
                    </FormGroup>
                </div>
            </div>

            {formData.basvuru_tipi === 'Kurs Ön Kayıt' && formData.egitim_sekli === 'Çevrim İçi' && (
                <div className="mt-8 space-y-6">
                    <div className="flex items-center pb-4 border-b border-slate-200/60">
                        <h3 className="text-lg md:text-xl font-bold text-slate-700 tracking-tight">Çevrim İçi Kayıt Ek Bilgileri</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-2">
                        <FormGroup label="Vize Türü / Visa Type *">
                            <div className="relative">
                                <select name="vize_turu" value={formData.vize_turu || ''} onChange={handleInputChange} required className="form-input-premium appearance-none pr-10">
                                    <option value="">Seçiniz / Select</option>
                                    <option value="Turizm">Turizm</option>
                                    <option value="Eğitim">Eğitim</option>
                                    <option value="Çalışma">Çalışma</option>
                                    <option value="Diğer">Diğer</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </FormGroup>

                        <FormGroup label="Kayıt Türü / Registration Type *">
                            <div className="relative">
                                <select name="kayit_turu" value={formData.kayit_turu || ''} onChange={handleInputChange} required className="form-input-premium appearance-none pr-10">
                                    <option value="">Seçiniz / Select</option>
                                    <option value="Pasaport">Pasaport</option>
                                    <option value="Kimlik">Kimlik</option>
                                    <option value="Mavi Kart">Mavi Kart</option>
                                    <option value="Kart">Kart</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </FormGroup>

                        <FormGroup label="Vize Başlama Tarihi / Visa Start Date *">
                            <input type="date" name="vize_baslangic" value={formData.vize_baslangic || ''} onChange={handleInputChange} required className="form-input-premium" />
                        </FormGroup>

                        <FormGroup label="Vize Bitiş Tarihi / Visa End Date *">
                            <input type="date" name="vize_bitis" value={formData.vize_bitis || ''} onChange={handleInputChange} required className="form-input-premium" />
                        </FormGroup>

                        <FormGroup label="Türkiye Adresi / TR Address *">
                            <textarea name="turkiye_adresi" value={formData.turkiye_adresi || ''} onChange={handleInputChange} required rows={2} className="form-input-premium resize-none" placeholder="Türkiye'deki İkametgah Adresiniz"></textarea>
                        </FormGroup>

                        <FormGroup label="Ülkesindeki Adres / Home Country Address *">
                            <textarea name="ulke_adresi" value={formData.ulke_adresi || ''} onChange={handleInputChange} required rows={2} className="form-input-premium resize-none" placeholder="Kendi Ülkenizdeki Adresiniz"></textarea>
                        </FormGroup>

                        <FormGroup label="Ülke Telefon No / Home Country Phone No *">
                            <input type="tel" name="ulke_telefonu" value={formData.ulke_telefonu || ''} onChange={handleInputChange} required className="form-input-premium" placeholder="Kendi Ülkenizdeki Telefon Numaranız" />
                        </FormGroup>

                        <div className="md:col-span-2 pt-4 border-t border-slate-200/60 mt-2">
                            <h4 className="text-md font-bold text-slate-700 mb-4">İndirim Bilgileri / Discount Details</h4>
                        </div>

                        <FormGroup label="İndirim / Discount">
                            <div className="relative">
                                <select name="indirim" value={formData.indirim || ''} onChange={handleInputChange} className="form-input-premium appearance-none pr-10">
                                    <option value="">Seçiniz / Select (İndirim Yok)</option>
                                    {options?.indirimler && options.indirimler.map(opt => <option key={opt.id} value={opt.id}>{opt.ad}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </FormGroup>

                        <FormGroup label="İndirim Kodu / Discount Code">
                            <input type="text" name="indirim_kodu" value={formData.indirim_kodu || ''} onChange={handleInputChange} className="form-input-premium" placeholder="Varsa İndirim Kodunuz" />
                        </FormGroup>

                        <div className="md:col-span-2">
                            <FormGroup label="İndirim Belgesi / Discount Document (Opsiyonel)">
                                <input type="file" name="discountDoc" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer border border-slate-200 rounded-xl p-2 bg-white/50" accept=".pdf,.jpg,.jpeg,.png" />
                                <p className="text-xs text-slate-400 mt-1">Dosya seçilmedi</p>
                            </FormGroup>
                        </div>
                    </div>
                </div>
            )}

            <div className={`grid grid-cols-1 ${formData.basvuru_tipi === 'Kurs Ön Kayıt' && formData.egitim_sekli === 'Yüz Yüze' ? 'md:grid-cols-2' : ''} gap-x-8 gap-y-6 pt-4 border-t border-slate-200/60 mt-6`}>
                <FormGroup label="Kimlik Belgesi / Identity Document *">
                    <input type="file" name="identityDoc" onChange={handleFileChange} required className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer border border-slate-200 rounded-xl p-2 bg-white/50" accept=".pdf,.jpg,.jpeg,.png" />
                    <p className="text-xs text-slate-400 mt-1">Dosya seçilmedi</p>
                </FormGroup>

                {formData.basvuru_tipi === 'Kurs Ön Kayıt' && formData.egitim_sekli === 'Yüz Yüze' && (
                    <>
                        <FormGroup label="İndirim / Discount">
                            <div className="relative">
                                <select name="indirim" value={formData.indirim || ''} onChange={handleInputChange} className="form-input-premium appearance-none pr-10">
                                    <option value="">Seçiniz / Select (İndirim Yok)</option>
                                    {/* Burada veritabanından /api/indirimler/ endpointi uzerinden gelen options.indirimler map edilecek */}
                                    {options?.indirimler && options.indirimler.map(opt => <option key={opt.id} value={opt.id}>{opt.ad}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </FormGroup>

                        <FormGroup label="İndirim Belgesi / Discount Document (Opsiyonel)">
                            <input type="file" name="discountDoc" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer border border-slate-200 rounded-xl p-2 bg-white/50" accept=".pdf,.jpg,.jpeg,.png" />
                            <p className="text-xs text-slate-400 mt-1">Dosya seçilmedi</p>
                        </FormGroup>
                    </>
                )}
            </div>

            {/* Checkboxes Section */}
            <div className="space-y-4 pt-6 border-t border-slate-200/60 mt-6 text-sm text-slate-600">
                <label className="flex items-start space-x-3 cursor-pointer group">
                    <input type="checkbox" name="onay_bilgiler_dogru" checked={formData.onay_bilgiler_dogru || false} onChange={handleInputChange} required className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                    <span className="leading-relaxed group-hover:text-slate-800 transition-colors">-Bu formda yazan ve web sitesinde bulunan bütün bilgileri eksiksiz okuduğumu teyit ediyorum.</span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer group">
                    <input type="checkbox" name="onay_sorumluluk" checked={formData.onay_sorumluluk || false} onChange={handleInputChange} required className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                    <span className="leading-relaxed group-hover:text-slate-800 transition-colors">-Tarafımca yukarıda vermiş olduğum bilgilerin doğruluğunu ve bilgilerin hatalı olması durumunda doğacak yükümlülüğü kabul ediyorum. Düzenlenecek belge (diploma-sertifika-katılım belgeleri) formda beyan ettiğiniz bilgilere göre hazırlanacaktır.</span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer group">
                    <input type="checkbox" name="onay_fatura" checked={formData.onay_fatura || false} onChange={handleInputChange} required className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                    <span className="leading-relaxed group-hover:text-slate-800 transition-colors">-Sınav veya kursa dair faturanın kişi yerine şirket adına kesilmesini isteyenler şirkete dair gerekli bilgileri sınav tarihi itibariyle ödeme dekontuyla birlikte gün içerisinde ilgili şubeye e-posta olarak iletmelidir. Aksi takdirde fatura bilgilerinde değişiklik yapılamayacaktır.</span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer group text-blue-500 hover:text-blue-600 font-medium mt-2">
                    <input type="checkbox" name="onay_kursiyerlik" checked={formData.onay_kursiyerlik || false} onChange={handleInputChange} required className="mt-1 w-4 h-4 rounded border-blue-300 text-blue-500 focus:ring-blue-500" />
                    <span className="leading-relaxed ml-1 hover:underline">Kursiyerlik Koşullarını Okudum, Kabul Ediyorum</span>
                </label>
            </div>
        </section>
    );
}
