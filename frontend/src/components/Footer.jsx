import React from 'react';
import { Instagram, Facebook, Linkedin } from 'lucide-react';
import logo from '../assets/DAİRESEL LOGO.png';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-gray-400 py-12 mt-auto relative z-10 font-medium border-t border-slate-800">
            <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">

                {/* Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-8 w-full max-w-4xl text-center mb-12 text-[15px]">
                    <div className="flex flex-col space-y-5">
                        <a href="#" className="hover:text-white transition-colors">Hakkımızda</a>
                        <a href="#" className="hover:text-white transition-colors">TÖMER nedir?</a>
                        <a href="#" className="hover:text-white transition-colors">Anlaşmalı kurumlar</a>
                    </div>
                    <div className="flex flex-col space-y-5">
                        <a href="#" className="hover:text-white transition-colors">TÖMER Kayıt Formu</a>
                        <a href="#" className="hover:text-white transition-colors">Kursiyerlik koşulları</a>
                        <a href="#" className="hover:text-white transition-colors">Akreditasyon</a>
                    </div>
                    <div className="flex flex-col space-y-5">
                        <a href="#" className="hover:text-white transition-colors">Bize ulaşın</a>
                        <a href="#" className="hover:text-white transition-colors">Üniversitemiz</a>
                        <a href="#" className="hover:text-white transition-colors">Çözüm merkezi</a>
                    </div>
                </div>

                {/* Logo */}
                <div className="mb-8">
                    <img
                        src={logo}
                        alt="University Logo"
                        className="w-[84px] h-[84px] object-contain mx-auto bg-white rounded-full p-1 shadow-lg"
                    />
                </div>

                {/* Info Text */}
                <div className="text-center text-[13px] text-gray-400 mb-8 max-w-3xl leading-relaxed">
                    <p>Ankara Üniversitesi Beşevler 10. Yıl Yerleşkesi Ord. Prof. Dr. Şevket Aziz Kansu Binası 4. Kat 06560 Yenimahalle – ANKARA</p>
                    <p className="mt-1">TÖMER, Ankara Üniversitesi'nin tescilli markasıdır &copy;2026</p>
                </div>

                {/* Social Icons */}
                <div className="flex items-center space-x-6 text-gray-400">
                    <a href="#" className="hover:text-white transition-colors">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </a>
                    <a href="#" className="hover:text-white transition-colors">
                        <Instagram className="w-5 h-5" />
                    </a>
                    <a href="#" className="hover:text-white transition-colors">
                        <Facebook className="w-5 h-5" />
                    </a>
                    <a href="#" className="hover:text-white transition-colors">
                        <Linkedin className="w-5 h-5" />
                    </a>
                </div>

            </div>
        </footer>
    );
}
