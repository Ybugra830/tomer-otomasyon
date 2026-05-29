import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, Send, Paperclip, Video, FileText, Headphones, FileQuestion } from 'lucide-react';
import { assignMaterial } from '../../store/slices/instructorSlice';

const AssignMaterialModal = ({ isOpen, onClose, student }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    type: 'pdf',
    title: '',
    description: '',
    fileOrLink: ''
  });

  if (!isOpen || !student) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(assignMaterial({
      studentId: student.id,
      studentName: student.name,
      ...formData,
      date: new Date().toISOString()
    }));
    onClose();
    setFormData({ type: 'pdf', title: '', description: '', fileOrLink: '' });
  };

  const materialTypes = [
    { id: 'video', label: 'Video', icon: <Video className="w-4 h-4" /> },
    { id: 'audio', label: 'Ses / MP3', icon: <Headphones className="w-4 h-4" /> },
    { id: 'pdf', label: 'PDF Not', icon: <FileText className="w-4 h-4" /> },
    { id: 'test', label: 'Özel Test', icon: <FileQuestion className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-indigo-950 px-6 py-4 flex justify-between items-center text-white shrink-0">
          <div>
            <h3 className="text-lg font-bold">Bireysel Materyal Ata</h3>
            <p className="text-indigo-200 text-sm mt-0.5">Öğrencinin eksiklerine yönelik özel içerik gönderin</p>
          </div>
          <button 
            onClick={onClose}
            className="text-indigo-200 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto">
          
          {/* Recipient Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Alıcı Öğrenci</span>
              <p className="text-slate-800 font-bold">{student.name}</p>
            </div>
            <div className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-md">
              Seviye: {student.level}
            </div>
          </div>

          {/* Material Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Materyal Türü</label>
            <div className="grid grid-cols-2 gap-3">
              {materialTypes.map(type => (
                <label 
                  key={type.id} 
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.type === type.id 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="type" 
                    value={type.id} 
                    checked={formData.type === type.id} 
                    onChange={handleChange}
                    className="hidden"
                  />
                  {type.icon}
                  <span className="font-medium text-sm">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Başlık</label>
            <input 
              type="text" 
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Örn: Dinleme Becerisi Geliştirme Egzersizi"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-slate-800"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Açıklama / Not</label>
            <textarea 
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Örn: Zayıf olan Dinleme becerin için bu diyaloğu çöz ve cevaplarını bana ilet."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-slate-800 resize-none"
            ></textarea>
          </div>

          {/* File or Link */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Dosya Linki veya Yükleme</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Paperclip className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="text" 
                name="fileOrLink"
                value={formData.fileOrLink}
                onChange={handleChange}
                placeholder="Google Drive, YouTube Linki vb..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-slate-800"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Şu an için bulut sürücü veya video platformu linkleri desteklenmektedir.</p>
          </div>

        </form>

        {/* Footer */}
        <div className="border-t border-slate-100 p-6 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            İptal
          </button>
          <button 
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl font-bold bg-indigo-950 hover:bg-indigo-900 text-white flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <Send className="w-4 h-4" />
            Öğrenciye Gönder
          </button>
        </div>

      </div>
    </div>
  );
};

export default AssignMaterialModal;
