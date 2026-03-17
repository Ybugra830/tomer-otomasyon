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
]