import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Search, 
  Paperclip, 
  Send, 
  MoreVertical,
  Check,
  CheckCheck,
  MessageCircle
} from 'lucide-react';
import InstructorSidebar from './InstructorSidebar';

const InstructorMessages = () => {
  const instructorInfo = useSelector((state) => state.instructor?.instructorInfo) || { adSoyad: 'Eğitmen' };

  // Mock Conversations
  const [conversations] = useState([
    {
      id: 1,
      studentName: 'Yaşar Buğra Erbay',
      level: 'B1',
      lastMessage: 'Hocam, B1 Okuma sınavı hakkında bir sorum olacaktı...',
      time: '10:42',
      unread: 2,
      avatarColor: 'bg-indigo-100 text-indigo-700',
      messages: [
        { id: 1, sender: 'student', text: 'Hocam merhaba, nasılsınız?', time: '10:30' },
        { id: 2, sender: 'instructor', text: 'Merhaba Buğra, iyiyim teşekkürler. Sen nasılsın?', time: '10:35' },
        { id: 3, sender: 'student', text: 'Ben de iyiyim hocam. B1 Okuma sınavı hakkında bir sorum olacaktı. 3. parçadaki ana fikir sorusunda takıldım.', time: '10:40' },
        { id: 4, sender: 'student', text: 'Orayı nasıl yorumlamam gerekiyordu?', time: '10:42' },
      ]
    },
    {
      id: 2,
      studentName: 'Ayşe Kaya',
      level: 'A2',
      lastMessage: 'Gramer ödevini gönderdim hocam.',
      time: 'Dün',
      unread: 0,
      avatarColor: 'bg-emerald-100 text-emerald-700',
      messages: [
        { id: 1, sender: 'student', text: 'Gramer ödevini gönderdim hocam. Kontrol edebilir misiniz?', time: 'Dün 15:30' },
        { id: 2, sender: 'instructor', text: 'Tabii ki Ayşe, gün içinde inceleyip sana dönüş yapacağım.', time: 'Dün 16:00' },
      ]
    },
    {
      id: 3,
      studentName: 'John Doe',
      level: 'A1',
      lastMessage: 'Thank you for the speaking practice!',
      time: 'Pzt',
      unread: 0,
      avatarColor: 'bg-rose-100 text-rose-700',
      messages: [
        { id: 1, sender: 'student', text: 'Thank you for the speaking practice!', time: 'Pzt 09:15' },
        { id: 2, sender: 'instructor', text: 'You are welcome John. Keep practicing!', time: 'Pzt 10:00' },
      ]
    }
  ]);

  const [activeChatId, setActiveChatId] = useState(1);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const activeChat = conversations.find(c => c.id === activeChatId);

  const filteredConversations = conversations.filter(c => 
    c.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-[85vh] h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
      
      {/* Sidebar - Instructor Navigation */}
      <InstructorSidebar />

      {/* Main Messages Layout */}
      <main className="flex-grow flex bg-white overflow-hidden">
        
        {/* Left Column: Inbox List (1/3 width on md+) */}
        <div className="w-full md:w-1/3 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
          
          {/* Inbox Header & Search */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-xl font-bold text-indigo-950 mb-4">Mesajlar</h2>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Öğrenci ara..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm bg-slate-50"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-grow overflow-y-auto">
            {filteredConversations.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`p-4 border-b border-slate-100 flex items-start gap-3 cursor-pointer transition-all ${
                  activeChatId === chat.id 
                    ? 'bg-indigo-50 border-l-4 border-l-indigo-600' 
                    : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex shrink-0 items-center justify-center font-bold text-lg ${chat.avatarColor}`}>
                  {chat.studentName.charAt(0)}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className={`truncate text-sm ${chat.unread > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                      {chat.studentName}
                    </h4>
                    <span className={`text-xs ${chat.unread > 0 ? 'text-indigo-600 font-bold' : 'text-slate-400 font-medium'}`}>
                      {chat.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className={`truncate text-sm ${chat.unread > 0 ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <span className="w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shrink-0">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Chat (2/3 width on md+) */}
        {activeChat ? (
          <div className="hidden md:flex flex-col w-2/3 h-full bg-[#f4f7f6] relative">
            
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${activeChat.avatarColor}`}>
                  {activeChat.studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 leading-tight">{activeChat.studentName}</h3>
                  <p className="text-xs text-indigo-600 font-semibold">{activeChat.level} Seviyesi Öğrencisi</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {/* Date Separator */}
              <div className="flex justify-center mb-6">
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-slate-400 shadow-sm border border-slate-100">Bugün</span>
              </div>

              {activeChat.messages.map((msg) => {
                const isInstructor = msg.sender === 'instructor';
                return (
                  <div key={msg.id} className={`flex ${isInstructor ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                      isInstructor 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <div className={`flex justify-end items-center gap-1 mt-1 ${isInstructor ? 'text-indigo-200' : 'text-slate-400'}`}>
                        <span className="text-[10px] font-medium">{msg.time}</span>
                        {isInstructor && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input Area */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <div className="flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-transparent transition-all">
                <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shrink-0">
                  <Paperclip className="w-5 h-5" />
                </button>
                <textarea 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`${activeChat.studentName} adlı öğrenciye cevap yaz...`}
                  className="flex-grow bg-transparent border-none focus:ring-0 resize-none py-3 text-sm text-slate-800 max-h-32"
                  rows="1"
                  style={{ minHeight: '44px' }}
                />
                <button className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md shrink-0 flex items-center justify-center h-[44px] w-[44px]">
                  <Send className="w-5 h-5 -ml-1 mt-0.5" />
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">Enter tuşu ile gönderebilirsiniz. Markdown desteklenmektedir.</p>
            </div>
            
          </div>
        ) : (
          <div className="hidden md:flex flex-col w-2/3 h-full bg-slate-50 items-center justify-center">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <MessageCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Mesajlaşma Paneli</h3>
            <p className="text-slate-500 mt-2 max-w-sm text-center">Bir görüşme başlatmak veya mesajları görüntülemek için sol taraftan bir öğrenci seçin.</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default InstructorMessages;
