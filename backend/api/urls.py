from django.urls import path
from . import views

urlpatterns = [
    # Get İstekleri (Listeleme)
    path('uyruklar/', views.getUyruklar, name='uyruklar'),
    path('diller/', views.getDiller, name='diller'),
    path('seviyeler/', views.getSeviyeler, name='seviyeler'),
    path('subeler/', views.getSubeler, name='subeler'),
    
    # Post İstekleri (Kayıt Olma)
    path('aday-kayit/', views.createAday, name='aday-kayit'),
    path('kurs-basvuru/', views.createKursBasvurusu, name='kurs-basvuru'),
]