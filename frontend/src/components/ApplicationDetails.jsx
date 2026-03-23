import React from 'react';
import { ChevronDown } from 'lucide-react';
import FormGroup from './FormGroup';

export default function ApplicationDetails({ formData, handleInputChange, options }) {
    return (
        <section className="space-y-6">
            <div className="flex items-center pb-4 border-b border-slate-200/60">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700 font-bold text-lg flex items-center justify-center mr-4 shadow-inner border border-blue-200/50">1</span>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Başvuru Bilgileri</h2>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-0.5">Application Details</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormGroup label="Başvuru Tipi / Application Type *">
                    <div className="grid grid-cols-2 gap-3 mt-1">
                        {['Kurs Ön Kayıt', 'Sınav Ön Kayıt'].map(type => (
                            <label key={type} className={`flex items-center justify-center px-4 py-3 rounded-xl cursor-pointer transition-all border ${formData.basvuru_tipi === type ? 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-600/20' : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white hover:border-blue-300'}`}>
                                <input type="radio" name="basvuru_tipi" value={type} checked={formData.basvuru_tipi === type} onChange={handleInputChange} className="hidden" required />
                                <span className="text-sm font-medium">{type}</span>
                            </label>
                        ))}
                    </div>
                </FormGroup>

                <FormGroup label="Eğitim Şekli / Education Mode *">
                    <div className="grid grid-cols-2 gap-3 mt-1">
                        {['Yüz Yüze', 'Çevrim İçi'].map(mode => (
                            <label key={mode} className={`flex items-center justify-center px-4 py-3 rounded-xl cursor-pointer transition-all border ${formData.egitim_sekli === mode ? 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-600/20' : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white hover:border-blue-300'}`}>
                                <input type="radio" name="egitim_sekli" value={mode} checked={formData.egitim_sekli === mode} onChange={handleInputChange} className="hidden" required />
                                <span className="text-sm font-medium">{mode}</span>
                            </label>
                        ))}
                    </div>
                </FormGroup>

                <FormGroup label="Dil / Language *">
                    <div className="relative">
                        <select name="dil" value={formData.dil} onChange={handleInputChange} required className="form-input-premium appearance-none pr-10">
                            <option value="" disabled>Seçiniz / Select</option>
                            {options.diller.map(opt => <option key={opt.id} value={opt.id}>{opt.ad}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                </FormGroup>

                {formData.basvuru_tipi === 'Sınav Ön Kayıt' ? (
                    <FormGroup label="Sınav Türü / Exam Type *">
                        <div className="relative">
                            <select name="sinav_turu" value={formData.sinav_turu || ''} onChange={handleInputChange} required className="form-input-premium appearance-none pr-10">
                                <option value="" disabled>Seçiniz / Select</option>
                                <option value="Türkçe Yeterlik Sınavı (TYS)">Türkçe Yeterlik Sınavı (TYS)</option>
                                <option value="Seviye Tespit Sınavı (STS)">Seviye Tespit Sınavı (STS)</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                    </FormGroup>
                ) : (
                    <FormGroup label="Seviye / Level *">
                        <div className="relative">
                            <select name="seviye" value={formData.seviye || ''} onChange={handleInputChange} required className="form-input-premium appearance-none pr-10">
                                <option value="" disabled>Seçiniz / Select</option>
                                {options.seviyeler.map(opt => <option key={opt.id} value={opt.id}>{opt.ad}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                    </FormGroup>
                )}

                <FormGroup label="Şube / Branch *">
                    <div className="relative md:col-span-2 w-full md:w-[calc(50%-1rem)]">
                        <select name="sube" value={formData.sube} onChange={handleInputChange} required className="form-input-premium appearance-none pr-10">
                            <option value="" disabled>Seçiniz / Select</option>
                            {options.subeler.map(opt => <option key={opt.id} value={opt.id}>{opt.ad}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                </FormGroup>
            </div>
        </section>
    );
}
