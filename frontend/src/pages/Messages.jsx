import React, { useState } from 'react';
import StudentSidebar from '../components/StudentSidebar';
import { Send, Paperclip, MessageSquare } from 'lucide-react';

const mockTickets = [
  { id: 1, title: 'Okuma sınavı itirazı', date: '10.05.2026', unread: true },
  { id: 2, title: 'Gramer sorusu', date: '08.05.2026', unread: false },
  { id: 3, title: 'Sertifika talebi', date: '01.05.2026', unread: false }
];

const mockChat = [
  { id: 1, sender: 'student', text: 'Hocam merhaba, okuma sınavımın 4. sorusunda bir hata olduğunu düşünüyorum. İnceleyebilir misiniz?', time: '10:30' },
  { id: 2, sender: 'teacher', text: 'Merhaba, tabii ki. Hemen kontrol ediyorum.', time: '10:45' },
  { id: 3, sender: 'teacher', text: 'Soru metninde bir karışıklık olmuş haklısın. O soruyu herkes için doğru kabul edeceğiz. Geri bildirimin için teşekkürler.', time: '10:50' },
];

const Messages = () => {
  const [activeTicket, setActiveTicket] = useState(1);
  const [newMessage, setNewMessage] = useState('');

  return (
    <div className="w-full min-h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
      
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <main className="flex-grow bg-slate-50 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Sol Panel - Bilet Listesi */}
        <div className="w-full md:w-1/3 xl:w-1/4 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 z-10">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
              Mesaj Geçmişi
            </h2>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-2">
            {mockTickets.map(ticket => (
              <div 
                key={ticket.id}
                onClick={() => setActiveTicket(ticket.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeTicket === ticket.id 
                    ? 'bg-indigo-50 border-indigo-100 shadow-sm border' 
                    : 'bg-white hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className={`font-semibold text-sm ${activeTicket === ticket.id ? 'text-indigo-700' : 'text-slate-800'} ${ticket.unread && activeTicket !== ticket.id ? 'font-extrabold text-slate-900' : ''}`}>
                    {ticket.title}
                  </h3>
                  {ticket.unread && activeTicket !== ticket.id && (
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0 mt-1 shadow-sm"></span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-medium">{ticket.date}</p>
              </div>
            ))}
          </div>
          
          <div className="p-5 border-t border-slate-100 bg-slate-50">
            <button className="w-full py-3 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-bold rounded-xl transition-all text-sm shadow-sm">
              + Yeni Mesaj Başlat
            </button>
          </div>
        </div>

        {/* Sağ Panel - Sohbet Ekranı */}
        <div className="w-full md:w-2/3 xl:w-3/4 flex flex-col bg-[#f0f2f5] h-full absolute md:relative top-0 left-0 right-0 bottom-0 pointer-events-none md:pointer-events-auto opacity-0 md:opacity-100 transition-opacity">
          
          {/* Sohbet Başlığı */}
          <div className="px-8 py-5 bg-white border-b border-slate-200 flex justify-between items-center shrink-0 shadow-sm z-10">
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                {mockTickets.find(t => t.id === activeTicket)?.title}
              </h3>
              <p className="text-sm text-emerald-600 font-medium mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Danışman Hoca - Çevrimiçi
              </p>
            </div>
          </div>

          {/* Sohbet Alanı */}
          <div className="flex-grow p-6 md:p-8 overflow-y-auto space-y-6">
            {mockChat.map(msg => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] md:max-w-[65%] px-5 py-3.5 rounded-2xl shadow-sm relative ${
                    msg.sender === 'student' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed">{msg.text}</p>
                  <span className={`text-[11px] font-medium mt-2 block text-right ${msg.sender === 'student' ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mesaj Gönderme Çubuğu */}
          <div className="px-6 py-4 bg-white border-t border-slate-200 shrink-0 flex items-center gap-3">
            <button className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 hover:bg-indigo-50 rounded-full focus:outline-none">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-grow bg-slate-100 rounded-full px-5 py-3 border border-transparent focus-within:border-indigo-300 focus-within:bg-white focus-within:shadow-sm transition-all flex items-center">
              <input 
                type="text" 
                placeholder="Bir mesaj yazın..." 
                className="w-full bg-transparent border-none focus:outline-none text-[15px] text-slate-700 placeholder-slate-400"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if(e.key === 'Enter' && newMessage.trim()) {
                    setNewMessage('');
                  }
                }}
              />
            </div>
            <button 
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all shadow-sm focus:outline-none ${
                newMessage.trim() 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:scale-105' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              onClick={() => setNewMessage('')}
              disabled={!newMessage.trim()}
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Messages;
