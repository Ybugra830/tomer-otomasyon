import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function StatusMessage({ submitStatus }) {
    if (submitStatus === 'success') {
        return (
            <div className="bg-emerald-50/90 backdrop-blur border border-emerald-200 rounded-2xl p-5 flex items-center shadow-[0_4px_20px_rgb(16,185,129,0.15)] animate-[pulse_2s_ease-in-out_1]">
                <div className="bg-emerald-100 p-2 rounded-full mr-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h4 className="text-emerald-800 font-bold text-lg">Başarılı! (Success)</h4>
                    <p className="font-medium text-emerald-700/80 text-sm mt-0.5">Başvurunuz başarıyla alınmıştır. Gösterdiğiniz ilgi için teşekkür ederiz.</p>
                </div>
            </div>
        );
    }

    if (submitStatus === 'error') {
        return (
            <div className="bg-rose-50/90 backdrop-blur border border-rose-200 rounded-2xl p-5 flex items-center shadow-[0_4px_20px_rgb(225,29,72,0.15)]">
                <div className="bg-rose-100 p-2 rounded-full mr-4">
                    <AlertCircle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                    <h4 className="text-rose-800 font-bold text-lg">Hata! (Error)</h4>
                    <p className="font-medium text-rose-700/80 text-sm mt-0.5">Başvurunuz sırasında bir hata oluştu. Lütfen tekrar deneyin veya iletişime geçin.</p>
                </div>
            </div>
        );
    }

    return null;
}
