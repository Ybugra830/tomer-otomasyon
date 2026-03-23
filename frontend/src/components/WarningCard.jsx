import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function WarningCard() {
    return (
        <div className="m-6 md:m-8 bg-amber-50 border border-amber-200/60 rounded-xl p-5 md:p-6 shadow-[0_2px_10px_rgb(0,0,0,0.03)] flex items-start space-x-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
            <div className="bg-amber-100/50 p-2 rounded-full flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
                <h3 className="text-amber-900 font-bold text-base md:text-lg tracking-tight mb-1">Önemli Uyarı / Important Warning</h3>
                <p className="text-amber-800/90 text-sm leading-relaxed">
                    Lütfen formdaki bilgileri <span className="font-semibold underline decoration-amber-500 decoration-2 underline-offset-2">tamı tamına Pasaportunuzda göründüğü gibi</span> doldurunuz. Hatalı yazılan bilgilerden dolayı doğacak sorunlardan kurumumuz sorumlu değildir. <br className="hidden md:block" />
                    <span className="opacity-80 mt-1 block">Please fill in the information on the form <span className="font-semibold underline decoration-amber-500 decoration-2 underline-offset-2">exactly as it appears on your Passport</span>. Our institution is not responsible for problems arising from incorrectly written information.</span>
                </p>
            </div>
        </div>
    );
}
