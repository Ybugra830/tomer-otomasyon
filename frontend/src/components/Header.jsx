import React from 'react';
import logo from '../assets/DAİRESEL LOGO.png';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 bg-slate-900 backdrop-blur-md text-white border-b border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.1)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between transition-all">
                <nav className="flex space-x-8 text-sm md:text-base font-medium mb-4 md:mb-0 opacity-80 hover:opacity-100 transition-opacity">
                    <a href="#" className="hover:text-blue-400 transition-colors">Hakkımızda</a>
                </nav>
                <div className="flex flex-col items-center group cursor-pointer">
                    <div className="flex items-center justify-center space-x-4">
                        <img
                            src={logo}
                            alt="Turgut Özal University Logo"
                            className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-md transform group-hover:scale-105 transition-transform duration-300 bg-white rounded-full p-1"
                        />
                        <div className="flex flex-col items-start">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                                Turgut Özal University
                            </h1>
                            <p className="text-xs text-blue-400 mt-1.5 uppercase tracking-[0.2em] font-medium opacity-90">Language Center (TÖMER)</p>
                        </div>
                    </div>
                </div>
                <nav className="flex space-x-8 text-sm md:text-base font-medium mt-4 md:mb-0 opacity-80 hover:opacity-100 transition-opacity">
                    <a href="#" className="hover:text-blue-400 transition-colors">İletişim</a>
                </nav>
            </div>
            <div className="h-0.5 w-full bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700 opacity-80"></div>
        </header>
    );
}
