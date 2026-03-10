import React from 'react';
import { Info } from 'lucide-react';

export default function BankInfo() {
    return (
        <div className="bg-[#f8d7da] text-[#721c24] border border-[#f5c6cb] rounded-md p-4 mb-6 shadow-sm font-medium text-[13px] leading-relaxed">
            <p className="mb-0.5"><strong className="font-semibold">IBAN Numarası:</strong> TR43-0001-0007-9907-0640-9850 63</p>
            <p className="mb-0.5"><strong className="font-semibold">Hesap Numarası:</strong> 799-7064098-5063</p>
            <p className="mb-0.5"><strong className="font-semibold">Şube:</strong> Ziraat Bankası Beşevler Şubesi</p>
            <p className="mb-0.5"><strong className="font-semibold">Alıcı:</strong> Ankara Üniversitesi Döner Sermaye İşletme Müdürlüğü</p>
            <p><strong className="font-semibold">AÇIKLAMA:</strong> Kursiyer adı soyadı - _ ŞUBESİ _ dil kurs ücreti</p>
        </div>
    );
}
