import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import CourseMaterials from './pages/CourseMaterials';
import ActiveExams from './pages/ActiveExams';
import ExamResults from './pages/ExamResults';
import Certificates from './pages/Certificates';
import LiveClasses from './pages/LiveClasses';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorMessages from './pages/instructor/InstructorMessages';
import InstructorTasks from './pages/InstructorTasks';
import AddInstructor from './pages/admin/AddInstructor';
import StudentManagement from './pages/admin/StudentManagement';
import ExamCenter from './pages/admin/ExamCenter';
import SystemAnnouncements from './pages/admin/SystemAnnouncements';
import InstructorMaterials from './pages/instructor/InstructorMaterials';
import InstructorLiveClass from './pages/instructor/InstructorLiveClass';
import InstructorAnnouncements from './pages/instructor/InstructorAnnouncements';
import InstructorStudents from './pages/instructor/InstructorStudents';
import InstructorEvaluation from './pages/instructor/InstructorEvaluation';
import StudentAnnouncements from './pages/student/StudentAnnouncements';
import ForcePasswordChange from './pages/ForcePasswordChange';
import AdaptiveExam from './pages/AdaptiveExam';
import ExamPlayer from './pages/student/ExamPlayer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">

          <Header />

          <main className="flex-grow flex items-center justify-center p-4 md:p-10 relative overflow-hidden">
            {/* Ambient Decorative Blobs - Removed for Corporate Theme */}

            <Routes>
              <Route path="/" element={<RegistrationPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin-panel" element={<AdminDashboard />} />
              <Route path="/admin-ogrenciler" element={<StudentManagement />} />
              <Route path="/admin-sinavlar" element={<ExamCenter />} />
              <Route path="/admin-duyurular" element={<SystemAnnouncements />} />
              <Route path="/admin-egitmen-ekle" element={<AddInstructor />} />
              <Route path="/ogrenci-panel" element={<StudentDashboard />} />
              <Route path="/sifre-belirle" element={<ForcePasswordChange />} />
              <Route path="/egitmen-panel/*" element={<InstructorDashboard />} />
              <Route path="/egitmen-ogrenciler" element={<InstructorStudents />} />
              <Route path="/egitmen-degerlendirme" element={<InstructorEvaluation />} />
              <Route path="/egitmen-mesajlar" element={<InstructorMessages />} />
              <Route path="/egitmen-materyal" element={<InstructorMaterials />} />
              <Route path="/egitmen-canli" element={<InstructorLiveClass />} />
              <Route path="/egitmen-duyurular" element={<InstructorAnnouncements />} />
              <Route path="/profil" element={<StudentProfile />} />
              <Route path="/materyaller" element={<CourseMaterials />} />
              <Route path="/canli-dersler" element={<LiveClasses />} />
              <Route path="/aktif-sinavlarim" element={<ActiveExams />} />
              <Route path="/sinav-sonuclari" element={<ExamResults />} />
              <Route path="/egitmen-gorevleri" element={<InstructorTasks />} />
              <Route path="/duyurular" element={<StudentAnnouncements />} />
              <Route path="/sertifikalar" element={<Certificates />} />
              <Route path="/sinav/seviye-tespit" element={<AdaptiveExam />} />
              <Route path="/sinav-coz/:id" element={<ExamPlayer />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
