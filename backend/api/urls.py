from django.urls import path
from . import views

urlpatterns = [
    # Get İstekleri (Listeleme)
    path('uyruklar/', views.getUyruklar, name='uyruklar'),
    path('diller/', views.getDiller, name='diller'),
    path('seviyeler/', views.getSeviyeler, name='seviyeler'),
    path('subeler/', views.getSubeler, name='subeler'),
    path('indirimler/', views.getIndirimler, name='indirimler'),
    path('sinav-turleri/', views.getSinavTurleri, name='sinav-turleri'),
    
    # Post İstekleri (Kayıt Olma)
    path('basvuru-yap/', views.process_application, name='basvuru-yap'),
    path('ogrenci-login/', views.ogrenci_login, name='ogrenci-login'),
    
    # Admin Paneli Endpoints
    path('admin/dashboard-stats/', views.get_dashboard_stats, name='dashboard-stats'),
    path('admin-dashboard-bekleyenler/', views.get_admin_dashboard_data, name='admin-dashboard-bekleyenler'),
    path('basvuru-detay/<str:tc_no>/', views.get_application_detail, name='basvuru-detay'),
    path('basvuru-incele/<str:user_id>/', views.review_student_application, name='basvuru-incele'),
]